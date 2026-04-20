/**
 * Lori events persistence
 * Dual persistence: pi.appendEntry() + .lori/state.jsonl
 */

import { readFile, mkdir, appendFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { LoriEvents } from "./events.model";

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
  event: Omit<LoriEvents, "timestamp">
): Promise<void> {
  const path = join(getLoriDir(cwd), STATE_FILE);
  const entry: LoriEvents = { ...event, timestamp: Date.now() };
  await appendFile(path, JSON.stringify(entry) + "\n");
}

export async function loadEvents(cwd: string): Promise<LoriEvents[]> {
  const path = join(getLoriDir(cwd), STATE_FILE);
  try {
    const raw = await readFile(path, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LoriEvents);
  } catch {
    return [];
  }
}
