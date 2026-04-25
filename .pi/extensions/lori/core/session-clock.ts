import type { ActiveSession } from "./types";

export function elapsedSec(session: ActiveSession, now = Date.now()): number {
  return Math.floor((now - new Date(session.startedAt).getTime()) / 1000);
}

export function remainingSec(
  session: ActiveSession,
  plannedDurationSec: number,
  now = Date.now()
): number {
  return plannedDurationSec - elapsedSec(session, now);
}

export function isStale(
  session: ActiveSession,
  thresholdMin = 30,
  now = Date.now()
): boolean {
  return elapsedSec(session, now) > thresholdMin * 60;
}

export function formatRemaining(sec: number): string {
  const sign = sec < 0 ? "-" : "";
  const abs = Math.abs(sec);
  const m = Math.floor(abs / 60).toString().padStart(2, "0");
  const s = (abs % 60).toString().padStart(2, "0");
  return `${sign}${m}:${s}`;
}
