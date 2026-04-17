/**
 * Lori custom tools
 * - lori_log_event: append event to state.jsonl
 * - lori_get_context: retrieve current Lori state summary
 * - lori_review_srs: review flashcards with SM-2
 * - lori_search_concepts: search concepts across modules
 * - lori_add_resource: add resource to module
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { StringEnum } from "@mariozechner/pi-ai";
import { appendEvent, getLoriDir } from "./events.js";
import {
  getTodayKey,
  readModuleFile,
  writeModuleFile,
} from "./memory.js";
import type { LoriState } from "./memory.js";
import { calculateNextReview, getDueCards, createFlashcard, loadFlashcards, saveFlashcards, addFlashcard } from "./sm2.js";
import { updateStatus, updateTimerWidget } from "./ui.js";
import { join } from "node:path";
import { readdir, readFile } from "node:fs/promises";

export function registerTools(pi: ExtensionAPI, getState: () => LoriState, setState: (s: LoriState) => void) {
  pi.registerTool({
    name: "lori_log_event",
    label: "Lori Log",
    description: "Log a Lori event to the append-only state journal. Types: plan_created, session_started, session_ended, timer_started, timer_ended, concept_learned, drill_completed, feynman_done, weakness_identified, weakness_added, weakness_resolved, resource_curated, resource_added, retro_done, streak_broken, module_completed.",
    promptSnippet: "Log learning events to the Lori journal",
    parameters: Type.Object({
      type: StringEnum([
        "plan_created",
        "session_started",
        "session_ended",
        "timer_started",
        "timer_ended",
        "concept_learned",
        "drill_completed",
        "feynman_done",
        "weakness_identified",
        "weakness_added",
        "weakness_resolved",
        "resource_curated",
        "resource_added",
        "retro_done",
        "streak_broken",
        "module_completed",
      ] as const),
      data: Type.Optional(Type.Record(Type.String(), Type.Any())),
    }),
    async execute(_id, params, _signal, _onUpdate, ctx) {
      await appendEvent(ctx.cwd, { type: params.type, data: params.data ?? {} });
      return {
        content: [{ type: "text", text: `Logged: ${params.type}` }],
        details: { type: params.type },
      };
    },
  });

  pi.registerTool({
    name: "lori_get_context",
    label: "Lori Context",
    description: "Get current Lori learning context: active modules, weaknesses, due SRS cards, today's progress, and active timer.",
    promptSnippet: "Retrieve Lori learning context and state",
    parameters: Type.Object({}),
    async execute(_id, _params, _signal, _onUpdate, _ctx) {
      const state = getState();
      const due = Array.from(state.flashcards.values()).flatMap(cards => getDueCards(cards));
      const summary = {
        activeModules: state.config.activeModules,
        weaknesses: state.config.weaknesses,
        streakDays: state.config.streakDays,
        todayMinutes: state.todayMinutes,
        dailyGoalMinutes: state.config.dailyGoalMinutes,
        dueCards: due.length,
        activeTimer: state.activeTimer
          ? {
              technique: state.activeTimer.technique,
              module: state.activeTimer.module,
              remainingMinutes: Math.max(
                0,
                state.activeTimer.durationMinutes -
                  Math.floor((Date.now() - state.activeTimer.startedAt) / 60000)
              ),
            }
          : null,
      };
      return {
        content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
        details: summary,
      };
    },
  });

  pi.registerTool({
    name: "lori_review_srs",
    label: "Lori SRS",
    description: "Review due flashcards using SM-2. Returns due cards for a module or all modules. Provide quality (0-5) to update scheduling.",
    promptSnippet: "Review spaced repetition flashcards",
    parameters: Type.Object({
      module: Type.Optional(Type.String({ description: "Module name, or omit for all" })),
      action: StringEnum(["list_due", "review"] as const),
      cardId: Type.Optional(Type.String()),
      quality: Type.Optional(Type.Number({ description: "0-5 rating" })),
    }),
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const state = getState();
      if (params.action === "list_due") {
        const modules = params.module ? [params.module] : state.config.activeModules;
        const due: { module: string; id: string; front: string }[] = [];
        for (const mod of modules) {
          const cards = state.flashcards.get(mod) ?? (await loadFlashcards(ctx.cwd, mod));
          for (const c of getDueCards(cards)) {
            due.push({ module: mod, id: c.id, front: c.front });
          }
        }
        return {
          content: [{ type: "text", text: due.length ? JSON.stringify(due, null, 2) : "Nenhum card devido." }],
          details: { due },
        };
      }

      if (params.action === "review" && params.cardId && params.quality !== undefined) {
        const modules = params.module ? [params.module] : state.config.activeModules;
        for (const mod of modules) {
          const cards = state.flashcards.get(mod) ?? (await loadFlashcards(ctx.cwd, mod));
          const idx = cards.findIndex(c => c.id === params.cardId);
          if (idx >= 0) {
            cards[idx] = calculateNextReview(cards[idx], params.quality);
            await saveFlashcards(ctx.cwd, mod, cards);
            state.flashcards.set(mod, cards);
            setState(state);
            return {
              content: [
                {
                  type: "text",
                  text: `Card ${params.cardId} atualizado. Próxima revisão em ${cards[idx].interval} dia(s).`,
                },
              ],
              details: { card: cards[idx] },
            };
          }
        }
        return {
          content: [{ type: "text", text: `Card ${params.cardId} não encontrado.` }],
          details: { error: "not_found" },
        };
      }

      return {
        content: [{ type: "text", text: "Ação inválida ou parâmetros faltando." }],
        details: { error: "invalid_params" },
      };
    },
  });

  pi.registerTool({
    name: "lori_search_concepts",
    label: "Lori Search",
    description: "Search concepts across all Lori modules. Searches concepts.md, plan.md, and week files.",
    promptSnippet: "Search Lori module concepts and plans",
    parameters: Type.Object({
      query: Type.String(),
    }),
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const loriDir = getLoriDir(ctx.cwd);
      const modulesDir = join(loriDir, "modules");
      const results: { module: string; file: string; line: string }[] = [];

      try {
        const mods = await readdir(modulesDir);
        for (const mod of mods) {
          const files = ["concepts.md", "plan.md", "drills.md"];
          for (const f of files) {
            const content = await readModuleFile(ctx.cwd, mod, f);
            if (!content) continue;
            const q = params.query.toLowerCase();
            for (const line of content.split("\n")) {
              if (line.toLowerCase().includes(q)) {
                results.push({ module: mod, file: f, line: line.trim() });
              }
            }
          }
        }
      } catch {
        // no modules yet
      }

      return {
        content: [
          {
            type: "text",
            text: results.length
              ? results.map(r => `[${r.module}/${r.file}] ${r.line}`).join("\n")
              : "Nenhum resultado.",
          },
        ],
        details: { results },
      };
    },
  });

  pi.registerTool({
    name: "lori_add_resource",
    label: "Lori Resource",
    description: "Add a curated resource to a Lori module or global resources.",
    promptSnippet: "Add learning resources to Lori",
    parameters: Type.Object({
      module: Type.Optional(Type.String({ description: "Module name, or omit for global" })),
      title: Type.String(),
      url: Type.Optional(Type.String()),
      notes: Type.Optional(Type.String()),
      tags: Type.Optional(Type.Array(Type.String())),
    }),
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const line = `- [${params.title}](${params.url ?? ""})${params.notes ? " - " + params.notes : ""}`;
      if (params.module) {
        const existing = (await readModuleFile(ctx.cwd, params.module, "resources.md")) ?? "";
        await writeModuleFile(ctx.cwd, params.module, "resources.md", existing + line + "\n");
        await appendEvent(ctx.cwd, {
          type: "resource_curated",
          data: { module: params.module, title: params.title, url: params.url, notes: params.notes, tags: params.tags },
        });
      } else {
        const { appendFile } = await import("node:fs/promises");
        const path = join(getLoriDir(ctx.cwd), "resources", "index.md");
        await appendFile(path, line + "\n");
        await appendEvent(ctx.cwd, {
          type: "resource_curated",
          data: { title: params.title, url: params.url, notes: params.notes, tags: params.tags },
        });
      }
      return {
        content: [{ type: "text", text: `Recurso adicionado: ${params.title}` }],
        details: { title: params.title },
      };
    },
  });

  pi.registerTool({
    name: "lori_create_flashcard",
    label: "Lori Flashcard",
    description: "Create a new SRS flashcard for a module.",
    promptSnippet: "Create spaced repetition flashcards",
    parameters: Type.Object({
      module: Type.String(),
      front: Type.String(),
      back: Type.String(),
    }),
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const card = createFlashcard(params.module, params.front, params.back);
      await addFlashcard(ctx.cwd, params.module, card);
      const state = getState();
      const existing = state.flashcards.get(params.module) ?? [];
      existing.push(card);
      state.flashcards.set(params.module, existing);
      setState(state);
      return {
        content: [{ type: "text", text: `Flashcard criado: ${card.id}` }],
        details: { card },
      };
    },
  });
}
