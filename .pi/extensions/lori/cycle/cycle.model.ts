/**
 * Lori learning cycle state machine types
 */

export type CyclePhase = "idle" | "pre-session" | "in-session" | "post-session";

export interface CycleState {
  phase: CyclePhase;
  module?: string;
  technique?: string;
  startedAt?: number;
  objective?: string;
  timerStartedAt?: number;
  timerDuration?: number;
}
