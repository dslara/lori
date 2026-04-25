import type { ActiveSession, PlayerProfile } from "./core/types";
import type { SessionPort, XPPort } from "./core/ports";

function formatRemaining(sec: number): string {
  const sign = sec < 0 ? "-" : "";
  const abs = Math.abs(sec);
  const m = Math.floor(abs / 60).toString().padStart(2, "0");
  const s = (abs % 60).toString().padStart(2, "0");
  return `${sign}${m}:${s}`;
}

export function buildContextString(
  session: ActiveSession | null,
  profile: Pick<PlayerProfile, "streak" | "activeSkin">
): string | null {
  if (!session) return null;
  const elapsedSec = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
  const remaining = session.plannedDurationSec - elapsedSec;
  return `[Lori] Domain: ${session.domainId} | Remaining: ${formatRemaining(remaining)} | Streak: ${profile.streak} days | Skin: ${profile.activeSkin}`;
}

export async function handleBeforeAgentStart(
  sessionPort: SessionPort,
  xpPort: XPPort,
  systemPrompt: string
): Promise<string | undefined> {
  const session = await sessionPort.getActive();
  if (!session) return undefined;
  const profile = await xpPort.loadProfile();
  const context = buildContextString(session, { streak: profile.streak, activeSkin: profile.activeSkin });
  if (!context) return undefined;
  return `${systemPrompt}\n${context}`;
}
