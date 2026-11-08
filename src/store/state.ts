import type { Player } from "../core/player/types.ts";
import type { Session } from "../core/session/types.ts";

export type LoriState = {
  player: Player;
  session: Session | null;
  skinConfig: {
    skin: string;
  };
};

export function createInitialState(): LoriState {
  return {
    player: { totalXp: 0 },
    session: null,
    skinConfig: { skin: "minimal" },
  };
}
