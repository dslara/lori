import type { ActiveDomainProposalAction, DomainApprovalAction, DomainDeleteAction, DomainDraftAction } from "../domain/domain.types.ts";
import type { SessionAction } from "../session/session.types.ts";

export type LoriAction = SessionAction | DomainApprovalAction | DomainDeleteAction | DomainDraftAction | ActiveDomainProposalAction;
