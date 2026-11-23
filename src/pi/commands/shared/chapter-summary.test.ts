import { describe, expect, test } from "bun:test";
import { formatChapterSummary } from "./chapter-summary.ts";
import type { ActiveDomain, ChapterVersion } from "../../../core/domain/domain.types.ts";

describe("formatChapterSummary", () => {
  test("lists every ordered Node with its objective", () => {
    const domain = {
      id: "domain-1",
      name: "Spanish",
      learningObjective: "Hold a conversation while traveling",
    } as ActiveDomain;
    const chapter = {
      id: "chapter-1",
      version: 2,
      chapter: {
        outcome: "Arrange a meal in Spanish.",
        principle: "Directness",
        nodes: [
          { id: "greetings", objective: "Open a short exchange." },
          { id: "ordering", objective: "Order a meal and respond." },
        ],
      },
    } as ChapterVersion;

    expect(formatChapterSummary(domain, chapter)).toEqual([
      "Domain: Spanish [domain-1]",
      "Objetivo de aprendizagem: Hold a conversation while traveling",
      "Versão do Chapter: 2 · chapter-1",
      "Outcome: Arrange a meal in Spanish.",
      "Principle: Directness",
      "Nodes em ordem: greetings — Open a short exchange. → ordering — Order a meal and respond.",
    ]);
  });
});
