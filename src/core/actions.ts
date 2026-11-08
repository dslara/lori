import type { DomainDraftAnswerAction } from "./domain/types.ts";
import type { SessionAction } from "./session/types.ts";

export type LoriAction = SessionAction | DomainDraftAnswerAction;
