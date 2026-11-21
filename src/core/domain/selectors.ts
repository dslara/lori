import type { ChapterNode, ChapterResource } from "./chapter.ts";
import type { ActiveDomain, ChapterVersionReference, DomainDraft, DomainDraftAnswerAction } from "./domain.types.ts";

export type DomainDraftQuestionField = DomainDraftAnswerAction["field"];

const DOMAIN_DRAFT_QUESTION_ORDER: readonly DomainDraftQuestionField[] = [
  "name",
  "learningObjective",
  "motivation",
  "deadline",
  "hoursPerWeek",
  "baseline",
  "preferences",
  "materialRestrictions",
];

export function selectNextDomainDraftField(draft: DomainDraft): DomainDraftQuestionField | undefined {
  return DOMAIN_DRAFT_QUESTION_ORDER.find((field) => draft[field] === undefined);
}

export type RecommendedStudyTarget = {
  domain: ActiveDomain;
  chapter: ActiveDomain["chapters"][number];
  node: ChapterNode;
  resource: ChapterResource;
};

export function selectRecommendedStudyTarget(
  domains: readonly ActiveDomain[],
  chapterRef: ChapterVersionReference,
): RecommendedStudyTarget | undefined {
  const domain = domains.find(({ id }) => id === chapterRef.domainId);
  const chapter = domain?.chapters.find(({ id }) => id === chapterRef.chapterVersionId);
  const node = chapter?.chapter.nodes[0];
  const resource = node === undefined
    ? undefined
    : chapter?.chapter.resources.find(({ id }) => id === node.recommendedResourceId);
  if (domain === undefined || chapter === undefined || node === undefined || resource === undefined) return undefined;
  return { domain, chapter, node, resource };
}
