import { randomUUID } from "node:crypto";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Value } from "typebox/value";
import { decideChapterAcceptance } from "../../core/domain/chapter.ts";
import { getQuestionnaire } from "../../core/domain/questionnaire.ts";
import type { ActiveDomain, Baseline, DomainDraft, DomainDraftAnswerAction } from "../../core/domain/types.ts";
import { selectNextDomainDraftField, selectRecommendedStudyTarget, type DomainDraftQuestionField } from "../../core/domain/selectors.ts";
import { restoreSessionAsPaused } from "../../core/processors/lifecycle.ts";
import { isMetalearningSession, selectCanOpenSession, selectSessionBelongsToDomain, selectTransitionAt } from "../../core/session/selectors.ts";
import { createStore, type LoriStore } from "../../store/store.ts";
import type { LoriState } from "../../store/state.ts";
import type { SkinProvider } from "../../presentation/skin/provider.ts";
import { loadOrCreateSnapshot, writeSnapshot } from "../../effects/persist/persist.ts";
import type { SnapshotResult } from "../../effects/persist/types.ts";
import { showError, showStatus } from "../../effects/ui/ui.ts";
import { registerCurationSourceEvidenceHooks } from "./chapter-source-evidence.ts";
import {
  buildChapterCurationPrompt,
  chapterCurationToolParameters,
  renderChapterProposal,
  renderCurationBlocker,
  type ChapterCurationToolResult,
} from "./chapter-curation.ts";
import type {
  DispatchAndPersistResult,
  LoriExtensionState,
  LoriActionFactory,
  SessionInitializationResult,
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
  "1 · Começando do zero: não estudei nem usei os conceitos",
  "2 · Reconheço conceitos, mas ainda não consigo aplicá-los",
  "3 · Realizo tarefas básicas com apoio ou consulta",
  "4 · Realizo tarefas comuns com autonomia",
  "5 · Adapto o conhecimento e resolvo casos novos",
] as const;

type DomainDraftQuestionPrompt = {
  title: string;
  guidance?: string;
};

const DOMAIN_DRAFT_QUESTIONS: Record<DomainDraftQuestionField, DomainDraftQuestionPrompt> = {
  name: {
    title: "Como você quer chamar este Domain?",
    guidance: "Identifica o Domain nas telas e na curadoria. Texto livre, ex.: japonês, React ou álgebra.",
  },
  learningObjective: {
    title: "O que você quer conseguir fazer?",
    guidance: "Informa à curadoria o resultado que você busca. Texto livre, descreva algo observável. Ex.: manter uma conversa básica em japonês.",
  },
  motivation: {
    title: "Por que aprender isso agora?",
    guidance: "Entra como contexto da curadoria. Texto livre, ex.: viagem, trabalho ou projeto pessoal.",
  },
  deadline: {
    title: "Até quando quer alcançar esse objetivo?",
    guidance: "Entra no esforço proposto para o Chapter. Data sugerida: DD/MM/AAAA, ex.: 31/12/2026. Texto livre também é aceito; vazio ou 'sem prazo' = sem prazo.",
  },
  hoursPerWeek: {
    title: "Quanto tempo por semana consegue dedicar?",
    guidance: "Entra no esforço proposto para o Chapter. Número de horas por semana, ex.: 3. Zero também é válido.",
  },
  baseline: {
    title: "Baseline — como avalia seu ponto de partida para este objetivo? (não é um teste)\nEntra como contexto da curadoria. Selecione uma opção de 1 a 5.",
  },
  preferences: {
    title: "Que formatos prefere para aprender?",
    guidance: "Entra no contexto da curadoria; cada recurso declara como considerou suas preferências. Texto livre, ex.: documentação, vídeos, áudio ou exercícios. Vazio = sem preferência.",
  },
  materialRestrictions: {
    title: "Que restrições os materiais precisam respeitar?",
    guidance: "Entra no contexto da curadoria; cada recurso declara como respeita suas restrições. Texto livre, ex.: idioma, custo, acessibilidade ou ferramentas. Vazio = sem restrições.",
  },
};

async function promptDomainDraftAnswer(
  id: string,
  field: DomainDraftQuestionField,
  ctx: Pick<ExtensionContext, "ui">,
): Promise<DomainDraftAnswerAction | undefined> {
  const question = DOMAIN_DRAFT_QUESTIONS[field];
  if (field === "baseline") {
    const selected = await ctx.ui.select(question.title, [...BASELINE_OPTIONS]);
    const index = BASELINE_OPTIONS.indexOf(selected as (typeof BASELINE_OPTIONS)[number]);
    if (index < 0) {
      return undefined;
    }
    return { type: "domain-draft/answer", id, field, value: (index + 1) as Baseline };
  }

  const response = await ctx.ui.input(question.title, question.guidance);
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
    return {
      type: "domain-draft/answer",
      id,
      field,
      value: value.length === 0 || value.toLocaleLowerCase() === "sem prazo" ? null : value,
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

async function promptVerdictScore(
  title: "Focus — informe um número finito" | "Honesty — informe um número finito",
  ctx: Pick<ExtensionContext, "ui">,
): Promise<number | undefined> {
  while (true) {
    const response = await ctx.ui.input(title);
    if (response === undefined) return undefined;
    const value = response.trim();
    const score = Number(value);
    if (value.length > 0 && Number.isFinite(score)) return score;
    ctx.ui.notify("Informe um número finito; não há escala ou limite definido.", "warning");
  }
}

function activeDomainDraft(domain: ActiveDomain): DomainDraft {
  return {
    id: domain.id,
    phase: "awaiting_curation",
    name: domain.name,
    learningObjective: domain.learningObjective,
    motivation: domain.questionnaire.motivation,
    deadline: domain.questionnaire.deadline,
    hoursPerWeek: domain.questionnaire.hoursPerWeek,
    baseline: domain.questionnaire.baseline,
    preferences: domain.questionnaire.preferences,
    materialRestrictions: domain.questionnaire.materialRestrictions,
  };
}

function sessionPresentation(state: LoriState): { domain: string; technique: string } {
  const session = state.session;
  if (isMetalearningSession(session)) {
    return {
      domain: state.domainDraft?.name ?? state.domains.find(({ id }) => id === session.domainId)?.name ?? "Domain em preparação",
      technique: "Metalearning",
    };
  }
  if (session?.kind === "study") {
    return {
      domain: state.domains.find(({ id }) => id === session.domainId)?.name ?? "Domain",
      technique: session.primaryTechnique,
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

async function promptPrimaryTechnique(ctx: Pick<ExtensionContext, "ui">): Promise<string | undefined> {
  const selected = await ctx.ui.select("Escolher Primary Technique", [
    ...TECHNIQUES.map(({ name, principle }) => `${name} · ${principle}`),
    CUSTOM_TECHNIQUE_OPTION,
  ]);
  const technique = TECHNIQUES.find(({ name, principle }) => `${name} · ${principle}` === selected);
  if (technique !== undefined) return technique.name;
  if (selected !== CUSTOM_TECHNIQUE_OPTION) return undefined;

  const value = await ctx.ui.input("Primary Technique da Session");
  if (value === undefined || value.trim().length === 0) return undefined;
  return value.trim();
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

async function offerRecommendedFirstStudy(
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
  projectDir: string,
  skin: SkinProvider,
  closedState: LoriState,
): Promise<void> {
  const closedSession = closedState.session;
  if (closedSession?.kind !== "metalearning" || closedSession.status !== "closed") return;
  const chapterRef = closedSession.verdict.chapterRef;
  const target = selectRecommendedStudyTarget(closedState.domains, chapterRef);
  if (target === undefined) {
    ctx.ui.notify("Lori: o Verdict foi fechado, mas não foi possível localizar o primeiro Node e seu recurso recomendado.", "error");
    return;
  }

  const accepted = await ctx.ui.confirm(
    "Iniciar o primeiro estudo?",
    [
      `Domain: ${target.domain.name}`,
      `Chapter version ${target.chapter.version} (${target.chapter.id})`,
      `Primeiro Node: ${target.node.id} — ${target.node.objective}`,
      `Recurso recomendado: ${target.resource.title} — ${target.resource.url} (${target.resource.id})`,
      "Deseja abrir uma Study Session para este Node?",
    ].join("\n"),
  );
  if (!accepted) {
    ctx.ui.notify("Nenhuma Study Session foi iniciada; o Verdict permanece fechado e o Domain continua ativo.", "info");
    return;
  }

  const primaryTechnique = await promptPrimaryTechnique(ctx);
  if (primaryTechnique === undefined) {
    ctx.ui.notify("Nenhuma Study Session foi iniciada; Primary Technique não selecionada.", "info");
    return;
  }

  const result = await dispatchAndPersist(projectDir, (current) => {
    const currentTarget = selectRecommendedStudyTarget(current.domains, chapterRef);
    if (
      current.domainDraft !== null ||
      !selectCanOpenSession(current.session) ||
      currentTarget?.node.id !== target.node.id ||
      currentTarget.resource.id !== target.resource.id
    ) {
      return undefined;
    }
    return {
      type: "session/open-study",
      domainId: target.domain.id,
      chapterRef,
      nodeId: target.node.id,
      resourceId: target.resource.id,
      primaryTechnique,
      startedAt: Date.now(),
    };
  });
  if (!acceptDispatchResult(shared, ctx, result, "Lori: Study Session não iniciada porque não foi possível persistir o snapshot.")) {
    return;
  }
  if (result.status === "unchanged") {
    ctx.ui.notify("Lori: Study Session não iniciada porque o Domain ou Chapter mudou após a confirmação.", "warning");
    return;
  }
  const status = showStatus(ctx, result.state, skin, "session.open");
  ctx.ui.notify(status, "info");
}

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
      ctx.ui.notify(`${status}\nQuestionário salvo; use /lori-curate para solicitar explicitamente uma proposta. O Domain continua em preparação e ainda não está ativo.`, "info");
      return;
    }
    if (draft.phase === "awaiting_approval") {
      const proposal = draft.pendingChapter;
      if (proposal === undefined) {
        ctx.ui.notify("Lori: a proposta pendente está ausente no snapshot; o Domain continua inativo.", "error");
        return;
      }
      ctx.ui.notify(renderChapterProposal(draft, proposal), "info");
      return;
    }
    if (draft.phase === "awaiting_verdict") {
      const isFocusPending = draft.verdictFocus === undefined;
      const score = await promptVerdictScore(
        isFocusPending ? "Focus — informe um número finito" : "Honesty — informe um número finito",
        ctx,
      );
      if (score === undefined) {
        const paused = await dispatchAndPersist(projectDir, (current) => {
          if (current.session?.kind !== "metalearning" || current.session.status !== "open") {
            return undefined;
          }
          return {
            type: "session/abandon",
            pausedAt: selectTransitionAt(current.session, Date.now()),
          };
        });
        if (!acceptDispatchResult(shared, ctx, paused, "Lori: avaliação não pausada porque não foi possível persistir o snapshot.")) {
          return;
        }
        if (paused.status === "persisted") {
          const status = showStatus(ctx, paused.state, skin, "session.paused");
          const pending = isFocusPending ? "Focus" : "Honesty";
          const savedFocus = isFocusPending ? "" : "Focus já salvo; ";
          ctx.ui.notify(`${status}\n${savedFocus}${pending} ainda não foi enviada; use /lori-resume para continuar.`, "info");
        }
        return;
      }

      if (isFocusPending) {
        const saved = await dispatchAndPersist(projectDir, (current) => {
          if (
            current.session?.kind !== "metalearning" ||
            current.session.status !== "open" ||
            current.domainDraft?.id !== draft.id ||
            current.domainDraft.phase !== "awaiting_verdict" ||
            current.domainDraft.verdictFocus !== undefined
          ) {
            return undefined;
          }
          return { type: "domain-draft/save-verdict-focus", id: draft.id, focus: score };
        });
        if (!acceptDispatchResult(shared, ctx, saved, "Lori: Focus não salvo porque não foi possível persistir o snapshot.")) {
          return;
        }
        if (saved.status === "unchanged") {
          ctx.ui.notify("Lori: Focus não foi salvo porque o preparo mudou.", "warning");
          return;
        }
        continue;
      }

      const closed = await dispatchAndPersist(projectDir, (current) => {
        const currentSession = current.session;
        const currentDraft = current.domainDraft;
        if (
          currentSession?.kind !== "metalearning" ||
          currentSession.status !== "open" ||
          currentSession.domainId !== draft.id ||
          currentDraft?.id !== draft.id ||
          currentDraft.phase !== "awaiting_verdict" ||
          currentDraft.verdictFocus === undefined
        ) {
          return undefined;
        }
        const closedAt = selectTransitionAt(currentSession, Date.now());
        if (!Number.isFinite(closedAt)) return undefined;
        return {
          type: "session/close",
          closedAt,
          focus: currentDraft.verdictFocus,
          honesty: score,
        };
      });
      if (!acceptDispatchResult(shared, ctx, closed, "Lori: Verdict não fechado porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (closed.status === "unchanged" || closed.state.session?.kind !== "metalearning" || closed.state.session.status !== "closed") {
        ctx.ui.notify("Lori: Verdict não foi fechado porque a Session ou o Chapter aprovado mudou.", "warning");
        return;
      }
      const status = showStatus(ctx, closed.state, skin);
      ctx.ui.notify(
        `${status}\nVerdict ligado ao Chapter version ${closed.state.session.verdict.chapterRef.chapterVersionId}.`,
        "info",
      );
      await offerRecommendedFirstStudy(shared, ctx, projectDir, skin, closed.state);
      return;
    }

    const field = selectNextDomainDraftField(draft);
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
          pausedAt: selectTransitionAt(current.session, Date.now()),
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

type ChapterApprovalTarget =
  | { kind: "draft"; draft: DomainDraft }
  | { kind: "active"; domain: ActiveDomain };

async function approveChapterProposal(
  target: ChapterApprovalTarget,
  projectDir: string,
  skin: SkinProvider,
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
): Promise<void> {
  const isRecuration = target.kind === "active";
  const id = isRecuration ? target.domain.id : target.draft.id;
  const name = isRecuration ? target.domain.name : target.draft.name ?? "Domain";
  const proposal = isRecuration ? target.domain.pendingChapter : target.draft.pendingChapter;
  if (proposal === undefined) return;
  const currentChapterVersionId = isRecuration ? target.domain.currentChapterVersionId : undefined;
  const draft = isRecuration ? activeDomainDraft(target.domain) : target.draft;
  ctx.ui.notify(renderChapterProposal(draft, proposal, currentChapterVersionId === undefined ? {} : { currentChapterVersionId }), "info");

  const confirmed = await ctx.ui.confirm(
    isRecuration ? `Aprovar uma nova versão do Chapter de ${name}?` : `Aprovar o primeiro Chapter de ${name}?`,
    isRecuration
      ? `A aprovação cria uma versão nova e atualiza a atual. A versão ${currentChapterVersionId} e as referências históricas serão preservadas.`
      : "A aprovação ativa este Domain e salva uma versão do Chapter. A Session de Metalearning continuará aberta aguardando Verdict; nenhuma nota ou XP será lançado agora.",
  );
  if (!confirmed) {
    ctx.ui.notify(isRecuration
      ? "Aprovação cancelada; a proposta pendente permanece intacta e o Chapter atual permanece ativo."
      : "Aprovação cancelada; o draft e a proposta pendente permanecem intactos e o Domain continua inativo.", "info");
    return;
  }

  const result = await dispatchAndPersist(projectDir, (current) => {
    if (shared.projectDir !== projectDir) return undefined;
    if (target.kind === "active") {
      const currentDomain = current.domains.find(({ id: domainId }) => domainId === id);
      if (
        currentDomain === undefined || currentDomain.currentChapterVersionId !== currentChapterVersionId || currentDomain.pendingChapter === undefined ||
        JSON.stringify(currentDomain.pendingChapter) !== JSON.stringify(proposal)
      ) return undefined;
    } else {
      const currentDraft = current.domainDraft;
      if (
        !isMetalearningSession(current.session) || current.session.status !== "open" || current.session.domainId !== id ||
        currentDraft?.id !== id || currentDraft.phase !== "awaiting_approval" || currentDraft.pendingChapter === undefined ||
        JSON.stringify(currentDraft.pendingChapter) !== JSON.stringify(proposal) || current.domains.some(({ id: domainId }) => domainId === id)
      ) return undefined;
    }
    return { type: "domain/approve", id, chapterVersionId: randomUUID(), approvedAt: Date.now() };
  });
  const error = isRecuration
    ? "Lori: Chapter atual não alterado porque não foi possível persistir a aprovação."
    : "Lori: Domain não ativado porque não foi possível persistir a aprovação.";
  if (!acceptDispatchResult(shared, ctx, result, error)) return;
  if (result.status !== "persisted") {
    ctx.ui.notify(isRecuration
      ? "Lori: a proposta ou a versão atual mudou durante a confirmação; nenhuma aprovação foi persistida."
      : "Lori: a proposta ou Session mudou durante a confirmação; nenhuma aprovação foi persistida.", "warning");
    return;
  }

  showStatus(ctx, result.state, skin);
  if (isRecuration) {
    ctx.ui.notify("Nova versão do Chapter aprovada e atualizada; versões anteriores e Verdicts históricos permanecem intactos.", "info");
    return;
  }
  ctx.ui.notify("Domain aprovado e ativo. Informe Focus e Honesty para fechar a Session de Metalearning; nenhuma fórmula de XP será aplicada.", "info");
  await continueDomainPreparation(shared, ctx, projectDir, skin);
}

async function approveActiveDomainChapter(
  domain: ActiveDomain,
  projectDir: string,
  skin: SkinProvider,
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
): Promise<void> {
  return approveChapterProposal({ kind: "active", domain }, projectDir, skin, shared, ctx);
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toolMessage(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], details: { message: text }, isError };
}

function registerChapterCurationTool(api: ExtensionAPI, shared: LoriExtensionState): void {
  registerCurationSourceEvidenceHooks(api, shared.curationRuntime);

  api.registerTool({
    name: "lori_submit_chapter",
    label: "Submit Lori Chapter proposal",
    description: "Submit the structured proposal or explicit research blocker for the current /lori-curate request.",
    promptSnippet: "Submit the researched Chapter proposal through Lori's TypeBox tool",
    promptGuidelines: [
      "Use lori_submit_chapter only for the requestId and domainId in the current /lori-curate message.",
      "For lori_submit_chapter, choose any research tools available in this Pi session; Lori does not impose an allowlist of tool names.",
      "Before submitting a proposal with lori_submit_chapter, ensure each resource's HTTPS URL, exact excerpt, and locator appear together in a successful tool result from the current request and run.",
      "Use lori_submit_chapter with status blocked when no verifiable, compatible sources satisfy the Player's restrictions.",
      "If lori_submit_chapter rejects a submission, treat it as unsaved and explain the specific error; do not present the proposal as free text or relax restrictions.",
    ],
    parameters: chapterCurationToolParameters,
    async execute(_toolCallId, params, _signal, _onUpdate, toolCtx) {
      const projectDir = shared.projectDir;
      const requestId = isRecord(params) && typeof params.requestId === "string" ? params.requestId : undefined;
      const domainId = isRecord(params) && typeof params.domainId === "string" ? params.domainId : undefined;
      const request = requestId === undefined || domainId === undefined
        ? undefined
        : shared.curationRuntime.authorizeSubmission(requestId, domainId);
      if (!request || projectDir === undefined) {
        const message = "Lori recusou o tool: ele não corresponde à request atual de curadoria; nenhuma proposta foi salva.";
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }

      const latest = await dispatchAndPersist(projectDir, () => undefined);
      if (!acceptDispatchResult(shared, toolCtx, latest, "Lori: não foi possível validar o snapshot da curadoria.")) {
        return toolMessage("Lori não conseguiu validar a request atual; nenhuma proposta foi salva.", true);
      }
      const currentDraft = latest.state.domainDraft;
      const currentDomain = latest.state.domains.find(({ id }) => id === request.domainId);
      const isAuthorizedPhase = request.target === "draft"
        ? isMetalearningSession(latest.state.session) && latest.state.session.status === "open" && latest.state.session.domainId === request.domainId && currentDraft?.id === request.domainId && currentDraft.phase === "awaiting_curation"
        : currentDomain !== undefined && currentDomain.currentChapterVersionId === request.expectedCurrentChapterVersionId;
      if (
        !isAuthorizedPhase ||
        shared.projectDir !== projectDir ||
        shared.curationRuntime.authorizeSubmission(request.requestId, request.domainId) === undefined
      ) {
        const message = "Lori recusou o tool: a fase ou a request atual mudou; nenhuma proposta foi salva.";
        toolCtx.ui.notify(message, "warning");
        shared.curationRuntime.clearIfCurrent(request.requestId);
        return toolMessage(message, true);
      }

      if (!Value.Check(chapterCurationToolParameters, params)) {
        const message = "Lori não aceitou a resposta estruturada do tool; ela precisa incluir uma proposta válida ou a razão do bloqueio. Nenhuma proposta foi salva.";
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }
      const submission = params as ChapterCurationToolResult;
      if (submission.result.status === "blocked") {
        const blocker = renderCurationBlocker(submission.result.reason, request.target === "active");
        toolCtx.ui.notify(blocker, "warning");
        shared.curationRuntime.clearIfCurrent(request.requestId);
        return { ...toolMessage(blocker), terminate: true };
      }

      const questionnaire = request.target === "draft"
        ? (currentDraft === null ? undefined : getQuestionnaire(currentDraft))
        : currentDomain?.questionnaire;
      // isAuthorizedPhase already guarantees the target; this check only narrows the questionnaire type.
      if (questionnaire === undefined) {
        const message = "Lori não aceitou a proposta: o alvo da curadoria deixou de existir ou está incompleto. Nenhuma proposta foi salva; envie novamente valores que correspondam à request atual.";
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }

      const acceptance = decideChapterAcceptance(submission.result.proposal, {
        review: "strict",
        questionnaire,
        sourceEvidence: { results: request.sourceEvidence, requestId: request.requestId, agentRunId: request.agentRunId },
      });
      if (!acceptance.ok) {
        if (acceptance.kind === "blocked") {
          const blocker = renderCurationBlocker(acceptance.reason, request.target === "active");
          toolCtx.ui.notify(blocker, "warning");
          shared.curationRuntime.clearIfCurrent(request.requestId);
          return { ...toolMessage(blocker), terminate: true };
        }
        let message: string;
        if (acceptance.kind === "unverified-source") {
          message = `Lori bloqueou a proposta: ${acceptance.reason} Nenhuma proposta foi salva; pesquise a fonte com uma ferramenta host apropriada nesta request.`;
        } else if (acceptance.kind === "mixed") {
          message = "Lori recusou a proposta porque ela mistura recursos compatíveis e incompatíveis. Nenhuma proposta foi salva; envie somente recursos compatíveis, sem relaxar as restrições.";
        } else {
          message = `Lori não aceitou a proposta: ${acceptance.reason} Nenhuma proposta foi salva; corrija a proposta sem relaxar as restrições.`;
        }
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }

      const saved = await dispatchAndPersist(projectDir, (state) => {
        if (
          shared.projectDir !== projectDir ||
          shared.curationRuntime.authorizeSubmission(request.requestId, request.domainId) === undefined
        ) {
          return undefined;
        }
        if (request.target === "draft") {
          const draft = state.domainDraft;
          if (
            state.session?.kind !== "metalearning" ||
            state.session.status !== "open" ||
            state.session.domainId !== request.domainId ||
            draft?.id !== request.domainId ||
            draft.phase !== "awaiting_curation"
          ) {
            return undefined;
          }
          return { type: "domain-draft/propose-chapter", id: draft.id, proposal: acceptance.proposal };
        }
        const domain = state.domains.find(({ id }) => id === request.domainId);
        if (
          domain === undefined ||
          domain.currentChapterVersionId !== request.expectedCurrentChapterVersionId
        ) {
          return undefined;
        }
        return {
          type: "domain/propose-chapter",
          id: domain.id,
          expectedCurrentChapterVersionId: domain.currentChapterVersionId,
          proposal: acceptance.proposal,
        };
      });
      if (!acceptDispatchResult(shared, toolCtx, saved, "Lori: proposta não salva porque não foi possível persistir o snapshot.")) {
        return toolMessage("Lori não conseguiu salvar a proposta; nenhuma aprovação ou ativação ocorreu.", true);
      }
      if (saved.status !== "persisted") {
        const message = "Lori não salvou a proposta porque a fase ou a request atual mudou; use /lori-curate explicitamente para uma nova tentativa.";
        toolCtx.ui.notify(message, "warning");
        return toolMessage(message, true);
      }

      shared.curationRuntime.clearIfCurrent(request.requestId);
      const pendingDomain = request.target === "active"
        ? saved.state.domains.find(({ id }) => id === request.domainId)
        : undefined;
      const pendingDraft = request.target === "draft"
        ? saved.state.domainDraft
        : pendingDomain === undefined ? null : activeDomainDraft(pendingDomain);
      const pending = request.target === "draft"
        ? saved.state.domainDraft?.pendingChapter
        : pendingDomain?.pendingChapter;
      if (pending === undefined || pendingDraft === null || pendingDraft === undefined) {
        const message = "Lori não encontrou a proposta pendente no estado salvo; a versão aprovada permanece ativa.";
        toolCtx.ui.notify(message, "error");
        return toolMessage(message, true);
      }
      if (shared.skin) showStatus(toolCtx, saved.state, shared.skin);
      const presentation = renderChapterProposal(pendingDraft, pending, request.target === "active"
        ? { currentChapterVersionId: request.expectedCurrentChapterVersionId }
        : {});
      toolCtx.ui.notify(presentation, "info");
      return { ...toolMessage(presentation), terminate: true };
    },
  });
}

function startChapterCurationRequest(
  api: ExtensionAPI,
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
  request: {
    requestId: string;
    draft: DomainDraft;
    target: "draft";
  } | {
    requestId: string;
    draft: DomainDraft;
    target: "active";
    currentChapterVersionId: string;
  },
): void {
  shared.curationRuntime.start({
    requestId: request.requestId,
    domainId: request.draft.id,
    target: request.target,
    ...(request.target === "active" ? { expectedCurrentChapterVersionId: request.currentChapterVersionId } : {}),
  });
  try {
    api.sendUserMessage(buildChapterCurationPrompt(
      request.requestId,
      request.draft,
      request.target === "active" ? { currentChapterVersionId: request.currentChapterVersionId } : {},
    ));
  } catch {
    shared.curationRuntime.clearIfCurrent(request.requestId);
    ctx.ui.notify("Lori: não foi possível iniciar a curadoria pelo agent; nenhuma proposta foi salva.", "error");
  }
}

export function registerLoriCommands(api: ExtensionAPI, shared: LoriExtensionState): void {
  registerChapterCurationTool(api, shared);

  api.registerCommand("lori-curate", {
    description: "Solicitar explicitamente uma proposta para um Domain em preparação ou ativo",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) return;
      if (args.trim().length > 0) {
        ctx.ui.notify("Uso: /lori-curate (sem argumentos)", "warning");
        return;
      }
      if (!ctx.isIdle()) {
        ctx.ui.notify("Lori: aguarde o agent terminar a execução atual antes de solicitar a curadoria.", "warning");
        return;
      }

      const latest = await dispatchAndPersist(ready.projectDir, () => undefined);
      if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível consultar o snapshot antes da curadoria.")) return;
      const { state } = latest;
      const draft = state.domainDraft;
      const canCurateDraft = draft?.phase === "awaiting_curation" &&
        isMetalearningSession(state.session) && state.session.status === "open" && state.session.domainId === draft.id;
      const activeDomains = state.domains;
      let selectedDraft: DomainDraft | undefined;
      let selectedDomain: ActiveDomain | undefined;

      if (activeDomains.length === 0) {
        if (draft === null) {
          ctx.ui.notify("Lori: não há Domain ativo ou preparo pronto para curadoria.", "warning");
          return;
        }
        if (draft.phase === "awaiting_approval") {
          ctx.ui.notify("Lori: já existe uma proposta pendente. Ela permanece para revisão; não será substituída automaticamente.", "warning");
          return;
        }
        if (!canCurateDraft) {
          ctx.ui.notify("Lori: retome a Session de Metalearning e conclua o questionário antes de solicitar a curadoria.", "warning");
          return;
        }
        selectedDraft = draft;
      } else {
        const draftOption = canCurateDraft ? `Domain em preparo: ${draft.name ?? draft.id} [${draft.id}]` : undefined;
        const domainOptions = activeDomains.map((domain) => `${domain.name} · ${domain.learningObjective} [${domain.id}]`);
        const options = [...(draftOption === undefined ? [] : [draftOption]), ...domainOptions];
        const selected = await ctx.ui.select("Escolher Domain para re-curar", options);
        if (selected === undefined) return;
        selectedDomain = activeDomains.find((domain) => `${domain.name} · ${domain.learningObjective} [${domain.id}]` === selected);
        if (selectedDomain === undefined && selected === draftOption && canCurateDraft) {
          selectedDraft = draft;
        }
        if (selectedDomain === undefined && selectedDraft === undefined) {
          ctx.ui.notify("Lori: escolha um Domain ativo ou o preparo disponível.", "warning");
          return;
        }
      }

      const requestId = randomUUID();
      if (selectedDomain !== undefined) {
        startChapterCurationRequest(api, shared, ctx, {
          requestId,
          draft: activeDomainDraft(selectedDomain),
          target: "active",
          currentChapterVersionId: selectedDomain.currentChapterVersionId,
        });
        return;
      }

      if (selectedDraft === undefined) {
        return;
      }
      startChapterCurationRequest(api, shared, ctx, {
        requestId,
        draft: selectedDraft,
        target: "draft",
      });
    },
  });

  api.registerCommand("lori-approve", {
    description: "Revisar e aprovar explicitamente uma proposta pendente de Chapter",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) return;
      if (args.trim().length > 0) {
        ctx.ui.notify("Uso: /lori-approve (sem argumentos)", "warning");
        return;
      }

      const { projectDir, skin } = ready;
      const latest = await dispatchAndPersist(projectDir, () => undefined);
      if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível consultar o snapshot antes da aprovação.")) return;
      const { state } = latest;
      const draft = state.domainDraft;
      const session = state.session;
      const draftHasPending = draft?.phase === "awaiting_approval" && draft.pendingChapter !== undefined;
      const activePending = state.domains.filter(({ pendingChapter }) => pendingChapter !== undefined);
      if (activePending.length > 0) {
        const draftOption = draftHasPending ? `First Chapter: ${draft?.name ?? draft?.id} [${draft?.id}]` : undefined;
        const activeOptions = activePending.map((domain) => `Re-curation: ${domain.name} [${domain.id}]`);
        const options = [...(draftOption === undefined ? [] : [draftOption]), ...activeOptions];
        let selected: string;
        if (options.length === 1) {
          selected = options[0]!;
        } else {
          const choice = await ctx.ui.select("Escolher proposta de Chapter para aprovar", options);
          if (choice === undefined) return;
          selected = choice;
        }
        const selectedDomain = activePending.find((domain) => `Re-curation: ${domain.name} [${domain.id}]` === selected);
        if (selectedDomain !== undefined) {
          await approveActiveDomainChapter(selectedDomain, projectDir, skin, shared, ctx);
          return;
        }
        if (selected !== draftOption || !draftHasPending) {
          ctx.ui.notify("Lori: escolha uma proposta pendente para aprovar.", "warning");
          return;
        }
      }
      if (!draftHasPending || draft === null || draft.pendingChapter === undefined) {
        ctx.ui.notify("Lori: não há proposta pendente para aprovar. Nenhum Domain foi ativado.", "warning");
        return;
      }
      if (session?.kind !== "metalearning" || session.domainId !== draft.id || session.status !== "open") {
        ctx.ui.notify("Lori: retome a Session de Metalearning antes de aprovar a proposta.", "warning");
        return;
      }

      await approveChapterProposal({ kind: "draft", draft }, projectDir, skin, shared, ctx);
    },
  });

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

  api.registerCommand("lori-delete", {
    description: "Excluir um Domain ativo ou em preparação com confirmação explícita",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) {
        return;
      }
      if (args.trim().length > 0) {
        ctx.ui.notify("Uso: /lori-delete (selecione um Domain)", "warning");
        return;
      }
      if (!ctx.isIdle() || shared.curationRuntime.current() !== undefined) {
        ctx.ui.notify("Lori: aguarde a curadoria terminar antes de excluir um Domain.", "warning");
        return;
      }

      const { projectDir, skin } = ready;
      const latest = await dispatchAndPersist(projectDir, () => undefined);
      if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível consultar o snapshot antes da exclusão.")) {
        return;
      }
      const state = latest.state;
      const targets: Array<{
        id: string;
        kind: "active" | "draft";
        label: string;
        name: string;
        chapterCount: number;
        hasPendingChapter: boolean;
      }> = state.domains.map((domain) => ({
        id: domain.id,
        kind: "active",
        label: `${domain.name} — ${domain.learningObjective} [${domain.id}]`,
        name: domain.name,
        chapterCount: domain.chapters.length,
        hasPendingChapter: domain.pendingChapter !== undefined,
      }));
      const draft = state.domainDraft;
      if (draft !== null && !state.domains.some(({ id }) => id === draft.id)) {
        targets.push({
          id: draft.id,
          kind: "draft",
          label: `${draft.name ?? "Domain"} — em preparação [${draft.id}]`,
          name: draft.name ?? "Domain em preparação",
          chapterCount: 0,
          hasPendingChapter: draft.pendingChapter !== undefined,
        });
      }
      if (targets.length === 0) {
        ctx.ui.notify("Lori: não há Domain ativo ou em preparação para excluir.", "warning");
        return;
      }

      const selected = await ctx.ui.select("Escolher Domain para excluir", targets.map(({ label }) => label));
      const target = targets.find(({ label }) => label === selected);
      if (target === undefined) {
        return;
      }
      const relatedSessions = [
        ...state.sessionHistory,
        ...(state.session === null ? [] : [state.session]),
      ].filter((session) => selectSessionBelongsToDomain(session, target.id)).length;
      const discardsOpenSession = (
        target.kind === "active" &&
        state.session?.status !== "closed" &&
        selectSessionBelongsToDomain(state.session, target.id)
      );
      const confirmation = target.kind === "active"
        ? [
            `Domain: ${target.name}`,
            `Chapter versions: ${target.chapterCount}`,
            `Proposta pendente: ${target.hasPendingChapter ? "sim" : "não"}`,
            `Sessions/Verdicts associados que serão excluídos: ${relatedSessions}`,
            ...(discardsOpenSession ? ["Session aberta ou pausada será descartada, sem Verdict e sem XP."] : []),
            "Player XP e outros Domains serão preservados.",
            "Esta ação é permanente.",
          ].join("\n")
        : [
            `Domain em preparação: ${target.name}`,
            "Respostas salvas serão excluídas.",
            `Proposta pendente: ${target.hasPendingChapter ? "sim" : "não"}.`,
            `Metalearning Session e Sessions/Verdicts associados: ${relatedSessions}.`,
            "Player XP e outros Domains serão preservados.",
            "Esta ação é permanente.",
          ].join("\n");
      const confirmed = await ctx.ui.confirm(`Excluir ${target.name} permanentemente?`, confirmation);
      if (!confirmed) {
        ctx.ui.notify("Exclusão cancelada; nenhum dado foi alterado.", "info");
        return;
      }

      const result = await dispatchAndPersist(projectDir, () => ({ type: "domain/delete", id: target.id, target: target.kind }));
      if (!acceptDispatchResult(shared, ctx, result, "Lori: Domain não excluído porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        ctx.ui.notify("Lori: o Domain ou sua Session mudou durante a confirmação; nada foi excluído.", "warning");
        return;
      }
      const status = showStatus(ctx, result.state, skin);
      ctx.ui.notify(`Domain ${target.name} e seus dados associados foram excluídos. ${status}`, "info");
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
    description: "Iniciar uma Study Session escolhendo um Domain ativo e uma Primary Technique",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) {
        return;
      }
      const { projectDir, skin } = ready;
      if (args.trim().length > 0) {
        ctx.ui.notify("Uso: /lori-start (sem argumentos; Domain e Primary Technique são escolhidos explicitamente)", "warning");
        return;
      }

      const latest = await dispatchAndPersist(projectDir, () => undefined);
      if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível acessar o snapshot antes de iniciar a Session.")) {
        return;
      }
      const state = latest.state;
      if (state.domainDraft !== null) {
        ctx.ui.notify("O Domain em preparação ainda não está ativo e não pode iniciar uma Study Session.", "warning");
        return;
      }
      if (!selectCanOpenSession(state.session)) {
        const { domain, technique } = sessionPresentation(state);
        ctx.ui.notify(skin.render("session.startRejected", { domain, technique }), "warning");
        return;
      }
      if (state.domains.length === 0) {
        ctx.ui.notify("Nenhum Domain ativo para selecionar; use /lori-init para preparar e aprovar um Domain.", "warning");
        return;
      }

      const domainOptions = state.domains.map(({ id, name, learningObjective }) => `${name} — ${learningObjective} [${id}]`);
      const selectedDomain = await ctx.ui.select("Escolher Domain ativo", domainOptions);
      const domainIndex = domainOptions.indexOf(selectedDomain ?? "");
      const domain = state.domains[domainIndex];
      if (domain === undefined) return;

      const chapterVersionId = domain.currentChapterVersionId;
      const chapterRef = { domainId: domain.id, chapterVersionId };
      const target = selectRecommendedStudyTarget(state.domains, chapterRef);
      if (target === undefined) {
        ctx.ui.notify("Lori: o Domain ativo não tem um primeiro Node com recurso recomendado; Study Session não iniciada.", "error");
        return;
      }
      const primaryTechnique = await promptPrimaryTechnique(ctx);
      if (primaryTechnique === undefined) return;

      const result = await dispatchAndPersist(projectDir, (current) => {
        const currentTarget = selectRecommendedStudyTarget(current.domains, chapterRef);
        if (
          current.domainDraft !== null ||
          !selectCanOpenSession(current.session) ||
          currentTarget?.node.id !== target.node.id ||
          currentTarget.resource.id !== target.resource.id
        ) {
          return undefined;
        }
        return {
          type: "session/open-study",
          domainId: domain.id,
          chapterRef,
          nodeId: target.node.id,
          resourceId: target.resource.id,
          primaryTechnique,
          startedAt: Date.now(),
        };
      });
      if (!acceptDispatchResult(shared, ctx, result, "Lori: Study Session não iniciada porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        ctx.ui.notify("Lori: Study Session não iniciada porque o Domain ou Chapter mudou durante a seleção.", "warning");
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
        if ((session?.kind !== "legacyStudy" && session?.kind !== "study") || (session.status !== "open" && session.status !== "paused")) {
          return undefined;
        }

        const closedAt = selectTransitionAt(session, Date.now());
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
