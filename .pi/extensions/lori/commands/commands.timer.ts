import { LoriCommand, LoriCommandRegister } from "./commands.model";
import { LoriOptions } from "../core/core.model";
import { appendEvent } from "../events/events.persistence";
import { rebuildState } from "../events/events.projection";
import { LoriEvents } from "../events/events.model";

import { updateStatus } from "../ui/ui.status-bar";
import { updateTimerWidget } from "../ui/ui.timer-widget";

export const loriCmdTimer = ({
  pi,
  getState,
  setState,
  cycleService,
}: LoriOptions): LoriCommandRegister => [
  LoriCommand.TIMER,
  {
    description: "Gerenciar timer Pomodoro Lori. Uso: /lori-timer [start|stop|status] [minutos]",
    handler: async (args, ctx) => {
      const [action, minsArg] = args.trim().split(/\s+/);
      const state = getState();

      if (action === "start" || action === undefined) {
        const minutes = parseInt(minsArg || `${state.config.pomodoroWork}`, 10);
        const module = state.config.activeModules[0] || "geral";
        cycleService.startTimer(minutes);
        cycleService.startInSession();
        await appendEvent(ctx.cwd, {
          type: LoriEvents.TIMER_STARTED,
          data: { module, technique: "pomodoro", durationMinutes: minutes },
        });
        pi.appendEntry("lori-event", { eventType: LoriEvents.TIMER_STARTED, module, durationMinutes: minutes });
        const newState = await rebuildState(ctx.cwd);
        setState(newState);
        updateStatus(ctx, newState);
        updateTimerWidget(ctx, newState, cycleService);
        ctx.ui.notify(`⏱ Timer ${minutes}min iniciado`, "info");
      } else if (action === "stop") {
        cycleService.stopTimer();
        await appendEvent(ctx.cwd, { type: LoriEvents.TIMER_ENDED, data: {} });
        pi.appendEntry("lori-event", { eventType: LoriEvents.TIMER_ENDED });
        const newState = await rebuildState(ctx.cwd);
        setState(newState);
        updateStatus(ctx, newState);
        updateTimerWidget(ctx, newState, cycleService);
        ctx.ui.notify("⏱ Timer parado", "info");
      } else if (action === "status") {
        if (state.activeTimer) {
          const elapsed = Math.floor((Date.now() - state.activeTimer.startedAt) / 60000);
          const remaining = Math.max(0, state.activeTimer.durationMinutes - elapsed);
          ctx.ui.notify(`⏱ ${remaining}m restantes`, "info");
        } else {
          ctx.ui.notify("Nenhum timer ativo", "warning");
        }
      }
    },
  },
];
