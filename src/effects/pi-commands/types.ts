import type { SessionAction } from "../../core/session/types.ts";
import type { SkinProvider } from "../../presentation/skin/provider.ts";
import type { LoriState } from "../../store/state.ts";
import type { LoriStore } from "../../store/store.ts";

export type DispatchAndPersistResult =
  | { status: "unchanged" | "persisted"; state: LoriState }
  | { status: "load-failed"; error: string }
  | { status: "persistence-failed"; state: LoriState }
  | { status: "snapshot-unavailable" };

export type SessionInitializationResult =
  | { ok: true; state: LoriState; restored: boolean }
  | { ok: false; error: string };

export type SessionActionFactory = (state: LoriState) => SessionAction | undefined;

export type LoriExtensionState = {
  store: LoriStore | undefined;
  projectDir: string | undefined;
  skin: SkinProvider | undefined;
  startupError: string | undefined;
};

export type StartInput = {
  domain?: string;
  primaryTechnique?: string;
};

export type ResolvedStartInput = Required<StartInput>;
