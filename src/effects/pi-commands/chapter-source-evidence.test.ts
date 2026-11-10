import { describe, expect, test } from "bun:test";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { LoriExtensionState } from "./types.ts";
import { registerCurationSourceEvidenceHooks } from "./chapter-source-evidence.ts";

function setup(requestId = "request-1") {
  const handlers = new Map<string, (event: unknown) => void>();
  const api = {
    on(event: string, handler: (event: unknown) => void) {
      handlers.set(event, handler);
      return () => undefined;
    },
  } as unknown as ExtensionAPI;
  const shared: LoriExtensionState = {
    store: undefined,
    projectDir: undefined,
    skin: undefined,
    startupError: undefined,
    curationRequest: {
      requestId,
      domainId: "domain-1",
      target: "draft",
      awaitingAgentStart: true,
      agentRunId: undefined,
      sourceToolCalls: {},
      sourceEvidence: [],
    },
  };
  registerCurationSourceEvidenceHooks(api, shared);
  const emit = (eventName: string, event: unknown) => {
    const handler = handlers.get(eventName);
    if (handler === undefined) {
      throw new Error(`No handler registered for ${eventName}`);
    }
    handler(event);
  };
  return { shared, emit };
}

describe("curation source evidence lifecycle", () => {
  test("captures successful results from any tool in the active request and run", () => {
    const { shared, emit } = setup();
    emit("agent_start", { type: "agent_start" });
    const runId = shared.curationRequest?.agentRunId;
    if (runId === undefined) {
      throw new Error("Expected the active curation request to be bound to an agent run.");
    }
    expect(runId).toBeDefined();

    emit("tool_call", { type: "tool_call", toolName: "my_private_search", toolCallId: "search-1", input: {} });
    emit("tool_result", {
      type: "tool_result",
      toolName: "my_private_search",
      toolCallId: "search-1",
      input: {},
      content: [{ type: "text", text: "https://example.com/phrases Good morning. Greetings" }],
      isError: false,
    });

    expect(shared.curationRequest?.sourceToolCalls).toEqual({});
    expect(shared.curationRequest?.sourceEvidence).toEqual([{
      requestId: "request-1",
      agentRunId: runId,
      toolCallId: "search-1",
      toolName: "my_private_search",
      isError: false,
      text: "https://example.com/phrases Good morning. Greetings",
    }]);
  });

  test("expires evidence and pending calls at agent end so old results cannot enter another request", () => {
    const { shared, emit } = setup();
    emit("agent_start", { type: "agent_start" });
    emit("tool_call", { type: "tool_call", toolName: "web_search", toolCallId: "old-call", input: {} });
    const oldRunId = shared.curationRequest?.agentRunId;

    emit("agent_end", { type: "agent_end", messages: [] });
    expect(shared.curationRequest).toBeUndefined();

    shared.curationRequest = {
      requestId: "request-2",
      domainId: "domain-1",
      target: "draft",
      awaitingAgentStart: true,
      agentRunId: undefined,
      sourceToolCalls: {},
      sourceEvidence: [],
    };
    emit("agent_start", { type: "agent_start" });
    emit("tool_call", { type: "tool_call", toolName: "web_search", toolCallId: "old-call", input: {} });
    emit("tool_result", {
      type: "tool_result",
      toolName: "web_search",
      toolCallId: "old-call",
      input: {},
      content: [{ type: "text", text: "https://example.com/phrases Good morning." }],
      isError: false,
    });

    expect(shared.curationRequest?.agentRunId).not.toBe(oldRunId);
    expect(shared.curationRequest?.sourceEvidence).toEqual([]);
    expect(shared.curationRequest?.sourceToolCalls).toEqual({});
  });
});
