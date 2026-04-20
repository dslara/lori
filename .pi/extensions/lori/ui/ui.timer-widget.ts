/**
 * Lori timer widget
 */

import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { LoriState } from "../modules/modules.model";
import { CycleService } from "../cycle/cycle.service";

const DRILL_TIPS: Record<string, string> = {
  "lori-drill": "Nível: detectar → isolar → repetir",
  "lori-feynman": "Dica: explique em voz alta como para criança de 5 anos",
  "lori-retrieval": "Dica: feche os olhos e recite de memória antes de verificar",
  "lori-pomodoro": "Dica: se interrompido, anote e volte em 2min",
  "lori-directness": "Dica: construa algo real agora, não leia mais teoria",
};

export function updateTimerWidget(ctx: ExtensionContext, state: LoriState, cycleService: CycleService): void {
  if (!state.activeTimer) {
    ctx.ui.setWidget("lori-timer", undefined);
    return;
  }

  const elapsed = Math.floor((Date.now() - state.activeTimer.startedAt) / 60000);
  const remaining = Math.max(0, state.activeTimer.durationMinutes - elapsed);
  const pct = Math.max(0, 100 - (elapsed / state.activeTimer.durationMinutes) * 100);
  const tip = DRILL_TIPS[state.activeTimer.technique] ?? "";
  const cycle = cycleService.getCycle();
  const objectiveLine = cycle.objective ? `🎯 ${cycle.objective}` : "";
  const drillLevel = state.drillLevels.get(state.activeTimer.module) ?? 1;
  const drillLine =
    state.activeTimer.technique === "lori-drill" ? `🔧 Drill Nível ${drillLevel}` : "";

  ctx.ui.setWidget(
    "lori-timer",
    [
      `⏱️ ${state.activeTimer.technique} | ${remaining}m restantes | ${state.activeTimer.module}`,
      objectiveLine,
      `${"█".repeat(Math.floor(pct / 5))}${"░".repeat(20 - Math.floor(pct / 5))}`,
      drillLine,
      tip,
    ].filter(Boolean),
  );
}
