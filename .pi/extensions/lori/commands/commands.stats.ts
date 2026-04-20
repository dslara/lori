import { LoriCommand, LoriCommandRegister } from "./commands.model";
import { LoriOptions } from "../core/core.model";

export const loriCmdStats = ({
  getState,
}: LoriOptions): LoriCommandRegister => [
  LoriCommand.STATS,
  {
    description: "Mostrar estatísticas Lori.",
    handler: async (_args, ctx) => {
      const state = getState();
      const techniques = [...new Set(state.recentSessions.map((s) => s.technique))];
      const honestRate = state.recentSessions.length
        ? Math.round(
            (state.recentSessions.filter((s) => s.honest).length / state.recentSessions.length) *
              100,
          )
        : 0;
      const lines = [
        `📚 Módulos: ${state.config.activeModules.join(", ") || "nenhum"} | Progresso: ${state.planProgress}%`,
        `🔥 Streak: ${state.config.streakDays}d | Total: ${state.totalHours.toFixed(1)}h`,
        `⏱ Hoje: ${state.todayMinutes}/${state.config.dailyGoalMinutes}m | SRS: ${state.pendingSRS}`,
        `⚠ Weaknesses: ${state.config.weaknesses.length} (${state.config.weaknesses.reduce((s, w) => s + w.errors, 0)} erros)`,
        `🎯 Técnicas: ${techniques.join(", ") || "nenhuma"} | Honest: ${honestRate}%`,
      ];
      ctx.ui.notify(lines.join("\n"), "info");
    },
  },
];
