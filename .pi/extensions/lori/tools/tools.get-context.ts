import { LoriOptions } from "../core/core.model";
import { LoriTool } from "./tools.model";
import { Type } from "@sinclair/typebox";
import { getDueCards } from "../srs/srs.algorithm";

export const loriToolGetContext = ({ pi, getState }: LoriOptions) => {
  return pi.registerTool({
    name: LoriTool.GET_CONTEXT,
    label: "Lori Context",
    description:
      "Get current Lori learning context: active modules, weaknesses, due SRS cards, today's progress, and active timer.",
    promptSnippet: "Retrieve Lori learning context and state",
    parameters: Type.Object({}),
    async execute(_id, _params, _signal, _onUpdate, _ctx) {
      const state = getState();
      const due = Array.from(state.flashcards.values()).flatMap((cards) => getDueCards(cards));
      const summary = {
        activeModules: state.config.activeModules,
        weaknesses: state.config.weaknesses,
        streakDays: state.config.streakDays,
        todayMinutes: state.todayMinutes,
        dailyGoalMinutes: state.config.dailyGoalMinutes,
        dueCards: due.length,
        activeTimer: state.activeTimer
          ? {
              technique: state.activeTimer.technique,
              module: state.activeTimer.module,
              remainingMinutes: Math.max(
                0,
                state.activeTimer.durationMinutes -
                  Math.floor((Date.now() - state.activeTimer.startedAt) / 60000),
              ),
            }
          : null,
      };
      return {
        content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
        details: summary,
      };
    },
  });
};
