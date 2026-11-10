import type { ActiveDomainProposalAction, DomainApprovalAction, DomainDeleteAction, DomainDraftAction } from "./domain/types.ts";
import type { SessionAction } from "./session/types.ts";

export type LoriAction = SessionAction | DomainApprovalAction | DomainDeleteAction | DomainDraftAction | ActiveDomainProposalAction;
