import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { restoreSessionAsPaused } from "../../src/core/processors/lifecycle.ts";
import { selectElapsedMs } from "../../src/core/session/selectors.ts";
import type { SessionAction } from "../../src/core/session/types.ts";
import { loadOrCreateSnapshot, writeSnapshot } from "../../src/effects/persist.ts";
import { createSkinProvider, type SkinProvider } from "../../src/presentation/skin/provider.ts";
import { createStore, type LoriStore } from "../../src/store/store.ts";
import type { LoriState } from "../../src/state.ts";

type SessionDisplayEvent =
  | "session.open"
  | "session.paused"
  | "session.resumed"
  | "session.restored";

type DispatchAndPersistResult = {
  status: "unchanged" | "persisted" | "persistence-failed";
  store: LoriStore;
  state: LoriState;
};

function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function renderStatus(
  state: LoriState,
  skin: SkinProvider,
  now = Date.now(),
  event?: SessionDisplayEvent,
): string {
  if (state.session === null) {
    return skin.render("status.idle", { totalXp: state.player.totalXp });
  }

  if (state.session.status === "closed") {
    return skin.render("session.closed", {
      domain: state.session.domain,
      technique: state.session.primaryTechnique,
      elapsed: formatElapsed(selectElapsedMs(state.session, now)),
      focus: state.session.verdict.focus,
      honesty: state.session.verdict.honesty,
    });
  }

  const sessionEvent = event ?? (state.session.status === "open" ? "session.open" : "session.paused");
  return skin.render(sessionEvent, {
    domain: state.session.domain,
    technique: state.session.primaryTechnique,
    elapsed: formatElapsed(selectElapsedMs(state.session, now)),
  });
}

function showStatus(
  ctx: Pick<ExtensionContext, "ui">,
  state: LoriState,
  skin: SkinProvider,
  event?: SessionDisplayEvent,
): string {
  const status = renderStatus(state, skin, Date.now(), event);
  ctx.ui.setStatus("lori", status);
  ctx.ui.setWidget("lori", ["Lori", status], { placement: "belowEditor" });
  return status;
}

function showError(ctx: Pick<ExtensionContext, "ui">, error: string): void {
  ctx.ui.setStatus("lori", "Lori: erro no snapshot");
  ctx.ui.setWidget("lori", ["Lori", error], { placement: "belowEditor" });
  ctx.ui.notify(error, "error");
}

function parseStartArgs(args: string): { domain: string; primaryTechnique: string } | null {
  const separator = args.indexOf("|");
  if (separator < 0) {
    return null;
  }

  const domain = args.slice(0, separator).trim();
  const primaryTechnique = args.slice(separator + 1).trim();
  if (domain.length === 0 || primaryTechnique.length === 0) {
    return null;
  }
  return { domain, primaryTechnique };
}

function parseCloseArgs(args: string): { focus: number; honesty: number } | null {
  const separator = args.indexOf("|");
  if (separator < 0) {
    return null;
  }

  const focusInput = args.slice(0, separator).trim();
  const honestyInput = args.slice(separator + 1).trim();
  if (focusInput.length === 0 || honestyInput.length === 0) {
    return null;
  }

  const focus = Number(focusInput);
  const honesty = Number(honestyInput);
  if (!Number.isFinite(focus) || !Number.isFinite(honesty)) {
    return null;
  }
  return { focus, honesty };
}

async function dispatchAndPersist(
  store: LoriStore,
  projectDir: string,
  action: SessionAction,
): Promise<DispatchAndPersistResult> {
  const previousState = store.getState();
  store.dispatch(action);
  const nextState = store.getState();
  if (nextState === previousState) {
    return { status: "unchanged", store, state: previousState };
  }

  try {
    await writeSnapshot(projectDir, nextState);
  } catch {
    return {
      status: "persistence-failed",
      store: createStore(previousState),
      state: previousState,
    };
  }

  return { status: "persisted", store, state: nextState };
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
      const status = showStatus(ctx, store.getState(), skin);
      ctx.ui.notify(status, "info");
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

      const result = await dispatchAndPersist(store, projectDir, {
        type: "session/open",
        ...input,
        startedAt: Date.now(),
      });
      store = result.store;
      if (result.status === "unchanged") {
        ctx.ui.notify(
          `Lori: já existe uma Session ${result.state.session?.status === "paused" ? "pausada" : "aberta"} no Domain ${result.state.session?.domain}; ela não foi substituída.`,
          "warning",
        );
        return;
      }
      if (result.status === "persistence-failed") {
        ctx.ui.notify("Lori: Session não iniciada porque não foi possível persistir o snapshot.", "error");
        return;
      }

      showStatus(ctx, result.state, skin, "session.open");
      ctx.ui.notify(`Lori: Session iniciada em ${input.domain} com ${input.primaryTechnique}.`, "info");
    },
  });

  pi.registerCommand("lori-close", {
    description: "Fechar uma Session com Verdict: /lori-close <Focus> | <Honesty>",
    handler: async (args, ctx) => {
      if (startupError) {
        ctx.ui.notify(startupError, "error");
        return;
      }
      if (!store || !projectDir || !skin) {
        ctx.ui.notify("Lori ainda não foi inicializada nesta sessão.", "warning");
        return;
      }

      const verdict = parseCloseArgs(args);
      if (!verdict) {
        ctx.ui.notify("Uso: /lori-close <Focus> | <Honesty> (ambos devem ser números finitos)", "warning");
        return;
      }

      const previousState = store.getState();
      const session = previousState.session;
      if (session?.status !== "open" && session?.status !== "paused") {
        ctx.ui.notify("Lori: não há Session aberta ou pausada para fechar.", "warning");
        return;
      }
      const closedAt = Date.now();
      const earliestCloseAt = session.status === "open"
        ? session.startedAt + session.totalPausedMs
        : session.pausedAt;
      if (!Number.isFinite(closedAt) || closedAt < earliestCloseAt) {
        ctx.ui.notify("Lori: horário inválido; a Session não foi alterada.", "warning");
        return;
      }

      const result = await dispatchAndPersist(store, projectDir, {
        type: "session/close",
        closedAt,
        ...verdict,
      });
      store = result.store;
      if (result.status === "unchanged") {
        ctx.ui.notify("Lori: não foi possível fechar esta Session.", "warning");
        return;
      }
      if (result.status === "persistence-failed") {
        ctx.ui.notify("Lori: Session não fechada porque não foi possível persistir o snapshot.", "error");
        return;
      }

      showStatus(ctx, result.state, skin);
      ctx.ui.notify(
        `Lori: Session fechada. Focus: ${verdict.focus} · Honesty: ${verdict.honesty}.`,
        "info",
      );
    },
  });

  pi.registerCommand("lori-abandon", {
    description: "Abandonar a Session aberta como pausa neutra",
    handler: async (_args, ctx) => {
      if (startupError) {
        ctx.ui.notify(startupError, "error");
        return;
      }
      if (!store || !projectDir || !skin) {
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

      const result = await dispatchAndPersist(store, projectDir, { type: "session/abandon", pausedAt });
      store = result.store;
      if (result.status === "unchanged") {
        ctx.ui.notify("Lori: não foi possível abandonar esta Session.", "warning");
        return;
      }
      if (result.status === "persistence-failed") {
        ctx.ui.notify("Lori: Session não pausada porque não foi possível persistir o snapshot.", "error");
        return;
      }

      showStatus(ctx, result.state, skin, "session.paused");
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
      if (!store || !projectDir || !skin) {
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

      const result = await dispatchAndPersist(store, projectDir, { type: "session/resume", resumedAt });
      store = result.store;
      if (result.status === "unchanged") {
        ctx.ui.notify("Lori: não foi possível retomar esta Session.", "warning");
        return;
      }
      if (result.status === "persistence-failed") {
        ctx.ui.notify("Lori: Session não retomada porque não foi possível persistir o snapshot.", "error");
        return;
      }

      showStatus(ctx, result.state, skin, "session.resumed");
      ctx.ui.notify("Lori: Session retomada.", "info");
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

    let restored = false;
    const restoreAction = restoreSessionAsPaused(store.getState().session, Date.now());
    if (restoreAction) {
      const previousState = store.getState();
      store.dispatch(restoreAction);
      const nextState = store.getState();
      if (nextState === previousState) {
        store = undefined;
        projectDir = undefined;
        skin = undefined;
        startupError = "Lori: a Session aberta não pôde ser restaurada como pausa.";
        showError(ctx, startupError);
        return;
      }
      try {
        await writeSnapshot(ctx.cwd, nextState);
      } catch {
        store = undefined;
        projectDir = undefined;
        skin = undefined;
        startupError = "Lori: Session não restaurada porque não foi possível persistir o snapshot.";
        showError(ctx, startupError);
        return;
      }
      restored = true;
    }
    showStatus(ctx, store.getState(), skin, restored ? "session.restored" : undefined);
  });

  pi.on("session_shutdown", () => {
    store = undefined;
    projectDir = undefined;
    skin = undefined;
    startupError = undefined;
  });
}
