import { restoreSessionAsPaused } from "../../../core/processors/lifecycle.ts";
import { createStore } from "../../../store/store.ts";
import { loadOrCreateSnapshot, writeSnapshot } from "../../../effects/persist/persist.ts";
import type { SnapshotResult } from "../../../effects/persist/types.ts";
import type { SessionInitializationResult } from "./shared.types.ts";

export async function initializeSessionState(projectDir: string): Promise<SessionInitializationResult> {
  let loaded: SnapshotResult;
  try {
    loaded = await loadOrCreateSnapshot(projectDir);
  } catch {
    return { ok: false, error: "Lori: não foi possível acessar o snapshot do projeto." };
  }
  if (!loaded.ok) {
    return loaded;
  }

  const restoreAction = restoreSessionAsPaused(loaded.state.session, Date.now());
  if (!restoreAction) {
    if (loaded.state.session?.status === "open") {
      return { ok: false, error: "Lori: a Session aberta tem timestamps inválidos." };
    }
    return { ok: true, state: loaded.state, restored: false };
  }

  const store = createStore(loaded.state);
  store.dispatch(restoreAction);
  const state = store.getState();
  if (state === loaded.state) {
    return { ok: false, error: "Lori: a Session aberta não pôde ser restaurada como pausa." };
  }

  try {
    await writeSnapshot(projectDir, state);
  } catch {
    return { ok: false, error: "Lori: Session não restaurada porque não foi possível persistir o snapshot." };
  }

  return { ok: true, state, restored: true };
}
