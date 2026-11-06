import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { loadOrCreateSnapshot } from "../../src/effects/persist.ts";
import { createSkinProvider, type SkinProvider } from "../../src/presentation/skin/provider.ts";
import type { LoriState } from "../../src/state.ts";

function showStatus(
  ctx: Pick<ExtensionContext, "ui">,
  state: LoriState,
  skin: SkinProvider,
): void {
  const status = skin.render("status.idle", { totalXp: state.player.totalXp });
  ctx.ui.setStatus("lori", status);
  ctx.ui.setWidget("lori", ["Lori", status], { placement: "belowEditor" });
}

function showError(ctx: Pick<ExtensionContext, "ui">, error: string): void {
  ctx.ui.setStatus("lori", "Lori: erro no snapshot");
  ctx.ui.setWidget("lori", ["Lori", error], { placement: "belowEditor" });
  ctx.ui.notify(error, "error");
}

export default function loriExtension(pi: ExtensionAPI): void {
  let state: LoriState | undefined;
  let skin: SkinProvider | undefined;
  let startupError: string | undefined;

  pi.registerCommand("lori-status", {
    description: "Consultar o estado atual da Lori",
    handler: async (_args, ctx) => {
      if (startupError) {
        ctx.ui.notify(startupError, "error");
        return;
      }
      if (!state || !skin) {
        ctx.ui.notify("Lori ainda não foi inicializada nesta sessão.", "warning");
        return;
      }
      ctx.ui.notify(skin.render("status.idle", { totalXp: state.player.totalXp }), "info");
    },
  });

  pi.on("session_start", async (_event, ctx) => {
    const result = await loadOrCreateSnapshot(ctx.cwd);
    if (!result.ok) {
      state = undefined;
      startupError = result.error;
      showError(ctx, result.error);
      return;
    }

    state = result.state;
    skin = await createSkinProvider(ctx.cwd, state.skinConfig);
    startupError = undefined;
    showStatus(ctx, state, skin);
  });
}
