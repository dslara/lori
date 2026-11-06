import type { Session } from "./types.ts";

export function selectElapsedMs(session: Session, now: number): number {
  return Math.max(0, now - session.startedAt);
}
