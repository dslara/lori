import { LoriCommand, LoriCommandRegister } from "./commands.model";
import { LoriOptions } from "../core/core.model";

export const loriCmdReview = ({
  pi,
}: LoriOptions): LoriCommandRegister => [
  LoriCommand.REVIEW,
  {
    description: "Revisar flashcards SRS devidos.",
    handler: async (_args, ctx) => {
      pi.sendMessage(
        {
          customType: "lori-srs",
          content:
            "Iniciar revisão SRS. Use lori_review_srs com action=list_due para ver cards, depois review com quality 0-5.",
          display: true,
        },
        { triggerTurn: true },
      );
    },
  },
];
