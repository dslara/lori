/**
 * Lori UI components
 * - Status bar: [módulo] [streak] [SRS] [weaknesses]
 * - Timer widget
 * - Notifications
 */

import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { LoriState } from "./memory.js";
import { getDueCards } from "./sm2.js";
import { getCycle } from "./cycle.js";

export function updateStatus(ctx: ExtensionContext, state: LoriState): void {
  const theme = ctx.ui.theme;
  const parts: string[] = [];

  if (state.activeTimer) {
    const elapsed = Math.floor((Date.now() - state.activeTimer.startedAt) / 60000);
    const remaining = Math.max(0, state.activeTimer.durationMinutes - elapsed);
    parts.push(theme.fg("accent", `⏱ ${remaining}m`));
    parts.push(theme.fg("muted", state.activeTimer.technique));
  }

  if (state.config.activeModules.length > 0) {
    parts.push(theme.fg("accent", `📚 ${state.config.activeModules.join(",")}`));
  }

  parts.push(theme.fg("muted", `W${state.weekNumber}`));

  if (state.config.streakDays > 0) {
    parts.push(theme.fg("success", `🔥 ${state.config.streakDays}`));
  }

  const due = Array.from(state.flashcards.values()).flatMap(cards => getDueCards(cards));
  if (due.length > 0) {
    parts.push(theme.fg("warning", `⏳${due.length}`));
  }

  if (state.config.weaknesses.length > 0) {
    const totalErrors = state.config.weaknesses.reduce((sum, w) => sum + w.errors, 0);
    parts.push(theme.fg("error", `⚡${state.config.weaknesses.length}(${totalErrors})`));
  }

  parts.push(theme.fg("dim", `${state.todayMinutes}/${state.config.dailyGoalMinutes}m`));
  parts.push(theme.fg("dim", `${state.totalHours.toFixed(0)}h`));

  ctx.ui.setStatus("lori", parts.join(" "));
}

const DRILL_TIPS: Record<string, string> = {
  "lori-drill": "Nível: detectar → isolar → repetir",
  "lori-feynman": "Dica: explique em voz alta como para criança de 5 anos",
  "lori-retrieval": "Dica: feche os olhos e recite de memória antes de verificar",
  "lori-pomodoro": "Dica: se interrompido, anote e volte em 2min",
  "lori-directness": "Dica: construa algo real agora, não leia mais teoria",
};

export function updateTimerWidget(ctx: ExtensionContext, state: LoriState): void {
  if (!state.activeTimer) {
    ctx.ui.setWidget("lori-timer", undefined);
    return;
  }

  const elapsed = Math.floor((Date.now() - state.activeTimer.startedAt) / 60000);
  const remaining = Math.max(0, state.activeTimer.durationMinutes - elapsed);
  const pct = Math.max(0, 100 - (elapsed / state.activeTimer.durationMinutes) * 100);
  const tip = DRILL_TIPS[state.activeTimer.technique] ?? "";
  const cycle = getCycle();
  const objectiveLine = cycle.objective ? `🎯 ${cycle.objective}` : "";
  const drillLevel = state.drillLevels.get(state.activeTimer.module) ?? 1;
  const drillLine = state.activeTimer.technique === "lori-drill"
    ? `🔧 Drill Nível ${drillLevel}`
    : "";

  ctx.ui.setWidget("lori-timer", [
    `⏱️ ${state.activeTimer.technique} | ${remaining}m restantes | ${state.activeTimer.module}`,
    objectiveLine,
    `${"█".repeat(Math.floor(pct / 5))}${"░".repeat(20 - Math.floor(pct / 5))}`,
    drillLine,
    tip,
  ].filter(Boolean));
}

export function notifyTimerEnding(ctx: ExtensionContext, technique: string, remaining: number): void {
  ctx.ui.notify(`⏱ Timer ${technique}: ${remaining}m restantes`, "warning");
}

export function notifyTimerEnd(ctx: ExtensionContext, technique: string): void {
  ctx.ui.notify(`⏱ Timer ${technique} finalizado!`, "info");
}

export function notifyWeaknessAdded(ctx: ExtensionContext, concept: string): void {
  ctx.ui.notify(`⚠ Weakness registrada: ${concept}`, "warning");
}
