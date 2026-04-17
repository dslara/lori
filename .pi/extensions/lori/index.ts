/**
 * Lori Extension — Learning acceleration system
 * Entry point. Registra tools, commands, listeners.
 *
 * Architecture:
 *   events.ts   — Persistência append-only (state.jsonl + appendEntry)
 *   memory.ts   — Reconstrução de estado projetado
 *   context.ts  — Injeção de contexto via before_agent_start
 *   cycle.ts    — Máquina de estados da sessão
 *   skills.ts   — Registro e mapeamento de rituais
 *   ui.ts       — Status bar, widgets, notificações
 *   sm2.ts      — Algoritmo SM-2 para SRS
 *   tools.ts    — Custom tools registrados no Pi
 *   commands.ts — Commands /lori-*
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { isToolCallEventType } from "@mariozechner/pi-coding-agent";
import { appendEvent } from "./events.js";
import { rebuildState, loadConfig, saveConfig, getTodayKey } from "./memory.js";
import type { LoriState } from "./memory.js";
import {
  isStudyContext,
  isStuckContext,
  buildContextMessage,
  buildStuckMessage,
} from "./context.js";
import {
  getCycle,
  restoreCycleFromEvents,
  startPreSession,
  startInSession,
  startTimer,
  stopTimer,
  isTimerExpired,
  getTimerRemaining,
  startPostSession,
  getElapsedMinutes,
} from "./cycle.js";
import { suggestRitual } from "./skills.js";
import { registerTools } from "./tools.js";
import { registerCommands } from "./commands.js";
import { updateStatus, updateTimerWidget, notifyTimerEnd, notifyTimerEnding } from "./ui.js";
import { getDueCards } from "./sm2.js";

export default function (pi: ExtensionAPI) {
  let state: LoriState | null = null;
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  const getState = () => {
    if (!state) throw new Error("Lori state not loaded");
    return state;
  };

  const setState = (s: LoriState) => {
    state = s;
  };

  function startPeriodicTimer(ctx: ExtensionContext) {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!state) return;
      if (state.activeTimer) {
        const elapsed = Math.floor((Date.now() - state.activeTimer.startedAt) / 60000);
        const remaining = state.activeTimer.durationMinutes - elapsed;
        if (remaining <= 0) {
          notifyTimerEnd(ctx, state.activeTimer.technique);
          appendEvent(ctx.cwd, { type: "timer_ended", data: { auto: true } }).catch(() => {});
          pi.appendEntry("lori-event", { eventType: "timer_ended", auto: true });
          state.activeTimer = undefined;
          updateTimerWidget(ctx, state);
        } else if (remaining === 5) {
          notifyTimerEnding(ctx, state.activeTimer.technique, remaining);
          updateTimerWidget(ctx, state);
        } else {
          updateTimerWidget(ctx, state);
        }
      }
      updateStatus(ctx, state);
    }, 30000);
  }

  function stopPeriodicTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // ─── Session events ───
  pi.on("session_start", async (event, ctx) => {
    const oldConfig = await loadConfig(ctx.cwd);
    const oldStreak = oldConfig.streakDays;
    state = await rebuildState(ctx.cwd);
    restoreCycleFromEvents(state.events);
    updateStatus(ctx, state);
    updateTimerWidget(ctx, state);
    startPeriodicTimer(ctx);

    // Detect streak broken
    if (oldStreak > 0 && state.config.streakDays === 0) {
      await appendEvent(ctx.cwd, {
        type: "streak_broken",
        data: { reason: "gap > 1 day", previous: oldStreak },
      });
      pi.appendEntry("lori-event", { eventType: "streak_broken", reason: "gap > 1 day", previous: oldStreak });
      ctx.ui.notify(`💔 Streak quebrado! ${oldStreak} dias perdidos.`, "error");
    }

    if (event.reason === "startup" || event.reason === "new") {
      const due = Array.from(state.flashcards.values()).flatMap((c) =>
        getDueCards(c)
      );
      const msg =
        `🧠 Lori ativo. Módulos: ${state.config.activeModules.join(",") || "nenhum"}. ` +
        `Weaknesses: ${state.config.weaknesses.length}. SRS devido: ${due.length}. ` +
        `Streak: ${state.config.streakDays}. Comandos: /lori-start, /lori-plan, /lori-timer, /lori-stats.`;
      ctx.ui.notify(msg, "info");

      if (due.length > 0) {
        ctx.ui.notify(
          `🃏 ${due.length} flashcards SRS pendentes. Use /lori-review-srs`,
          "info"
        );
      }

      const last = state.config.lastStudyDate;
      const today = getTodayKey();
      if (last && last !== today) {
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .slice(0, 10);
        if (last === yesterday && state.config.streakDays > 0) {
          const hoursLeft = 24 - new Date().getHours();
          ctx.ui.notify(
            `🔥 Streak de ${state.config.streakDays} dias em risco! ${hoursLeft}h restantes.`,
            "warning"
          );
        }
      }
    }
  });

  pi.on("session_tree", async (_event, ctx) => {
    if (state) {
      state = await rebuildState(ctx.cwd);
      updateStatus(ctx, state);
      updateTimerWidget(ctx, state);
    }
  });

  pi.on("session_shutdown", async (_event, ctx) => {
    stopPeriodicTimer();
    if (state?.activeTimer) {
      const elapsed = Math.floor(
        (Date.now() - state.activeTimer.startedAt) / 60000
      );
      await appendEvent(ctx.cwd, {
        type: "session_ended",
        data: { duration: elapsed, focus: 0, honest: true, notes: "", date: getTodayKey(), auto: true },
      });
      pi.appendEntry("lori-event", { eventType: "session_ended", duration: elapsed, auto: true });
    }
    state = null;
  });

  // ─── Before agent start: detect study keywords, inject context ───
  pi.on("before_agent_start", async (event, ctx) => {
    // Lazy load state only if not in memory; trust memory over disk
    if (!state) {
      state = await rebuildState(ctx.cwd);
      restoreCycleFromEvents(state.events);
    }

    const prompt = event.prompt.toLowerCase();
    const messages: Array<{ customType: string; content: string; display: boolean }> = [];

    if (isStuckContext(prompt)) {
      messages.push({
        customType: "lori-stuck",
        content: buildStuckMessage(),
        display: true,
      });
    }

    if (isStudyContext(prompt) || state.config.activeModules.length > 0) {
      messages.push({
        customType: "lori-context",
        content: buildContextMessage(state),
        display: false,
      });
    }

    if (messages.length === 1) {
      return { message: messages[0] };
    }
    if (messages.length > 1) {
      // Inject first as custom_message, rest via sendMessage without trigger
      for (let i = 1; i < messages.length; i++) {
        pi.sendMessage({ customType: messages[i].customType, content: messages[i].content, display: messages[i].display }, { triggerTurn: false });
      }
      return { message: messages[0] };
    }
  });

  // ─── Tool call: intercept edit/write in .lori/ for auto-events ───
  pi.on("tool_call", async (event, ctx) => {
    if (!state) state = await rebuildState(ctx.cwd);

    if (
      isToolCallEventType("write", event) ||
      isToolCallEventType("edit", event)
    ) {
      const path = event.input.path as string;
      if (path && path.includes("/.lori/")) {
        const file = path.split("/.lori/").pop() || path;
        await appendEvent(ctx.cwd, {
          type: "file_mutated",
          data: { file, tool: event.toolName },
        });
        pi.appendEntry("lori-event", { eventType: "file_mutated", file, tool: event.toolName });
      }
    }
  });

  // ─── Turn end: check active timer, notify ───
  pi.on("turn_end", async (_event, ctx) => {
    if (!state) return;
    if (state.activeTimer) {
      const elapsed = Math.floor(
        (Date.now() - state.activeTimer.startedAt) / 60000
      );
      const remaining = state.activeTimer.durationMinutes - elapsed;
      if (remaining <= 0) {
        notifyTimerEnd(ctx, state.activeTimer.technique);
        await appendEvent(ctx.cwd, {
          type: "timer_ended",
          data: { auto: true },
        });
        pi.appendEntry("lori-event", { eventType: "timer_ended", auto: true });
        state = await rebuildState(ctx.cwd);
        updateStatus(ctx, state);
        updateTimerWidget(ctx, state);
      } else if (remaining === 5) {
        notifyTimerEnding(ctx, state.activeTimer.technique, remaining);
        updateTimerWidget(ctx, state);
      } else {
        updateTimerWidget(ctx, state);
      }
    }
    updateStatus(ctx, state);
  });

  // ─── Session before compact: UL-aware summary ───
  pi.on("session_before_compact", async (event, ctx) => {
    if (!state) state = await rebuildState(ctx.cwd);

    const { preparation } = event;
    const { messagesToSummarize, firstKeptEntryId, tokensBefore } =
      preparation;

    const loriEntries: string[] = [];
    for (const entry of messagesToSummarize) {
      if (
        entry.role === "toolResult" &&
        entry.toolName?.startsWith("lori_")
      ) {
        const detail = JSON.stringify(entry.details).slice(0, 200);
        loriEntries.push(`[${entry.toolName}] ${detail}`);
      }
      if (entry.role === "user") {
        const text =
          typeof entry.content === "string"
            ? entry.content
            : entry.content
                .filter((c) => c.type === "text")
                .map((c) => c.text)
                .join(" ");
        if (
          text.includes("/lori") ||
          text.includes("weakness") ||
          text.includes("confuso")
        ) {
          loriEntries.push(`[user] ${text.slice(0, 200)}`);
        }
      }
    }

    const summary = [
      `# Resumo Lori (compaction)`,
      ``,
      `## Estado preservado`,
      `- Módulos: ${state.config.activeModules.join(", ")}`,
      `- Weaknesses: ${state.config.weaknesses.map(w => `${w.concept}(${w.errors})`).join("; ") || "nenhuma"}`,
      `- Streak: ${state.config.streakDays}`,
      `- Hoje: ${state.todayMinutes}min`,
      ``,
      `## Eventos chave`,
      loriEntries.slice(-20).join("\n"),
      ``,
      `> Resumo auto-gerado por Lori extension.`,
    ].join("\n");

    return {
      compaction: {
        summary,
        firstKeptEntryId,
        tokensBefore,
      },
    };
  });

  // ─── Register tools & commands ───
  registerTools(pi, getState, setState);
  registerCommands(pi, getState, setState);
}
