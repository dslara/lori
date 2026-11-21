import type { LoriAction } from "../actions.ts";
import { reduceSession } from "../session/reducer.ts";
import { isMetalearningSession, selectCanOpenSession, selectSessionBelongsToDomain } from "../session/selectors.ts";
import type { Session } from "../session/types.ts";
import { validateChapterProposal, validateProposalForQuestionnaire } from "./chapter.ts";
import { selectRecommendedStudyTarget } from "./selectors.ts";
import { reduceDomainDraft, isSessionAction } from "./reducer.ts";
import type { ActiveDomain, DomainDraft, DomainQuestionnaire } from "./types.ts";

export type DomainSessionState = {
  domains: ActiveDomain[];
  domainDraft: DomainDraft | null;
  session: Session | null;
  sessionHistory: Session[];
};

function getQuestionnaire(draft: DomainDraft): DomainQuestionnaire | undefined {
  if (
    draft.motivation === undefined || draft.deadline === undefined || draft.hoursPerWeek === undefined ||
    draft.baseline === undefined || draft.preferences === undefined || draft.materialRestrictions === undefined
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

function isInitialApproval(state: DomainSessionState, action: LoriAction): boolean {
  return action.type === "domain/approve" && state.domainDraft?.id === action.id && state.domainDraft.phase === "awaiting_approval";
}

function isAllowed(state: DomainSessionState, action: LoriAction): boolean {
  if (
    (action.type === "session/open" || action.type === "session/open-metalearning" || action.type === "session/open-study") &&
    !selectCanOpenSession(state.session)
  ) return false;

  if (action.type === "domain/delete") {
    const domainExists = state.domains.some(({ id }) => id === action.id);
    const draftExists = !domainExists && state.domainDraft?.id === action.id;
    const session = state.session;
    if (action.target === "draft") {
      if (!draftExists) {
        return false;
      }
      if (session?.status === "open" || session?.status === "paused") {
        return isMetalearningSession(session) && session.domainId === action.id;
      }
      return true;
    }
    return domainExists;
  }

  if (
    action.type === "domain-draft/propose-chapter" &&
    (!isMetalearningSession(state.session) || state.session.status !== "open" || state.session.domainId !== action.id)
  ) return false;

  if (action.type === "domain/propose-chapter") {
    const domain = state.domains.find(({ id }) => id === action.id);
    const validation = validateChapterProposal(action.proposal);
    if (
      domain === undefined || domain.currentChapterVersionId !== action.expectedCurrentChapterVersionId ||
      !validation.ok || validateProposalForQuestionnaire(validation.proposal, domain.questionnaire) !== undefined
    ) return false;
  }

  if (action.type === "domain-draft/save-verdict-focus") {
    const draft = state.domainDraft;
    const session = state.session;
    if (
      draft === null || draft.id !== action.id || draft.phase !== "awaiting_verdict" || draft.verdictFocus !== undefined ||
      !Number.isFinite(action.focus) || !isMetalearningSession(session) || session.status !== "open" ||
      session.domainId !== draft.id || session.chapterRef === undefined ||
      !state.domains.some((domain) => domain.id === session.domainId && domain.chapters.some(({ id }) => id === session.chapterRef?.chapterVersionId))
    ) return false;
  }

  if (action.type === "session/close" && isMetalearningSession(state.session)) {
    const draft = state.domainDraft;
    const session = state.session;
    if (
      session.status !== "open" || session.chapterRef === undefined || draft?.id !== session.domainId ||
      draft.phase !== "awaiting_verdict" || !Number.isFinite(draft.verdictFocus) ||
      !Number.isFinite(action.focus) || !Number.isFinite(action.honesty) ||
      !state.domains.some((domain) => domain.id === session.domainId && domain.chapters.some(({ id }) => id === session.chapterRef?.chapterVersionId))
    ) return false;
  }

  if (action.type === "domain/approve") {
    if (isInitialApproval(state, action)) {
      const draft = state.domainDraft;
      if (
        !isMetalearningSession(state.session) || state.session.status !== "open" || draft?.pendingChapter === undefined ||
        action.chapterVersionId.trim().length === 0 || !Number.isFinite(action.approvedAt) ||
        getQuestionnaire(draft) === undefined || draft.name === undefined || draft.learningObjective === undefined ||
        state.domains.some(({ id }) => id === draft.id)
      ) return false;
    } else {
      const domain = state.domains.find(({ id }) => id === action.id);
      if (
        domain?.pendingChapter === undefined || action.chapterVersionId.trim().length === 0 ||
        domain.chapters.some(({ id }) => id === action.chapterVersionId) || !Number.isFinite(action.approvedAt)
      ) return false;
    }
  }

  if ((action.type === "session/open-metalearning" || action.type === "session/open") && state.domainDraft !== null) return false;

  if (action.type === "session/open-study") {
    const target = selectRecommendedStudyTarget(state.domains, action.chapterRef);
    if (
      state.domainDraft !== null || target === undefined || action.chapterRef.domainId !== action.domainId ||
      target.domain.id !== action.domainId || target.node.id !== action.nodeId || target.resource.id !== action.resourceId
    ) return false;
  }

  return true;
}

export function reduceDomainSessionState(state: DomainSessionState, action: LoriAction): DomainSessionState {
  if (!isAllowed(state, action)) return state;

  if (action.type === "domain/delete") {
    return {
      domains: action.target === "active" ? state.domains.filter(({ id }) => id !== action.id) : state.domains,
      domainDraft: state.domainDraft?.id === action.id ? null : state.domainDraft,
      session: selectSessionBelongsToDomain(state.session, action.id) ? null : state.session,
      sessionHistory: state.sessionHistory.filter((session) => !selectSessionBelongsToDomain(session, action.id)),
    };
  }

  const reducedSession = isSessionAction(action) ? reduceSession(state.session, action) : state.session;
  const initialApproval = isInitialApproval(state, action);
  const session = action.type === "domain/approve" && initialApproval && isMetalearningSession(reducedSession)
    ? { ...reducedSession, chapterRef: { domainId: action.id, chapterVersionId: action.chapterVersionId } }
    : reducedSession;
  let domainDraft = reduceDomainDraft(state.domainDraft, action);
  if (action.type === "session/close" && isMetalearningSession(state.session) && isMetalearningSession(session) && session.status === "closed") {
    domainDraft = null;
  }

  let domains = state.domains;
  const draft = state.domainDraft;
  if (action.type === "domain/approve" && initialApproval && draft?.pendingChapter !== undefined) {
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
          chapter: draft.pendingChapter,
        }],
        currentChapterVersionId: action.chapterVersionId,
      }];
    }
  } else if (action.type === "domain/propose-chapter") {
    domains = state.domains.map((domain) => domain.id === action.id ? { ...domain, pendingChapter: action.proposal } : domain);
  } else if (action.type === "domain/approve") {
    domains = state.domains.map((domain) => {
      if (domain.id !== action.id || domain.pendingChapter === undefined) return domain;
      const { pendingChapter, ...approvedDomain } = domain;
      const nextVersion = Math.max(...domain.chapters.map(({ version }) => version)) + 1;
      return {
        ...approvedDomain,
        chapters: [...domain.chapters, {
          id: action.chapterVersionId,
          version: nextVersion,
          approvedAt: action.approvedAt,
          chapter: pendingChapter,
        }],
        currentChapterVersionId: action.chapterVersionId,
      };
    });
  }

  if (domains === state.domains && domainDraft === state.domainDraft && session === state.session) return state;
  let sessionHistory = state.sessionHistory;
  if (
    (action.type === "session/open" || action.type === "session/open-metalearning" || action.type === "session/open-study") &&
    state.session?.status === "closed" && session !== state.session
  ) sessionHistory = [...sessionHistory, state.session];
  return { domains, domainDraft, session, sessionHistory };
}
