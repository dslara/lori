import { reduceSession } from "../core/session/reducer.ts";
import type { SessionAction } from "../core/session/types.ts";
import type { LoriState } from "../state.ts";

export function rootReducer(state: LoriState, action: SessionAction): LoriState {
  const session = reduceSession(state.session, action);
  return session === state.session ? state : { ...state, session };
}
