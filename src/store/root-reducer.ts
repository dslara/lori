import { reduceDomainDraft, isSessionAction } from "../core/domain/reducer.ts";
import type { DomainQuestionnaire } from "../core/domain/types.ts";
import { reducePlayer } from "../core/player/reducer.ts";
import { reduceSession } from "../core/session/reducer.ts";
import type { LoriAction } from "../core/actions.ts";
import type { LoriState } from "./state.ts";

function getQuestionnaire(draft: NonNullable<LoriState["domainDraft"]>): DomainQuestionnaire | undefined {
  if (
    draft.motivation === undefined ||
    draft.deadline === undefined ||
    draft.hoursPerWeek === undefined ||
    draft.baseline === undefined ||
    draft.preferences === undefined ||
    draft.materialRestrictions === undefined
  ) {
    return undefined;
  }
  return {
    motivation: draft.motivation,
    deadline: draft.deadline,
    hoursPerWeek: draft.hoursPerWeek,
    baseline: draft.baseline,
    preferences: draft.preferences,
    materialRestrictions: draft.materialRestrictions,
  };
}

export function rootReducer(state: LoriState, action: LoriAction): LoriState {
  if (
    action.type === "domain-draft/propose-chapter" &&
    (state.session?.kind !== "metalearning" || state.session.status !== "open" || state.session.domainId !== action.id)
  ) {
    return state;
  }
  if (action.type === "domain-draft/save-verdict-focus") {
    const draft = state.domainDraft;
    const session = state.session;
    if (
      draft === null ||
      draft.id !== action.id ||
      draft.phase !== "awaiting_verdict" ||
      draft.verdictFocus !== undefined ||
      !Number.isFinite(action.focus) ||
      session?.kind !== "metalearning" ||
      session.status !== "open" ||
      session.domainId !== draft.id ||
      session.chapterRef === undefined ||
      !state.domains.some((domain) => domain.id === session.domainId && domain.currentChapterVersionId === session.chapterRef?.chapterVersionId)
    ) {
      return state;
    }
  }
  if (action.type === "session/close" && state.session?.kind === "metalearning") {
    const draft = state.domainDraft;
    const session = state.session;
    if (
      session.status !== "open" ||
      session.chapterRef === undefined ||
      draft?.id !== session.domainId ||
      draft.phase !== "awaiting_verdict" ||
      !Number.isFinite(draft.verdictFocus) ||
      !Number.isFinite(action.focus) ||
      !Number.isFinite(action.honesty) ||
      !state.domains.some((domain) => domain.id === session.domainId && domain.currentChapterVersionId === session.chapterRef?.chapterVersionId)
    ) {
      return state;
    }
  }
  if (action.type === "domain/approve") {
    const draft = state.domainDraft;
    if (
      state.session?.kind !== "metalearning" ||
      state.session.status !== "open" ||
      draft === null ||
      draft.id !== action.id ||
      draft.phase !== "awaiting_approval" ||
      draft.pendingChapter === undefined ||
      action.chapterVersionId.trim().length === 0 ||
      !Number.isFinite(action.approvedAt) ||
      getQuestionnaire(draft) === undefined ||
      draft.name === undefined ||
      draft.learningObjective === undefined ||
      state.domains.some(({ id }) => id === draft.id)
    ) {
      return state;
    }
  }
  if (action.type === "session/open-metalearning" && state.domainDraft !== null) {
    return state;
  }
  if (action.type === "session/open" && state.domainDraft !== null) {
    return state;
  }

  const player = reducePlayer(state.player, action);
  const reducedSession = isSessionAction(action) ? reduceSession(state.session, action) : state.session;
  const session = action.type === "domain/approve" && reducedSession?.kind === "metalearning"
    ? { ...reducedSession, chapterRef: { domainId: action.id, chapterVersionId: action.chapterVersionId } }
    : reducedSession;
  let domainDraft = reduceDomainDraft(state.domainDraft, action);
  if (
    action.type === "session/close" &&
    state.session?.kind === "metalearning" &&
    session?.kind === "metalearning" &&
    session.status === "closed"
  ) {
    domainDraft = null;
  }
  let domains = state.domains;
  const draft = state.domainDraft;
  const pendingChapter = draft?.pendingChapter;
  if (action.type === "domain/approve" && draft !== null && pendingChapter !== undefined) {
    const questionnaire = getQuestionnaire(draft);
    if (questionnaire !== undefined && draft.name !== undefined && draft.learningObjective !== undefined) {
      domains = [...state.domains, {
        id: draft.id,
        name: draft.name,
        learningObjective: draft.learningObjective,
        questionnaire,
        status: "active",
        chapters: [{
          id: action.chapterVersionId,
          version: 1,
          approvedAt: action.approvedAt,
          chapter: pendingChapter,
        }],
        currentChapterVersionId: action.chapterVersionId,
      }];
    }
  }
  if (player === state.player && session === state.session && domainDraft === state.domainDraft && domains === state.domains) {
    return state;
  }
  if (action.type === "session/open-metalearning" && (session === state.session || domainDraft === state.domainDraft)) {
    return state;
  }
  let sessionHistory = state.sessionHistory;
  if (
    (action.type === "session/open" || action.type === "session/open-metalearning") &&
    state.session?.status === "closed" &&
    session !== state.session
  ) {
    sessionHistory = [...sessionHistory, state.session];
  }
  return { ...state, player, session, sessionHistory, domainDraft, domains };
}
