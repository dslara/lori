import { describe, expect, test } from "bun:test";
import { restoreSessionAsPaused } from "./lifecycle.ts";

describe("Session lifecycle", () => {
  test("turns an open Session into a pause at the restoration timestamp", () => {
    expect(restoreSessionAsPaused({
      kind: "legacyStudy",
      status: "open",
      name: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
      totalPausedMs: 2_000,
    }, 9_000)).toEqual({
      type: "session/abandon",
      pausedAt: 9_000,
    });
  });

  test("does not create a lifecycle action for an already paused or absent Session", () => {
    expect(restoreSessionAsPaused(null, 9_000)).toBeUndefined();
    expect(restoreSessionAsPaused({
      kind: "legacyStudy",
      status: "paused",
      name: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
      totalPausedMs: 2_000,
      pausedAt: 7_000,
    }, 9_000)).toBeUndefined();
  });

  test("restores an open Session at its last valid timestamp after clock rollback", () => {
    expect(restoreSessionAsPaused({
      kind: "legacyStudy",
      status: "open",
      name: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
      totalPausedMs: 2_000,
    }, 2_500)).toEqual({
      type: "session/abandon",
      pausedAt: 3_000,
    });
  });
});
