import { Type } from "typebox";
import type { DomainDraft } from "../../core/domain/types.ts";
import type { ChapterProposal } from "../../core/domain/chapter.ts";

const nonEmptyString = (description: string) => Type.String({ minLength: 1, description });

const evidenceSchema = Type.Object({
  id: nonEmptyString("Stable evidence ID, referenced by Nodes."),
  excerpt: nonEmptyString("Exact source excerpt that supports a Node objective."),
  locator: nonEmptyString("Page, section, timestamp, or other location of the excerpt."),
}, { additionalProperties: false });

const resourceSchema = Type.Object({
  id: nonEmptyString("Stable resource ID, referenced by Nodes."),
  title: nonEmptyString("Resource title."),
  url: Type.String({ format: "uri", description: "Verifiable HTTPS source URL." }),
  justification: nonEmptyString("Why this resource fits the objective and Player context."),
  limitations: nonEmptyString("Known scope, access, or quality limitations."),
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

export type ChapterCurationToolResult = {
  requestId: string;
  domainId: string;
  result:
    | { status: "proposal"; proposal: ChapterProposal }
    | { status: "blocked"; reason: string };
};

export function buildChapterCurationPrompt(requestId: string, draft: DomainDraft): string {
  return [
    "Solicitação explícita /lori-curate para propor o primeiro Chapter do Domain. Use apenas o provider e as ferramentas disponíveis nesta sessão Pi para pesquisar; não invente fontes e não relaxe preferências ou restrições.",
    `requestId: ${requestId}`,
    `domainId: ${draft.id}`,
    `Domain: ${draft.name}`,
    `Learning Objective: ${draft.learningObjective}`,
    `Motivação: ${draft.motivation}`,
    `Prazo: ${draft.deadline ?? "sem prazo"}`,
    `Horas por semana: ${draft.hoursPerWeek}`,
    `Baseline: ${draft.baseline}`,
    `Preferências: ${draft.preferences ?? "nenhuma declarada"}`,
    `Restrições: ${draft.materialRestrictions ?? "nenhuma declarada"}`,
    "Pesquise fontes reais com as ferramentas disponíveis. Considere uma fonte verificável somente se uma ferramenta desta sessão permitiu inspecionar o conteúdo; cite trechos exatos e localização. Se não puder acessar o conteúdo, use status blocked. Retorne a proposta somente por lori_submit_chapter; nunca use texto livre como substituto do tool.",
    "Uma proposta exige 1–3 recursos compatíveis, URLs HTTPS, trechos textuais rastreáveis com localização, Nodes em ordem com objetivos, referências consistentes aos trechos e recurso recomendado por Node. Inclua limitações e metadados relevantes; não atribua score universal Tier 1.",
    "Se não encontrar recurso verificável e compatível com todas as restrições, use result.status=blocked com a razão. Não submeta Chapter vazio, não invente fonte e não proponha relaxar as restrições.",
    "O Chapter precisa ter outcome, Principle, Exit Proof com critérios observáveis, faixa de esforço e uma explicação que relacione explicitamente o prazo e as horas semanais fornecidas. Copie deadline e hoursPerWeek exatamente no objeto effort.",
    "Use somente os requestId e domainId acima nesta resposta. A proposta ficará pendente para revisão do Player; não ativa o Domain.",
    "Se o tool rejeitar a estrutura ou as referências, explique o impedimento ao Player e não relaxe as restrições.",
  ].join("\n");
}

export function renderChapterProposal(draft: DomainDraft, proposal: ChapterProposal): string {
  const lines = [
    `Proposta pendente para ${draft.name} — o Domain ainda não está ativo.`,
    `Outcome: ${proposal.outcome}`,
    `Principle: ${proposal.principle}`,
    "Nodes:",
  ];
  for (const node of proposal.nodes) {
    const recommended = proposal.resources.find(({ id }) => id === node.recommendedResourceId);
    lines.push(`${node.order}. ${node.id}: ${node.objective}`);
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
  lines.push("A proposta aguarda a decisão explícita do Player; o Domain não foi ativado.");
  return lines.join("\n");
}

export function renderCurationBlocker(reason: string): string {
  return [
    `Lori não encontrou fontes compatíveis ou verificáveis para uma proposta válida: ${reason}`,
    "O Domain permanece em preparação e nenhuma proposta foi salva. As preferências e restrições não serão relaxadas automaticamente.",
    "Peço sua decisão: manter a curadoria bloqueada ou alterar conscientemente seu objetivo/restrições em outro preparo; depois, solicite /lori-curate explicitamente.",
  ].join("\n");
}
