/**
 * Lori Pi event listeners
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { isToolCallEventType } from "@mariozechner/pi-coding-agent";
import { appendEvent } from "../events/events.persistence";
import { rebuildState } from "../events/events.projection";
import { getTodayKey, loadConfig } from "../core/core.config";
import type { LoriState } from "../modules/modules.model";
import { isStudyContext, isStuckContext } from "../context/context.detection";
import { buildContextMessage, buildStuckMessage } from "../context/context.injection";
import type { CycleService } from "../cycle/cycle.service";
import { updateStatus } from "../ui/ui.status-bar";
import { updateTimerWidget } from "../ui/ui.timer-widget";
import { notifyTimerEnding, notifyTimerEnd } from "../ui/ui.notifications";
import { getDueCards } from "../srs/srs.algorithm";
import { LoriEvents } from "../events/events.model";

export interface ListenerDeps {
  pi: ExtensionAPI;
  getState: () => LoriState;
  setState: (s: LoriState) => void;
  getStateRef: () => LoriState | null;
  setStateRef: (s: LoriState | null) => void;
  cycleService: CycleService;
  startPeriodicTimer: (ctx: ExtensionContext) => void;
  stopPeriodicTimer: () => void;
}

export function registerLoriListeners(deps: ListenerDeps) {
  const { pi, getState, setState, getStateRef, setStateRef, cycleService, startPeriodicTimer, stopPeriodicTimer } = deps;

  pi.on("session_start", async (event, ctx) => {
    const oldConfig = await loadConfig(ctx.cwd);
    const oldStreak = oldConfig.streakDays;
    let state = await rebuildState(ctx.cwd);
    setState(state);
    cycleService.restoreFromEvents(state.events);
    updateStatus(ctx, state);
    updateTimerWidget(ctx, state, cycleService);
    startPeriodicTimer(ctx);

    if (oldStreak > 0 && state.config.streakDays === 0) {
      await appendEvent(ctx.cwd, {
        type: LoriEvents.STREAK_BROKEN,
        data: { reason: "gap > 1 day", previous: oldStreak },
      });
      pi.appendEntry("lori-event", {
        eventType: LoriEvents.STREAK_BROKEN,
        reason: "gap > 1 day",
        previous: oldStreak,
      });
      ctx.ui.notify(`💔 Streak quebrado! ${oldStreak} dias perdidos.`, "error");
    }

    if (event.reason === "startup" || event.reason === "new") {
      const due = Array.from(state.flashcards.values()).flatMap((c) => getDueCards(c));
      const msg =
        `🧠 Lori ativo. Módulos: ${state.config.activeModules.join(",") || "nenhum"}. ` +
        `Weaknesses: ${state.config.weaknesses.length}. SRS devido: ${due.length}. ` +
        `Streak: ${state.config.streakDays}. Comandos: /lori-start, /lori-plan, /lori-timer, /lori-stats.`;
      ctx.ui.notify(msg, "info");

      if (due.length > 0) {
        ctx.ui.notify(`🃏 ${due.length} flashcards SRS pendentes. Use /lori-review-srs`, "info");
      }

      const last = state.config.lastStudyDate;
      const today = getTodayKey();
      if (last && last !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (last === yesterday && state.config.streakDays > 0) {
          const hoursLeft = 24 - new Date().getHours();
          ctx.ui.notify(
            `🔥 Streak de ${state.config.streakDays} dias em risco! ${hoursLeft}h restantes.`,
            "warning",
          );
        }
      }
    }
  });

  pi.on("session_tree", async (_event, ctx) => {
    const state = getStateRef();
    if (state) {
      const newState = await rebuildState(ctx.cwd);
      setState(newState);
      updateStatus(ctx, newState);
      updateTimerWidget(ctx, newState, cycleService);
    }
  });

  pi.on("session_shutdown", async (_event, ctx) => {
    stopPeriodicTimer();
    const state = getStateRef();
    if (state?.activeTimer) {
      const elapsed = Math.floor((Date.now() - state.activeTimer.startedAt) / 60000);
      await appendEvent(ctx.cwd, {
        type: LoriEvents.SESSION_ENDED,
        data: {
          duration: elapsed,
          focus: 0,
          honest: true,
          notes: "",
          date: getTodayKey(),
          auto: true,
        },
      });
      pi.appendEntry("lori-event", {
        eventType: LoriEvents.SESSION_ENDED,
        duration: elapsed,
        auto: true,
      });
    }
    setStateRef(null);
    // setState is not called here because it expects LoriState, not null
  });

  pi.on("before_agent_start", async (event, _ctx) => {
    let state = getStateRef();
    if (!state) {
      state = await rebuildState(_ctx.cwd);
      setStateRef(state);
      setState(state);
      cycleService.restoreFromEvents(state.events);
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
      for (let i = 1; i < messages.length; i++) {
        pi.sendMessage(
          {
            customType: messages[i].customType,
            content: messages[i].content,
            display: messages[i].display,
          },
          { triggerTurn: false },
        );
      }
      return { message: messages[0] };
    }
  });

  pi.on("tool_call", async (event, ctx) => {
    let state = getStateRef();
    if (!state) {
      state = await rebuildState(ctx.cwd);
      setStateRef(state);
      setState(state);
    }

    if (isToolCallEventType("write", event) || isToolCallEventType("edit", event)) {
      const path = event.input.path as string;
      if (path && path.includes("/.lori/")) {
        const file = path.split("/.lori/").pop() || path;
        await appendEvent(ctx.cwd, {
          type: LoriEvents.FILE_MUTATED,
          data: { file, tool: event.toolName },
        });
        pi.appendEntry("lori-event", { eventType: LoriEvents.FILE_MUTATED, file, tool: event.toolName });
      }
    }
  });

  pi.on("turn_end", async (_event, ctx) => {
    const state = getStateRef();
    if (!state) return;
    if (state.activeTimer) {
      const elapsed = Math.floor((Date.now() - state.activeTimer.startedAt) / 60000);
      const remaining = state.activeTimer.durationMinutes - elapsed;
      if (remaining <= 0) {
        notifyTimerEnd(ctx, state.activeTimer.technique);
        await appendEvent(ctx.cwd, {
          type: LoriEvents.TIMER_ENDED,
          data: { auto: true },
        });
        pi.appendEntry("lori-event", { eventType: LoriEvents.TIMER_ENDED, auto: true });
        const newState = await rebuildState(ctx.cwd);
        setStateRef(newState);
        setState(newState);
        updateStatus(ctx, newState);
        updateTimerWidget(ctx, newState, cycleService);
      } else if (remaining === 5) {
        notifyTimerEnding(ctx, state.activeTimer.technique, remaining);
        updateTimerWidget(ctx, state, cycleService);
      } else {
        updateTimerWidget(ctx, state, cycleService);
      }
    }
    updateStatus(ctx, state);
  });

  pi.on("session_before_compact", async (event, _ctx) => {
    let state = getStateRef();
    if (!state) {
      state = await rebuildState(_ctx.cwd);
      setStateRef(state);
      setState(state);
    }

    const { preparation } = event;
    const { messagesToSummarize, firstKeptEntryId, tokensBefore } = preparation;

    const loriEntries: string[] = [];
    for (const entry of messagesToSummarize) {
      if (entry.role === "toolResult" && entry.toolName?.startsWith("lori_")) {
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
        if (text.includes("/lori") || text.includes("weakness") || text.includes("confuso")) {
          loriEntries.push(`[user] ${text.slice(0, 200)}`);
        }
      }
    }

    const summary = [
      `# Resumo Lori (compaction)`,
      ``,
      `## Estado preservado`,
      `- Módulos: ${state.config.activeModules.join(", ")}`,
      `- Weaknesses: ${state.config.weaknesses.map((w) => `${w.concept}(${w.errors})`).join("; ") || "nenhuma"}`,
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
}
