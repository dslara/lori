import type { LoriAction } from "../../core/actions.ts";
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

export type LoriActionFactory = (state: LoriState) => LoriAction | undefined;

export type LoriExtensionState = {
  store: LoriStore | undefined;
  projectDir: string | undefined;
  skin: SkinProvider | undefined;
  startupError: string | undefined;
  curationRequest: { requestId: string; domainId: string } | undefined;
};

export type StartInput = {
  domain?: string;
  primaryTechnique?: string;
};

export type ResolvedStartInput = Required<StartInput>;
