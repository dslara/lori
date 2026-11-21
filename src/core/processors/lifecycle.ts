import { selectTransitionAt } from "../session/selectors.ts";
import type { Session, SessionAction } from "../session/types.ts";

export function restoreSessionAsPaused(session: Session | null, restoredAt: number): SessionAction | undefined {
  if (session?.status !== "open" || !Number.isFinite(restoredAt)) {
    return undefined;
  }

  const pausedAt = selectTransitionAt(session, restoredAt);
  if (!Number.isFinite(pausedAt)) {
    return undefined;
  }

  return { type: "session/abandon", pausedAt };
}
