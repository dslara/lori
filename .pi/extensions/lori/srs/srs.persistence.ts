/**
 * Flashcard I/O
 */

import { readFile, writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { getLoriDir } from "../events/events.persistence";
import type { Flashcard } from "./srs.model";

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
