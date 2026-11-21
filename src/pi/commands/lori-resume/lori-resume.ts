import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isMetalearningSession, selectTransitionAt } from "../../../core/session/selectors.ts";
import { showStatus } from "../../../effects/ui/ui.ts";
import type { LoriExtensionState } from "../shared/shared.types.ts";
import { continueDomainPreparation } from "../shared/domain-preparation.ts";
import { acceptDispatchResult, dispatchAndPersist } from "../shared/persistence.ts";
import { requireReadyState, sessionPresentation } from "../shared/session.ts";

export function registerLoriResume(api: ExtensionAPI, shared: LoriExtensionState): void {
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
        const resumedAt = selectTransitionAt(session, Date.now());
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

      if (isMetalearningSession(result.state.session)) {
        await continueDomainPreparation(shared, ctx, projectDir, skin);
        return;
      }
      const status = showStatus(ctx, result.state, skin, "session.resumed");
      ctx.ui.notify(status, "info");
    },
  });
}
