import { describe, it, expect } from "vitest";
import { calculateXP, formatXPBreakdown } from "../.pi/extensions/lori/adapters/xp";

describe("calculateXP", () => {
  it("returns fixed 100 XP", () => {
    const result = calculateXP();
    expect(result.totalXP).toBe(100);
  });
});

describe("formatXPBreakdown", () => {
  it("formats XP total", () => {
    const msg = formatXPBreakdown(100);
    expect(msg).toBe("100 XP");
  });
});
