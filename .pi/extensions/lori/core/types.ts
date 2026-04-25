export interface Domain {
  slug: string;
  name: string;
  createdAt: string;
  totalXP: number;
  sessions: number;
}

export interface SkinManifest {
  id: string;
  name: string;
  strings: Record<string, string>;
  ascii?: Record<string, string>;
}

export interface ActiveSession {
  domainId: string;
  startedAt: string;
  plannedDurationSec: number;
}

export interface StudySession {
  id: string;
  domainId: string;
  plannedMinutes: number;
  elapsedMinutes: number;
  completed: boolean;
  startedAt: string;
  endedAt: string;
  xpEarned: number;
}

export interface PlayerProfile {
  version: number;
  totalXP: number;
  streak: number;
  activeSkin: string;
  lastDomainId: string | null;
  domains: Record<string, number>; // domainId -> totalXP per domain
  sessionHistory: StudySession[];
  lastCompletedDate: string | null;
}

