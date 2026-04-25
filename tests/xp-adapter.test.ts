import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { JsonFileXPAdapter } from "../.pi/extensions/lori/adapters/xp-adapter";
import type { PlayerProfile } from "../.pi/extensions/lori/core/types";

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

describe("JsonFileXPAdapter", () => {
  let tmpDir: string;
  let adapter: JsonFileXPAdapter;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "lori-xp-test-"));
    adapter = new JsonFileXPAdapter(tmpDir);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns default profile when state.json is missing", async () => {
    const profile = await adapter.loadProfile();
    expect(profile).toEqual(defaultProfile());
  });

  it("persists and reloads profile", async () => {
    const profile: PlayerProfile = {
      ...defaultProfile(),
      totalXP: 500,
      lastDomainId: "japanese",
    };

    await adapter.saveProfile(profile);
    const loaded = await adapter.loadProfile();
    expect(loaded).toEqual(profile);
  });

  it("backs up corrupt state.json and loads defaults", async () => {
    const statePath = join(tmpDir, ".lori", "state.json");
    const fs = await import("node:fs");
    fs.mkdirSync(join(tmpDir, ".lori"), { recursive: true });
    fs.writeFileSync(statePath, "not-json");

    const consoleSpy = { warned: false };
    const origWarn = console.warn;
    console.warn = () => { consoleSpy.warned = true; };

    const profile = await adapter.loadProfile();
    expect(profile).toEqual(defaultProfile());
    expect(consoleSpy.warned).toBe(true);

    console.warn = origWarn;

    const files = fs.readdirSync(join(tmpDir, ".lori"));
    const backups = files.filter((f) => f.startsWith("state.json.bak."));
    expect(backups.length).toBe(1);
    expect(fs.readFileSync(join(tmpDir, ".lori", backups[0]), "utf-8")).toBe("not-json");
  });
});
