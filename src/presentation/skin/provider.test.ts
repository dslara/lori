import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { createSkinProvider } from "./provider.ts";

const projectDirs: string[] = [];

afterEach(async () => {
  await Promise.all(projectDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function createProjectDir(): Promise<string> {
  const projectDir = await mkdtemp(join(tmpdir(), "lori-skins-"));
  projectDirs.push(projectDir);
  return projectDir;
}

describe("Skin provider", () => {
  test("renders the built-in Minimal template for a status event", async () => {
    const provider = await createSkinProvider(await createProjectDir(), { skin: "minimal" });

    expect(provider.render("status.idle", { totalXp: 12 })).toBe(
      "Lori · Session: nenhuma ativa · XP: 12 · Skin Minimal",
    );
  });

  test("renders every lifecycle CoreEvent in Minimal", async () => {
    const provider = await createSkinProvider(await createProjectDir(), { skin: "minimal" });

    expect([
      provider.render("status.idle", { totalXp: 7 }),
      provider.render("session.open", { domain: "Math", technique: "Recall", elapsed: "5m" }),
      provider.render("session.startRejected", { domain: "Math", technique: "Recall" }),
      provider.render("session.paused", { domain: "Math", technique: "Recall", elapsed: "5m" }),
      provider.render("session.pauseRejected", { domain: "Math", technique: "Recall" }),
      provider.render("session.resumed", { domain: "Math", technique: "Recall", elapsed: "5m" }),
      provider.render("session.resumeRejected", { domain: "Math", technique: "Recall" }),
      provider.render("session.restored", { domain: "Math", technique: "Recall", elapsed: "5m" }),
      provider.render("session.closed", {
        domain: "Math",
        technique: "Recall",
        elapsed: "5m",
        focus: 3,
        honesty: 4,
      }),
      provider.render("session.closeRejected", { domain: "Math", technique: "Recall" }),
    ]).toEqual([
      "Lori · Session: nenhuma ativa · XP: 7 · Skin Minimal",
      "Lori · Session: open · Domain: Math · Primary Technique: Recall · Elapsed: 5m",
      "Lori · Session não iniciada · já existe uma Session ativa · Domain solicitado: Math · Primary Technique: Recall",
      "Lori · Session pausada · Domain: Math · Primary Technique: Recall · Elapsed: 5m",
      "Lori · Não foi possível pausar a Session · Domain: Math · Primary Technique: Recall",
      "Lori · Session retomada · Domain: Math · Primary Technique: Recall · Elapsed: 5m",
      "Lori · Não foi possível retomar a Session · Domain: Math · Primary Technique: Recall",
      "Lori · Session restaurada como pausada · Domain: Math · Primary Technique: Recall · Elapsed: 5m",
      "Lori · Session fechada · Domain: Math · Primary Technique: Recall · Elapsed: 5m · Focus: 3 · Honesty: 4",
      "Lori · Não foi possível fechar a Session · Domain: Math · Primary Technique: Recall",
    ]);
  });

  test("loads a valid project-local skin and interpolates its template", async () => {
    const projectDir = await createProjectDir();
    await mkdir(join(projectDir, ".lori", "skins"), { recursive: true });
    await writeFile(
      join(projectDir, ".lori", "skins", "cyber.json"),
      JSON.stringify({ id: "cyber", templates: { "status.idle": "Cyber XP={totalXp}" } }),
    );

    const provider = await createSkinProvider(projectDir, { skin: "cyber" });

    expect(provider.render("status.idle", { totalXp: 42 })).toBe("Cyber XP=42");
  });

  test("falls back to Minimal for a missing custom skin", async () => {
    const provider = await createSkinProvider(await createProjectDir(), { skin: "missing" });

    expect(provider.render("status.idle", { totalXp: 8 })).toBe(
      "Lori · Session: nenhuma ativa · XP: 8 · Skin Minimal",
    );
  });

  test("falls back per event for missing or invalid custom templates", async () => {
    const projectDir = await createProjectDir();
    await mkdir(join(projectDir, ".lori", "skins"), { recursive: true });
    await writeFile(
      join(projectDir, ".lori", "skins", "partial.json"),
      JSON.stringify({
        id: "partial",
        templates: {
          "status.idle": "Custom XP={totalXp}",
          "session.open": "Invalid parameter: {unknown}",
        },
      }),
    );
    const provider = await createSkinProvider(projectDir, { skin: "partial" });

    expect(provider.render("status.idle", { totalXp: 3 })).toBe("Custom XP=3");
    expect(provider.render("session.open", { domain: "Math", technique: "Recall", elapsed: "5m" })).toBe(
      "Lori · Session: open · Domain: Math · Primary Technique: Recall · Elapsed: 5m",
    );
    expect(provider.render("session.closed", {
      domain: "Math",
      technique: "Recall",
      elapsed: "5m",
      focus: 2,
      honesty: 3,
    })).toBe(
      "Lori · Session fechada · Domain: Math · Primary Technique: Recall · Elapsed: 5m · Focus: 2 · Honesty: 3",
    );
  });

  test("rejects malformed custom data without disabling Minimal", async () => {
    const projectDir = await createProjectDir();
    await mkdir(join(projectDir, ".lori", "skins"), { recursive: true });
    await writeFile(join(projectDir, ".lori", "skins", "broken.json"), "{not json");
    const provider = await createSkinProvider(projectDir, { skin: "broken" });

    expect(provider.render("session.paused", { domain: "Japanese", technique: "Recall", elapsed: "9m" })).toBe(
      "Lori · Session pausada · Domain: Japanese · Primary Technique: Recall · Elapsed: 9m",
    );
  });

  test("rejects traversal IDs and keeps skin files inside the study project", async () => {
    const projectDir = await createProjectDir();
    await mkdir(join(projectDir, ".lori"), { recursive: true });
    await writeFile(
      join(projectDir, ".lori", "escape.json"),
      JSON.stringify({ id: "../escape", templates: { "status.idle": "escaped" } }),
    );
    const provider = await createSkinProvider(projectDir, { skin: "../escape" });

    expect(provider.render("status.idle", { totalXp: 0 })).toBe(
      "Lori · Session: nenhuma ativa · XP: 0 · Skin Minimal",
    );
  });

  test("keeps placeholder-like parameter text literal", async () => {
    const provider = await createSkinProvider(await createProjectDir(), { skin: "minimal" });

    expect(provider.render("session.open", {
      domain: "{elapsed}",
      technique: "Recall",
      elapsed: "00:00:10",
    })).toBe("Lori · Session: open · Domain: {elapsed} · Primary Technique: Recall · Elapsed: 00:00:10");
  });
});
