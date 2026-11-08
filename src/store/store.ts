import { createInitialState, type LoriState } from "./state.ts";
import { rootReducer } from "./root-reducer.ts";
import type { LoriAction } from "../core/actions.ts";

export type LoriStore = {
  dispatch(action: LoriAction): void;
  getState(): LoriState;
};

export function createStore(initialState: LoriState = createInitialState()): LoriStore {
  let state = initialState;

  return {
    dispatch(action) {
      state = rootReducer(state, action);
    },
    getState() {
      return state;
    },
  };
}
