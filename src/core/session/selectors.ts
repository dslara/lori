import type { Session } from "./types.ts";

export function selectElapsedMs(session: Session, now: number): number {
  const elapsedUntil = session.status === "open" ? now : session.pausedAt;
  return Math.max(0, elapsedUntil - session.startedAt - session.totalPausedMs);
}
