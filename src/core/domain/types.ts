export type DomainDraftPhase = "collecting" | "awaiting_curation";
export type Baseline = 1 | 2 | 3 | 4 | 5;

export type DomainDraft = {
  id: string;
  phase: DomainDraftPhase;
  name?: string;
  learningObjective?: string;
  motivation?: string;
  deadline?: string | null;
  hoursPerWeek?: number;
  baseline?: Baseline;
  preferences?: string | null;
  materialRestrictions?: string | null;
};

export type DomainDraftAnswerAction =
  | { type: "domain-draft/answer"; id: string; field: "name"; value: string }
  | { type: "domain-draft/answer"; id: string; field: "learningObjective"; value: string }
  | { type: "domain-draft/answer"; id: string; field: "motivation"; value: string }
  | { type: "domain-draft/answer"; id: string; field: "deadline"; value: string | null }
  | { type: "domain-draft/answer"; id: string; field: "hoursPerWeek"; value: number }
  | { type: "domain-draft/answer"; id: string; field: "baseline"; value: Baseline }
  | { type: "domain-draft/answer"; id: string; field: "preferences"; value: string | null }
  | { type: "domain-draft/answer"; id: string; field: "materialRestrictions"; value: string | null };
