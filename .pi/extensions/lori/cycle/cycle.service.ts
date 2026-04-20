/**
 * Lori learning cycle state machine service
 * idle → pre-session → in-session → post-session
 * Reconstructible from events — no global state.
 */

import { CycleState } from "./cycle.model";
import { LoriEvents } from "../events/events.model";

export function getCycleFromEvents(
  events: Array<Pick<LoriEvents, "type" | "timestamp" | "data">>,
): CycleState {
  const cycle: CycleState = { phase: "idle" };
  for (const ev of events) {
    switch (ev.type) {
      case LoriEvents.SESSION_STARTED: {
        cycle.phase = "pre-session";
        cycle.module = ev.data.module as string;
        cycle.technique = ev.data.technique as string;
        cycle.objective = ev.data.objective as string;
        cycle.startedAt = ev.timestamp;
        break;
      }
      case LoriEvents.TIMER_STARTED: {
        cycle.phase = "in-session";
        cycle.timerStartedAt = ev.timestamp;
        cycle.timerDuration = ev.data.durationMinutes as number;
        if (ev.data.module) cycle.module = ev.data.module as string;
        if (ev.data.technique) cycle.technique = ev.data.technique as string;
        break;
      }
      case LoriEvents.TIMER_ENDED:
        cycle.timerStartedAt = undefined;
        cycle.timerDuration = undefined;
        break;
      case LoriEvents.SESSION_ENDED:
        cycle.phase = "idle";
        cycle.timerStartedAt = undefined;
        cycle.timerDuration = undefined;
        break;
    }
  }
  return cycle;
}

export class CycleService {
  private _cycle: CycleState = { phase: "idle" };

  restoreFromEvents(events: Array<Pick<LoriEvents, "type" | "timestamp" | "data">>): void {
    this._cycle = getCycleFromEvents(events);
  }

  getCycle(): CycleState {
    return { ...this._cycle };
  }

  reset(): void {
    this._cycle = { phase: "idle" };
  }

  startPreSession(module: string, technique: string, objective?: string): void {
    this._cycle = {
      phase: "pre-session",
      module,
      technique,
      objective,
      startedAt: Date.now(),
    };
  }

  startInSession(objective?: string): void {
    this._cycle = {
      ...this._cycle,
      phase: "in-session",
      objective: objective ?? this._cycle.objective,
    };
  }

  startTimer(durationMinutes: number): void {
    this._cycle = {
      ...this._cycle,
      phase: "in-session",
      timerStartedAt: Date.now(),
      timerDuration: durationMinutes,
    };
  }

  stopTimer(): void {
    this._cycle = {
      ...this._cycle,
      timerStartedAt: undefined,
      timerDuration: undefined,
    };
  }

  getTimerRemaining(): number | null {
    if (!this._cycle.timerStartedAt || !this._cycle.timerDuration) return null;
    const elapsed = Math.floor((Date.now() - this._cycle.timerStartedAt) / 60000);
    return Math.max(0, this._cycle.timerDuration - elapsed);
  }

  isTimerExpired(): boolean {
    const remaining = this.getTimerRemaining();
    return remaining !== null && remaining <= 0;
  }

  startPostSession(): void {
    this._cycle = {
      ...this._cycle,
      phase: "post-session",
    };
  }

  getElapsedMinutes(): number {
    if (!this._cycle.startedAt) return 0;
    return Math.floor((Date.now() - this._cycle.startedAt) / 60000);
  }
}
