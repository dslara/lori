import type { ActiveDomainProposalAction, DomainApprovalAction, DomainDraftAction } from "./domain/types.ts";
import type { SessionAction } from "./session/types.ts";

export type LoriAction = SessionAction | DomainApprovalAction | DomainDraftAction | ActiveDomainProposalAction;
