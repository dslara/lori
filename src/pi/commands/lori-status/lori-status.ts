import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createStore } from "../../../store/store.ts";
import { loadOrCreateSnapshot } from "../../../effects/persist/persist.ts";
import type { SnapshotResult } from "../../../effects/persist/types.ts";
import { showError, showStatus } from "../../../effects/ui/ui.ts";
import type { LoriExtensionState } from "../shared/shared.types.ts";
import { requireReadyState } from "../shared/session.ts";

export function registerLoriStatus(api: ExtensionAPI, shared: LoriExtensionState): void {
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
}
