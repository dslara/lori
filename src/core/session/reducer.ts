import { selectCanOpenSession, selectEarliestTransitionAt } from "./selectors.ts";
import type { Session, SessionAction } from "./types.ts";

export function reduceSession(state: Session | null, action: SessionAction): Session | null {
  if (action.type === "session/open-metalearning") {
    if (!selectCanOpenSession(state) || action.domainId.trim().length === 0 || !Number.isFinite(action.startedAt)) {
      return state;
    }
    return {
      kind: "metalearning",
      status: "open",
      domainId: action.domainId,
      startedAt: action.startedAt,
      totalPausedMs: 0,
    };
  }

  if (action.type === "session/open-study") {
    if (
      !selectCanOpenSession(state) ||
      action.domainId.trim().length === 0 ||
      action.chapterRef.domainId !== action.domainId ||
      action.chapterRef.chapterVersionId.trim().length === 0 ||
      action.nodeId.trim().length === 0 ||
      action.resourceId.trim().length === 0 ||
      action.primaryTechnique.trim().length === 0 ||
      !Number.isFinite(action.startedAt)
    ) {
      return state;
    }
    return {
      kind: "study",
      status: "open",
      domainId: action.domainId,
      chapterRef: action.chapterRef,
      nodeId: action.nodeId,
      resourceId: action.resourceId,
      primaryTechnique: action.primaryTechnique,
      startedAt: action.startedAt,
      totalPausedMs: 0,
    };
  }

  if (action.type === "session/open") {
    if (!selectCanOpenSession(state)) {
      return state;
    }
    if (
      typeof action.domain !== "string" ||
      action.domain.trim().length === 0 ||
      typeof action.primaryTechnique !== "string" ||
      action.primaryTechnique.trim().length === 0 ||
      !Number.isFinite(action.startedAt)
    ) {
      return state;
    }

    return {
      kind: "legacyStudy",
      status: "open",
      name: action.domain,
      primaryTechnique: action.primaryTechnique,
      startedAt: action.startedAt,
      totalPausedMs: 0,
    };
  }

  if (action.type === "session/abandon") {
    if (state?.status !== "open" || !Number.isFinite(action.pausedAt)) {
      return state;
    }
    if (action.pausedAt < selectEarliestTransitionAt(state)) {
      return state;
    }

    return {
      ...state,
      status: "paused",
      pausedAt: action.pausedAt,
    };
  }

  if (action.type === "session/resume") {
    if (state?.status !== "paused" || !Number.isFinite(action.resumedAt)) {
      return state;
    }
    if (action.resumedAt < selectEarliestTransitionAt(state)) {
      return state;
    }

    const { pausedAt: _pausedAt, ...details } = state;
    return {
      ...details,
      status: "open",
      totalPausedMs: state.totalPausedMs + action.resumedAt - state.pausedAt,
    };
  }

  if (
    state === null ||
    (state.status !== "open" && state.status !== "paused") ||
    !Number.isFinite(action.closedAt) ||
    !Number.isFinite(action.focus) ||
    !Number.isFinite(action.honesty) ||
    (state.kind === "metalearning" && state.chapterRef === undefined)
  ) {
    return state;
  }

  if (action.closedAt < selectEarliestTransitionAt(state)) {
    return state;
  }

  if (state.kind === "legacyStudy") {
    return {
      kind: state.kind,
      status: "closed",
      name: state.name,
      primaryTechnique: state.primaryTechnique,
      startedAt: state.startedAt,
      totalPausedMs: state.totalPausedMs,
      closedAt: action.closedAt,
      ...(state.status === "paused" ? { pausedAt: state.pausedAt } : {}),
      verdict: { focus: action.focus, honesty: action.honesty },
    };
  }

  if (state.kind === "study") {
    const chapterRef = state.chapterRef;
    return {
      kind: state.kind,
      status: "closed",
      domainId: state.domainId,
      chapterRef,
      nodeId: state.nodeId,
      resourceId: state.resourceId,
      primaryTechnique: state.primaryTechnique,
      startedAt: state.startedAt,
      totalPausedMs: state.totalPausedMs,
      closedAt: action.closedAt,
      ...(state.status === "paused" ? { pausedAt: state.pausedAt } : {}),
      verdict: { focus: action.focus, honesty: action.honesty, chapterRef },
    };
  }

  const chapterRef = state.chapterRef;
  if (chapterRef === undefined) return state;
  return {
    kind: state.kind,
    status: "closed",
    domainId: state.domainId,
    startedAt: state.startedAt,
    totalPausedMs: state.totalPausedMs,
    chapterRef,
    closedAt: action.closedAt,
    ...(state.status === "paused" ? { pausedAt: state.pausedAt } : {}),
    verdict: { focus: action.focus, honesty: action.honesty, chapterRef },
  };
}
