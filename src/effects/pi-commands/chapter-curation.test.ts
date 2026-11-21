import { describe, expect, test } from "bun:test";
import { Value } from "typebox/value";
import type { DomainDraft } from "../../core/domain/types.ts";
import { decideChapterAcceptance } from "../../core/domain/chapter.ts";
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
        prerequisiteNodeIds: [] as string[],
        prerequisiteRationales: [] as { prerequisiteNodeId: string; rationale: string }[],
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
  test("includes source research instructions in first-Chapter and re-curation prompts", () => {
    const prompts = [
      buildChapterCurationPrompt("request-1", draft),
      buildChapterCurationPrompt("request-1", draft, { currentChapterVersionId: "chapter-1" }),
    ];

    for (const prompt of prompts) {
      expect(prompt).toContain("Pesquise fontes reais com as ferramentas disponíveis.");
      expect(prompt).toContain("Cite trechos exatos e localização.");
      expect(prompt).toContain("Não invente fontes nem relaxe restrições.");
    }
  });

  test("asks for the smallest essential Node set and specific, justified contributions", () => {
    const prompt = buildChapterCurationPrompt("request-1", draft);

    expect(prompt).toContain("menor conjunto ordenado de Nodes necessário");
    expect(prompt).toContain("omita qualquer Node não essencial");
    expect(prompt).toContain("rationale específico");
    expect(prompt).toContain("prerequisiteNodeIds");
    expect(prompt).toContain("prerequisiteRationales");
    expect(prompt).toContain("exatamente um Node contribuinte");
    expect(prompt).toContain("não permita que outro Node também o declare");
    expect(prompt).toContain("exitProofContributions: []");
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

    const noPrerequisites = validSubmission();
    delete (noPrerequisites.result.proposal.nodes[0] as { prerequisiteNodeIds?: unknown }).prerequisiteNodeIds;
    expect(Value.Check(chapterCurationToolParameters, noPrerequisites)).toBe(false);

    const noPrerequisiteRationale = validSubmission();
    delete (noPrerequisiteRationale.result.proposal.nodes[0] as { prerequisiteRationales?: unknown }).prerequisiteRationales;
    expect(Value.Check(chapterCurationToolParameters, noPrerequisiteRationale)).toBe(false);

    const structuralPrerequisite = validSubmission();
    const contributor = structuralPrerequisite.result.proposal.nodes[0]!;
    structuralPrerequisite.result.proposal.nodes = [
      {
        ...contributor,
        id: "foundation",
        order: 1,
        objective: "Recognize the basic sounds.",
        prerequisiteNodeIds: [],
        prerequisiteRationales: [],
        exitProofContributions: [],
      },
      {
        ...contributor,
        order: 2,
        prerequisiteNodeIds: ["foundation"],
        prerequisiteRationales: [{
          prerequisiteNodeId: "foundation",
          rationale: "Recognizing the basic sounds is necessary to distinguish the greeting phrases.",
        }],
      },
    ];
    expect(Value.Check(chapterCurationToolParameters, structuralPrerequisite)).toBe(true);

    const noRationale = validSubmission();
    noRationale.result.proposal.nodes[0]!.exitProofContributions[0]!.rationale = " ";
    expect(Value.Check(chapterCurationToolParameters, noRationale)).toBe(false);
  });

  test("presents each Node's explicit contribution and rationale to the Player", () => {
    const validation = decideChapterAcceptance(validSubmission().result.proposal, { review: "strict", questionnaire: null, sourceEvidence: null });
    if (!validation.ok) {
      throw new Error("Expected a valid Chapter proposal fixture.");
    }

    const presentation = renderChapterProposal(draft, validation.proposal);

    expect(presentation).toContain("Contribuição única ao Exit Proof: Open and close the conversation politely.");
    expect(presentation).toContain("Pré-requisitos: nenhum");
    expect(presentation).toContain("Necessidade desta contribuição: This Node supplies the greeting and closing language used in that criterion.");
  });

  test("presents a structural prerequisite and its dependency to the Player", () => {
    const proposal = validSubmission().result.proposal;
    const contributor = proposal.nodes[0]!;
    proposal.nodes = [
      {
        ...contributor,
        id: "foundation",
        order: 1,
        objective: "Recognize the basic sounds.",
        prerequisiteNodeIds: [],
        prerequisiteRationales: [],
        exitProofContributions: [],
      },
      {
        ...contributor,
        order: 2,
        prerequisiteNodeIds: ["foundation"],
        prerequisiteRationales: [{
          prerequisiteNodeId: "foundation",
          rationale: "Recognizing the basic sounds is necessary to distinguish the greeting phrases.",
        }],
      },
    ];
    const validation = decideChapterAcceptance(proposal, { review: "strict", questionnaire: null, sourceEvidence: null });
    if (!validation.ok) {
      throw new Error("Expected a valid proposal with a structural prerequisite.");
    }

    const presentation = renderChapterProposal(draft, validation.proposal);

    expect(presentation).toContain("Papel: Node preparatório sem claim duplicado; pré-requisito estrutural para greetings");
    expect(presentation).toContain("Pré-requisitos: foundation");
    expect(presentation).toContain("Motivo da dependência em foundation: Recognizing the basic sounds is necessary to distinguish the greeting phrases.");
  });
});
