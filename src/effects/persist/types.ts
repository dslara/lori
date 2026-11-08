import type { LoriState } from "../../store/state.ts";

export type SnapshotResult =
  | { ok: true; state: LoriState }
  | { ok: false; error: string };
