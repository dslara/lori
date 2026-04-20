import { LoriOptions } from "../core/core.model";
import { loriToolLogEvent } from "./tools.log-event";
import { loriToolGetContext } from "./tools.get-context";
import { loriToolReviewSrs } from "./tools.review-srs";
import { loriToolSearchConcepts } from "./tools.search-concepts";
import { loriToolAddResource } from "./tools.add-resource";
import { loriToolCreateFlashcard } from "./tools.create-flashcard";


export function registerTools(options: LoriOptions) {
  loriToolLogEvent(options);
  loriToolGetContext(options);
  loriToolReviewSrs(options);
  loriToolSearchConcepts(options);
  loriToolAddResource(options);
  loriToolCreateFlashcard(options);
}
