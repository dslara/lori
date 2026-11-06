export type LoriState = {
  player: {
    totalXp: number;
  };
  session: null;
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
