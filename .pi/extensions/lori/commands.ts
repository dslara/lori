/**
 * Lori commands
 * /lori-start, /lori-end, /lori-timer, /lori-plan, /lori-retro, /lori-stats, /lori-review-srs
 */

import type { ExtensionAPI, ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { appendEvent } from "./events.js";
import {
  getTodayKey,
  rebuildState,
  loadConfig,
  saveConfig,
  writeModuleFile,
  readModuleFile,
} from "./memory.js";
import { ensureLoriDir } from "./events.js";
import type { LoriState } from "./memory.js";
import { updateStatus, updateTimerWidget } from "./ui.js";
import {
  startPreSession,
  startInSession,
  startTimer,
  stopTimer,
  startPostSession,
  getElapsedMinutes,
} from "./cycle.js";
import { suggestRitual } from "./skills.js";
import { runModuleWizard, buildAgentPrompt, slugifyTopic } from "./wizard.js";

export function registerCommands(
  pi: ExtensionAPI,
  getState: () => LoriState,
  setState: (s: LoriState) => void,
) {
  pi.registerCommand("lori-start", {
    description: "Iniciar sessão de estudo Lori. Uso: /lori-start [modulo] [tecnica]",
    handler: async (args, ctx) => {
      const parts = args.trim().split(/\s+/);
      const moduleArg = parts[0];
      const techniqueArg = parts[1];
      const objective = parts.slice(2).join(" ") || "";
      const module = moduleArg || "geral";

      let state: LoriState;
      try {
        state = getState();
      } catch {
        state = await rebuildState(ctx.cwd);
        setState(state);
      }
      const technique = techniqueArg || suggestRitual(state.config.weaknesses) || "foco";

      startPreSession(module, technique, objective);

      await appendEvent(ctx.cwd, {
        type: "session_started",
        data: { module, technique, objective, date: getTodayKey() },
      });
      pi.appendEntry("lori-event", { eventType: "session_started", module, technique });

      ctx.ui.notify(`🎯 Sessão Lori iniciada: ${module} | ${technique}${techniqueArg ? "" : " (sugerido)"}`, "info");

      // Inject context message for the LLM
      pi.sendMessage(
        {
          customType: "lori-session",
          content: `Sessão Lori iniciada: modulo=${module}, tecnica=${technique}. Ciclo: pre-session → in-session → post-session.
Ritual sugerido:
1. Pre: /skill:lori-pomodoro (foco)
2. Core: /skill:lori-${technique}
3. Warm-down: /skill:lori-retrieval (quiz rápido 5min)
4. Post: honestidade forçada — "o que ficou confuso?"`,
          display: false,
        },
        { triggerTurn: false },
      );
    },
  });

  pi.registerCommand("lori-end", {
    description: "Finalizar sessão de estudo Lori. Registra minutos e trigger honestidade.",
    handler: async (args, ctx) => {
      startPostSession();
      const minutes = getElapsedMinutes();

      const a = args.trim().split(/\s+/);
      const focus = a[0] ? Math.min(10, Math.max(0, parseInt(a[0], 10))) : 0;
      const honest = a[1] === "true" || a[1] === "1" || a[1] === "sim";
      const notes = a.slice(2).join(" ") || "";

      await appendEvent(ctx.cwd, {
        type: "session_ended",
        data: { duration: minutes, focus, honest, notes, date: getTodayKey() },
      });
      pi.appendEntry("lori-event", { eventType: "session_ended", duration: minutes });

      // Update config streak
      const config = await loadConfig(ctx.cwd);
      const today = getTodayKey();
      if (config.lastStudyDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (config.lastStudyDate === yesterday) {
          config.streakDays += 1;
        } else {
          config.streakDays = 1;
        }
        config.lastStudyDate = today;
        await saveConfig(ctx.cwd, config);
      }

      const newState = await rebuildState(ctx.cwd);
      setState(newState);
      updateStatus(ctx, newState);
      updateTimerWidget(ctx, newState);

      ctx.ui.notify(`✅ Sessão finalizada. ${minutes} minutos.`, "info");

      // Force honesty question
      pi.sendMessage(
        {
          customType: "lori-honesty",
          content:
            "Pós-sessão obrigatório: o que ficou confuso? Quais conceitos não estão 100% claros? Registre weaknesses via lori_log_event type=weakness_identified.",
          display: true,
        },
        { triggerTurn: true },
      );
    },
  });

  pi.registerCommand("lori-timer", {
    description: "Gerenciar timer Pomodoro Lori. Uso: /lori-timer [start|stop|status] [minutos]",
    handler: async (args, ctx) => {
      const [action, minsArg] = args.trim().split(/\s+/);
      const state = getState();

      if (action === "start" || action === undefined) {
        const minutes = parseInt(minsArg || `${state.config.pomodoroWork}`, 10);
        const module = state.config.activeModules[0] || "geral";
        startTimer(minutes);
        startInSession();
        await appendEvent(ctx.cwd, {
          type: "timer_started",
          data: { module, technique: "pomodoro", durationMinutes: minutes },
        });
        pi.appendEntry("lori-event", { eventType: "timer_started", module, durationMinutes: minutes });
        const newState = await rebuildState(ctx.cwd);
        setState(newState);
        updateStatus(ctx, newState);
        updateTimerWidget(ctx, newState);
        ctx.ui.notify(`⏱ Timer ${minutes}min iniciado`, "info");
      } else if (action === "stop") {
        stopTimer();
        await appendEvent(ctx.cwd, { type: "timer_ended", data: {} });
        pi.appendEntry("lori-event", { eventType: "timer_ended" });
        const newState = await rebuildState(ctx.cwd);
        setState(newState);
        updateStatus(ctx, newState);
        updateTimerWidget(ctx, newState);
        ctx.ui.notify("⏱ Timer parado", "info");
      } else if (action === "status") {
        if (state.activeTimer) {
          const elapsed = Math.floor((Date.now() - state.activeTimer.startedAt) / 60000);
          const remaining = Math.max(0, state.activeTimer.durationMinutes - elapsed);
          ctx.ui.notify(`⏱ ${remaining}m restantes`, "info");
        } else {
          ctx.ui.notify("Nenhum timer ativo", "warning");
        }
      }
    },
  });

  pi.registerCommand("lori-plan", {
    description: "Criar plano de módulo via wizard. Uso: /lori-plan",
    handler: async (_args, ctx) => {
      // --- Always wizard mode ---
      const answers = await runModuleWizard(ctx);
      if (!answers) {
        ctx.ui.notify("Wizard cancelado. Nenhum módulo criado.", "warning");
        return;
      }

      const module = slugifyTopic(answers.topic);
      await ensureLoriDir(ctx.cwd);

      // Check for collision
      const existing = await readModuleFile(ctx.cwd, module, "plan.md");
      if (existing) {
        ctx.ui.notify(`Módulo "${module}" já existe. Use read para ver.`, "warning");
        return;
      }

      // Save draft with raw answers
      const draft = `# Draft: ${module}\n\n**Tópico:** ${answers.topic}\n**Objetivo:** ${answers.objective}\n**Tempo:** ${answers.timeCommitment}\n**Nível:** ${answers.level}\n**Pré-requisitos:** ${answers.prerequisites}\n`;
      await writeModuleFile(ctx.cwd, module, "plan-draft.md", draft);

      // Create empty resources.md template
      const resourcesTemplate = `# Recursos Curados — ${module}\n\nLegenda de uso:\n- **LER**: leitura passiva, extrair ideias\n- **CODAR**: codar junto, pausar e testar\n- **CONSULTAR**: abrir quando travar, não ler antes\n- **DECORAR**: memorizar tabela/fato exato\n- **ANALISAR**: ler código existente, identificar padrões\n\nNota: substitua \`<pi-install>\` pelo path da instalação do Pi e \`<projeto>\` pelo root do projeto estudado.\n\n---\n\n## Conceitos\n- [ ] ??? — tag: semana-1, conceito: [tópico], ler-ativo\n  Notas: buscar recurso sobre...\n\n## Fatos\n- [ ] ??? — tag: semana-1, fato: [tópico], decorar\n  Notas: buscar referência rápida sobre...\n\n## Procedimentos\n- [ ] ??? — tag: semana-1, procedimento: [tópico], codar\n  Notas: buscar tutorial prático sobre...\n`;
      await writeModuleFile(ctx.cwd, module, "resources.md", resourcesTemplate);

      // Register module as active
      const config = await loadConfig(ctx.cwd);
      if (!config.activeModules.includes(module)) {
        config.activeModules.push(module);
        await saveConfig(ctx.cwd, config);
      }

      // Log event
      await appendEvent(ctx.cwd, {
        type: "plan_created",
        data: { module, weeks: 0, goals: [answers.objective] },
      });
      pi.appendEntry("lori-event", { eventType: "plan_created", module, wizard: true });

      // Notify and trigger agent to generate full plan
      ctx.ui.notify(`🧙 Módulo "${module}" criado via wizard. Draft + resources template prontos. Aguardando geração do plano...`, "info");

      pi.sendMessage(
        {
          customType: "lori-wizard",
          content: buildAgentPrompt(answers, module),
          display: true,
        },
        { triggerTurn: true },
      );

      const newState = await rebuildState(ctx.cwd);
      setState(newState);
      updateStatus(ctx, newState);
    },
  });

  pi.registerCommand("lori-retro", {
    description: "Iniciar retrospectiva semanal Lori.",
    handler: async (_args, ctx) => {
      const week = getWeekKey();
      const state = getState();

      // Generate retro artifact for each active module
      for (const mod of state.config.activeModules) {
        const modState = state.modules.get(mod);
        const nextWeekNum = (modState?.weeks.length ?? 0) + 1;
        const nextWeekFile = `week-${String(nextWeekNum).padStart(2, "0")}.md`;
        const existingNextWeek = await readModuleFile(ctx.cwd, mod, nextWeekFile);
        if (!existingNextWeek) {
          const weekTemplate = `# Semana ${nextWeekNum} — ${mod}\n\n## Objetivo desta semana\n\n## Conceitos\n- [ ]\n\n## Fatos\n- [ ]\n\n## Procedimentos\n- [ ]\n\n## Benchmark\n\n## Notas\n`;
          await writeModuleFile(ctx.cwd, mod, nextWeekFile, weekTemplate);
        }
        const retroContent = [
          `# Retrospectiva ${week} — ${mod}`,
          ``,
          `## 📊 Métricas`,
          `- Horas totais: ${state.totalHours.toFixed(1)}h`,
          `- Sessões recentes: ${state.recentSessions.filter(s => s.module === mod).length}`,
          `- Weaknesses ativas: ${state.config.weaknesses.length}`,
          `- SRS pendentes: ${state.pendingSRS}`,
          ``,
          `## 🏆 Wins`,
          `- [ ] O que funcionou?`,
          `- [ ] Maior insight?`,
          ``,
          `## 🩹 Losses`,
          `- [ ] O que não funcionou?`,
          `- [ ] Weaknesses persistentes?`,
          ``,
          `## 🔧 Ajustes para próxima semana`,
          `1. `,
          `2. `,
          `3. `,
          ``,
          `## 🎯 Foco próxima semana`,
          `- Técnica principal: `,
          `- Meta de horas: `,
        ].join("\n");
        await writeModuleFile(ctx.cwd, mod, `retro-${week}.md`, retroContent);
      }

      await appendEvent(ctx.cwd, { type: "retro_done", data: { week, wins: [], losses: [], adjustments: [] } });
      pi.appendEntry("lori-event", { eventType: "retro_done", week });
      ctx.ui.notify(`📊 Retrospectiva ${week} iniciada. Artefatos criados.`, "info");

      pi.sendMessage(
        {
          customType: "lori-retro",
          content: `Retrospectiva semanal Lori (${week}):
1. O que funcionou?
2. O que não funcionou?
3. Quais weaknesses persistem?
4. Ajustes para próxima semana?
Use /skill:lori-retro para ritual completo.`,
          display: true,
        },
        { triggerTurn: true },
      );
    },
  });



  pi.registerCommand("lori-stats", {
    description: "Mostrar estatísticas Lori.",
    handler: async (_args, ctx) => {
      const state = getState();
      const techniques = [...new Set(state.recentSessions.map(s => s.technique))];
      const honestRate = state.recentSessions.length
        ? Math.round((state.recentSessions.filter(s => s.honest).length / state.recentSessions.length) * 100)
        : 0;
      const lines = [
        `📚 Módulos: ${state.config.activeModules.join(", ") || "nenhum"} | Progresso: ${state.planProgress}%`,
        `🔥 Streak: ${state.config.streakDays}d | Total: ${state.totalHours.toFixed(1)}h`,
        `⏱ Hoje: ${state.todayMinutes}/${state.config.dailyGoalMinutes}m | SRS: ${state.pendingSRS}`,
        `⚠ Weaknesses: ${state.config.weaknesses.length} (${state.config.weaknesses.reduce((s, w) => s + w.errors, 0)} erros)`,
        `🎯 Técnicas: ${techniques.join(", ") || "nenhuma"} | Honest: ${honestRate}%`,
      ];
      ctx.ui.notify(lines.join("\n"), "info");
    },
  });

  pi.registerCommand("lori-review-srs", {
    description: "Revisar flashcards SRS devidos.",
    handler: async (_args, ctx) => {
      pi.sendMessage(
        {
          customType: "lori-srs",
          content: "Iniciar revisão SRS. Use lori_review_srs com action=list_due para ver cards, depois review com quality 0-5.",
          display: true,
        },
        { triggerTurn: true },
      );
    },
  });

  pi.registerCommand("lori-weak", {
    description: "Listar pontos fracos ativos com contagem.",
    handler: async (_args, ctx) => {
      const state = getState();
      if (state.config.weaknesses.length === 0) {
        ctx.ui.notify("✅ Nenhuma weakness ativa", "success");
        return;
      }
      const lines = state.config.weaknesses.map((w, i) => `${i + 1}. ${w.concept} (${w.errors} erro${w.errors > 1 ? "s" : ""})`);
      ctx.ui.notify(`⚠ Weaknesses:\n${lines.join("\n")}`, "warning");
    },
  });

  pi.registerCommand("lori-resources", {
    description: "Listar recursos curados do módulo ativo.",
    handler: async (_args, ctx) => {
      const state = getState();
      const mod = state.config.activeModules[0];
      if (!mod) {
        ctx.ui.notify("Nenhum módulo ativo", "warning");
        return;
      }
      const content = await readModuleFile(ctx.cwd, mod, "resources.md");
      if (!content) {
        ctx.ui.notify(`Nenhum recurso em ${mod}`, "info");
        return;
      }
      const lines = content.split("\n").filter(Boolean).slice(0, 10);
      ctx.ui.notify(`📚 ${mod}:\n${lines.join("\n")}`, "info");
    },
  });
}

function getWeekKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const week = Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}
