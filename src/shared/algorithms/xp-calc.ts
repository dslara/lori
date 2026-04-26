/**
 * XP calculation — pure functional.
 */
export interface XpCalcInput {
  base: number;
  modifiers: number[];
}

export function calculateXp(input: XpCalcInput): number {
  const modifierSum = input.modifiers.reduce((sum, m) => sum + m, 0);
  return Math.max(0, input.base + modifierSum);
}
