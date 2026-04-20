export const LoriTool = {
  LOG_EVENT: 'lori_log_event',
  GET_CONTEXT: 'lori_get_context',
  REVIEW_SRS: 'lori_review_srs',
  SEARCH_CONCEPTS: 'lori_search_concepts',
  ADD_RESOURCE: 'lori_add_resource',
  CREATE_FLASHCARD: 'lori_create_flashcard',
} as const;

export type LoriToolType = (typeof LoriTool)[keyof typeof LoriTool];
