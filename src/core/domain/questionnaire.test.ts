import { describe, expect, test } from "bun:test";
import { getQuestionnaire, isCompleteDomainDraft } from "./questionnaire.ts";
import type { DomainDraft } from "./types.ts";

const completeDraft = (): DomainDraft => ({
  id: "domain-1",
  phase: "awaiting_curation",
  name: "Japanese",
  learningObjective: "Hold a basic conversation.",
  motivation: "Trip",
  deadline: null,
  hoursPerWeek: 0,
  baseline: 1,
  preferences: null,
  materialRestrictions: null,
});

describe("isCompleteDomainDraft", () => {
  test("accepts a draft with every answer, including null and zero optional values", () => {
    expect(isCompleteDomainDraft(completeDraft())).toBe(true);
  });

  test.each([
    "name",
    "learningObjective",
    "motivation",
    "deadline",
    "hoursPerWeek",
    "baseline",
    "preferences",
    "materialRestrictions",
  ] as const)("rejects a draft missing %s", (field) => {
    const draft: DomainDraft = { ...completeDraft(), [field]: undefined };
    expect(isCompleteDomainDraft(draft)).toBe(false);
  });

  test.each(["name", "learningObjective", "motivation"] as const)("rejects an empty %s", (field) => {
    expect(isCompleteDomainDraft({ ...completeDraft(), [field]: "" })).toBe(false);
  });
});

describe("getQuestionnaire", () => {
  test("returns the questionnaire answers for a complete draft", () => {
    expect(getQuestionnaire(completeDraft())).toEqual({
      motivation: "Trip",
      deadline: null,
      hoursPerWeek: 0,
      baseline: 1,
      preferences: null,
      materialRestrictions: null,
    });
  });

  test("returns undefined while a draft is incomplete", () => {
    expect(getQuestionnaire({ ...completeDraft(), baseline: undefined })).toBeUndefined();
  });
});
