export interface Domain {
  slug: string;
  name: string;
}

export interface SkinManifest {
  id: string;
  name: string;
  strings: Record<string, string>;
  ascii?: Record<string, string>;
}

export interface StudySession {
  id: string;
  domainId: string;
  xpEarned: number;
}

export interface PlayerProfile {
  version: number;
  totalXP: number;
  activeSkin: string;
  lastDomainId: string | null;
  domains: Record<string, number>;
  sessionHistory: StudySession[];
}

