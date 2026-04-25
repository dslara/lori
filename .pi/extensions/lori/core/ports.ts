import type { Domain, PlayerProfile, ActiveSession } from "./types";

export interface DomainPort {
  create(name: string): Promise<Domain>;
  list(): Promise<Domain[]>;
  get(slug: string): Promise<Domain | null>;
}

export interface XPPort {
  loadProfile(): Promise<PlayerProfile>;
  saveProfile(profile: PlayerProfile): Promise<void>;
}

export interface SessionPort {
  start(domainId: string, plannedDurationSec: number): Promise<void>;
  getActive(): Promise<ActiveSession | null>;
  end(): Promise<void>;
}

export interface TimerPort {
  onTick(cb: (remainingSec: number) => void): void;
  start(plannedDurationSec: number): void;
  stop(): void;
}
