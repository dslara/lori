import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { restoreSessionAsPaused } from "../../src/core/processors/lifecycle.ts";
import { loadOrCreateSnapshot, writeSnapshot } from "../../src/effects/persist.ts";
import { createStore, type LoriStore } from "../../src/store/store.ts";
import { formatStatus, type LoriState } from "../../src/state.ts";

function showStatus(ctx: Pick<ExtensionContext, "ui">, state: LoriState): void {
  const status = formatStatus(state);
  ctx.ui.setStatus("lori", status);
  ctx.ui.setWidget(
    "lori",
    ["Lori", `Player: ${state.player.totalXp} XP`, status, "Skin Minimal"],
    { placement: "belowEditor" },
  );
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
  let startupError: string | undefined;

  pi.registerCommand("lori-status", {
    description: "Consultar o estado atual da Lori",
    handler: async (_args, ctx) => {
      if (startupError) {
        ctx.ui.notify(startupError, "error");
        return;
      }
      if (!store) {
        ctx.ui.notify("Lori ainda não foi inicializada nesta sessão.", "warning");
        return;
      }
      ctx.ui.notify(formatStatus(store.getState()), "info");
    },
  });

  pi.registerCommand("lori-start", {
    description: "Iniciar uma Session: /lori-start <Domain> | <primary Technique>",
    handler: async (args, ctx) => {
      if (startupError) {
        ctx.ui.notify(startupError, "error");
        return;
      }
      if (!store || !projectDir) {
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
          `Lori: já existe uma Session ${previousState.session?.status === "paused" ? "pausada" : "aberta"} no Domain ${previousState.session?.domain}; ela não foi substituída.`,
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

      showStatus(ctx, nextState);
      ctx.ui.notify(`Lori: Session iniciada em ${input.domain} com ${input.primaryTechnique}.`, "info");
    },
  });

  pi.registerCommand("lori-abandon", {
    description: "Abandonar a Session aberta como pausa neutra",
    handler: async (_args, ctx) => {
      if (startupError) {
        ctx.ui.notify(startupError, "error");
        return;
      }
      if (!store || !projectDir) {
        ctx.ui.notify("Lori ainda não foi inicializada nesta sessão.", "warning");
        return;
      }

      const previousState = store.getState();
      const session = previousState.session;
      if (session?.status !== "open") {
        ctx.ui.notify("Lori: não há Session aberta para abandonar.", "warning");
        return;
      }
      const pausedAt = Date.now();
      if (!Number.isFinite(pausedAt) || pausedAt < session.startedAt + session.totalPausedMs) {
        ctx.ui.notify("Lori: horário inválido; a Session não foi alterada.", "warning");
        return;
      }

      store.dispatch({ type: "session/abandon", pausedAt });
      const nextState = store.getState();
      if (nextState === previousState) {
        ctx.ui.notify("Lori: não foi possível abandonar esta Session.", "warning");
        return;
      }
      try {
        await writeSnapshot(projectDir, nextState);
      } catch {
        store = createStore(previousState);
        ctx.ui.notify("Lori: Session não pausada porque não foi possível persistir o snapshot.", "error");
        return;
      }

      showStatus(ctx, nextState);
      ctx.ui.notify("Lori: Session pausada. Você pode retomá-la quando quiser.", "info");
    },
  });

  pi.registerCommand("lori-resume", {
    description: "Retomar uma Session pausada",
    handler: async (_args, ctx) => {
      if (startupError) {
        ctx.ui.notify(startupError, "error");
        return;
      }
      if (!store || !projectDir) {
        ctx.ui.notify("Lori ainda não foi inicializada nesta sessão.", "warning");
        return;
      }

      const previousState = store.getState();
      const session = previousState.session;
      if (session?.status !== "paused") {
        ctx.ui.notify("Lori: não há Session pausada para retomar.", "warning");
        return;
      }
      const resumedAt = Date.now();
      if (!Number.isFinite(resumedAt) || resumedAt < session.pausedAt) {
        ctx.ui.notify("Lori: horário inválido; a Session não foi alterada.", "warning");
        return;
      }

      store.dispatch({ type: "session/resume", resumedAt });
      const nextState = store.getState();
      if (nextState === previousState) {
        ctx.ui.notify("Lori: não foi possível retomar esta Session.", "warning");
        return;
      }
      try {
        await writeSnapshot(projectDir, nextState);
      } catch {
        store = createStore(previousState);
        ctx.ui.notify("Lori: Session não retomada porque não foi possível persistir o snapshot.", "error");
        return;
      }

      showStatus(ctx, nextState);
      ctx.ui.notify("Lori: Session retomada.", "info");
    },
  });

  pi.on("session_start", async (_event, ctx) => {
    const result = await loadOrCreateSnapshot(ctx.cwd);
    if (!result.ok) {
      store = undefined;
      projectDir = undefined;
      startupError = result.error;
      showError(ctx, result.error);
      return;
    }

    store = createStore(result.state);
    projectDir = ctx.cwd;
    startupError = undefined;

    const restoreAction = restoreSessionAsPaused(store.getState().session, Date.now());
    if (restoreAction) {
      const previousState = store.getState();
      store.dispatch(restoreAction);
      const nextState = store.getState();
      if (nextState === previousState) {
        store = undefined;
        projectDir = undefined;
        startupError = "Lori: a Session aberta não pôde ser restaurada como pausa.";
        showError(ctx, startupError);
        return;
      }
      try {
        await writeSnapshot(ctx.cwd, nextState);
      } catch {
        store = undefined;
        projectDir = undefined;
        startupError = "Lori: Session não restaurada porque não foi possível persistir o snapshot.";
        showError(ctx, startupError);
        return;
      }
    }
    showStatus(ctx, store.getState());
  });
}
