import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import loriExtension from "../extensions/lori/index.ts";

type UI = {
  notifications: Array<{ message: string; type?: string }>;
  statuses: Array<{ key: string; text: string | undefined }>;
  widgets: Array<{ key: string; content: string[] | undefined }>;
  notify(message: string, type?: "info" | "warning" | "error"): void;
  setStatus(key: string, text: string | undefined): void;
  setWidget(key: string, content: string[] | undefined): void;
};

type StartHandler = (event: { type: "session_start"; reason: "startup" }, ctx: { cwd: string; ui: UI }) => void | Promise<void>;
type CommandHandler = (args: string, ctx: { ui: UI }) => void | Promise<void>;

type Harness = {
  start(): Promise<void>;
  runStatus(): Promise<void>;
  ui: UI;
};

const projectDirs: string[] = [];

afterEach(async () => {
  await Promise.all(projectDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function createHarness(existingCwd?: string): Promise<{ cwd: string; harness: Harness }> {
  const cwd = existingCwd ?? (await mkdtemp(join(tmpdir(), "lori-issue-34-")));
  if (!existingCwd) projectDirs.push(cwd);
  let startHandler: StartHandler | undefined;
  let statusHandler: CommandHandler | undefined;
  const ui: UI = {
    notifications: [],
    statuses: [],
    widgets: [],
    notify(message, type) {
      this.notifications.push({ message, type });
    },
    setStatus(key, text) {
      this.statuses.push({ key, text });
    },
    setWidget(key, content) {
      this.widgets.push({ key, content });
    },
  };

  const api = {
    on(event: string, handler: StartHandler) {
      if (event === "session_start") startHandler = handler;
    },
    registerCommand(name: string, options: { handler: CommandHandler }) {
      if (name === "lori-status") statusHandler = options.handler;
    },
  } as unknown as ExtensionAPI;

  loriExtension(api);

  return {
    cwd,
    harness: {
      ui,
      async start() {
        expect(startHandler).toBeDefined();
        await startHandler?.({ type: "session_start", reason: "startup" }, { cwd, ui });
      },
      async runStatus() {
        expect(statusHandler).toBeDefined();
        await statusHandler?.("", { ui });
      },
    },
  };
}

describe("Lori startup and status", () => {
  test("initializes a new project with Minimal skin and exposes the initial state", async () => {
    const { cwd, harness } = await createHarness();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");

    expect(await readdir(cwd)).toEqual([]);
    await harness.start();

    const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(await readdir(join(cwd, ".lori"))).toEqual(["snapshot.json"]);
    expect(snapshot).toEqual({
      schemaVersion: 1,
      player: { totalXp: 0 },
      session: null,
      skinConfig: { skin: "minimal" },
    });
    expect(harness.ui.statuses.at(-1)?.text).toContain("Session: nenhuma ativa");
    expect(harness.ui.widgets.at(-1)?.content?.join(" ")).toContain("Skin Minimal");

    await harness.runStatus();
    expect(harness.ui.notifications.at(-1)?.message).toContain("Session: nenhuma ativa");
    expect(harness.ui.notifications.at(-1)?.message).toContain("XP: 0");
  });

  test("restores the initial project snapshot when a fresh extension instance starts", async () => {
    const { cwd, harness: firstInstance } = await createHarness();
    await firstInstance.start();
    const savedSnapshot = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");

    const { harness: reloadedInstance } = await createHarness(cwd);
    await reloadedInstance.start();
    await reloadedInstance.runStatus();

    expect(reloadedInstance.ui.statuses.at(-1)?.text).toContain("XP: 0");
    expect(reloadedInstance.ui.widgets.at(-1)?.content?.join(" ")).toContain("Session: nenhuma ativa");
    expect(reloadedInstance.ui.notifications.at(-1)?.message).toContain("Skin Minimal");
    expect(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).toBe(savedSnapshot);
  });

  test("reports an unreadable snapshot without replacing it", async () => {
    const { cwd, harness } = await createHarness();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const originalContents = "{not json";
    await mkdir(join(cwd, ".lori"), { recursive: true });
    await writeFile(snapshotPath, originalContents);

    await harness.start();
    await harness.runStatus();

    expect(harness.ui.notifications[0]?.type).toBe("error");
    expect(harness.ui.notifications[0]?.message).toContain("ilegível");
    expect(harness.ui.notifications[0]?.message).toContain("preservado");
    expect(harness.ui.statuses.at(-1)?.text).toContain("erro no snapshot");
    expect(harness.ui.widgets.at(-1)?.content?.join(" ")).toContain("ilegível");
    expect(harness.ui.notifications.at(-1)?.message).toContain("preservado");
    expect(await readFile(snapshotPath, "utf8")).toBe(originalContents);
  });

  test("reports and preserves a snapshot with an unsupported schema version", async () => {
    const { cwd, harness } = await createHarness();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const originalContents = JSON.stringify({
      schemaVersion: 2,
      player: { totalXp: 0 },
      session: null,
      skinConfig: { skin: "minimal" },
    });
    await mkdir(join(cwd, ".lori"), { recursive: true });
    await writeFile(snapshotPath, originalContents);

    await harness.start();
    await harness.runStatus();

    expect(harness.ui.notifications[0]?.type).toBe("error");
    expect(harness.ui.notifications[0]?.message).toContain("não suportada (2)");
    expect(harness.ui.notifications[0]?.message).toContain("preservado");
    expect(harness.ui.widgets.at(-1)?.content?.join(" ")).toContain("não suportada");
    expect(harness.ui.notifications.at(-1)?.message).toContain("não suportada");
    expect(await readFile(snapshotPath, "utf8")).toBe(originalContents);
  });
});
