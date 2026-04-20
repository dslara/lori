/**
 * Lori module and state models
 */

import type { LoriEvents } from "../events/events.model";
import type { Flashcard } from "../srs/srs.model";

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
  events: LoriEvents[];
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
