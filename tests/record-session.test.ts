import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { JsonFileXPAdapter } from "../.pi/extensions/lori/adapters/xp-adapter";
import { recordSession } from "../.pi/extensions/lori/adapters/xp";
import type { StudySession, PlayerProfile } from "../.pi/extensions/lori/core/types";

describe("recordSession", () => {
  let tmpDir: string;
  let adapter: JsonFileXPAdapter;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "lori-record-"));
    adapter = new JsonFileXPAdapter(tmpDir);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("records a completed session and updates profile", async () => {
    const session: StudySession = {
      id: "s1",
      domainId: "japanese",
      plannedMinutes: 25,
      elapsedMinutes: 25,
      completed: true,
      startedAt: "2026-04-25T10:00:00Z",
      endedAt: "2026-04-25T10:25:00Z",
      xpEarned: 0,
    };

    const result = await recordSession(adapter, session, "2026-04-25");

    expect(result.totalXP).toBe(275); // 250 base + 25 completion
    expect(result.streakBonus).toBe(0);
    expect(result.newStreak).toBe(0);

    const profile = await adapter.loadProfile();
    expect(profile.totalXP).toBe(275);
    expect(profile.streak).toBe(0);
    expect(profile.lastCompletedDate).toBe("2026-04-25");
    expect(profile.sessionHistory).toHaveLength(1);
    expect(profile.sessionHistory[0].xpEarned).toBe(275);
  });

  it("increments streak on consecutive day", async () => {
    const initial: PlayerProfile = {
      version: 1,
      totalXP: 100,
      streak: 2,
      activeSkin: "default",
      lastDomainId: "japanese",
      domains: { japanese: 100 },
      sessionHistory: [],
      lastCompletedDate: "2026-04-24",
    };
    await adapter.saveProfile(initial);

    const session: StudySession = {
      id: "s2",
      domainId: "japanese",
      plannedMinutes: 25,
      elapsedMinutes: 25,
      completed: true,
      startedAt: "2026-04-25T10:00:00Z",
      endedAt: "2026-04-25T10:25:00Z",
      xpEarned: 0,
    };

    const result = await recordSession(adapter, session, "2026-04-25");
    expect(result.newStreak).toBe(3);
    expect(result.totalXP).toBe(358); // 250 + 25 + 30%

    const profile = await adapter.loadProfile();
    expect(profile.streak).toBe(3);
    expect(profile.totalXP).toBe(458); // 100 + 358
    expect(profile.domains["japanese"]).toBe(458);
  });

  it("resets streak after gap and records correctly", async () => {
    const initial: PlayerProfile = {
      version: 1,
      totalXP: 100,
      streak: 5,
      activeSkin: "default",
      lastDomainId: "japanese",
      domains: { japanese: 100 },
      sessionHistory: [],
      lastCompletedDate: "2026-04-22",
    };
    await adapter.saveProfile(initial);

    const session: StudySession = {
      id: "s3",
      domainId: "japanese",
      plannedMinutes: 25,
      elapsedMinutes: 25,
      completed: true,
      startedAt: "2026-04-25T10:00:00Z",
      endedAt: "2026-04-25T10:25:00Z",
      xpEarned: 0,
    };

    const result = await recordSession(adapter, session, "2026-04-25");
    expect(result.newStreak).toBe(0);
    expect(result.totalXP).toBe(275);

    const profile = await adapter.loadProfile();
    expect(profile.streak).toBe(0);
    expect(profile.totalXP).toBe(375);
  });

  it("does not update streak or totalXP for incomplete session", async () => {
    const initial: PlayerProfile = {
      version: 1,
      totalXP: 100,
      streak: 2,
      activeSkin: "default",
      lastDomainId: "japanese",
      domains: { japanese: 100 },
      sessionHistory: [],
      lastCompletedDate: "2026-04-24",
    };
    await adapter.saveProfile(initial);

    const session: StudySession = {
      id: "s4",
      domainId: "japanese",
      plannedMinutes: 25,
      elapsedMinutes: 10,
      completed: false,
      startedAt: "2026-04-25T10:00:00Z",
      endedAt: "2026-04-25T10:10:00Z",
      xpEarned: 0,
    };

    const result = await recordSession(adapter, session, "2026-04-25");
    expect(result.totalXP).toBe(0);
    expect(result.newStreak).toBe(2);

    const profile = await adapter.loadProfile();
    expect(profile.totalXP).toBe(100);
    expect(profile.streak).toBe(2);
    expect(profile.lastCompletedDate).toBe("2026-04-24");
    expect(profile.sessionHistory).toHaveLength(0);
  });
});
