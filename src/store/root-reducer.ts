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
  return { ...state, player, session };
}
