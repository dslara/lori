import type { SessionPort, TimerPort, DomainPort } from "./ports";
import type { ActiveSession } from "./types";
import * as SessionClock from "./session-clock";

export type StartResult =
  | { ok: true }
  | { ok: false; reason: "active_session" | "no_domains" }
  | { ok: false; reason: "needs_selection"; domains: { slug: string; name: string }[] };

export type EndResult =
  | { ok: true; elapsedSec: number; domainId: string; plannedDurationSec: number }
  | { ok: false; reason: "no_active_session" };

export class StudyLifecycle {
  private activeSession: ActiveSession | null = null;

  constructor(
    private session: SessionPort,
    private timer: TimerPort,
    private domain: DomainPort,
    private renderTimer: (text: string) => void,
    private plannedDurationSec = 1500
  ) {
    this.timer.onTick((remaining) => {
      this.renderTimer(
        `${SessionClock.formatRemaining(remaining)} | ${this.activeSession?.domainId ?? ""}`
      );
    });
  }

  async start(domainId?: string): Promise<StartResult> {
    const raw = await this.session.load();
    if (raw && !SessionClock.isStale(raw)) {
      return { ok: false, reason: "active_session" };
    }
    if (raw && SessionClock.isStale(raw)) {
      await this.session.clear();
    }

    let resolvedId = domainId;
    if (!resolvedId) {
      const domains = await this.domain.list();
      if (domains.length === 0) {
        return { ok: false, reason: "no_domains" };
      }
      if (domains.length === 1) {
        resolvedId = domains[0].slug;
      } else {
        return { ok: false, reason: "needs_selection", domains };
      }
    }

    await this.session.start(resolvedId, this.plannedDurationSec);
    this.activeSession = {
      domainId: resolvedId,
      startedAt: new Date().toISOString(),
      plannedDurationSec: this.plannedDurationSec,
    };
    this.timer.start(this.plannedDurationSec);
    return { ok: true };
  }

  async end(): Promise<EndResult> {
    this.timer.stop();
    const raw = await this.session.load();
    if (!raw) {
      return { ok: false, reason: "no_active_session" };
    }

    const elapsedSec = SessionClock.elapsedSec(raw);
    const { domainId, plannedDurationSec } = raw;
    this.activeSession = null;
    await this.session.clear();
    this.renderTimer("");
    return { ok: true, elapsedSec, domainId, plannedDurationSec };
  }

  async reconstruct(): Promise<boolean> {
    const raw = await this.session.load();
    if (!raw || SessionClock.isStale(raw)) {
      if (raw) await this.session.clear();
      return false;
    }
    this.activeSession = raw;
    const remaining = SessionClock.remainingSec(raw, raw.plannedDurationSec);
    this.timer.start(remaining);
    return true;
  }

  async isActive(): Promise<boolean> {
    const raw = await this.session.load();
    if (!raw || SessionClock.isStale(raw)) {
      if (raw) await this.session.clear();
      return false;
    }
    return true;
  }
}
