// GhostProcessor — match + fingerprint
export interface GhostProcessor {
  process(state: unknown, event: unknown): unknown;
}
