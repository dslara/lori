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
  runStart(args: string): Promise<void>;
  runClose(args: string): Promise<void>;
  runAbandon(): Promise<void>;
  runResume(): Promise<void>;
  ui: UI;
};

const projectDirs: string[] = [];

afterEach(async () => {
  await Promise.all(projectDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function createHarness(existingCwd?: string): Promise<{ cwd: string; harness: Harness }> {
  const cwd = existingCwd ?? (await mkdtemp(join(tmpdir(), "lori-issue-35-")));
  if (!existingCwd) projectDirs.push(cwd);
  let startHandler: StartHandler | undefined;
  const commandHandlers = new Map<string, CommandHandler>();
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
      commandHandlers.set(name, options.handler);
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
        const handler = commandHandlers.get("lori-status");
        expect(handler).toBeDefined();
        await handler?.("", { ui });
      },
      async runStart(args) {
        const handler = commandHandlers.get("lori-start");
        expect(handler).toBeDefined();
        await handler?.(args, { ui });
      },
      async runClose(args) {
        const handler = commandHandlers.get("lori-close");
        expect(handler).toBeDefined();
        await handler?.(args, { ui });
      },
      async runAbandon() {
        const handler = commandHandlers.get("lori-abandon");
        expect(handler).toBeDefined();
        await handler?.("", { ui });
      },
      async runResume() {
        const handler = commandHandlers.get("lori-resume");
        expect(handler).toBeDefined();
        await handler?.("", { ui });
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

  test("starts and persists a Session and shows its live details", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();

    await harness.runStart("  React  |  Active Recall  ");

    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.session).toMatchObject({
      status: "open",
      domain: "React",
      primaryTechnique: "Active Recall",
    });
    expect(typeof snapshot.session.startedAt).toBe("number");
    for (const display of [
      harness.ui.statuses.at(-1)?.text,
      harness.ui.widgets.at(-1)?.content?.join(" "),
    ]) {
      expect(display).toContain("Session: open");
      expect(display).toContain("Domain: React");
      expect(display).toContain("Primary Technique: Active Recall");
      expect(display).toContain("Elapsed: 00:00:00");
    }
    expect(harness.ui.notifications.at(-1)?.message).toContain("Session iniciada");

    await harness.runStatus();
    expect(harness.ui.notifications.at(-1)?.message).toContain("Domain: React");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Primary Technique: Active Recall");
  });

  test("closes an open Session, persists its Verdict, and restores it without awarding XP", async () => {
    const { cwd, harness } = await createHarness();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    await mkdir(join(cwd, ".lori"), { recursive: true });
    await writeFile(snapshotPath, JSON.stringify({
      schemaVersion: 1,
      player: { totalXp: 17 },
      session: null,
      skinConfig: { skin: "minimal" },
    }));
    await harness.start();
    await harness.runStart("React | Active Recall");
    const before = JSON.parse(await readFile(snapshotPath, "utf8"));

    await harness.runClose("  2.5  |  4  ");

    const closedSnapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(closedSnapshot.schemaVersion).toBe(1);
    expect(closedSnapshot.player.totalXp).toBe(before.player.totalXp);
    expect(closedSnapshot.session).toMatchObject({
      status: "closed",
      domain: "React",
      primaryTechnique: "Active Recall",
      verdict: { focus: 2.5, honesty: 4 },
    });
    expect(closedSnapshot.session.closedAt).toBeGreaterThanOrEqual(closedSnapshot.session.startedAt);
    expect(harness.ui.statuses.at(-1)?.text).toContain("Session fechada");
    expect(harness.ui.statuses.at(-1)?.text).toContain("Focus: 2.5 · Honesty: 4");
    expect(harness.ui.widgets.at(-1)?.content?.join(" ")).toContain("Focus: 2.5 · Honesty: 4");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Session fechada");

    const { harness: restored } = await createHarness(cwd);
    await restored.start();
    await restored.runStatus();
    expect(restored.ui.statuses.at(-1)?.text).toContain("Session fechada");
    expect(restored.ui.notifications.at(-1)?.message).toContain("Focus: 2.5 · Honesty: 4");
    expect(JSON.parse(await readFile(snapshotPath, "utf8")).session.verdict).toEqual({ focus: 2.5, honesty: 4 });
  });

  test("renders a closed Verdict through the configured session.closed Skin template", async () => {
    const { cwd, harness } = await createHarness();
    await mkdir(join(cwd, ".lori", "skins"), { recursive: true });
    await writeFile(
      join(cwd, ".lori", "snapshot.json"),
      JSON.stringify({
        schemaVersion: 1,
        player: { totalXp: 0 },
        session: null,
        skinConfig: { skin: "terminal" },
      }),
    );
    await writeFile(
      join(cwd, ".lori", "skins", "terminal.json"),
      JSON.stringify({
        id: "terminal",
        templates: { "session.closed": "Terminal close {domain} · {elapsed} · {focus}/{honesty}" },
      }),
    );

    await harness.start();
    await harness.runStart("React | Active Recall");
    await harness.runClose("3 | 4");

    expect(harness.ui.statuses.at(-1)?.text).toMatch(/^Terminal close React · 00:00:00 · 3\/4$/);
    expect(harness.ui.widgets.at(-1)?.content?.join(" ")).toMatch(/^Lori Terminal close React · 00:00:00 · 3\/4$/);
  });

  test("closes a paused Session without adding paused time or applying a rating range", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");
    await harness.runAbandon();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const pausedSession = JSON.parse(await readFile(snapshotPath, "utf8")).session;
    const xpBeforeClose = JSON.parse(await readFile(snapshotPath, "utf8")).player.totalXp;

    await harness.runClose("0 | -7.25");

    const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(snapshot.session).toMatchObject({
      status: "closed",
      pausedAt: pausedSession.pausedAt,
      verdict: { focus: 0, honesty: -7.25 },
    });
    expect(snapshot.session.pausedAt - snapshot.session.startedAt - snapshot.session.totalPausedMs).toBe(
      pausedSession.pausedAt - pausedSession.startedAt - pausedSession.totalPausedMs,
    );
    expect(snapshot.player.totalXp).toBe(xpBeforeClose);
    expect(harness.ui.statuses.at(-1)?.text).toContain("Focus: 0 · Honesty: -7.25");
  });

  test("rejects missing, non-numeric, and non-finite close values before changing state", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const initialSnapshot = await readFile(snapshotPath, "utf8");

    for (const args of ["", "4", " | 2", "2 | ", "NaN | 1", "Infinity | 2", "1 | -Infinity", "2 | nope", "1 | 2 | 3"]) {
      await harness.runClose(args);
    }

    expect(await readFile(snapshotPath, "utf8")).toBe(initialSnapshot);
    expect(harness.ui.notifications.slice(-9).every(({ type }) => type === "warning")).toBe(true);
    expect(harness.ui.statuses.at(-1)?.text).toContain("Session: open");
  });

  test("does not resume or close a closed Session again, but allows a fresh Session", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");
    await harness.runClose("1 | 1");
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const closedSnapshot = await readFile(snapshotPath, "utf8");

    await harness.runResume();
    await harness.runClose("5 | 5");
    expect(await readFile(snapshotPath, "utf8")).toBe(closedSnapshot);
    expect(harness.ui.statuses.at(-1)?.text).toContain("Session fechada");

    await harness.runStart("Japanese | Direct Practice");
    expect(JSON.parse(await readFile(snapshotPath, "utf8")).session).toMatchObject({
      status: "open",
      domain: "Japanese",
      primaryTechnique: "Direct Practice",
    });
  });

  test("abandons and resumes a Session without losing accumulated study time", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const opened = JSON.parse(await readFile(snapshotPath, "utf8")).session;

    await harness.runAbandon();
    const paused = JSON.parse(await readFile(snapshotPath, "utf8")).session;
    expect(paused).toMatchObject({
      status: "paused",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: opened.startedAt,
    });
    expect(paused.pausedAt).toBeGreaterThanOrEqual(opened.startedAt);
    expect(harness.ui.statuses.at(-1)?.text).toContain("Session pausada");
    expect(harness.ui.statuses.at(-1)?.text).toContain("Elapsed:");

    await harness.runResume();
    const resumed = JSON.parse(await readFile(snapshotPath, "utf8")).session;
    expect(resumed).toMatchObject({
      status: "open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: opened.startedAt,
    });
    expect(resumed.totalPausedMs).toBeGreaterThanOrEqual(0);
    expect(harness.ui.statuses.at(-1)?.text).toContain("Session retomada");
  });

  test("rejects abandon and resume when the Session is in the wrong state", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const initialSnapshot = await readFile(snapshotPath, "utf8");

    await harness.runAbandon();
    await harness.runResume();
    expect(await readFile(snapshotPath, "utf8")).toBe(initialSnapshot);

    await harness.runStart("React | Active Recall");
    const openSnapshot = await readFile(snapshotPath, "utf8");
    await harness.runResume();
    expect(await readFile(snapshotPath, "utf8")).toBe(openSnapshot);

    await harness.runAbandon();
    const pausedSnapshot = await readFile(snapshotPath, "utf8");
    await harness.runAbandon();
    expect(await readFile(snapshotPath, "utf8")).toBe(pausedSnapshot);
    expect(harness.ui.notifications.at(-1)?.type).toBe("warning");
  });

  test("rejects invalid start arguments without changing or persisting state", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const initialSnapshot = await readFile(snapshotPath, "utf8");

    for (const args of ["", "React", " | Active Recall", "React | ", "   |   "]) {
      await harness.runStart(args);
    }

    expect(await readFile(snapshotPath, "utf8")).toBe(initialSnapshot);
    expect(harness.ui.notifications.slice(-5).every(({ type }) => type === "warning")).toBe(true);
    expect(harness.ui.statuses.at(-1)?.text).toContain("Session: nenhuma ativa");
  });

  test("does not retain a Session in memory when its snapshot cannot be persisted", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await rm(join(cwd, ".lori"), { recursive: true, force: true });
    await writeFile(join(cwd, ".lori"), "not a directory");

    await harness.runStart("React | Active Recall");
    await harness.runStatus();

    expect(harness.ui.notifications.at(-2)?.type).toBe("error");
    expect(harness.ui.notifications.at(-2)?.message).toContain("não foi possível persistir");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Session: nenhuma ativa");
  });

  test("rejects replacing an open Session without changing its persisted snapshot", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const openedSnapshot = await readFile(snapshotPath, "utf8");

    await harness.runStart("Japanese | Direct Practice");

    expect(await readFile(snapshotPath, "utf8")).toBe(openedSnapshot);
    expect(harness.ui.notifications.at(-1)?.message).toContain("já existe uma Session aberta");
    expect(harness.ui.notifications.at(-1)?.message).toContain("não foi substituída");
    expect(harness.ui.statuses.at(-1)?.text).toContain("Domain: React");
    expect(harness.ui.statuses.at(-1)?.text).not.toContain("Japanese");
  });

  test("restores an open Session as paused and persists its excluded pause time", async () => {
    const { cwd, harness } = await createHarness();
    await mkdir(join(cwd, ".lori"), { recursive: true });
    await writeFile(join(cwd, ".lori", "snapshot.json"), JSON.stringify({
      schemaVersion: 1,
      player: { totalXp: 0 },
      session: {
        status: "open",
        domain: "React",
        primaryTechnique: "Active Recall",
        startedAt: Date.now() - 65_000,
      },
      skinConfig: { skin: "minimal" },
    }));

    await harness.start();
    await harness.runStatus();

    expect(harness.ui.statuses.at(-1)?.text).toContain("Session restaurada como pausada");
    expect(harness.ui.statuses.at(-1)?.text).toContain("Elapsed: 00:01:05");
    expect(harness.ui.widgets.at(-1)?.content?.join(" ")).toContain("Elapsed: 00:01:05");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Elapsed: 00:01:05");

    const restoredSnapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(restoredSnapshot.session).toMatchObject({ status: "paused" });
    expect(typeof restoredSnapshot.session.pausedAt).toBe("number");
    await harness.runStatus();
    expect(harness.ui.notifications.at(-1)?.message).toContain("Elapsed: 00:01:05");
  });

  test("restores a paused Session from the project snapshot", async () => {
    const { cwd, harness: firstInstance } = await createHarness();
    await firstInstance.start();
    await firstInstance.runStart("Japanese | Direct Practice");
    const savedSnapshot = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");

    const { harness: reloadedInstance } = await createHarness(cwd);
    await reloadedInstance.start();
    await reloadedInstance.runStatus();

    expect(reloadedInstance.ui.statuses.at(-1)?.text).toContain("Session restaurada como pausada");
    expect(reloadedInstance.ui.statuses.at(-1)?.text).toContain("Domain: Japanese");
    expect(reloadedInstance.ui.widgets.at(-1)?.content?.join(" ")).toContain("Primary Technique: Direct Practice");
    expect(reloadedInstance.ui.notifications.at(-1)?.message).toContain("Elapsed: 00:00:00");
    expect(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).not.toBe(savedSnapshot);
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

  test("uses the configured custom Skin in status and dashboard output", async () => {
    const { cwd, harness } = await createHarness();
    await mkdir(join(cwd, ".lori", "skins"), { recursive: true });
    await writeFile(
      join(cwd, ".lori", "snapshot.json"),
      JSON.stringify({
        schemaVersion: 1,
        player: { totalXp: 15 },
        session: null,
        skinConfig: { skin: "terminal" },
      }),
    );
    await writeFile(
      join(cwd, ".lori", "skins", "terminal.json"),
      JSON.stringify({ id: "terminal", templates: { "status.idle": "Terminal XP={totalXp}" } }),
    );

    await harness.start();
    await harness.runStatus();

    expect(harness.ui.statuses.at(-1)?.text).toBe("Terminal XP=15");
    expect(harness.ui.widgets.at(-1)?.content?.join(" ")).toBe("Lori Terminal XP=15");
    expect(harness.ui.notifications.at(-1)?.message).toBe("Terminal XP=15");
  });

  test("renders a restored and paused Session with the configured custom Skin", async () => {
    const { cwd, harness } = await createHarness();
    await mkdir(join(cwd, ".lori", "skins"), { recursive: true });
    await writeFile(
      join(cwd, ".lori", "snapshot.json"),
      JSON.stringify({
        schemaVersion: 1,
        player: { totalXp: 15 },
        session: {
          status: "open",
          domain: "React",
          primaryTechnique: "Active Recall",
          startedAt: Date.now() - 65_000,
        },
        skinConfig: { skin: "terminal" },
      }),
    );
    await writeFile(
      join(cwd, ".lori", "skins", "terminal.json"),
      JSON.stringify({
        id: "terminal",
        templates: {
          "session.restored": "Terminal restored Session {domain} | {technique} | {elapsed}",
          "session.paused": "Terminal paused Session {domain} | {technique} | {elapsed}",
        },
      }),
    );

    await harness.start();
    await harness.runStatus();

    expect(harness.ui.statuses.at(-1)?.text).toBe(
      "Terminal restored Session React | Active Recall | 00:01:05",
    );
    expect(harness.ui.widgets.at(-1)?.content?.join(" ")).toBe(
      "Lori Terminal restored Session React | Active Recall | 00:01:05",
    );

    await harness.runStatus();
    expect(harness.ui.notifications.at(-1)?.message).toBe(
      "Terminal paused Session React | Active Recall | 00:01:05",
    );
  });

  test("preserves a missing custom Skin ID in the snapshot and uses Minimal", async () => {
    const { cwd, harness } = await createHarness();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    await mkdir(join(cwd, ".lori"), { recursive: true });
    await writeFile(
      snapshotPath,
      JSON.stringify({
        schemaVersion: 1,
        player: { totalXp: 6 },
        session: null,
        skinConfig: { skin: "not-installed" },
      }),
    );

    await harness.start();
    await harness.runStatus();

    expect(harness.ui.statuses.at(-1)?.text).toBe(
      "Lori · Session: nenhuma ativa · XP: 6 · Skin Minimal",
    );
    expect(harness.ui.notifications.at(-1)?.message).toBe(
      "Lori · Session: nenhuma ativa · XP: 6 · Skin Minimal",
    );
    expect(JSON.parse(await readFile(snapshotPath, "utf8")).skinConfig.skin).toBe("not-installed");
  });

  test("preserves a configured ID when its custom Skin file is invalid", async () => {
    const { cwd, harness } = await createHarness();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    await mkdir(join(cwd, ".lori", "skins"), { recursive: true });
    await writeFile(
      snapshotPath,
      JSON.stringify({
        schemaVersion: 1,
        player: { totalXp: 4 },
        session: null,
        skinConfig: { skin: "broken" },
      }),
    );
    await writeFile(join(cwd, ".lori", "skins", "broken.json"), "{not json");

    await harness.start();

    expect(harness.ui.statuses.at(-1)?.text).toBe(
      "Lori · Session: nenhuma ativa · XP: 4 · Skin Minimal",
    );
    expect(JSON.parse(await readFile(snapshotPath, "utf8")).skinConfig.skin).toBe("broken");
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
