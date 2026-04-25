import { describe, it, expect } from "vitest";
import { calculateXP, updateStreak, formatXPBreakdown } from "../.pi/extensions/lori/adapters/xp";

describe("calculateXP", () => {
  it("yields 358 XP for 25 min completed session with streak 3", () => {
    const result = calculateXP({ elapsedMinutes: 25, plannedMinutes: 25, streak: 3 });
    expect(result.totalXP).toBe(358);
    expect(result.baseXP).toBe(250);
    expect(result.completionBonus).toBe(25);
    expect(result.streakBonus).toBe(83);
  });

  it("grants zero completion bonus when elapsed < planned", () => {
    const result = calculateXP({ elapsedMinutes: 20, plannedMinutes: 25, streak: 0 });
    expect(result.baseXP).toBe(200);
    expect(result.completionBonus).toBe(0);
    expect(result.totalXP).toBe(200);
  });

  it("caps streak multiplier at 50%", () => {
    const r5 = calculateXP({ elapsedMinutes: 10, plannedMinutes: 10, streak: 5 });
    expect(r5.streakBonus).toBe(63); // (100+25)*0.5 = 62.5 -> 63 -> total 188
    expect(r5.totalXP).toBe(188);

    const r10 = calculateXP({ elapsedMinutes: 10, plannedMinutes: 10, streak: 10 });
    expect(r10.totalXP).toBe(188);
  });

  it("applies no streak bonus for streak 0", () => {
    const result = calculateXP({ elapsedMinutes: 30, plannedMinutes: 30, streak: 0 });
    expect(result.totalXP).toBe(325);
    expect(result.streakBonus).toBe(0);
  });
});

describe("updateStreak", () => {
  it("sets streak to 0 when there is no previous completed session", () => {
    expect(updateStreak({ currentStreak: 0, lastCompletedDate: null, today: "2026-04-25" })).toBe(0);
  });

  it("increments streak when last completed was previous calendar day", () => {
    expect(updateStreak({ currentStreak: 2, lastCompletedDate: "2026-04-24", today: "2026-04-25" })).toBe(3);
  });

  it("keeps streak unchanged when already completed today", () => {
    expect(updateStreak({ currentStreak: 5, lastCompletedDate: "2026-04-25", today: "2026-04-25" })).toBe(5);
  });

  it("resets streak to 0 when gap is >= 1 day", () => {
    expect(updateStreak({ currentStreak: 5, lastCompletedDate: "2026-04-22", today: "2026-04-25" })).toBe(0);
    expect(updateStreak({ currentStreak: 5, lastCompletedDate: "2026-04-23", today: "2026-04-25" })).toBe(0);
  });
});

describe("formatXPBreakdown", () => {
  it("formats XP breakdown with streak", () => {
    const xp = calculateXP({ elapsedMinutes: 25, plannedMinutes: 25, streak: 3 });
    const msg = formatXPBreakdown(xp, 3);
    expect(msg).toContain("358 XP");
    expect(msg).toContain("250 base");
    expect(msg).toContain("+25 completion");
    expect(msg).toContain("+83 streak");
    expect(msg).toContain("streak 3");
  });

  it("formats XP breakdown without streak bonus", () => {
    const xp = calculateXP({ elapsedMinutes: 20, plannedMinutes: 25, streak: 0 });
    const msg = formatXPBreakdown(xp, 0);
    expect(msg).toContain("200 XP");
    expect(msg).toContain("streak 0");
  });
});
