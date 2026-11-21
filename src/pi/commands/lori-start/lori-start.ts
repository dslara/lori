import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { selectCanOpenSession } from "../../../core/session/selectors.ts";
import { selectRecommendedStudyTarget } from "../../../core/domain/selectors.ts";
import { showStatus } from "../../ui/status/status.ts";
import type { LoriExtensionState } from "../shared/shared.types.ts";
import { acceptDispatchResult, dispatchAndPersist } from "../shared/persistence.ts";
import { promptPrimaryTechnique, requireReadyState, sessionPresentation } from "../shared/session.ts";

export function registerLoriStart(api: ExtensionAPI, shared: LoriExtensionState): void {
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
      const target = selectRecommendedStudyTarget(state.domains, chapterRef);
      if (target === undefined) {
        ctx.ui.notify("Lori: o Domain ativo não tem um primeiro Node com recurso recomendado; Study Session não iniciada.", "error");
        return;
      }
      const primaryTechnique = await promptPrimaryTechnique(ctx);
      if (primaryTechnique === undefined) return;

      const result = await dispatchAndPersist(projectDir, (current) => {
        const currentTarget = selectRecommendedStudyTarget(current.domains, chapterRef);
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
}
