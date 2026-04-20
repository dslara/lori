import { LoriCommand, LoriCommandRegister } from "./commands.model";
import { listRituals, RITUALS } from "../core/core.rituals";
import { LoriOptions } from "../core/core.model";

export const loriCmdRituals = ({
  pi,
}: LoriOptions): LoriCommandRegister => [
  LoriCommand.RITUALS,
  {
    description: "Listar rituais Lori disponíveis por fase.",
    handler: async (_args, ctx) => {
      const rituals = listRituals();
      const keys = Object.keys(RITUALS);
      const byPhase: Record<string, Array<{ key: string; name: string; description: string; durationMinutes: number; needsTimer: boolean }>> = { pre: [], core: [], post: [] };
      for (let i = 0; i < rituals.length; i++) {
        byPhase[rituals[i].phase].push({ key: keys[i], ...rituals[i] });
      }

      const lines: string[] = [];
      for (const phase of ["pre", "core", "post"] as const) {
        if (byPhase[phase].length === 0) continue;
        lines.push(`\n[${phase.toUpperCase()}]`);
        for (const r of byPhase[phase]) {
          const timerBadge = r.needsTimer ? "⏱ " : "";
          lines.push(`  ${timerBadge}${r.name} — /skill:${r.key} (${r.durationMinutes}min)`);
          lines.push(`    ${r.description}`);
        }
      }

      ctx.ui.notify(`🧭 Rituais Lori:${lines.join("\n")}`, "info");
    },
  },
];
