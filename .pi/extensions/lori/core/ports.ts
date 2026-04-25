import type { Domain, PlayerProfile } from "./types";

export interface DomainPort {
  create(name: string): Promise<Domain>;
  list(): Promise<Domain[]>;
  get(slug: string): Promise<Domain | null>;
}

export interface XPPort {
  loadProfile(): Promise<PlayerProfile>;
  saveProfile(profile: PlayerProfile): Promise<void>;
}

export interface SkinPort {
  getString(key: string, vars?: Record<string, string>): string;
  listSkins(): { id: string; name: string }[];
}
