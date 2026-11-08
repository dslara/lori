import type { Session } from "./types.ts";

export function selectCanOpenSession(session: Session | null): boolean {
  return session === null || session.status === "closed";
}

export function selectElapsedMs(session: Session, now: number): number {
  if (session.status === "closed") {
    const elapsedUntil = session.pausedAt ?? session.closedAt;
    return Math.max(0, elapsedUntil - session.startedAt - session.totalPausedMs);
  }
  const elapsedUntil = session.status === "open" ? now : session.pausedAt;
  return Math.max(0, elapsedUntil - session.startedAt - session.totalPausedMs);
}
