import { randomUUID } from "node:crypto";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Value } from "typebox/value";
import { validateChapterProposal, validateProposalForDraft } from "../../core/domain/chapter.ts";
import type { ActiveDomain, Baseline, ChapterVersionReference, DomainDraft, DomainDraftAnswerAction } from "../../core/domain/types.ts";
import type { ChapterNode, ChapterResource } from "../../core/domain/chapter.ts";
import { restoreSessionAsPaused } from "../../core/processors/lifecycle.ts";
import { selectCanOpenSession } from "../../core/session/selectors.ts";
import { createStore, type LoriStore } from "../../store/store.ts";
import type { LoriState } from "../../store/state.ts";
import type { SkinProvider } from "../../presentation/skin/provider.ts";
import { loadOrCreateSnapshot, writeSnapshot } from "../persist/persist.ts";
import type { SnapshotResult } from "../persist/types.ts";
import { showError, showStatus } from "../ui/ui.ts";
import {
  buildChapterCurationPrompt,
  chapterCurationToolParameters,
  renderChapterProposal,
  renderCurationBlocker,
  type ChapterCurationToolResult,
} from "./chapter-curation.ts";
import type {
  DispatchAndPersistResult,
  LoriExtensionState,
  LoriActionFactory,
  SessionInitializationResult,
} from "./types.ts";

const TECHNIQUES = [
  { name: "Benchmarking", principle: "Metalearning" },
  { name: "Emphasize", principle: "Metalearning" },
  { name: "Exclude", principle: "Metalearning" },
  { name: "Pomodoro", principle: "Focus" },
  { name: "Timeboxing", principle: "Focus" },
  { name: "Digital Detox", principle: "Focus" },
  { name: "Build From Scratch", principle: "Directness" },
  { name: "Immersive Project", principle: "Directness" },
  { name: "Copycat", principle: "Directness" },
  { name: "Time Slicer", principle: "Drill" },
  { name: "Rate Limiter", principle: "Drill" },
  { name: "Cognitive Load Limiter", principle: "Drill" },
  { name: "Active Recall", principle: "Retrieval" },
  { name: "Closed Book", principle: "Retrieval" },
  { name: "Blindfold", principle: "Retrieval" },
  { name: "Feynman Technique", principle: "Feedback" },
  { name: "Self-Explanation", principle: "Feedback" },
  { name: "Rubber Duck", principle: "Feedback" },
  { name: "SRS", principle: "Retention" },
  { name: "Interleaving", principle: "Retention" },
  { name: "Overlearning", principle: "Retention" },
  { name: "Elaborative Interrogation", principle: "Intuition" },
  { name: "Dual Coding", principle: "Intuition" },
  { name: "Analogy Creation", principle: "Intuition" },
  { name: "Anti-Expert", principle: "Experimentation" },
  { name: "Constraint Removal", principle: "Experimentation" },
  { name: "Teach to Learn", principle: "Experimentation" },
] as const;
const CUSTOM_TECHNIQUE_OPTION = "Informar outra técnica";
const BASELINE_OPTIONS = [
  "1 · Nenhuma familiaridade: nunca estudei ou usei",
  "2 · Familiaridade inicial: reconheço alguns conceitos",
  "3 · Familiaridade intermediária: aplico o básico com consulta",
  "4 · Consigo aplicar sem orientação na maioria dos casos",
  "5 · Familiaridade profunda: explico, adapto e resolvo casos novos",
] as const;

type DomainDraftField = keyof Omit<DomainDraft, "id" | "phase" | "pendingChapter" | "verdictFocus">;

function nextDomainDraftField(draft: DomainDraft): DomainDraftField | undefined {
  return ([
    "name",
    "learningObjective",
    "motivation",
    "deadline",
    "hoursPerWeek",
    "baseline",
    "preferences",
    "materialRestrictions",
  ] as const).find((field) => draft[field] === undefined);
}

function domainDraftQuestionTitle(field: DomainDraftField): string {
  switch (field) {
    case "name": return "Nome do Domain";
    case "learningObjective": return "Learning Objective";
    case "motivation": return "Motivação";
    case "deadline": return "Prazo ou 'sem prazo'";
    case "hoursPerWeek": return "Horas por semana";
    case "baseline": return "Baseline — selecione sua familiaridade atual (não é um teste)";
    case "preferences": return "Preferências de materiais (opcional)";
    case "materialRestrictions": return "Restrições de materiais (opcional)";
  }
}

async function promptDomainDraftAnswer(
  id: string,
  field: DomainDraftField,
  ctx: Pick<ExtensionContext, "ui">,
): Promise<DomainDraftAnswerAction | undefined> {
  if (field === "baseline") {
    const selected = await ctx.ui.select(domainDraftQuestionTitle(field), [...BASELINE_OPTIONS]);
    const index = BASELINE_OPTIONS.indexOf(selected as (typeof BASELINE_OPTIONS)[number]);
    if (index < 0) {
      return undefined;
    }
    return { type: "domain-draft/answer", id, field, value: (index + 1) as Baseline };
  }

  const response = await ctx.ui.input(domainDraftQuestionTitle(field));
  if (response === undefined) {
    return undefined;
  }
  const value = response.trim();
  if (field === "hoursPerWeek") {
    const hours = Number(value);
    if (value.length === 0 || !Number.isFinite(hours) || hours < 0) {
      ctx.ui.notify("Informe um número finito de horas por semana (zero também é válido).", "warning");
      return undefined;
    }
    return { type: "domain-draft/answer", id, field, value: hours };
  }
  if (field === "deadline") {
    if (value.length === 0) {
      ctx.ui.notify("Informe um prazo ou declare explicitamente 'sem prazo'.", "warning");
      return undefined;
    }
    return {
      type: "domain-draft/answer",
      id,
      field,
      value: value.toLocaleLowerCase() === "sem prazo" ? null : value,
    };
  }
  if (field === "preferences" || field === "materialRestrictions") {
    return { type: "domain-draft/answer", id, field, value: value || null };
  }
  if (value.length === 0) {
    ctx.ui.notify("A resposta não pode ficar vazia.", "warning");
    return undefined;
  }
  return { type: "domain-draft/answer", id, field, value };
}

async function promptVerdictScore(
  title: "Focus — informe um número finito" | "Honesty — informe um número finito",
  ctx: Pick<ExtensionContext, "ui">,
): Promise<number | undefined> {
  while (true) {
    const response = await ctx.ui.input(title);
    if (response === undefined) return undefined;
    const value = response.trim();
    const score = Number(value);
    if (value.length > 0 && Number.isFinite(score)) return score;
    ctx.ui.notify("Informe um número finito; não há escala ou limite definido.", "warning");
  }
}

function sessionPresentation(state: LoriState): { domain: string; technique: string } {
  const session = state.session;
  if (session?.kind === "metalearning") {
    return {
      domain: state.domainDraft?.name ?? state.domains.find(({ id }) => id === session.domainId)?.name ?? "Domain em preparação",
      technique: "Metalearning",
    };
  }
  if (session?.kind === "study") {
    return {
      domain: state.domains.find(({ id }) => id === session.domainId)?.name ?? "Domain",
      technique: session.primaryTechnique,
    };
  }
  return {
    domain: session?.name ?? "",
    technique: session?.primaryTechnique ?? "",
  };
}

function splitPipeArgs(args: string): [string, string] | null {
  const separator = args.indexOf("|");
  if (separator < 0) {
    return null;
  }

  return [args.slice(0, separator).trim(), args.slice(separator + 1).trim()];
}

async function promptPrimaryTechnique(ctx: Pick<ExtensionContext, "ui">): Promise<string | undefined> {
  const selected = await ctx.ui.select("Escolher Primary Technique", [
    ...TECHNIQUES.map(({ name, principle }) => `${name} · ${principle}`),
    CUSTOM_TECHNIQUE_OPTION,
  ]);
  const technique = TECHNIQUES.find(({ name, principle }) => `${name} · ${principle}` === selected);
  if (technique !== undefined) return technique.name;
  if (selected !== CUSTOM_TECHNIQUE_OPTION) return undefined;

  const value = await ctx.ui.input("Primary Technique da Session");
  if (value === undefined || value.trim().length === 0) return undefined;
  return value.trim();
}

type RecommendedStudyTarget = {
  domain: ActiveDomain;
  chapter: ActiveDomain["chapters"][number];
  node: ChapterNode;
  resource: ChapterResource;
};

function recommendedStudyTarget(state: LoriState, chapterRef: ChapterVersionReference): RecommendedStudyTarget | undefined {
  const domain = state.domains.find(({ id }) => id === chapterRef.domainId);
  const chapter = domain?.chapters.find(({ id }) => id === chapterRef.chapterVersionId);
  const node = chapter?.chapter.nodes[0];
  const resource = node === undefined
    ? undefined
    : chapter?.chapter.resources.find(({ id }) => id === node.recommendedResourceId);
  if (domain === undefined || chapter === undefined || node === undefined || resource === undefined) return undefined;
  return { domain, chapter, node, resource };
}

export function parseCloseArgs(args: string): { focus: number; honesty: number } | null {
  const parts = splitPipeArgs(args);
  if (
    parts === null ||
    parts[0].length === 0 ||
    parts[1].length === 0
  ) {
    return null;
  }

  const [focusInput, honestyInput] = parts;
  const focus = Number(focusInput);
  const honesty = Number(honestyInput);
  if (!Number.isFinite(focus) || !Number.isFinite(honesty)) {
    return null;
  }
  return { focus, honesty };
}

export async function dispatchAndPersist(
  projectDir: string,
  createAction: LoriActionFactory,
): Promise<DispatchAndPersistResult> {
  let loaded: SnapshotResult;
  try {
    loaded = await loadOrCreateSnapshot(projectDir);
  } catch {
    return { status: "snapshot-unavailable" };
  }
  if (!loaded.ok) {
    return { status: "load-failed", error: loaded.error };
  }

  const action = createAction(loaded.state);
  if (!action) {
    return { status: "unchanged", state: loaded.state };
  }

  const store = createStore(loaded.state);
  store.dispatch(action);
  const nextState = store.getState();
  if (nextState === loaded.state) {
    return { status: "unchanged", state: loaded.state };
  }

  try {
    await writeSnapshot(projectDir, nextState);
  } catch {
    return { status: "persistence-failed", state: loaded.state };
  }

  return { status: "persisted", state: nextState };
}

export async function initializeSessionState(projectDir: string): Promise<SessionInitializationResult> {
  let loaded: SnapshotResult;
  try {
    loaded = await loadOrCreateSnapshot(projectDir);
  } catch {
    return { ok: false, error: "Lori: não foi possível acessar o snapshot do projeto." };
  }
  if (!loaded.ok) {
    return loaded;
  }

  const restoreAction = restoreSessionAsPaused(loaded.state.session, Date.now());
  if (!restoreAction) {
    if (loaded.state.session?.status === "open") {
      return { ok: false, error: "Lori: a Session aberta tem timestamps inválidos." };
    }
    return { ok: true, state: loaded.state, restored: false };
  }

  const store = createStore(loaded.state);
  store.dispatch(restoreAction);
  const state = store.getState();
  if (state === loaded.state) {
    return { ok: false, error: "Lori: a Session aberta não pôde ser restaurada como pausa." };
  }

  try {
    await writeSnapshot(projectDir, state);
  } catch {
    return { ok: false, error: "Lori: Session não restaurada porque não foi possível persistir o snapshot." };
  }

  return { ok: true, state, restored: true };
}

function acceptDispatchResult(
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
  result: DispatchAndPersistResult,
  persistenceError: string,
): result is { status: "unchanged" | "persisted"; state: LoriState } {
  if (result.status === "unchanged" || result.status === "persisted") {
    shared.store = createStore(result.state);
    return true;
  }
  if (result.status === "load-failed") {
    shared.store = undefined;
    shared.projectDir = undefined;
    shared.skin = undefined;
    shared.startupError = result.error;
    showError(ctx, result.error);
    return false;
  }
  if (result.status === "persistence-failed") {
    shared.store = createStore(result.state);
    ctx.ui.notify(persistenceError, "error");
    return false;
  }

  ctx.ui.notify(persistenceError, "error");
  return false;
}

type ReadyState = {
  store: LoriStore;
  projectDir: string;
  skin: SkinProvider;
};

async function offerRecommendedFirstStudy(
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
  projectDir: string,
  skin: SkinProvider,
  closedState: LoriState,
): Promise<void> {
  const closedSession = closedState.session;
  if (closedSession?.kind !== "metalearning" || closedSession.status !== "closed") return;
  const chapterRef = closedSession.verdict.chapterRef;
  const target = recommendedStudyTarget(closedState, chapterRef);
  if (target === undefined) {
    ctx.ui.notify("Lori: o Verdict foi fechado, mas não foi possível localizar o primeiro Node e seu recurso recomendado.", "error");
    return;
  }

  const accepted = await ctx.ui.confirm(
    "Iniciar o primeiro estudo?",
    [
      `Domain: ${target.domain.name}`,
      `Chapter version ${target.chapter.version} (${target.chapter.id})`,
      `Primeiro Node: ${target.node.id} — ${target.node.objective}`,
      `Recurso recomendado: ${target.resource.title} — ${target.resource.url} (${target.resource.id})`,
      "Deseja abrir uma Study Session para este Node?",
    ].join("\n"),
  );
  if (!accepted) {
    ctx.ui.notify("Nenhuma Study Session foi iniciada; o Verdict permanece fechado e o Domain continua ativo.", "info");
    return;
  }

  const primaryTechnique = await promptPrimaryTechnique(ctx);
  if (primaryTechnique === undefined) {
    ctx.ui.notify("Nenhuma Study Session foi iniciada; Primary Technique não selecionada.", "info");
    return;
  }

  const result = await dispatchAndPersist(projectDir, (current) => {
    const currentTarget = recommendedStudyTarget(current, chapterRef);
    if (
      current.domainDraft !== null ||
      !selectCanOpenSession(current.session) ||
      currentTarget?.node.id !== target.node.id ||
      currentTarget.resource.id !== target.resource.id
    ) {
      return undefined;
    }
    return {
      type: "session/open-study",
      domainId: target.domain.id,
      chapterRef,
      nodeId: target.node.id,
      resourceId: target.resource.id,
      primaryTechnique,
      startedAt: Date.now(),
    };
  });
  if (!acceptDispatchResult(shared, ctx, result, "Lori: Study Session não iniciada porque não foi possível persistir o snapshot.")) {
    return;
  }
  if (result.status === "unchanged") {
    ctx.ui.notify("Lori: Study Session não iniciada porque o Domain ou Chapter mudou após a confirmação.", "warning");
    return;
  }
  const status = showStatus(ctx, result.state, skin, "session.open");
  ctx.ui.notify(status, "info");
}

async function continueDomainPreparation(
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
  projectDir: string,
  skin: SkinProvider,
): Promise<void> {
  while (true) {
    const latest = await dispatchAndPersist(projectDir, () => undefined);
    if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível ler o snapshot do preparo.")) {
      return;
    }
    const { state } = latest;
    const session = state.session;
    const draft = state.domainDraft;
    if (session?.kind !== "metalearning" || draft === null || session.domainId !== draft.id) {
      ctx.ui.notify("Lori: o preparo do Domain não está disponível no snapshot.", "error");
      return;
    }
    if (session.status !== "open") {
      ctx.ui.notify("Lori: use /lori-resume para continuar o preparo pausado.", "warning");
      return;
    }
    if (draft.phase === "awaiting_curation") {
      const status = showStatus(ctx, state, skin);
      ctx.ui.notify(`${status}\nQuestionário salvo; use /lori-curate para solicitar explicitamente uma proposta. O Domain continua em preparação e ainda não está ativo.`, "info");
      return;
    }
    if (draft.phase === "awaiting_approval") {
      const proposal = draft.pendingChapter;
      if (proposal === undefined) {
        ctx.ui.notify("Lori: a proposta pendente está ausente no snapshot; o Domain continua inativo.", "error");
        return;
      }
      ctx.ui.notify(renderChapterProposal(draft, proposal), "info");
      return;
    }
    if (draft.phase === "awaiting_verdict") {
      const isFocusPending = draft.verdictFocus === undefined;
      const score = await promptVerdictScore(
        isFocusPending ? "Focus — informe um número finito" : "Honesty — informe um número finito",
        ctx,
      );
      if (score === undefined) {
        const paused = await dispatchAndPersist(projectDir, (current) => {
          if (current.session?.kind !== "metalearning" || current.session.status !== "open") {
            return undefined;
          }
          return {
            type: "session/abandon",
            pausedAt: Math.max(Date.now(), current.session.startedAt + current.session.totalPausedMs),
          };
        });
        if (!acceptDispatchResult(shared, ctx, paused, "Lori: avaliação não pausada porque não foi possível persistir o snapshot.")) {
          return;
        }
        if (paused.status === "persisted") {
          const status = showStatus(ctx, paused.state, skin, "session.paused");
          const pending = isFocusPending ? "Focus" : "Honesty";
          const savedFocus = isFocusPending ? "" : "Focus já salvo; ";
          ctx.ui.notify(`${status}\n${savedFocus}${pending} ainda não foi enviada; use /lori-resume para continuar.`, "info");
        }
        return;
      }

      if (isFocusPending) {
        const saved = await dispatchAndPersist(projectDir, (current) => {
          if (
            current.session?.kind !== "metalearning" ||
            current.session.status !== "open" ||
            current.domainDraft?.id !== draft.id ||
            current.domainDraft.phase !== "awaiting_verdict" ||
            current.domainDraft.verdictFocus !== undefined
          ) {
            return undefined;
          }
          return { type: "domain-draft/save-verdict-focus", id: draft.id, focus: score };
        });
        if (!acceptDispatchResult(shared, ctx, saved, "Lori: Focus não salvo porque não foi possível persistir o snapshot.")) {
          return;
        }
        if (saved.status === "unchanged") {
          ctx.ui.notify("Lori: Focus não foi salvo porque o preparo mudou.", "warning");
          return;
        }
        continue;
      }

      const closed = await dispatchAndPersist(projectDir, (current) => {
        const currentSession = current.session;
        const currentDraft = current.domainDraft;
        if (
          currentSession?.kind !== "metalearning" ||
          currentSession.status !== "open" ||
          currentSession.domainId !== draft.id ||
          currentDraft?.id !== draft.id ||
          currentDraft.phase !== "awaiting_verdict" ||
          currentDraft.verdictFocus === undefined
        ) {
          return undefined;
        }
        const closedAt = Math.max(Date.now(), currentSession.startedAt + currentSession.totalPausedMs);
        if (!Number.isFinite(closedAt)) return undefined;
        return {
          type: "session/close",
          closedAt,
          focus: currentDraft.verdictFocus,
          honesty: score,
        };
      });
      if (!acceptDispatchResult(shared, ctx, closed, "Lori: Verdict não fechado porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (closed.status === "unchanged" || closed.state.session?.kind !== "metalearning" || closed.state.session.status !== "closed") {
        ctx.ui.notify("Lori: Verdict não foi fechado porque a Session ou o Chapter aprovado mudou.", "warning");
        return;
      }
      const status = showStatus(ctx, closed.state, skin);
      ctx.ui.notify(
        `${status}\nVerdict ligado ao Chapter version ${closed.state.session.verdict.chapterRef.chapterVersionId}.`,
        "info",
      );
      await offerRecommendedFirstStudy(shared, ctx, projectDir, skin, closed.state);
      return;
    }

    const field = nextDomainDraftField(draft);
    if (field === undefined) {
      ctx.ui.notify("Lori: o questionário não pode avançar porque faltam dados do snapshot.", "error");
      return;
    }
    const answer = await promptDomainDraftAnswer(draft.id, field, ctx);
    if (answer === undefined) {
      const paused = await dispatchAndPersist(projectDir, (current) => {
        if (current.session?.kind !== "metalearning" || current.session.status !== "open") {
          return undefined;
        }
        return {
          type: "session/abandon",
          pausedAt: Math.max(Date.now(), current.session.startedAt + current.session.totalPausedMs),
        };
      });
      if (!acceptDispatchResult(shared, ctx, paused, "Lori: preparo não pausado porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (paused.status === "persisted") {
        const status = showStatus(ctx, paused.state, skin, "session.paused");
        ctx.ui.notify(`${status}\nRespostas salvas; use /lori-resume para continuar na próxima pergunta.`, "info");
      }
      return;
    }

    const saved = await dispatchAndPersist(projectDir, (current) => {
      if (
        current.session?.kind !== "metalearning" ||
        current.session.status !== "open" ||
        current.domainDraft?.id !== answer.id ||
        current.domainDraft.phase !== "collecting"
      ) {
        return undefined;
      }
      return answer;
    });
    if (!acceptDispatchResult(shared, ctx, saved, "Lori: resposta não salva porque não foi possível persistir o snapshot.")) {
      return;
    }
    if (saved.status === "unchanged") {
      ctx.ui.notify("Lori: a resposta não foi salva porque o preparo mudou.", "warning");
      return;
    }
  }
}

function requireReadyState(
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
): ReadyState | undefined {
  if (shared.startupError) {
    ctx.ui.notify(shared.startupError, "error");
    return undefined;
  }
  if (!shared.store || !shared.projectDir || !shared.skin) {
    ctx.ui.notify("Lori ainda não foi inicializada nesta sessão.", "warning");
    return undefined;
  }
  return { store: shared.store, projectDir: shared.projectDir, skin: shared.skin };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toolMessage(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], details: { message: text }, isError };
}

function registerChapterCurationTool(api: ExtensionAPI, shared: LoriExtensionState): void {
  api.registerTool({
    name: "lori_submit_chapter",
    label: "Submit Lori Chapter proposal",
    description: "Submit the structured proposal or explicit research blocker for the current /lori-curate request.",
    promptSnippet: "Submit the researched first Chapter proposal through Lori's TypeBox tool",
    promptGuidelines: [
      "Use lori_submit_chapter only for the requestId and domainId in the current /lori-curate message.",
      "Use lori_submit_chapter with status blocked when no verifiable, compatible sources satisfy the Player's restrictions.",
    ],
    parameters: chapterCurationToolParameters,
    async execute(_toolCallId, params, _signal, _onUpdate, toolCtx) {
      const request = shared.curationRequest;
      const projectDir = shared.projectDir;
      if (
        !request ||
        !isRecord(params) ||
        params.requestId !== request.requestId ||
        params.domainId !== request.domainId ||
        projectDir === undefined
      ) {
        const message = "Lori recusou o tool: ele não corresponde à request atual de curadoria; nenhuma proposta foi salva.";
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }

      const latest = await dispatchAndPersist(projectDir, () => undefined);
      if (!acceptDispatchResult(shared, toolCtx, latest, "Lori: não foi possível validar o snapshot da curadoria.")) {
        return toolMessage("Lori não conseguiu validar a request atual; nenhuma proposta foi salva.", true);
      }
      const currentDraft = latest.state.domainDraft;
      if (
        latest.state.session?.kind !== "metalearning" ||
        latest.state.session.status !== "open" ||
        latest.state.session.domainId !== request.domainId ||
        shared.projectDir !== projectDir ||
        shared.curationRequest?.requestId !== request.requestId ||
        currentDraft?.id !== request.domainId ||
        currentDraft.phase !== "awaiting_curation"
      ) {
        const message = "Lori recusou o tool: a fase ou a request atual mudou; nenhuma proposta foi salva.";
        toolCtx.ui.notify(message, "warning");
        if (shared.curationRequest?.requestId === request.requestId) shared.curationRequest = undefined;
        return toolMessage(message, true);
      }

      if (!Value.Check(chapterCurationToolParameters, params)) {
        const message = "Lori não aceitou a resposta estruturada do tool; ela precisa incluir uma proposta válida ou a razão do bloqueio. Nenhuma proposta foi salva.";
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }
      const submission = params as ChapterCurationToolResult;
      if (submission.result.status === "blocked") {
        const blocker = renderCurationBlocker(submission.result.reason);
        toolCtx.ui.notify(blocker, "warning");
        if (shared.curationRequest?.requestId === request.requestId) shared.curationRequest = undefined;
        return { ...toolMessage(blocker), terminate: true };
      }

      if (!Array.isArray(submission.result.proposal.resources) || submission.result.proposal.resources.length === 0) {
        const blocker = renderCurationBlocker("a pesquisa não encontrou recurso adequado para sustentar os Nodes e seus trechos de evidência.");
        toolCtx.ui.notify(blocker, "warning");
        if (shared.curationRequest?.requestId === request.requestId) shared.curationRequest = undefined;
        return { ...toolMessage(blocker), terminate: true };
      }

      const validation = validateChapterProposal(submission.result.proposal);
      if (!validation.ok) {
        const message = `Lori não aceitou a proposta: ${validation.reason} Nenhuma proposta foi salva; não relaxe as restrições para corrigir o problema.`;
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }
      const incompatibility = validateProposalForDraft(validation.proposal, currentDraft);
      if (incompatibility !== undefined) {
        const hasCompatibleResource = validation.proposal.resources.some(({ compatibility }) => compatibility.compatible);
        const hasIncompatibleResource = validation.proposal.resources.some(({ compatibility }) => !compatibility.compatible);
        if (hasIncompatibleResource && hasCompatibleResource) {
          const message = "Lori recusou a proposta porque ela mistura recursos compatíveis e incompatíveis. Nenhuma proposta foi salva; envie somente recursos compatíveis, sem relaxar as restrições.";
          toolCtx.ui.notify(message, "warning");
          return toolMessage(message, true);
        }
        if (hasIncompatibleResource) {
          const blocker = renderCurationBlocker(incompatibility);
          toolCtx.ui.notify(blocker, "warning");
          if (shared.curationRequest?.requestId === request.requestId) shared.curationRequest = undefined;
          return { ...toolMessage(blocker), terminate: true };
        }
        const message = `Lori não aceitou a proposta: ${incompatibility} Nenhuma proposta foi salva; envie novamente valores que correspondam à request atual.`;
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }

      const saved = await dispatchAndPersist(projectDir, (state) => {
        const draft = state.domainDraft;
        if (
          shared.projectDir !== projectDir ||
          shared.curationRequest?.requestId !== request.requestId ||
          shared.curationRequest.domainId !== request.domainId ||
          state.session?.kind !== "metalearning" ||
          state.session.status !== "open" ||
          state.session.domainId !== request.domainId ||
          draft?.id !== request.domainId ||
          draft.phase !== "awaiting_curation" ||
          validateProposalForDraft(validation.proposal, draft) !== undefined
        ) {
          return undefined;
        }
        return { type: "domain-draft/propose-chapter", id: draft.id, proposal: validation.proposal };
      });
      if (!acceptDispatchResult(shared, toolCtx, saved, "Lori: proposta não salva porque não foi possível persistir o snapshot.")) {
        return toolMessage("Lori não conseguiu salvar a proposta; nenhuma aprovação ou ativação ocorreu.", true);
      }
      if (saved.status !== "persisted") {
        const message = "Lori não salvou a proposta porque a fase ou a request atual mudou; use /lori-curate explicitamente para uma nova tentativa.";
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }

      if (shared.curationRequest?.requestId === request.requestId) shared.curationRequest = undefined;
      const pending = saved.state.domainDraft?.pendingChapter;
      if (pending === undefined || saved.state.domainDraft === null) {
        const message = "Lori não encontrou a proposta pendente no estado salvo; o Domain permanece inativo.";
        toolCtx.ui.notify(message, "error");
        return toolMessage(message, true);
      }
      if (shared.skin) showStatus(toolCtx, saved.state, shared.skin);
      const presentation = renderChapterProposal(saved.state.domainDraft, pending);
      toolCtx.ui.notify(presentation, "info");
      return { ...toolMessage(presentation), terminate: true };
    },
  });
}

export function registerLoriCommands(api: ExtensionAPI, shared: LoriExtensionState): void {
  registerChapterCurationTool(api, shared);

  api.registerCommand("lori-curate", {
    description: "Solicitar explicitamente ao agent uma proposta estruturada para o primeiro Chapter",
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
      if (draft === null) {
        ctx.ui.notify("Lori: /lori-curate atende somente ao Domain inicial em preparação; re-curation de Domain ativo não está disponível.", "warning");
        return;
      }
      if (draft.phase === "awaiting_approval") {
        ctx.ui.notify("Lori: já existe uma proposta pendente. Ela permanece para revisão; re-curation não está disponível neste fluxo.", "warning");
        return;
      }
      if (
        state.session?.kind !== "metalearning" ||
        state.session.domainId !== draft.id ||
        state.session.status !== "open"
      ) {
        ctx.ui.notify("Lori: retome a Session de Metalearning antes de solicitar a curadoria.", "warning");
        return;
      }
      if (draft.phase !== "awaiting_curation") {
        ctx.ui.notify("Lori: conclua o questionário antes de solicitar a curadoria.", "warning");
        return;
      }

      const requestId = randomUUID();
      shared.curationRequest = { requestId, domainId: draft.id };
      try {
        api.sendUserMessage(buildChapterCurationPrompt(requestId, draft));
      } catch {
        shared.curationRequest = undefined;
        ctx.ui.notify("Lori: não foi possível iniciar a curadoria pelo agent; nenhuma proposta foi salva.", "error");
      }
    },
  });

  api.registerCommand("lori-approve", {
    description: "Revisar e aprovar explicitamente a proposta pendente do primeiro Chapter",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) return;
      if (args.trim().length > 0) {
        ctx.ui.notify("Uso: /lori-approve (sem argumentos)", "warning");
        return;
      }

      const { projectDir, skin } = ready;
      const latest = await dispatchAndPersist(projectDir, () => undefined);
      if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível consultar o snapshot antes da aprovação.")) return;
      const { state } = latest;
      const draft = state.domainDraft;
      const session = state.session;
      if (draft === null || draft.phase !== "awaiting_approval" || draft.pendingChapter === undefined) {
        ctx.ui.notify("Lori: não há proposta pendente para aprovar. Nenhum Domain foi ativado.", "warning");
        return;
      }
      if (session?.kind !== "metalearning" || session.domainId !== draft.id || session.status !== "open") {
        ctx.ui.notify("Lori: retome a Session de Metalearning antes de aprovar a proposta.", "warning");
        return;
      }

      const proposal = draft.pendingChapter;
      ctx.ui.notify(renderChapterProposal(draft, proposal), "info");
      const confirmed = await ctx.ui.confirm(
        `Aprovar o primeiro Chapter de ${draft.name ?? "Domain"}?`,
        "A aprovação ativa este Domain e salva uma versão do Chapter. A Session de Metalearning continuará aberta aguardando Verdict; nenhuma nota ou XP será lançado agora.",
      );
      if (!confirmed) {
        ctx.ui.notify("Aprovação cancelada; o draft e a proposta pendente permanecem intactos e o Domain continua inativo.", "info");
        return;
      }

      const result = await dispatchAndPersist(projectDir, (current) => {
        const currentDraft = current.domainDraft;
        if (
          current.session?.kind !== "metalearning" ||
          current.session.status !== "open" ||
          current.session.domainId !== draft.id ||
          currentDraft?.id !== draft.id ||
          currentDraft.phase !== "awaiting_approval" ||
          currentDraft.pendingChapter === undefined ||
          JSON.stringify(currentDraft.pendingChapter) !== JSON.stringify(proposal) ||
          current.domains.some(({ id }) => id === draft.id)
        ) {
          return undefined;
        }
        return {
          type: "domain/approve",
          id: draft.id,
          chapterVersionId: randomUUID(),
          approvedAt: Date.now(),
        };
      });
      if (!acceptDispatchResult(shared, ctx, result, "Lori: Domain não ativado porque não foi possível persistir a aprovação.")) return;
      if (result.status !== "persisted") {
        ctx.ui.notify("Lori: a proposta ou Session mudou durante a confirmação; nenhuma aprovação foi persistida.", "warning");
        return;
      }

      showStatus(ctx, result.state, skin);
      ctx.ui.notify("Domain aprovado e ativo. Informe Focus e Honesty para fechar a Session de Metalearning; nenhuma fórmula de XP será aplicada.", "info");
      await continueDomainPreparation(shared, ctx, projectDir, skin);
    },
  });

  api.registerCommand("lori-init", {
    description: "Preparar um Domain com objetivo e questionário de Metalearning; sem argumentos",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) {
        return;
      }
      if (args.trim().length > 0) {
        ctx.ui.notify("Uso: /lori-init (sem argumentos)", "warning");
        return;
      }
      const { projectDir, skin } = ready;
      const latest = await dispatchAndPersist(projectDir, () => undefined);
      if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível consultar o snapshot antes do preparo.")) {
        return;
      }
      if (latest.state.domainDraft !== null) {
        ctx.ui.notify("Já existe um Domain em preparação; use /lori-resume para continuar, se estiver pausado.", "warning");
        return;
      }
      if (!selectCanOpenSession(latest.state.session)) {
        const { domain, technique } = sessionPresentation(latest.state);
        ctx.ui.notify(skin.render("session.startRejected", { domain, technique }), "warning");
        return;
      }

      const result = await dispatchAndPersist(projectDir, (state) => {
        if (state.domainDraft !== null || !selectCanOpenSession(state.session)) {
          return undefined;
        }
        return { type: "session/open-metalearning", domainId: randomUUID(), startedAt: Date.now() };
      });
      if (!acceptDispatchResult(shared, ctx, result, "Lori: preparo não iniciado porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        ctx.ui.notify("Lori: preparo não iniciado porque já existe um Domain ou Session ativo.", "warning");
        return;
      }
      showStatus(ctx, result.state, skin, "session.open");
      await continueDomainPreparation(shared, ctx, projectDir, skin);
    },
  });

  api.registerCommand("lori-status", {
    description: "Consultar o estado atual da Lori",
    handler: async (_args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) {
        return;
      }
      const { store, projectDir, skin } = ready;

      let latest: SnapshotResult;
      try {
        latest = await loadOrCreateSnapshot(projectDir);
      } catch {
        const status = showStatus(ctx, store.getState(), skin);
        ctx.ui.notify(`Lori: snapshot indisponível; estado em memória. ${status}`, "warning");
        return;
      }
      if (!latest.ok) {
        shared.store = undefined;
        shared.projectDir = undefined;
        shared.skin = undefined;
        shared.startupError = latest.error;
        showError(ctx, latest.error);
        return;
      }

      shared.store = createStore(latest.state);
      const status = showStatus(ctx, latest.state, skin);
      ctx.ui.notify(status, "info");
    },
  });

  api.registerCommand("lori-start", {
    description: "Iniciar uma Study Session escolhendo um Domain ativo e uma Primary Technique",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) {
        return;
      }
      const { projectDir, skin } = ready;
      if (args.trim().length > 0) {
        ctx.ui.notify("Uso: /lori-start (sem argumentos; Domain e Primary Technique são escolhidos explicitamente)", "warning");
        return;
      }

      const latest = await dispatchAndPersist(projectDir, () => undefined);
      if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível acessar o snapshot antes de iniciar a Session.")) {
        return;
      }
      const state = latest.state;
      if (state.domainDraft !== null) {
        ctx.ui.notify("O Domain em preparação ainda não está ativo e não pode iniciar uma Study Session.", "warning");
        return;
      }
      if (!selectCanOpenSession(state.session)) {
        const { domain, technique } = sessionPresentation(state);
        ctx.ui.notify(skin.render("session.startRejected", { domain, technique }), "warning");
        return;
      }
      if (state.domains.length === 0) {
        ctx.ui.notify("Nenhum Domain ativo para selecionar; use /lori-init para preparar e aprovar um Domain.", "warning");
        return;
      }

      const domainOptions = state.domains.map(({ id, name, learningObjective }) => `${name} — ${learningObjective} [${id}]`);
      const selectedDomain = await ctx.ui.select("Escolher Domain ativo", domainOptions);
      const domainIndex = domainOptions.indexOf(selectedDomain ?? "");
      const domain = state.domains[domainIndex];
      if (domain === undefined) return;

      const chapterVersionId = domain.currentChapterVersionId;
      const chapterRef = { domainId: domain.id, chapterVersionId };
      const target = recommendedStudyTarget(state, chapterRef);
      if (target === undefined) {
        ctx.ui.notify("Lori: o Domain ativo não tem um primeiro Node com recurso recomendado; Study Session não iniciada.", "error");
        return;
      }
      const primaryTechnique = await promptPrimaryTechnique(ctx);
      if (primaryTechnique === undefined) return;

      const result = await dispatchAndPersist(projectDir, (current) => {
        const currentTarget = recommendedStudyTarget(current, chapterRef);
        if (
          current.domainDraft !== null ||
          !selectCanOpenSession(current.session) ||
          currentTarget?.node.id !== target.node.id ||
          currentTarget.resource.id !== target.resource.id
        ) {
          return undefined;
        }
        return {
          type: "session/open-study",
          domainId: domain.id,
          chapterRef,
          nodeId: target.node.id,
          resourceId: target.resource.id,
          primaryTechnique,
          startedAt: Date.now(),
        };
      });
      if (!acceptDispatchResult(shared, ctx, result, "Lori: Study Session não iniciada porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        ctx.ui.notify("Lori: Study Session não iniciada porque o Domain ou Chapter mudou durante a seleção.", "warning");
        return;
      }

      const status = showStatus(ctx, result.state, skin, "session.open");
      ctx.ui.notify(status, "info");
    },
  });

  api.registerCommand("lori-close", {
    description: "Fechar uma Session com Verdict: /lori-close <Focus> | <Honesty>",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) {
        return;
      }
      const { projectDir, skin } = ready;

      const verdict = parseCloseArgs(args);
      if (!verdict) {
        ctx.ui.notify("Uso: /lori-close <Focus> | <Honesty> (ambos devem ser números finitos)", "warning");
        return;
      }

      const result = await dispatchAndPersist(projectDir, (state) => {
        const session = state.session;
        if ((session?.kind !== "legacyStudy" && session?.kind !== "study") || (session.status !== "open" && session.status !== "paused")) {
          return undefined;
        }

        const earliestCloseAt = session.status === "open"
          ? session.startedAt + session.totalPausedMs
          : session.pausedAt;
        const closedAt = Math.max(Date.now(), earliestCloseAt);
        if (!Number.isFinite(closedAt)) {
          return undefined;
        }

        return { type: "session/close", closedAt, ...verdict };
      });
      if (!acceptDispatchResult(shared, ctx, result, "Lori: Session não fechada porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        const { domain, technique } = sessionPresentation(result.state);
        ctx.ui.notify(skin.render("session.closeRejected", { domain, technique }), "warning");
        return;
      }

      const status = showStatus(ctx, result.state, skin);
      ctx.ui.notify(status, "info");
    },
  });

  api.registerCommand("lori-abandon", {
    description: "Abandonar a Session aberta como pausa neutra",
    handler: async (_args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) {
        return;
      }
      const { projectDir, skin } = ready;

      const result = await dispatchAndPersist(projectDir, (state) => {
        const session = state.session;
        if (session?.status !== "open") {
          return undefined;
        }
        const pausedAt = Math.max(Date.now(), session.startedAt + session.totalPausedMs);
        if (!Number.isFinite(pausedAt)) {
          return undefined;
        }
        return { type: "session/abandon", pausedAt };
      });
      if (!acceptDispatchResult(shared, ctx, result, "Lori: Session não pausada porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        const { domain, technique } = sessionPresentation(result.state);
        ctx.ui.notify(skin.render("session.pauseRejected", { domain, technique }), "warning");
        return;
      }

      const status = showStatus(ctx, result.state, skin, "session.paused");
      ctx.ui.notify(status, "info");
    },
  });

  api.registerCommand("lori-resume", {
    description: "Retomar uma Session pausada",
    handler: async (_args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) {
        return;
      }
      const { projectDir, skin } = ready;

      const result = await dispatchAndPersist(projectDir, (state) => {
        const session = state.session;
        if (session?.status !== "paused") {
          return undefined;
        }
        const resumedAt = Math.max(Date.now(), session.pausedAt);
        if (!Number.isFinite(resumedAt)) {
          return undefined;
        }
        return { type: "session/resume", resumedAt };
      });
      if (!acceptDispatchResult(shared, ctx, result, "Lori: Session não retomada porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        const { domain, technique } = sessionPresentation(result.state);
        ctx.ui.notify(skin.render("session.resumeRejected", { domain, technique }), "warning");
        return;
      }

      if (result.state.session?.kind === "metalearning") {
        await continueDomainPreparation(shared, ctx, projectDir, skin);
        return;
      }
      const status = showStatus(ctx, result.state, skin, "session.resumed");
      ctx.ui.notify(status, "info");
    },
  });
}
