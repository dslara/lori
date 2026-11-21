import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createStore } from "../../../store/store.ts";
import type { LoriState } from "../../../store/state.ts";
import { loadOrCreateSnapshot, writeSnapshot } from "../../../effects/persist/persist.ts";
import type { SnapshotResult } from "../../../effects/persist/types.ts";
import { showError } from "../../ui/status/status.ts";
import type { DispatchAndPersistResult, LoriActionFactory, LoriExtensionState } from "./shared.types.ts";

export async function dispatchAndPersist(
  projectDir: string,
  createAction: LoriActionFactory,
): Promise<DispatchAndPersistResult> {
  let loaded: SnapshotResult;
  try {
    loaded = await loadOrCreateSnapshot(projectDir);
  } catch {
    return { status: "snapshot-unavailable" };
  }
  if (!loaded.ok) {
    return { status: "load-failed", error: loaded.error };
  }

  const action = createAction(loaded.state);
  if (!action) {
    return { status: "unchanged", state: loaded.state };
  }

  const store = createStore(loaded.state);
  store.dispatch(action);
  const nextState = store.getState();
  if (nextState === loaded.state) {
    return { status: "unchanged", state: loaded.state };
  }

  try {
    await writeSnapshot(projectDir, nextState);
  } catch {
    return { status: "persistence-failed", state: loaded.state };
  }

  return { status: "persisted", state: nextState };
}

export function acceptDispatchResult(
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
  result: DispatchAndPersistResult,
  persistenceError: string,
): result is { status: "unchanged" | "persisted"; state: LoriState } {
  if (result.status === "unchanged" || result.status === "persisted") {
    shared.store = createStore(result.state);
    return true;
  }
  if (result.status === "load-failed") {
    shared.store = undefined;
    shared.projectDir = undefined;
    shared.skin = undefined;
    shared.startupError = result.error;
    showError(ctx, result.error);
    return false;
  }
  if (result.status === "persistence-failed") {
    shared.store = createStore(result.state);
    ctx.ui.notify(persistenceError, "error");
    return false;
  }

  ctx.ui.notify(persistenceError, "error");
  return false;
}
