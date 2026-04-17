/**
 * Lori memory — projected state reconstructed from event log
 */

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { loadEvents, getLoriDir } from "./events.js";
import type { LoriEvent } from "./events.js";
import type { Flashcard } from "./sm2.js";
import { loadFlashcards } from "./sm2.js";

export interface Weakness {
  concept: string;
  errors: number;
  lastSeen: string; // YYYY-MM-DD
  symptom?: string;
}

export interface LoriConfig {
  activeModules: string[];
  dailyGoalMinutes: number;
  pomodoroWork: number;
  pomodoroBreak: number;
  streakDays: number;
  lastStudyDate?: string;
  weaknesses: Weakness[];
  createdAt: number;
}

export interface LoriModule {
  name: string;
  plan?: string;
  weeks: string[];
  retros: string[];
  concepts: string[];
  drills: string[];
  resources: string[];
  benchmark?: string;
  completed?: boolean;
}

export interface RecentSession {
  module: string;
  technique: string;
  duration: number;
  focus?: number;
  honest?: boolean;
  date: string;
  topic?: string;
}

export interface LoriState {
  config: LoriConfig;
  events: LoriEvent[];
  modules: Map<string, LoriModule>;
  flashcards: Map<string, Flashcard[]>;
  activeTimer?: {
    module: string;
    technique: string;
    startedAt: number;
    durationMinutes: number;
  };
  todayMinutes: number;
  totalHours: number;
  weekNumber: number;
  recentSessions: RecentSession[];
  activeModule: string;
  pendingSRS: number;
  planProgress: number;
  drillLevels: Map<string, number>;
  recentResources: string[];
  conceptsLearned: string[];
  currentWeekFocus?: string;
  moduleWeekTotal?: number;
}

const CONFIG_FILE = "config.json";
const SNAPSHOT_FILE = "state-snapshot.json";
const SNAPSHOT_INTERVAL = 50;

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

export async function loadModule(cwd: string, name: string): Promise<LoriModule> {
  const dir = join(getLoriDir(cwd), "modules", name);
  const mod: LoriModule = { name, weeks: [], retros: [], concepts: [], drills: [], resources: [] };

  async function readIfExists(file: string): Promise<string | undefined> {
    try {
      return await readFile(join(dir, file), "utf8");
    } catch {
      return undefined;
    }
  }

  mod.plan = await readIfExists("plan.md");
  mod.benchmark = await readIfExists("benchmark.md");

  try {
    const files = await readdir(dir);
    for (const f of files) {
      if (f.startsWith("week-")) mod.weeks.push(f);
      if (f.startsWith("retro-")) mod.retros.push(f);
      if (f === "concepts.md") mod.concepts = (await readIfExists(f))?.split("\n").filter(Boolean) ?? [];
      if (f === "drills.md") mod.drills = (await readIfExists(f))?.split("\n").filter(Boolean) ?? [];
      if (f === "resources.md") mod.resources = (await readIfExists(f))?.split("\n").filter(Boolean) ?? [];
    }
  } catch {
    // module dir may not exist yet
  }

  return mod;
}

export async function writeModuleFile(
  cwd: string,
  module: string,
  filename: string,
  content: string
): Promise<void> {
  const dir = join(getLoriDir(cwd), "modules", module);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), content);
}

export async function readModuleFile(
  cwd: string,
  module: string,
  filename: string
): Promise<string | undefined> {
  try {
    return await readFile(join(getLoriDir(cwd), "modules", module, filename), "utf8");
  } catch {
    return undefined;
  }
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

export async function rebuildState(cwd: string): Promise<LoriState> {
  const { ensureLoriDir } = await import("./events.js");
  await ensureLoriDir(cwd);

  const config = await loadConfig(cwd);
  let events = await loadEvents(cwd);
  const modules = new Map<string, LoriModule>();
  const flashcards = new Map<string, Flashcard[]>();
  let todayMinutes = 0;
  let totalHours = 0;
  const recentSessions: RecentSession[] = [];
  const drillLevels = new Map<string, number>();
  const recentResources: string[] = [];
  const conceptsLearned: string[] = [];
  let activeTimer: LoriState["activeTimer"] = undefined;

  // Snapshot: if we have >SNAPSHOT_INTERVAL events, try to load snapshot and only replay newer events
  let snapshotOffset = 0;
  try {
    const snapRaw = await readFile(join(getLoriDir(cwd), SNAPSHOT_FILE), "utf8");
    const snap = JSON.parse(snapRaw) as { eventCount: number; state: ReturnType<typeof serializeState>; config: LoriConfig };
    if (snap.eventCount > 0 && events.length > snap.eventCount + SNAPSHOT_INTERVAL / 2) {
      snapshotOffset = snap.eventCount;
      Object.assign(config, snap.config);
      const deserialized = deserializeState(snap.state);
      deserialized.modules.forEach((v, k) => modules.set(k, v));
      deserialized.flashcards.forEach((v, k) => flashcards.set(k, v));
      deserialized.drillLevels.forEach((v, k) => drillLevels.set(k, v));
      todayMinutes = deserialized.todayMinutes;
      totalHours = deserialized.totalHours;
      deserialized.recentSessions.forEach(s => recentSessions.push(s));
      deserialized.recentResources.forEach(r => recentResources.push(r));
      deserialized.conceptsLearned.forEach(c => conceptsLearned.push(c));
      activeTimer = deserialized.activeTimer;
    }
  } catch {
    // no snapshot yet
  }

  events = events.slice(snapshotOffset);

  // Load disk state first so events can enrich (not overwrite)
  for (const mod of config.activeModules) {
    if (!flashcards.has(mod)) flashcards.set(mod, await loadFlashcards(cwd, mod));
    if (!modules.has(mod)) {
      const m = await loadModule(cwd, mod);
      modules.set(mod, m);
    }
  }

  for (const ev of events) {
    switch (ev.type) {
      case "module_created":
      case "plan_created": {
        const name = (ev.data.name as string) ?? (ev.data.module as string);
        if (name && !modules.has(name)) modules.set(name, { name, weeks: [], retros: [], concepts: [], drills: [], resources: [] });
        break;
      }
      case "retro_done": {
        const week = ev.data.week as string;
        if (week) {
          // retro events are logged; no projected state change needed
        }
        break;
      }
      case "session_minutes": {
        const day = ev.data.date as string;
        const mins = (ev.data.minutes as number) ?? 0;
        if (day === getTodayKey()) todayMinutes += mins;
        break;
      }
      case "session_started": {
        // Track for recent sessions context
        break;
      }
      case "session_ended": {
        const duration = (ev.data.duration as number) ?? (ev.data.minutes as number) ?? 0;
        const day = (ev.data.date as string) ?? getTodayKey();
        totalHours += duration / 60;
        if (day === getTodayKey()) todayMinutes += duration;
        // Try to match with most recent session_started
        const lastStart = events.slice(0, events.indexOf(ev)).reverse().find(e => e.type === "session_started");
        recentSessions.unshift({
          module: (lastStart?.data.module as string) ?? "geral",
          technique: (lastStart?.data.technique as string) ?? "foco",
          duration,
          focus: (ev.data.focus as number) ?? undefined,
          honest: (ev.data.honest as boolean) ?? undefined,
          date: day,
          topic: (lastStart?.data.objective as string) ?? undefined,
        });
        if (recentSessions.length > 5) recentSessions.pop();
        break;
      }
      case "timer_started": {
        activeTimer = {
          module: ev.data.module as string,
          technique: ev.data.technique as string,
          startedAt: ev.timestamp,
          durationMinutes: ev.data.durationMinutes as number,
        };
        break;
      }
      case "timer_ended":
        activeTimer = undefined;
        break;
      case "weakness_identified":
      case "weakness_added": {
        const concept = ev.data.concept as string;
        const symptom = (ev.data.symptom as string) || "";
        const today = getTodayKey();
        const existing = config.weaknesses.find((w) => w.concept === concept);
        if (existing) {
          existing.errors += 1;
          existing.lastSeen = today;
          if (symptom) existing.symptom = symptom;
        } else {
          config.weaknesses.push({ concept, errors: 1, lastSeen: today, symptom });
        }
        break;
      }
      case "concept_learned": {
        const concept = ev.data.concept as string;
        const mod = ev.data.module as string;
        if (concept) conceptsLearned.push(concept);
        if (mod && modules.has(mod)) {
          const m = modules.get(mod)!;
          if (!m.concepts.includes(concept)) m.concepts.push(concept);
        }
        break;
      }
      case "drill_completed": {
        const topic = ev.data.topic as string;
        const level = (ev.data.level as number) ?? 1;
        if (topic) drillLevels.set(topic, level);
        break;
      }
      case "feynman_done": {
        const concept = ev.data.concept as string;
        const mod = ev.data.module as string;
        if (concept) conceptsLearned.push(concept);
        if (mod && modules.has(mod)) {
          const m = modules.get(mod)!;
          if (!m.concepts.includes(concept)) m.concepts.push(concept);
        }
        break;
      }
      case "resource_curated":
      case "resource_added": {
        const title = (ev.data.title as string) ?? (ev.data.url as string) ?? "";
        if (title) {
          recentResources.unshift(title);
          if (recentResources.length > 5) recentResources.pop();
        }
        const mod = ev.data.module as string;
        if (mod && modules.has(mod)) {
          const m = modules.get(mod)!;
          if (title && !m.resources.includes(title)) m.resources.push(title);
        }
        break;
      }
      case "module_completed": {
        const mod = ev.data.module as string;
        if (mod && modules.has(mod)) {
          modules.get(mod)!.completed = true;
        }
        break;
      }
      case "weakness_resolved": {
        const concept = ev.data.concept as string;
        config.weaknesses = config.weaknesses.filter((w) => w.concept !== concept);
        break;
      }
    }
  }

  const today = getTodayKey();
  const last = config.lastStudyDate;
  if (last) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (last !== today && last !== yesterday) {
      config.streakDays = 0;
    }
  }

  const pendingSRS = Array.from(flashcards.values()).flatMap((c) => c).filter((c) => c.nextReview <= Date.now()).length;
  const totalWeeks = Array.from(modules.values()).reduce((sum, m) => sum + m.weeks.length, 0);
  const doneWeeks = Array.from(modules.values()).reduce((sum, m) => sum + m.retros.length, 0);
  const planProgress = totalWeeks > 0 ? Math.round((doneWeeks / totalWeeks) * 100) : 0;

  let currentWeekFocus = "";
  let moduleWeekTotal = 0;
  const firstMod = config.activeModules[0];
  if (firstMod) {
    const m = modules.get(firstMod);
    if (m?.plan) {
      const rows = m.plan.split("\n").filter((line) => /^\|\s*W\d+/.test(line));
      moduleWeekTotal = rows.length;
      const currentWeek = Math.min(m.retros.length + 1, rows.length);
      const currentRow = rows[currentWeek - 1] ?? "";
      const cells = currentRow.split("|").map((c) => c.trim()).filter(Boolean);
      currentWeekFocus = cells[1] ?? "";
    }
  }

  const result: LoriState = {
    config, events: await loadEvents(cwd), modules, flashcards, activeTimer,
    todayMinutes, totalHours, weekNumber: getWeekNumber(),
    recentSessions, activeModule: config.activeModules[0] ?? "",
    pendingSRS, planProgress, drillLevels, recentResources, conceptsLearned,
    currentWeekFocus, moduleWeekTotal,
  };

  // Write snapshot periodically
  const allEvents = result.events;
  if (allEvents.length > 0 && allEvents.length % SNAPSHOT_INTERVAL === 0) {
    await writeSnapshot(cwd, allEvents.length, result, config);
  }

  return result;
}

function serializeState(state: LoriState) {
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

function deserializeState(raw: ReturnType<typeof serializeState>): Pick<LoriState, "todayMinutes" | "totalHours" | "recentSessions" | "drillLevels" | "recentResources" | "conceptsLearned" | "activeTimer" | "modules" | "flashcards" | "activeModule" | "pendingSRS" | "planProgress" | "currentWeekFocus" | "moduleWeekTotal"> {
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

async function writeSnapshot(cwd: string, eventCount: number, state: LoriState, config: LoriConfig): Promise<void> {
  const snap = { eventCount, config, state: serializeState(state) };
  await writeFile(join(getLoriDir(cwd), SNAPSHOT_FILE), JSON.stringify(snap, null, 2));
}
