import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { selectElapsedMs } from "../../src/core/session/selectors.ts";
import { loadOrCreateSnapshot, writeSnapshot } from "../../src/effects/persist.ts";
import { createSkinProvider, type SkinProvider } from "../../src/presentation/skin/provider.ts";
import { createStore, type LoriStore } from "../../src/store/store.ts";
import type { LoriState } from "../../src/state.ts";

function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function renderStatus(state: LoriState, skin: SkinProvider, now = Date.now()): string {
  if (state.session === null) {
    return skin.render("status.idle", { totalXp: state.player.totalXp });
  }

  return skin.render("session.open", {
    domain: state.session.domain,
    technique: state.session.primaryTechnique,
    elapsed: formatElapsed(selectElapsedMs(state.session, now)),
  });
}

function showStatus(
  ctx: Pick<ExtensionContext, "ui">,
  state: LoriState,
  skin: SkinProvider,
): void {
  const status = renderStatus(state, skin);
  ctx.ui.setStatus("lori", status);
  ctx.ui.setWidget("lori", ["Lori", status], { placement: "belowEditor" });
}

function showError(ctx: Pick<ExtensionContext, "ui">, error: string): void {
  ctx.ui.setStatus("lori", "Lori: erro no snapshot");
  ctx.ui.setWidget("lori", ["Lori", error], { placement: "belowEditor" });
  ctx.ui.notify(error, "error");
}

function parseStartArgs(args: string): { domain: string; primaryTechnique: string } | null {
  const separator = args.indexOf("|");
  if (separator < 0) return null;

  const domain = args.slice(0, separator).trim();
  const primaryTechnique = args.slice(separator + 1).trim();
  if (domain.length === 0 || primaryTechnique.length === 0) return null;
  return { domain, primaryTechnique };
}

export default function loriExtension(pi: ExtensionAPI): void {
  let store: LoriStore | undefined;
  let projectDir: string | undefined;
  let skin: SkinProvider | undefined;
  let startupError: string | undefined;

  pi.registerCommand("lori-status", {
    description: "Consultar o estado atual da Lori",
    handler: async (_args, ctx) => {
      if (startupError) {
        ctx.ui.notify(startupError, "error");
        return;
      }
      if (!store || !skin) {
        ctx.ui.notify("Lori ainda não foi inicializada nesta sessão.", "warning");
        return;
      }
      ctx.ui.notify(renderStatus(store.getState(), skin), "info");
    },
  });

  pi.registerCommand("lori-start", {
    description: "Iniciar uma Session: /lori-start <Domain> | <primary Technique>",
    handler: async (args, ctx) => {
      if (startupError) {
        ctx.ui.notify(startupError, "error");
        return;
      }
      if (!store || !projectDir || !skin) {
        ctx.ui.notify("Lori ainda não foi inicializada nesta sessão.", "warning");
        return;
      }

      const input = parseStartArgs(args);
      if (!input) {
        ctx.ui.notify("Uso: /lori-start <Domain> | <primary Technique> (ambos obrigatórios)", "warning");
        return;
      }

      const previousState = store.getState();
      store.dispatch({
        type: "session/open",
        ...input,
        startedAt: Date.now(),
      });
      const nextState = store.getState();
      if (nextState === previousState) {
        ctx.ui.notify(
          `Lori: já existe uma Session aberta no Domain ${previousState.session?.domain}; ela não foi substituída.`,
          "warning",
        );
        return;
      }

      try {
        await writeSnapshot(projectDir, nextState);
      } catch {
        store = createStore(previousState);
        ctx.ui.notify("Lori: Session não iniciada porque não foi possível persistir o snapshot.", "error");
        return;
      }

      showStatus(ctx, nextState, skin);
      ctx.ui.notify(`Lori: Session iniciada em ${input.domain} com ${input.primaryTechnique}.`, "info");
    },
  });

  pi.on("session_start", async (_event, ctx) => {
    const result = await loadOrCreateSnapshot(ctx.cwd);
    if (!result.ok) {
      store = undefined;
      projectDir = undefined;
      skin = undefined;
      startupError = result.error;
      showError(ctx, result.error);
      return;
    }

    store = createStore(result.state);
    projectDir = ctx.cwd;
    skin = await createSkinProvider(ctx.cwd, result.state.skinConfig);
    startupError = undefined;
    showStatus(ctx, store.getState(), skin);
  });
}
