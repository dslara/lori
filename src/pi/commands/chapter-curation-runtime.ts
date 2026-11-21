import type { ChapterSourceEvidence } from "../../core/domain/chapter.ts";

export type ChapterCurationRequest = {
  requestId: string;
  domainId: string;
  target: "draft" | "active";
  expectedCurrentChapterVersionId?: string;
};

export type ChapterCurationRequestView = Readonly<ChapterCurationRequest> & {
  readonly agentRunId: string | undefined;
  readonly sourceEvidence: readonly Readonly<ChapterSourceEvidence>[];
};

export type ChapterCurationRuntimeEvent =
  | { type: "agent_start" }
  | { type: "agent_end" }
  | { type: "tool_call"; toolCallId: string; toolName: string }
  | {
      type: "tool_result";
      toolCallId: string;
      toolName: string;
      isError: boolean;
      content: readonly { type: string; text?: string }[];
      structuredContent?: unknown;
    };

type ActiveChapterCurationRequest = ChapterCurationRequest & {
  awaitingAgentStart: boolean;
  agentRunId: string | undefined;
  sourceToolCalls: Map<string, { requestId: string; agentRunId: string; toolName: string }>;
  sourceEvidence: ChapterSourceEvidence[];
};

export function createChapterCurationRuntime() {
  let currentRequest: ActiveChapterCurationRequest | undefined;
  let nextRunId = 0;
  // shortcut: IDs stay registered for this extension lifetime; scope by run if Pi recycles IDs or memory grows materially.
  const seenToolCallIds = new Set<string>();

  function current(): ChapterCurationRequestView | undefined {
    const request = currentRequest;
    if (request === undefined) {
      return undefined;
    }
    return {
      requestId: request.requestId,
      domainId: request.domainId,
      target: request.target,
      ...(request.expectedCurrentChapterVersionId === undefined
        ? {}
        : { expectedCurrentChapterVersionId: request.expectedCurrentChapterVersionId }),
      agentRunId: request.agentRunId,
      sourceEvidence: request.sourceEvidence.map((evidence) => ({ ...evidence })),
    };
  }

  return {
    start(request: ChapterCurationRequest): void {
      currentRequest = {
        ...request,
        awaitingAgentStart: true,
        agentRunId: undefined,
        sourceToolCalls: new Map(),
        sourceEvidence: [],
      };
    },

    handle(event: ChapterCurationRuntimeEvent): void {
      const request = currentRequest;
      if (request === undefined) {
        return;
      }

      if (event.type === "agent_start") {
        if (request.awaitingAgentStart) {
          request.awaitingAgentStart = false;
          request.agentRunId = `${request.requestId}:run-${++nextRunId}`;
        }
        return;
      }

      if (event.type === "agent_end") {
        if (request.agentRunId !== undefined) {
          currentRequest = undefined;
        }
        return;
      }

      if (event.type === "tool_call") {
        if (request.agentRunId === undefined || seenToolCallIds.has(event.toolCallId)) {
          return;
        }
        seenToolCallIds.add(event.toolCallId);
        request.sourceToolCalls.set(event.toolCallId, {
          requestId: request.requestId,
          agentRunId: request.agentRunId,
          toolName: event.toolName,
        });
        return;
      }

      const call = request.sourceToolCalls.get(event.toolCallId);
      if (call === undefined) {
        return;
      }
      request.sourceToolCalls.delete(event.toolCallId);
      if (
        call.requestId !== request.requestId ||
        call.agentRunId !== request.agentRunId ||
        call.toolName !== event.toolName ||
        event.isError
      ) {
        return;
      }

      const text = event.content.flatMap((block) =>
        block.type === "text" && block.text !== undefined ? [block.text] : []
      );
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
    },

    current,

    authorizeSubmission(requestId: string, domainId: string): ChapterCurationRequestView | undefined {
      if (currentRequest?.requestId !== requestId || currentRequest.domainId !== domainId) {
        return undefined;
      }
      return current();
    },

    clear(): void {
      currentRequest = undefined;
    },

    clearIfCurrent(requestId: string): void {
      if (currentRequest?.requestId === requestId) {
        currentRequest = undefined;
      }
    },
  };
}

export type ChapterCurationRuntime = ReturnType<typeof createChapterCurationRuntime>;
