import { describe, expect, test } from "bun:test";
import { decideChapterAcceptance, type ChapterSourceEvidence } from "./chapter.ts";
import { reduceDomainSessionState, type DomainSessionState } from "./state-reducer.ts";
import type { ActiveDomain, DomainDraft } from "./domain.types.ts";

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

const strict = { review: "strict" as const, questionnaire: null, sourceEvidence: null };
const restored = { review: "restored" as const, questionnaire: null, sourceEvidence: null };

describe("Chapter source evidence", () => {
  const evidence = (text: string, overrides: Partial<ChapterSourceEvidence> = {}): ChapterSourceEvidence => ({
    requestId: "request-1",
    agentRunId: "run-1",
    toolCallId: "call-1",
    toolName: "brave_search",
    isError: false,
    text,
    ...overrides,
  });
  const checkSource = (results: ChapterSourceEvidence[], expected = { requestId: "request-1", agentRunId: "run-1" }) =>
    decideChapterAcceptance(validProposal(), { ...strict, sourceEvidence: { results, ...expected } });

  test("requires an exact URL, excerpt, and locator in a successful result linked to the same request and run", () => {
    const sourceResult = "Source https://example.com/phrases states: Good morning. Locator: Greetings";

    expect(checkSource([evidence(sourceResult)])).toMatchObject({ ok: true });
    expect(checkSource([evidence("Source https://example.com/phrases states: Good morning.")]))
      .toMatchObject({ ok: false, kind: "unverified-source" });
    expect(checkSource([evidence("Source https://example.com/phrases states: Good morning. Locator: Introductions")]))
      .toMatchObject({ ok: false, kind: "unverified-source" });
    expect(checkSource([evidence(sourceResult, { requestId: "old-request" })]))
      .toMatchObject({ ok: false, kind: "unverified-source" });
    expect(checkSource([evidence(sourceResult, { agentRunId: "old-run" })]))
      .toMatchObject({ ok: false, kind: "unverified-source" });
  });

  test("rejects failed, stale, or incomplete results that do not provide all exact source fields", () => {
    expect(checkSource([evidence("https://example.com/phrases Good morning.", { isError: true })]))
      .toMatchObject({ ok: false, kind: "unverified-source" });
    expect(checkSource([evidence("Source https://example.com/phrases states: Good morning. Locator: Greetings", { toolName: "cache_search" })]))
      .toMatchObject({ ok: true });
    expect(checkSource([
      evidence("https://example.com/phrases Good morning."),
      evidence("Greetings", { toolCallId: "call-2" }),
    ])).toMatchObject({ ok: false, kind: "unverified-source" });
    expect(checkSource([evidence("https://example.com/phrases Good Morning.")]))
      .toMatchObject({ ok: false, kind: "unverified-source" });
  });
});

describe("Chapter proposal structure", () => {
  test("accepts a Node with a specific Exit Proof contribution and rationale", () => {
    const result = decideChapterAcceptance(validProposal(), strict);

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

    const result = decideChapterAcceptance(proposal, strict);

    expect(result).toMatchObject({ ok: false });
  });

  test("rejects Exit Proof criteria that have no contributing Node", () => {
    const proposal = validProposal();
    proposal.exitProof.criteria.push("Answer a follow-up question.");

    expect(decideChapterAcceptance(proposal, strict)).toMatchObject({ ok: false });
  });

  test("rejects duplicate Exit Proof criteria after whitespace and case normalization", () => {
    const proposal = validProposal();
    const duplicateCriterion = "  OPEN   AND CLOSE THE CONVERSATION POLITELY. ";
    proposal.exitProof.criteria.push(duplicateCriterion);
    proposal.nodes[0]!.exitProofContributions.push({
      criterion: duplicateCriterion,
      rationale: "This is the same observable action with different formatting.",
    });

    expect(decideChapterAcceptance(proposal, strict)).toMatchObject({ ok: false });
  });

  test("rejects a Node contribution with an invalid criterion or empty rationale", () => {
    const invalidCriterion = validProposal();
    invalidCriterion.nodes[0]!.exitProofContributions[0]!.criterion = "A different criterion";
    expect(decideChapterAcceptance(invalidCriterion, strict)).toMatchObject({ ok: false });

    const emptyRationale = validProposal();
    emptyRationale.nodes[0]!.exitProofContributions[0]!.rationale = "   ";
    expect(decideChapterAcceptance(emptyRationale, strict)).toMatchObject({ ok: false });
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

    const result = decideChapterAcceptance(proposal, strict);

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

    expect(decideChapterAcceptance(proposal, strict)).toMatchObject({ ok: false });
  });

  test("rejects repeated objectives and repeated Exit Proof criteria even when dependent", () => {
    const duplicateObjective = validProposal();
    duplicateObjective.nodes.push({
      ...duplicateObjective.nodes[0]!,
      id: "same-objective",
      order: 2,
      prerequisiteNodeIds: ["greetings"],
    });
    expect(decideChapterAcceptance(duplicateObjective, strict)).toMatchObject({ ok: false });

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
    expect(decideChapterAcceptance(duplicateCriterion, strict)).toMatchObject({ ok: false });
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

    expect(decideChapterAcceptance(proposal, strict)).toMatchObject({ ok: false });

    delete (proposal.nodes[1] as { prerequisiteRationales?: unknown }).prerequisiteRationales;
    expect(decideChapterAcceptance(proposal, strict)).toMatchObject({ ok: false });
  });

  test("preserves legacy Chapter nodes without newly introduced review details", () => {
    const proposal = validProposal();
    delete (proposal.nodes[0] as { prerequisiteRationales?: unknown }).prerequisiteRationales;
    delete (proposal.nodes[0] as { exitProofContributions?: unknown }).exitProofContributions;

    const result = decideChapterAcceptance(proposal, restored);

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
    expect(decideChapterAcceptance(futureReference, strict)).toMatchObject({ ok: false });

    const unknownReference = validProposal();
    unknownReference.nodes[0]!.prerequisiteNodeIds = ["missing-node"];
    expect(decideChapterAcceptance(unknownReference, strict)).toMatchObject({ ok: false });
  });
});

describe("decideChapterAcceptance", () => {
  test("blocks a proposal without resources as a research blocker, before structural checks", () => {
    expect(decideChapterAcceptance({ ...validProposal(), outcome: " ", resources: [] }, {
      review: "strict",
      questionnaire: null,
      sourceEvidence: null,
    })).toMatchObject({ ok: false, kind: "blocked" });
  });

  test("reports an unverified source only when source evidence is checked", () => {
    const sourceResult: ChapterSourceEvidence = {
      requestId: "request-1",
      agentRunId: "run-1",
      toolCallId: "call-1",
      toolName: "brave_search",
      isError: false,
      text: "Source https://example.com/phrases states: Good morning. Locator: Greetings",
    };
    const checked = (results: ChapterSourceEvidence[]) => ({
      ...strict,
      sourceEvidence: { results, requestId: "request-1", agentRunId: "run-1" },
    });

    expect(decideChapterAcceptance(validProposal(), checked([sourceResult]))).toMatchObject({ ok: true });
    expect(decideChapterAcceptance(validProposal(), checked([]))).toMatchObject({ ok: false, kind: "unverified-source" });
    expect(decideChapterAcceptance(validProposal(), strict)).toMatchObject({ ok: true });
  });

  test("classifies compatibility and effort rejections against the Domain questionnaire", () => {
    const commitments = { deadline: null, hoursPerWeek: 3 };
    const decide = (proposal: unknown, questionnaire: typeof commitments | null = commitments) =>
      decideChapterAcceptance(proposal, { review: "strict", questionnaire, sourceEvidence: null });

    const effortMismatch = validProposal();
    expect(decide(effortMismatch, { deadline: null, hoursPerWeek: 5 })).toMatchObject({ ok: false, kind: "invalid" });

    const allIncompatible = validProposal();
    allIncompatible.resources[0]!.compatibility.compatible = false;
    expect(decide(allIncompatible)).toMatchObject({ ok: false, kind: "blocked" });

    const mixed = validProposal();
    mixed.resources.push({
      ...mixed.resources[0]!,
      id: "resource-2",
      url: "https://example.com/other",
      compatibility: { ...mixed.resources[0]!.compatibility, compatible: false },
    });
    mixed.nodes[0]!.evidenceRefs.push({ resourceId: "resource-2", evidenceId: "excerpt-1" });
    expect(decide(mixed)).toMatchObject({ ok: false, kind: "mixed" });

    expect(decide(effortMismatch, null)).toMatchObject({ ok: true });
    expect(decide(allIncompatible, null)).toMatchObject({ ok: true });
  });

  test("accepts legacy review details only when restoring a snapshot", () => {
    const legacy = validProposal();
    delete (legacy.nodes[0] as { prerequisiteRationales?: unknown }).prerequisiteRationales;
    delete (legacy.nodes[0] as { exitProofContributions?: unknown }).exitProofContributions;
    const options = { questionnaire: null, sourceEvidence: null };

    expect(decideChapterAcceptance(legacy, { ...options, review: "strict" })).toMatchObject({ ok: false, kind: "invalid" });
    expect(decideChapterAcceptance(legacy, { ...options, review: "restored" })).toMatchObject({ ok: true });
  });
});

describe("Chapter acceptance at the reducer", () => {
  const decided = decideChapterAcceptance(validProposal(), { review: "strict", questionnaire: null, sourceEvidence: null });
  if (!decided.ok) {
    throw new Error("Expected a valid Chapter fixture.");
  }
  const draftWithHours = (hoursPerWeek: number): DomainDraft => ({
    id: "draft-1",
    phase: "awaiting_curation",
    name: "Spanish",
    learningObjective: "Order a meal in Spanish.",
    motivation: "Travel.",
    deadline: null,
    hoursPerWeek,
    baseline: 2,
    preferences: null,
    materialRestrictions: null,
  });
  const stateWithHours = (hoursPerWeek: number): DomainSessionState => ({
    domains: [],
    domainDraft: draftWithHours(hoursPerWeek),
    session: { kind: "metalearning", status: "open", domainId: "draft-1", startedAt: 0, totalPausedMs: 0 },
    sessionHistory: [],
  });
  const propose = { type: "domain-draft/propose-chapter" as const, id: "draft-1", proposal: decided.proposal };

  test("refuses a draft proposal that does not match the saved questionnaire", () => {
    const state = stateWithHours(5);

    expect(reduceDomainSessionState(state, propose)).toBe(state);
  });

  test("stores a draft proposal that matches the saved questionnaire", () => {
    expect(reduceDomainSessionState(stateWithHours(3), propose).domainDraft)
      .toMatchObject({ phase: "awaiting_approval" });
  });

  const domainWithHours = (hoursPerWeek: number): ActiveDomain => ({
    id: "domain-1",
    name: "Spanish",
    learningObjective: "Order a meal in Spanish.",
    questionnaire: { motivation: "Travel.", deadline: null, hoursPerWeek, baseline: 2, preferences: null, materialRestrictions: null },
    status: "active",
    chapters: [{ id: "chapter-1", version: 1, approvedAt: 0, chapter: decided.proposal }],
    currentChapterVersionId: "chapter-1",
  });
  const domainState = (hoursPerWeek: number): DomainSessionState => ({
    domains: [domainWithHours(hoursPerWeek)],
    domainDraft: null,
    session: null,
    sessionHistory: [],
  });
  const proposeDomain = {
    type: "domain/propose-chapter" as const,
    id: "domain-1",
    expectedCurrentChapterVersionId: "chapter-1",
    proposal: decided.proposal,
  };

  test("refuses an active Domain proposal that does not match its saved questionnaire", () => {
    const state = domainState(5);

    expect(reduceDomainSessionState(state, proposeDomain)).toBe(state);
  });

  test("stores an active Domain proposal that matches its saved questionnaire", () => {
    expect(reduceDomainSessionState(domainState(3), proposeDomain).domains[0])
      .toMatchObject({ pendingChapter: { outcome: "Hold a short conversation." } });
  });
});
