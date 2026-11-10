import { describe, expect, test } from "bun:test";
import { validateChapterProposal, validateChapterSourceEvidence, type ChapterSourceEvidence } from "./chapter.ts";

const validProposal = () => ({
  outcome: "Hold a short conversation.",
  nodes: [{
    id: "greetings",
    order: 1,
    objective: "Use a greeting in context.",
    prerequisiteNodeIds: [] as string[],
    prerequisiteRationales: [] as { prerequisiteNodeId: string; rationale: string }[],
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

  test("requires an exact URL, excerpt, and locator in a successful result linked to the same request and run", () => {
    const result = validateChapterProposal(validProposal());
    if (!result.ok) {
      throw new Error("Expected a valid Chapter fixture.");
    }
    const sourceResult = "Source https://example.com/phrases states: Good morning. Locator: Greetings";

    expect(validateChapterSourceEvidence(result.proposal, [evidence(sourceResult)], {
      requestId: "request-1",
      agentRunId: "run-1",
    })).toBeUndefined();
    expect(validateChapterSourceEvidence(result.proposal, [evidence(
      "Source https://example.com/phrases states: Good morning.",
    )], {
      requestId: "request-1",
      agentRunId: "run-1",
    })).toContain("resultado bem-sucedido");
    expect(validateChapterSourceEvidence(result.proposal, [evidence(
      "Source https://example.com/phrases states: Good morning. Locator: Introductions",
    )], {
      requestId: "request-1",
      agentRunId: "run-1",
    })).toContain("resultado bem-sucedido");
    expect(validateChapterSourceEvidence(result.proposal, [evidence(sourceResult, { requestId: "old-request" })], {
      requestId: "request-1",
      agentRunId: "run-1",
    })).toContain("resultado bem-sucedido");
    expect(validateChapterSourceEvidence(result.proposal, [evidence(sourceResult, { agentRunId: "old-run" })], {
      requestId: "request-1",
      agentRunId: "run-1",
    })).toContain("resultado bem-sucedido");
  });

  test("rejects failed, stale, or incomplete results that do not provide all exact source fields", () => {
    const result = validateChapterProposal(validProposal());
    if (!result.ok) {
      throw new Error("Expected a valid Chapter fixture.");
    }
    const expected = { requestId: "request-1", agentRunId: "run-1" };

    expect(validateChapterSourceEvidence(result.proposal, [evidence(
      "https://example.com/phrases Good morning.", { isError: true },
    )], expected)).toContain("resultado bem-sucedido");
    expect(validateChapterSourceEvidence(result.proposal, [evidence(
      "Source https://example.com/phrases states: Good morning. Locator: Greetings", { toolName: "cache_search" },
    )], expected)).toBeUndefined();
    expect(validateChapterSourceEvidence(result.proposal, [
      evidence("https://example.com/phrases Good morning."),
      evidence("Greetings", { toolCallId: "call-2" }),
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
      expect(result.proposal.nodes[0]?.prerequisiteNodeIds).toEqual([]);
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

  test("rejects duplicate Exit Proof criteria after whitespace and case normalization", () => {
    const proposal = validProposal();
    const duplicateCriterion = "  OPEN   AND CLOSE THE CONVERSATION POLITELY. ";
    proposal.exitProof.criteria.push(duplicateCriterion);
    proposal.nodes[0]!.exitProofContributions.push({
      criterion: duplicateCriterion,
      rationale: "This is the same observable action with different formatting.",
    });

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

  test("accepts an ordered prerequisite chain ending in an Exit Proof contribution", () => {
    const proposal = validProposal();
    proposal.nodes = [
      {
        ...proposal.nodes[0]!,
        id: "sounds",
        order: 1,
        objective: "Recognize the basic sounds.",
        prerequisiteNodeIds: [],
        prerequisiteRationales: [],
        exitProofContributions: [],
      },
      {
        ...proposal.nodes[0]!,
        id: "conversation-basics",
        order: 2,
        objective: "Recognize the phrases used in a short conversation.",
        prerequisiteNodeIds: ["sounds"],
        prerequisiteRationales: [{
          prerequisiteNodeId: "sounds",
          rationale: "Recognizing the sounds is necessary to distinguish the words used in the phrases.",
        }],
        exitProofContributions: [],
      },
      {
        ...proposal.nodes[0]!,
        id: "polite-closing",
        order: 3,
        objective: "Use a polite closing in context.",
        prerequisiteNodeIds: ["conversation-basics"],
        prerequisiteRationales: [{
          prerequisiteNodeId: "conversation-basics",
          rationale: "Understanding the basic phrases is necessary before using a polite closing in conversation.",
        }],
        exitProofContributions: [{
          criterion: "Open and close the conversation politely.",
          rationale: "This Node provides the separate closing language needed to complete the observable conversation.",
        }],
      },
    ];

    const result = validateChapterProposal(proposal);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.proposal.nodes.map(({ prerequisiteNodeIds }) => prerequisiteNodeIds)).toEqual([[], ["sounds"], ["conversation-basics"]]);
      expect(result.proposal.nodes[2]?.prerequisiteRationales).toEqual([{
        prerequisiteNodeId: "conversation-basics",
        rationale: "Understanding the basic phrases is necessary before using a polite closing in conversation.",
      }]);
    }
  });

  test("rejects an unconnected Node that contributes neither to the Exit Proof nor structurally", () => {
    const proposal = validProposal();
    proposal.nodes.push({
      ...proposal.nodes[0]!,
      id: "unrelated",
      order: 2,
      objective: "Study an unrelated topic.",
      prerequisiteNodeIds: [],
      prerequisiteRationales: [],
      exitProofContributions: [],
    });

    expect(validateChapterProposal(proposal)).toMatchObject({ ok: false });
  });

  test("rejects repeated objectives and repeated Exit Proof criteria even when dependent", () => {
    const duplicateObjective = validProposal();
    duplicateObjective.nodes.push({
      ...duplicateObjective.nodes[0]!,
      id: "same-objective",
      order: 2,
      prerequisiteNodeIds: ["greetings"],
    });
    expect(validateChapterProposal(duplicateObjective)).toMatchObject({ ok: false });

    const duplicateCriterion = validProposal();
    duplicateCriterion.nodes.push({
      ...duplicateCriterion.nodes[0]!,
      id: "dependent-greetings",
      order: 2,
      objective: "Use a different greeting in context.",
      prerequisiteNodeIds: ["greetings"],
      prerequisiteRationales: [{
        prerequisiteNodeId: "greetings",
        rationale: "The earlier greeting practice is necessary before this second attempt.",
      }],
    });
    expect(validateChapterProposal(duplicateCriterion)).toMatchObject({ ok: false });
  });

  test("requires non-empty rationales for prerequisite relationships", () => {
    const proposal = validProposal();
    proposal.nodes = [
      {
        ...proposal.nodes[0]!,
        id: "sounds",
        order: 1,
        objective: "Recognize the basic sounds.",
        exitProofContributions: [],
      },
      {
        ...proposal.nodes[0]!,
        id: "greetings",
        order: 2,
        prerequisiteNodeIds: ["sounds"],
        prerequisiteRationales: [{ prerequisiteNodeId: "sounds", rationale: "   " }],
      },
    ];

    expect(validateChapterProposal(proposal)).toMatchObject({ ok: false });

    delete (proposal.nodes[1] as { prerequisiteRationales?: unknown }).prerequisiteRationales;
    expect(validateChapterProposal(proposal)).toMatchObject({ ok: false });
  });

  test("preserves legacy Chapter nodes without newly introduced review details", () => {
    const proposal = validProposal();
    delete (proposal.nodes[0] as { prerequisiteRationales?: unknown }).prerequisiteRationales;
    delete (proposal.nodes[0] as { exitProofContributions?: unknown }).exitProofContributions;

    const result = validateChapterProposal(proposal, { allowMissingReviewDetails: true });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.proposal.nodes[0]).not.toHaveProperty("prerequisiteRationales");
      expect(result.proposal.nodes[0]).not.toHaveProperty("exitProofContributions");
    }
  });

  test("rejects prerequisite references to later or unknown Nodes", () => {
    const futureReference = validProposal();
    futureReference.nodes[0]!.prerequisiteNodeIds = ["later-node"];
    futureReference.nodes.push({
      ...futureReference.nodes[0]!,
      id: "later-node",
      order: 2,
      objective: "Ask a follow-up question.",
      prerequisiteNodeIds: [],
    });
    expect(validateChapterProposal(futureReference)).toMatchObject({ ok: false });

    const unknownReference = validProposal();
    unknownReference.nodes[0]!.prerequisiteNodeIds = ["missing-node"];
    expect(validateChapterProposal(unknownReference)).toMatchObject({ ok: false });
  });
});
