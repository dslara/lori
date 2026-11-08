import { describe, expect, test } from "bun:test";
import { reducePlayer } from "./reducer.ts";

describe("Player reducer", () => {
  test("preserves total XP when a Session action is reduced", () => {
    const player = { totalXp: 23 };

    const nextPlayer = reducePlayer(player, {
      type: "session/close",
      closedAt: 5_000,
      focus: 4,
      honesty: 5,
    });

    expect(nextPlayer).toBe(player);
    expect(nextPlayer.totalXp).toBe(23);
  });
});
