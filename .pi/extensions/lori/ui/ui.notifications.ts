/**
 * Lori UI notifications
 */

import type { ExtensionContext } from "@mariozechner/pi-coding-agent";

export function notifyTimerEnding(
  ctx: ExtensionContext,
  technique: string,
  remaining: number,
): void {
  ctx.ui.notify(`⏱ Timer ${technique}: ${remaining}m restantes`, "warning");
}

export function notifyTimerEnd(ctx: ExtensionContext, technique: string): void {
  ctx.ui.notify(`⏱ Timer ${technique} finalizado!`, "info");
}

export function notifyWeaknessAdded(ctx: ExtensionContext, concept: string): void {
  ctx.ui.notify(`⚠ Weakness registrada: ${concept}`, "warning");
}
