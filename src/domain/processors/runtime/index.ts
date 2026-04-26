// RuntimeProcessor — modifiers, combos, passives
export interface RuntimeProcessor {
  process(state: unknown, event: unknown): unknown;
}
