/**
 * SM-2 algorithm — pure functional implementation.
 * Returns next interval, repetition count, and ease factor.
 */
export interface Sm2Input {
  quality: number; // 0–5
  repetitions: number;
  easeFactor: number;
  interval: number; // days
}

export interface Sm2Output {
  repetitions: number;
  easeFactor: number;
  interval: number;
}

export function sm2(input: Sm2Input): Sm2Output {
  // TODO: implement SM-2 logic
  return {
    repetitions: input.repetitions,
    easeFactor: input.easeFactor,
    interval: input.interval,
  };
}
