/**
 * SM-2 spaced repetition algorithm
 */

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  module: string;
  createdAt: number;
  interval: number; // days
  repetitions: number;
  easeFactor: number;
  nextReview: number; // timestamp
  lastReviewed?: number;
  history: { date: number; quality: number }[];
}

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

// ── Flashcard I/O ──

import { readFile, writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { getLoriDir } from "./events.js";

export async function loadFlashcards(cwd: string, module: string): Promise<Flashcard[]> {
  const path = join(getLoriDir(cwd), "flashcards", `${module}.jsonl`);
  try {
    const raw = await readFile(path, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Flashcard);
  } catch {
    return [];
  }
}

export async function saveFlashcards(cwd: string, module: string, cards: Flashcard[]): Promise<void> {
  const path = join(getLoriDir(cwd), "flashcards", `${module}.jsonl`);
  const lines = cards.map((c) => JSON.stringify(c)).join("\n");
  await writeFile(path, lines ? lines + "\n" : "");
}

export async function addFlashcard(cwd: string, module: string, card: Flashcard): Promise<void> {
  const path = join(getLoriDir(cwd), "flashcards", `${module}.jsonl`);
  await appendFile(path, JSON.stringify(card) + "\n");
}
