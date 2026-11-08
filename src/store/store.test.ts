import { describe, expect, test } from "vitest";
import { createStore } from "./store";

describe("store", () => {
  test("dispatch applies reducer and updates getState", () => {
    const store = createStore();
    store.dispatch({ type: "player/xpAdded", amount: 20 });
    expect(store.getState().player.xp).toBe(20);
  });
  test("preloaded rebuilds from snapshot", () => {
    const store = createStore({ player: { xp: 10, level: 1, streak: 0 } });
    expect(store.getState().player.xp).toBe(10);
  });
});