import type { SessionAction } from "../session/types.ts";
import type { Player } from "./types.ts";

export function reducePlayer(state: Player, _action: SessionAction): Player {
  return state;
}
