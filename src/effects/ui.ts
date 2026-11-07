import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { selectElapsedMs } from "../core/session/selectors.ts";
import type { SkinProvider } from "../presentation/skin/provider.ts";
import type { LoriState } from "../state.ts";

export type SessionDisplayEvent =
  | "session.open"
  | "session.paused"
  | "session.resumed"
  | "session.restored";

const STATUS_KEY = "lori";

function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export function renderStatus(
  state: LoriState,
  skin: SkinProvider,
  now = Date.now(),
  event?: SessionDisplayEvent,
): string {
  const { session } = state;
  if (session === null) {
    return skin.render("status.idle", { totalXp: state.player.totalXp });
  }

  const elapsed = formatElapsed(selectElapsedMs(session, now));
  if (session.status === "closed") {
    return skin.render("session.closed", {
      domain: session.domain,
      technique: session.primaryTechnique,
      elapsed,
      focus: session.verdict.focus,
      honesty: session.verdict.honesty,
    });
  }

  const sessionEvent = event ?? (session.status === "open" ? "session.open" : "session.paused");
  return skin.render(sessionEvent, {
    domain: session.domain,
    technique: session.primaryTechnique,
    elapsed,
  });
}

export function showStatus(
  ctx: Pick<ExtensionContext, "ui">,
  state: LoriState,
  skin: SkinProvider,
  event?: SessionDisplayEvent,
): string {
  const status = renderStatus(state, skin, Date.now(), event);
  ctx.ui.setStatus(STATUS_KEY, status);
  return status;
}

export function showError(ctx: Pick<ExtensionContext, "ui">, error: string): void {
  ctx.ui.setStatus(STATUS_KEY, "Lori: erro no snapshot");
  ctx.ui.notify(error, "error");
}
