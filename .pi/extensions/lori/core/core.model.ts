import { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { LoriState } from "../modules/modules.model";
import { CycleService } from "../cycle/cycle.service";

export type LoriOptions = {
  pi: ExtensionAPI,
  getState: () => LoriState,
  setState: (s: LoriState) => void,
  cycleService: CycleService,
};
