import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { FileSessionAdapter } from "../.pi/extensions/lori/domain/session";

describe("FileSessionAdapter", () => {
  let tmpDir: string;
  let adapter: FileSessionAdapter;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "lori-session-"));
    adapter = new FileSessionAdapter(tmpDir);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("start writes active-session.json with domainId, startedAt, plannedDurationSec", async () => {
    await adapter.start("japanese", 25 * 60);

    const filePath = join(tmpDir, ".lori", "active-session.json");
    expect(existsSync(filePath)).toBe(true);

    const raw = JSON.parse(readFileSync(filePath, "utf-8"));
    expect(raw.domainId).toBe("japanese");
    expect(raw.plannedDurationSec).toBe(1500);
    expect(typeof raw.startedAt).toBe("string");
  });

  it("getActive returns session when file exists", async () => {
    await adapter.start("rust", 30 * 60);
    const active = await adapter.getActive();
    expect(active).not.toBeNull();
    expect(active!.domainId).toBe("rust");
    expect(active!.plannedDurationSec).toBe(1800);
  });

  it("getActive returns null when no active session", async () => {
    const active = await adapter.getActive();
    expect(active).toBeNull();
  });

  it("end deletes active-session.json", async () => {
    await adapter.start("japanese", 25 * 60);
    expect(existsSync(join(tmpDir, ".lori", "active-session.json"))).toBe(true);

    await adapter.end();
    expect(existsSync(join(tmpDir, ".lori", "active-session.json"))).toBe(false);
  });

  it("getActive returns null for stale session older than 30 minutes", async () => {
    const stale = new Date(Date.now() - 31 * 60 * 1000).toISOString();
    const filePath = join(tmpDir, ".lori", "active-session.json");
    mkdirSync(join(tmpDir, ".lori"), { recursive: true });
    writeFileSync(filePath, JSON.stringify({ domainId: "old", startedAt: stale, plannedDurationSec: 1500 }));

    const active = await adapter.getActive();
    expect(active).toBeNull();
    expect(existsSync(filePath)).toBe(false); // stale file cleaned up
  });
});
