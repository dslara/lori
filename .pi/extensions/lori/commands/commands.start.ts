import { LoriCommand, LoriCommandRegister } from "./commands.model";
import type { LoriState } from "../modules/modules.model";
import { rebuildState } from "../events/events.projection";
import { getTodayKey } from "../core/core.config";

import { appendEvent } from "../events/events.persistence";
import { LoriEvents } from "../events/events.model";
import { suggestRitual, getRitual } from "../core/core.rituals";
import { LoriOptions } from "../core/core.model";

export const loriCmdStart = ({
  pi,
  getState,
  setState,
  cycleService,
}: LoriOptions): LoriCommandRegister => [
  LoriCommand.START,
  {
    description: "Iniciar sessão de estudo Lori. Uso: /lori-start [modulo] [tecnica]",
    handler: async (args, ctx) => {
      const parts = args.trim().split(/\s+/);
      const moduleArg = parts[0];
      const techniqueArg = parts[1];
      const objective = parts.slice(2).join(" ") || "";
      const module = moduleArg || "geral";
      let state: LoriState;

      try {
        state = getState();
      } catch {
        state = await rebuildState(ctx.cwd);
        setState(state);
      }

      const ritual = techniqueArg ? getRitual(techniqueArg) : undefined;
      const technique = ritual
        ? techniqueArg
        : suggestRitual(state.config.weaknesses) || "lori-feynman";

      cycleService.startPreSession(module, technique, objective);

      await appendEvent(ctx.cwd, {
        type: LoriEvents.SESSION_STARTED,
        data: { module, technique, objective, date: getTodayKey() },
      });

      pi.appendEntry("lori-event", { eventType: LoriEvents.SESSION_STARTED, module, technique });

      ctx.ui.notify(
        `🎯 Sessão Lori iniciada: ${module} | ${technique}${ritual ? "" : " (sugerido)"}`,
        "info",
      );

      // Inject context message for the LLM
      pi.sendMessage(
        {
          customType: "lori-session",
          content: `
            Sessão Lori iniciada: modulo=${module}, tecnica=${technique}. Ciclo: pre-session → in-session → post-session.
            Ritual sugerido:
            1. Pre: /skill:lori-pomodoro (foco)
            2. Core: /skill:lori-${technique}
            3. Warm-down: /skill:lori-retrieval (quiz rápido 5min)
            4. Post: honestidade forçada — "o que ficou confuso?"
          `,
          display: false,
        },
        { triggerTurn: false },
      );
    },
  },
];
