import { createInitialState, type LoriState } from "./state.ts";
import { rootReducer } from "./root-reducer.ts";
import type { SessionAction } from "../core/session/types.ts";

export type LoriStore = {
  dispatch(action: SessionAction): void;
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
