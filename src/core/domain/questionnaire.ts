import type { Baseline, DomainDraft, DomainQuestionnaire } from "./types.ts";

type CompleteDomainDraft = DomainDraft & {
  name: string;
  learningObjective: string;
  motivation: string;
  deadline: string | null;
  hoursPerWeek: number;
  baseline: Baseline;
  preferences: string | null;
  materialRestrictions: string | null;
};

// Single rule for when a draft leaves "collecting"; reducer and snapshot decoder both use it.
export function isCompleteDomainDraft(draft: DomainDraft): draft is CompleteDomainDraft {
  return (
    (draft.name !== undefined && draft.name.length > 0) &&
    (draft.learningObjective !== undefined && draft.learningObjective.length > 0) &&
    (draft.motivation !== undefined && draft.motivation.length > 0) &&
    draft.deadline !== undefined &&
    draft.hoursPerWeek !== undefined &&
    draft.baseline !== undefined &&
    draft.preferences !== undefined &&
    draft.materialRestrictions !== undefined
  );
}

export function getQuestionnaire(draft: DomainDraft): DomainQuestionnaire | undefined {
  if (!isCompleteDomainDraft(draft)) {
    return undefined;
  }
  return {
    motivation: draft.motivation,
    deadline: draft.deadline,
    hoursPerWeek: draft.hoursPerWeek,
    baseline: draft.baseline,
    preferences: draft.preferences,
    materialRestrictions: draft.materialRestrictions,
  };
}
