import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { LoriExtensionState } from "./types.ts";

export function registerCurationSourceEvidenceHooks(api: ExtensionAPI, shared: LoriExtensionState): void {
  let nextRunId = 0;
  const seenToolCallIds = new Set<string>();

  api.on("agent_start", () => {
    const request = shared.curationRequest;
    if (request === undefined || !request.awaitingAgentStart) {
      return;
    }
    request.awaitingAgentStart = false;
    request.agentRunId = `${request.requestId}:run-${++nextRunId}`;
  });

  api.on("tool_call", (event) => {
    const request = shared.curationRequest;
    const agentRunId = request?.agentRunId;
    if (
      request === undefined ||
      agentRunId === undefined ||
      seenToolCallIds.has(event.toolCallId)
    ) {
      return;
    }
    seenToolCallIds.add(event.toolCallId);
    request.sourceToolCalls[event.toolCallId] = {
      requestId: request.requestId,
      agentRunId,
      toolName: event.toolName,
    };
  });

  api.on("tool_result", (event) => {
    const request = shared.curationRequest;
    const call = request?.sourceToolCalls[event.toolCallId];
    if (request === undefined || call === undefined) {
      return;
    }
    delete request.sourceToolCalls[event.toolCallId];
    if (
      call.requestId !== request.requestId ||
      call.agentRunId !== request.agentRunId ||
      call.toolName !== event.toolName ||
      event.isError
    ) {
      return;
    }

    const text = event.content.flatMap((block) => block.type === "text" ? [block.text] : []);
    if (event.structuredContent !== undefined) {
      text.push(JSON.stringify(event.structuredContent));
    }
    if (text.length === 0 || request.agentRunId === undefined) {
      return;
    }
    request.sourceEvidence.push({
      requestId: request.requestId,
      agentRunId: request.agentRunId,
      toolCallId: event.toolCallId,
      toolName: event.toolName,
      isError: false,
      text: text.join("\n"),
    });
  });

  api.on("agent_end", () => {
    const request = shared.curationRequest;
    if (request?.agentRunId !== undefined) {
      shared.curationRequest = undefined;
    }
  });
}
