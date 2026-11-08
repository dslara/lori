import type { DomainApprovalAction, DomainDraftAction } from "./domain/types.ts";
import type { SessionAction } from "./session/types.ts";

export type LoriAction = SessionAction | DomainApprovalAction | DomainDraftAction;
