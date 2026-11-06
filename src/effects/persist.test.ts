import { lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { createInitialState } from "../state.ts";
import { SNAPSHOT_RELATIVE_PATH, SNAPSHOT_SCHEMA_VERSION, writeSnapshot } from "./persist.ts";

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
        status: "open" as const,
        domain: "React",
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
        status: "open" as const,
        domain: "React",
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
});
