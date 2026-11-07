import type { LoriState } from "../../state.ts";

export type SnapshotResult =
  | { ok: true; state: LoriState }
  | { ok: false; error: string };

export type SnapshotTransaction = {
  loadOrCreate(): Promise<SnapshotResult>;
  write(state: LoriState): Promise<void>;
};
