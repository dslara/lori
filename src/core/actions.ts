import type { DomainDraftAction } from "./domain/types.ts";
import type { SessionAction } from "./session/types.ts";

export type LoriAction = SessionAction | DomainDraftAction;
