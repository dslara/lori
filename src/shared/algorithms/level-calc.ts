/**
 * Level calculation from total XP.
 */
export function xpToLevel(totalXp: number): number {
  // TODO: define level curve
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}
