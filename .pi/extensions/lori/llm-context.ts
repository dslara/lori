import type { ActiveSession, PlayerProfile } from "./core/types";
import type { SessionPort, XPPort } from "./core/ports";
import * as SessionClock from "./core/session-clock";

export function buildContextString(
  session: ActiveSession | null,
  profile: Pick<PlayerProfile, "streak" | "activeSkin">
): string | null {
  if (!session) return null;
  const remaining = SessionClock.remainingSec(session, session.plannedDurationSec);
  return `[Lori] Domain: ${session.domainId} | Remaining: ${SessionClock.formatRemaining(remaining)} | Streak: ${profile.streak} days | Skin: ${profile.activeSkin}`;
}

export async function handleBeforeAgentStart(
  sessionPort: SessionPort,
  xpPort: XPPort,
  systemPrompt: string
): Promise<string | undefined> {
  const raw = await sessionPort.load();
  if (!raw || SessionClock.isStale(raw)) return undefined;
  const profile = await xpPort.loadProfile();
  const context = buildContextString(raw, { streak: profile.streak, activeSkin: profile.activeSkin });
  if (!context) return undefined;
  return `${systemPrompt}\n${context}`;
}
