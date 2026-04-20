import { LoriCommand, LoriCommandRegister } from "./commands.model";
import { LoriOptions } from "../core/core.model";
import { appendEvent } from "../events/events.persistence";
import { rebuildState } from "../events/events.projection";
import { LoriEvents } from "../events/events.model";

import { getTodayKey, loadConfig, saveConfig } from "../core/core.config";

import { updateStatus } from "../ui/ui.status-bar";
import { updateTimerWidget } from "../ui/ui.timer-widget";

export const loriCmdEnd = ({
  pi,
  getState,
  setState,
  cycleService,
}: LoriOptions): LoriCommandRegister => [
  LoriCommand.END,
  {
    description: "Finalizar sessão de estudo Lori. Registra minutos e trigger honestidade.",
    handler: async (args, ctx) => {
      cycleService.startPostSession();
      const minutes = cycleService.getElapsedMinutes();

      const a = args.trim().split(/\s+/);
      const focus = a[0] ? Math.min(10, Math.max(0, parseInt(a[0], 10))) : 0;
      const honest = a[1] === "true" || a[1] === "1" || a[1] === "sim";
      const notes = a.slice(2).join(" ") || "";

      await appendEvent(ctx.cwd, {
        type: LoriEvents.SESSION_ENDED,
        data: { duration: minutes, focus, honest, notes, date: getTodayKey() },
      });
      pi.appendEntry("lori-event", { eventType: LoriEvents.SESSION_ENDED, duration: minutes });

      const config = await loadConfig(ctx.cwd);
      const today = getTodayKey();
      if (config.lastStudyDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (config.lastStudyDate === yesterday) {
          config.streakDays += 1;
        } else {
          config.streakDays = 1;
        }
        config.lastStudyDate = today;
        await saveConfig(ctx.cwd, config);
      }

      const newState = await rebuildState(ctx.cwd);
      setState(newState);
      updateStatus(ctx, newState);
      updateTimerWidget(ctx, newState, cycleService);

      ctx.ui.notify(`✅ Sessão finalizada. ${minutes} minutos.`, "info");

      pi.sendMessage(
        {
          customType: "lori-honesty",
          content:
            "Pós-sessão obrigatório: o que ficou confuso? Quais conceitos não estão 100% claros? Registre weaknesses via lori_log_event type=weakness_identified.",
          display: true,
        },
        { triggerTurn: true },
      );
    },
  },
];
