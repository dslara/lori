import { describe, it, expect } from "vitest";
import { elapsedSec, remainingSec, isStale, formatRemaining } from "../.pi/extensions/lori/core/session-clock";

describe("SessionClock", () => {
  const now = 1_000_000_000;

  it("elapsedSec calculates seconds since start", () => {
    const session = { domainId: "x", startedAt: new Date(now - 5000).toISOString(), plannedDurationSec: 60 };
    expect(elapsedSec(session, now)).toBe(5);
  });

  it("remainingSec subtracts elapsed from planned", () => {
    const session = { domainId: "x", startedAt: new Date(now - 5000).toISOString(), plannedDurationSec: 60 };
    expect(remainingSec(session, 60, now)).toBe(55);
  });

  it("remainingSec goes negative in overtime", () => {
    const session = { domainId: "x", startedAt: new Date(now - 120_000).toISOString(), plannedDurationSec: 60 };
    expect(remainingSec(session, 60, now)).toBe(-60);
  });

  it("isStale true when older than threshold", () => {
    const session = { domainId: "x", startedAt: new Date(now - 31 * 60 * 1000).toISOString(), plannedDurationSec: 60 };
    expect(isStale(session, 30, now)).toBe(true);
  });

  it("isStale false when within threshold", () => {
    const session = { domainId: "x", startedAt: new Date(now - 29 * 60 * 1000).toISOString(), plannedDurationSec: 60 };
    expect(isStale(session, 30, now)).toBe(false);
  });

  it("formatRemaining formats positive time", () => {
    expect(formatRemaining(125)).toBe("02:05");
  });

  it("formatRemaining formats negative time", () => {
    expect(formatRemaining(-125)).toBe("-02:05");
  });

  it("formatRemaining zero-pads single digits", () => {
    expect(formatRemaining(61)).toBe("01:01");
    expect(formatRemaining(9)).toBe("00:09");
  });
});
