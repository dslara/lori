import { LoriOptions } from "../core/core.model";
import { LoriTool } from "./tools.model";
import { Type } from "@sinclair/typebox";
import { StringEnum } from "@mariozechner/pi-ai";
import { appendEvent } from "../events/events.persistence";
import { notifyWeaknessAdded } from "../ui/ui.notifications";
import { LoriEvents } from "../events/events.model";

export const loriToolLogEvent = ({ pi }: LoriOptions) => {
  return pi.registerTool({
    name: LoriTool.LOG_EVENT,
    label: "Lori Log",
    description:
      "Log a Lori event to the append-only state journal. Types: plan_created, session_started, session_ended, timer_started, timer_ended, concept_learned, drill_completed, feynman_done, weakness_identified, weakness_added, weakness_resolved, resource_curated, resource_added, retro_done, streak_broken, module_completed.",
    promptSnippet: "Log learning events to the Lori journal",
    parameters: Type.Object({
      type: StringEnum(Object.values(LoriEvents) as [string, ...string[]]),
      data: Type.Optional(Type.Record(Type.String(), Type.Any())),
    }),
    async execute(_id, params, _signal, _onUpdate, ctx) {
      await appendEvent(ctx.cwd, { type: params.type, data: params.data ?? {} });
      if (params.type === LoriEvents.WEAKNESS_ADDED || params.type === LoriEvents.WEAKNESS_IDENTIFIED) {
        const concept = (params.data?.concept as string) || "";
        if (concept) notifyWeaknessAdded(ctx, concept);
      }
      return {
        content: [{ type: "text", text: `Logged: ${params.type}` }],
        details: { type: params.type },
      };
    },
  });
};
