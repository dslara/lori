import { describe, it, expect, vi } from "vitest";
import { handleBeforeAgentStart } from "../.pi/extensions/lori/llm-context";

describe("handleBeforeAgentStart", () => {
  it("appends context when lastDomainId exists", async () => {
    const xpPort = {
      loadProfile: vi.fn().mockResolvedValue({
        lastDomainId: "japanese",
        totalXP: 500,
        activeSkin: "RPG",
      }),
    };

    const result = await handleBeforeAgentStart(xpPort as any, "system prompt here");
    expect(result).toContain("system prompt here");
    expect(result).toContain("Last domain: japanese");
    expect(result).toContain("Total XP: 500");
  });

  it("returns undefined when no lastDomainId", async () => {
    const xpPort = {
      loadProfile: vi.fn().mockResolvedValue({
        lastDomainId: null,
        totalXP: 0,
        activeSkin: "default",
      }),
    };

    const result = await handleBeforeAgentStart(xpPort as any, "system prompt");
    expect(result).toBeUndefined();
  });
});
