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

  async load(): Promise<ActiveSession | null> {
    if (!existsSync(this.sessionPath)) return null;
    const raw = readFileSync(this.sessionPath, "utf-8");
    return JSON.parse(raw) as ActiveSession;
  }

  async clear(): Promise<void> {
    if (existsSync(this.sessionPath)) {
      unlinkSync(this.sessionPath);
    }
  }
}
