import { describe, expect, test } from "vitest";
import { selectLevel, selectStreak, selectXp } from "./player.selectors";

describe("player selectors", () => {
  const player = { xp: 20, level: 1, streak: 3 };
  test("selects raw fields", () => {
    expect(selectXp(player)).toBe(20);
    expect(selectLevel(player)).toBe(1);
    expect(selectStreak(player)).toBe(3);
  });
});

test("derives level from xp, ignores stale stored level", () => {
  expect(selectLevel({ xp: 2500, level: 1, streak: 0 })).toBe(3);
});
