import type { XPPort } from "./core/ports";

export async function handleBeforeAgentStart(
  xpPort: XPPort,
  systemPrompt: string
): Promise<string | undefined> {
  const profile = await xpPort.loadProfile();
  if (!profile.lastDomainId) return undefined;
  const context = `[Lori] Last domain: ${profile.lastDomainId} | Total XP: ${profile.totalXP} | Skin: ${profile.activeSkin}`;
  return `${systemPrompt}\n${context}`;
}
