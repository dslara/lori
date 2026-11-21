import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { ChapterCurationRuntime } from "./lori-curate.types.ts";

export function registerCurationSourceEvidenceHooks(
  api: ExtensionAPI,
  runtime: ChapterCurationRuntime,
): void {
  api.on("agent_start", () => runtime.handle({ type: "agent_start" }));
  api.on("tool_call", (event) => runtime.handle({
    type: "tool_call",
    toolCallId: event.toolCallId,
    toolName: event.toolName,
  }));
  api.on("tool_result", (event) => runtime.handle({
    type: "tool_result",
    toolCallId: event.toolCallId,
    toolName: event.toolName,
    isError: event.isError,
    content: event.content,
    ...(event.structuredContent === undefined ? {} : { structuredContent: event.structuredContent }),
  }));
  api.on("agent_end", () => runtime.handle({ type: "agent_end" }));
}
