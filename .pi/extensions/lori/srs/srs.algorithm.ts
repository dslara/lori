/**
 * SM-2 spaced repetition algorithm
 */

import type { Flashcard } from "./srs.model";

export function calculateNextReview(card: Flashcard, quality: number): Flashcard {
  // quality: 0-5 (0=complete blackout, 5=perfect)
  let { interval, repetitions, easeFactor } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  const now = Date.now();
  return {
    ...card,
    interval,
    repetitions,
    easeFactor,
    nextReview: now + interval * 24 * 60 * 60 * 1000,
    lastReviewed: now,
    history: [...card.history, { date: now, quality }],
  };
}

export function getDueCards(cards: Flashcard[]): Flashcard[] {
  const now = Date.now();
  return cards.filter(c => c.nextReview <= now);
}

export function createFlashcard(module: string, front: string, back: string): Flashcard {
  const now = Date.now();
  return {
    id: `${module}-${now}-${Math.random().toString(36).slice(2, 8)}`,
    front,
    back,
    module,
    createdAt: now,
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: now,
    history: [],
  };
}
