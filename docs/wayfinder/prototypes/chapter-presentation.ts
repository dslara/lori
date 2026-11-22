import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, wrapTextWithAnsi } from "@earendil-works/pi-tui";

type Stage = "proposal" | "approved" | "verdict" | "offer";
type OfferChoice = "pending" | "accepted" | "deferred";
type PrototypeColor = "accent" | "muted" | "text" | "warning" | "success" | "borderMuted";

const chapter = {
  domain: "APIs com TypeScript",
  learningObjective: "Desenvolver e testar APIs HTTP com TypeScript.",
  outcome: "Construir uma pequena API REST em TypeScript e explicar as decisões principais.",
  principle: "Directness",
  exitProof: {
    description: "Entregar uma API executável e demonstrar suas rotas e validação.",
    criteria: [
      "A rota cria e devolve um registro válido.",
      "Entradas inválidas retornam erros previsíveis.",
      "Um teste automatizado demonstra o fluxo válido e um caso de falha.",
    ],
  },
  effort: {
    minimumHours: 6,
    maximumHours: 8,
    hoursPerWeek: 3,
    deadline: "em três semanas",
    estimateRationale: "A faixa considera três horas semanais durante três semanas, com margem para implementar e revisar o artefato.",
    feasibility: "Viável como primeiro Chapter, sem promessa de conclusão em um prazo exato.",
  },
  nodes: [
    {
      id: "n1",
      order: 1,
      objective: "Criar uma rota que recebe e devolve um registro em memória.",
      prerequisites: [],
      prerequisiteRationales: [],
      exitProofCriterion: "A rota cria e devolve um registro válido.",
      exitProofRationale: "A rota demonstra a primeira capacidade executável exigida pelo artefato.",
      recommendedResourceId: "r1",
      evidenceRef: { resourceId: "r1", evidenceId: "e1" },
    },
    {
      id: "n2",
      order: 2,
      objective: "Validar o payload e responder com erro previsível para entradas inválidas.",
      prerequisites: ["n1"],
      prerequisiteRationales: [{ prerequisiteNodeId: "n1", rationale: "A validação depende do formato de entrada definido pela rota." }],
      exitProofCriterion: "Entradas inválidas retornam erros previsíveis.",
      exitProofRationale: "A validação demonstra o comportamento de erro exigido pelo artefato.",
      recommendedResourceId: "r2",
      evidenceRef: { resourceId: "r2", evidenceId: "e2" },
    },
    {
      id: "n3",
      order: 3,
      objective: "Escrever testes para um caso válido e um caso de falha.",
      prerequisites: ["n2"],
      prerequisiteRationales: [{ prerequisiteNodeId: "n2", rationale: "Os testes exercitam a rota e o comportamento de validação já definidos." }],
      exitProofCriterion: "Um teste automatizado demonstra o fluxo válido e um caso de falha.",
      exitProofRationale: "O teste torna verificáveis as duas respostas exigidas pelo Exit Proof.",
      recommendedResourceId: "r3",
      evidenceRef: { resourceId: "r3", evidenceId: "e3" },
    },
  ],
  resources: [
    {
      id: "r1",
      title: "Guia de rotas · exemplo fictício",
      url: "https://example.invalid/routes",
      scope: "Demonstra uma rota e o ciclo request/response. Não cobre persistência.",
      fit: "Conecta a primeira prática ao artefato pedido no Learning Objective.",
      limitations: "Material ilustrativo. A URL não é uma fonte real.",
      compatibility: {
        preferencesConsidered: "Formato textual; nenhuma preferência adicional neste exemplo.",
        restrictionsConsidered: "Sem restrição de custo ou idioma neste exemplo.",
        compatible: true,
      },
      evidence: [{ id: "e1", excerpt: "Uma rota recebe uma request e produz uma response.", locator: "Seção ilustrativa · Rotas" }],
    },
    {
      id: "r2",
      title: "Validação de dados · exemplo fictício",
      url: "https://example.invalid/validation",
      scope: "Ilustra validação de payload e retorno de erros. Não cobre autenticação.",
      fit: "Apresenta o comportamento que o segundo Node precisa implementar.",
      limitations: "Material ilustrativo, sem API ou conteúdo verificável.",
      compatibility: {
        preferencesConsidered: "Formato textual; nenhuma preferência adicional neste exemplo.",
        restrictionsConsidered: "Sem restrição de custo ou idioma neste exemplo.",
        compatible: true,
      },
      evidence: [{ id: "e2", excerpt: "Valide a entrada antes de executar a operação.", locator: "Seção ilustrativa · Validação" }],
    },
    {
      id: "r3",
      title: "Testes de endpoint · exemplo fictício",
      url: "https://example.invalid/testing",
      scope: "Ilustra testes de integração para uma rota. Não cobre testes de carga.",
      fit: "Demonstra o fluxo válido e um caso de falha do terceiro Node.",
      limitations: "Material ilustrativo, sem API ou conteúdo verificável.",
      compatibility: {
        preferencesConsidered: "Formato textual; nenhuma preferência adicional neste exemplo.",
        restrictionsConsidered: "Sem restrição de custo ou idioma neste exemplo.",
        compatible: true,
      },
      evidence: [{ id: "e3", excerpt: "Verifique o status e o corpo da response no teste.", locator: "Seção ilustrativa · Testes" }],
    },
  ],
} as const;

const stageLabels: Record<Stage, string> = {
  proposal: "Proposta pendente",
  approved: "Domain ativo · Verdict pendente",
  verdict: "Verdict fechado",
  offer: "Oferta do primeiro estudo",
};

function findResource(resourceId: string) {
  return chapter.resources.find(({ id }) => id === resourceId) ?? chapter.resources[0];
}

function buildProposal(theme: { fg(color: PrototypeColor, text: string): string }): string[] {
  const lines: string[] = [];
  const add = (text: string, color?: PrototypeColor): void => {
    lines.push(color === undefined ? text : theme.fg(color, text));
  };
  const section = (title: string): void => {
    lines.push("");
    add(title.toUpperCase(), "accent");
  };

  add("CHAPTER SUMMARY", "accent");
  add(`Learning Objective: ${chapter.learningObjective}`);
  add(`Chapter outcome: ${chapter.outcome}`);
  add(`Principle: ${chapter.principle} · Chapter 01`);

  section("Nodes · ordem e relações");
  for (const node of chapter.nodes) {
    const resource = findResource(node.recommendedResourceId);
    const evidence = resource.evidence.find(({ id }) => id === node.evidenceRef.evidenceId) ?? resource.evidence[0];
    add(`Node ${node.order} · ${node.id}`, "accent");
    add(`Objective: ${node.objective}`);
    add(`Pré-requisitos: ${node.prerequisites.length === 0 ? "nenhum" : node.prerequisites.join(", ")}`);
    for (const prerequisite of node.prerequisiteRationales) {
      add(`Racional do pré-requisito ${prerequisite.prerequisiteNodeId}: ${prerequisite.rationale}`);
    }
    add(`Contribuição ao Exit Proof: ${node.exitProofCriterion}`);
    add(`Necessidade da contribuição: ${node.exitProofRationale}`);
    add(`Recurso recomendado: ${resource.id} · ${resource.title}`);
    add(`Evidence ${evidence.id}: “${evidence.excerpt}” · ${resource.title}, ${evidence.locator}`);
    lines.push("");
  }

  section("Exit Proof");
  add(chapter.exitProof.description);
  for (const criterion of chapter.exitProof.criteria) {
    add(`• ${criterion}`);
  }

  section("Esforço");
  add(`Estimativa: ${chapter.effort.minimumHours}–${chapter.effort.maximumHours} horas no total.`);
  add(`Disponibilidade: ${chapter.effort.hoursPerWeek} h/semana · prazo: ${chapter.effort.deadline}.`);
  add(`Racional: ${chapter.effort.estimateRationale}`);
  add(`Viabilidade: ${chapter.effort.feasibility}`);

  section("Recursos · fontes fictícias");
  for (const resource of chapter.resources) {
    add(`${resource.id} · ${resource.title}`, "accent");
    add(`URL: ${resource.url}`);
    add(`Scope: ${resource.scope}`);
    add(`Adequação: ${resource.fit}`);
    add(`Limitações: ${resource.limitations}`);
    add(`Preferências consideradas: ${resource.compatibility.preferencesConsidered}`);
    add(`Restrições consideradas: ${resource.compatibility.restrictionsConsidered}`);
    add(`Compatível: ${resource.compatibility.compatible ? "sim" : "não"}`);
    lines.push("");
  }

  return lines;
}

export default function registerChapterPresentationPrototype(pi: ExtensionAPI): void {
  pi.registerCommand("lori-chapter-prototype", {
    description: "Abrir a proposta completa do Chapter no terminal",
    handler: async (_args, ctx) => {
      if (ctx.mode !== "tui") {
        ctx.ui.notify("/lori-chapter-prototype requer o modo TUI interativo.", "error");
        return;
      }

      await ctx.ui.custom<void>((tui, theme, keybindings, done) => {
        let stage: Stage = "proposal";
        let confirmingApproval = false;
        let offerChoice: OfferChoice = "pending";
        let statusMessage = "";
        let scrollTop = 0;
        let visibleRows = 1;
        let documentLineCount = 0;
        let cachedWidth: number | undefined;
        let cachedHeight: number | undefined;
        let cachedLines: string[] | undefined;
        const report = buildProposal(theme);

        function wrap(text: string, width: number): string[] {
          if (text.length === 0) {
            return [""];
          }
          const innerWidth = Math.max(1, width - 2);
          return wrapTextWithAnsi(text, innerWidth).map((line) => truncateToWidth(` ${line} `, width));
        }

        function actionLines(width: number): string[] {
          const lines: string[] = [];
          const add = (text: string, color?: PrototypeColor): void => {
            lines.push(...wrap(color === undefined ? text : theme.fg(color, text), width));
          };
          add("NEXT STEP", "accent");
          if (stage === "proposal" && confirmingApproval) {
            add("Aprovar ativa o Domain. A Metalearning Session continua aberta para o Verdict; nenhuma XP agora.");
            add("Enter confirma · Esc cancela a aprovação", "warning");
          } else if (stage === "proposal") {
            add("Revise a proposta. O Domain continua inativo até a aprovação explícita.");
            add("Enter revisar/aprovar · N manter pendente", "warning");
          } else if (stage === "approved") {
            add("Domain ativo. Informe Focus e Honesty para fechar a Metalearning Session.");
            add("Exemplo ilustrativo: Focus 4 · Honesty 5. XP não muda.");
            add("Enter simular o fechamento do Verdict", "warning");
          } else if (stage === "verdict") {
            add("Verdict fechado e ligado ao Chapter aprovado. Nenhuma XP foi lançada.");
            add("Enter ver a oferta do primeiro estudo", "warning");
          } else {
            const firstNode = chapter.nodes[0];
            const firstResource = findResource(firstNode.recommendedResourceId);
            add(`First Node: ${firstNode.id} · ${firstNode.objective}`);
            add(`Resource: ${firstResource.title} · ${firstResource.url}`);
            if (offerChoice === "pending") {
              add("Próximo passo: aceitar a oferta e escolher uma Primary Technique.");
              add("Enter aceitar · N agora não", "warning");
            } else if (offerChoice === "accepted") {
              add("Oferta aceita. No fluxo real, a próxima ação é escolher uma Primary Technique.");
              add("Nenhuma Study Session foi iniciada neste protótipo.");
            } else {
              add("Oferta adiada. O Verdict segue fechado; nenhuma Study Session foi iniciada.");
            }
          }
          if (statusMessage.length > 0) {
            add(statusMessage, "success");
          }
          return lines;
        }

        function controls(width: number): string[] {
          const help = confirmingApproval
            ? "↑/↓ rolar · PgUp/PgDn pular · Enter confirmar · Esc voltar"
            : "↑/↓ rolar · PgUp/PgDn pular · Enter ação · N manter/adiar · Esc sair";
          return wrap(theme.fg("dim", help), width);
        }

        function render(width: number): string[] {
          const terminalRows = Math.max(1, tui.terminal.rows);
          if (cachedLines !== undefined && cachedWidth === width && cachedHeight === terminalRows) {
            return cachedLines;
          }

          const maxOverlayHeight = Math.max(1, Math.min(Math.floor(terminalRows * 0.9), terminalRows - 2));
          const header = [
            ...wrap(theme.fg("accent", `LORI · Domain ${chapter.domain} · Chapter 01`), width),
            ...wrap(theme.fg("muted", `${stageLabels[stage]} · dados e fontes fictícios`), width),
          ];
          const actions = actionLines(width);
          const help = controls(width);
          const rule = wrap(theme.fg("borderMuted", "─".repeat(Math.max(1, width - 2))), width);
          const documentLines = report.flatMap((line) => wrap(line, width));
          documentLineCount = documentLines.length;
          const fixedRows = header.length + actions.length + help.length + rule.length * 2 + 1;
          visibleRows = Math.max(1, maxOverlayHeight - fixedRows);
          const maxScrollTop = Math.max(0, documentLines.length - visibleRows);
          scrollTop = Math.max(0, Math.min(scrollTop, maxScrollTop));
          const content = documentLines.slice(scrollTop, scrollTop + visibleRows);
          const indicator = [truncateToWidth(
            theme.fg("dim", `Linhas ${scrollTop + 1}–${Math.min(documentLines.length, scrollTop + visibleRows)}/${documentLines.length}`),
            width,
          )];

          cachedWidth = width;
          cachedHeight = terminalRows;
          cachedLines = [
            ...header,
            ...rule,
            ...indicator,
            ...content,
            ...rule,
            ...actions,
            ...help,
          ].slice(0, maxOverlayHeight);
          return cachedLines;
        }

        function refresh(): void {
          cachedLines = undefined;
          tui.requestRender();
        }

        function handleInput(data: string): void {
          if (
            keybindings.matches(data, "tui.select.up") ||
            keybindings.matches(data, "tui.altScreen.lineUp")
          ) {
            scrollTop = Math.max(0, scrollTop - 1);
            refresh();
            return;
          }
          if (
            keybindings.matches(data, "tui.select.down") ||
            keybindings.matches(data, "tui.altScreen.lineDown")
          ) {
            scrollTop = Math.min(documentLineCount, scrollTop + 1);
            refresh();
            return;
          }
          if (
            keybindings.matches(data, "tui.select.pageUp") ||
            keybindings.matches(data, "tui.altScreen.pageUp")
          ) {
            scrollTop = Math.max(0, scrollTop - Math.max(1, visibleRows - 1));
            refresh();
            return;
          }
          if (
            keybindings.matches(data, "tui.select.pageDown") ||
            keybindings.matches(data, "tui.altScreen.pageDown")
          ) {
            scrollTop = Math.min(documentLineCount, scrollTop + Math.max(1, visibleRows - 1));
            refresh();
            return;
          }
          if (data.toLowerCase() === "n") {
            if (stage === "offer" && offerChoice === "pending") {
              offerChoice = "deferred";
              statusMessage = "Oferta adiada. Nenhuma Study Session foi iniciada.";
            } else if (stage === "proposal") {
              confirmingApproval = false;
              statusMessage = "Proposta mantida pendente. O Domain continua inativo.";
            } else {
              return;
            }
            refresh();
            return;
          }
          if (keybindings.matches(data, "tui.select.confirm")) {
            statusMessage = "";
            if (stage === "proposal") {
              if (confirmingApproval) {
                confirmingApproval = false;
                stage = "approved";
                statusMessage = "Aprovação simulada. O Domain está ativo; a Session aguarda Verdict.";
              } else {
                confirmingApproval = true;
              }
            } else if (stage === "approved") {
              stage = "verdict";
              statusMessage = "Verdict fechado com valores ilustrativos. Nenhuma XP foi lançada.";
            } else if (stage === "verdict") {
              stage = "offer";
              offerChoice = "pending";
            } else if (offerChoice === "pending") {
              offerChoice = "accepted";
              statusMessage = "Oferta aceita. Escolha a Primary Technique no fluxo real.";
            }
            refresh();
            return;
          }
          if (keybindings.matches(data, "tui.select.cancel")) {
            if (confirmingApproval) {
              confirmingApproval = false;
              statusMessage = "A proposta continua pendente; nada foi ativado.";
              refresh();
            } else {
              done();
            }
          }
        }

        const screen = {
          capturesViewportInput: true,
          render,
          handleInput,
          invalidate() {
            cachedLines = undefined;
          },
        };
        refresh();
        return screen;
      }, {
        overlay: true,
        overlayOptions: { anchor: "center", width: "94%", maxHeight: "90%", margin: 1 },
        blocked: { kind: "question", message: "Revise a proposta completa do Chapter" },
      });
    },
  });
}
