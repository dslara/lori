import { chmod, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
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
  confirmCalls: Array<{ title: string; message: string }>;
  confirmResponses: boolean[];
  notify(message: string, type?: "info" | "warning" | "error"): void;
  setStatus(key: string, text: string | undefined): void;
  setWidget(key: string, content: string[] | undefined): void;
  select(title: string, options: string[]): Promise<string | undefined>;
  input(title: string, placeholder?: string): Promise<string | undefined>;
  confirm(title: string, message: string): Promise<boolean>;
};

type StartHandler = (event: { type: "session_start"; reason: "startup" }, ctx: { cwd: string; ui: UI }) => void | Promise<void>;
type ShutdownHandler = () => void | Promise<void>;
type CommandHandler = (args: string, ctx: { ui: UI; isIdle?(): boolean }) => void | Promise<void>;
type RegisteredTool = {
  parameters: unknown;
  execute: (...args: never[]) => unknown;
};

type Harness = {
  start(): Promise<void>;
  shutdown(): Promise<void>;
  runStatus(): Promise<void>;
  runInit(args: string): Promise<void>;
  runStart(args: string): Promise<void>;
  runClose(args: string): Promise<void>;
  runAbandon(): Promise<void>;
  runResume(): Promise<void>;
  runCurate(args?: string): Promise<void>;
  runApprove(args?: string): Promise<void>;
  submitCuration(params: unknown): Promise<unknown>;
  toolParameters(name: string): unknown;
  sentUserMessages: string[];
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
  const registeredTools = new Map<string, RegisteredTool>();
  const sentUserMessages: string[] = [];
  const ui: UI = {
    notifications: [],
    statuses: [],
    widgets: [],
    selectCalls: [],
    selectResponses: [],
    inputCalls: [],
    inputResponses: [],
    confirmCalls: [],
    confirmResponses: [],
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
    async confirm(title, message) {
      this.confirmCalls.push({ title, message });
      return this.confirmResponses.shift() ?? false;
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
    registerTool(definition: { name: string; parameters: unknown; execute: (...args: never[]) => unknown }) {
      registeredTools.set(definition.name, definition);
    },
    sendUserMessage(content: string) {
      sentUserMessages.push(content);
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
      async runInit(args) {
        const handler = commandHandlers.get("lori-init");
        expect(handler).toBeDefined();
        await handler?.(args, { ui });
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
        await handler?.("", { ui, isIdle: () => true });
      },
      async runCurate(args = "") {
        const handler = commandHandlers.get("lori-curate");
        expect(handler).toBeDefined();
        await handler?.(args, { ui, isIdle: () => true });
      },
      async runApprove(args = "") {
        const handler = commandHandlers.get("lori-approve");
        expect(handler).toBeDefined();
        await handler?.(args, { ui, isIdle: () => true });
      },
      async submitCuration(params) {
        const tool = registeredTools.get("lori_submit_chapter");
        expect(tool).toBeDefined();
        if (!tool) return undefined;
        return await Reflect.apply(tool.execute, undefined, ["tool-call", params, undefined, undefined, { ui, cwd, hasUI: true }]);
      },
      toolParameters(name) {
        return registeredTools.get(name)?.parameters;
      },
      sentUserMessages,
    },
  };
}

async function prepareCurationDraft(harness: Harness): Promise<void> {
  await harness.start();
  harness.ui.inputResponses.push(
    "Spanish",
    "Hold a basic conversation while traveling",
    "I am visiting family this summer",
    "sem prazo",
    "4",
    "Audio and short dialogues",
    "No paid-only materials",
  );
  harness.ui.selectResponses.push("4 · Consigo aplicar sem orientação na maioria dos casos");
  await harness.runInit("");
}

async function approveFirstChapter(harness: Harness): Promise<void> {
  await harness.runCurate();
  await harness.submitCuration(validCuration(curationRequestIds(harness)));
  harness.ui.confirmResponses.push(true);
  harness.ui.inputResponses.push("3", "4");
  await harness.runApprove();
}

function curationRequestIds(harness: Harness): { requestId: string; domainId: string } {
  const message = harness.sentUserMessages.at(-1) ?? "";
  const requestId = message.match(/requestId: ([a-f0-9-]+)/)?.[1];
  const domainId = message.match(/domainId: ([a-f0-9-]+)/)?.[1];
  if (!requestId || !domainId) {
    throw new Error("The curation request must identify its current request and Domain draft.");
  }
  return { requestId, domainId };
}

function validCuration(params: { requestId: string; domainId: string }): Record<string, unknown> {
  return {
    ...params,
    result: {
      status: "proposal",
      proposal: {
        outcome: "Hold a short conversation to arrange a meal in Spanish.",
        nodes: [
          {
            id: "greetings",
            order: 1,
            objective: "Recognize and use common greetings in a short exchange.",
            evidenceRefs: [{ resourceId: "resource-1", evidenceId: "greetings-excerpt" }],
            recommendedResourceId: "resource-1",
          },
          {
            id: "ordering",
            order: 2,
            objective: "Ask for a meal and respond to a simple follow-up question.",
            evidenceRefs: [{ resourceId: "resource-1", evidenceId: "ordering-excerpt" }],
            recommendedResourceId: "resource-1",
          },
        ],
        principle: "Directness",
        exitProof: {
          description: "Record a role-play arranging a meal without reading a script.",
          criteria: ["The recording includes a greeting, an order, and a relevant response to one follow-up question."],
        },
        effort: {
          minimumHours: 3,
          maximumHours: 5,
          estimateRationale: "The range includes listening and repeated short role-plays.",
          deadline: null,
          hoursPerWeek: 4,
          feasibility: "At four hours per week, the estimate fits the declared availability without promising a completion date.",
        },
        resources: [
          {
            id: "resource-1",
            title: "Spanish greetings and ordering dialogue",
            url: "https://example.org/spanish-dialogue",
            justification: "The short audio dialogue matches the stated preference and provides language used in the Exit Proof.",
            limitations: "The dialogue uses a regional accent that may differ from the Player's travel destination.",
            compatibility: {
              preferencesConsidered: "The source includes a short audio dialogue.",
              restrictionsConsidered: "The source is freely accessible and does not require payment.",
              compatible: true,
            },
            evidence: [
              { id: "greetings-excerpt", excerpt: "Buenos días, ¿cómo está?", locator: "00:14–00:18" },
              { id: "ordering-excerpt", excerpt: "Quisiera pedir una sopa, por favor.", locator: "00:42–00:47" },
            ],
            author: "Example Language Institute",
            language: "Spanish",
            format: "Audio dialogue with transcript",
            access: "Public, no account required",
          },
        ],
      },
    },
  };
}

describe("Lori Chapter curation", () => {
  test("a rejected Chapter approval leaves the draft and proposal unchanged", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    await harness.submitCuration(validCuration(curationRequestIds(harness)));
    const before = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");

    harness.ui.confirmResponses.push(false);
    await harness.runApprove();

    expect(harness.ui.confirmCalls).toHaveLength(1);
    expect(harness.ui.confirmCalls[0]?.title).toContain("Chapter");
    expect(harness.ui.confirmCalls[0]?.message).toContain("Domain");
    expect(harness.ui.notifications.some(({ message }) => message.includes("Proposta pendente"))).toBe(true);
    expect(JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"))).toEqual(JSON.parse(before));
    expect(harness.ui.notifications.at(-1)?.message).toContain("proposta pendente permanecem intactos");
  });

  test("canceling Chapter approval preserves the proposal for another explicit review", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    await harness.submitCuration(validCuration(curationRequestIds(harness)));
    const before = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");

    harness.ui.confirmResponses.push(false, false);
    await harness.runApprove();
    await harness.runApprove();

    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot).toEqual(JSON.parse(before));
    expect(snapshot.domainDraft.phase).toBe("awaiting_approval");
    expect(snapshot.domains).toEqual([]);
    expect(harness.ui.confirmCalls).toHaveLength(2);
    expect(harness.ui.notifications.some(({ message }) => message.includes("Proposta pendente"))).toBe(true);
  });

  test("explicit approval activates the reserved Domain and links the open Metalearning Session to its first Chapter version", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    const { domainId } = curationRequestIds(harness);
    await harness.submitCuration(validCuration(curationRequestIds(harness)));
    const proposal = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).domainDraft.pendingChapter;

    harness.ui.confirmResponses.push(true);
    await harness.runApprove();

    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.schemaVersion).toBe(4);
    expect(snapshot.domains).toHaveLength(1);
    const domain = snapshot.domains[0];
    expect(domain).toMatchObject({
      id: domainId,
      name: "Spanish",
      learningObjective: "Hold a basic conversation while traveling",
      status: "active",
      questionnaire: {
        motivation: "I am visiting family this summer",
        deadline: null,
        hoursPerWeek: 4,
        baseline: 4,
        preferences: "Audio and short dialogues",
        materialRestrictions: "No paid-only materials",
      },
      chapters: [{ version: 1, chapter: proposal }],
    });
    expect(domain.chapters[0].id).toEqual(expect.any(String));
    expect(domain.chapters[0].approvedAt).toEqual(expect.any(Number));
    expect(domain.currentChapterVersionId).toBe(domain.chapters[0].id);
    expect(snapshot.domainDraft).toMatchObject({ id: domainId, phase: "awaiting_verdict" });
    expect(snapshot.domainDraft.pendingChapter).toBeUndefined();
    expect(snapshot.session).toMatchObject({
      kind: "metalearning",
      status: "paused",
      domainId,
      chapterRef: { domainId, chapterVersionId: domain.chapters[0].id },
    });
    expect(snapshot.session.verdict).toBeUndefined();
    expect(snapshot.sessionHistory).toEqual([]);
    expect(snapshot.player.totalXp).toBe(0);

    await harness.runClose("4 | 4");
    const afterCloseAttempt = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(afterCloseAttempt.session.status).toBe("paused");
    expect(afterCloseAttempt.session.verdict).toBeUndefined();

    const { harness: restored } = await createHarness(cwd);
    await restored.start();
    const restoredSnapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(restoredSnapshot.domains).toEqual(snapshot.domains);
    expect(restoredSnapshot.domainDraft.phase).toBe("awaiting_verdict");
    expect(restoredSnapshot.session).toMatchObject({ status: "paused", chapterRef: snapshot.session.chapterRef });
    await restored.runResume();
    expect(restored.ui.notifications.at(-1)?.message).toContain("Focus ainda não foi enviada");
    expect(restored.ui.inputCalls.map(({ title }) => title)).toEqual(["Focus — informe um número finito"]);
  });

  test("approval collects Focus and Honesty separately, closes with the approved Chapter reference, and preserves the Verdict in later history", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    const { domainId } = curationRequestIds(harness);
    await harness.submitCuration(validCuration(curationRequestIds(harness)));
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const beforeApproval = JSON.parse(await readFile(snapshotPath, "utf8"));
    beforeApproval.player.totalXp = 37;
    await writeFile(snapshotPath, JSON.stringify(beforeApproval));
    harness.ui.confirmResponses.push(true);
    harness.ui.inputResponses.push("NaN", "-123.5", "Infinity", "1e200");

    await harness.runApprove();

    const closed = JSON.parse(await readFile(snapshotPath, "utf8"));
    const chapterRef = { domainId, chapterVersionId: closed.domains[0].currentChapterVersionId };
    expect(harness.ui.inputCalls.slice(-4)).toEqual([
      { title: "Focus — informe um número finito", placeholder: undefined },
      { title: "Focus — informe um número finito", placeholder: undefined },
      { title: "Honesty — informe um número finito", placeholder: undefined },
      { title: "Honesty — informe um número finito", placeholder: undefined },
    ]);
    expect(harness.ui.notifications.filter(({ type }) => type === "warning")).toHaveLength(2);
    expect(closed.session).toMatchObject({
      kind: "metalearning",
      status: "closed",
      domainId,
      verdict: { focus: -123.5, honesty: 1e200, chapterRef },
    });
    expect(closed.session.verdict).not.toHaveProperty("chapter");
    expect(closed.domainDraft).toBeNull();
    expect(closed.player.totalXp).toBe(37);
    expect(closed).not.toHaveProperty("cards");
    expect(closed).not.toHaveProperty("weaknesses");
    expect(closed.domains[0].chapters).toHaveLength(1);
    expect(harness.ui.statuses.at(-1)?.text).toContain("Focus: -123.5 · Honesty: 1e+200");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Session fechada");

    await harness.runStart("Later | Active Recall");

    const continued = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(continued.sessionHistory).toEqual([closed.session]);
    expect(continued.session).toMatchObject({ status: "open", name: "Later" });
    expect(continued.player.totalXp).toBe(37);
    expect(harness.ui.statuses.at(-1)?.text).toContain("Focus: -123.5 · Honesty: 1e+200");
    expect(harness.ui.statuses.at(-1)?.text).toContain(chapterRef.chapterVersionId);
  });

  test("resuming after Focus was saved asks only for Honesty and keeps the saved answer", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    await harness.submitCuration(validCuration(curationRequestIds(harness)));
    harness.ui.confirmResponses.push(true);
    harness.ui.inputResponses.push("0.125", undefined);

    await harness.runApprove();

    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const paused = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(paused.domainDraft).toMatchObject({ phase: "awaiting_verdict", verdictFocus: 0.125 });
    expect(paused.session).toMatchObject({ kind: "metalearning", status: "paused" });
    expect(harness.ui.inputCalls.slice(-2).map(({ title }) => title)).toEqual([
      "Focus — informe um número finito",
      "Honesty — informe um número finito",
    ]);

    const { harness: restored } = await createHarness(cwd);
    await restored.start();
    restored.ui.inputResponses.push("-1e200");
    await restored.runResume();

    const closed = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(restored.ui.inputCalls).toEqual([
      { title: "Honesty — informe um número finito", placeholder: undefined },
    ]);
    expect(closed.domainDraft).toBeNull();
    expect(closed.session).toMatchObject({
      kind: "metalearning",
      status: "closed",
      verdict: { focus: 0.125, honesty: -1e200 },
    });
    expect(closed.player.totalXp).toBe(0);
  });

  test("sends the saved questionnaire only after explicit /lori-curate and registers a TypeBox tool", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);

    expect(harness.sentUserMessages).toEqual([]);
    await harness.runCurate();

    expect(harness.sentUserMessages).toHaveLength(1);
    expect(harness.sentUserMessages[0]).toContain("Hold a basic conversation while traveling");
    expect(harness.sentUserMessages[0]).toContain("Baseline: 4");
    expect(harness.sentUserMessages[0]).toContain("Horas por semana: 4");
    expect(harness.sentUserMessages[0]).toContain("Audio and short dialogues");
    expect(harness.sentUserMessages[0]).toContain("No paid-only materials");
    expect(harness.toolParameters("lori_submit_chapter")).toMatchObject({ type: "object" });
    expect(JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).domainDraft.phase).toBe("awaiting_curation");
  });

  test("persists and presents a referenced proposal as pending without activating the Domain", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    const params = curationRequestIds(harness);

    await harness.submitCuration(validCuration(params));

    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.domainDraft).toMatchObject({ phase: "awaiting_approval" });
    expect(snapshot.domainDraft.pendingChapter).toMatchObject({
      outcome: "Hold a short conversation to arrange a meal in Spanish.",
    });
    expect(snapshot.domainDraft.pendingChapter.resources[0]).toMatchObject({
      author: "Example Language Institute",
      evidence: [{ id: "greetings-excerpt", excerpt: "Buenos días, ¿cómo está?", locator: "00:14–00:18" }, { id: "ordering-excerpt" }],
    });
    expect(snapshot.domains ?? []).toEqual([]);
    expect(harness.ui.notifications.at(-1)?.message).toContain("1. greetings");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Exit Proof");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Example Language Institute");
    expect(harness.ui.notifications.at(-1)?.message).toContain("ainda não está ativo");
  });

  test("restores a pending proposal for review without triggering another agent turn", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    await harness.submitCuration(validCuration(curationRequestIds(harness)));

    const { harness: restored } = await createHarness(cwd);
    await restored.start();
    await restored.runResume();

    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.domainDraft.phase).toBe("awaiting_approval");
    expect(snapshot.session.status).toBe("open");
    expect(restored.sentUserMessages).toEqual([]);
    expect(restored.ui.notifications.at(-1)?.message).toContain("Proposta pendente");
    expect(restored.ui.notifications.at(-1)?.message).toContain("aguarda a decisão explícita");
  });

  test("rejects a proposal with inconsistent evidence references without persisting it", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    const params = curationRequestIds(harness);
    const before = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");
    const invalid = validCuration(params);
    const result = invalid.result as { proposal: { nodes: Array<{ evidenceRefs: Array<{ evidenceId: string }> }> } };
    result.proposal.nodes[0]!.evidenceRefs[0]!.evidenceId = "missing-evidence";

    await harness.submitCuration(invalid);

    expect(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).toBe(before);
    expect(harness.ui.notifications.at(-1)?.message).toContain("referência");
  });

  test("blocks proposals without resources or compatible, traceable sources and asks the Player for a decision", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    const params = curationRequestIds(harness);
    const before = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");
    const empty = validCuration(params);
    const emptyResult = empty.result as { proposal: { resources: unknown[] } };
    emptyResult.proposal.resources = [];

    await harness.submitCuration(empty);

    expect(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).toBe(before);
    expect(harness.ui.notifications.at(-1)?.message).toContain("não encontrou fontes compatíveis");
    expect(harness.ui.notifications.at(-1)?.message).toContain("decisão");
  });

  test("rejects more than three resources at the TypeBox tool boundary", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    const params = curationRequestIds(harness);
    const before = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");
    const invalid = validCuration(params);
    const result = invalid.result as { proposal: { resources: Array<Record<string, unknown>> } };
    result.proposal.resources.push({ ...result.proposal.resources[0], id: "resource-2" });
    result.proposal.resources.push({ ...result.proposal.resources[0], id: "resource-3" });
    result.proposal.resources.push({ ...result.proposal.resources[0], id: "resource-4" });

    await harness.submitCuration(invalid);

    expect(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).toBe(before);
    expect(harness.ui.notifications.at(-1)?.message).toContain("não aceitou a resposta estruturada");
  });

  test("rejects an untraceable HTTP source even when its tool payload is structurally valid", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    const params = curationRequestIds(harness);
    const before = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");
    const invalid = validCuration(params);
    const result = invalid.result as { proposal: { resources: Array<{ url: string }> } };
    result.proposal.resources[0]!.url = "http://example.org/spanish-dialogue";

    await harness.submitCuration(invalid);

    expect(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).toBe(before);
    expect(harness.ui.notifications.at(-1)?.message).toContain("URL não verificável");
  });

  test("rejects tool calls not authorized by the current curation request", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    const params = curationRequestIds(harness);
    const before = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");

    await harness.submitCuration(validCuration({ ...params, requestId: "stale-request" }));

    expect(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).toBe(before);
    expect(harness.ui.notifications.at(-1)?.message).toContain("request atual");
  });

  test("rejects a matching tool call after the Session leaves the authorized open phase", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    const params = curationRequestIds(harness);
    await harness.runAbandon();
    const before = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");

    await harness.submitCuration(validCuration(params));

    expect(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).toBe(before);
    expect(harness.ui.notifications.at(-1)?.message).toContain("fase ou a request atual mudou");
  });

  test("explicitly selects an active Domain and reuses its saved questionnaire without opening a Session", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await approveFirstChapter(harness);
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const before = JSON.parse(await readFile(snapshotPath, "utf8"));
    const domain = before.domains[0];
    const selectedDomain = `${domain.name} · ${domain.learningObjective} [${domain.id}]`;
    harness.ui.selectResponses.push(selectedDomain);

    await harness.runCurate();

    const after = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(harness.ui.selectCalls.at(-1)).toMatchObject({
      title: "Escolher Domain para re-curar",
      options: [selectedDomain],
    });
    expect(harness.sentUserMessages).toHaveLength(2);
    expect(harness.sentUserMessages.at(-1)).toContain("Hold a basic conversation while traveling");
    expect(harness.sentUserMessages.at(-1)).toContain("I am visiting family this summer");
    expect(harness.sentUserMessages.at(-1)).toContain("Audio and short dialogues");
    expect(harness.sentUserMessages.at(-1)).toContain("No paid-only materials");
    expect(after.session).toEqual(before.session);
    expect(after.domainDraft).toBeNull();
    expect(after.domains[0]).toEqual(before.domains[0]);
  });

  test("canceling active-Domain selection leaves the snapshot and current Chapter unchanged", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await approveFirstChapter(harness);
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const before = await readFile(snapshotPath, "utf8");

    harness.ui.selectResponses.push(undefined);
    await harness.runCurate();

    expect(await readFile(snapshotPath, "utf8")).toBe(before);
    expect(harness.sentUserMessages).toHaveLength(1);
    expect(harness.ui.notifications.at(-1)?.message).not.toContain("Session iniciada");
  });

  test("stores a re-curation proposal separately and rejection leaves the approved Chapter current", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await approveFirstChapter(harness);
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const before = JSON.parse(await readFile(snapshotPath, "utf8"));
    const domain = before.domains[0];
    harness.ui.selectResponses.push(`${domain.name} · ${domain.learningObjective} [${domain.id}]`);
    await harness.runCurate();
    await harness.submitCuration(validCuration(curationRequestIds(harness)));

    const proposed = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(proposed.domains[0].pendingChapter).toMatchObject({
      outcome: "Hold a short conversation to arrange a meal in Spanish.",
    });
    expect(proposed.domains[0].chapters).toEqual(before.domains[0].chapters);
    expect(proposed.domains[0].currentChapterVersionId).toBe(before.domains[0].currentChapterVersionId);

    const beforeRejection = await readFile(snapshotPath, "utf8");
    harness.ui.confirmResponses.push(false);
    await harness.runApprove();
    expect(await readFile(snapshotPath, "utf8")).toBe(beforeRejection);
    expect(harness.ui.notifications.at(-1)?.message).toContain("Chapter atual permanece ativo");
  });

  test("authorizes active-Domain proposals by the current request ID", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await approveFirstChapter(harness);
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const before = await readFile(snapshotPath, "utf8");
    const domain = JSON.parse(before).domains[0];
    const selectedDomain = `${domain.name} · ${domain.learningObjective} [${domain.id}]`;
    harness.ui.selectResponses.push(selectedDomain, selectedDomain);
    await harness.runCurate();
    const staleRequest = curationRequestIds(harness);
    await harness.runCurate();

    await harness.submitCuration(validCuration(staleRequest));

    expect(await readFile(snapshotPath, "utf8")).toBe(before);
    expect(harness.ui.notifications.at(-1)?.message).toContain("request atual");
  });

  test("keeps an in-progress Metalearning Verdict linked to its original Chapter after re-curation approval", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    await harness.submitCuration(validCuration(curationRequestIds(harness)));
    harness.ui.confirmResponses.push(true);
    await harness.runApprove();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const awaitingVerdict = JSON.parse(await readFile(snapshotPath, "utf8"));
    const domain = awaitingVerdict.domains[0];
    const originalChapterVersionId = domain.currentChapterVersionId;
    expect(awaitingVerdict.session.status).toBe("paused");
    harness.ui.selectResponses.push(`${domain.name} · ${domain.learningObjective} [${domain.id}]`);
    await harness.runCurate();
    await harness.submitCuration(validCuration(curationRequestIds(harness)));
    harness.ui.confirmResponses.push(true);

    await harness.runApprove();

    const reapproved = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(reapproved.domains[0].currentChapterVersionId).not.toBe(originalChapterVersionId);
    expect(reapproved.session.chapterRef).toEqual({ domainId: domain.id, chapterVersionId: originalChapterVersionId });
    expect(reapproved.domainDraft.phase).toBe("awaiting_verdict");
    const { harness: restored } = await createHarness(cwd);
    await restored.start();
    restored.ui.inputResponses.push("5", "4");
    await restored.runResume();

    const closed = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(closed.session.verdict.chapterRef).toEqual({ domainId: domain.id, chapterVersionId: originalChapterVersionId });
    expect(closed.domainDraft).toBeNull();
  });

  test("restores a pending re-curation proposal without automatically starting research on resume", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await approveFirstChapter(harness);
    await harness.runStart("Later | Active Recall");
    await harness.runAbandon();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const paused = JSON.parse(await readFile(snapshotPath, "utf8"));
    const domain = paused.domains[0];
    harness.ui.selectResponses.push(`${domain.name} · ${domain.learningObjective} [${domain.id}]`);
    await harness.runCurate();
    await harness.submitCuration(validCuration(curationRequestIds(harness)));

    const { harness: restored } = await createHarness(cwd);
    await restored.start();
    await restored.runResume();

    const resumed = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(resumed.schemaVersion).toBe(4);
    expect(resumed.domains[0].pendingChapter.outcome).toBe("Hold a short conversation to arrange a meal in Spanish.");
    expect(resumed.domains[0].currentChapterVersionId).toBe(domain.currentChapterVersionId);
    expect(resumed.session.status).toBe("open");
    expect(restored.sentUserMessages).toEqual([]);
  });

  test("approves a new Chapter version without deleting old versions or rewriting historical Verdict references", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await approveFirstChapter(harness);
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const before = JSON.parse(await readFile(snapshotPath, "utf8"));
    const domain = before.domains[0];
    const originalSession = before.session;
    const oldVersion = domain.currentChapterVersionId;
    harness.ui.selectResponses.push(`${domain.name} · ${domain.learningObjective} [${domain.id}]`);
    await harness.runCurate();
    await harness.submitCuration(validCuration(curationRequestIds(harness)));
    harness.ui.confirmResponses.push(true);

    await harness.runApprove();

    const approved = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(approved.domains[0].chapters).toHaveLength(2);
    expect(approved.domains[0].chapters[0]).toEqual(domain.chapters[0]);
    expect(approved.domains[0].chapters[1]).toMatchObject({ version: 2 });
    expect(approved.domains[0].currentChapterVersionId).toBe(approved.domains[0].chapters[1].id);
    expect(approved.domains[0]).not.toHaveProperty("pendingChapter");
    expect(approved.session).toEqual(originalSession);
    expect(approved.session.verdict.chapterRef).toEqual({ domainId: domain.id, chapterVersionId: oldVersion });

    await harness.runStart("Later | Active Recall");
    const withHistory = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(withHistory.sessionHistory[0].verdict.chapterRef).toEqual({ domainId: domain.id, chapterVersionId: oldVersion });
  });

  test("a blocked research result does not advance the draft and explains the impediment", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    const params = curationRequestIds(harness);
    const before = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");

    await harness.submitCuration({ ...params, result: { status: "blocked", reason: "As fontes acessíveis encontradas exigem pagamento, contra a restrição declarada." } });

    const after = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(JSON.stringify(after)).toBe(JSON.stringify(JSON.parse(before)));
    expect(after.domainDraft.phase).toBe("awaiting_curation");
    expect(harness.ui.notifications.at(-1)?.message).toContain("contra a restrição declarada");
    expect(harness.ui.notifications.at(-1)?.message).toContain("decisão");
  });
});

describe("Lori startup and status", () => {
  test("collects a Domain draft one question at a time without activating it", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    harness.ui.inputResponses.push(
      "Spanish",
      "Hold a basic conversation while traveling",
      "I am visiting family this summer",
      "sem prazo",
      "4",
      "Audio and short dialogues",
      "No paid-only materials",
    );
    harness.ui.selectResponses.push("4 · Consigo aplicar sem orientação na maioria dos casos");

    await harness.runInit("");

    expect(harness.ui.inputCalls).toEqual([
      { title: "Nome do Domain", placeholder: undefined },
      { title: "Learning Objective", placeholder: undefined },
      { title: "Motivação", placeholder: undefined },
      { title: "Prazo ou 'sem prazo'", placeholder: undefined },
      { title: "Horas por semana", placeholder: undefined },
      { title: "Preferências de materiais (opcional)", placeholder: undefined },
      { title: "Restrições de materiais (opcional)", placeholder: undefined },
    ]);
    expect(harness.ui.selectCalls).toEqual([{
      title: "Baseline — selecione sua familiaridade atual (não é um teste)",
      options: [
        "1 · Nenhuma familiaridade: nunca estudei ou usei",
        "2 · Familiaridade inicial: reconheço alguns conceitos",
        "3 · Familiaridade intermediária: aplico o básico com consulta",
        "4 · Consigo aplicar sem orientação na maioria dos casos",
        "5 · Familiaridade profunda: explico, adapto e resolvo casos novos",
      ],
    }]);

    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.domainDraft).toMatchObject({
      phase: "awaiting_curation",
      name: "Spanish",
      learningObjective: "Hold a basic conversation while traveling",
      motivation: "I am visiting family this summer",
      deadline: null,
      hoursPerWeek: 4,
      baseline: 4,
      preferences: "Audio and short dialogues",
      materialRestrictions: "No paid-only materials",
    });
    expect(snapshot.domainDraft.id).toEqual(expect.any(String));
    expect(snapshot.session).toMatchObject({
      kind: "metalearning",
      status: "open",
      domainId: snapshot.domainDraft.id,
    });
    expect(snapshot.domains ?? []).toEqual([]);

    await harness.runStart("Spanish | Active Recall");

    const afterStartAttempt = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(afterStartAttempt.session).toMatchObject({ kind: "metalearning", domainId: snapshot.domainDraft.id });
    expect(harness.ui.notifications.at(-1)?.message).toContain("não está ativo");
  });

  test("resumes a persisted Domain draft at its next unanswered question", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    harness.ui.inputResponses.push("Rust", undefined);

    await harness.runInit("");

    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const pausedSnapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    const reservedId = pausedSnapshot.domainDraft.id;
    expect(pausedSnapshot.domainDraft).toEqual({ id: reservedId, phase: "collecting", name: "Rust" });
    expect(pausedSnapshot.session).toMatchObject({
      kind: "metalearning",
      status: "paused",
      domainId: reservedId,
    });

    const { harness: restored } = await createHarness(cwd);
    await restored.start();
    restored.ui.inputResponses.push(
      "Build command-line tools",
      "I want to contribute to an open-source project",
      "sem prazo",
      "2",
      "",
      "",
    );
    restored.ui.selectResponses.push("1 · Nenhuma familiaridade: nunca estudei ou usei");

    await restored.runResume();

    expect(restored.ui.inputCalls.map(({ title }) => title)).toEqual([
      "Learning Objective",
      "Motivação",
      "Prazo ou 'sem prazo'",
      "Horas por semana",
      "Preferências de materiais (opcional)",
      "Restrições de materiais (opcional)",
    ]);
    const completedSnapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(completedSnapshot.domainDraft).toMatchObject({
      id: reservedId,
      phase: "awaiting_curation",
      name: "Rust",
      learningObjective: "Build command-line tools",
      motivation: "I want to contribute to an open-source project",
      deadline: null,
      hoursPerWeek: 2,
      baseline: 1,
      preferences: null,
      materialRestrictions: null,
    });
    expect(completedSnapshot.session).toMatchObject({
      kind: "metalearning",
      status: "open",
      domainId: reservedId,
    });
    expect(completedSnapshot.domains ?? []).toEqual([]);
  });

  test("requires an explicit deadline or 'sem prazo' instead of treating an empty answer as no deadline", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    harness.ui.inputResponses.push("Data Science", "Build a small classifier", "Explore this career path", "   ");

    await harness.runInit("");

    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const paused = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(paused.domainDraft).toMatchObject({
      phase: "collecting",
      name: "Data Science",
      learningObjective: "Build a small classifier",
      motivation: "Explore this career path",
    });
    expect(paused.domainDraft).not.toHaveProperty("deadline");
    expect(paused.session.status).toBe("paused");
    expect(harness.ui.notifications.some(({ message }) => message.includes("declare explicitamente 'sem prazo'"))).toBe(true);
  });

  test("rejects Domain preparation with arguments or another open/paused Session", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const initialSnapshot = await readFile(snapshotPath, "utf8");

    await harness.runInit("Physics");
    expect(await readFile(snapshotPath, "utf8")).toBe(initialSnapshot);
    expect(harness.ui.notifications.at(-1)?.message).toContain("sem argumentos");

    await harness.runStart("React | Active Recall");
    const openSnapshot = await readFile(snapshotPath, "utf8");
    const callsBeforeOpenRejection = harness.ui.inputCalls.length;
    await harness.runInit("");
    expect(await readFile(snapshotPath, "utf8")).toBe(openSnapshot);
    expect(harness.ui.inputCalls).toHaveLength(callsBeforeOpenRejection);

    await harness.runAbandon();
    const pausedSnapshot = await readFile(snapshotPath, "utf8");
    const callsBeforePausedRejection = harness.ui.inputCalls.length;
    await harness.runInit("");
    expect(await readFile(snapshotPath, "utf8")).toBe(pausedSnapshot);
    expect(harness.ui.inputCalls).toHaveLength(callsBeforePausedRejection);
  });

  test("initializes a new project with Minimal skin and exposes the initial state", async () => {
    const { cwd, harness } = await createHarness();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");

    expect(await readdir(cwd)).toEqual([]);
    await harness.start();

    const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(await readdir(join(cwd, ".lori"))).toEqual(["snapshot.json"]);
    expect(snapshot).toEqual({
      schemaVersion: 4,
      player: { totalXp: 0 },
      session: null,
      sessionHistory: [],
      domains: [],
      domainDraft: null,
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
      name: "React",
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

    harness.ui.inputResponses.push("Rust");
    harness.ui.selectResponses.push(undefined);
    await harness.runStart("");
    expect(await readFile(snapshotPath, "utf8")).toBe(initialSnapshot);
    expect(harness.ui.inputCalls).toHaveLength(2);
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
      name: "React",
      primaryTechnique: "Active Recall",
    });
  });

  test("uses the latest closed Session from the project snapshot", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    snapshot.session = {
      kind: "legacyStudy",
      status: "closed",
      name: "Japanese",
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
      name: "Japanese",
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
      name: "Math",
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
      name: "Japanese",
      primaryTechnique: "Active Recall",
    });
  });

  test("lets the Player replace only the missing value from the last closed Session", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");
    await harness.runClose("1 | 1");
    harness.ui.selectResponses.push("Informar outro Primary Technique", "Informar outra técnica");
    harness.ui.inputResponses.push("Direct Practice");

    await harness.runStart("Japanese |");

    expect(harness.ui.selectCalls[1]?.options).toContain("Active Recall · Retrieval");
    expect(harness.ui.selectCalls[1]?.options).toContain("Informar outra técnica");
    expect(harness.ui.inputCalls).toEqual([
      { title: "Primary Technique da Session", placeholder: undefined },
    ]);
    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.session).toMatchObject({
      status: "open",
      name: "Japanese",
      primaryTechnique: "Direct Practice",
    });
  });

  test("lets the Player enter a new pair instead of reusing the last closed Session", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    await harness.runStart("React | Active Recall");
    await harness.runClose("1 | 1");
    harness.ui.selectResponses.push("Informar um novo par", "Informar outra técnica");
    harness.ui.inputResponses.push("Rust", "Direct Practice");

    await harness.runStart("");

    expect(harness.ui.selectCalls[1]?.options).toContain("Active Recall · Retrieval");
    expect(harness.ui.inputCalls).toEqual([
      { title: "Domain da Session", placeholder: undefined },
      { title: "Primary Technique da Session", placeholder: undefined },
    ]);
    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.session).toMatchObject({
      status: "open",
      name: "Rust",
      primaryTechnique: "Direct Practice",
    });
  });

  test("prompts for a Domain and primary Technique on the first Session", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    harness.ui.inputResponses.push("Rust");
    harness.ui.selectResponses.push("Active Recall · Retrieval");

    await harness.runStart("");

    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(harness.ui.inputCalls).toEqual([
      { title: "Domain da Session", placeholder: undefined },
    ]);
    expect(harness.ui.selectCalls[0]?.title).toBe("Escolher Primary Technique");
    expect(harness.ui.selectCalls[0]?.options).toContain("Active Recall · Retrieval");
    expect(harness.ui.selectCalls[0]?.options).toContain("Informar outra técnica");
    expect(snapshot.session).toMatchObject({
      status: "open",
      name: "Rust",
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
    expect(closedSnapshot.schemaVersion).toBe(4);
    expect(closedSnapshot.player.totalXp).toBe(before.player.totalXp);
    expect(closedSnapshot.session).toMatchObject({
      status: "closed",
      name: "React",
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
      name: "Japanese",
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
      name: "React",
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
      name: "React",
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
      name: "Japanese",
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
      expect(await readSession()).toMatchObject({
        kind: "legacyStudy",
        status: "paused",
        name: "React",
        pausedAt: 3_000,
      });

      await harness.runResume();
      expect((await readSession()).status).toBe("open");

      await harness.runClose("1 | 1");
      expect(await readSession()).toMatchObject({
        kind: "legacyStudy",
        status: "closed",
        name: "React",
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

  test("preserves the snapshot when reading its contents fails", async () => {
    const { cwd, harness } = await createHarness();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const originalContents = JSON.stringify({
      schemaVersion: 1,
      player: { totalXp: 23 },
      session: null,
      skinConfig: { skin: "minimal" },
    });
    await mkdir(join(cwd, ".lori"), { recursive: true });
    await writeFile(snapshotPath, originalContents);
    await chmod(snapshotPath, 0);

    try {
      await harness.start();
    } finally {
      await chmod(snapshotPath, 0o644);
    }

    expect(harness.ui.notifications[0]?.message).toContain("não foi possível ler");
    expect(harness.ui.notifications[0]?.message).toContain("preservado");
    expect(await readFile(snapshotPath, "utf8")).toBe(originalContents);
  });

  test("reports and preserves a snapshot with an unsupported schema version", async () => {
    const { cwd, harness } = await createHarness();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const originalContents = JSON.stringify({
      schemaVersion: 5,
      player: { totalXp: 0 },
      session: null,
      skinConfig: { skin: "minimal" },
    });
    await mkdir(join(cwd, ".lori"), { recursive: true });
    await writeFile(snapshotPath, originalContents);

    await harness.start();
    await harness.runStatus();

    expect(harness.ui.notifications[0]?.type).toBe("error");
    expect(harness.ui.notifications[0]?.message).toContain("não suportada (5)");
    expect(harness.ui.notifications[0]?.message).toContain("preservado");
    expect(harness.ui.notifications.at(-1)?.message).toContain("não suportada");
    expect(await readFile(snapshotPath, "utf8")).toBe(originalContents);
  });

  test("migrates a closed v1 Session to legacyStudy and archives its Verdict when a new Session starts", async () => {
    const { cwd, harness } = await createHarness();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const legacySession = {
      status: "closed",
      domain: "Japanese",
      primaryTechnique: "Direct Practice",
      startedAt: 1_000,
      totalPausedMs: 250,
      pausedAt: 2_000,
      closedAt: 2_500,
      verdict: { focus: 2.5, honesty: 4 },
    };
    await mkdir(join(cwd, ".lori"), { recursive: true });
    await writeFile(snapshotPath, JSON.stringify({
      schemaVersion: 1,
      player: { totalXp: 87 },
      session: legacySession,
      skinConfig: { skin: "terminal" },
    }));

    await harness.start();

    const migrated = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(migrated).toMatchObject({
      schemaVersion: 4,
      player: { totalXp: 87 },
      session: {
        kind: "legacyStudy",
        status: "closed",
        name: "Japanese",
        primaryTechnique: "Direct Practice",
        startedAt: 1_000,
        totalPausedMs: 250,
        pausedAt: 2_000,
        closedAt: 2_500,
        verdict: { focus: 2.5, honesty: 4 },
      },
      sessionHistory: [],
      skinConfig: { skin: "terminal" },
    });
    expect(migrated.session.learningObjective).toBeUndefined();
    expect(migrated.domains ?? []).toEqual([]);

    await harness.runStart("Rust | Retrieval");

    const continued = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(continued.session).toMatchObject({
      kind: "legacyStudy",
      status: "open",
      name: "Rust",
      primaryTechnique: "Retrieval",
    });
    expect(continued.sessionHistory).toEqual([migrated.session]);
    expect(continued.player.totalXp).toBe(87);
    expect(continued.skinConfig.skin).toBe("terminal");
  });

  test("resumes and closes a migrated paused legacyStudy without losing its original name or timestamps", async () => {
    const { cwd, harness } = await createHarness();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    await mkdir(join(cwd, ".lori"), { recursive: true });
    await writeFile(snapshotPath, JSON.stringify({
      schemaVersion: 1,
      player: { totalXp: 17 },
      session: {
        status: "paused",
        domain: "Calculus",
        primaryTechnique: "Feynman Technique",
        startedAt: 1_000,
        totalPausedMs: 100,
        pausedAt: 2_000,
      },
      skinConfig: { skin: "minimal" },
    }));

    await harness.start();

    const migrated = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(migrated.session).toMatchObject({
      kind: "legacyStudy",
      status: "paused",
      name: "Calculus",
      primaryTechnique: "Feynman Technique",
      startedAt: 1_000,
      totalPausedMs: 100,
      pausedAt: 2_000,
    });
    await harness.runResume();
    await harness.runClose("3 | 4");

    const closed = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(closed.session).toMatchObject({
      kind: "legacyStudy",
      status: "closed",
      name: "Calculus",
      primaryTechnique: "Feynman Technique",
      startedAt: 1_000,
      verdict: { focus: 3, honesty: 4 },
    });
    expect(closed.session.closedAt).toBeGreaterThanOrEqual(
      closed.session.startedAt + closed.session.totalPausedMs,
    );
    expect(closed.player.totalXp).toBe(17);
  });

  test("preserves a v1 snapshot when atomic migration writing fails", async () => {
    const { cwd, harness } = await createHarness();
    const loriDir = join(cwd, ".lori");
    const snapshotPath = join(loriDir, "snapshot.json");
    const originalContents = JSON.stringify({
      schemaVersion: 1,
      player: { totalXp: 23 },
      session: null,
      skinConfig: { skin: "minimal" },
    });
    await mkdir(loriDir, { recursive: true });
    await writeFile(snapshotPath, originalContents);
    await chmod(loriDir, 0o555);

    try {
      await harness.start();
    } finally {
      await chmod(loriDir, 0o755);
    }

    expect(harness.ui.notifications[0]?.message).toContain("não foi possível migrar");
    expect(harness.ui.notifications[0]?.message).toContain("original foi preservado");
    expect(await readFile(snapshotPath, "utf8")).toBe(originalContents);
  });

  test("preserves an invalid v1 snapshot when migration validation fails", async () => {
    const { cwd, harness } = await createHarness();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const originalContents = JSON.stringify({
      schemaVersion: 1,
      player: { totalXp: 23 },
      session: {
        status: "paused",
        domain: "React",
        primaryTechnique: "Active Recall",
        startedAt: 1_000,
        totalPausedMs: 0,
        pausedAt: 999,
      },
      skinConfig: { skin: "minimal" },
    });
    await mkdir(join(cwd, ".lori"), { recursive: true });
    await writeFile(snapshotPath, originalContents);

    await harness.start();

    expect(harness.ui.notifications[0]?.type).toBe("error");
    expect(harness.ui.notifications[0]?.message).toContain("preservado");
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

});
