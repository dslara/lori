import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { ActiveDomain } from "../../../core/domain/domain.types.ts";
import { writeSnapshot } from "../../../effects/persist/persist.ts";
import { createInitialState } from "../../../store/state.ts";
import type { LoriExtensionState } from "../shared/shared.types.ts";
import { registerLoriChapter } from "./lori-chapter.ts";

type Screen = {
  render(width: number): string[];
  handleInput(data: string): void;
  capturesViewportInput?: boolean;
};
type ScreenFactory = (
  tui: never,
  theme: never,
  keybindings: never,
  done: (result: unknown) => void,
) => Screen | Promise<Screen>;

describe("/lori-chapter registered command", () => {
  test("scrolls the approved Chapter report through the TUI", async () => {
    const projectDir = await mkdtemp(join(tmpdir(), "lori-chapter-command-"));
    try {
      const domain: ActiveDomain = {
        id: "domain-1",
        name: "Spanish",
        learningObjective: "Hold a short conversation while traveling",
        questionnaire: {
          motivation: "Travel",
          deadline: null,
          hoursPerWeek: 4,
          baseline: 2,
          preferences: null,
          materialRestrictions: null,
        },
        status: "active",
        currentChapterVersionId: "chapter-1",
        chapters: [{
          id: "chapter-1",
          version: 1,
          approvedAt: 1,
          chapter: {
            outcome: "Arrange a meal in Spanish.",
            nodes: [{
              id: "ordering",
              order: 1,
              objective: "Order a meal and respond to a follow-up question.",
              prerequisiteNodeIds: [],
              prerequisiteRationales: [],
              exitProofContributions: [{
                criterion: "The Player orders a meal.",
                rationale: "Ordering is the observable outcome of this Node.",
              }],
              evidenceRefs: [{ resourceId: "resource-1", evidenceId: "evidence-1" }],
              recommendedResourceId: "resource-1",
            }],
            principle: "Directness",
            exitProof: {
              description: "Record a short restaurant role-play.",
              criteria: ["The Player orders a meal."],
            },
            effort: {
              minimumHours: 2,
              maximumHours: 3,
              estimateRationale: "The estimate covers focused listening and practice.",
              deadline: null,
              hoursPerWeek: 4,
              feasibility: "Fits the declared availability.",
            },
            resources: [{
              id: "resource-1",
              title: "Restaurant phrases",
              url: "https://example.com/restaurant-phrases",
              scope: "Beginner restaurant dialogue.",
              justification: "It models a short meal order.",
              limitations: "It covers only one setting.",
              compatibility: {
                preferencesConsidered: "Text and audio are available.",
                restrictionsConsidered: "No payment is required.",
                compatible: true,
              },
              evidence: [{
                id: "evidence-1",
                excerpt: "Quisiera pedir una sopa, por favor.",
                locator: "Section 4, line 2",
              }],
            }],
          },
        }],
      };
      const state = createInitialState();
      state.domains = [domain];
      await writeSnapshot(projectDir, state);

      let handler: ((args: string, ctx: never) => unknown) | undefined;
      const api = {
        registerCommand(_name: string, options: { handler: (args: string, ctx: never) => unknown }) {
          handler = options.handler;
        },
      } as unknown as ExtensionAPI;
      const shared = {
        store: { getState: () => state, dispatch() {} },
        projectDir,
        skin: { render: () => "" },
        startupError: undefined,
        curationRuntime: {} as LoriExtensionState["curationRuntime"],
      } satisfies LoriExtensionState;

      let selectedOptions: string[] = [];
      let initialFrame: string[] = [];
      let scrolledFrame: string[] = [];
      let screenOptions: unknown;
      const ui = {
        notify() {},
        async select(_title: string, options: string[]) {
          selectedOptions = options;
          return options[0];
        },
        async custom(factory: ScreenFactory, options: unknown) {
          screenOptions = options;
          const tui = { terminal: { rows: 12, columns: 80 }, requestRender() {} };
          const theme = { fg: (_color: string, text: string) => text };
          const keys = {
            matches(data: string, action: string) {
              const bindings: Record<string, string[]> = {
                "tui.select.up": ["UP"],
                "tui.altScreen.lineUp": ["UP"],
                "tui.select.down": ["DOWN"],
                "tui.altScreen.lineDown": ["DOWN"],
                "tui.select.pageUp": ["PAGEUP"],
                "tui.altScreen.pageUp": ["PAGEUP"],
                "tui.select.pageDown": ["PAGEDOWN"],
                "tui.altScreen.pageDown": ["PAGEDOWN"],
                "tui.select.cancel": ["ESC"],
              };
              return bindings[action]?.includes(data) ?? false;
            },
          };
          let complete!: () => void;
          const completed = new Promise<void>((resolve) => { complete = resolve; });
          const screen = await factory(tui as never, theme as never, keys as never, () => complete());
          initialFrame = screen.render(80);
          for (let index = 0; index < 40; index += 1) {
            screen.handleInput("PAGEDOWN");
          }
          scrolledFrame = screen.render(80);
          screen.handleInput("ESC");
          await completed;
        },
      };

      registerLoriChapter(api, shared);
      await handler?.("", { ui, mode: "tui" } as never);

      expect(selectedOptions).toEqual(["Spanish — Hold a short conversation while traveling [domain-1]"]);
      expect(initialFrame.join("\n")).toContain("RESUMO DO CHAPTER");
      expect(initialFrame.join("\n")).not.toContain("Trecho evidence-1");
      expect(scrolledFrame).not.toEqual(initialFrame);
      expect(scrolledFrame.join("\n")).toContain("Trecho evidence-1");
      expect(scrolledFrame.join("\n")).toContain("Quisiera pedir una sopa, por favor.");
      expect(screenOptions).toMatchObject({ overlay: true });
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });
});
