import type { ChapterProposal } from "./chapter.ts";

export type DomainDraftPhase = "collecting" | "awaiting_curation" | "awaiting_approval" | "awaiting_verdict";
export type Baseline = 1 | 2 | 3 | 4 | 5;

export type DomainQuestionnaire = {
  motivation: string;
  deadline: string | null;
  hoursPerWeek: number;
  baseline: Baseline;
  preferences: string | null;
  materialRestrictions: string | null;
};

export type ChapterVersionReference = {
  domainId: string;
  chapterVersionId: string;
};

export type ChapterVersion = {
  id: string;
  version: number;
  approvedAt: number;
  chapter: ChapterProposal;
};

export type ActiveDomain = {
  id: string;
  name: string;
  learningObjective: string;
  questionnaire: DomainQuestionnaire;
  status: "active";
  chapters: ChapterVersion[];
  currentChapterVersionId: string;
};

export type DomainDraft = {
  id: string;
  phase: DomainDraftPhase;
  pendingChapter?: ChapterProposal;
  name?: string;
  learningObjective?: string;
  motivation?: string;
  deadline?: string | null;
  hoursPerWeek?: number;
  baseline?: Baseline;
  preferences?: string | null;
  materialRestrictions?: string | null;
};

export type DomainDraftAction =
  | { type: "domain-draft/answer"; id: string; field: "name"; value: string }
  | { type: "domain-draft/answer"; id: string; field: "learningObjective"; value: string }
  | { type: "domain-draft/answer"; id: string; field: "motivation"; value: string }
  | { type: "domain-draft/answer"; id: string; field: "deadline"; value: string | null }
  | { type: "domain-draft/answer"; id: string; field: "hoursPerWeek"; value: number }
  | { type: "domain-draft/answer"; id: string; field: "baseline"; value: Baseline }
  | { type: "domain-draft/answer"; id: string; field: "preferences"; value: string | null }
  | { type: "domain-draft/answer"; id: string; field: "materialRestrictions"; value: string | null }
  | { type: "domain-draft/propose-chapter"; id: string; proposal: ChapterProposal };

export type DomainDraftAnswerAction = Extract<DomainDraftAction, { type: "domain-draft/answer" }>;

export type DomainApprovalAction = {
  type: "domain/approve";
  id: string;
  chapterVersionId: string;
  approvedAt: number;
};
