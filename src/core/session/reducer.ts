import type { Session, SessionAction } from "./types.ts";

export function reduceSession(state: Session | null, action: SessionAction): Session | null {
  if (state !== null) return state;
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
  };
}
