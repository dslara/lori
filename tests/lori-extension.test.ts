import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, spyOn, test } from "bun:test";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import loriExtension from "../extensions/lori/index.ts";

type UI = {
  notifications: Array<{ message: string; type?: string }>;
  statuses: Array<{ key: string; text: string | undefined }>;
  widgets: Array<{ key: string; content: string[] | undefined }>;
  selectCalls: Array<{ title: string; options: string[] }>;
  selectResponses: Array<string | undefined>;
  inputCalls: Array<{ title: string; placeholder: string | undefined }>;
  inputResponses: Array<string | undefined>;
  notify(message: string, type?: "info" | "warning" | "error"): void;
  setStatus(key: string, text: string | undefined): void;
  setWidget(key: string, content: string[] | undefined): void;
  select(title: string, options: string[]): Promise<string | undefined>;
  input(title: string, placeholder?: string): Promise<string | undefined>;
};

type StartHandler = (event: { type: "session_start"; reason: "startup" }, ctx: { cwd: string; ui: UI }) => void | Promise<void>;
type ShutdownHandler = () => void | Promise<void>;
type CommandHandler = (args: string, ctx: { ui: UI }) => void | Promise<void>;

type Harness = {
  start(): Promise<void>;
  shutdown(): Promise<void>;
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
  if (!existingCwd) {
    projectDirs.push(cwd);
  }
  let startHandler: StartHandler | undefined;
  let shutdownHandler: ShutdownHandler | undefined;
  const commandHandlers = new Map<string, CommandHandler>();
  const ui: UI = {
    notifications: [],
    statuses: [],
    widgets: [],
    selectCalls: [],
    selectResponses: [],
    inputCalls: [],
    inputResponses: [],
    notify(message, type) {
      this.notifications.push({ message, type });
    },
    setStatus(key, text) {
      this.statuses.push({ key, text });
    },
    setWidget(key, content) {
      this.widgets.push({ key, content });
    },
    async select(title, options) {
      this.selectCalls.push({ title, options });
      return this.selectResponses.shift();
    },
    async input(title, placeholder) {
      this.inputCalls.push({ title, placeholder });
      return this.inputResponses.shift();
    },
  };

  const api = {
    on(event: string, handler: StartHandler | ShutdownHandler) {
      if (event === "session_start") {
        startHandler = handler as StartHandler;
      }
      if (event === "session_shutdown") {
        shutdownHandler = handler as ShutdownHandler;
      }
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
      async shutdown() {
        expect(shutdownHandler).toBeDefined();
        await shutdownHandler?.();
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
    expect(harness.ui.statuses.at(-1)?.text).toContain("Skin Minimal");

    await harness.runStatus();
    expect(harness.ui.notifications.at(-1)?.message).toContain("Session: nenhuma ativa");
    expect(harness.ui.notifications.at(-1)?.message).toContain("XP: 0");
  });

  test("cleans up idempotently on shutdown without changing the game snapshot", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const savedSnapshot = await readFile(snapshotPath, "utf8");

    await harness.shutdown();
    await harness.shutdown();
    await harness.runStatus();

    expect(await readFile(snapshotPath, "utf8")).toBe(savedSnapshot);
    expect(harness.ui.notifications.at(-1)?.type).toBe("warning");
    expect(harness.ui.notifications.at(-1)?.message).toContain("ainda não foi inicializada");
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
    expect(harness.ui.selectCalls).toHaveLength(0);
    expect(harness.ui.inputCalls).toHaveLength(0);
    const status = harness.ui.statuses.at(-1)?.text ?? "";
    expect(status).toContain("Session: open");
    expect(status).toContain("Domain: React");
    expect(status).toContain("Primary Technique: Active Recall");
    expect(status).toContain("Elapsed: 00:00:00");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Session: open");

    await harness.runStatus();
    expect(harness.ui.notifications.at(-1)?.message).toContain("Domain: React");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Primary Technique: Active Recall");
  });

  test("does not persist when a start prompt is cancelled or blank", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const initialSnapshot = await readFile(snapshotPath, "utf8");

    harness.ui.inputResponses.push("   ");
    await harness.runStart("");
    expect(await readFile(snapshotPath, "utf8")).toBe(initialSnapshot);
    expect(harness.ui.inputCalls).toHaveLength(1);

    harness.ui.inputResponses.push("Rust", undefined);
    await harness.runStart("");
    expect(await readFile(snapshotPath, "utf8")).toBe(initialSnapshot);
    expect(harness.ui.inputCalls).toHaveLength(3);
  });

  test("cancelling the previous-pair menu leaves the closed Session unchanged", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");
    await harness.runClose("1 | 1");
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const closedSnapshot = await readFile(snapshotPath, "utf8");
    harness.ui.selectResponses.push(undefined);

    await harness.runStart("");

    expect(await readFile(snapshotPath, "utf8")).toBe(closedSnapshot);
    expect(harness.ui.inputCalls).toHaveLength(0);
  });

  test("offers the last closed Session pair for reuse when starting without args", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");
    await harness.runClose("1 | 1");
    harness.ui.selectResponses.push("Reutilizar: React | Active Recall");

    await harness.runStart("");

    expect(harness.ui.selectCalls).toEqual([
      {
        title: "Iniciar com os valores anteriores?",
        options: ["Reutilizar: React | Active Recall", "Informar um novo par"],
      },
    ]);
    expect(harness.ui.inputCalls).toHaveLength(0);
    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.session).toMatchObject({
      status: "open",
      domain: "React",
      primaryTechnique: "Active Recall",
    });
  });

  test("uses the latest closed Session from the project snapshot", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    snapshot.session = {
      status: "closed",
      domain: "Japanese",
      primaryTechnique: "Direct Practice",
      startedAt: 1_000,
      totalPausedMs: 0,
      closedAt: 2_000,
      verdict: { focus: 1, honesty: 1 },
    };
    await writeFile(snapshotPath, JSON.stringify(snapshot));
    harness.ui.selectResponses.push("Reutilizar: Japanese | Direct Practice");

    await harness.runStart("");

    expect(harness.ui.selectCalls).toEqual([
      {
        title: "Iniciar com os valores anteriores?",
        options: ["Reutilizar: Japanese | Direct Practice", "Informar um novo par"],
      },
    ]);
    const savedSnapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(savedSnapshot.session).toMatchObject({
      status: "open",
      domain: "Japanese",
      primaryTechnique: "Direct Practice",
    });
  });

  test("prompts only for the missing Domain in a partial command", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    harness.ui.inputResponses.push("Math");

    await harness.runStart(" | Active Recall");

    expect(harness.ui.inputCalls).toEqual([
      { title: "Domain da Session", placeholder: undefined },
    ]);
    expect(harness.ui.selectCalls).toHaveLength(0);
    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.session).toMatchObject({
      status: "open",
      domain: "Math",
      primaryTechnique: "Active Recall",
    });
  });

  test("suggests only the missing primary Technique for a partial command", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");
    await harness.runClose("1 | 1");
    harness.ui.selectResponses.push("Reutilizar: Active Recall");

    await harness.runStart("Japanese |");

    expect(harness.ui.selectCalls).toEqual([
      {
        title: "Escolher Primary Technique",
        options: ["Reutilizar: Active Recall", "Informar outro Primary Technique"],
      },
    ]);
    expect(harness.ui.inputCalls).toHaveLength(0);
    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.session).toMatchObject({
      status: "open",
      domain: "Japanese",
      primaryTechnique: "Active Recall",
    });
  });

  test("lets the Player replace only the missing value from the last closed Session", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");
    await harness.runClose("1 | 1");
    harness.ui.selectResponses.push("Informar outro Primary Technique");
    harness.ui.inputResponses.push("Direct Practice");

    await harness.runStart("Japanese |");

    expect(harness.ui.inputCalls).toEqual([
      { title: "Primary Technique da Session", placeholder: undefined },
    ]);
    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.session).toMatchObject({
      status: "open",
      domain: "Japanese",
      primaryTechnique: "Direct Practice",
    });
  });

  test("lets the Player enter a new pair instead of reusing the last closed Session", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");
    await harness.runClose("1 | 1");
    harness.ui.selectResponses.push("Informar um novo par");
    harness.ui.inputResponses.push("Rust", "Direct Practice");

    await harness.runStart("");

    expect(harness.ui.inputCalls).toEqual([
      { title: "Domain da Session", placeholder: undefined },
      { title: "Primary Technique da Session", placeholder: undefined },
    ]);
    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.session).toMatchObject({
      status: "open",
      domain: "Rust",
      primaryTechnique: "Direct Practice",
    });
  });

  test("prompts for a Domain and primary Technique on the first Session", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    harness.ui.inputResponses.push("Rust", "Active Recall");

    await harness.runStart("");

    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(harness.ui.inputCalls).toEqual([
      { title: "Domain da Session", placeholder: undefined },
      { title: "Primary Technique da Session", placeholder: undefined },
    ]);
    expect(harness.ui.selectCalls).toHaveLength(0);
    expect(snapshot.session).toMatchObject({
      status: "open",
      domain: "Rust",
      primaryTechnique: "Active Recall",
    });
  });

  test("refreshes the dashboard elapsed time when /lori-status is run", async () => {
    const { harness } = await createHarness();
    const now = spyOn(Date, "now").mockReturnValue(1_000);

    try {
      await harness.start();
      await harness.runStart("React | Active Recall");
      now.mockReturnValue(61_000);

      await harness.runStatus();

      expect(harness.ui.statuses.at(-1)?.text).toContain("Elapsed: 00:01:00");
      expect(harness.ui.notifications.at(-1)?.message).toContain("Elapsed: 00:01:00");
    } finally {
      now.mockRestore();
    }
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

    for (const args of ["React", "|", "   |   "]) {
      await harness.runStart(args);
    }

    expect(await readFile(snapshotPath, "utf8")).toBe(initialSnapshot);
    expect(harness.ui.notifications.slice(-3).every(({ type }) => type === "warning")).toBe(true);
    expect(harness.ui.inputCalls).toHaveLength(0);
    expect(harness.ui.selectCalls).toHaveLength(0);
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

  test("does not reject a full pair using stale in-memory Session state", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");

    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    snapshot.session = {
      ...snapshot.session,
      status: "closed",
      closedAt: snapshot.session.startedAt + snapshot.session.totalPausedMs,
      verdict: { focus: 1, honesty: 1 },
    };
    await writeFile(snapshotPath, JSON.stringify(snapshot));

    await harness.runStart("Japanese | Direct Practice");

    const savedSnapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(savedSnapshot.session).toMatchObject({
      status: "open",
      domain: "Japanese",
      primaryTechnique: "Direct Practice",
    });
  });

  test("rejects start before prompting when a Session is open or paused", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");

    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const openSnapshot = await readFile(snapshotPath, "utf8");
    const inputCallCount = harness.ui.inputCalls.length;
    const selectCallCount = harness.ui.selectCalls.length;
    await harness.runStart("");

    expect(await readFile(snapshotPath, "utf8")).toBe(openSnapshot);
    expect(harness.ui.inputCalls).toHaveLength(inputCallCount);
    expect(harness.ui.selectCalls).toHaveLength(selectCallCount);
    expect(harness.ui.notifications.at(-1)?.message).toContain("já existe uma Session ativa");

    await harness.runAbandon();
    const pausedSnapshot = await readFile(snapshotPath, "utf8");
    const pausedInputCallCount = harness.ui.inputCalls.length;
    const pausedSelectCallCount = harness.ui.selectCalls.length;
    await harness.runStart("| Active Recall");

    expect(await readFile(snapshotPath, "utf8")).toBe(pausedSnapshot);
    expect(harness.ui.inputCalls).toHaveLength(pausedInputCallCount);
    expect(harness.ui.selectCalls).toHaveLength(pausedSelectCallCount);
    expect(harness.ui.notifications.at(-1)?.message).toContain("já existe uma Session ativa");
  });

  test("rejects replacing an open Session without changing its persisted snapshot", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const openedSnapshot = await readFile(snapshotPath, "utf8");

    await harness.runStart("Japanese | Direct Practice");

    expect(await readFile(snapshotPath, "utf8")).toBe(openedSnapshot);
    const rejection = harness.ui.notifications.at(-1)?.message ?? "";
    expect(rejection).toContain("Session não iniciada");
    expect(rejection).toContain("já existe uma Session ativa");
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

    expect(harness.ui.statuses.at(-1)?.text).toContain("Session restaurada como pausada");
    await harness.runStatus();

    expect(harness.ui.statuses.at(-1)?.text).toContain("Session pausada");
    expect(harness.ui.statuses.at(-1)?.text).toContain("Elapsed: 00:01:05");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Session pausada");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Elapsed: 00:01:05");

    const restoredSnapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(restoredSnapshot.session).toMatchObject({ status: "paused" });
    expect(typeof restoredSnapshot.session.pausedAt).toBe("number");
    await harness.runStatus();
    expect(harness.ui.notifications.at(-1)?.message).toContain("Elapsed: 00:01:05");
  });

  test("restores and transitions a Session when the system clock moved backward", async () => {
    const { cwd, harness } = await createHarness();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    await mkdir(join(cwd, ".lori"), { recursive: true });
    await writeFile(snapshotPath, JSON.stringify({
      schemaVersion: 1,
      player: { totalXp: 0 },
      session: {
        status: "open",
        domain: "React",
        primaryTechnique: "Active Recall",
        startedAt: 1_000,
        totalPausedMs: 2_000,
      },
      skinConfig: { skin: "minimal" },
    }));
    const now = spyOn(Date, "now").mockReturnValue(2_500);
    const readSession = async () => JSON.parse(await readFile(snapshotPath, "utf8")).session;

    try {
      await harness.start();
      expect(await readSession()).toMatchObject({ status: "paused", pausedAt: 3_000 });

      await harness.runResume();
      expect((await readSession()).status).toBe("open");

      await harness.runClose("1 | 1");
      expect(await readSession()).toMatchObject({
        status: "closed",
        closedAt: 3_000,
      });
    } finally {
      now.mockRestore();
    }
  });

  test("restores a paused Session from the project snapshot", async () => {
    const { cwd, harness: firstInstance } = await createHarness();
    await firstInstance.start();
    await firstInstance.runStart("Japanese | Direct Practice");
    const savedSnapshot = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");

    const { harness: reloadedInstance } = await createHarness(cwd);
    await reloadedInstance.start();

    expect(reloadedInstance.ui.statuses.at(-1)?.text).toContain("Session restaurada como pausada");
    await reloadedInstance.runStatus();

    expect(reloadedInstance.ui.statuses.at(-1)?.text).toContain("Session pausada");
    expect(reloadedInstance.ui.statuses.at(-1)?.text).toContain("Domain: Japanese");
    expect(reloadedInstance.ui.statuses.at(-1)?.text).toContain("Primary Technique: Direct Practice");
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
    expect(reloadedInstance.ui.statuses.at(-1)?.text).toContain("Session: nenhuma ativa");
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

    expect(harness.ui.statuses.at(-1)?.text).toBe(
      "Terminal restored Session React | Active Recall | 00:01:05",
    );

    await harness.runStatus();
    expect(harness.ui.statuses.at(-1)?.text).toBe(
      "Terminal paused Session React | Active Recall | 00:01:05",
    );
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
    expect(harness.ui.notifications.at(-1)?.message).toContain("não suportada");
    expect(await readFile(snapshotPath, "utf8")).toBe(originalContents);
  });

  test("uses the configured Skin for Session command feedback", async () => {
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
        templates: {
          "session.open": "Terminal open {domain}",
          "session.startRejected": "Terminal start rejected {domain}",
          "session.pauseRejected": "Terminal pause rejected {domain}",
          "session.paused": "Terminal paused {domain}",
          "session.resumeRejected": "Terminal resume rejected {domain}",
          "session.resumed": "Terminal resumed {domain}",
          "session.closed": "Terminal closed {domain} {focus}/{honesty}",
          "session.closeRejected": "Terminal close rejected {domain}",
        },
      }),
    );

    await harness.start();
    await harness.runStart("React | Active Recall");
    expect(harness.ui.notifications.at(-1)?.message).toBe("Terminal open React");

    await harness.runStart("Japanese | Direct Practice");
    expect(harness.ui.notifications.at(-1)?.message).toBe("Terminal start rejected Japanese");

    await harness.runResume();
    expect(harness.ui.notifications.at(-1)?.message).toBe("Terminal resume rejected React");

    await harness.runAbandon();
    expect(harness.ui.notifications.at(-1)?.message).toBe("Terminal paused React");

    await harness.runAbandon();
    expect(harness.ui.notifications.at(-1)?.message).toBe("Terminal pause rejected React");

    await harness.runResume();
    expect(harness.ui.notifications.at(-1)?.message).toBe("Terminal resumed React");

    await harness.runClose("4 | 5");
    expect(harness.ui.notifications.at(-1)?.message).toBe("Terminal closed React 4/5");

    await harness.runClose("4 | 5");
    expect(harness.ui.notifications.at(-1)?.message).toBe("Terminal close rejected React");
  });

  test("prevents two extension instances from replacing the same active Session", async () => {
    const { cwd, harness: first } = await createHarness();
    await first.start();
    const { harness: second } = await createHarness(cwd);
    await second.start();

    await Promise.all([
      first.runStart("React | Active Recall"),
      second.runStart("Japanese | Direct Practice"),
    ]);

    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    const notifications = [...first.ui.notifications, ...second.ui.notifications];
    const infos = notifications.filter(({ type }) => type === "info");
    const warnings = notifications.filter(({ type }) => type === "warning");
    expect(infos).toHaveLength(1);
    expect(warnings).toHaveLength(1);
    expect(["React", "Japanese"]).toContain(snapshot.session.domain);
  });
});
