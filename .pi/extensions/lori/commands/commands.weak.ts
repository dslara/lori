import { LoriCommand, LoriCommandRegister } from "./commands.model";
import { LoriOptions } from "../core/core.model";

export const loriCmdWeak = ({
  getState,
}: LoriOptions): LoriCommandRegister => [
  LoriCommand.WEAK,
  {
    description: "Listar pontos fracos ativos com contagem.",
    handler: async (_args, ctx) => {
      const state = getState();
      if (state.config.weaknesses.length === 0) {
        ctx.ui.notify("✅ Nenhuma weakness ativa", "info");
        return;
      }
      const lines = state.config.weaknesses.map(
        (w, i) => `${i + 1}. ${w.concept} (${w.errors} erro${w.errors > 1 ? "s" : ""})`,
      );
      ctx.ui.notify(`⚠ Weaknesses:\n${lines.join("\n")}`, "warning");
    },
  },
];
