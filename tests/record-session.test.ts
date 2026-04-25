import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { JsonFileXPAdapter } from "../.pi/extensions/lori/adapters/xp-adapter";
import { recordSession } from "../.pi/extensions/lori/adapters/xp";

describe("recordSession", () => {
  let tmpDir: string;
  let adapter: JsonFileXPAdapter;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "lori-record-"));
    adapter = new JsonFileXPAdapter(tmpDir);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("records a session and updates profile", async () => {
    const result = await recordSession(adapter, "japanese");
    expect(result.totalXP).toBe(100);
    expect(result.newTotalXP).toBe(100);

    const profile = await adapter.loadProfile();
    expect(profile.totalXP).toBe(100);
    expect(profile.lastDomainId).toBe("japanese");
    expect(profile.domains["japanese"]).toBe(100);
    expect(profile.sessionHistory).toHaveLength(1);
    expect(profile.sessionHistory[0].domainId).toBe("japanese");
    expect(profile.sessionHistory[0].xpEarned).toBe(100);
  });

  it("accumulates XP across multiple sessions", async () => {
    await recordSession(adapter, "japanese");
    const result = await recordSession(adapter, "rust");

    expect(result.totalXP).toBe(100);
    expect(result.newTotalXP).toBe(200);

    const profile = await adapter.loadProfile();
    expect(profile.totalXP).toBe(200);
    expect(profile.domains["japanese"]).toBe(100);
    expect(profile.domains["rust"]).toBe(100);
    expect(profile.sessionHistory).toHaveLength(2);
  });
});
