import type { ActiveDomain, DomainDraft } from "../../../core/domain/domain.types.ts";

export type ChapterApprovalTarget =
  | { kind: "draft"; draft: DomainDraft }
  | { kind: "active"; domain: ActiveDomain };
