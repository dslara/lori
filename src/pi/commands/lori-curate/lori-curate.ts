import { randomUUID } from "node:crypto";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Value } from "typebox/value";
import { decideChapterAcceptance } from "../../../core/domain/chapter.ts";
import { getQuestionnaire } from "../../../core/domain/questionnaire.ts";
import type { ActiveDomain, DomainDraft } from "../../../core/domain/domain.types.ts";
import { isMetalearningSession } from "../../../core/session/selectors.ts";
import { showStatus } from "../../ui/status/status.ts";
import { registerCurationSourceEvidenceHooks } from "./source-evidence.ts";
import { buildChapterCurationPrompt, chapterCurationToolParameters, renderChapterProposal, renderCurationBlocker } from "./curation.ts";
import type { ChapterCurationToolResult } from "./lori-curate.types.ts";
import type { LoriExtensionState } from "../shared/shared.types.ts";
import { activeDomainDraft } from "../shared/domain-preparation.ts";
import { acceptDispatchResult, dispatchAndPersist } from "../shared/persistence.ts";
import { requireReadyState } from "../shared/session.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toolMessage(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], details: { message: text }, isError };
}

function registerChapterCurationTool(api: ExtensionAPI, shared: LoriExtensionState): void {
  registerCurationSourceEvidenceHooks(api, shared.curationRuntime);

  api.registerTool({
    name: "lori_submit_chapter",
    label: "Submit Lori Chapter proposal",
    description: "Submit the structured proposal or explicit research blocker for the current /lori-curate request.",
    promptSnippet: "Submit the researched Chapter proposal through Lori's TypeBox tool",
    promptGuidelines: [
      "Use lori_submit_chapter only for the requestId and domainId in the current /lori-curate message.",
      "For lori_submit_chapter, choose any research tools available in this Pi session; Lori does not impose an allowlist of tool names.",
      "Before submitting a proposal with lori_submit_chapter, ensure each resource's HTTPS URL, exact excerpt, and locator appear together in a successful tool result from the current request and run.",
      "Use lori_submit_chapter with status blocked when no verifiable, compatible sources satisfy the Player's restrictions.",
      "If lori_submit_chapter rejects a submission, treat it as unsaved and explain the specific error; do not present the proposal as free text or relax restrictions.",
    ],
    parameters: chapterCurationToolParameters,
    async execute(_toolCallId, params, _signal, _onUpdate, toolCtx) {
      const projectDir = shared.projectDir;
      const requestId = isRecord(params) && typeof params.requestId === "string" ? params.requestId : undefined;
      const domainId = isRecord(params) && typeof params.domainId === "string" ? params.domainId : undefined;
      const request = requestId === undefined || domainId === undefined
        ? undefined
        : shared.curationRuntime.authorizeSubmission(requestId, domainId);
      if (!request || projectDir === undefined) {
        const message = "Lori recusou o tool: ele não corresponde à request atual de curadoria; nenhuma proposta foi salva.";
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }

      const latest = await dispatchAndPersist(projectDir, () => undefined);
      if (!acceptDispatchResult(shared, toolCtx, latest, "Lori: não foi possível validar o snapshot da curadoria.")) {
        return toolMessage("Lori não conseguiu validar a request atual; nenhuma proposta foi salva.", true);
      }
      const currentDraft = latest.state.domainDraft;
      const currentDomain = latest.state.domains.find(({ id }) => id === request.domainId);
      const isAuthorizedPhase = request.target === "draft"
        ? isMetalearningSession(latest.state.session) && latest.state.session.status === "open" && latest.state.session.domainId === request.domainId && currentDraft?.id === request.domainId && currentDraft.phase === "awaiting_curation"
        : currentDomain !== undefined && currentDomain.currentChapterVersionId === request.expectedCurrentChapterVersionId;
      if (
        !isAuthorizedPhase ||
        shared.projectDir !== projectDir ||
        shared.curationRuntime.authorizeSubmission(request.requestId, request.domainId) === undefined
      ) {
        const message = "Lori recusou o tool: a fase ou a request atual mudou; nenhuma proposta foi salva.";
        toolCtx.ui.notify(message, "warning");
        shared.curationRuntime.clearIfCurrent(request.requestId);
        return toolMessage(message, true);
      }

      if (!Value.Check(chapterCurationToolParameters, params)) {
        const message = "Lori não aceitou a resposta estruturada do tool; ela precisa incluir uma proposta válida ou a razão do bloqueio. Nenhuma proposta foi salva.";
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }
      const submission = params as ChapterCurationToolResult;
      if (submission.result.status === "blocked") {
        const blocker = renderCurationBlocker(submission.result.reason, request.target === "active");
        toolCtx.ui.notify(blocker, "warning");
        shared.curationRuntime.clearIfCurrent(request.requestId);
        return { ...toolMessage(blocker), terminate: true };
      }

      const questionnaire = request.target === "draft"
        ? (currentDraft === null ? undefined : getQuestionnaire(currentDraft))
        : currentDomain?.questionnaire;
      // isAuthorizedPhase already guarantees the target; this check only narrows the questionnaire type.
      if (questionnaire === undefined) {
        const message = "Lori não aceitou a proposta: o alvo da curadoria deixou de existir ou está incompleto. Nenhuma proposta foi salva; envie novamente valores que correspondam à request atual.";
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }

      const acceptance = decideChapterAcceptance(submission.result.proposal, {
        review: "strict",
        questionnaire,
        sourceEvidence: { results: request.sourceEvidence, requestId: request.requestId, agentRunId: request.agentRunId },
      });
      if (!acceptance.ok) {
        if (acceptance.kind === "blocked") {
          const blocker = renderCurationBlocker(acceptance.reason, request.target === "active");
          toolCtx.ui.notify(blocker, "warning");
          shared.curationRuntime.clearIfCurrent(request.requestId);
          return { ...toolMessage(blocker), terminate: true };
        }
        let message: string;
        if (acceptance.kind === "unverified-source") {
          message = `Lori bloqueou a proposta: ${acceptance.reason} Nenhuma proposta foi salva; pesquise a fonte com uma ferramenta host apropriada nesta request.`;
        } else if (acceptance.kind === "mixed") {
          message = "Lori recusou a proposta porque ela mistura recursos compatíveis e incompatíveis. Nenhuma proposta foi salva; envie somente recursos compatíveis, sem relaxar as restrições.";
        } else {
          message = `Lori não aceitou a proposta: ${acceptance.reason} Nenhuma proposta foi salva; corrija a proposta sem relaxar as restrições.`;
        }
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }

      const saved = await dispatchAndPersist(projectDir, (state) => {
        if (
          shared.projectDir !== projectDir ||
          shared.curationRuntime.authorizeSubmission(request.requestId, request.domainId) === undefined
        ) {
          return undefined;
        }
        if (request.target === "draft") {
          const draft = state.domainDraft;
          if (
            state.session?.kind !== "metalearning" ||
            state.session.status !== "open" ||
            state.session.domainId !== request.domainId ||
            draft?.id !== request.domainId ||
            draft.phase !== "awaiting_curation"
          ) {
            return undefined;
          }
          return { type: "domain-draft/propose-chapter", id: draft.id, proposal: acceptance.proposal };
        }
        const domain = state.domains.find(({ id }) => id === request.domainId);
        if (
          domain === undefined ||
          domain.currentChapterVersionId !== request.expectedCurrentChapterVersionId
        ) {
          return undefined;
        }
        return {
          type: "domain/propose-chapter",
          id: domain.id,
          expectedCurrentChapterVersionId: domain.currentChapterVersionId,
          proposal: acceptance.proposal,
        };
      });
      if (!acceptDispatchResult(shared, toolCtx, saved, "Lori: proposta não salva porque não foi possível persistir o snapshot.")) {
        return toolMessage("Lori não conseguiu salvar a proposta; nenhuma aprovação ou ativação ocorreu.", true);
      }
      if (saved.status !== "persisted") {
        const message = "Lori não salvou a proposta porque a fase ou a request atual mudou; use /lori-curate explicitamente para uma nova tentativa.";
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }

      shared.curationRuntime.clearIfCurrent(request.requestId);
      const pendingDomain = request.target === "active"
        ? saved.state.domains.find(({ id }) => id === request.domainId)
        : undefined;
      const pendingDraft = request.target === "draft"
        ? saved.state.domainDraft
        : pendingDomain === undefined ? null : activeDomainDraft(pendingDomain);
      const pending = request.target === "draft"
        ? saved.state.domainDraft?.pendingChapter
        : pendingDomain?.pendingChapter;
      if (pending === undefined || pendingDraft === null || pendingDraft === undefined) {
        const message = "Lori não encontrou a proposta pendente no estado salvo; a versão aprovada permanece ativa.";
        toolCtx.ui.notify(message, "error");
        return toolMessage(message, true);
      }
      if (shared.skin) showStatus(toolCtx, saved.state, shared.skin);
      const presentation = renderChapterProposal(pendingDraft, pending, request.target === "active"
        ? { currentChapterVersionId: request.expectedCurrentChapterVersionId }
        : {});
      toolCtx.ui.notify(presentation, "info");
      return { ...toolMessage(presentation), terminate: true };
    },
  });
}

function startChapterCurationRequest(
  api: ExtensionAPI,
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
  request: {
    requestId: string;
    draft: DomainDraft;
    target: "draft";
  } | {
    requestId: string;
    draft: DomainDraft;
    target: "active";
    currentChapterVersionId: string;
  },
): void {
  shared.curationRuntime.start({
    requestId: request.requestId,
    domainId: request.draft.id,
    target: request.target,
    ...(request.target === "active" ? { expectedCurrentChapterVersionId: request.currentChapterVersionId } : {}),
  });
  try {
    api.sendUserMessage(buildChapterCurationPrompt(
      request.requestId,
      request.draft,
      request.target === "active" ? { currentChapterVersionId: request.currentChapterVersionId } : {},
    ));
  } catch {
    shared.curationRuntime.clearIfCurrent(request.requestId);
    ctx.ui.notify("Lori: não foi possível iniciar a curadoria pelo agent; nenhuma proposta foi salva.", "error");
  }
}

export function registerLoriCurate(api: ExtensionAPI, shared: LoriExtensionState): void {
  registerChapterCurationTool(api, shared);
  api.registerCommand("lori-curate", {
    description: "Solicitar explicitamente uma proposta para um Domain em preparação ou ativo",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) return;
      if (args.trim().length > 0) {
        ctx.ui.notify("Uso: /lori-curate (sem argumentos)", "warning");
        return;
      }
      if (!ctx.isIdle()) {
        ctx.ui.notify("Lori: aguarde o agent terminar a execução atual antes de solicitar a curadoria.", "warning");
        return;
      }

      const latest = await dispatchAndPersist(ready.projectDir, () => undefined);
      if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível consultar o snapshot antes da curadoria.")) return;
      const { state } = latest;
      const draft = state.domainDraft;
      const canCurateDraft = draft?.phase === "awaiting_curation" &&
        isMetalearningSession(state.session) && state.session.status === "open" && state.session.domainId === draft.id;
      const activeDomains = state.domains;
      let selectedDraft: DomainDraft | undefined;
      let selectedDomain: ActiveDomain | undefined;

      if (activeDomains.length === 0) {
        if (draft === null) {
          ctx.ui.notify("Lori: não há Domain ativo ou preparo pronto para curadoria.", "warning");
          return;
        }
        if (draft.phase === "awaiting_approval") {
          ctx.ui.notify("Lori: já existe uma proposta pendente. Ela permanece para revisão; não será substituída automaticamente.", "warning");
          return;
        }
        if (!canCurateDraft) {
          ctx.ui.notify("Lori: retome a Session de Metalearning e conclua o questionário antes de solicitar a curadoria.", "warning");
          return;
        }
        selectedDraft = draft;
      } else {
        const draftOption = canCurateDraft ? `Domain em preparo: ${draft.name ?? draft.id} [${draft.id}]` : undefined;
        const domainOptions = activeDomains.map((domain) => `${domain.name} · ${domain.learningObjective} [${domain.id}]`);
        const options = [...(draftOption === undefined ? [] : [draftOption]), ...domainOptions];
        const selected = await ctx.ui.select("Escolher Domain para re-curar", options);
        if (selected === undefined) return;
        selectedDomain = activeDomains.find((domain) => `${domain.name} · ${domain.learningObjective} [${domain.id}]` === selected);
        if (selectedDomain === undefined && selected === draftOption && canCurateDraft) {
          selectedDraft = draft;
        }
        if (selectedDomain === undefined && selectedDraft === undefined) {
          ctx.ui.notify("Lori: escolha um Domain ativo ou o preparo disponível.", "warning");
          return;
        }
      }

      const requestId = randomUUID();
      if (selectedDomain !== undefined) {
        startChapterCurationRequest(api, shared, ctx, {
          requestId,
          draft: activeDomainDraft(selectedDomain),
          target: "active",
          currentChapterVersionId: selectedDomain.currentChapterVersionId,
        });
        return;
      }

      if (selectedDraft === undefined) {
        return;
      }
      startChapterCurationRequest(api, shared, ctx, {
        requestId,
        draft: selectedDraft,
        target: "draft",
      });
    },
  });
}
