import { describe, expect, test } from "bun:test";
import { createInitialState } from "./state.ts";
import { createStore } from "./store.ts";

describe("Lori store", () => {
  test("dispatches Session actions and keeps state unchanged when the reducer rejects replacement", () => {
    const store = createStore({ ...createInitialState(), player: { totalXp: 23 } });
    store.dispatch({
      type: "session/open",
      domain: "React",
      primaryTechnique: "Active Recall",
      startedAt: 1_000,
    });
    const openedState = store.getState();

    store.dispatch({
      type: "session/open",
      domain: "Japanese",
      primaryTechnique: "Direct Practice",
      startedAt: 2_000,
    });

    expect(openedState.session).toMatchObject({ kind: "legacyStudy", name: "React" });
    expect(store.getState().player.totalXp).toBe(23);
    expect(store.getState()).toBe(openedState);
  });

  test("rejects Study Session references that do not match the curated first Node and its resource", () => {
    const criterion = "The Player completes the first task.";
    const domain = {
      id: "domain-1",
      name: "Spanish",
      learningObjective: "Complete a short conversation.",
      questionnaire: {
        motivation: "Travel",
        deadline: null,
        hoursPerWeek: 3,
        baseline: 1 as const,
        preferences: null,
        materialRestrictions: null,
      },
      status: "active" as const,
      chapters: [{
        id: "chapter-1",
        version: 1,
        approvedAt: 1_000,
        chapter: {
          outcome: "Complete a short conversation.",
          nodes: [{
            id: "first-node",
            order: 1,
            objective: "Use a greeting.",
            prerequisiteNodeIds: [],
            exitProofCriterion: criterion,
            evidenceRefs: [{ resourceId: "resource-1", evidenceId: "excerpt-1" }],
            recommendedResourceId: "resource-1",
          }],
          principle: "Directness" as const,
          exitProof: { description: "A short conversation.", criteria: [criterion] },
          effort: {
            minimumHours: 1,
            maximumHours: 2,
            estimateRationale: "Two hours of practice.",
            deadline: null,
            hoursPerWeek: 3,
            feasibility: "Fits the weekly availability.",
          },
          resources: [{
            id: "resource-1",
            title: "Beginner dialogue",
            url: "https://example.test/dialogue",
            scope: "One short conversation.",
            justification: "Directly supports the objective.",
            limitations: "Only one dialogue.",
            compatibility: { preferencesConsidered: "None declared.", restrictionsConsidered: "None declared.", compatible: true },
            evidence: [{ id: "excerpt-1", excerpt: "Hola.", locator: "Line 1" }],
          }],
        },
      }],
      currentChapterVersionId: "chapter-1",
    };
    const store = createStore({ ...createInitialState(), domains: [domain] });

    store.dispatch({
      type: "session/open-study",
      domainId: "domain-1",
      chapterRef: { domainId: "domain-1", chapterVersionId: "chapter-1" },
      nodeId: "not-the-first-node",
      resourceId: "resource-1",
      primaryTechnique: "Active Recall",
      startedAt: 2_000,
    });
    expect(store.getState().session).toBeNull();

    store.dispatch({
      type: "session/open-study",
      domainId: "domain-1",
      chapterRef: { domainId: "domain-1", chapterVersionId: "chapter-1" },
      nodeId: "first-node",
      resourceId: "resource-1",
      primaryTechnique: "Active Recall",
      startedAt: 2_000,
    });
    expect(store.getState().session).toMatchObject({ kind: "study", nodeId: "first-node", resourceId: "resource-1" });
  });
});
