/**
 * Lori context injection
 * Builds and injects lori-context via before_agent_start
 */

import type { LoriState } from "./memory.js";
import { getDueCards } from "./sm2.js";

// Keywords that trigger Lori context injection
export const STUDY_KEYWORDS = [
  "estudar", "estudo", "aprender", "aprendizagem", "curso", "módulo",
  "flashcard", "srs", "pomodoro", "feynman", "drill", "revisar",
  "conceito", "exercício", "prova", "benchmark", "weakness",
  "revisão", "retrospectiva", "timer",
];

// Keywords that detect user is stuck
export const STUCK_KEYWORDS = [
  "travei", "travado", "não consigo", "não entendo", "não sei",
  "bloqueado", "perdido", "desisti", "desisto", "impossível",
];

export function isStudyContext(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return STUDY_KEYWORDS.some((k) => lower.includes(k));
}

export function isStuckContext(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return STUCK_KEYWORDS.some((k) => lower.includes(k));
}

export function buildContextMessage(state: LoriState): string {
  const due = Array.from(state.flashcards.values()).flatMap((c) => getDueCards(c));

  // Limit context size to avoid token inflation
  const topWeaknesses = state.config.weaknesses
    .slice()
    .sort((a, b) => b.errors - a.errors)
    .slice(0, 5);
  const weaknessLine = topWeaknesses.length
    ? topWeaknesses.map((w) => `${w.concept} (${w.errors} erro${w.errors > 1 ? "s" : ""})`).join("; ")
    : "nenhuma";
  const weaknessMore = state.config.weaknesses.length > 5 ? ` (+${state.config.weaknesses.length - 5} mais)` : "";

  const recentSessions = state.recentSessions.slice(0, 3);
  const last = recentSessions[0];
  const lastTopic = last?.topic ? `🎯 ${last.topic} | ` : "";
  const lastLine = last
    ? `Última sessão: ${last.module} | ${last.technique} | ${lastTopic}${last.duration}min | foco=${last.focus ?? "?"}/10 | honest=${last.honest ?? "?"}`
    : "Nenhuma sessão recente.";

  const nextSRS = due.length > 0
    ? `Próxima revisão SRS: ${due.length} cards devidos hoje`
    : "SRS: nada devido hoje";

  const resourcesLine = state.recentResources.length
    ? `Recursos recentes: ${state.recentResources.slice(0, 3).join("; ")}`
    : "";

  const weekLine = state.moduleWeekTotal && state.moduleWeekTotal > 0
    ? `Semana: W${state.weekNumber} | ${state.activeModule}: Semana ${Math.min((state.modules.get(state.activeModule)?.retros.length ?? 0) + 1, state.moduleWeekTotal)} de ${state.moduleWeekTotal}`
    : `Semana: W${state.weekNumber}`;

  const focusLine = state.currentWeekFocus
    ? `Foco de hoje: ${state.currentWeekFocus}`
    : `Foco de hoje: ${state.activeModule || "não definido"}`;

  const lines = [
    `[LORI CONTEXT]`,
    weekLine,
    `Total: ${state.totalHours.toFixed(1)}h`,
    `Módulos ativos: ${state.config.activeModules.join(", ") || "nenhum"}`,
    focusLine,
    `Weaknesses: ${weaknessLine}${weaknessMore}`,
    nextSRS,
    `Streak: ${state.config.streakDays} dias | Hoje: ${state.todayMinutes}/${state.config.dailyGoalMinutes}m`,
    lastLine,
    resourcesLine,
    state.activeTimer
      ? `Timer ativo: ${state.activeTimer.technique} (${state.activeTimer.module})`
      : "",
    `---`,
  ];
  return lines.filter(Boolean).join("\n");
}

export function buildStuckMessage(): string {
  return `🧠 Detectei bloqueio. Protocolo Lori:
1. Pare imediatamente. Anote em 1 frase onde travou.
2. Timer de 15min no modo difuso (caminhada, chuveiro, café sem tela).
3. Use /skill:lori-stuck para 5 perguntas socráticas.
4. Se não desbloquear em 30min, mude de técnica (ex: drill → feynman).`;
}
