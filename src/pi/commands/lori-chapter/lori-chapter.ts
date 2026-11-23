import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, wrapTextWithAnsi } from "@earendil-works/pi-tui";
import type { ActiveDomain, ChapterVersion } from "../../../core/domain/domain.types.ts";
import { readSnapshot } from "../../../effects/persist/persist.ts";
import type { LoriExtensionState } from "../shared/shared.types.ts";
import { formatChapterSummary } from "../shared/chapter-summary.ts";
import { requireReadyState } from "../shared/session.ts";

type ChapterResource = ChapterVersion["chapter"]["resources"][number];

const RESOURCE_METADATA: Array<[keyof Pick<ChapterResource, "author" | "publishedAt" | "version" | "updatedAt" | "language" | "format" | "access" | "cost" | "license">, string]> = [
  ["author", "Autoria"],
  ["publishedAt", "Publicado"],
  ["version", "Versão"],
  ["updatedAt", "Atualizado"],
  ["language", "Idioma"],
  ["format", "Formato"],
  ["access", "Acesso"],
  ["cost", "Custo"],
  ["license", "Licença"],
];

function buildChapterReport(domain: ActiveDomain, version: ChapterVersion): string[] {
  const chapter = version.chapter;
  const resources = new Map(chapter.resources.map((resource) => [resource.id, resource]));
  const lines = [
    "RESUMO DO CHAPTER",
    ...formatChapterSummary(domain, version),
    `Aprovado em: ${version.approvedAt}`,
    "",
    "NODES · ORDEM E RELAÇÕES",
  ];

  for (const node of chapter.nodes) {
    const recommendedResource = resources.get(node.recommendedResourceId);
    lines.push(
      "",
      `Node ${node.order} · ${node.id}`,
      `Objetivo: ${node.objective}`,
      `Pré-requisitos: ${node.prerequisiteNodeIds.length === 0 ? "nenhum" : node.prerequisiteNodeIds.join(", ")}`,
    );
    for (const prerequisite of node.prerequisiteRationales ?? []) {
      lines.push(`Justificativa do pré-requisito · ${prerequisite.prerequisiteNodeId}: ${prerequisite.rationale}`);
    }
    const contributions = node.exitProofContributions ?? [];
    if (contributions.length > 0) {
      for (const contribution of contributions) {
        lines.push(
          `Contribuição ao Exit Proof: ${contribution.criterion}`,
          `Justificativa da contribuição: ${contribution.rationale}`,
        );
      }
    } else if (node.exitProofCriterion !== undefined) {
      lines.push(`Contribuição ao Exit Proof (legada): ${node.exitProofCriterion}`);
    } else if (chapter.nodes.some(({ prerequisiteNodeIds }) => prerequisiteNodeIds.includes(node.id))) {
      lines.push("Node preparatório estrutural · sem contribuição direta ao Exit Proof.");
    } else {
      lines.push("Nenhuma contribuição direta ao Exit Proof registrada.");
    }
    lines.push(
      `Recurso recomendado: ${recommendedResource?.id ?? node.recommendedResourceId} · ${recommendedResource?.title ?? "recurso indisponível"}`,
    );
    for (const ref of node.evidenceRefs) {
      const source = resources.get(ref.resourceId);
      const evidence = source?.evidence.find(({ id }) => id === ref.evidenceId);
      if (source === undefined || evidence === undefined) {
        lines.push(`Referência de evidência indisponível: ${ref.evidenceId} · ${ref.resourceId}`);
      } else {
        lines.push(`Trecho ${evidence.id}: “${evidence.excerpt}” — ${source.title} (${source.id}), ${evidence.locator}`);
      }
    }
  }

  lines.push("", "EXIT PROOF", chapter.exitProof.description);
  for (const criterion of chapter.exitProof.criteria) {
    lines.push(`• ${criterion}`);
  }

  lines.push(
    "",
    "ESFORÇO",
    `Estimativa: ${chapter.effort.minimumHours}–${chapter.effort.maximumHours} horas no total.`,
    `Disponibilidade: ${chapter.effort.hoursPerWeek} horas/semana · prazo: ${chapter.effort.deadline ?? "nenhum"}.`,
    `Justificativa da estimativa: ${chapter.effort.estimateRationale}`,
    `Viabilidade: ${chapter.effort.feasibility}`,
    "",
    "RECURSOS E EVIDÊNCIAS",
  );
  for (const resource of chapter.resources) {
    lines.push(
      "",
      `Recurso ${resource.id} · ${resource.title}`,
      `URL: ${resource.url}`,
      `Escopo: ${resource.scope ?? "não registrado"}`,
      `Justificativa: ${resource.justification}`,
      `Limitações: ${resource.limitations}`,
      `Compatibilidade · preferências consideradas: ${resource.compatibility.preferencesConsidered}`,
      `Compatibilidade · restrições consideradas: ${resource.compatibility.restrictionsConsidered}`,
      `Compatível: ${resource.compatibility.compatible ? "sim" : "não"}`,
    );
    for (const [field, label] of RESOURCE_METADATA) {
      const value = resource[field];
      if (value !== undefined) lines.push(`${label}: ${value}`);
    }
    for (const evidence of resource.evidence) {
      lines.push(`Trecho ${evidence.id}: “${evidence.excerpt}” — ${resource.title} (${resource.id}), ${evidence.locator}`);
    }
  }

  return lines;
}

function wrap(text: string, width: number): string[] {
  if (text.length === 0) return [""];
  return wrapTextWithAnsi(text, Math.max(1, width - 2))
    .map((line) => truncateToWidth(` ${line} `, width));
}

export function registerLoriChapter(api: ExtensionAPI, shared: LoriExtensionState): void {
  api.registerCommand("lori-chapter", {
    description: "Consultar o Chapter aprovado atual de um Domain ativo",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (ready === undefined) return;
      if (args.trim().length > 0) {
        ctx.ui.notify("Uso: /lori-chapter (sem argumentos; escolha um Domain ativo)", "warning");
        return;
      }
      if (ctx.mode !== "tui") {
        ctx.ui.notify("/lori-chapter requer o modo TUI interativo.", "error");
        return;
      }

      const loaded = await readSnapshot(ready.projectDir);
      if (!loaded.ok) {
        ctx.ui.notify(loaded.error, "error");
        return;
      }
      const domains = loaded.state.domains.filter(({ status }) => status === "active");
      if (domains.length === 0) {
        ctx.ui.notify("Nenhum Domain ativo; use /lori-init para preparar e aprovar um Domain.", "info");
        return;
      }

      const options = domains.map(({ id, name, learningObjective }) => `${name} — ${learningObjective} [${id}]`);
      const selection = await ctx.ui.select("Escolher Domain ativo", options);
      const domain = domains[options.indexOf(selection ?? "")];
      if (domain === undefined) return;
      const version = domain.chapters.find(({ id }) => id === domain.currentChapterVersionId);
      if (version === undefined) {
        ctx.ui.notify("Lori: o Domain ativo não tem um Chapter aprovado atual disponível.", "error");
        return;
      }
      const approvedVersion = version;

      await ctx.ui.custom<void>((tui, theme, keybindings, done) => {
        let scrollTop = 0;
        let visibleRows = 1;
        let documentLineCount = 0;
        let cachedWidth: number | undefined;
        let cachedHeight: number | undefined;
        let cachedLines: string[] | undefined;
        const report = buildChapterReport(domain, approvedVersion);

        function render(width: number): string[] {
          const terminalRows = Math.max(1, tui.terminal.rows);
          if (cachedLines !== undefined && cachedWidth === width && cachedHeight === terminalRows) {
            return cachedLines;
          }
          const maxHeight = Math.max(1, Math.min(Math.floor(terminalRows * 0.9), terminalRows - 2));
          const header = [
            ...wrap(theme.fg("accent", `LORI · ${domain.name} · Chapter ${approvedVersion.version}`), width),
            ...wrap(theme.fg("muted", `Chapter aprovado · ${approvedVersion.id}`), width),
          ];
          const help = wrap(theme.fg("dim", "↑/↓ rolar · PgUp/PgDn página · Esc fechar"), width);
          const rule = wrap(theme.fg("borderMuted", "─".repeat(Math.max(1, width - 2))), width);
          const documentLines = report.flatMap((line) => wrap(line, width));
          documentLineCount = documentLines.length;
          const fixedRows = header.length + help.length + rule.length * 2 + 1;
          visibleRows = Math.max(1, maxHeight - fixedRows);
          const maxScrollTop = Math.max(0, documentLines.length - visibleRows);
          scrollTop = Math.max(0, Math.min(scrollTop, maxScrollTop));
          const content = documentLines.slice(scrollTop, scrollTop + visibleRows);
          const indicator = [truncateToWidth(
            theme.fg("dim", `Linhas ${scrollTop + 1}–${Math.min(documentLines.length, scrollTop + visibleRows)}/${documentLines.length}`),
            width,
          )];
          cachedWidth = width;
          cachedHeight = terminalRows;
          cachedLines = [...header, ...rule, ...indicator, ...content, ...rule, ...help].slice(0, maxHeight);
          return cachedLines;
        }

        function refresh(): void {
          cachedLines = undefined;
          tui.requestRender();
        }

        function handleInput(data: string): void {
          if (keybindings.matches(data, "tui.select.up") || keybindings.matches(data, "tui.altScreen.lineUp")) {
            scrollTop = Math.max(0, scrollTop - 1);
            refresh();
          } else if (keybindings.matches(data, "tui.select.down") || keybindings.matches(data, "tui.altScreen.lineDown")) {
            scrollTop = Math.min(documentLineCount, scrollTop + 1);
            refresh();
          } else if (keybindings.matches(data, "tui.select.pageUp") || keybindings.matches(data, "tui.altScreen.pageUp")) {
            scrollTop = Math.max(0, scrollTop - Math.max(1, visibleRows - 1));
            refresh();
          } else if (keybindings.matches(data, "tui.select.pageDown") || keybindings.matches(data, "tui.altScreen.pageDown")) {
            scrollTop = Math.min(documentLineCount, scrollTop + Math.max(1, visibleRows - 1));
            refresh();
          } else if (keybindings.matches(data, "tui.select.cancel")) {
            done();
          }
        }

        refresh();
        return { capturesViewportInput: true, render, handleInput, invalidate: refresh };
      }, {
        overlay: true,
        overlayOptions: { anchor: "center", width: "94%", maxHeight: "90%", margin: 1 },
        blocked: { kind: "question", message: "Consulte o Chapter aprovado atual" },
      });
    },
  });
}
