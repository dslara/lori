import { LoriCommand, LoriCommandRegister } from "./commands.model";
import { LoriOptions } from "../core/core.model";
import { appendEvent, ensureLoriDir } from "../events/events.persistence";
import { rebuildState } from "../events/events.projection";
import { LoriEvents } from "../events/events.model";
import { loadConfig, saveConfig } from "../core/core.config";
import { writeModuleFile, readModuleFile } from "../modules/modules.io";
import { updateStatus } from "../ui/ui.status-bar";
import { runModuleWizard, buildAgentPrompt, slugifyTopic } from "../ui/ui.wizard";

export const loriCmdPlan = ({
  pi,
  getState,
  setState,
}: LoriOptions): LoriCommandRegister => [
  LoriCommand.PLAN,
  {
    description: "Criar plano de módulo via wizard. Uso: /lori-plan",
    handler: async (_args, ctx) => {
      const answers = await runModuleWizard(ctx);
      if (!answers) {
        ctx.ui.notify("Wizard cancelado. Nenhum módulo criado.", "warning");
        return;
      }

      const module = slugifyTopic(answers.topic);
      await ensureLoriDir(ctx.cwd);

      const existing = await readModuleFile(ctx.cwd, module, "plan.md");
      if (existing) {
        ctx.ui.notify(`Módulo "${module}" já existe. Use read para ver.`, "warning");
        return;
      }

      const draft = `# Draft: ${module}\n\n**Tópico:** ${answers.topic}\n**Objetivo:** ${answers.objective}\n**Tempo:** ${answers.timeCommitment}\n**Nível:** ${answers.level}\n**Pré-requisitos:** ${answers.prerequisites}\n`;
      await writeModuleFile(ctx.cwd, module, "plan-draft.md", draft);

      const resourcesTemplate = `# Recursos Curados — ${module}\n\nLegenda de uso:\n- **LER**: leitura passiva, extrair ideias\n- **CODAR**: codar junto, pausar e testar\n- **CONSULTAR**: abrir quando travar, não ler antes\n- **DECORAR**: memorizar tabela/fato exato\n- **ANALISAR**: ler código existente, identificar padrões\n\nNota: substitua \`<pi-install>\` pelo path da instalação do Pi e \`<projeto>\` pelo root do projeto estudado.\n\n---\n\n## Conceitos\n- [ ] ??? — tag: semana-1, conceito: [tópico], ler-ativo\n  Notas: buscar recurso sobre...\n\n## Fatos\n- [ ] ??? — tag: semana-1, fato: [tópico], decorar\n  Notas: buscar referência rápida sobre...\n\n## Procedimentos\n- [ ] ??? — tag: semana-1, procedimento: [tópico], codar\n  Notas: buscar tutorial prático sobre...\n`;
      await writeModuleFile(ctx.cwd, module, "resources.md", resourcesTemplate);

      const config = await loadConfig(ctx.cwd);
      if (!config.activeModules.includes(module)) {
        config.activeModules.push(module);
        await saveConfig(ctx.cwd, config);
      }

      await appendEvent(ctx.cwd, {
        type: LoriEvents.PLAN_CREATED,
        data: { module, weeks: 0, goals: [answers.objective] },
      });
      pi.appendEntry("lori-event", { eventType: LoriEvents.PLAN_CREATED, module, wizard: true });

      ctx.ui.notify(
        `🧙 Módulo "${module}" criado via wizard. Draft + resources template prontos. Aguardando geração do plano...`,
        "info",
      );

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
  },
];
