import type { LoriAction } from "../../../core/shared/actions.types.ts";
import type { ChapterCurationRuntime } from "../lori-curate/lori-curate.types.ts";
import type { SkinProvider } from "../../../presentation/skin/provider.ts";
import type { LoriState } from "../../../store/state.ts";
import type { LoriStore } from "../../../store/store.ts";

export type DispatchAndPersistResult =
  | { status: "unchanged" | "persisted"; state: LoriState }
  | { status: "load-failed"; error: string }
  | { status: "persistence-failed"; state: LoriState }
  | { status: "snapshot-unavailable" };

export type SessionInitializationResult =
  | { ok: true; state: LoriState; restored: boolean }
  | { ok: false; error: string };

export type LoriActionFactory = (state: LoriState) => LoriAction | undefined;

export type LoriExtensionState = {
  store: LoriStore | undefined;
  projectDir: string | undefined;
  skin: SkinProvider | undefined;
  startupError: string | undefined;
  curationRuntime: ChapterCurationRuntime;
};

export type ReadyState = {
  store: LoriStore;
  projectDir: string;
  skin: SkinProvider;
};

export type DomainDraftQuestionPrompt = {
  title: string;
  guidance?: string;
};

