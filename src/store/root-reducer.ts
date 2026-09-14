import { playerReducer } from "../core/player/player.reducer";
import type { State, Action } from "./store.types";

// ponytail: player-only State, add session and skinConfig when those slices land.
export const initialState: State = { player: { xp: 0, level: 1, streak: 0 } };

export function rootReducer(state: State, action: Action): State {
  return { player: playerReducer(state.player, action) };
}