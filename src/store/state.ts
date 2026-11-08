import type { Player } from "../core/player/types.ts";
import type { DomainDraft } from "../core/domain/types.ts";
import type { Session } from "../core/session/types.ts";

export type LoriState = {
  player: Player;
  session: Session | null;
  sessionHistory: Session[];
  domainDraft: DomainDraft | null;
  skinConfig: {
    skin: string;
  };
};

export function createInitialState(): LoriState {
  return {
    player: { totalXp: 0 },
    session: null,
    sessionHistory: [],
    domainDraft: null,
    skinConfig: { skin: "minimal" },
  };
}
