/**
 * Lori state projection from event log
 */

import { loadFlashcards } from "../srs/srs.persistence";
import { loadConfig, getTodayKey, getWeekNumber } from "../core/core.config";
import { loadEvents, ensureLoriDir } from "./events.persistence";
import { loadModule } from "../modules/modules.io";
import type { LoriState } from "../modules/modules.model";
import { tryLoadSnapshot, deserializeState, writeSnapshot, SNAPSHOT_INTERVAL } from "../core/core.snapshot";
import { LoriEvents } from "./events.model";

export async function rebuildState(cwd: string): Promise<LoriState> {
  await ensureLoriDir(cwd);

  const config = await loadConfig(cwd);
  let events = await loadEvents(cwd);
  const modules = new Map<string, LoriState["modules"] extends Map<string, infer V> ? V : never>();
  const flashcards = new Map<string, LoriState["flashcards"] extends Map<string, infer V> ? V : never>();
  let todayMinutes = 0;
  let totalHours = 0;
  const recentSessions: LoriState["recentSessions"] = [];
  const drillLevels = new Map<string, number>();
  const recentResources: string[] = [];
  const conceptsLearned: string[] = [];
  let activeTimer: LoriState["activeTimer"] = undefined;

  // Snapshot: if we have >SNAPSHOT_INTERVAL events, try to load snapshot and only replay newer events
  let snapshotOffset = 0;
  const snap = await tryLoadSnapshot(cwd);
  if (snap && snap.eventCount > 0 && events.length > snap.eventCount + SNAPSHOT_INTERVAL / 2) {
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
      case LoriEvents.MODULE_CREATED:
      case LoriEvents.PLAN_CREATED: {
        const name = (ev.data.name as string) ?? (ev.data.module as string);
        if (name && !modules.has(name)) modules.set(name, { name, weeks: [], retros: [], concepts: [], drills: [], resources: [] });
        break;
      }
      case LoriEvents.RETRO_DONE: {
        const week = ev.data.week as string;
        if (week) {
          // retro events are logged; no projected state change needed
        }
        break;
      }
      case LoriEvents.SESSION_MINUTES: {
        const day = ev.data.date as string;
        const mins = (ev.data.minutes as number) ?? 0;
        if (day === getTodayKey()) todayMinutes += mins;
        break;
      }
      case LoriEvents.SESSION_STARTED: {
        // Track for recent sessions context
        break;
      }
      case LoriEvents.SESSION_ENDED: {
        const duration = (ev.data.duration as number) ?? (ev.data.minutes as number) ?? 0;
        const day = (ev.data.date as string) ?? getTodayKey();
        totalHours += duration / 60;
        if (day === getTodayKey()) todayMinutes += duration;
        // Try to match with most recent session_started
        const lastStart = events.slice(0, events.indexOf(ev)).reverse().find(e => e.type === LoriEvents.SESSION_STARTED);
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
      case LoriEvents.TIMER_STARTED: {
        activeTimer = {
          module: ev.data.module as string,
          technique: ev.data.technique as string,
          startedAt: ev.timestamp,
          durationMinutes: ev.data.durationMinutes as number,
        };
        break;
      }
      case LoriEvents.TIMER_ENDED:
        activeTimer = undefined;
        break;
      case LoriEvents.WEAKNESS_IDENTIFIED:
      case LoriEvents.WEAKNESS_ADDED: {
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
      case LoriEvents.CONCEPT_LEARNED: {
        const concept = ev.data.concept as string;
        const mod = ev.data.module as string;
        if (concept) conceptsLearned.push(concept);
        if (mod && modules.has(mod)) {
          const m = modules.get(mod)!;
          if (!m.concepts.includes(concept)) m.concepts.push(concept);
        }
        break;
      }
      case LoriEvents.DRILL_COMPLETED: {
        const topic = ev.data.topic as string;
        const level = (ev.data.level as number) ?? 1;
        if (topic) drillLevels.set(topic, level);
        break;
      }
      case LoriEvents.FEYNMAN_DONE: {
        const concept = ev.data.concept as string;
        const mod = ev.data.module as string;
        if (concept) conceptsLearned.push(concept);
        if (mod && modules.has(mod)) {
          const m = modules.get(mod)!;
          if (!m.concepts.includes(concept)) m.concepts.push(concept);
        }
        break;
      }
      case LoriEvents.RESOURCE_CURATED:
      case LoriEvents.RESOURCE_ADDED: {
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
      case LoriEvents.MODULE_COMPLETED: {
        const mod = ev.data.module as string;
        if (mod && modules.has(mod)) {
          modules.get(mod)!.completed = true;
        }
        break;
      }
      case LoriEvents.WEAKNESS_RESOLVED: {
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
    config, events, modules, flashcards, activeTimer,
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
