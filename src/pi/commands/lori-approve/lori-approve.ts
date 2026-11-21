import { randomUUID } from "node:crypto";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { ActiveDomain } from "../../../core/domain/domain.types.ts";
import { isMetalearningSession } from "../../../core/session/selectors.ts";
import type { SkinProvider } from "../../../presentation/skin/provider.ts";
import { showStatus } from "../../../effects/ui/ui.ts";
import { renderChapterProposal } from "../lori-curate/curation.ts";
import type { LoriExtensionState } from "../shared/shared.types.ts";
import { activeDomainDraft, continueDomainPreparation } from "../shared/domain-preparation.ts";
import { acceptDispatchResult, dispatchAndPersist } from "../shared/persistence.ts";
import { requireReadyState } from "../shared/session.ts";
import type { ChapterApprovalTarget } from "./lori-approve.types.ts";

async function approveChapterProposal(
  target: ChapterApprovalTarget,
  projectDir: string,
  skin: SkinProvider,
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
): Promise<void> {
  const isRecuration = target.kind === "active";
  const id = isRecuration ? target.domain.id : target.draft.id;
  const name = isRecuration ? target.domain.name : target.draft.name ?? "Domain";
  const proposal = isRecuration ? target.domain.pendingChapter : target.draft.pendingChapter;
  if (proposal === undefined) return;
  const currentChapterVersionId = isRecuration ? target.domain.currentChapterVersionId : undefined;
  const draft = isRecuration ? activeDomainDraft(target.domain) : target.draft;
  ctx.ui.notify(renderChapterProposal(draft, proposal, currentChapterVersionId === undefined ? {} : { currentChapterVersionId }), "info");

  const confirmed = await ctx.ui.confirm(
    isRecuration ? `Aprovar uma nova versão do Chapter de ${name}?` : `Aprovar o primeiro Chapter de ${name}?`,
    isRecuration
      ? `A aprovação cria uma versão nova e atualiza a atual. A versão ${currentChapterVersionId} e as referências históricas serão preservadas.`
      : "A aprovação ativa este Domain e salva uma versão do Chapter. A Session de Metalearning continuará aberta aguardando Verdict; nenhuma nota ou XP será lançado agora.",
  );
  if (!confirmed) {
    ctx.ui.notify(isRecuration
      ? "Aprovação cancelada; a proposta pendente permanece intacta e o Chapter atual permanece ativo."
      : "Aprovação cancelada; o draft e a proposta pendente permanecem intactos e o Domain continua inativo.", "info");
    return;
  }

  const result = await dispatchAndPersist(projectDir, (current) => {
    if (shared.projectDir !== projectDir) return undefined;
    if (target.kind === "active") {
      const currentDomain = current.domains.find(({ id: domainId }) => domainId === id);
      if (
        currentDomain === undefined || currentDomain.currentChapterVersionId !== currentChapterVersionId || currentDomain.pendingChapter === undefined ||
        JSON.stringify(currentDomain.pendingChapter) !== JSON.stringify(proposal)
      ) return undefined;
    } else {
      const currentDraft = current.domainDraft;
      if (
        !isMetalearningSession(current.session) || current.session.status !== "open" || current.session.domainId !== id ||
        currentDraft?.id !== id || currentDraft.phase !== "awaiting_approval" || currentDraft.pendingChapter === undefined ||
        JSON.stringify(currentDraft.pendingChapter) !== JSON.stringify(proposal) || current.domains.some(({ id: domainId }) => domainId === id)
      ) return undefined;
    }
    return { type: "domain/approve", id, chapterVersionId: randomUUID(), approvedAt: Date.now() };
  });
  const error = isRecuration
    ? "Lori: Chapter atual não alterado porque não foi possível persistir a aprovação."
    : "Lori: Domain não ativado porque não foi possível persistir a aprovação.";
  if (!acceptDispatchResult(shared, ctx, result, error)) return;
  if (result.status !== "persisted") {
    ctx.ui.notify(isRecuration
      ? "Lori: a proposta ou a versão atual mudou durante a confirmação; nenhuma aprovação foi persistida."
      : "Lori: a proposta ou Session mudou durante a confirmação; nenhuma aprovação foi persistida.", "warning");
    return;
  }

  showStatus(ctx, result.state, skin);
  if (isRecuration) {
    ctx.ui.notify("Nova versão do Chapter aprovada e atualizada; versões anteriores e Verdicts históricos permanecem intactos.", "info");
    return;
  }
  ctx.ui.notify("Domain aprovado e ativo. Informe Focus e Honesty para fechar a Session de Metalearning; nenhuma fórmula de XP será aplicada.", "info");
  await continueDomainPreparation(shared, ctx, projectDir, skin);
}

async function approveActiveDomainChapter(
  domain: ActiveDomain,
  projectDir: string,
  skin: SkinProvider,
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
): Promise<void> {
  return approveChapterProposal({ kind: "active", domain }, projectDir, skin, shared, ctx);
}

export function registerLoriApprove(api: ExtensionAPI, shared: LoriExtensionState): void {
  api.registerCommand("lori-approve", {
    description: "Revisar e aprovar explicitamente uma proposta pendente de Chapter",
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
      const draftHasPending = draft?.phase === "awaiting_approval" && draft.pendingChapter !== undefined;
      const activePending = state.domains.filter(({ pendingChapter }) => pendingChapter !== undefined);
      if (activePending.length > 0) {
        const draftOption = draftHasPending ? `First Chapter: ${draft?.name ?? draft?.id} [${draft?.id}]` : undefined;
        const activeOptions = activePending.map((domain) => `Re-curation: ${domain.name} [${domain.id}]`);
        const options = [...(draftOption === undefined ? [] : [draftOption]), ...activeOptions];
        let selected: string;
        if (options.length === 1) {
          selected = options[0]!;
        } else {
          const choice = await ctx.ui.select("Escolher proposta de Chapter para aprovar", options);
          if (choice === undefined) return;
          selected = choice;
        }
        const selectedDomain = activePending.find((domain) => `Re-curation: ${domain.name} [${domain.id}]` === selected);
        if (selectedDomain !== undefined) {
          await approveActiveDomainChapter(selectedDomain, projectDir, skin, shared, ctx);
          return;
        }
        if (selected !== draftOption || !draftHasPending) {
          ctx.ui.notify("Lori: escolha uma proposta pendente para aprovar.", "warning");
          return;
        }
      }
      if (!draftHasPending || draft === null || draft.pendingChapter === undefined) {
        ctx.ui.notify("Lori: não há proposta pendente para aprovar. Nenhum Domain foi ativado.", "warning");
        return;
      }
      if (session?.kind !== "metalearning" || session.domainId !== draft.id || session.status !== "open") {
        ctx.ui.notify("Lori: retome a Session de Metalearning antes de aprovar a proposta.", "warning");
        return;
      }

      await approveChapterProposal({ kind: "draft", draft }, projectDir, skin, shared, ctx);
    },
  });
}
