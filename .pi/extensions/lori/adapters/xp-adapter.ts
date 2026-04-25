import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PlayerProfile } from "../core/types";
import type { XPPort } from "../core/ports";

function defaultProfile(): PlayerProfile {
  return {
    version: 1,
    totalXP: 0,
    activeSkin: "default",
    lastDomainId: null,
    domains: {},
    sessionHistory: [],
  };
}

export class JsonFileXPAdapter implements XPPort {
  constructor(private basePath: string) {}

  private get statePath(): string {
    return join(this.basePath, ".lori", "state.json");
  }

  async loadProfile(): Promise<PlayerProfile> {
    if (!existsSync(this.statePath)) {
      return defaultProfile();
    }

    const raw = readFileSync(this.statePath, "utf-8");
    try {
      const parsed = JSON.parse(raw) as PlayerProfile;
      return parsed;
    } catch {
      const backupPath = `${this.statePath}.bak.${Math.random().toString(36).slice(2, 9)}`;
      renameSync(this.statePath, backupPath);
      console.warn("[Lori] state.json corrupt. Backup created, loading defaults.");
      return defaultProfile();
    }
  }

  async saveProfile(profile: PlayerProfile): Promise<void> {
    const dir = join(this.basePath, ".lori");
    mkdirSync(dir, { recursive: true });
    writeFileSync(this.statePath, JSON.stringify(profile, null, 2));
  }
}
