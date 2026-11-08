import type { DomainDraft, DomainQuestionnaire } from "./types.ts";

export type ChapterPrinciple =
  | "Metalearning"
  | "Focus"
  | "Directness"
  | "Drill"
  | "Retrieval"
  | "Feedback"
  | "Retention"
  | "Intuition"
  | "Experimentation";

export type ChapterResourceEvidence = {
  id: string;
  excerpt: string;
  locator: string;
};

export type ChapterSourceEvidence = {
  requestId: string;
  agentRunId: string;
  toolCallId: string;
  toolName: string;
  isError: boolean;
  text: string;
};

export type ChapterResource = {
  id: string;
  title: string;
  url: string;
  scope?: string;
  justification: string;
  limitations: string;
  compatibility: {
    preferencesConsidered: string;
    restrictionsConsidered: string;
    compatible: boolean;
  };
  evidence: ChapterResourceEvidence[];
  author?: string;
  publishedAt?: string;
  version?: string;
  updatedAt?: string;
  language?: string;
  format?: string;
  access?: string;
  cost?: string;
  license?: string;
};

export type ChapterNodeEvidenceRef = {
  resourceId: string;
  evidenceId: string;
};

export type ChapterNodeExitProofContribution = {
  criterion: string;
  rationale: string;
};

export type ChapterNodePrerequisiteRationale = {
  prerequisiteNodeId: string;
  rationale: string;
};

export type ChapterNode = {
  id: string;
  order: number;
  objective: string;
  prerequisiteNodeIds: string[];
  prerequisiteRationales?: ChapterNodePrerequisiteRationale[];
  exitProofContributions?: ChapterNodeExitProofContribution[];
  /** Legacy review detail retained when decoding older snapshots. */
  exitProofCriterion?: string;
  evidenceRefs: ChapterNodeEvidenceRef[];
  recommendedResourceId: string;
};

export type ChapterProposal = {
  outcome: string;
  nodes: ChapterNode[];
  principle: ChapterPrinciple;
  exitProof: {
    description: string;
    criteria: string[];
  };
  effort: {
    minimumHours: number;
    maximumHours: number;
    estimateRationale: string;
    deadline: string | null;
    hoursPerWeek: number;
    feasibility: string;
  };
  resources: ChapterResource[];
};

export type ChapterProposalValidation =
  | { ok: true; proposal: ChapterProposal }
  | { ok: false; reason: string };

const PRINCIPLES: readonly ChapterPrinciple[] = [
  "Metalearning",
  "Focus",
  "Directness",
  "Drill",
  "Retrieval",
  "Feedback",
  "Retention",
  "Intuition",
  "Experimentation",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function decodePrerequisiteRationales(
  value: unknown,
  prerequisiteNodeIds: string[],
): ChapterNodePrerequisiteRationale[] | undefined {
  if (!Array.isArray(value) || value.length !== prerequisiteNodeIds.length) {
    return undefined;
  }
  const rationales: ChapterNodePrerequisiteRationale[] = [];
  const seenPrerequisiteIds = new Set<string>();
  for (const entry of value) {
    if (
      !isRecord(entry) ||
      !isNonEmptyString(entry.prerequisiteNodeId) ||
      !prerequisiteNodeIds.includes(entry.prerequisiteNodeId) ||
      seenPrerequisiteIds.has(entry.prerequisiteNodeId) ||
      !isNonEmptyString(entry.rationale)
    ) {
      return undefined;
    }
    seenPrerequisiteIds.add(entry.prerequisiteNodeId);
    rationales.push({ prerequisiteNodeId: entry.prerequisiteNodeId, rationale: entry.rationale });
  }
  return rationales;
}

function decodeExitProofContributions(
  value: unknown,
  criteria: unknown[],
): ChapterNodeExitProofContribution[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const contributions: ChapterNodeExitProofContribution[] = [];
  const seenCriteria = new Set<string>();
  for (const entry of value) {
    if (
      !isRecord(entry) ||
      !isNonEmptyString(entry.criterion) ||
      !criteria.includes(entry.criterion) ||
      !isNonEmptyString(entry.rationale) ||
      seenCriteria.has(entry.criterion)
    ) {
      return undefined;
    }
    seenCriteria.add(entry.criterion);
    contributions.push({ criterion: entry.criterion, rationale: entry.rationale });
  }
  return contributions;
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0 && url.username.length === 0 && url.password.length === 0;
  } catch {
    return false;
  }
}

function decodeResource(value: unknown, allowMissingScope = false): ChapterResource | undefined {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.title) ||
    !isHttpUrl(value.url) ||
    (!allowMissingScope && !isNonEmptyString(value.scope)) ||
    (value.scope !== undefined && !isNonEmptyString(value.scope)) ||
    !isNonEmptyString(value.justification) ||
    !isNonEmptyString(value.limitations) ||
    !isRecord(value.compatibility) ||
    !isNonEmptyString(value.compatibility.preferencesConsidered) ||
    !isNonEmptyString(value.compatibility.restrictionsConsidered) ||
    typeof value.compatibility.compatible !== "boolean" ||
    !Array.isArray(value.evidence) ||
    value.evidence.length === 0
  ) {
    return undefined;
  }

  const evidence: ChapterResourceEvidence[] = [];
  const evidenceIds = new Set<string>();
  for (const entry of value.evidence) {
    if (
      !isRecord(entry) ||
      !isNonEmptyString(entry.id) ||
      evidenceIds.has(entry.id) ||
      !isNonEmptyString(entry.excerpt) ||
      !isNonEmptyString(entry.locator)
    ) {
      return undefined;
    }
    evidenceIds.add(entry.id);
    evidence.push({ id: entry.id, excerpt: entry.excerpt, locator: entry.locator });
  }

  const metadata: Partial<Pick<ChapterResource, "author" | "publishedAt" | "version" | "updatedAt" | "language" | "format" | "access" | "cost" | "license">> = {};
  for (const field of ["author", "publishedAt", "version", "updatedAt", "language", "format", "access", "cost", "license"] as const) {
    if (value[field] !== undefined) {
      if (!isNonEmptyString(value[field])) {
        return undefined;
      }
      metadata[field] = value[field];
    }
  }

  return {
    id: value.id,
    title: value.title,
    url: value.url,
    ...(value.scope === undefined ? {} : { scope: value.scope as string }),
    justification: value.justification,
    limitations: value.limitations,
    compatibility: {
      preferencesConsidered: value.compatibility.preferencesConsidered,
      restrictionsConsidered: value.compatibility.restrictionsConsidered,
      compatible: value.compatibility.compatible,
    },
    evidence,
    ...metadata,
  };
}

export function validateChapterProposal(
  value: unknown,
  options: { allowMissingReviewDetails?: boolean } = {},
): ChapterProposalValidation {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.outcome) ||
    !Array.isArray(value.nodes) ||
    value.nodes.length === 0 ||
    typeof value.principle !== "string" ||
    !PRINCIPLES.includes(value.principle as ChapterPrinciple) ||
    !isRecord(value.exitProof) ||
    !isNonEmptyString(value.exitProof.description) ||
    !Array.isArray(value.exitProof.criteria) ||
    value.exitProof.criteria.length === 0 ||
    !value.exitProof.criteria.every(isNonEmptyString) ||
    !isRecord(value.effort) ||
    typeof value.effort.minimumHours !== "number" ||
    !Number.isFinite(value.effort.minimumHours) ||
    value.effort.minimumHours < 0 ||
    typeof value.effort.maximumHours !== "number" ||
    !Number.isFinite(value.effort.maximumHours) ||
    value.effort.maximumHours < value.effort.minimumHours ||
    !isNonEmptyString(value.effort.estimateRationale) ||
    (value.effort.deadline !== null && !isNonEmptyString(value.effort.deadline)) ||
    typeof value.effort.hoursPerWeek !== "number" ||
    !Number.isFinite(value.effort.hoursPerWeek) ||
    value.effort.hoursPerWeek < 0 ||
    !isNonEmptyString(value.effort.feasibility) ||
    !Array.isArray(value.resources) ||
    value.resources.length < 1 ||
    value.resources.length > 3
  ) {
    return { ok: false, reason: "A proposta não contém a estrutura, as evidências ou os limites necessários para um Chapter." };
  }

  const criterionKeys = new Set<string>();
  for (const criterion of value.exitProof.criteria as string[]) {
    const key = criterion.trim().replace(/\s+/g, " ").toLowerCase();
    if (criterionKeys.has(key)) {
      return { ok: false, reason: "Os critérios do Exit Proof devem ser únicos, desconsiderando caixa e espaços extras." };
    }
    criterionKeys.add(key);
  }

  const resources: ChapterResource[] = [];
  const resourceIds = new Set<string>();
  const evidenceRefs = new Set<string>();
  for (const entry of value.resources) {
    const resource = decodeResource(entry, options.allowMissingReviewDetails);
    if (resource === undefined || resourceIds.has(resource.id)) {
      return { ok: false, reason: "A proposta contém recurso inválido, URL não verificável ou evidência sem trecho e localização rastreáveis." };
    }
    resourceIds.add(resource.id);
    for (const evidence of resource.evidence) {
      evidenceRefs.add(`${resource.id}\u0000${evidence.id}`);
    }
    resources.push(resource);
  }

  const nodes: ChapterNode[] = [];
  const priorNodeIds = new Set<string>();
  const objectiveKeys = new Set<string>();
  const referencedResourceIds = new Set<string>();
  for (let index = 0; index < value.nodes.length; index += 1) {
    const entry = value.nodes[index];
    if (
      !isRecord(entry) ||
      !isNonEmptyString(entry.id) ||
      priorNodeIds.has(entry.id) ||
      entry.order !== index + 1 ||
      !isNonEmptyString(entry.objective) ||
      objectiveKeys.has(entry.objective.trim().toLowerCase()) ||
      (!options.allowMissingReviewDetails && !Array.isArray(entry.prerequisiteNodeIds)) ||
      (entry.prerequisiteNodeIds !== undefined &&
        (
          !Array.isArray(entry.prerequisiteNodeIds) ||
          !entry.prerequisiteNodeIds.every(isNonEmptyString)
        )) ||
      (!options.allowMissingReviewDetails && !Array.isArray(entry.exitProofContributions)) ||
      (entry.exitProofCriterion !== undefined && (!isNonEmptyString(entry.exitProofCriterion) || !value.exitProof.criteria.includes(entry.exitProofCriterion))) ||
      !Array.isArray(entry.evidenceRefs) ||
      entry.evidenceRefs.length === 0 ||
      !isNonEmptyString(entry.recommendedResourceId) ||
      !resourceIds.has(entry.recommendedResourceId)
    ) {
      return { ok: false, reason: "A proposta contém Nodes fora de ordem, sem objetivo, sem recurso recomendado ou sem referências consistentes." };
    }

    const prerequisiteNodeIds = entry.prerequisiteNodeIds === undefined ? [] : entry.prerequisiteNodeIds as string[];
    if (
      new Set(prerequisiteNodeIds).size !== prerequisiteNodeIds.length ||
      prerequisiteNodeIds.some((nodeId) => !priorNodeIds.has(nodeId))
    ) {
      return { ok: false, reason: "Cada pré-requisito deve apontar para um Node anterior, válido e sem repetição." };
    }

    const prerequisiteRationales = decodePrerequisiteRationales(entry.prerequisiteRationales, prerequisiteNodeIds);
    if (
      (entry.prerequisiteRationales !== undefined && prerequisiteRationales === undefined) ||
      (!options.allowMissingReviewDetails && prerequisiteRationales === undefined)
    ) {
      return { ok: false, reason: "Cada pré-requisito precisa ter um rationale específico não vazio no Node downstream." };
    }

    const contributions = decodeExitProofContributions(entry.exitProofContributions, value.exitProof.criteria);
    if (
      (entry.exitProofContributions !== undefined && contributions === undefined) ||
      (!options.allowMissingReviewDetails && contributions === undefined)
    ) {
      return { ok: false, reason: "Cada Node precisa explicar, com rationale específico, sua contribuição necessária a um critério válido do Exit Proof." };
    }

    priorNodeIds.add(entry.id);
    objectiveKeys.add(entry.objective.trim().toLowerCase());
    const nodeEvidenceRefs: ChapterNodeEvidenceRef[] = [];
    const nodeRefKeys = new Set<string>();
    for (const ref of entry.evidenceRefs) {
      if (
        !isRecord(ref) ||
        !isNonEmptyString(ref.resourceId) ||
        !isNonEmptyString(ref.evidenceId) ||
        !evidenceRefs.has(`${ref.resourceId}\u0000${ref.evidenceId}`)
      ) {
        return { ok: false, reason: "A proposta contém referência a trecho de recurso inexistente." };
      }
      const key = `${ref.resourceId}\u0000${ref.evidenceId}`;
      if (nodeRefKeys.has(key)) {
        return { ok: false, reason: "A proposta repete referências de evidência no mesmo Node." };
      }
      nodeRefKeys.add(key);
      referencedResourceIds.add(ref.resourceId);
      nodeEvidenceRefs.push({ resourceId: ref.resourceId, evidenceId: ref.evidenceId });
    }
    if (!nodeEvidenceRefs.some(({ resourceId }) => resourceId === entry.recommendedResourceId)) {
      return { ok: false, reason: "O recurso recomendado precisa apoiar o Node com pelo menos um trecho referenciado." };
    }
    nodes.push({
      id: entry.id,
      order: entry.order,
      objective: entry.objective,
      prerequisiteNodeIds,
      ...(prerequisiteRationales === undefined ? {} : { prerequisiteRationales }),
      ...(contributions === undefined ? {} : { exitProofContributions: contributions }),
      ...(entry.exitProofCriterion === undefined ? {} : { exitProofCriterion: entry.exitProofCriterion as string }),
      evidenceRefs: nodeEvidenceRefs,
      recommendedResourceId: entry.recommendedResourceId,
    });
  }

  if (!options.allowMissingReviewDetails) {
    for (const criterion of value.exitProof.criteria) {
      const contributorCount = nodes.filter(({ exitProofContributions }) =>
        exitProofContributions?.some((contribution) => contribution.criterion === criterion)
      ).length;
      if (contributorCount !== 1) {
        return { ok: false, reason: "Cada critério do Exit Proof precisa ter exatamente um Node contribuinte." };
      }
    }

    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    const ancestorsByNodeId = new Map<string, Set<string>>();
    for (const node of nodes) {
      const ancestors = new Set<string>();
      const pending = [...node.prerequisiteNodeIds];
      while (pending.length > 0) {
        const prerequisiteId = pending.pop()!;
        if (ancestors.has(prerequisiteId)) {
          continue;
        }
        ancestors.add(prerequisiteId);
        const prerequisite = nodesById.get(prerequisiteId);
        if (prerequisite !== undefined) {
          pending.push(...prerequisite.prerequisiteNodeIds);
        }
      }
      ancestorsByNodeId.set(node.id, ancestors);
    }

    for (const node of nodes) {
      const contributesToExitProof = (node.exitProofContributions?.length ?? 0) > 0;
      const requiredByContributor = nodes.some(({ id, exitProofContributions }) =>
        (exitProofContributions?.length ?? 0) > 0 && ancestorsByNodeId.get(id)?.has(node.id)
      );
      if (!contributesToExitProof && !requiredByContributor) {
        return { ok: false, reason: "Cada Node precisa contribuir ao Exit Proof ou ser pré-requisito estrutural de um Node contribuinte." };
      }
    }
  }

  if (resources.some(({ id }) => !referencedResourceIds.has(id))) {
    return { ok: false, reason: "A proposta inclui recurso que não apoia nenhum Node por meio de trecho referenciado." };
  }

  return {
    ok: true,
    proposal: {
      outcome: value.outcome,
      nodes,
      principle: value.principle as ChapterPrinciple,
      exitProof: { description: value.exitProof.description, criteria: [...value.exitProof.criteria] },
      effort: {
        minimumHours: value.effort.minimumHours,
        maximumHours: value.effort.maximumHours,
        estimateRationale: value.effort.estimateRationale,
        deadline: value.effort.deadline,
        hoursPerWeek: value.effort.hoursPerWeek,
        feasibility: value.effort.feasibility,
      },
      resources,
    },
  };
}

const sourceResearchToolNames = /^(?:web_search|search_web|web_fetch|browser|browser_search|browse|browse_url|fetch_url|open_url|(?:tavily|brave|exa|firecrawl|serp|google|bing)_search|search_(?:tavily|brave|exa|firecrawl|serp|google|bing))$/i;

export function isSourceResearchTool(toolName: string): boolean {
  return sourceResearchToolNames.test(toolName);
}

export function validateChapterSourceEvidence(
  proposal: ChapterProposal,
  toolResults: readonly ChapterSourceEvidence[],
  expected: { requestId: string; agentRunId: string | undefined },
): string | undefined {
  const currentRunResults = expected.agentRunId === undefined
    ? []
    : toolResults.filter((result) =>
      result.requestId === expected.requestId &&
      result.agentRunId === expected.agentRunId &&
      result.toolCallId.trim().length > 0 &&
      result.isError === false &&
      isSourceResearchTool(result.toolName) &&
      result.text.length > 0
    );
  for (const resource of proposal.resources) {
    const hasVerifiedExcerpts = resource.evidence.every(({ excerpt, locator }) =>
      currentRunResults.some((result) => (
        result.text.includes(resource.url) &&
        result.text.includes(excerpt) &&
        result.text.includes(locator)
      ))
    );
    if (!hasVerifiedExcerpts) {
      return `A URL ${resource.url}, um trecho citado ou sua localização não aparece junto em resultado bem-sucedido de ferramenta host apropriada ligado à request e ao run atuais.`;
    }
  }
  return undefined;
}

export function validateProposalForQuestionnaire(
  proposal: ChapterProposal,
  questionnaire: Pick<DomainQuestionnaire, "deadline" | "hoursPerWeek">,
): string | undefined {
  if (proposal.resources.some(({ compatibility }) => !compatibility.compatible)) {
    return "A proposta incluiu fonte incompatível com as preferências ou restrições declaradas.";
  }
  if (proposal.effort.deadline !== questionnaire.deadline || proposal.effort.hoursPerWeek !== questionnaire.hoursPerWeek) {
    return "A estimativa não corresponde ao prazo e à disponibilidade salvos no questionário.";
  }
  return undefined;
}

export function validateProposalForDraft(proposal: ChapterProposal, draft: DomainDraft): string | undefined {
  return validateProposalForQuestionnaire(proposal, {
    deadline: draft.deadline ?? null,
    hoursPerWeek: draft.hoursPerWeek ?? Number.NaN,
  });
}
