import { Type } from "typebox";
import type { DomainDraft } from "../../../core/domain/domain.types.ts";
import type { ChapterProposal } from "../../../core/domain/chapter.ts";
import type { ChapterCurationToolResult } from "./lori-curate.types.ts";
import { redactSensitiveText } from "../../../core/privacy/redact-sensitive-text.ts";

const nonEmptyString = (description: string) => Type.String({ minLength: 1, pattern: "\\S", description });

const evidenceSchema = Type.Object({
  id: nonEmptyString("Stable evidence ID, referenced by Nodes."),
  excerpt: nonEmptyString("Exact source excerpt that supports a Node objective."),
  locator: nonEmptyString("Page, section, timestamp, or other location of the excerpt."),
}, { additionalProperties: false });

const resourceSchema = Type.Object({
  id: nonEmptyString("Stable resource ID, referenced by Nodes."),
  title: nonEmptyString("Resource title."),
  url: Type.String({ format: "uri", description: "Verifiable HTTPS source URL." }),
  scope: nonEmptyString("What the resource covers and does not cover."),
  justification: nonEmptyString("Why this resource fits the objective and Player context."),
  limitations: nonEmptyString("Known access or quality limitations."),
  compatibility: Type.Object({
    preferencesConsidered: nonEmptyString("How declared material preferences were considered, or why none apply."),
    restrictionsConsidered: nonEmptyString("How every declared material restriction was honored, or why none apply."),
    compatible: Type.Boolean({ description: "True only when the resource satisfies the Player's restrictions." }),
  }, { additionalProperties: false }),
  evidence: Type.Array(evidenceSchema, { minItems: 1 }),
  author: Type.Optional(nonEmptyString("Author or responsible institution, when relevant.")),
  publishedAt: Type.Optional(nonEmptyString("Publication date or release date, when relevant.")),
  version: Type.Optional(nonEmptyString("Version identifier, when relevant.")),
  updatedAt: Type.Optional(nonEmptyString("Last update date, when relevant.")),
  language: Type.Optional(nonEmptyString("Resource language, when relevant.")),
  format: Type.Optional(nonEmptyString("Resource format, when relevant.")),
  access: Type.Optional(nonEmptyString("Access requirements, when relevant.")),
  cost: Type.Optional(nonEmptyString("Cost, when relevant.")),
  license: Type.Optional(nonEmptyString("License, when relevant.")),
}, { additionalProperties: false });

const chapterSchema = Type.Object({
  outcome: nonEmptyString("Observable learning outcome for the first Chapter."),
  nodes: Type.Array(Type.Object({
    id: nonEmptyString("Unique Node ID within this Chapter."),
    order: Type.Integer({ minimum: 1, description: "One-based contiguous order in the Chapter." }),
    objective: nonEmptyString("Specific learning objective for this Node."),
    prerequisiteNodeIds: Type.Array(nonEmptyString("ID of an earlier prerequisite Node."), {
      description: "Only earlier Node IDs required before this Node; empty when it has no prerequisite.",
    }),
    prerequisiteRationales: Type.Array(Type.Object({
      prerequisiteNodeId: nonEmptyString("ID of an earlier prerequisite Node explained by this rationale."),
      rationale: nonEmptyString("Why this prerequisite is necessary for the downstream Node."),
    }, { additionalProperties: false }), {
      description: "Exactly one non-empty rationale for each prerequisiteNodeId; empty only when there are no prerequisites.",
    }),
    exitProofContributions: Type.Array(Type.Object({
      criterion: nonEmptyString("Exact Exit Proof criterion this Node contributes to satisfying."),
      rationale: nonEmptyString("Specific reason this Node is needed to satisfy that criterion."),
    }, { additionalProperties: false }), { description: "Exit Proof criteria this Node directly contributes to; empty only for a structural prerequisite Node." }),
    evidenceRefs: Type.Array(Type.Object({
      resourceId: nonEmptyString("ID of a resource in this proposal."),
      evidenceId: nonEmptyString("ID of an excerpt registered on that resource."),
    }, { additionalProperties: false }), { minItems: 1 }),
    recommendedResourceId: nonEmptyString("Resource ID recommended for studying this Node."),
  }, { additionalProperties: false }), { minItems: 1 }),
  principle: Type.Union([
    Type.Literal("Metalearning"), Type.Literal("Focus"), Type.Literal("Directness"),
    Type.Literal("Drill"), Type.Literal("Retrieval"), Type.Literal("Feedback"),
    Type.Literal("Retention"), Type.Literal("Intuition"), Type.Literal("Experimentation"),
  ]),
  exitProof: Type.Object({
    description: nonEmptyString("Exit Proof artifact or demonstration."),
    criteria: Type.Array(nonEmptyString("Observable criterion for the Exit Proof."), { minItems: 1 }),
  }, { additionalProperties: false }),
  effort: Type.Object({
    minimumHours: Type.Number({ minimum: 0, description: "Approximate lower end of total effort." }),
    maximumHours: Type.Number({ minimum: 0, description: "Approximate upper end of total effort." }),
    estimateRationale: nonEmptyString("How the effort estimate relates to the Player's deadline and weekly availability."),
    deadline: Type.Union([nonEmptyString("Exact deadline from the current request."), Type.Null()]),
    hoursPerWeek: Type.Number({ minimum: 0, description: "Exact weekly availability from the current request." }),
    feasibility: nonEmptyString("Approximate feasibility, not a completion promise or daily schedule."),
  }, { additionalProperties: false }),
  resources: Type.Array(resourceSchema, { maxItems: 3 }),
}, { additionalProperties: false });

export const chapterCurationToolParameters = Type.Object({
  requestId: nonEmptyString("Request ID from the current explicit /lori-curate command."),
  domainId: nonEmptyString("Domain draft ID from the current request."),
  result: Type.Union([
    Type.Object({ status: Type.Literal("proposal"), proposal: chapterSchema }, { additionalProperties: false }),
    Type.Object({ status: Type.Literal("blocked"), reason: nonEmptyString("Why no verified compatible resources were found.") }, { additionalProperties: false }),
  ]),
}, { additionalProperties: false });

export function buildChapterCurationPrompt(
  requestId: string,
  draft: DomainDraft,
  options: { currentChapterVersionId?: string } = {},
): string {
  const isRecuration = options.currentChapterVersionId !== undefined;
  return [
    isRecuration
      ? "Solicitação explícita /lori-curate para propor uma nova versão do Chapter atual do Domain ativo. Use as respostas salvas."
      : "Solicitação explícita /lori-curate para propor o primeiro Chapter do Domain.",
    ...(options.currentChapterVersionId === undefined ? [] : [`Versão aprovada atual: ${options.currentChapterVersionId}`]),
    `requestId: ${requestId}`,
    `domainId: ${draft.id}`,
    `Domain: ${redactSensitiveText(draft.name ?? "")}`,
    `Learning Objective: ${redactSensitiveText(draft.learningObjective ?? "")}`,
    `Motivação: ${redactSensitiveText(draft.motivation ?? "")}`,
    `Prazo: ${draft.deadline === null || draft.deadline === undefined ? "sem prazo" : redactSensitiveText(draft.deadline)}`,
    `Horas por semana: ${draft.hoursPerWeek}`,
    `Baseline: ${draft.baseline}`,
    `Preferências: ${draft.preferences === null || draft.preferences === undefined ? "nenhuma declarada" : redactSensitiveText(draft.preferences)}`,
    `Restrições: ${draft.materialRestrictions === null || draft.materialRestrictions === undefined ? "nenhuma declarada" : redactSensitiveText(draft.materialRestrictions)}`,
    "Pesquise fontes reais com as ferramentas disponíveis. Cite trechos exatos e localização. Não invente fontes nem relaxe restrições.",
    "Uma proposta exige 1–3 recursos compatíveis, URLs HTTPS, trechos textuais rastreáveis com localização, Nodes em ordem com objetivos, referências consistentes aos trechos e recurso recomendado por Node. Registre separadamente scope, justificativa e limitações de cada recurso; inclua metadados relevantes e não atribua score universal Tier 1.",
    "Proponha o menor conjunto ordenado de Nodes necessário para satisfazer o Exit Proof; omita qualquer Node não essencial e não repita objetivos. Declare prerequisiteNodeIds apenas com IDs de Nodes anteriores que sejam dependências necessárias, ou [] quando não houver pré-requisito. Para cada prerequisiteNodeId, declare em prerequisiteRationales exatamente um objeto com esse ID e um rationale específico não vazio que explique a dependência. Cada critério do Exit Proof deve ter exatamente um Node contribuinte: copie-o exatamente em exitProofContributions desse Node e não permita que outro Node também o declare, mesmo se houver uma relação prerequisite entre eles. Nodes preparatórios devem declarar exitProofContributions: [] e estar num caminho de prerequisites até um Node contribuinte; não duplique neles claims de critérios. Cada contribuição deve ter um rationale específico não vazio de por que aquele Node é necessário. Relacione todos os critérios do Exit Proof a um único Node contribuinte.",
    "Não submeta Chapter vazio.",
    "O Chapter precisa ter outcome, Principle, Exit Proof com critérios observáveis, faixa de esforço e uma explicação que relacione explicitamente o prazo e as horas semanais fornecidas. Copie deadline e hoursPerWeek exatamente no objeto effort.",
    isRecuration
      ? "Use somente os requestId e domainId acima nesta resposta. A proposta ficará pendente para revisão do Player; não altera a versão atual nem sua disponibilidade."
      : "Use somente os requestId e domainId acima nesta resposta. A proposta ficará pendente para revisão do Player; não ativa o Domain.",
  ].join("\n");
}

export function renderChapterProposal(
  draft: DomainDraft,
  proposal: ChapterProposal,
  options: { currentChapterVersionId?: string } = {},
): string {
  const lines = [
    options.currentChapterVersionId === undefined
      ? `Proposta pendente para ${draft.name} — o Domain ainda não está ativo.`
      : `Nova proposta pendente para ${draft.name}; Chapter ${options.currentChapterVersionId} continua ativo até aprovação.`,
    `Outcome: ${proposal.outcome}`,
    `Principle: ${proposal.principle}`,
    "Nodes:",
  ];
  for (const node of proposal.nodes) {
    const recommended = proposal.resources.find(({ id }) => id === node.recommendedResourceId);
    lines.push(`${node.order}. ${node.id}: ${node.objective}`);
    lines.push(`   Pré-requisitos: ${node.prerequisiteNodeIds.length === 0 ? "nenhum" : node.prerequisiteNodeIds.join(", ")}`);
    for (const prerequisite of node.prerequisiteRationales ?? []) {
      lines.push(`   Motivo da dependência em ${prerequisite.prerequisiteNodeId}: ${prerequisite.rationale}`);
    }
    if (node.exitProofContributions !== undefined && node.exitProofContributions.length > 0) {
      for (const contribution of node.exitProofContributions) {
        lines.push(`   Contribuição única ao Exit Proof: ${contribution.criterion}`);
        lines.push(`   Necessidade desta contribuição: ${contribution.rationale}`);
      }
    } else if (node.exitProofContributions !== undefined) {
      const dependentNodes = proposal.nodes.filter(({ prerequisiteNodeIds }) => prerequisiteNodeIds.includes(node.id));
      lines.push(`   Papel: Node preparatório sem claim duplicado; pré-requisito estrutural para ${dependentNodes.map(({ id }) => id).join(", ")}`);
    } else {
      lines.push(`   Critério do Exit Proof atendido: ${node.exitProofCriterion ?? "Não registrado na proposta original."}`);
    }
    lines.push(`   Recurso recomendado: ${recommended?.title ?? node.recommendedResourceId} (${recommended?.url ?? "URL ausente"})`);
    for (const ref of node.evidenceRefs) {
      const resource = proposal.resources.find(({ id }) => id === ref.resourceId);
      const evidence = resource?.evidence.find(({ id }) => id === ref.evidenceId);
      lines.push(`   Trecho: “${evidence?.excerpt ?? "ausente"}” — ${resource?.title ?? ref.resourceId}, ${evidence?.locator ?? ref.evidenceId}`);
    }
  }
  lines.push(`Exit Proof: ${proposal.exitProof.description}`);
  for (const criterion of proposal.exitProof.criteria) lines.push(`- ${criterion}`);
  lines.push(`Esforço aproximado: ${proposal.effort.minimumHours}–${proposal.effort.maximumHours} horas. ${proposal.effort.feasibility}`);
  lines.push(`Relação com o prazo (${draft.deadline ?? "sem prazo"}) e disponibilidade (${draft.hoursPerWeek} h/semana): ${proposal.effort.estimateRationale}`);
  lines.push("Recursos:");
  for (const resource of proposal.resources) {
    lines.push(`- ${resource.title} — ${resource.url}`);
    lines.push(`  Scope: ${resource.scope ?? "Não registrado na proposta original."}`);
    lines.push(`  Adequação: ${resource.justification}`);
    lines.push(`  Limitações: ${resource.limitations}`);
    lines.push(`  Compatibilidade: ${resource.compatibility.preferencesConsidered} ${resource.compatibility.restrictionsConsidered}`);
    const metadata = [
      ["Autoria/Instituição", resource.author],
      ["Publicação", resource.publishedAt],
      ["Versão", resource.version],
      ["Atualização", resource.updatedAt],
      ["Idioma", resource.language],
      ["Formato", resource.format],
      ["Acesso", resource.access],
      ["Custo", resource.cost],
      ["Licença", resource.license],
    ].filter((entry): entry is [string, string] => entry[1] !== undefined);
    if (metadata.length > 0) lines.push(`  Metadados: ${metadata.map(([name, value]) => `${name}: ${value}`).join("; ")}`);
  }
  lines.push(options.currentChapterVersionId === undefined
    ? "A proposta aguarda a decisão explícita do Player; o Domain não foi ativado."
    : "A proposta aguarda a decisão explícita do Player; a versão atual permanece ativa até aprovação.");
  return lines.join("\n");
}

export function renderCurationBlocker(reason: string, isRecuration = false): string {
  return [
    `Lori não encontrou fontes compatíveis ou verificáveis para uma proposta válida: ${reason}`,
    isRecuration
      ? "A versão aprovada atual permanece ativa e nenhuma proposta nova foi salva. As preferências e restrições não serão relaxadas automaticamente."
      : "O Domain permanece em preparação e nenhuma proposta foi salva. As preferências e restrições não serão relaxadas automaticamente.",
    isRecuration
      ? "Peço sua decisão: manter a versão atual ou alterar conscientemente objetivo/restrições em outro preparo; solicite /lori-curate explicitamente para uma nova tentativa."
      : "Peço sua decisão: manter a curadoria bloqueada ou alterar conscientemente seu objetivo/restrições em outro preparo; depois, solicite /lori-curate explicitamente.",
  ].join("\n");
}
