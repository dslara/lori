/**
 * Lori state snapshot persistence
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getLoriDir } from "../events/events.persistence";
import type { LoriConfig, LoriState } from "../modules/modules.model";

const SNAPSHOT_FILE = "state-snapshot.json";
const SNAPSHOT_INTERVAL = 50;

export function serializeState(state: LoriState) {
  return {
    todayMinutes: state.todayMinutes,
    totalHours: state.totalHours,
    recentSessions: state.recentSessions,
    drillLevels: Array.from(state.drillLevels.entries()),
    recentResources: state.recentResources,
    conceptsLearned: state.conceptsLearned,
    activeTimer: state.activeTimer,
    modules: Array.from(state.modules.entries()).map(([k, v]) => [k, v] as const),
    flashcards: Array.from(state.flashcards.entries()).map(([k, v]) => [k, v] as const),
    activeModule: state.activeModule,
    pendingSRS: state.pendingSRS,
    planProgress: state.planProgress,
    currentWeekFocus: state.currentWeekFocus,
    moduleWeekTotal: state.moduleWeekTotal,
  };
}

export type SerializedState = ReturnType<typeof serializeState>;

export function deserializeState(raw: SerializedState): Pick<LoriState, "todayMinutes" | "totalHours" | "recentSessions" | "drillLevels" | "recentResources" | "conceptsLearned" | "activeTimer" | "modules" | "flashcards" | "activeModule" | "pendingSRS" | "planProgress" | "currentWeekFocus" | "moduleWeekTotal"> {
  return {
    todayMinutes: raw.todayMinutes,
    totalHours: raw.totalHours,
    recentSessions: raw.recentSessions,
    drillLevels: new Map(raw.drillLevels),
    recentResources: raw.recentResources,
    conceptsLearned: raw.conceptsLearned,
    activeTimer: raw.activeTimer,
    modules: new Map(raw.modules),
    flashcards: new Map(raw.flashcards),
    activeModule: raw.activeModule,
    pendingSRS: raw.pendingSRS,
    planProgress: raw.planProgress,
    currentWeekFocus: raw.currentWeekFocus,
    moduleWeekTotal: raw.moduleWeekTotal,
  };
}

export async function writeSnapshot(cwd: string, eventCount: number, state: LoriState, config: LoriConfig): Promise<void> {
  const snap = { eventCount, config, state: serializeState(state) };
  await writeFile(join(getLoriDir(cwd), SNAPSHOT_FILE), JSON.stringify(snap, null, 2));
}

export async function tryLoadSnapshot(cwd: string): Promise<{ eventCount: number; state: SerializedState; config: LoriConfig } | undefined> {
  try {
    const snapRaw = await readFile(join(getLoriDir(cwd), SNAPSHOT_FILE), "utf8");
    return JSON.parse(snapRaw) as { eventCount: number; state: SerializedState; config: LoriConfig };
  } catch {
    return undefined;
  }
}

export { SNAPSHOT_INTERVAL };
