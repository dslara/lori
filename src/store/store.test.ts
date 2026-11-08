import { describe, expect, test } from "bun:test";
import { createInitialState } from "./state.ts";
import { createStore } from "./store.ts";

describe("Lori store", () => {
  test("dispatches Session actions and keeps state unchanged when the reducer rejects replacement", () => {
    const store = createStore({ ...createInitialState(), player: { totalXp: 23 } });
    store.dispatch({
      type: "session/open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
    });
    const openedState = store.getState();

    store.dispatch({
      type: "session/open",
      domain: "Japanese",
      primaryTechnique: "Direct Practice",
      startedAt: 2_000,
    });

    expect(openedState.session?.domain).toBe("React");
    expect(store.getState().player.totalXp).toBe(23);
    expect(store.getState()).toBe(openedState);
  });
});
