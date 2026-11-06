import { describe, expect, test } from "bun:test";
import { selectElapsedMs } from "./selectors.ts";
import { reduceSession } from "./reducer.ts";

describe("Session core", () => {
  test("opens one Session with its starting timestamp and derives elapsed time", () => {
    const session = reduceSession(null, {
      type: "session/open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
    });

    expect(session).toEqual({
      status: "open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
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
