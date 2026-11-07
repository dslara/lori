import type { Session, SessionAction } from "../session/types.ts";

export function restoreSessionAsPaused(session: Session | null, restoredAt: number): SessionAction | undefined {
  if (session?.status !== "open" || !Number.isFinite(restoredAt)) {
    return undefined;
  }

  const earliestPauseAt = session.startedAt + session.totalPausedMs;
  if (!Number.isFinite(earliestPauseAt)) {
    return undefined;
  }

  return { type: "session/abandon", pausedAt: Math.max(restoredAt, earliestPauseAt) };
}
