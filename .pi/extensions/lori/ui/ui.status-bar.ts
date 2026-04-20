/**
 * Lori UI components
 * - Status bar: [módulo] [streak] [SRS] [weaknesses]
 */

import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { LoriState } from "../modules/modules.model";
import { getDueCards } from "../srs/srs.algorithm";

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
