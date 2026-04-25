import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { JsonSkinAdapter } from "../.pi/extensions/lori/domain/skin";

describe("JsonSkinAdapter", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "lori-skin-"));
    mkdirSync(join(tmpDir, "skins"), { recursive: true });
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("loads skins from directory and returns getString with interpolation", () => {
    writeFileSync(
      join(tmpDir, "skins", "minimal.json"),
      JSON.stringify({
        id: "minimal",
        name: "Minimal",
        strings: {
          "session.started": "Session started: {domain}",
          "xp.gained": "+{xp} XP",
        },
      })
    );

    const adapter = new JsonSkinAdapter(tmpDir, "minimal");
    expect(adapter.getString("session.started", { domain: "Japanese" })).toBe("Session started: Japanese");
    expect(adapter.getString("xp.gained", { xp: "250" })).toBe("+250 XP");
  });

  it("lists discovered skins", () => {
    writeFileSync(join(tmpDir, "skins", "a.json"), JSON.stringify({ id: "a", name: "A", strings: {} }));
    writeFileSync(join(tmpDir, "skins", "b.json"), JSON.stringify({ id: "b", name: "B", strings: {} }));

    const adapter = new JsonSkinAdapter(tmpDir, "a");
    const skins = adapter.listSkins();
    expect(skins.map((s) => s.id).sort()).toEqual(["a", "b"]);
  });

  it("falls back to minimal when key missing in active skin", () => {
    writeFileSync(
      join(tmpDir, "skins", "minimal.json"),
      JSON.stringify({ id: "minimal", name: "Minimal", strings: { "common.key": "minimal-value" } })
    );
    writeFileSync(
      join(tmpDir, "skins", "rpg.json"),
      JSON.stringify({ id: "rpg", name: "RPG", strings: {} })
    );

    const adapter = new JsonSkinAdapter(tmpDir, "rpg");
    expect(adapter.getString("common.key")).toBe("minimal-value");
  });

  it("returns raw key when missing everywhere", () => {
    writeFileSync(
      join(tmpDir, "skins", "minimal.json"),
      JSON.stringify({ id: "minimal", name: "Minimal", strings: {} })
    );

    const adapter = new JsonSkinAdapter(tmpDir, "minimal");
    expect(adapter.getString("missing.key")).toBe("missing.key");
  });
});
