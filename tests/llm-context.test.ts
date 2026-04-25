import { describe, it, expect, vi } from "vitest";
import { buildContextString, handleBeforeAgentStart } from "../.pi/extensions/lori/llm-context";

describe("buildContextString", () => {
  it("returns formatted line when session is active", () => {
    const session = {
      domainId: "japanese",
      startedAt: new Date(Date.now() - 300_000).toISOString(),
      plannedDurationSec: 1500,
    };
    const profile = {
      streak: 3,
      activeSkin: "RPG",
    };

    const result = buildContextString(session, profile);
    expect(result).toContain("Domain: japanese");
    expect(result).toContain("Remaining:");
    expect(result).toContain("Streak: 3 days");
    expect(result).toContain("Skin: RPG");
  });

  it("returns null when no active session", () => {
    const result = buildContextString(null, { streak: 0, activeSkin: "minimal" });
    expect(result).toBeNull();
  });

  it("shows negative remaining during overtime", () => {
    const session = {
      domainId: "rust",
      startedAt: new Date(Date.now() - 2000_000).toISOString(),
      plannedDurationSec: 1500,
    };
    const profile = { streak: 1, activeSkin: "minimal" };

    const result = buildContextString(session, profile);
    expect(result).toMatch(/Remaining: -\d+:\d+/);
  });

  it("handleBeforeAgentStart appends context when session active", async () => {
    const sessionPort = {
      getActive: vi.fn().mockResolvedValue({
        domainId: "japanese",
        startedAt: new Date(Date.now() - 300_000).toISOString(),
        plannedDurationSec: 1500,
      }),
    };
    const xpPort = {
      loadProfile: vi.fn().mockResolvedValue({ streak: 3, activeSkin: "RPG" }),
    };

    const result = await handleBeforeAgentStart(sessionPort as any, xpPort as any, "system prompt here");
    expect(result).toContain("system prompt here");
    expect(result).toContain("[Lori] Domain: japanese");
  });

  it("handleBeforeAgentStart returns undefined when no active session", async () => {
    const sessionPort = { getActive: vi.fn().mockResolvedValue(null) };
    const xpPort = { loadProfile: vi.fn() };

    const result = await handleBeforeAgentStart(sessionPort as any, xpPort as any, "system prompt");
    expect(result).toBeUndefined();
    expect(xpPort.loadProfile).not.toHaveBeenCalled();
  });
});
