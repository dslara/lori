import type { LoriState } from "../../state.ts";

export type SnapshotResult =
  | { ok: true; state: LoriState }
  | { ok: false; error: string };
