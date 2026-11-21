import { describe, expect, test } from "bun:test";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createChapterCurationRuntime } from "./runtime.ts";
import { registerCurationSourceEvidenceHooks } from "./source-evidence.ts";

test("Pi source evidence hooks forward tool results to the runtime and expire it at agent end", () => {
  const handlers = new Map<string, (event: unknown) => void>();
  const api = {
    on(event: string, handler: (event: unknown) => void) {
      handlers.set(event, handler);
      return () => undefined;
    },
  } as unknown as ExtensionAPI;
  const runtime = createChapterCurationRuntime();
  runtime.start({ requestId: "request-1", domainId: "domain-1", target: "draft" });
  registerCurationSourceEvidenceHooks(api, runtime);

  const emit = (eventName: string, event: unknown): void => {
    const handler = handlers.get(eventName);
    if (handler === undefined) {
      throw new Error(`No handler registered for ${eventName}`);
    }
    handler(event);
  };

  emit("agent_start", { type: "agent_start" });
  emit("tool_call", { type: "tool_call", toolName: "web_fetch", toolCallId: "fetch-1", input: {} });
  emit("tool_result", {
    type: "tool_result",
    toolName: "web_fetch",
    toolCallId: "fetch-1",
    input: {},
    content: [{ type: "text", text: "https://example.com/source Exact excerpt." }],
    isError: false,
  });

  expect(runtime.authorizeSubmission("request-1", "domain-1")?.sourceEvidence).toMatchObject([{
    requestId: "request-1",
    agentRunId: "request-1:run-1",
    toolCallId: "fetch-1",
    toolName: "web_fetch",
    text: "https://example.com/source Exact excerpt.",
  }]);

  emit("agent_end", { type: "agent_end", messages: [] });

  expect(runtime.authorizeSubmission("request-1", "domain-1")).toBeUndefined();
});
