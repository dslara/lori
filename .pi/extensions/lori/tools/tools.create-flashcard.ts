import { LoriOptions } from "../core/core.model";
import { LoriTool } from "./tools.model";
import { Type } from "@sinclair/typebox";
import { createFlashcard } from "../srs/srs.algorithm";
import { addFlashcard } from "../srs/srs.persistence";

export const loriToolCreateFlashcard = ({ pi, getState, setState }: LoriOptions) => {
  return pi.registerTool({
    name: LoriTool.CREATE_FLASHCARD,
    label: "Lori Flashcard",
    description: "Create a new SRS flashcard for a module.",
    promptSnippet: "Create spaced repetition flashcards",
    parameters: Type.Object({
      module: Type.String(),
      front: Type.String(),
      back: Type.String(),
    }),
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const card = createFlashcard(params.module, params.front, params.back);
      await addFlashcard(ctx.cwd, params.module, card);
      const state = getState();
      const existing = state.flashcards.get(params.module) ?? [];
      existing.push(card);
      state.flashcards.set(params.module, existing);
      setState(state);
      return {
        content: [{ type: "text", text: `Flashcard criado: ${card.id}` }],
        details: { card },
      };
    },
  });
};
