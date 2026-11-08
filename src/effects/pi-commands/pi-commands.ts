import { randomUUID } from "node:crypto";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { Baseline, DomainDraft, DomainDraftAnswerAction } from "../../core/domain/types.ts";
import { restoreSessionAsPaused } from "../../core/processors/lifecycle.ts";
import { selectCanOpenSession } from "../../core/session/selectors.ts";
import { createStore, type LoriStore } from "../../store/store.ts";
import type { LoriState } from "../../store/state.ts";
import type { SkinProvider } from "../../presentation/skin/provider.ts";
import { loadOrCreateSnapshot, writeSnapshot } from "../persist/persist.ts";
import type { SnapshotResult } from "../persist/types.ts";
import { showError, showStatus } from "../ui/ui.ts";
import type {
  DispatchAndPersistResult,
  LoriExtensionState,
  ResolvedStartInput,
  LoriActionFactory,
  SessionInitializationResult,
  StartInput,
} from "./types.ts";

const TECHNIQUES = [
  { name: "Benchmarking", principle: "Metalearning" },
  { name: "Emphasize", principle: "Metalearning" },
  { name: "Exclude", principle: "Metalearning" },
  { name: "Pomodoro", principle: "Focus" },
  { name: "Timeboxing", principle: "Focus" },
  { name: "Digital Detox", principle: "Focus" },
  { name: "Build From Scratch", principle: "Directness" },
  { name: "Immersive Project", principle: "Directness" },
  { name: "Copycat", principle: "Directness" },
  { name: "Time Slicer", principle: "Drill" },
  { name: "Rate Limiter", principle: "Drill" },
  { name: "Cognitive Load Limiter", principle: "Drill" },
  { name: "Active Recall", principle: "Retrieval" },
  { name: "Closed Book", principle: "Retrieval" },
  { name: "Blindfold", principle: "Retrieval" },
  { name: "Feynman Technique", principle: "Feedback" },
  { name: "Self-Explanation", principle: "Feedback" },
  { name: "Rubber Duck", principle: "Feedback" },
  { name: "SRS", principle: "Retention" },
  { name: "Interleaving", principle: "Retention" },
  { name: "Overlearning", principle: "Retention" },
  { name: "Elaborative Interrogation", principle: "Intuition" },
  { name: "Dual Coding", principle: "Intuition" },
  { name: "Analogy Creation", principle: "Intuition" },
  { name: "Anti-Expert", principle: "Experimentation" },
  { name: "Constraint Removal", principle: "Experimentation" },
  { name: "Teach to Learn", principle: "Experimentation" },
] as const;
const CUSTOM_TECHNIQUE_OPTION = "Informar outra técnica";
const BASELINE_OPTIONS = [
  "1 · Nenhuma familiaridade: nunca estudei ou usei",
  "2 · Familiaridade inicial: reconheço alguns conceitos",
  "3 · Familiaridade intermediária: aplico o básico com consulta",
  "4 · Consigo aplicar sem orientação na maioria dos casos",
  "5 · Familiaridade profunda: explico, adapto e resolvo casos novos",
] as const;

type DomainDraftField = keyof Omit<DomainDraft, "id" | "phase">;

function nextDomainDraftField(draft: DomainDraft): DomainDraftField | undefined {
  return ([
    "name",
    "learningObjective",
    "motivation",
    "deadline",
    "hoursPerWeek",
    "baseline",
    "preferences",
    "materialRestrictions",
  ] as const).find((field) => draft[field] === undefined);
}

function domainDraftQuestionTitle(field: DomainDraftField): string {
  switch (field) {
    case "name": return "Nome do Domain";
    case "learningObjective": return "Learning Objective";
    case "motivation": return "Motivação";
    case "deadline": return "Prazo ou 'sem prazo'";
    case "hoursPerWeek": return "Horas por semana";
    case "baseline": return "Baseline — selecione sua familiaridade atual (não é um teste)";
    case "preferences": return "Preferências de materiais (opcional)";
    case "materialRestrictions": return "Restrições de materiais (opcional)";
  }
}

async function promptDomainDraftAnswer(
  id: string,
  field: DomainDraftField,
  ctx: Pick<ExtensionContext, "ui">,
): Promise<DomainDraftAnswerAction | undefined> {
  if (field === "baseline") {
    const selected = await ctx.ui.select(domainDraftQuestionTitle(field), [...BASELINE_OPTIONS]);
    const index = BASELINE_OPTIONS.indexOf(selected as (typeof BASELINE_OPTIONS)[number]);
    if (index < 0) {
      return undefined;
    }
    return { type: "domain-draft/answer", id, field, value: (index + 1) as Baseline };
  }

  const response = await ctx.ui.input(domainDraftQuestionTitle(field));
  if (response === undefined) {
    return undefined;
  }
  const value = response.trim();
  if (field === "hoursPerWeek") {
    const hours = Number(value);
    if (value.length === 0 || !Number.isFinite(hours) || hours < 0) {
      ctx.ui.notify("Informe um número finito de horas por semana (zero também é válido).", "warning");
      return undefined;
    }
    return { type: "domain-draft/answer", id, field, value: hours };
  }
  if (field === "deadline") {
    if (value.length === 0) {
      ctx.ui.notify("Informe um prazo ou declare explicitamente 'sem prazo'.", "warning");
      return undefined;
    }
    return {
      type: "domain-draft/answer",
      id,
      field,
      value: value.toLocaleLowerCase() === "sem prazo" ? null : value,
    };
  }
  if (field === "preferences" || field === "materialRestrictions") {
    return { type: "domain-draft/answer", id, field, value: value || null };
  }
  if (value.length === 0) {
    ctx.ui.notify("A resposta não pode ficar vazia.", "warning");
    return undefined;
  }
  return { type: "domain-draft/answer", id, field, value };
}

function sessionPresentation(state: LoriState): { domain: string; technique: string } {
  const session = state.session;
  if (session?.kind === "metalearning") {
    return {
      domain: state.domainDraft?.name ?? "Domain em preparação",
      technique: "Metalearning",
    };
  }
  return {
    domain: session?.name ?? "",
    technique: session?.primaryTechnique ?? "",
  };
}

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

  if (label === "Primary Technique") {
    const selected = await ctx.ui.select("Escolher Primary Technique", [
      ...TECHNIQUES.map(({ name, principle }) => `${name} · ${principle}`),
      CUSTOM_TECHNIQUE_OPTION,
    ]);
    const technique = TECHNIQUES.find(
      ({ name, principle }) => `${name} · ${principle}` === selected,
    );
    if (technique !== undefined) {
      return technique.name;
    }
    if (selected !== CUSTOM_TECHNIQUE_OPTION) {
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
  createAction: LoriActionFactory,
): Promise<DispatchAndPersistResult> {
  let loaded: SnapshotResult;
  try {
    loaded = await loadOrCreateSnapshot(projectDir);
  } catch {
    return { status: "snapshot-unavailable" };
  }
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
    await writeSnapshot(projectDir, nextState);
  } catch {
    return { status: "persistence-failed", state: loaded.state };
  }

  return { status: "persisted", state: nextState };
}

export async function initializeSessionState(projectDir: string): Promise<SessionInitializationResult> {
  let loaded: SnapshotResult;
  try {
    loaded = await loadOrCreateSnapshot(projectDir);
  } catch {
    return { ok: false, error: "Lori: não foi possível acessar o snapshot do projeto." };
  }
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
    await writeSnapshot(projectDir, state);
  } catch {
    return { ok: false, error: "Lori: Session não restaurada porque não foi possível persistir o snapshot." };
  }

  return { ok: true, state, restored: true };
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

  ctx.ui.notify(persistenceError, "error");
  return false;
}

type ReadyState = {
  store: LoriStore;
  projectDir: string;
  skin: SkinProvider;
};

async function continueDomainPreparation(
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
  projectDir: string,
  skin: SkinProvider,
): Promise<void> {
  while (true) {
    const latest = await dispatchAndPersist(projectDir, () => undefined);
    if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível ler o snapshot do preparo.")) {
      return;
    }
    const { state } = latest;
    const session = state.session;
    const draft = state.domainDraft;
    if (session?.kind !== "metalearning" || draft === null || session.domainId !== draft.id) {
      ctx.ui.notify("Lori: o preparo do Domain não está disponível no snapshot.", "error");
      return;
    }
    if (session.status !== "open") {
      ctx.ui.notify("Lori: use /lori-resume para continuar o preparo pausado.", "warning");
      return;
    }
    if (draft.phase === "awaiting_curation") {
      const status = showStatus(ctx, state, skin);
      ctx.ui.notify(`${status}\nQuestionário salvo; o Domain continua em preparação e ainda não está ativo.`, "info");
      return;
    }

    const field = nextDomainDraftField(draft);
    if (field === undefined) {
      ctx.ui.notify("Lori: o questionário não pode avançar porque faltam dados do snapshot.", "error");
      return;
    }
    const answer = await promptDomainDraftAnswer(draft.id, field, ctx);
    if (answer === undefined) {
      const paused = await dispatchAndPersist(projectDir, (current) => {
        if (current.session?.kind !== "metalearning" || current.session.status !== "open") {
          return undefined;
        }
        return {
          type: "session/abandon",
          pausedAt: Math.max(Date.now(), current.session.startedAt + current.session.totalPausedMs),
        };
      });
      if (!acceptDispatchResult(shared, ctx, paused, "Lori: preparo não pausado porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (paused.status === "persisted") {
        const status = showStatus(ctx, paused.state, skin, "session.paused");
        ctx.ui.notify(`${status}\nRespostas salvas; use /lori-resume para continuar na próxima pergunta.`, "info");
      }
      return;
    }

    const saved = await dispatchAndPersist(projectDir, (current) => {
      if (
        current.session?.kind !== "metalearning" ||
        current.session.status !== "open" ||
        current.domainDraft?.id !== answer.id ||
        current.domainDraft.phase !== "collecting"
      ) {
        return undefined;
      }
      return answer;
    });
    if (!acceptDispatchResult(shared, ctx, saved, "Lori: resposta não salva porque não foi possível persistir o snapshot.")) {
      return;
    }
    if (saved.status === "unchanged") {
      ctx.ui.notify("Lori: a resposta não foi salva porque o preparo mudou.", "warning");
      return;
    }
  }
}

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
  api.registerCommand("lori-init", {
    description: "Preparar um Domain com objetivo e questionário de Metalearning; sem argumentos",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) {
        return;
      }
      if (args.trim().length > 0) {
        ctx.ui.notify("Uso: /lori-init (sem argumentos)", "warning");
        return;
      }
      const { projectDir, skin } = ready;
      const latest = await dispatchAndPersist(projectDir, () => undefined);
      if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível consultar o snapshot antes do preparo.")) {
        return;
      }
      if (latest.state.domainDraft !== null) {
        ctx.ui.notify("Já existe um Domain em preparação; use /lori-resume para continuar, se estiver pausado.", "warning");
        return;
      }
      if (!selectCanOpenSession(latest.state.session)) {
        const { domain, technique } = sessionPresentation(latest.state);
        ctx.ui.notify(skin.render("session.startRejected", { domain, technique }), "warning");
        return;
      }

      const result = await dispatchAndPersist(projectDir, (state) => {
        if (state.domainDraft !== null || !selectCanOpenSession(state.session)) {
          return undefined;
        }
        return { type: "session/open-metalearning", domainId: randomUUID(), startedAt: Date.now() };
      });
      if (!acceptDispatchResult(shared, ctx, result, "Lori: preparo não iniciado porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        ctx.ui.notify("Lori: preparo não iniciado porque já existe um Domain ou Session ativo.", "warning");
        return;
      }
      showStatus(ctx, result.state, skin, "session.open");
      await continueDomainPreparation(shared, ctx, projectDir, skin);
    },
  });

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
      if (store.getState().domainDraft !== null) {
        ctx.ui.notify("O Domain em preparação ainda não está ativo e não pode iniciar uma Study Session.", "warning");
        return;
      }

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
        ? { domain: currentSession.name, primaryTechnique: currentSession.primaryTechnique }
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
        if (session?.kind !== "legacyStudy" || (session.status !== "open" && session.status !== "paused")) {
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
        const { domain, technique } = sessionPresentation(result.state);
        ctx.ui.notify(skin.render("session.closeRejected", { domain, technique }), "warning");
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
        const { domain, technique } = sessionPresentation(result.state);
        ctx.ui.notify(skin.render("session.pauseRejected", { domain, technique }), "warning");
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
        const { domain, technique } = sessionPresentation(result.state);
        ctx.ui.notify(skin.render("session.resumeRejected", { domain, technique }), "warning");
        return;
      }

      if (result.state.session?.kind === "metalearning") {
        await continueDomainPreparation(shared, ctx, projectDir, skin);
        return;
      }
      const status = showStatus(ctx, result.state, skin, "session.resumed");
      ctx.ui.notify(status, "info");
    },
  });
}
