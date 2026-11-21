import type { LoriAction } from "../shared/actions.types.ts";
import type { DomainDraft } from "./domain.types.ts";
import { isCompleteDomainDraft } from "./questionnaire.ts";
import type { SessionAction } from "../session/session.types.ts";

function isBaseline(value: number): value is 1 | 2 | 3 | 4 | 5 {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export function reduceDomainDraft(
  draft: DomainDraft | null,
  action: LoriAction,
): DomainDraft | null {
  if (action.type === "domain/approve") {
    if (
      draft === null ||
      draft.id !== action.id ||
      draft.phase !== "awaiting_approval" ||
      draft.pendingChapter === undefined ||
      action.chapterVersionId.trim().length === 0 ||
      !Number.isFinite(action.approvedAt)
    ) {
      return draft;
    }
    const { pendingChapter: _pendingChapter, ...approvedDraft } = draft;
    return { ...approvedDraft, phase: "awaiting_verdict" };
  }

  if (action.type === "domain-draft/propose-chapter") {
    if (draft === null || draft.id !== action.id || draft.phase !== "awaiting_curation") {
      return draft;
    }
    return { ...draft, phase: "awaiting_approval", pendingChapter: action.proposal };
  }

  if (action.type === "domain-draft/save-verdict-focus") {
    if (
      draft === null ||
      draft.id !== action.id ||
      draft.phase !== "awaiting_verdict" ||
      draft.verdictFocus !== undefined ||
      !Number.isFinite(action.focus)
    ) {
      return draft;
    }
    return { ...draft, verdictFocus: action.focus };
  }

  if (action.type === "session/open-metalearning") {
    if (draft !== null || action.domainId.trim().length === 0 || !Number.isFinite(action.startedAt)) {
      return draft;
    }
    return { id: action.domainId, phase: "collecting" };
  }

  if (action.type !== "domain-draft/answer" || draft === null || action.id !== draft.id || draft.phase !== "collecting") {
    return draft;
  }

  let updated: DomainDraft;
  switch (action.field) {
    case "name":
    case "learningObjective":
    case "motivation":
      if (typeof action.value !== "string" || action.value.trim().length === 0) {
        return draft;
      }
      updated = { ...draft, [action.field]: action.value.trim() };
      break;
    case "deadline":
      if (action.value !== null && (typeof action.value !== "string" || action.value.trim().length === 0)) {
        return draft;
      }
      updated = { ...draft, deadline: action.value === null ? null : action.value.trim() };
      break;
    case "preferences":
    case "materialRestrictions":
      if (action.value !== null && typeof action.value !== "string") {
        return draft;
      }
      updated = {
        ...draft,
        [action.field]: typeof action.value === "string" ? action.value.trim() || null : null,
      };
      break;
    case "hoursPerWeek":
      if (typeof action.value !== "number" || !Number.isFinite(action.value) || action.value < 0) {
        return draft;
      }
      updated = { ...draft, hoursPerWeek: action.value };
      break;
    case "baseline":
      if (!isBaseline(action.value)) {
        return draft;
      }
      updated = { ...draft, baseline: action.value };
      break;
  }

  return isCompleteDomainDraft(updated) ? { ...updated, phase: "awaiting_curation" } : updated;
}

export function isSessionAction(action: LoriAction): action is SessionAction {
  switch (action.type) {
    case "session/open":
    case "session/open-metalearning":
    case "session/open-study":
    case "session/abandon":
    case "session/resume":
    case "session/close":
      return true;
    case "domain-draft/answer":
    case "domain-draft/propose-chapter":
    case "domain/approve":
    case "domain-draft/save-verdict-focus":
    case "domain/delete":
    case "domain/propose-chapter":
      return false;
  }
}
