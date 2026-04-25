import { mkdirSync, writeFileSync, existsSync, readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import type { ActiveSession } from "../core/types";
import type { SessionPort } from "../core/ports";

export class FileSessionAdapter implements SessionPort {
  constructor(private basePath: string) {}

  private get sessionPath(): string {
    return join(this.basePath, ".lori", "active-session.json");
  }

  async start(domainId: string, plannedDurationSec: number): Promise<void> {
    const session: ActiveSession = {
      domainId,
      startedAt: new Date().toISOString(),
      plannedDurationSec,
    };
    const dir = join(this.basePath, ".lori");
    mkdirSync(dir, { recursive: true });
    writeFileSync(this.sessionPath, JSON.stringify(session, null, 2));
  }

  async getActive(): Promise<ActiveSession | null> {
    if (!existsSync(this.sessionPath)) return null;
    const raw = readFileSync(this.sessionPath, "utf-8");
    const session = JSON.parse(raw) as ActiveSession;
    const startedAt = new Date(session.startedAt).getTime();
    const ageMin = (Date.now() - startedAt) / (1000 * 60);
    if (ageMin > 30) {
      unlinkSync(this.sessionPath);
      return null;
    }
    return session;
  }

  async end(): Promise<void> {
    if (existsSync(this.sessionPath)) {
      unlinkSync(this.sessionPath);
    }
  }
}
