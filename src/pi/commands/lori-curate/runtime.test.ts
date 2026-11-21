import { describe, expect, test } from "bun:test";
import { createChapterCurationRuntime } from "./runtime.ts";

describe("Chapter curation runtime", () => {
  test("authorizes matching request IDs and captures successful results from its active run", () => {
    const runtime = createChapterCurationRuntime();
    runtime.start({ requestId: "request-1", domainId: "domain-1", target: "draft" });

    expect(runtime.authorizeSubmission("other-request", "domain-1")).toBeUndefined();
    expect(runtime.authorizeSubmission("request-1", "other-domain")).toBeUndefined();

    runtime.handle({ type: "agent_start" });
    runtime.handle({ type: "tool_call", toolName: "web_fetch", toolCallId: "fetch-1" });
    runtime.handle({
      type: "tool_result",
      toolName: "web_fetch",
      toolCallId: "fetch-1",
      isError: false,
      content: [{ type: "text", text: "https://example.com/source Exact excerpt." }],
      structuredContent: { locator: "section 2" },
    });

    expect(runtime.authorizeSubmission("request-1", "domain-1")).toMatchObject({
      requestId: "request-1",
      domainId: "domain-1",
      target: "draft",
      agentRunId: "request-1:run-1",
      sourceEvidence: [{
        requestId: "request-1",
        agentRunId: "request-1:run-1",
        toolCallId: "fetch-1",
        toolName: "web_fetch",
        isError: false,
        text: 'https://example.com/source Exact excerpt.\n{"locator":"section 2"}',
      }],
    });
  });

  test("ignores unknown, mismatched, failed, and empty tool results", () => {
    const runtime = createChapterCurationRuntime();
    runtime.start({ requestId: "request-1", domainId: "domain-1", target: "draft" });
    runtime.handle({ type: "agent_start" });

    runtime.handle({ type: "tool_result", toolName: "web_fetch", toolCallId: "unknown", isError: false, content: [] });
    runtime.handle({ type: "tool_call", toolName: "web_fetch", toolCallId: "wrong-name" });
    runtime.handle({
      type: "tool_result",
      toolName: "other-tool",
      toolCallId: "wrong-name",
      isError: false,
      content: [{ type: "text", text: "stale result" }],
    });
    runtime.handle({ type: "tool_call", toolName: "web_fetch", toolCallId: "failed" });
    runtime.handle({
      type: "tool_result",
      toolName: "web_fetch",
      toolCallId: "failed",
      isError: true,
      content: [{ type: "text", text: "failed result" }],
    });
    runtime.handle({ type: "tool_call", toolName: "web_fetch", toolCallId: "empty" });
    runtime.handle({
      type: "tool_result",
      toolName: "web_fetch",
      toolCallId: "empty",
      isError: false,
      content: [{ type: "image" }],
    });

    expect(runtime.authorizeSubmission("request-1", "domain-1")?.sourceEvidence).toEqual([]);
  });

  test("expires bound runs without reusing pending calls in a later request", () => {
    const runtime = createChapterCurationRuntime();
    runtime.start({ requestId: "request-1", domainId: "domain-1", target: "draft" });
    runtime.handle({ type: "agent_start" });
    runtime.handle({ type: "tool_call", toolName: "web_fetch", toolCallId: "reused-call" });
    runtime.handle({ type: "agent_end" });

    expect(runtime.current()).toBeUndefined();

    runtime.start({ requestId: "request-2", domainId: "domain-1", target: "draft" });
    runtime.handle({ type: "agent_start" });
    runtime.handle({ type: "tool_call", toolName: "web_fetch", toolCallId: "reused-call" });
    runtime.handle({
      type: "tool_result",
      toolName: "web_fetch",
      toolCallId: "reused-call",
      isError: false,
      content: [{ type: "text", text: "old result" }],
    });

    expect(runtime.authorizeSubmission("request-2", "domain-1")).toMatchObject({
      agentRunId: "request-2:run-2",
      sourceEvidence: [],
    });
  });

  test("leaves a request pending when agent_end arrives before agent_start", () => {
    const runtime = createChapterCurationRuntime();
    runtime.start({ requestId: "request-1", domainId: "domain-1", target: "draft" });

    runtime.handle({ type: "agent_end" });

    expect(runtime.current()).toMatchObject({ requestId: "request-1", agentRunId: undefined });

    runtime.handle({ type: "agent_start" });
    runtime.handle({ type: "agent_end" });

    expect(runtime.current()).toBeUndefined();
  });

  test("protects replacement requests and clears state on lifecycle reset", () => {
    const runtime = createChapterCurationRuntime();
    runtime.start({ requestId: "request-1", domainId: "domain-1", target: "draft" });
    runtime.start({ requestId: "request-2", domainId: "domain-2", target: "draft" });

    runtime.clearIfCurrent("request-1");

    expect(runtime.authorizeSubmission("request-2", "domain-2")).toMatchObject({
      requestId: "request-2",
      domainId: "domain-2",
    });

    runtime.clearIfCurrent("request-2");

    expect(runtime.current()).toBeUndefined();

    runtime.start({ requestId: "request-3", domainId: "domain-3", target: "draft" });
    runtime.clear();

    expect(runtime.current()).toBeUndefined();
  });
});
