export type LoriState = {
  player: {
    totalXp: number;
  };
  session: null;
  skinConfig: {
    skin: "minimal";
  };
};

export function createInitialState(): LoriState {
  return {
    player: { totalXp: 0 },
    session: null,
    skinConfig: { skin: "minimal" },
  };
}

export function formatStatus(state: LoriState): string {
  return `Lori · Session: nenhuma ativa · XP: ${state.player.totalXp} · Skin Minimal`;
}
