import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { restoreSessionAsPaused } from "../core/processors/lifecycle.ts";
import { selectCanOpenSession } from "../core/session/selectors.ts";
import type { SessionAction } from "../core/session/types.ts";
import { createStore, type LoriStore } from "../store/store.ts";
import type { LoriState } from "../state.ts";
import type { SkinProvider } from "../presentation/skin/provider.ts";
import { loadOrCreateSnapshot, withSnapshotLock, type SnapshotResult } from "./persist.ts";
import { showError, showStatus } from "./ui.ts";

export type DispatchAndPersistResult =
  | { status: "unchanged" | "persisted"; state: LoriState }
  | { status: "load-failed"; error: string }
  | { status: "persistence-failed"; state: LoriState }
  | { status: "lock-failed" };

export type SessionInitializationResult =
  | { ok: true; state: LoriState; restored: boolean }
  | { ok: false; error: string };

export type SessionActionFactory = (state: LoriState) => SessionAction | undefined;

export type LoriExtensionState = {
  store: LoriStore | undefined;
  projectDir: string | undefined;
  skin: SkinProvider | undefined;
  startupError: string | undefined;
};

type StartInput = {
  domain?: string;
  primaryTechnique?: string;
};

function splitPipeArgs(args: string): [string, string] | null {
  const separator = args.indexOf("|");
  if (separator < 0) {
    return null;
  }

  return [args.slice(0, separator).trim(), args.slice(separator + 1).trim()];
}

export function parseStartArgs(args: string): StartInput | null {
  if (args.trim().length === 0) {
    return {};
  }

  const parts = splitPipeArgs(args);
  if (parts === null) {
    return null;
  }

  const [domain, primaryTechnique] = parts;
  if (domain.length === 0 && primaryTechnique.length === 0) {
    return null;
  }

  return {
    ...(domain.length > 0 ? { domain } : {}),
    ...(primaryTechnique.length > 0 ? { primaryTechnique } : {}),
  };
}

type ResolvedStartInput = Required<StartInput>;

async function promptStartValue(
  ctx: Pick<ExtensionContext, "ui">,
  label: "Domain" | "Primary Technique",
  previousValue?: string,
): Promise<string | undefined> {
  if (previousValue !== undefined) {
    const reuseOption = `Reutilizar: ${previousValue}`;
    const otherOption = `Informar outro ${label}`;
    const selected = await ctx.ui.select(`Escolher ${label}`, [reuseOption, otherOption]);
    if (selected === undefined) {
      return undefined;
    }
    if (selected === reuseOption) {
      return previousValue.trim();
    }
    if (selected !== otherOption) {
      return undefined;
    }
  }

  const value = await ctx.ui.input(`${label} da Session`);
  if (value === undefined || value.trim().length === 0) {
    return undefined;
  }
  return value.trim();
}

async function resolveStartInput(
  input: StartInput,
  previous: ResolvedStartInput | undefined,
  ctx: Pick<ExtensionContext, "ui">,
): Promise<ResolvedStartInput | undefined> {
  const hasNoValues = input.domain === undefined && input.primaryTechnique === undefined;
  let previousValues = previous;
  if (hasNoValues && previous !== undefined) {
    const reuseOption = `Reutilizar: ${previous.domain} | ${previous.primaryTechnique}`;
    const otherOption = "Informar um novo par";
    const selected = await ctx.ui.select("Iniciar com os valores anteriores?", [reuseOption, otherOption]);
    if (selected === undefined) {
      return undefined;
    }
    if (selected === reuseOption) {
      return {
        domain: previous.domain.trim(),
        primaryTechnique: previous.primaryTechnique.trim(),
      };
    }
    if (selected !== otherOption) {
      return undefined;
    }
    previousValues = undefined;
  }

  const domain = input.domain ?? await promptStartValue(ctx, "Domain", previousValues?.domain);
  if (domain === undefined) {
    return undefined;
  }
  const primaryTechnique = input.primaryTechnique ?? await promptStartValue(
    ctx,
    "Primary Technique",
    previousValues?.primaryTechnique,
  );
  if (primaryTechnique === undefined) {
    return undefined;
  }
  return { domain: domain.trim(), primaryTechnique: primaryTechnique.trim() };
}

export function parseCloseArgs(args: string): { focus: number; honesty: number } | null {
  const parts = splitPipeArgs(args);
  if (
    parts === null ||
    parts[0].length === 0 ||
    parts[1].length === 0
  ) {
    return null;
  }

  const [focusInput, honestyInput] = parts;
  const focus = Number(focusInput);
  const honesty = Number(honestyInput);
  if (!Number.isFinite(focus) || !Number.isFinite(honesty)) {
    return null;
  }
  return { focus, honesty };
}

export async function dispatchAndPersist(
  projectDir: string,
  createAction: SessionActionFactory,
): Promise<DispatchAndPersistResult> {
  try {
    return await withSnapshotLock(projectDir, async (snapshot) => {
      const loaded = await snapshot.loadOrCreate();
      if (!loaded.ok) {
        return { status: "load-failed", error: loaded.error };
      }

      const action = createAction(loaded.state);
      if (!action) {
        return { status: "unchanged", state: loaded.state };
      }

      const store = createStore(loaded.state);
      store.dispatch(action);
      const nextState = store.getState();
      if (nextState === loaded.state) {
        return { status: "unchanged", state: loaded.state };
      }

      try {
        await snapshot.write(nextState);
      } catch {
        return { status: "persistence-failed", state: loaded.state };
      }

      return { status: "persisted", state: nextState };
    });
  } catch {
    return { status: "lock-failed" };
  }
}

export async function initializeSessionState(projectDir: string): Promise<SessionInitializationResult> {
  try {
    return await withSnapshotLock(projectDir, async (snapshot) => {
      const loaded = await snapshot.loadOrCreate();
      if (!loaded.ok) {
        return loaded;
      }

      const restoreAction = restoreSessionAsPaused(loaded.state.session, Date.now());
      if (!restoreAction) {
        if (loaded.state.session?.status === "open") {
          return { ok: false, error: "Lori: a Session aberta tem timestamps inválidos." };
        }
        return { ok: true, state: loaded.state, restored: false };
      }

      const store = createStore(loaded.state);
      store.dispatch(restoreAction);
      const state = store.getState();
      if (state === loaded.state) {
        return { ok: false, error: "Lori: a Session aberta não pôde ser restaurada como pausa." };
      }

      try {
        await snapshot.write(state);
      } catch {
        return { ok: false, error: "Lori: Session não restaurada porque não foi possível persistir o snapshot." };
      }

      return { ok: true, state, restored: true };
    });
  } catch {
    return { ok: false, error: "Lori: não foi possível acessar o snapshot do projeto." };
  }
}

function acceptDispatchResult(
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
  result: DispatchAndPersistResult,
  persistenceError: string,
): result is { status: "unchanged" | "persisted"; state: LoriState } {
  if (result.status === "unchanged" || result.status === "persisted") {
    shared.store = createStore(result.state);
    return true;
  }
  if (result.status === "load-failed") {
    shared.store = undefined;
    shared.projectDir = undefined;
    shared.skin = undefined;
    shared.startupError = result.error;
    showError(ctx, result.error);
    return false;
  }
  if (result.status === "persistence-failed") {
    shared.store = createStore(result.state);
    ctx.ui.notify(persistenceError, "error");
    return false;
  }

  // Covers lock-failed: no state to preserve, only notify.
  ctx.ui.notify(persistenceError, "error");
  return false;
}

type ReadyState = {
  store: LoriStore;
  projectDir: string;
  skin: SkinProvider;
};

function requireReadyState(
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
): ReadyState | undefined {
  if (shared.startupError) {
    ctx.ui.notify(shared.startupError, "error");
    return undefined;
  }
  if (!shared.store || !shared.projectDir || !shared.skin) {
    ctx.ui.notify("Lori ainda não foi inicializada nesta sessão.", "warning");
    return undefined;
  }
  return { store: shared.store, projectDir: shared.projectDir, skin: shared.skin };
}

export function registerLoriCommands(api: ExtensionAPI, shared: LoriExtensionState): void {
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

  api.registerCommand("lori-start", {
    description: "Iniciar uma Session, omitindo valores para escolhê-los interativamente: /lori-start [<Domain> | <primary Technique>]",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) {
        return;
      }
      const { store, projectDir, skin } = ready;

      const input = parseStartArgs(args);
      if (!input) {
        ctx.ui.notify("Uso: /lori-start [<Domain> | <primary Technique>], omita valores para escolhê-los interativamente.", "warning");
        return;
      }

      let currentSession = store.getState().session;
      if (
        input.domain === undefined ||
        input.primaryTechnique === undefined
      ) {
        const latest = await dispatchAndPersist(projectDir, () => undefined);
        if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível acessar o snapshot antes de iniciar a Session.")) {
          return;
        }
        currentSession = latest.state.session;
        if (!selectCanOpenSession(currentSession)) {
          ctx.ui.notify(
            skin.render("session.startRejected", {
              domain: input.domain ?? "não informado",
              technique: input.primaryTechnique ?? "não informada",
            }),
            "warning",
          );
          return;
        }
      }

      const previous = currentSession?.status === "closed"
        ? { domain: currentSession.domain, primaryTechnique: currentSession.primaryTechnique }
        : undefined;
      const resolvedInput = await resolveStartInput(input, previous, ctx);
      if (resolvedInput === undefined) {
        return;
      }

      const result = await dispatchAndPersist(projectDir, () => ({
        type: "session/open",
        ...resolvedInput,
        startedAt: Date.now(),
      }));
      if (!acceptDispatchResult(shared, ctx, result, "Lori: Session não iniciada porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        ctx.ui.notify(
          skin.render("session.startRejected", {
            domain: resolvedInput.domain,
            technique: resolvedInput.primaryTechnique,
          }),
          "warning",
        );
        return;
      }

      const status = showStatus(ctx, result.state, skin, "session.open");
      ctx.ui.notify(status, "info");
    },
  });

  api.registerCommand("lori-close", {
    description: "Fechar uma Session com Verdict: /lori-close <Focus> | <Honesty>",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) {
        return;
      }
      const { projectDir, skin } = ready;

      const verdict = parseCloseArgs(args);
      if (!verdict) {
        ctx.ui.notify("Uso: /lori-close <Focus> | <Honesty> (ambos devem ser números finitos)", "warning");
        return;
      }

      const result = await dispatchAndPersist(projectDir, (state) => {
        const session = state.session;
        if (session?.status !== "open" && session?.status !== "paused") {
          return undefined;
        }

        const earliestCloseAt = session.status === "open"
          ? session.startedAt + session.totalPausedMs
          : session.pausedAt;
        const closedAt = Math.max(Date.now(), earliestCloseAt);
        if (!Number.isFinite(closedAt)) {
          return undefined;
        }

        return { type: "session/close", closedAt, ...verdict };
      });
      if (!acceptDispatchResult(shared, ctx, result, "Lori: Session não fechada porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        const session = result.state.session;
        ctx.ui.notify(skin.render("session.closeRejected", {
          domain: session?.domain ?? "",
          technique: session?.primaryTechnique ?? "",
        }), "warning");
        return;
      }

      const status = showStatus(ctx, result.state, skin);
      ctx.ui.notify(status, "info");
    },
  });

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
        const pausedAt = Math.max(Date.now(), session.startedAt + session.totalPausedMs);
        if (!Number.isFinite(pausedAt)) {
          return undefined;
        }
        return { type: "session/abandon", pausedAt };
      });
      if (!acceptDispatchResult(shared, ctx, result, "Lori: Session não pausada porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        const session = result.state.session;
        ctx.ui.notify(skin.render("session.pauseRejected", {
          domain: session?.domain ?? "",
          technique: session?.primaryTechnique ?? "",
        }), "warning");
        return;
      }

      const status = showStatus(ctx, result.state, skin, "session.paused");
      ctx.ui.notify(status, "info");
    },
  });

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
        const resumedAt = Math.max(Date.now(), session.pausedAt);
        if (!Number.isFinite(resumedAt)) {
          return undefined;
        }
        return { type: "session/resume", resumedAt };
      });
      if (!acceptDispatchResult(shared, ctx, result, "Lori: Session não retomada porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        const session = result.state.session;
        ctx.ui.notify(skin.render("session.resumeRejected", {
          domain: session?.domain ?? "",
          technique: session?.primaryTechnique ?? "",
        }), "warning");
        return;
      }

      const status = showStatus(ctx, result.state, skin, "session.resumed");
      ctx.ui.notify(status, "info");
    },
  });
}
