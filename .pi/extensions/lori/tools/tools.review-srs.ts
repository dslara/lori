import { LoriOptions } from "../core/core.model";
import { LoriTool } from "./tools.model";
import { Type } from "@sinclair/typebox";
import { StringEnum } from "@mariozechner/pi-ai";
import { calculateNextReview, getDueCards } from "../srs/srs.algorithm";
import { loadFlashcards, saveFlashcards } from "../srs/srs.persistence";

export const loriToolReviewSrs = ({ pi, getState, setState }: LoriOptions) => {
  return pi.registerTool({
    name: LoriTool.REVIEW_SRS,
    label: "Lori SRS",
    description:
      "Review due flashcards using SM-2. Returns due cards for a module or all modules. Provide quality (0-5) to update scheduling.",
    promptSnippet: "Review spaced repetition flashcards",
    parameters: Type.Object({
      module: Type.Optional(Type.String({ description: "Module name, or omit for all" })),
      action: StringEnum(["list_due", "review"] as const),
      cardId: Type.Optional(Type.String()),
      quality: Type.Optional(Type.Number({ description: "0-5 rating" })),
    }),
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const state = getState();
      if (params.action === "list_due") {
        const modules = params.module ? [params.module] : state.config.activeModules;
        const due: { module: string; id: string; front: string }[] = [];
        for (const mod of modules) {
          const cards = state.flashcards.get(mod) ?? (await loadFlashcards(ctx.cwd, mod));
          for (const c of getDueCards(cards)) {
            due.push({ module: mod, id: c.id, front: c.front });
          }
        }
        return {
          content: [
            {
              type: "text",
              text: due.length ? JSON.stringify(due, null, 2) : "Nenhum card devido.",
            },
          ],
          details: { due },
        };
      }

      if (params.action === "review" && params.cardId && params.quality !== undefined) {
        const modules = params.module ? [params.module] : state.config.activeModules;
        for (const mod of modules) {
          const cards = state.flashcards.get(mod) ?? (await loadFlashcards(ctx.cwd, mod));
          const idx = cards.findIndex((c) => c.id === params.cardId);
          if (idx >= 0) {
            cards[idx] = calculateNextReview(cards[idx], params.quality);
            await saveFlashcards(ctx.cwd, mod, cards);
            state.flashcards.set(mod, cards);
            setState(state);
            return {
              content: [
                {
                  type: "text",
                  text: `Card ${params.cardId} atualizado. Próxima revisão em ${cards[idx].interval} dia(s).`,
                },
              ],
              details: { card: cards[idx] },
            };
          }
        }
        return {
          content: [{ type: "text", text: `Card ${params.cardId} não encontrado.` }],
          details: { error: "not_found" },
        };
      }

      return {
        content: [{ type: "text", text: "Ação inválida ou parâmetros faltando." }],
        details: { error: "invalid_params" },
      };
    },
  });
};
