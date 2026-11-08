import { reducePlayer } from "../core/player/reducer.ts";
import { reduceSession } from "../core/session/reducer.ts";
import type { SessionAction } from "../core/session/types.ts";
import type { LoriState } from "./state.ts";

export function rootReducer(state: LoriState, action: SessionAction): LoriState {
  const player = reducePlayer(state.player, action);
  const session = reduceSession(state.session, action);
  if (player === state.player && session === state.session) {
    return state;
  }
  let sessionHistory = state.sessionHistory;
  if (
    action.type === "session/open" &&
    state.session?.status === "closed" &&
    session !== state.session
  ) {
    sessionHistory = [...sessionHistory, state.session];
  }
  return { ...state, player, session, sessionHistory };
}
