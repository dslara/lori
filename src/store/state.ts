import type { Player } from "../core/player/player.types.ts";
import type { ActiveDomain, DomainDraft } from "../core/domain/domain.types.ts";
import type { Session } from "../core/session/session.types.ts";

export type LoriState = {
  player: Player;
  session: Session | null;
  sessionHistory: Session[];
  domains: ActiveDomain[];
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
    domains: [],
    domainDraft: null,
    skinConfig: { skin: "minimal" },
  };
}
