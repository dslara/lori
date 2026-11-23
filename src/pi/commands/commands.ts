import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { LoriExtensionState } from "./shared/shared.types.ts";
import { registerLoriAbandon } from "./lori-abandon/lori-abandon.ts";
import { registerLoriApprove } from "./lori-approve/lori-approve.ts";
import { registerLoriClose } from "./lori-close/lori-close.ts";
import { registerLoriCurate } from "./lori-curate/lori-curate.ts";
import { registerLoriChapter } from "./lori-chapter/lori-chapter.ts";
import { registerLoriDelete } from "./lori-delete/lori-delete.ts";
import { registerLoriInit } from "./lori-init/lori-init.ts";
import { registerLoriResume } from "./lori-resume/lori-resume.ts";
import { registerLoriStart } from "./lori-start/lori-start.ts";
import { registerLoriStatus } from "./lori-status/lori-status.ts";

export { initializeSessionState } from "./shared/session-state.ts";

export function registerLoriCommands(api: ExtensionAPI, shared: LoriExtensionState): void {
  registerLoriCurate(api, shared);
  registerLoriChapter(api, shared);
  registerLoriApprove(api, shared);
  registerLoriInit(api, shared);
  registerLoriDelete(api, shared);
  registerLoriStatus(api, shared);
  registerLoriStart(api, shared);
  registerLoriClose(api, shared);
  registerLoriAbandon(api, shared);
  registerLoriResume(api, shared);
}
