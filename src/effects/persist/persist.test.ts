import { lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { createInitialState } from "../../state.ts";
import {
  loadOrCreateSnapshot,
  SNAPSHOT_RELATIVE_PATH,
  SNAPSHOT_SCHEMA_VERSION,
  withSnapshotLock,
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

  test("serializes snapshot transitions across Bun processes", async () => {
    const projectDir = await mkdtemp(join(tmpdir(), "lori-snapshot-race-"));
    projectDirs.push(projectDir);
    const persistUrl = new URL("./persist.ts", import.meta.url).href;
    const workerScript = `
      import { withSnapshotLock } from ${JSON.stringify(persistUrl)};
      const [projectDir, domain] = process.argv.slice(1);
      await withSnapshotLock(projectDir, async (snapshot) => {
        const loaded = await snapshot.loadOrCreate();
        if (!loaded.ok) {
          throw new Error(loaded.error);
        }
        if (loaded.state.session !== null && loaded.state.session.status !== "closed") {
          console.log("rejected");
          return;
        }
        await Bun.sleep(100);
        await snapshot.write({
          ...loaded.state,
          session: {
            status: "open",
            domain,
            primaryTechnique: "Recall",
            startedAt: 1_000,
            totalPausedMs: 0,
          },
        });
        console.log("accepted");
      });
    `;
    const children = ["React", "Japanese"].map((domain) => Bun.spawn(
      [process.execPath ?? "bun", "-e", workerScript, projectDir, domain],
      { cwd: process.cwd(), stdout: "pipe", stderr: "pipe" },
    ));
    const results = await Promise.all(children.map(async (child) => {
      const stdout = await new Response(child.stdout).text();
      await new Response(child.stderr).text();
      return { stdout: stdout.trim(), exitCode: await child.exited };
    }));

    expect(results.every(({ exitCode }) => exitCode === 0)).toBe(true);
    expect(results.map(({ stdout }) => stdout).sort()).toEqual(["accepted", "rejected"]);
    const finalSnapshot = await loadOrCreateSnapshot(projectDir);
    expect(finalSnapshot.ok).toBe(true);
    if (finalSnapshot.ok) {
      const session = finalSnapshot.state.session;
      expect(session?.status).toBe("open");
      if (session?.status === "open") {
        expect(["React", "Japanese"]).toContain(session.domain);
      }
    }
  });
});
