/**
 * Lori events persistence
 * Dual persistence: pi.appendEntry() + .lori/state.jsonl
 */

import { readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

export interface LoriEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

const LORI_DIR = ".lori";
const STATE_FILE = "state.jsonl";

export function getLoriDir(cwd: string): string {
  return resolve(cwd, LORI_DIR);
}

export async function ensureLoriDir(cwd: string): Promise<void> {
  const dir = getLoriDir(cwd);
  await mkdir(dir, { recursive: true });
  await mkdir(join(dir, "modules"), { recursive: true });
  await mkdir(join(dir, "resources"), { recursive: true });
  await mkdir(join(dir, "flashcards"), { recursive: true });
}

export async function appendEvent(
  cwd: string,
  event: Omit<LoriEvent, "timestamp">
): Promise<void> {
  const path = join(getLoriDir(cwd), STATE_FILE);
  const entry: LoriEvent = { ...event, timestamp: Date.now() };
  await appendFile(path, JSON.stringify(entry) + "\n");
}

export async function loadEvents(cwd: string): Promise<LoriEvent[]> {
  const path = join(getLoriDir(cwd), STATE_FILE);
  try {
    const raw = await readFile(path, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LoriEvent);
  } catch {
    return [];
  }
}
