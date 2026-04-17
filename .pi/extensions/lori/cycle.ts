/**
 * Lori learning cycle state machine
 * idle → pre-session → in-session → post-session
 * Reconstructible from events — no global state.
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

export function getCycleFromEvents(events: Array<{ type: string; timestamp: number; data: Record<string, unknown> }>): CycleState {
  const cycle: CycleState = { phase: "idle" };
  for (const ev of events) {
    switch (ev.type) {
      case "session_started": {
        cycle.phase = "pre-session";
        cycle.module = ev.data.module as string;
        cycle.technique = ev.data.technique as string;
        cycle.objective = ev.data.objective as string;
        cycle.startedAt = ev.timestamp;
        break;
      }
      case "timer_started": {
        cycle.phase = "in-session";
        cycle.timerStartedAt = ev.timestamp;
        cycle.timerDuration = ev.data.durationMinutes as number;
        if (ev.data.module) cycle.module = ev.data.module as string;
        if (ev.data.technique) cycle.technique = ev.data.technique as string;
        break;
      }
      case "timer_ended":
        cycle.timerStartedAt = undefined;
        cycle.timerDuration = undefined;
        break;
      case "session_ended":
        cycle.phase = "idle";
        cycle.timerStartedAt = undefined;
        cycle.timerDuration = undefined;
        break;
    }
  }
  return cycle;
}

// Mutable in-memory cycle for quick access during current session.
// Reconstructed from events on session_start.
let _cycle: CycleState = { phase: "idle" };

export function restoreCycleFromEvents(events: Array<{ type: string; timestamp: number; data: Record<string, unknown> }>): void {
  _cycle = getCycleFromEvents(events);
}

export function getCycle(): CycleState {
  return { ..._cycle };
}

export function resetCycle(): void {
  _cycle = { phase: "idle" };
}

export function startPreSession(module: string, technique: string, objective?: string): void {
  _cycle = {
    phase: "pre-session",
    module,
    technique,
    objective,
    startedAt: Date.now(),
  };
}

export function startInSession(objective?: string): void {
  _cycle = {
    ..._cycle,
    phase: "in-session",
    objective: objective ?? _cycle.objective,
  };
}

export function startTimer(durationMinutes: number): void {
  _cycle = {
    ..._cycle,
    phase: "in-session",
    timerStartedAt: Date.now(),
    timerDuration: durationMinutes,
  };
}

export function stopTimer(): void {
  _cycle = {
    ..._cycle,
    timerStartedAt: undefined,
    timerDuration: undefined,
  };
}

export function getTimerRemaining(): number | null {
  if (!_cycle.timerStartedAt || !_cycle.timerDuration) return null;
  const elapsed = Math.floor((Date.now() - _cycle.timerStartedAt) / 60000);
  return Math.max(0, _cycle.timerDuration - elapsed);
}

export function isTimerExpired(): boolean {
  const remaining = getTimerRemaining();
  return remaining !== null && remaining <= 0;
}

export function startPostSession(): void {
  _cycle = {
    ..._cycle,
    phase: "post-session",
  };
}

export function getElapsedMinutes(): number {
  if (!_cycle.startedAt) return 0;
  return Math.floor((Date.now() - _cycle.startedAt) / 60000);
}
