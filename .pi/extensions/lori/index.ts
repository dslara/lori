/**
 * Lori Extension — Learning acceleration system
 * Entry point. Registra tools, commands, listeners.
 *
 * Architecture:
 *   events/        — Persistência append-only e projeção de estado
 *   modules/       — Modelos e I/O de módulos
 *   core/          — Config, snapshot, rituais, listeners
 *   cycle/         — Máquina de estados da sessão
 *   context/       — Injeção de contexto via before_agent_start
 *   srs/           — Algoritmo SM-2 para SRS
 *   ui/            — Status bar, widgets, notificações
 *   tools/         — Custom tools registrados no Pi
 *   commands/      — Commands /lori-*
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { LoriState } from "./modules/modules.model";
import { CycleService } from "./cycle/cycle.service";
import { registerTools } from "./tools/tools";
import { registerCommands } from "./commands/commands";
import { updateStatus } from "./ui/ui.status-bar";
import { updateTimerWidget } from "./ui/ui.timer-widget";
import { notifyTimerEnd } from "./ui/ui.notifications";
import { appendEvent } from "./events/events.persistence";
import { LoriEvents } from "./events/events.model";
import { registerLoriListeners } from "./core/core.listeners";

export default function (pi: ExtensionAPI) {
  let state: LoriState | null = null;
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  const cycleService = new CycleService();

  const getState = () => {
    if (!state) throw new Error("Lori state not loaded");
    return state;
  };

  const setState = (s: LoriState) => {
    state = s;
  };

  const getStateRef = () => state;
  const setStateRef = (s: LoriState | null) => {
    state = s;
  };

  function startPeriodicTimer(ctx: ExtensionContext) {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!state) return;
      if (state.activeTimer) {
        const elapsed = Math.floor((Date.now() - state.activeTimer.startedAt) / 60000);
        const remaining = state.activeTimer.durationMinutes - elapsed;
        if (remaining <= 0) {
          notifyTimerEnd(ctx, state.activeTimer.technique);
          appendEvent(ctx.cwd, { type: LoriEvents.TIMER_ENDED, data: { auto: true } }).catch(() => {});
          pi.appendEntry("lori-event", { eventType: LoriEvents.TIMER_ENDED, auto: true });
          state.activeTimer = undefined;
          updateTimerWidget(ctx, state, cycleService);
        } else if (remaining === 5) {
          // notifyTimerEnding is handled by turn_end listener
          updateTimerWidget(ctx, state, cycleService);
        } else {
          updateTimerWidget(ctx, state, cycleService);
        }
      }
      updateStatus(ctx, state);
    }, 30000);
  }

  function stopPeriodicTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  registerLoriListeners({
    pi,
    getState,
    setState,
    getStateRef,
    setStateRef,
    cycleService,
    startPeriodicTimer,
    stopPeriodicTimer,
  });

  registerTools({ pi, getState, setState, cycleService });
  registerCommands({ pi, getState, setState, cycleService });
}
