import { chmod, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, spyOn, test } from "bun:test";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import loriExtension from "../extensions/lori/index.ts";

type UI = {
  notifications: Array<{ message: string; type?: string }>;
  statuses: Array<{ key: string; text: string | undefined }>;
  widgets: Array<{
    key: string;
    content: string[] | undefined;
    placement?: "aboveEditor" | "belowEditor";
  }>;
  selectCalls: Array<{ title: string; options: string[] }>;
  selectResponses: Array<string | undefined>;
  inputCalls: Array<{ title: string; placeholder: string | undefined }>;
  inputResponses: Array<string | undefined>;
  confirmCalls: Array<{ title: string; message: string }>;
  confirmResponses: boolean[];
  notify(message: string, type?: "info" | "warning" | "error"): void;
  setStatus(key: string, text: string | undefined): void;
  setWidget(
    key: string,
    content: string[] | undefined,
    options?: { placement?: "aboveEditor" | "belowEditor" },
  ): void;
  select(title: string, options: string[]): Promise<string | undefined>;
  input(title: string, placeholder?: string): Promise<string | undefined>;
  confirm(title: string, message: string): Promise<boolean>;
};

type StartHandler = (event: { type: "session_start"; reason: "startup" }, ctx: { cwd: string; ui: UI }) => void | Promise<void>;
type ShutdownHandler = () => void | Promise<void>;
type AgentStartHandler = (event: { type: "agent_start" }) => void | Promise<void>;
type AgentEndHandler = (event: { type: "agent_end"; messages: unknown[] }) => void | Promise<void>;
type ToolCallHandler = (event: { toolName: string; toolCallId: string; input: Record<string, unknown> }) => unknown;
type ToolResultHandler = (event: {
  toolName: string;
  toolCallId: string;
  input: Record<string, unknown>;
  content: Array<{ type: "text"; text: string }>;
  isError: boolean;
}) => unknown;
type CommandHandler = (args: string, ctx: { ui: UI; isIdle?(): boolean }) => void | Promise<void>;
type RegisteredTool = {
  parameters: unknown;
  promptGuidelines?: string[];
  execute: (...args: never[]) => unknown;
};

type Harness = {
  cwd: string;
  start(): Promise<void>;
  shutdown(): Promise<void>;
  runStatus(): Promise<void>;
  runDelete(args: string): Promise<void>;
  runInit(args: string): Promise<void>;
  runStart(args: string): Promise<void>;
  runClose(args: string): Promise<void>;
  runAbandon(): Promise<void>;
  runResume(): Promise<void>;
  runCurate(args?: string): Promise<void>;
  runApprove(args?: string): Promise<void>;
  submitCuration(params: unknown, observeSource?: boolean): Promise<unknown>;
  observeToolCall(toolName: string, toolCallId: string): void;
  emitToolResult(toolName: string, toolCallId: string, text: string, isError?: boolean): void;
  observeToolResult(toolName: string, toolCallId: string, text: string, isError?: boolean): void;
  toolParameters(name: string): unknown;
  toolPromptGuidelines(name: string): string[] | undefined;
  sentUserMessages: string[];
  ui: UI;
};

const projectDirs: string[] = [];

function statusWidgetText(ui: UI): string {
  return ui.widgets.at(-1)?.content?.join("\n") ?? "";
}

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
  let agentStartHandler: AgentStartHandler | undefined;
  let agentEndHandler: AgentEndHandler | undefined;
  let agentRunActive = false;
  let toolCallHandler: ToolCallHandler | undefined;
  let toolResultHandler: ToolResultHandler | undefined;
  const commandHandlers = new Map<string, CommandHandler>();
  const registeredTools = new Map<string, RegisteredTool>();
  const sentUserMessages: string[] = [];
  let observedToolResultId = 0;
  const verifiedSpanishSource = [
    "https://www.spanishdict.com/guide/basic-greetings",
    "Buenos días, ¿cómo está?",
    "00:14–00:18",
    "Quisiera pedir una sopa, por favor.",
    "00:42–00:47",
  ].join("\n");
  const observeToolCall = (toolName: string, toolCallId: string): void => {
    toolCallHandler?.({ toolName, toolCallId, input: {} });
  };
  const emitToolResult = (toolName: string, toolCallId: string, text: string, isError = false): void => {
    const input = { url: text.match(/https:\/\/[^\s]+/)?.[0] ?? "" };
    toolResultHandler?.({ toolName, toolCallId, input, content: [{ type: "text", text }], isError });
  };
  const observeToolResult = (toolName: string, toolCallId: string, text: string, isError = false): void => {
    observeToolCall(toolName, toolCallId);
    emitToolResult(toolName, toolCallId, text, isError);
  };
  const endAgentRun = (): void => {
    if (!agentRunActive) {
      return;
    }
    agentRunActive = false;
    agentEndHandler?.({ type: "agent_end", messages: [] });
  };
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
    setWidget(key, content, options) {
      this.widgets.push({ key, content, placement: options?.placement });
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
      if (event === "agent_start") {
        agentStartHandler = handler as unknown as AgentStartHandler;
      }
      if (event === "agent_end") {
        agentEndHandler = handler as unknown as AgentEndHandler;
      }
      if (event === "tool_call") {
        toolCallHandler = handler as unknown as ToolCallHandler;
      }
      if (event === "tool_result") {
        toolResultHandler = handler as unknown as ToolResultHandler;
      }
    },
    registerCommand(name: string, options: { handler: CommandHandler }) {
      commandHandlers.set(name, options.handler);
    },
    registerTool(definition: {
      name: string;
      parameters: unknown;
      promptGuidelines?: string[];
      execute: (...args: never[]) => unknown;
    }) {
      registeredTools.set(definition.name, definition);
    },
    sendUserMessage(content: string) {
      sentUserMessages.push(content);
      agentRunActive = true;
      agentStartHandler?.({ type: "agent_start" });
    },
  } as unknown as ExtensionAPI;

  loriExtension(api);

  return {
    cwd,
    harness: {
      cwd,
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
      async runDelete(args) {
        const handler = commandHandlers.get("lori-delete");
        expect(handler).toBeDefined();
        await handler?.(args, { ui, isIdle: () => true });
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
        endAgentRun();
        const handler = commandHandlers.get("lori-curate");
        expect(handler).toBeDefined();
        await handler?.(args, { ui, isIdle: () => true });
      },
      async runApprove(args = "") {
        const handler = commandHandlers.get("lori-approve");
        expect(handler).toBeDefined();
        await handler?.(args, { ui, isIdle: () => true });
      },
      observeToolCall,
      emitToolResult,
      observeToolResult,
      async submitCuration(params, observeSource = true) {
        if (observeSource) {
          observeToolResult("web_fetch", `observed-source-${++observedToolResultId}`, verifiedSpanishSource);
        }
        const tool = registeredTools.get("lori_submit_chapter");
        expect(tool).toBeDefined();
        if (!tool) {
          return undefined;
        }
        const result = await Reflect.apply(tool.execute, undefined, ["tool-call", params, undefined, undefined, { ui, cwd, hasUI: true }]);
        endAgentRun();
        return result;
      },
      toolParameters(name) {
        return registeredTools.get(name)?.parameters;
      },
      toolPromptGuidelines(name) {
        return registeredTools.get(name)?.promptGuidelines;
      },
      sentUserMessages,
    },
  };
}

async function prepareCurationDraft(harness: Harness, domainName = "Spanish", start = true): Promise<void> {
  if (start) {
    await harness.start();
  }
  harness.ui.inputResponses.push(
    domainName,
    "Hold a basic conversation while traveling",
    "I am visiting family this summer",
    "sem prazo",
    "4",
    "Audio and short dialogues",
    "No paid-only materials",
  );
  harness.ui.selectResponses.push("4 · Realizo tarefas comuns com autonomia");
  await harness.runInit("");
}

async function prepareApprovedDomain(
  harness: Harness,
  acceptOffer = false,
  primaryTechnique?: string,
  domainName = "Spanish",
  start = true,
): Promise<void> {
  await prepareCurationDraft(harness, domainName, start);
  await harness.runCurate();
  await harness.submitCuration(validCuration(curationRequestIds(harness)));
  harness.ui.confirmResponses.push(true, acceptOffer);
  harness.ui.inputResponses.push("3", "4");
  if (primaryTechnique !== undefined) {
    harness.ui.selectResponses.push(primaryTechnique);
  }
  await harness.runApprove();
}

async function startApprovedStudy(
  harness: Harness,
  domainName = "React",
  primaryTechnique = "Active Recall · Retrieval",
  start = true,
): Promise<void> {
  await prepareApprovedDomain(harness, false, undefined, domainName, start);
  const snapshot = JSON.parse(await readFile(join(harness.cwd, ".lori", "snapshot.json"), "utf8"));
  const domain = snapshot.domains.find((entry: { name: string }) => entry.name === domainName);
  if (!domain) {
    throw new Error(`Expected approved ${domainName} Domain in the harness snapshot.`);
  }
  harness.ui.selectResponses.push(`${domain.name} — ${domain.learningObjective} [${domain.id}]`, primaryTechnique);
  await harness.runStart("");
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
            prerequisiteNodeIds: [],
            prerequisiteRationales: [],
            exitProofContributions: [{
              criterion: "The recording includes a greeting.",
              rationale: "This Node gives the Player the greeting needed to open the role-play recording.",
            }],
            evidenceRefs: [{ resourceId: "resource-1", evidenceId: "greetings-excerpt" }],
            recommendedResourceId: "resource-1",
          },
          {
            id: "ordering",
            order: 2,
            objective: "Ask for a meal and respond to a simple follow-up question.",
            prerequisiteNodeIds: [],
            prerequisiteRationales: [],
            exitProofContributions: [{
              criterion: "The recording includes an order and a relevant response to one follow-up question.",
              rationale: "This Node supplies the order and response practice needed for the second observable part of the role-play.",
            }],
            evidenceRefs: [{ resourceId: "resource-1", evidenceId: "ordering-excerpt" }],
            recommendedResourceId: "resource-1",
          },
        ],
        principle: "Directness",
        exitProof: {
          description: "Record a role-play arranging a meal without reading a script.",
          criteria: [
            "The recording includes a greeting.",
            "The recording includes an order and a relevant response to one follow-up question.",
          ],
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
            url: "https://www.spanishdict.com/guide/basic-greetings",
            scope: "Short beginner greeting and ordering exchanges, not advanced conversation.",
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
    expect(harness.ui.notifications.some(({ message }) => message.includes("Focus: -123.5"))).toBe(true);
    expect(harness.ui.notifications.some(({ message }) => message.includes("Honesty: 1e+200"))).toBe(true);
    expect(harness.ui.notifications.at(-1)?.message).toContain("Verdict permanece fechado");
    const domain = closed.domains[0];
    harness.ui.selectResponses.push(`${domain.name} — ${domain.learningObjective} [${domain.id}]`, "Active Recall · Retrieval");

    await harness.runStart("");

    const continued = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(continued.sessionHistory).toEqual([closed.session]);
    expect(continued.session).toMatchObject({ status: "open", kind: "study", domainId, primaryTechnique: "Active Recall" });
    expect(continued.player.totalXp).toBe(37);
    expect(harness.ui.notifications.some(({ message }) => message.includes("Focus: -123.5"))).toBe(true);
    expect(harness.ui.notifications.some(({ message }) => message.includes("Honesty: 1e+200"))).toBe(true);
    expect(harness.ui.notifications.some(({ message }) => message.includes(chapterRef.chapterVersionId))).toBe(true);
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
    expect(harness.sentUserMessages[0]).toContain("menor conjunto ordenado de Nodes");
    expect(harness.sentUserMessages[0]).toContain("scope, justificativa e limitações");
    expect(harness.toolParameters("lori_submit_chapter")).toMatchObject({ type: "object" });
    const guidelines = harness.toolPromptGuidelines("lori_submit_chapter") ?? [];
    expect(guidelines).toContain("For lori_submit_chapter, choose any research tools available in this Pi session; Lori does not impose an allowlist of tool names.");
    expect(guidelines).toContain("Before submitting a proposal with lori_submit_chapter, ensure each resource's HTTPS URL, exact excerpt, and locator appear together in a successful tool result from the current request and run.");
    expect(guidelines).toContain("Use lori_submit_chapter with status blocked when no verifiable, compatible sources satisfy the Player's restrictions.");
    expect(guidelines).toContain("If lori_submit_chapter rejects a submission, treat it as unsaved and explain the specific error; do not present the proposal as free text or relax restrictions.");
    expect(JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).domainDraft.phase).toBe("awaiting_curation");
  });

  test("redacts sensitive paths and tokens from curation context without changing persisted answers", async () => {
    const { cwd, harness } = await createHarness();
    const privatePath = "/home/player/private notes/recording.wav";
    const secret = "ghp_abcdefghijklmnopqrstuvwxyz0123456789";
    await prepareCurationDraft(harness);
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    snapshot.domainDraft.learningObjective = `Practice from "${privatePath}"`;
    snapshot.domainDraft.motivation = `Use credential api_key=${secret} for a private source`;
    snapshot.domainDraft.preferences = `Audio in "${privatePath}"`;
    await writeFile(snapshotPath, JSON.stringify(snapshot));

    await harness.runCurate();

    const context = harness.sentUserMessages.at(-1) ?? "";
    expect(context).not.toContain(privatePath);
    expect(context).not.toContain(secret);
    expect(context).toContain("[REDACTED]");
    const persisted = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(persisted.domainDraft.learningObjective).toContain(privatePath);
    expect(persisted.domainDraft.motivation).toContain(secret);
    expect(persisted.domainDraft.preferences).toContain(privatePath);
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
      scope: "Short beginner greeting and ordering exchanges, not advanced conversation.",
      evidence: [{ id: "greetings-excerpt", excerpt: "Buenos días, ¿cómo está?", locator: "00:14–00:18" }, { id: "ordering-excerpt" }],
    });
    expect(snapshot.domains ?? []).toEqual([]);
    expect(snapshot.domainDraft.pendingChapter).not.toHaveProperty("sourceEvidence");
    expect(JSON.stringify(snapshot)).not.toContain("sourceToolCalls");
    expect(harness.ui.notifications.at(-1)?.message).toContain("1. greetings");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Exit Proof");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Contribuição única ao Exit Proof:");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Necessidade desta contribuição:");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Scope: Short beginner greeting and ordering exchanges");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Example Language Institute");
    expect(harness.ui.notifications.at(-1)?.message).toContain("ainda não está ativo");
  });

  test("keeps version-4 snapshots readable when older Chapters lack the new review fields", async () => {
    const { cwd, harness } = await createHarness();
    await prepareApprovedDomain(harness);
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const oldSnapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    for (const chapter of oldSnapshot.domains[0].chapters) {
      for (const node of chapter.chapter.nodes) {
        delete node.exitProofCriterion;
        delete node.exitProofContributions;
      }
      for (const resource of chapter.chapter.resources) delete resource.scope;
    }
    await writeFile(snapshotPath, JSON.stringify(oldSnapshot));

    const { harness: restored } = await createHarness(cwd);
    await restored.start();
    const domain = oldSnapshot.domains[0];
    restored.ui.selectResponses.push(`${domain.name} — ${domain.learningObjective} [${domain.id}]`, "Active Recall · Retrieval");
    await restored.runStart("");

    const resumed = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(resumed.domains[0].currentChapterVersionId).toBe(domain.currentChapterVersionId);
    expect(resumed.session).toMatchObject({ kind: "study", domainId: domain.id, nodeId: "greetings", resourceId: "resource-1" });
    expect(restored.ui.notifications.some(({ message }) => message.includes("snapshot ilegível"))).toBe(false);
  });

  test("rejects the example.org fixture when no successful source tool result was observed", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    const params = validCuration(curationRequestIds(harness));
    const proposal = (params.result as { proposal: { resources: Array<{ url: string }> } }).proposal;
    proposal.resources[0]!.url = "https://example.org/spanish-dialogue";
    const before = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");

    await harness.submitCuration(params, false);

    expect(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).toBe(before);
    expect(harness.ui.notifications.at(-1)?.message).toContain("bloqueou a proposta");
    expect(harness.ui.notifications.at(-1)?.message).toContain("resultado bem-sucedido");
  });

  test("rejects a cited excerpt absent from the observed source result", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    const params = validCuration(curationRequestIds(harness));
    const proposal = (params.result as { proposal: { resources: Array<{ evidence: Array<{ excerpt: string }> }> } }).proposal;
    proposal.resources[0]!.evidence[0]!.excerpt = "A model-invented quotation.";
    const before = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");

    await harness.submitCuration(params);

    expect(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).toBe(before);
    expect(harness.ui.notifications.at(-1)?.message).toContain("um trecho citado ou sua localização não aparece");
  });

  test("requires successful source tool results from the current request, not stale or unrelated results", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    harness.observeToolCall("web_fetch", "old-research-call");
    await harness.runCurate();
    const params = validCuration(curationRequestIds(harness));
    const proposal = (params.result as { proposal: { resources: Array<{ url: string; evidence: Array<{ excerpt: string }> }> } }).proposal;
    const sourceText = [proposal.resources[0]!.url, ...proposal.resources[0]!.evidence.map(({ excerpt }) => excerpt)].join("\n");
    harness.emitToolResult("web_fetch", "old-research-call", sourceText);
    harness.observeToolResult("bash", "unrelated-tool", sourceText);
    harness.observeToolResult("web_fetch", "failed-source", sourceText, true);
    const before = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");

    await harness.submitCuration(params, false);

    expect(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).toBe(before);
    expect(harness.ui.notifications.at(-1)?.message).toContain("resultado bem-sucedido");
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

  test("rejects a Node contribution that names an invalid Exit Proof criterion", async () => {
    const { cwd, harness } = await createHarness();
    await prepareCurationDraft(harness);
    await harness.runCurate();
    const params = curationRequestIds(harness);
    const before = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");
    const invalid = validCuration(params);
    const proposal = (invalid.result as { proposal: { nodes: Array<{ exitProofContributions: Array<{ criterion: string }> }> } }).proposal;
    proposal.nodes[0]!.exitProofContributions[0]!.criterion = "This criterion is not in the Exit Proof.";

    await harness.submitCuration(invalid);

    expect(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).toBe(before);
    expect(harness.ui.notifications.at(-1)?.message).toContain("critério válido");
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
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const approved = JSON.parse(await readFile(snapshotPath, "utf8"));
    const approvedDomain = approved.domains[0];
    harness.ui.selectResponses.push(
      `${approvedDomain.name} — ${approvedDomain.learningObjective} [${approvedDomain.id}]`,
      "Active Recall · Retrieval",
    );
    await harness.runStart("");
    await harness.runAbandon();
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

    harness.ui.selectResponses.push(
      `${domain.name} — ${domain.learningObjective} [${domain.id}]`,
      "Active Recall · Retrieval",
    );
    await harness.runStart("");
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

describe("Lori first Study Session", () => {
  test("offers the first curated Node and resource after the Verdict, and rejection leaves the Verdict closed", async () => {
    const { cwd, harness } = await createHarness();
    await prepareApprovedDomain(harness);

    const closed = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    const confirmation = harness.ui.confirmCalls.at(-1);
    expect(confirmation?.title).toContain("primeiro estudo");
    expect(confirmation?.message).toContain("greetings");
    expect(confirmation?.message).toContain("Recognize and use common greetings");
    expect(confirmation?.message).toContain("Spanish greetings and ordering dialogue");
    expect(confirmation?.message).toContain("https://www.spanishdict.com/guide/basic-greetings");
    expect(closed.session).toMatchObject({ kind: "metalearning", status: "closed" });
    expect(closed.sessionHistory).toEqual([]);
    expect(closed.domains).toHaveLength(1);
    expect(closed.domainDraft).toBeNull();
  });

  test("accepting the offer explicitly selects Primary Technique and persists every study reference", async () => {
    const { cwd, harness } = await createHarness();
    await prepareApprovedDomain(harness, true, "Active Recall · Retrieval");

    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    const domain = snapshot.domains[0];
    const closedVerdict = snapshot.sessionHistory[0];
    expect(harness.ui.selectCalls.at(-1)?.title).toBe("Escolher Primary Technique");
    expect(harness.ui.selectCalls.at(-1)?.options).toContain("Active Recall · Retrieval");
    expect(snapshot.session).toMatchObject({
      kind: "study",
      status: "open",
      domainId: domain.id,
      chapterRef: { domainId: domain.id, chapterVersionId: domain.currentChapterVersionId },
      nodeId: "greetings",
      resourceId: "resource-1",
      primaryTechnique: "Active Recall",
    });
    expect(closedVerdict).toMatchObject({
      kind: "metalearning",
      status: "closed",
      verdict: { focus: 3, honesty: 4, chapterRef: snapshot.session.chapterRef },
    });
    expect(snapshot.player.totalXp).toBe(0);

    await harness.runStatus();
    expect(harness.ui.notifications.at(-1)?.message).toContain("greetings");
    expect(harness.ui.notifications.at(-1)?.message).toContain("resource-1");
    expect(harness.ui.notifications.at(-1)?.message).toContain(domain.currentChapterVersionId);
  });

  test("cancelling Primary Technique after accepting the offer does not open a Study Session", async () => {
    const { cwd, harness } = await createHarness();
    await prepareApprovedDomain(harness, true);

    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.session).toMatchObject({ kind: "metalearning", status: "closed" });
    expect(snapshot.sessionHistory).toEqual([]);
  });

  test("/lori-start requires an active Domain selection and rejects arbitrary Domain text", async () => {
    const { cwd, harness } = await createHarness();
    await prepareApprovedDomain(harness);
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const before = JSON.parse(await readFile(snapshotPath, "utf8"));
    harness.ui.selectCalls.length = 0;

    await harness.runStart("Unknown Domain | Active Recall");
    expect(harness.ui.selectCalls).toHaveLength(0);
    expect(JSON.parse(await readFile(snapshotPath, "utf8"))).toEqual(before);

    harness.ui.selectResponses.push("Spanish — Hold a basic conversation while traveling [" + before.domains[0].id + "]", "Active Recall · Retrieval");
    await harness.runStart("");

    const started = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(harness.ui.selectCalls[0]?.title).toContain("Domain");
    expect(harness.ui.selectCalls[0]?.options).toEqual([
      `Spanish — Hold a basic conversation while traveling [${before.domains[0].id}]`,
    ]);
    expect(started.session).toMatchObject({
      kind: "study",
      status: "open",
      domainId: before.domains[0].id,
      chapterRef: { domainId: before.domains[0].id, chapterVersionId: before.domains[0].currentChapterVersionId },
      nodeId: "greetings",
      resourceId: "resource-1",
      primaryTechnique: "Active Recall",
    });
    expect(started.sessionHistory).toEqual([before.session]);
  });
});

describe("Lori Domain deletion", () => {
  test("deletes a selected Domain and its closed Session history only after confirmation", async () => {
    const { cwd, harness } = await createHarness();
    await startApprovedStudy(harness, "Spanish");
    await harness.runClose("2 | 3");

    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const beforeSnapshot = await readFile(snapshotPath, "utf8");
    const before = JSON.parse(beforeSnapshot);
    const domain = before.domains[0];
    expect(before.session.status).toBe("closed");
    expect(before.sessionHistory).toHaveLength(1);

    const selection = `${domain.name} — ${domain.learningObjective} [${domain.id}]`;
    harness.ui.selectResponses.push(selection);
    harness.ui.confirmResponses.push(false);
    await harness.runDelete("");
    expect(await readFile(snapshotPath, "utf8")).toBe(beforeSnapshot);

    harness.ui.selectResponses.push(selection);
    harness.ui.confirmResponses.push(true);
    await harness.runDelete("");

    const after = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(after.domains).toEqual([]);
    expect(after.session).toBeNull();
    expect(after.sessionHistory).toEqual([]);
    expect(after.player).toEqual(before.player);
    expect(harness.ui.confirmCalls.at(-1)?.message).toContain(domain.name);
    expect(harness.ui.confirmCalls.at(-1)?.message).toContain("Chapter");
    expect(harness.ui.confirmCalls.at(-1)?.message).toContain("Session");
  });

  test("deletes a preparation draft and its Metalearning Session after explicit confirmation", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    harness.ui.inputResponses.push("Rust", undefined);
    await harness.runInit("");

    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const before = JSON.parse(await readFile(snapshotPath, "utf8"));
    const draft = before.domainDraft;
    expect(draft.name).toBe("Rust");
    expect(before.session).toMatchObject({ kind: "metalearning", status: "paused", domainId: draft.id });

    harness.ui.selectResponses.push(`Rust — em preparação [${draft.id}]`);
    harness.ui.confirmResponses.push(true);
    await harness.runDelete("");

    const after = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(after.domainDraft).toBeNull();
    expect(after.session).toBeNull();
    expect(after.domains).toEqual([]);
    expect(after.player).toEqual(before.player);
    expect(harness.ui.confirmCalls.at(-1)?.message).toContain("Respostas salvas");
    expect(harness.ui.confirmCalls.at(-1)?.message).toContain("Metalearning");
  });

  test("does not delete a Domain while its Study Session is open", async () => {
    const { cwd, harness } = await createHarness();
    await startApprovedStudy(harness, "Spanish");

    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const before = await readFile(snapshotPath, "utf8");
    const domain = JSON.parse(before).domains[0];
    harness.ui.selectResponses.push(`${domain.name} — ${domain.learningObjective} [${domain.id}]`);
    const confirmCallsBeforeDelete = harness.ui.confirmCalls.length;

    await harness.runDelete("");

    expect(await readFile(snapshotPath, "utf8")).toBe(before);
    expect(harness.ui.confirmCalls).toHaveLength(confirmCallsBeforeDelete);
    expect(harness.ui.notifications.at(-1)?.message).toContain("feche ou retome");
  });
});

describe("Lori startup and status", () => {
  test("shows multiline status below the editor without a footer entry", async () => {
    const { harness } = await createHarness();

    await harness.start();

    expect(harness.ui.statuses.at(-1)).toEqual({
      key: "lori",
      text: undefined,
    });
    expect(harness.ui.widgets.at(-1)).toEqual({
      key: "lori-details",
      content: ["Lori · Session: nenhuma ativa", "XP: 0 · Skin Minimal"],
      placement: "belowEditor",
    });
  });

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
    harness.ui.selectResponses.push("4 · Realizo tarefas comuns com autonomia");

    await harness.runInit("");

    expect(harness.ui.inputCalls).toEqual([
      { title: "Como você quer chamar este Domain?", placeholder: "Um assunto ou habilidade, ex.: japonês, React ou álgebra." },
      { title: "O que você quer conseguir fazer?", placeholder: "Descreva um resultado observável. Ex.: manter uma conversa básica em japonês." },
      { title: "Por que aprender isso agora?", placeholder: "O contexto atual ajuda a personalizar o plano. Ex.: viagem, trabalho ou projeto pessoal." },
      { title: "Até quando quer alcançar esse objetivo?", placeholder: "Informe uma data-alvo se houver. Vazio ou 'sem prazo' significa sem prazo." },
      { title: "Quanto tempo por semana consegue dedicar?", placeholder: "Número de horas realista, ex.: 3." },
      { title: "Que formatos prefere para aprender?", placeholder: "Ex.: documentação, vídeos, áudio ou exercícios. Vazio = sem preferência." },
      { title: "Que restrições os materiais precisam respeitar?", placeholder: "Ex.: idioma, custo, acessibilidade ou ferramentas. Vazio = sem restrições." },
    ]);
    expect(harness.ui.selectCalls).toEqual([{
      title: "Baseline — como avalia seu ponto de partida para este objetivo? (não é um teste)",
      options: [
        "1 · Começando do zero: não estudei nem usei os conceitos",
        "2 · Reconheço conceitos, mas ainda não consigo aplicá-los",
        "3 · Realizo tarefas básicas com apoio ou consulta",
        "4 · Realizo tarefas comuns com autonomia",
        "5 · Adapto o conhecimento e resolvo casos novos",
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

    await harness.runStart("");

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
    restored.ui.selectResponses.push("1 · Começando do zero: não estudei nem usei os conceitos");

    await restored.runResume();

    expect(restored.ui.inputCalls).toEqual([
      { title: "O que você quer conseguir fazer?", placeholder: "Descreva um resultado observável. Ex.: manter uma conversa básica em japonês." },
      { title: "Por que aprender isso agora?", placeholder: "O contexto atual ajuda a personalizar o plano. Ex.: viagem, trabalho ou projeto pessoal." },
      { title: "Até quando quer alcançar esse objetivo?", placeholder: "Informe uma data-alvo se houver. Vazio ou 'sem prazo' significa sem prazo." },
      { title: "Quanto tempo por semana consegue dedicar?", placeholder: "Número de horas realista, ex.: 3." },
      { title: "Que formatos prefere para aprender?", placeholder: "Ex.: documentação, vídeos, áudio ou exercícios. Vazio = sem preferência." },
      { title: "Que restrições os materiais precisam respeitar?", placeholder: "Ex.: idioma, custo, acessibilidade ou ferramentas. Vazio = sem restrições." },
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

  test("treats an empty deadline as no deadline and continues the questionnaire", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    harness.ui.inputResponses.push(
      "Data Science",
      "Build a small classifier",
      "Explore this career path",
      "   ",
      "3",
      "",
      "",
    );
    harness.ui.selectResponses.push("2 · Reconheço conceitos, mas ainda não consigo aplicá-los");

    await harness.runInit("");

    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.domainDraft).toMatchObject({
      phase: "awaiting_curation",
      name: "Data Science",
      learningObjective: "Build a small classifier",
      motivation: "Explore this career path",
      deadline: null,
      hoursPerWeek: 3,
      baseline: 2,
      preferences: null,
      materialRestrictions: null,
    });
    expect(snapshot.session.status).toBe("open");
    expect(harness.ui.inputCalls).toHaveLength(7);
    expect(harness.ui.selectCalls).toHaveLength(1);
    expect(harness.ui.notifications.some(({ message }) => message.includes("Informe um prazo"))).toBe(false);
  });

  test("rejects Domain preparation arguments and blocks Study Session start while onboarding is active", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const initialSnapshot = await readFile(snapshotPath, "utf8");

    await harness.runInit("Physics");
    expect(await readFile(snapshotPath, "utf8")).toBe(initialSnapshot);
    expect(harness.ui.notifications.at(-1)?.message).toContain("sem argumentos");

    await harness.runInit("");
    const draftSnapshot = await readFile(snapshotPath, "utf8");
    await harness.runStart("");
    expect(await readFile(snapshotPath, "utf8")).toBe(draftSnapshot);
    expect(harness.ui.notifications.at(-1)?.message).toContain("ainda não está ativo");

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
    expect(statusWidgetText(harness.ui)).toContain("Session: nenhuma ativa");
    expect(statusWidgetText(harness.ui)).toContain("Skin Minimal");

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

  test("starts and persists a Study Session with explicit Domain and Technique selections", async () => {
    const { cwd, harness } = await createHarness();
    await startApprovedStudy(harness, "React");

    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.session).toMatchObject({
      kind: "study",
      status: "open",
      domainId: snapshot.domains[0].id,
      chapterRef: { domainId: snapshot.domains[0].id, chapterVersionId: snapshot.domains[0].currentChapterVersionId },
      nodeId: "greetings",
      resourceId: "resource-1",
      primaryTechnique: "Active Recall",
    });
    expect(typeof snapshot.session.startedAt).toBe("number");
    expect(harness.ui.selectCalls.slice(-2).map(({ title }) => title)).toEqual([
      "Escolher Domain ativo",
      "Escolher Primary Technique",
    ]);
    const status = statusWidgetText(harness.ui);
    expect(status).toContain("Session open");
    expect(status).toContain("Domain: React");
    expect(status).toContain("Technique: Active Recall");
    expect(status).toContain("Elapsed: 00:00:00");

    await harness.runStatus();
    expect(harness.ui.notifications.at(-1)?.message).toContain("Domain: React");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Technique: Active Recall");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Study references:");
    expect(harness.ui.notifications.at(-1)?.message).toContain("greetings");
    expect(harness.ui.notifications.at(-1)?.message).toContain("resource-1");
  });

  test("does not persist when active Domain or Primary Technique selection is cancelled", async () => {
    const { cwd, harness } = await createHarness();
    await prepareApprovedDomain(harness);
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const closedSnapshot = await readFile(snapshotPath, "utf8");
    const domain = JSON.parse(closedSnapshot).domains[0];
    const option = `${domain.name} — ${domain.learningObjective} [${domain.id}]`;

    harness.ui.selectResponses.push(undefined);
    await harness.runStart("");
    expect(await readFile(snapshotPath, "utf8")).toBe(closedSnapshot);

    harness.ui.selectResponses.push(option, "Informar outra técnica");
    harness.ui.inputResponses.push("   ");
    await harness.runStart("");
    expect(await readFile(snapshotPath, "utf8")).toBe(closedSnapshot);
    expect(harness.ui.inputCalls.at(-1)?.title).toBe("Primary Technique da Session");
  });

  test("cancelling active Domain selection leaves the closed Verdict unchanged instead of reusing it", async () => {
    const { cwd, harness } = await createHarness();
    await prepareApprovedDomain(harness);
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const closedSnapshot = await readFile(snapshotPath, "utf8");
    const inputCallCount = harness.ui.inputCalls.length;
    harness.ui.selectResponses.push(undefined);

    await harness.runStart("");

    expect(await readFile(snapshotPath, "utf8")).toBe(closedSnapshot);
    expect(harness.ui.selectCalls.at(-1)?.title).toBe("Escolher Domain ativo");
    expect(harness.ui.inputCalls).toHaveLength(inputCallCount);
  });

  test("starting without args always lists active Domains and never offers the previous Domain for reuse", async () => {
    const { cwd, harness } = await createHarness();
    await prepareApprovedDomain(harness);
    const before = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    const domain = before.domains[0];
    harness.ui.selectResponses.push(`${domain.name} — ${domain.learningObjective} [${domain.id}]`, "Active Recall · Retrieval");

    await harness.runStart("");

    expect(harness.ui.selectCalls.at(-1)?.title).toBe("Escolher Primary Technique");
    expect(harness.ui.selectCalls.some(({ title }) => title === "Escolher Domain ativo")).toBe(true);
    expect(harness.ui.selectCalls.some(({ options }) => options.some((option) => option.startsWith("Reutilizar:")))).toBe(false);
    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.session).toMatchObject({ kind: "study", status: "open", domainId: domain.id });
  });

  test("does not reuse a legacy Session as an active Domain", async () => {
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
    const closedSnapshot = await readFile(snapshotPath, "utf8");

    await harness.runStart("");

    expect(await readFile(snapshotPath, "utf8")).toBe(closedSnapshot);
    expect(harness.ui.selectCalls).toHaveLength(0);
    expect(harness.ui.notifications.at(-1)?.message).toContain("Nenhum Domain ativo");
  });

  test("rejects a partial legacy start argument instead of accepting a free-text Domain", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const initialSnapshot = await readFile(snapshotPath, "utf8");

    await harness.runStart(" | Active Recall");

    expect(await readFile(snapshotPath, "utf8")).toBe(initialSnapshot);
    expect(harness.ui.inputCalls).toHaveLength(0);
    expect(harness.ui.selectCalls).toHaveLength(0);
    expect(harness.ui.notifications.at(-1)?.message).toContain("sem argumentos");
  });

  test("rejects a Domain supplied in a partial command instead of bypassing explicit selection", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const initialSnapshot = await readFile(snapshotPath, "utf8");

    await harness.runStart("React |");

    expect(await readFile(snapshotPath, "utf8")).toBe(initialSnapshot);
    expect(harness.ui.inputCalls).toHaveLength(0);
    expect(harness.ui.selectCalls).toHaveLength(0);
    expect(harness.ui.notifications.at(-1)?.message).toContain("sem argumentos");
  });

  test("lets the Player explicitly choose a custom Primary Technique", async () => {
    const { cwd, harness } = await createHarness();
    await prepareApprovedDomain(harness);
    const before = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    const domain = before.domains[0];
    harness.ui.selectResponses.push(
      `${domain.name} — ${domain.learningObjective} [${domain.id}]`,
      "Informar outra técnica",
    );
    harness.ui.inputResponses.push("Direct Practice");

    await harness.runStart("");

    expect(harness.ui.selectCalls.at(-1)?.options).toContain("Informar outra técnica");
    expect(harness.ui.inputCalls.at(-1)?.title).toBe("Primary Technique da Session");
    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.session).toMatchObject({
      kind: "study",
      status: "open",
      domainId: domain.id,
      primaryTechnique: "Direct Practice",
    });
  });

  test("starts from an explicitly selected active Domain rather than an entered Domain pair", async () => {
    const { cwd, harness } = await createHarness();
    await prepareApprovedDomain(harness);
    const before = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    const domain = before.domains[0];
    const inputCallCount = harness.ui.inputCalls.length;
    harness.ui.selectResponses.push(`${domain.name} — ${domain.learningObjective} [${domain.id}]`, "Build From Scratch · Directness");

    await harness.runStart("");

    const snapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    expect(snapshot.session).toMatchObject({ kind: "study", status: "open", domainId: domain.id, primaryTechnique: "Build From Scratch" });
    expect(snapshot.session.name).toBeUndefined();
    expect(harness.ui.inputCalls).toHaveLength(inputCallCount);
  });

  test("does not start a Study Session when no active Domain exists", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const initialSnapshot = await readFile(snapshotPath, "utf8");

    await harness.runStart("");

    expect(await readFile(snapshotPath, "utf8")).toBe(initialSnapshot);
    expect(harness.ui.inputCalls).toHaveLength(0);
    expect(harness.ui.selectCalls).toHaveLength(0);
    expect(harness.ui.notifications.at(-1)?.message).toContain("Nenhum Domain ativo");
  });

  test("refreshes the dashboard elapsed time when /lori-status is run", async () => {
    const { harness } = await createHarness();
    const now = spyOn(Date, "now").mockReturnValue(1_000);

    try {
      await startApprovedStudy(harness, "React");
      now.mockReturnValue(61_000);

      await harness.runStatus();

      expect(statusWidgetText(harness.ui)).toContain("Elapsed: 00:01:00");
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
    await startApprovedStudy(harness, "React", "Active Recall · Retrieval", false);
    const before = JSON.parse(await readFile(snapshotPath, "utf8"));

    await harness.runClose("  2.5  |  4  ");

    const closedSnapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(closedSnapshot.schemaVersion).toBe(4);
    expect(closedSnapshot.player.totalXp).toBe(before.player.totalXp);
    expect(closedSnapshot.session).toMatchObject({
      kind: "study",
      status: "closed",
      domainId: before.domains[0].id,
      chapterRef: before.session.chapterRef,
      nodeId: "greetings",
      resourceId: "resource-1",
      primaryTechnique: "Active Recall",
      verdict: { focus: 2.5, honesty: 4, chapterRef: before.session.chapterRef },
    });
    expect(closedSnapshot.session.closedAt).toBeGreaterThanOrEqual(closedSnapshot.session.startedAt);
    expect(statusWidgetText(harness.ui)).toContain("Session fechada");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Focus: 2.5");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Honesty: 4");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Session fechada");

    const { harness: restored } = await createHarness(cwd);
    await restored.start();
    await restored.runStatus();
    expect(statusWidgetText(restored.ui)).toContain("Session fechada");
    expect(restored.ui.notifications.at(-1)?.message).toContain("Focus: 2.5 · Honesty: 4");
    expect(JSON.parse(await readFile(snapshotPath, "utf8")).session.verdict).toEqual({
      focus: 2.5,
      honesty: 4,
      chapterRef: before.session.chapterRef,
    });
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
    await startApprovedStudy(harness, "React", "Active Recall · Retrieval", false);
    await harness.runClose("3 | 4");

    expect(statusWidgetText(harness.ui)).toContain("Terminal close React");
    expect(statusWidgetText(harness.ui)).toContain("00:00:00");
    expect(statusWidgetText(harness.ui)).toContain("3/4");
  });

  test("closes a paused Session without adding paused time or applying a rating range", async () => {
    const { cwd, harness } = await createHarness();
    await startApprovedStudy(harness, "React");
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
    expect(harness.ui.notifications.at(-1)?.message).toContain("Focus: 0");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Honesty: -7.25");
  });

  test("rejects missing, non-numeric, and non-finite close values before changing state", async () => {
    const { cwd, harness } = await createHarness();
    await startApprovedStudy(harness, "React");
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const initialSnapshot = await readFile(snapshotPath, "utf8");

    for (const args of ["", "4", " | 2", "2 | ", "NaN | 1", "Infinity | 2", "1 | -Infinity", "2 | nope", "1 | 2 | 3"]) {
      await harness.runClose(args);
    }

    expect(await readFile(snapshotPath, "utf8")).toBe(initialSnapshot);
    expect(harness.ui.notifications.slice(-9).every(({ type }) => type === "warning")).toBe(true);
    expect(statusWidgetText(harness.ui)).toContain("Session open");
  });

  test("does not resume or close a closed Session again, but allows a fresh selected study", async () => {
    const { cwd, harness } = await createHarness();
    await startApprovedStudy(harness, "React");
    await harness.runClose("1 | 1");
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const closedSnapshot = JSON.parse(await readFile(snapshotPath, "utf8"));

    await harness.runResume();
    await harness.runClose("5 | 5");
    expect(JSON.parse(await readFile(snapshotPath, "utf8"))).toEqual(closedSnapshot);
    expect(statusWidgetText(harness.ui)).toContain("Session fechada");

    const domain = closedSnapshot.domains[0];
    harness.ui.selectResponses.push(`${domain.name} — ${domain.learningObjective} [${domain.id}]`, "Build From Scratch · Directness");
    await harness.runStart("");
    expect(JSON.parse(await readFile(snapshotPath, "utf8")).session).toMatchObject({
      kind: "study",
      status: "open",
      domainId: domain.id,
      primaryTechnique: "Build From Scratch",
    });
  });

  test("abandons and resumes a Study Session without losing its references or accumulated time", async () => {
    const { cwd, harness } = await createHarness();
    await startApprovedStudy(harness, "React");
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const opened = JSON.parse(await readFile(snapshotPath, "utf8")).session;

    await harness.runAbandon();
    const paused = JSON.parse(await readFile(snapshotPath, "utf8")).session;
    expect(paused).toMatchObject({
      kind: "study",
      status: "paused",
      domainId: opened.domainId,
      chapterRef: opened.chapterRef,
      nodeId: opened.nodeId,
      resourceId: opened.resourceId,
      primaryTechnique: "Active Recall",
      startedAt: opened.startedAt,
    });
    expect(paused.pausedAt).toBeGreaterThanOrEqual(opened.startedAt);
    expect(statusWidgetText(harness.ui)).toContain("Session pausada");
    expect(statusWidgetText(harness.ui)).toContain("Elapsed:");

    await harness.runResume();
    const resumed = JSON.parse(await readFile(snapshotPath, "utf8")).session;
    expect(resumed).toMatchObject({
      kind: "study",
      status: "open",
      domainId: opened.domainId,
      chapterRef: opened.chapterRef,
      nodeId: opened.nodeId,
      resourceId: opened.resourceId,
      primaryTechnique: "Active Recall",
      startedAt: opened.startedAt,
    });
    expect(resumed.totalPausedMs).toBeGreaterThanOrEqual(0);
    expect(statusWidgetText(harness.ui)).toContain("Session retomada");
  });

  test("rejects abandon and resume when the Session is in the wrong state", async () => {
    const { cwd, harness } = await createHarness();
    await harness.start();
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const initialSnapshot = await readFile(snapshotPath, "utf8");

    await harness.runAbandon();
    await harness.runResume();
    expect(await readFile(snapshotPath, "utf8")).toBe(initialSnapshot);

    await startApprovedStudy(harness, "React");
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
    expect(statusWidgetText(harness.ui)).toContain("Session: nenhuma ativa");
  });

  test("does not retain an unpersisted Study Session when the snapshot becomes unavailable", async () => {
    const { cwd, harness } = await createHarness();
    await prepareApprovedDomain(harness);
    const closedSnapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));
    await rm(join(cwd, ".lori"), { recursive: true, force: true });
    await writeFile(join(cwd, ".lori"), "not a directory");

    await harness.runStart("");
    await harness.runStatus();

    expect(harness.ui.notifications.at(-2)?.type).toBe("error");
    expect(harness.ui.notifications.at(-2)?.message).toContain("snapshot antes de iniciar");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Session fechada");
    expect(harness.ui.notifications.at(-1)?.message).not.toContain("Study references");
    expect(closedSnapshot.session.kind).toBe("metalearning");
  });

  test("uses the latest closed Session from the snapshot rather than stale in-memory state", async () => {
    const { cwd, harness } = await createHarness();
    await startApprovedStudy(harness, "React");

    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    snapshot.session = {
      ...snapshot.session,
      status: "closed",
      closedAt: snapshot.session.startedAt + snapshot.session.totalPausedMs,
      verdict: { focus: 1, honesty: 1, chapterRef: snapshot.session.chapterRef },
    };
    await writeFile(snapshotPath, JSON.stringify(snapshot));
    const domain = snapshot.domains[0];
    harness.ui.selectResponses.push(`${domain.name} — ${domain.learningObjective} [${domain.id}]`, "Build From Scratch · Directness");
    await harness.runStart("");

    const savedSnapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(savedSnapshot.session).toMatchObject({
      kind: "study",
      status: "open",
      domainId: domain.id,
      primaryTechnique: "Build From Scratch",
    });
  });

  test("rejects Study Session start before prompting when a Session is open or paused", async () => {
    const { cwd, harness } = await createHarness();
    await startApprovedStudy(harness, "React");

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
    await harness.runStart("");

    expect(await readFile(snapshotPath, "utf8")).toBe(pausedSnapshot);
    expect(harness.ui.inputCalls).toHaveLength(pausedInputCallCount);
    expect(harness.ui.selectCalls).toHaveLength(pausedSelectCallCount);
    expect(harness.ui.notifications.at(-1)?.message).toContain("já existe uma Session ativa");
  });

  test("rejects replacing an open Session without changing its persisted snapshot", async () => {
    const { cwd, harness } = await createHarness();
    await startApprovedStudy(harness, "React");
    const snapshotPath = join(cwd, ".lori", "snapshot.json");
    const openedSnapshot = await readFile(snapshotPath, "utf8");

    await harness.runStart("");

    expect(await readFile(snapshotPath, "utf8")).toBe(openedSnapshot);
    const rejection = harness.ui.notifications.at(-1)?.message ?? "";
    expect(rejection).toContain("Session não iniciada");
    expect(rejection).toContain("já existe uma Session ativa");
    expect(statusWidgetText(harness.ui)).toContain("Domain: React");
    expect(statusWidgetText(harness.ui)).not.toContain("Japanese");
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

    expect(statusWidgetText(harness.ui)).toContain("Session restaurada como pausada");
    await harness.runStatus();

    expect(statusWidgetText(harness.ui)).toBe(
      "Lori · Session pausada\nDomain: React · Technique: Active Recall · Elapsed: 00:01:05",
    );
    expect(harness.ui.statuses.at(-1)?.text).toBeUndefined();
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

  test("restores a paused Study Session with its Domain, Chapter, Node, and resource references", async () => {
    const { cwd, harness: firstInstance } = await createHarness();
    await startApprovedStudy(firstInstance, "Japanese", "Build From Scratch · Directness");
    const savedSnapshot = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8"));

    await firstInstance.runAbandon();
    const paused = JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).session;
    const { harness: reloadedInstance } = await createHarness(cwd);
    await reloadedInstance.start();

    expect(statusWidgetText(reloadedInstance.ui)).toContain("Session pausada");
    await reloadedInstance.runStatus();

    expect(statusWidgetText(reloadedInstance.ui)).toContain("Session pausada");
    expect(statusWidgetText(reloadedInstance.ui)).toContain("Domain: Japanese");
    expect(statusWidgetText(reloadedInstance.ui)).toContain("Technique: Build From Scratch");
    expect(reloadedInstance.ui.notifications.at(-1)?.message).toContain("Elapsed: 00:00:00");
    expect(reloadedInstance.ui.notifications.at(-1)?.message).toContain("Study references:");
    expect(reloadedInstance.ui.notifications.at(-1)?.message).toContain("greetings");
    expect(reloadedInstance.ui.notifications.at(-1)?.message).toContain("resource-1");
    expect(reloadedInstance.ui.notifications.at(-1)?.message).toContain(paused.chapterRef.chapterVersionId);
    expect(JSON.parse(await readFile(join(cwd, ".lori", "snapshot.json"), "utf8")).session).toMatchObject({
      kind: "study",
      status: "paused",
      domainId: paused.domainId,
      chapterRef: paused.chapterRef,
      nodeId: paused.nodeId,
      resourceId: paused.resourceId,
    });
    expect(savedSnapshot.session.status).toBe("open");
  });

  test("restores the initial project snapshot when a fresh extension instance starts", async () => {
    const { cwd, harness: firstInstance } = await createHarness();
    await firstInstance.start();
    const savedSnapshot = await readFile(join(cwd, ".lori", "snapshot.json"), "utf8");

    const { harness: reloadedInstance } = await createHarness(cwd);
    await reloadedInstance.start();
    await reloadedInstance.runStatus();

    expect(statusWidgetText(reloadedInstance.ui)).toContain("XP: 0");
    expect(statusWidgetText(reloadedInstance.ui)).toContain("Session: nenhuma ativa");
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
    expect(harness.ui.statuses.at(-1)?.text).toBeUndefined();
    expect(harness.ui.widgets.at(-1)?.content).toBeUndefined();
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

    expect(statusWidgetText(harness.ui)).toBe("Terminal XP=15");
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

    expect(statusWidgetText(harness.ui)).toBe(
      "Terminal restored Session React | Active Recall | 00:01:05",
    );

    await harness.runStatus();
    expect(statusWidgetText(harness.ui)).toBe(
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

    expect(statusWidgetText(harness.ui)).toBe("Lori · Session: nenhuma ativa\nXP: 6 · Skin Minimal");
    expect(harness.ui.notifications.at(-1)?.message).toBe(
      "Lori · Session: nenhuma ativa\nXP: 6 · Skin Minimal",
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

    expect(statusWidgetText(harness.ui)).toBe("Lori · Session: nenhuma ativa\nXP: 4 · Skin Minimal");
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

  test("migrates a closed v1 Session to legacyStudy without fabricating an active Domain", async () => {
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

    await harness.runStart("");

    const continued = JSON.parse(await readFile(snapshotPath, "utf8"));
    expect(continued.session).toEqual(migrated.session);
    expect(continued.sessionHistory).toEqual([]);
    expect(continued.domains).toEqual([]);
    expect(continued.player.totalXp).toBe(87);
    expect(continued.skinConfig.skin).toBe("terminal");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Nenhum Domain ativo");
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
    await startApprovedStudy(harness, "React", "Active Recall · Retrieval", false);
    expect(harness.ui.notifications.at(-1)?.message).toContain("Terminal open React");

    await harness.runStart("");
    expect(harness.ui.notifications.at(-1)?.message).toBe("Terminal start rejected React");

    await harness.runResume();
    expect(harness.ui.notifications.at(-1)?.message).toBe("Terminal resume rejected React");

    await harness.runAbandon();
    expect(harness.ui.notifications.at(-1)?.message).toContain("Terminal paused React");

    await harness.runAbandon();
    expect(harness.ui.notifications.at(-1)?.message).toBe("Terminal pause rejected React");

    await harness.runResume();
    expect(harness.ui.notifications.at(-1)?.message).toContain("Terminal resumed React");

    await harness.runClose("4 | 5");
    expect(harness.ui.notifications.at(-1)?.message).toContain("Terminal closed React 4/5");

    await harness.runClose("4 | 5");
    expect(harness.ui.notifications.at(-1)?.message).toBe("Terminal close rejected React");
  });

});
