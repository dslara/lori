import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createSkinProvider } from "../presentation/skin/provider.ts";
import { createStore } from "../store/store.ts";
import { initializeSessionState, registerLoriCommands, type LoriExtensionState } from "./pi-commands.ts";
import { showError, showStatus } from "./ui.ts";

function clearSharedState(shared: LoriExtensionState, error?: string): void {
  shared.store = undefined;
  shared.projectDir = undefined;
  shared.skin = undefined;
  shared.startupError = error;
}

export default function loriExtension(pi: ExtensionAPI): void {
  const shared: LoriExtensionState = {
    store: undefined,
    projectDir: undefined,
    skin: undefined,
    startupError: undefined,
  };

  registerLoriCommands(pi, shared);

  pi.on("session_start", async (_event, ctx) => {
    const result = await initializeSessionState(ctx.cwd);
    if (!result.ok) {
      clearSharedState(shared, result.error);
      showError(ctx, result.error);
      return;
    }

    shared.store = createStore(result.state);
    shared.projectDir = ctx.cwd;
    shared.skin = await createSkinProvider(ctx.cwd, result.state.skinConfig);
    shared.startupError = undefined;
    showStatus(ctx, result.state, shared.skin, result.restored ? "session.restored" : undefined);
  });

  pi.on("session_shutdown", () => {
    clearSharedState(shared);
  });
}
