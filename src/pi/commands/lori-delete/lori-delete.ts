import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { selectSessionBelongsToDomain } from "../../../core/session/selectors.ts";
import { showStatus } from "../../ui/status/status.ts";
import type { LoriExtensionState } from "../shared/shared.types.ts";
import { acceptDispatchResult, dispatchAndPersist } from "../shared/persistence.ts";
import { requireReadyState } from "../shared/session.ts";
import type { DeleteTarget } from "./lori-delete.types.ts";

export function registerLoriDelete(api: ExtensionAPI, shared: LoriExtensionState): void {
  api.registerCommand("lori-delete", {
    description: "Excluir um Domain ativo ou em preparação com confirmação explícita",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) {
        return;
      }
      if (args.trim().length > 0) {
        ctx.ui.notify("Uso: /lori-delete (selecione um Domain)", "warning");
        return;
      }
      if (!ctx.isIdle() || shared.curationRuntime.current() !== undefined) {
        ctx.ui.notify("Lori: aguarde a curadoria terminar antes de excluir um Domain.", "warning");
        return;
      }

      const { projectDir, skin } = ready;
      const latest = await dispatchAndPersist(projectDir, () => undefined);
      if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível consultar o snapshot antes da exclusão.")) {
        return;
      }
      const state = latest.state;
      const targets: DeleteTarget[] = state.domains.map((domain) => ({
        id: domain.id,
        kind: "active",
        label: `${domain.name} — ${domain.learningObjective} [${domain.id}]`,
        name: domain.name,
        chapterCount: domain.chapters.length,
        hasPendingChapter: domain.pendingChapter !== undefined,
      }));
      const draft = state.domainDraft;
      if (draft !== null && !state.domains.some(({ id }) => id === draft.id)) {
        targets.push({
          id: draft.id,
          kind: "draft",
          label: `${draft.name ?? "Domain"} — em preparação [${draft.id}]`,
          name: draft.name ?? "Domain em preparação",
          chapterCount: 0,
          hasPendingChapter: draft.pendingChapter !== undefined,
        });
      }
      if (targets.length === 0) {
        ctx.ui.notify("Lori: não há Domain ativo ou em preparação para excluir.", "warning");
        return;
      }

      const selected = await ctx.ui.select("Escolher Domain para excluir", targets.map(({ label }) => label));
      const target = targets.find(({ label }) => label === selected);
      if (target === undefined) {
        return;
      }
      const relatedSessions = [
        ...state.sessionHistory,
        ...(state.session === null ? [] : [state.session]),
      ].filter((session) => selectSessionBelongsToDomain(session, target.id)).length;
      const discardsOpenSession = (
        target.kind === "active" &&
        state.session?.status !== "closed" &&
        selectSessionBelongsToDomain(state.session, target.id)
      );
      const confirmation = target.kind === "active"
        ? [
            `Domain: ${target.name}`,
            `Chapter versions: ${target.chapterCount}`,
            `Proposta pendente: ${target.hasPendingChapter ? "sim" : "não"}`,
            `Sessions/Verdicts associados que serão excluídos: ${relatedSessions}`,
            ...(discardsOpenSession ? ["Session aberta ou pausada será descartada, sem Verdict e sem XP."] : []),
            "Player XP e outros Domains serão preservados.",
            "Esta ação é permanente.",
          ].join("\n")
        : [
            `Domain em preparação: ${target.name}`,
            "Respostas salvas serão excluídas.",
            `Proposta pendente: ${target.hasPendingChapter ? "sim" : "não"}.`,
            `Metalearning Session e Sessions/Verdicts associados: ${relatedSessions}.`,
            "Player XP e outros Domains serão preservados.",
            "Esta ação é permanente.",
          ].join("\n");
      const confirmed = await ctx.ui.confirm(`Excluir ${target.name} permanentemente?`, confirmation);
      if (!confirmed) {
        ctx.ui.notify("Exclusão cancelada; nenhum dado foi alterado.", "info");
        return;
      }

      const result = await dispatchAndPersist(projectDir, () => ({ type: "domain/delete", id: target.id, target: target.kind }));
      if (!acceptDispatchResult(shared, ctx, result, "Lori: Domain não excluído porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        ctx.ui.notify("Lori: o Domain ou sua Session mudou durante a confirmação; nada foi excluído.", "warning");
        return;
      }
      const status = showStatus(ctx, result.state, skin);
      ctx.ui.notify(`Domain ${target.name} e seus dados associados foram excluídos. ${status}`, "info");
    },
  });
}
