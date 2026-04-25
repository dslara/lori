import type { TimerPort } from "../core/ports";

export class NodeTimerAdapter implements TimerPort {
  private cb: ((remainingSec: number) => void) | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private startedAt: number = 0;
  private plannedDurationSec: number = 0;

  onTick(cb: (remainingSec: number) => void): void {
    this.cb = cb;
  }

  start(plannedDurationSec: number): void {
    this.stop();
    this.plannedDurationSec = plannedDurationSec;
    this.startedAt = Date.now();
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
    if (!this.cb) return;
    const elapsedSec = Math.floor((Date.now() - this.startedAt) / 1000);
    const remaining = this.plannedDurationSec - elapsedSec;
    this.cb(remaining);
  }
}
