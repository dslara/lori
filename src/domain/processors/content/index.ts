// ContentProcessor — quests, cards, achievements, story unlock
export interface ContentProcessor {
  process(state: unknown, event: unknown): unknown;
}
