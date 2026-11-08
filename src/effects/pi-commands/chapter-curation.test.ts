import { describe, expect, test } from "bun:test";
import { Value } from "typebox/value";
import type { DomainDraft } from "../../core/domain/types.ts";
import { validateChapterProposal } from "../../core/domain/chapter.ts";
import { buildChapterCurationPrompt, chapterCurationToolParameters, renderChapterProposal } from "./chapter-curation.ts";

const draft: DomainDraft = {
  id: "domain-1",
  phase: "awaiting_curation",
  name: "Conversational Japanese",
  learningObjective: "Hold a short conversation.",
  motivation: "Travel.",
  deadline: null,
  hoursPerWeek: 3,
  baseline: 1,
  preferences: null,
  materialRestrictions: null,
};

const validSubmission = () => ({
  requestId: "request-1",
  domainId: "domain-1",
  result: {
    status: "proposal",
    proposal: {
      outcome: "Hold a short conversation.",
      nodes: [{
        id: "greetings",
        order: 1,
        objective: "Use a greeting in context.",
        exitProofContributions: [{
          criterion: "Open and close the conversation politely.",
          rationale: "This Node supplies the greeting and closing language used in that criterion.",
        }],
        evidenceRefs: [{ resourceId: "resource-1", evidenceId: "excerpt-1" }],
        recommendedResourceId: "resource-1",
      }],
      principle: "Directness",
      exitProof: {
        description: "A short spoken conversation.",
        criteria: ["Open and close the conversation politely."],
      },
      effort: {
        minimumHours: 2,
        maximumHours: 4,
        estimateRationale: "Two to four hours fit the stated weekly availability.",
        deadline: null,
        hoursPerWeek: 3,
        feasibility: "Feasible in one week.",
      },
      resources: [{
        id: "resource-1",
        title: "Beginner phrases",
        url: "https://example.com/phrases",
        scope: "Basic greetings and closings.",
        justification: "It directly supports conversational greetings.",
        limitations: "Only short expressions.",
        compatibility: {
          preferencesConsidered: "No preference was declared.",
          restrictionsConsidered: "No restriction was declared.",
          compatible: true,
        },
        evidence: [{ id: "excerpt-1", excerpt: "Good morning.", locator: "Greetings" }],
      }],
    },
  },
});

describe("chapter curation prompt and proposal presentation", () => {
  test("asks for the smallest essential Node set and specific, justified contributions", () => {
    const prompt = buildChapterCurationPrompt("request-1", draft);

    expect(prompt).toContain("menor conjunto ordenado de Nodes necessário");
    expect(prompt).toContain("omita qualquer Node não essencial");
    expect(prompt).toContain("rationale específico");
  });

  test("redacts ambiguous paths from the prompt without changing the draft data", () => {
    const path = "/home/player/private notes/recording.wav";
    const sensitiveDraft = { ...draft, preferences: `Use ${path} for practice.` };

    const prompt = buildChapterCurationPrompt("request-1", sensitiveDraft);

    expect(prompt).not.toContain(path);
    expect(prompt).not.toContain("notes/recording.wav");
    expect(sensitiveDraft.preferences).toBe(`Use ${path} for practice.`);
  });

  test("validates contribution and rationale in the submitted Node schema", () => {
    const submission = validSubmission();
    expect(Value.Check(chapterCurationToolParameters, submission)).toBe(true);

    const noContribution = validSubmission();
    delete (noContribution.result.proposal.nodes[0] as { exitProofContributions?: unknown }).exitProofContributions;
    expect(Value.Check(chapterCurationToolParameters, noContribution)).toBe(false);

    const noRationale = validSubmission();
    noRationale.result.proposal.nodes[0]!.exitProofContributions[0]!.rationale = " ";
    expect(Value.Check(chapterCurationToolParameters, noRationale)).toBe(false);
  });

  test("presents each Node's explicit contribution and rationale to the Player", () => {
    const validation = validateChapterProposal(validSubmission().result.proposal);
    if (!validation.ok) throw new Error("Expected a valid Chapter proposal fixture.");

    const presentation = renderChapterProposal(draft, validation.proposal);

    expect(presentation).toContain("Critério do Exit Proof: Open and close the conversation politely.");
    expect(presentation).toContain("Contribuição necessária: This Node supplies the greeting and closing language used in that criterion.");
  });
});
