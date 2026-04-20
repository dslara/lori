/**
 * Lori event model
 */

export const LoriEvents = {
  PLAN_CREATED: "plan_created",
  SESSION_STARTED: "session_started",
  SESSION_ENDED: "session_ended",
  TIMER_STARTED: "timer_started",
  TIMER_ENDED: "timer_ended",
  CONCEPT_LEARNED: "concept_learned",
  DRILL_COMPLETED: "drill_completed",
  FEYNMAN_DONE: "feynman_done",
  WEAKNESS_IDENTIFIED: "weakness_identified",
  WEAKNESS_ADDED: "weakness_added",
  WEAKNESS_RESOLVED: "weakness_resolved",
  RESOURCE_CURATED: "resource_curated",
  RESOURCE_ADDED: "resource_added",
  RETRO_DONE: "retro_done",
  STREAK_BROKEN: "streak_broken",
  MODULE_COMPLETED: "module_completed",
  MODULE_CREATED: "module_created",
  SESSION_MINUTES: "session_minutes",
  FILE_MUTATED: "file_mutated",
} as const;

export type LoriEventType = (typeof LoriEvents)[keyof typeof LoriEvents];

export interface LoriEvents {
  type: LoriEventType | string;
  timestamp: number;
  data: Record<string, unknown>;
}
