import type { Session } from "./core/session/types.ts";

export type LoriState = {
  player: {
    totalXp: number;
  };
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
