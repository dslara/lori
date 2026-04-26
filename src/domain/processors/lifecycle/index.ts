// LifecycleProcessor — timer state, streak, abandon
export interface LifecycleProcessor {
  process(state: unknown, event: unknown): unknown;
}
