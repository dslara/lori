import { lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { createInitialState } from "../../store/state.ts";
import {
  loadOrCreateSnapshot,
  SNAPSHOT_RELATIVE_PATH,
  SNAPSHOT_SCHEMA_VERSION,
  writeSnapshot,
} from "./persist.ts";

const projectDirs: string[] = [];

afterEach(async () => {
  await Promise.all(projectDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("Lori snapshot persistence", () => {
  test("replaces an existing snapshot with complete state", async () => {
    const projectDir = await mkdtemp(join(tmpdir(), "lori-snapshot-"));
    projectDirs.push(projectDir);
    const snapshotPath = join(projectDir, SNAPSHOT_RELATIVE_PATH);
    const initialState = createInitialState();
    await writeSnapshot(projectDir, initialState);
    const initialSnapshot = await readFile(snapshotPath, "utf8");

    const updatedState = {
      ...initialState,
      session: {
        kind: "legacyStudy" as const,
        status: "open" as const,
        name: "React",
        primaryTechnique: "Active Recall",
        startedAt: 1_000,
        totalPausedMs: 0,
      },
    };
    await writeSnapshot(projectDir, updatedState);

    const updatedSnapshot = await readFile(snapshotPath, "utf8");
    expect(updatedSnapshot).not.toBe(initialSnapshot);
    expect(JSON.parse(updatedSnapshot)).toEqual({
      schemaVersion: SNAPSHOT_SCHEMA_VERSION,
      ...updatedState,
    });
    expect(await readdir(join(projectDir, ".lori"))).toEqual(["snapshot.json"]);
  });

  test("replaces a snapshot symlink without changing its target", async () => {
    const projectDir = await mkdtemp(join(tmpdir(), "lori-snapshot-symlink-"));
    projectDirs.push(projectDir);
    const snapshotPath = join(projectDir, SNAPSHOT_RELATIVE_PATH);
    const targetPath = join(projectDir, "previous-snapshot.json");
    const initialState = createInitialState();
    const initialSnapshot = `${JSON.stringify({ schemaVersion: SNAPSHOT_SCHEMA_VERSION, ...initialState }, null, 2)}\n`;
    await mkdir(join(projectDir, ".lori"), { recursive: true });
    await writeFile(targetPath, initialSnapshot, "utf8");
    await symlink(targetPath, snapshotPath);

    const updatedState = {
      ...initialState,
      session: {
        kind: "legacyStudy" as const,
        status: "open" as const,
        name: "React",
        primaryTechnique: "Active Recall",
        startedAt: 1_000,
        totalPausedMs: 0,
      },
    };
    await writeSnapshot(projectDir, updatedState);

    expect(await readFile(targetPath, "utf8")).toBe(initialSnapshot);
    expect((await lstat(snapshotPath)).isSymbolicLink()).toBe(false);
    expect(JSON.parse(await readFile(snapshotPath, "utf8"))).toEqual({
      schemaVersion: SNAPSHOT_SCHEMA_VERSION,
      ...updatedState,
    });
    expect(await readdir(join(projectDir, ".lori"))).toEqual(["snapshot.json"]);
  });

  test("migrates the v3 snapshot shape to the re-curation schema with an empty active Domain collection", async () => {
    const projectDir = await mkdtemp(join(tmpdir(), "lori-snapshot-v3-domains-"));
    projectDirs.push(projectDir);
    const snapshotPath = join(projectDir, SNAPSHOT_RELATIVE_PATH);
    await mkdir(join(projectDir, ".lori"), { recursive: true });
    const previousV3 = {
      schemaVersion: 3,
      player: { totalXp: 17 },
      session: null,
      sessionHistory: [],
      domainDraft: null,
      skinConfig: { skin: "minimal" },
    };
    await writeFile(snapshotPath, JSON.stringify(previousV3));

    const result = await loadOrCreateSnapshot(projectDir);

    expect(result).toMatchObject({ ok: true, state: { player: { totalXp: 17 }, domains: [] } });
    expect(JSON.parse(await readFile(snapshotPath, "utf8"))).toMatchObject({
      schemaVersion: SNAPSHOT_SCHEMA_VERSION,
      player: { totalXp: 17 },
      domains: [],
      sessionHistory: [],
      domainDraft: null,
      skinConfig: { skin: "minimal" },
    });
  });

  test("migrates a valid v2 snapshot to the Chapter proposal schema without losing Player state", async () => {
    const projectDir = await mkdtemp(join(tmpdir(), "lori-snapshot-v2-migration-"));
    projectDirs.push(projectDir);
    const snapshotPath = join(projectDir, SNAPSHOT_RELATIVE_PATH);
    await mkdir(join(projectDir, ".lori"), { recursive: true });
    await writeFile(snapshotPath, JSON.stringify({
      schemaVersion: 2,
      player: { totalXp: 41 },
      session: null,
      sessionHistory: [],
      domainDraft: null,
      skinConfig: { skin: "minimal" },
    }));

    const result = await loadOrCreateSnapshot(projectDir);

    expect(result).toMatchObject({ ok: true, state: { player: { totalXp: 41 }, domainDraft: null } });
    expect(JSON.parse(await readFile(snapshotPath, "utf8"))).toMatchObject({
      schemaVersion: SNAPSHOT_SCHEMA_VERSION,
      player: { totalXp: 41 },
      domainDraft: null,
    });
  });

  test("refuses to write through a .lori directory symlink", async () => {
    const projectDir = await mkdtemp(join(tmpdir(), "lori-snapshot-project-"));
    const targetDir = await mkdtemp(join(tmpdir(), "lori-snapshot-target-"));
    projectDirs.push(projectDir, targetDir);
    const snapshotPath = join(targetDir, "snapshot.json");
    const original = "leave this file alone";
    await writeFile(snapshotPath, original, "utf8");
    await symlink(targetDir, join(projectDir, ".lori"), "dir");

    await expect(writeSnapshot(projectDir, createInitialState())).rejects.toThrow();
    expect(await readFile(snapshotPath, "utf8")).toBe(original);
  });


});
