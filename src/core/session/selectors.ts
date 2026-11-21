import type { Session } from "./types.ts";

export function isMetalearningSession(session: Session | null | undefined): session is Extract<Session, { kind: "metalearning" }> {
  return session?.kind === "metalearning";
}

export function selectCanOpenSession(session: Session | null): boolean {
  return session === null || session.status === "closed";
}

export function selectSessionBelongsToDomain(session: Session | null | undefined, domainId: string): boolean {
  return session !== null && session !== undefined && "domainId" in session && session.domainId === domainId;
}

export function selectElapsedMs(session: Session, now: number): number {
  if (session.status === "closed") {
    const elapsedUntil = session.pausedAt ?? session.closedAt;
    return Math.max(0, elapsedUntil - session.startedAt - session.totalPausedMs);
  }
  const elapsedUntil = session.status === "open" ? now : session.pausedAt;
  return Math.max(0, elapsedUntil - session.startedAt - session.totalPausedMs);
}

// Earliest timestamp a transition from the current status may carry.
export function selectEarliestTransitionAt(session: Extract<Session, { status: "open" | "paused" }>): number {
  return session.status === "open" ? session.startedAt + session.totalPausedMs : session.pausedAt;
}

// Stamps a transition with `now`, never before the earliest valid timestamp (clock rollback).
export function selectTransitionAt(session: Extract<Session, { status: "open" | "paused" }>, now: number): number {
  return Math.max(now, selectEarliestTransitionAt(session));
}
