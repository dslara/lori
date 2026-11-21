import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { selectTransitionAt } from "../../../core/session/selectors.ts";
import { showStatus } from "../../../effects/ui/ui.ts";
import type { LoriExtensionState } from "../shared/shared.types.ts";
import { acceptDispatchResult, dispatchAndPersist } from "../shared/persistence.ts";
import { requireReadyState, sessionPresentation } from "../shared/session.ts";

export function registerLoriAbandon(api: ExtensionAPI, shared: LoriExtensionState): void {
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
        const pausedAt = selectTransitionAt(session, Date.now());
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
}
