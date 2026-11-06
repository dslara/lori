import { selectElapsedMs } from "./core/session/selectors.ts";
import type { Session } from "./core/session/types.ts";

export type LoriState = {
  player: {
    totalXp: number;
  };
  session: Session | null;
  skinConfig: {
    skin: "minimal";
  };
};

export function createInitialState(): LoriState {
  return {
    player: { totalXp: 0 },
    session: null,
    skinConfig: { skin: "minimal" },
  };
}

function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export function formatStatus(state: LoriState, now = Date.now()): string {
  const sessionStatus = state.session === null
    ? "Session: nenhuma ativa"
    : [
        "Session: open",
        `Domain: ${state.session.domain}`,
        `Primary Technique: ${state.session.primaryTechnique}`,
        `Elapsed: ${formatElapsed(selectElapsedMs(state.session, now))}`,
      ].join(" · ");
  return `Lori · ${sessionStatus} · XP: ${state.player.totalXp} · Skin Minimal`;
}
