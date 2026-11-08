import { describe, expect, test } from "bun:test";
import { validateChapterProposal, validateChapterSourceEvidence, type ChapterSourceEvidence } from "./chapter.ts";

const validProposal = () => ({
  outcome: "Hold a short conversation.",
  nodes: [{
    id: "greetings",
    order: 1,
    objective: "Use a greeting in context.",
    exitProofContributions: [{
      criterion: "Open and close the conversation politely.",
      rationale: "The Node provides the greeting and closing language needed for this observable action.",
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
});

describe("validateChapterSourceEvidence", () => {
  const evidence = (text: string, overrides: Partial<ChapterSourceEvidence> = {}): ChapterSourceEvidence => ({
    requestId: "request-1",
    agentRunId: "run-1",
    toolCallId: "call-1",
    toolName: "brave_search",
    isError: false,
    text,
    ...overrides,
  });

  test("requires an exact URL and excerpt in a resultado bem-sucedido linked to the same request and run", () => {
    const result = validateChapterProposal(validProposal());
    if (!result.ok) throw new Error("Expected a valid Chapter fixture.");
    const sourceResult = "Source https://example.com/phrases states: Good morning.";

    expect(validateChapterSourceEvidence(result.proposal, [evidence(sourceResult)], {
      requestId: "request-1",
      agentRunId: "run-1",
    })).toBeUndefined();
    expect(validateChapterSourceEvidence(result.proposal, [evidence(sourceResult, { requestId: "old-request" })], {
      requestId: "request-1",
      agentRunId: "run-1",
    })).toContain("resultado bem-sucedido");
    expect(validateChapterSourceEvidence(result.proposal, [evidence(sourceResult, { agentRunId: "old-run" })], {
      requestId: "request-1",
      agentRunId: "run-1",
    })).toContain("resultado bem-sucedido");
  });

  test("rejects failed, unrelated, or split results that do not provide both exact source strings", () => {
    const result = validateChapterProposal(validProposal());
    if (!result.ok) throw new Error("Expected a valid Chapter fixture.");
    const expected = { requestId: "request-1", agentRunId: "run-1" };

    expect(validateChapterSourceEvidence(result.proposal, [evidence(
      "https://example.com/phrases Good morning.", { isError: true },
    )], expected)).toContain("resultado bem-sucedido");
    expect(validateChapterSourceEvidence(result.proposal, [evidence(
      "https://example.com/phrases Good morning.", { toolName: "cache_search" },
    )], expected)).toContain("resultado bem-sucedido");
    expect(validateChapterSourceEvidence(result.proposal, [
      evidence("https://example.com/phrases"),
      evidence("Good morning.", { toolCallId: "call-2" }),
    ], expected)).toContain("resultado bem-sucedido");
    expect(validateChapterSourceEvidence(result.proposal, [evidence("https://example.com/phrases Good Morning.")], expected))
      .toContain("resultado bem-sucedido");
  });
});

describe("validateChapterProposal", () => {
  test("accepts a Node with a specific Exit Proof contribution and rationale", () => {
    const result = validateChapterProposal(validProposal());

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.proposal.nodes[0]?.exitProofContributions).toEqual([{
        criterion: "Open and close the conversation politely.",
        rationale: "The Node provides the greeting and closing language needed for this observable action.",
      }]);
    }
  });

  test("rejects a Node without an explicit Exit Proof contribution and rationale", () => {
    const proposal = validProposal();
    delete (proposal.nodes[0] as { exitProofContributions?: unknown }).exitProofContributions;

    const result = validateChapterProposal(proposal);

    expect(result).toMatchObject({ ok: false });
  });

  test("rejects Exit Proof criteria that have no contributing Node", () => {
    const proposal = validProposal();
    proposal.exitProof.criteria.push("Answer a follow-up question.");

    expect(validateChapterProposal(proposal)).toMatchObject({ ok: false });
  });

  test("rejects a Node contribution with an invalid criterion or empty rationale", () => {
    const invalidCriterion = validProposal();
    invalidCriterion.nodes[0]!.exitProofContributions[0]!.criterion = "A different criterion";
    expect(validateChapterProposal(invalidCriterion)).toMatchObject({ ok: false });

    const emptyRationale = validProposal();
    emptyRationale.nodes[0]!.exitProofContributions[0]!.rationale = "   ";
    expect(validateChapterProposal(emptyRationale)).toMatchObject({ ok: false });
  });
});
