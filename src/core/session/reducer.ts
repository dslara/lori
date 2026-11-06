import type { Session, SessionAction } from "./types.ts";

export function reduceSession(state: Session | null, action: SessionAction): Session | null {
  if (action.type === "session/open") {
    if (state !== null && state.status !== "closed") return state;
    if (
      typeof action.domain !== "string" || action.domain.trim().length === 0 ||
      typeof action.primaryTechnique !== "string" || action.primaryTechnique.trim().length === 0 ||
      !Number.isFinite(action.startedAt)
    ) {
      return state;
    }

    return {
      status: "open",
      domain: action.domain,
      primaryTechnique: action.primaryTechnique,
      startedAt: action.startedAt,
      totalPausedMs: 0,
    };
  }

  if (action.type === "session/abandon") {
    if (state?.status !== "open" || !Number.isFinite(action.pausedAt)) return state;
    if (action.pausedAt < state.startedAt + state.totalPausedMs) return state;

    return {
      ...state,
      status: "paused",
      pausedAt: action.pausedAt,
    };
  }

  if (action.type === "session/resume") {
    if (state?.status !== "paused" || !Number.isFinite(action.resumedAt)) return state;
    if (action.resumedAt < state.pausedAt) return state;

    return {
      status: "open",
      domain: state.domain,
      primaryTechnique: state.primaryTechnique,
      startedAt: state.startedAt,
      totalPausedMs: state.totalPausedMs + action.resumedAt - state.pausedAt,
    };
  }

  if (
    (state?.status !== "open" && state?.status !== "paused") ||
    !Number.isFinite(action.closedAt) ||
    !Number.isFinite(action.focus) ||
    !Number.isFinite(action.honesty)
  ) {
    return state;
  }

  const earliestCloseAt = state.status === "open"
    ? state.startedAt + state.totalPausedMs
    : state.pausedAt;
  if (action.closedAt < earliestCloseAt) return state;

  return {
    status: "closed",
    domain: state.domain,
    primaryTechnique: state.primaryTechnique,
    startedAt: state.startedAt,
    totalPausedMs: state.totalPausedMs,
    closedAt: action.closedAt,
    ...(state.status === "paused" ? { pausedAt: state.pausedAt } : {}),
    verdict: { focus: action.focus, honesty: action.honesty },
  };
}
