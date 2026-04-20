import { LoriCommand, LoriCommandRegister } from "./commands.model";
import { LoriOptions } from "../core/core.model";
import { appendEvent } from "../events/events.persistence";
import { LoriEvents } from "../events/events.model";
import { readModuleFile, writeModuleFile } from "../modules/modules.io";
import { getWeekKey } from "../core/core.config";

export const loriCmdRetro = ({
  pi,
  getState,
}: LoriOptions): LoriCommandRegister => [
  LoriCommand.RETRO,
  {
    description: "Iniciar retrospectiva semanal Lori.",
    handler: async (_args, ctx) => {
      const week = getWeekKey();
      const state = getState();

      for (const mod of state.config.activeModules) {
        const modState = state.modules.get(mod);
        const nextWeekNum = (modState?.weeks.length ?? 0) + 1;
        const nextWeekFile = `week-${String(nextWeekNum).padStart(2, "0")}.md`;
        const existingNextWeek = await readModuleFile(ctx.cwd, mod, nextWeekFile);
        if (!existingNextWeek) {
          const weekTemplate = `# Semana ${nextWeekNum} — ${mod}\n\n## Objetivo desta semana\n\n## Conceitos\n- [ ]\n\n## Fatos\n- [ ]\n\n## Procedimentos\n- [ ]\n\n## Benchmark\n\n## Notas\n`;
          await writeModuleFile(ctx.cwd, mod, nextWeekFile, weekTemplate);
        }

        const retroContent = [
          `# Retrospectiva ${week} — ${mod}`,
          ``,
          `## 📊 Métricas`,
          `- Horas totais: ${state.totalHours.toFixed(1)}h`,
          `- Sessões recentes: ${state.recentSessions.filter((s) => s.module === mod).length}`,
          `- Weaknesses ativas: ${state.config.weaknesses.length}`,
          `- SRS pendentes: ${state.pendingSRS}`,
          ``,
          `## 🏆 Wins`,
          `- [ ] O que funcionou?`,
          `- [ ] Maior insight?`,
          ``,
          `## 🩹 Losses`,
          `- [ ] O que não funcionou?`,
          `- [ ] Weaknesses persistentes?`,
          ``,
          `## 🔧 Ajustes para próxima semana`,
          `1. `,
          `2. `,
          `3. `,
          ``,
          `## 🎯 Foco próxima semana`,
          `- Técnica principal: `,
          `- Meta de horas: `,
        ].join("\n");
        await writeModuleFile(ctx.cwd, mod, `retro-${week}.md`, retroContent);
      }

      await appendEvent(ctx.cwd, {
        type: LoriEvents.RETRO_DONE,
        data: { week, wins: [], losses: [], adjustments: [] },
      });
      pi.appendEntry("lori-event", { eventType: LoriEvents.RETRO_DONE, week });
      ctx.ui.notify(`📊 Retrospectiva ${week} iniciada. Artefatos criados.`, "info");

      pi.sendMessage(
        {
          customType: "lori-retro",
          content: `Retrospectiva semanal Lori (${week}):
1. O que funcionou?
2. O que não funcionou?
3. Quais weaknesses persistem?
4. Ajustes para próxima semana?
Use /skill:lori-retro para ritual completo.`,
          display: true,
        },
        { triggerTurn: true },
      );
    },
  },
];
