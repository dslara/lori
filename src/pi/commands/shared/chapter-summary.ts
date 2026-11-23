import type { ActiveDomain, ChapterVersion } from "../../../core/domain/domain.types.ts";

export function formatChapterSummary(domain: ActiveDomain, version: ChapterVersion): string[] {
  return [
    `Domain: ${domain.name} [${domain.id}]`,
    `Objetivo de aprendizagem: ${domain.learningObjective}`,
    `Versão do Chapter: ${version.version} · ${version.id}`,
    `Outcome: ${version.chapter.outcome}`,
    `Principle: ${version.chapter.principle}`,
    `Nodes em ordem: ${version.chapter.nodes.map(({ id, objective }) => `${id} — ${objective}`).join(" → ")}`,
  ];
}
