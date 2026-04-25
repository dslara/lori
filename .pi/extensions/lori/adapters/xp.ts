import type { StudySession, PlayerProfile } from "../core/types";
import type { XPPort } from "../core/ports";

export interface XPCalculationInput {
  elapsedMinutes: number;
  plannedMinutes: number;
  streak: number;
}

export interface XPCalculationResult {
  totalXP: number;
  baseXP: number;
  completionBonus: number;
  streakBonus: number;
}

export function calculateXP(input: XPCalculationInput): XPCalculationResult {
  const baseXP = input.elapsedMinutes * 10;
  const completionBonus = input.elapsedMinutes >= input.plannedMinutes ? 25 : 0;
  const subtotal = baseXP + completionBonus;
  const multiplier = Math.min(input.streak * 0.1, 0.5);
  const totalXP = Math.round(subtotal * (1 + multiplier));
  const streakBonus = totalXP - subtotal;

  return { totalXP, baseXP, completionBonus, streakBonus };
}

export interface StreakUpdateInput {
  currentStreak: number;
  lastCompletedDate: string | null;
  today: string;
}

export function updateStreak(input: StreakUpdateInput): number {
  if (!input.lastCompletedDate) return 0;

  const last = new Date(input.lastCompletedDate + "T00:00:00Z");
  const today = new Date(input.today + "T00:00:00Z");
  const diffMs = today.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return input.currentStreak + 1;
  if (diffDays === 0) return input.currentStreak;
  return 0;
}

export interface RecordSessionResult {
  totalXP: number;
  baseXP: number;
  completionBonus: number;
  streakBonus: number;
  newStreak: number;
}

export function formatXPBreakdown(xp: XPCalculationResult, streak: number): string {
  const parts = [`${xp.totalXP} XP total`, `${xp.baseXP} base`, `+${xp.completionBonus} completion`];
  if (xp.streakBonus > 0) {
    parts.push(`+${xp.streakBonus} streak`);
  }
  return `${parts.join(" | ")} 🔥 streak ${streak}`;
}

export async function recordSession(
  xpPort: XPPort,
  session: StudySession,
  today: string
): Promise<RecordSessionResult> {
  const profile = await xpPort.loadProfile();

  if (!session.completed) {
    return {
      totalXP: 0,
      baseXP: 0,
      completionBonus: 0,
      streakBonus: 0,
      newStreak: profile.streak,
    };
  }

  const newStreak = updateStreak({
    currentStreak: profile.streak,
    lastCompletedDate: profile.lastCompletedDate,
    today,
  });

  const xp = calculateXP({
    elapsedMinutes: session.elapsedMinutes,
    plannedMinutes: session.plannedMinutes,
    streak: newStreak,
  });

  const updatedSession = { ...session, xpEarned: xp.totalXP };

  const newProfile: PlayerProfile = {
    ...profile,
    totalXP: profile.totalXP + xp.totalXP,
    streak: newStreak,
    lastCompletedDate: today,
    lastDomainId: session.domainId,
    domains: {
      ...profile.domains,
      [session.domainId]: (profile.domains[session.domainId] || 0) + xp.totalXP,
    },
    sessionHistory: [...profile.sessionHistory, updatedSession],
  };

  await xpPort.saveProfile(newProfile);

  return { ...xp, newStreak };
}
