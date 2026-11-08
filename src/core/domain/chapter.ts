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

export type ChapterResource = {
  id: string;
  title: string;
  url: string;
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

export type ChapterNode = {
  id: string;
  order: number;
  objective: string;
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

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0 && url.username.length === 0 && url.password.length === 0;
  } catch {
    return false;
  }
}

function decodeResource(value: unknown): ChapterResource | undefined {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.title) ||
    !isHttpUrl(value.url) ||
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
      if (!isNonEmptyString(value[field])) return undefined;
      metadata[field] = value[field];
    }
  }

  return {
    id: value.id,
    title: value.title,
    url: value.url,
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

export function validateChapterProposal(value: unknown): ChapterProposalValidation {
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

  const resources: ChapterResource[] = [];
  const resourceIds = new Set<string>();
  const evidenceRefs = new Set<string>();
  for (const entry of value.resources) {
    const resource = decodeResource(entry);
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
  const nodeIds = new Set<string>();
  const referencedResourceIds = new Set<string>();
  for (let index = 0; index < value.nodes.length; index += 1) {
    const entry = value.nodes[index];
    if (
      !isRecord(entry) ||
      !isNonEmptyString(entry.id) ||
      nodeIds.has(entry.id) ||
      entry.order !== index + 1 ||
      !isNonEmptyString(entry.objective) ||
      !Array.isArray(entry.evidenceRefs) ||
      entry.evidenceRefs.length === 0 ||
      !isNonEmptyString(entry.recommendedResourceId) ||
      !resourceIds.has(entry.recommendedResourceId)
    ) {
      return { ok: false, reason: "A proposta contém Nodes fora de ordem, sem objetivo, sem recurso recomendado ou sem referências consistentes." };
    }

    nodeIds.add(entry.id);
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
      evidenceRefs: nodeEvidenceRefs,
      recommendedResourceId: entry.recommendedResourceId,
    });
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
