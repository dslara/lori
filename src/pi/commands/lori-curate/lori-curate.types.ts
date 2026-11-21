import type { ChapterProposal, ChapterSourceEvidence } from "../../../core/domain/chapter.ts";

export type ChapterCurationToolResult = {
  requestId: string;
  domainId: string;
  result:
    | { status: "proposal"; proposal: ChapterProposal }
    | { status: "blocked"; reason: string };
};

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

export type ChapterCurationRuntime = {
  start(request: ChapterCurationRequest): void;
  handle(event: ChapterCurationRuntimeEvent): void;
  current(): ChapterCurationRequestView | undefined;
  authorizeSubmission(requestId: string, domainId: string): ChapterCurationRequestView | undefined;
  clear(): void;
  clearIfCurrent(requestId: string): void;
};
