/**
 * Lori config persistence and date utilities
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getLoriDir } from "../events/events.persistence";
import type { LoriConfig } from "../modules/modules.model";

const CONFIG_FILE = "config.json";

export async function loadConfig(cwd: string): Promise<LoriConfig> {
  const path = join(getLoriDir(cwd), CONFIG_FILE);
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw) as LoriConfig;
    // Migrate old string[] weaknesses to Weakness[]
    if (Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0 && typeof parsed.weaknesses[0] === "string") {
      parsed.weaknesses = (parsed.weaknesses as unknown as string[]).map((c) => ({
        concept: c,
        errors: 1,
        lastSeen: getTodayKey(),
      }));
    }
    return parsed;
  } catch {
    const now = Date.now();
    return {
      activeModules: [],
      dailyGoalMinutes: 120,
      pomodoroWork: 50,
      pomodoroBreak: 10,
      streakDays: 0,
      weaknesses: [],
      createdAt: now,
    };
  }
}

export async function saveConfig(cwd: string, config: LoriConfig): Promise<void> {
  const path = join(getLoriDir(cwd), CONFIG_FILE);
  await writeFile(path, JSON.stringify(config, null, 2));
}

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getWeekKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const week = Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function getWeekNumber(): number {
  const d = new Date();
  const oneJan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
}
