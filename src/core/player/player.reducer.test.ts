import { describe, expect, test } from "vitest";
import { playerReducer } from "./player.reducer";

describe("playerReducer", () => {
  test("soma xp, nunca subtrai", () => {
    const s = { xp: 0, level: 1, streak: 0 };
    expect(playerReducer(s, { type: "player/xpAdded", amount: 20 }).xp).toBe(20);
    expect(playerReducer(s, { type: "player/xpAdded", amount: -5 }).xp).toBe(0);
  });
});

test("derives level from total xp", () => {
  const s = { xp: 990, level: 1, streak: 0 };
  expect(playerReducer(s, { type: "player/xpAdded", amount: 20 }).level).toBe(2);
});