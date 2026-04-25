import type { StudySession, PlayerProfile } from "../core/types";
import type { XPPort } from "../core/ports";

const XP_PER_SESSION = 100;

export function calculateXP(): { totalXP: number } {
  return { totalXP: XP_PER_SESSION };
}

export function formatXPBreakdown(totalXP: number): string {
  return `${totalXP} XP`;
}

export interface RecordSessionResult {
  totalXP: number;
  newTotalXP: number;
}

export async function recordSession(
  xpPort: XPPort,
  domainId: string
): Promise<RecordSessionResult> {
  const profile = await xpPort.loadProfile();
  const xp = calculateXP();

  const session: StudySession = {
    id: generateId(),
    domainId,
    xpEarned: xp.totalXP,
  };

  const newProfile: PlayerProfile = {
    ...profile,
    totalXP: profile.totalXP + xp.totalXP,
    lastDomainId: domainId,
    domains: {
      ...profile.domains,
      [domainId]: (profile.domains[domainId] || 0) + xp.totalXP,
    },
    sessionHistory: [...profile.sessionHistory, session],
  };

  await xpPort.saveProfile(newProfile);

  return { totalXP: xp.totalXP, newTotalXP: newProfile.totalXP };
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}
