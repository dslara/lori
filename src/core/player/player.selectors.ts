import { getLevelForXp } from "./player.reducer";
import type { Player } from "./player.types";

export function selectXp(player: Player): number {
  return player.xp;
}

export function selectLevel(player: Player): number {
  return getLevelForXp(player.xp);
}

export function selectStreak(player: Player): number {
  return player.streak;
}