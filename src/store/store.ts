import { initialState, rootReducer } from "./root-reducer";
import type { State, Action } from "./store.types";

export function createStore(preloaded: State = initialState) {
  let current = preloaded;
  return {
    getState: (): State => current,
    dispatch: (action: Action): State => {
      current = rootReducer(current, action);
      return current;
    },
  };
}

export type Store = ReturnType<typeof createStore>;