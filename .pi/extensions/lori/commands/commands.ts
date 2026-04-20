import { LoriOptions } from "../core/core.model";
import { loriCmdStart } from "./commands.start";
import { loriCmdEnd } from "./commands.end";
import { loriCmdTimer } from "./commands.timer";
import { loriCmdPlan } from "./commands.plan";
import { loriCmdRetro } from "./commands.retro";
import { loriCmdStats } from "./commands.stats";
import { loriCmdReview } from "./commands.review";
import { loriCmdRituals } from "./commands.rituals";
import { loriCmdWeak } from "./commands.weak";
import { loriCmdResources } from "./commands.resources";

export function registerCommands(options: LoriOptions) {
  const { pi } = options;
  pi.registerCommand(...loriCmdStart(options));
  pi.registerCommand(...loriCmdEnd(options));
  pi.registerCommand(...loriCmdTimer(options));
  pi.registerCommand(...loriCmdPlan(options));
  pi.registerCommand(...loriCmdRetro(options));
  pi.registerCommand(...loriCmdStats(options));
  pi.registerCommand(...loriCmdReview(options));
  pi.registerCommand(...loriCmdRituals(options));
  pi.registerCommand(...loriCmdWeak(options));
  pi.registerCommand(...loriCmdResources(options));
}
