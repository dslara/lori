import type { Session, SessionAction } from "../session/types.ts";

export function restoreSessionAsPaused(session: Session | null, restoredAt: number): SessionAction | undefined {
  if (
    session?.status !== "open" ||
    !Number.isFinite(restoredAt) ||
    restoredAt < session.startedAt + session.totalPausedMs
  ) {
    return undefined;
  }
  return { type: "session/abandon", pausedAt: restoredAt };
}
