import type { Player, PlayerAction } from "./player.types";

export function getLevelForXp(xp: number): number {
  const XP_PER_LEVEL = 1000;
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
}

export function getXp(xp: number, amount: number) {
  return xp + Math.max(0, amount);
}

export function playerReducer(state: Player, action: PlayerAction) {
  switch (action.type) {
    case 'player/xpAdded': {
      const xp = getXp(state.xp, action.amount);
      return { ...state, xp, level: getLevelForXp(xp) };
    }
    default:
      return state;
  }
}