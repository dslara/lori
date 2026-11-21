import { describe, expect, test } from "bun:test";
import { selectElapsedMs, selectTransitionAt } from "./selectors.ts";
import { reduceSession } from "./reducer.ts";
import type { Session } from "./session.types.ts";

describe("Session core", () => {
  test("opens one Session with its starting timestamp and derives elapsed time", () => {
    const session = reduceSession(null, {
      type: "session/open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
    });

    expect(session).toEqual({
      kind: "legacyStudy",
      status: "open",
      name: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
      totalPausedMs: 0,
    });
    expect(selectElapsedMs(session!, 3_500)).toBe(2_500);
  });

  test("does not create a Session from invalid domain, technique, or timestamp data", () => {
    expect(reduceSession(null, {
      type: "session/open",
      domain: "   ",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
    })).toBeNull();
    expect(reduceSession(null, {
      type: "session/open",
      domain: "React",
      primaryTechnique: "  ",
      startedAt: 1_000,
    })).toBeNull();
    expect(reduceSession(null, {
      type: "session/open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: Number.NaN,
    })).toBeNull();
  });

  test("abandons an open Session and excludes the paused duration from elapsed", () => {
    const opened = reduceSession(null, {
      type: "session/open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
    });
    const paused = reduceSession(opened, {
      type: "session/abandon",
      pausedAt: 4_000,
    });

    expect(paused).toEqual({
      kind: "legacyStudy",
      status: "paused",
      name: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
      totalPausedMs: 0,
      pausedAt: 4_000,
    });
    expect(selectElapsedMs(paused!, 9_000)).toBe(3_000);
  });

  test("resumes a paused Session without adding pause duration to elapsed", () => {
    const opened = reduceSession(null, {
      type: "session/open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
    });
    const paused = reduceSession(opened, {
      type: "session/abandon",
      pausedAt: 4_000,
    });
    const resumed = reduceSession(paused, {
      type: "session/resume",
      resumedAt: 10_000,
    });

    expect(resumed).toEqual({
      kind: "legacyStudy",
      status: "open",
      name: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
      totalPausedMs: 6_000,
    });
    expect(selectElapsedMs(resumed!, 12_000)).toBe(5_000);
  });

  test("accumulates elapsed across repeated abandon and resume cycles", () => {
    const opened = reduceSession(null, {
      type: "session/open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
    });
    const firstPause = reduceSession(opened, { type: "session/abandon", pausedAt: 4_000 });
    const firstResume = reduceSession(firstPause, { type: "session/resume", resumedAt: 10_000 });
    const secondPause = reduceSession(firstResume, { type: "session/abandon", pausedAt: 13_000 });
    const secondResume = reduceSession(secondPause, { type: "session/resume", resumedAt: 15_000 });

    expect(selectElapsedMs(secondPause!, 20_000)).toBe(6_000);
    expect(selectElapsedMs(secondResume!, 17_000)).toBe(8_000);
  });

  test("rejects invalid pause and resume transitions without changing state", () => {
    const opened = reduceSession(null, {
      type: "session/open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
    });
    const alreadyPaused = reduceSession(opened, {
      type: "session/abandon",
      pausedAt: 4_000,
    });

    expect(reduceSession(opened, { type: "session/abandon", pausedAt: 999 })).toBe(opened);
    expect(reduceSession(alreadyPaused, { type: "session/abandon", pausedAt: 5_000 })).toBe(alreadyPaused);
    expect(reduceSession(alreadyPaused, { type: "session/resume", resumedAt: 3_999 })).toBe(alreadyPaused);
    expect(reduceSession(opened, { type: "session/resume", resumedAt: 5_000 })).toBe(opened);
  });

  test("stamps transitions no earlier than the Session's earliest valid timestamp after clock rollback", () => {
    const timing = { startedAt: 1_000, totalPausedMs: 1_000 };
    const opens: Array<Extract<Session, { status: "open" }>> = [
      { kind: "legacyStudy", status: "open", name: "React", primaryTechnique: "Active Recall", ...timing },
      {
        kind: "study",
        status: "open",
        domainId: "react",
        chapterRef: { domainId: "react", chapterVersionId: "v1" },
        nodeId: "hooks",
        resourceId: "resource-1",
        primaryTechnique: "Active Recall",
        ...timing,
      },
      { kind: "metalearning", status: "open", domainId: "react", ...timing },
    ];

    for (const open of opens) {
      const paused = { ...open, status: "paused" as const, pausedAt: 4_000 };
      expect(selectTransitionAt(open, 1_500)).toBe(2_000);
      expect(selectTransitionAt(paused, 3_000)).toBe(4_000);
    }
  });

  test("closes an open Session with a required Verdict and freezes elapsed without a minimum duration", () => {
    const opened = reduceSession(null, {
      type: "session/open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
    });
    const closed = reduceSession(opened, {
      type: "session/close",
      closedAt: 1_000,
      focus: 2.5,
      honesty: 4,
    });

    expect(closed).toEqual({
      kind: "legacyStudy",
      status: "closed",
      name: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
      totalPausedMs: 0,
      closedAt: 1_000,
      verdict: { focus: 2.5, honesty: 4 },
    });
    expect(selectElapsedMs(closed!, 9_000)).toBe(0);
  });

  test("closes a paused Session while preserving elapsed before the pause", () => {
    const opened = reduceSession(null, {
      type: "session/open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
    });
    const paused = reduceSession(opened, { type: "session/abandon", pausedAt: 4_000 });
    const closed = reduceSession(paused, {
      type: "session/close",
      closedAt: 10_000,
      focus: 0,
      honesty: 0,
    });

    expect(closed).toMatchObject({
      status: "closed",
      closedAt: 10_000,
      pausedAt: 4_000,
      verdict: { focus: 0, honesty: 0 },
    });
    expect(selectElapsedMs(closed!, 20_000)).toBe(3_000);
  });

  test("rejects invalid Verdict values and closed Session transitions", () => {
    const opened = reduceSession(null, {
      type: "session/open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
    });
    const closed = reduceSession(opened, {
      type: "session/close",
      closedAt: 2_000,
      focus: 1,
      honesty: 1,
    });

    for (const [focus, honesty] of [[Number.NaN, 2], [2, Number.POSITIVE_INFINITY]]) {
      expect(reduceSession(opened, { type: "session/close", closedAt: 2_000, focus, honesty })).toBe(opened);
    }
    expect(reduceSession(opened, {
      type: "session/close",
      closedAt: 999,
      focus: 1,
      honesty: 1,
    })).toBe(opened);
    expect(reduceSession(closed, { type: "session/resume", resumedAt: 3_000 })).toBe(closed);
    expect(reduceSession(closed, {
      type: "session/close",
      closedAt: 3_000,
      focus: 5,
      honesty: 5,
    })).toBe(closed);
  });

  test("allows a new Session to replace a closed current Session", () => {
    const opened = reduceSession(null, {
      type: "session/open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
    });
    const closed = reduceSession(opened, {
      type: "session/close",
      closedAt: 2_000,
      focus: 1,
      honesty: 1,
    });

    expect(reduceSession(closed, {
      type: "session/open",
      domain: "Japanese",
      primaryTechnique: "Direct Practice",
      startedAt: 3_000,
    })).toEqual({
      kind: "legacyStudy",
      status: "open",
      name: "Japanese",
      primaryTechnique: "Direct Practice",
      startedAt: 3_000,
      totalPausedMs: 0,
    });
  });

  test("does not replace an open Session", () => {
    const session = reduceSession(null, {
      type: "session/open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
    });

    const replacement = reduceSession(session, {
      type: "session/open",
      domain: "Japanese",
      primaryTechnique: "Direct Practice",
      startedAt: 2_000,
    });

    expect(replacement).toBe(session);
  });
});
