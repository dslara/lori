/**
 * Lori Module Wizard
 * Interactive TUI questionnaire for creating a new study module.
 * Adapts the Pi SDK questionnaire pattern for Lori-specific questions.
 */

import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { Editor, type EditorTheme, Key, matchesKey, truncateToWidth } from "@mariozechner/pi-tui";

export interface WizardAnswers {
  topic: string;
  objective: string;
  timeCommitment: string;
  level: string;
  prerequisites: string;
}

interface WizardQuestion {
  id: keyof WizardAnswers;
  label: string;
  prompt: string;
  options: { value: string; label: string; description?: string }[];
  allowOther: boolean;
}

interface WizardAnswer {
  id: keyof WizardAnswers;
  value: string;
  label: string;
  wasCustom: boolean;
}

const QUESTIONS: WizardQuestion[] = [
  {
    id: "topic",
    label: "Tópico",
    prompt: "Qual tópico você quer aprender?",
    options: [],
    allowOther: true,
  },
  {
    id: "objective",
    label: "Objetivo",
    prompt: "Qual seu objetivo final mensurável? (ex: ser capaz de construir uma API REST em Go)",
    options: [],
    allowOther: true,
  },
  {
    id: "timeCommitment",
    label: "Tempo",
    prompt: "Em quantas semanas e horas/semana você pretende estudar?",
    options: [
      { value: "4 semanas, ~6h/semana", label: "4 semanas, ~6h/semana" },
      { value: "6 semanas, ~6h/semana", label: "6 semanas, ~6h/semana" },
      { value: "8 semanas, ~6h/semana", label: "8 semanas, ~6h/semana" },
      { value: "12 semanas, ~6h/semana", label: "12 semanas, ~6h/semana" },
    ],
    allowOther: true,
  },
  {
    id: "level",
    label: "Nível",
    prompt: "Qual seu nível atual no assunto?",
    options: [
      { value: "iniciante", label: "Iniciante", description: "Nunca tive contato ou muito pouco" },
      { value: "intermediario", label: "Intermediário", description: "Já vi superficialmente, quero aprofundar" },
      { value: "avancado", label: "Avançado", description: "Já uso no dia a dia, quero dominar edge cases" },
    ],
    allowOther: true,
  },
  {
    id: "prerequisites",
    label: "Contexto",
    prompt: "Há pré-requisitos ou contexto específico? (ex: já sei Python, quero focar em concorrência)",
    options: [{ value: "nenhum", label: "Nenhum pré-requisito específico" }],
    allowOther: true,
  },
];

export async function runModuleWizard(ctx: ExtensionCommandContext): Promise<WizardAnswers | null> {
  if (!ctx.hasUI) {
    ctx.ui.notify("UI não disponível. Use /lori-plan [nome] para criar módulo manualmente.", "warning");
    return null;
  }

  const result = await ctx.ui.custom<{ answers: WizardAnswer[]; cancelled: boolean }>((tui, theme, _kb, done) => {
    let currentTab = 0;
    let optionIndex = 0;
    let inputMode = false;
    let inputQuestionId: keyof WizardAnswers | null = null;
    let cachedLines: string[] | undefined;
    const answers = new Map<keyof WizardAnswers, WizardAnswer>();

    const totalTabs = QUESTIONS.length + 1; // questions + Submit

    const editorTheme: EditorTheme = {
      borderColor: (s) => theme.fg("accent", s),
      selectList: {
        selectedPrefix: (t) => theme.fg("accent", t),
        selectedText: (t) => theme.fg("accent", t),
        description: (t) => theme.fg("muted", t),
        scrollInfo: (t) => theme.fg("dim", t),
        noMatch: (t) => theme.fg("warning", t),
      },
    };
    const editor = new Editor(tui, editorTheme);

    function refresh() {
      cachedLines = undefined;
      tui.requestRender();
    }

    function submit(cancelled: boolean) {
      done({ answers: Array.from(answers.values()), cancelled });
    }

    function currentQuestion(): WizardQuestion | undefined {
      return QUESTIONS[currentTab];
    }

    function currentOptions(): Array<{ value: string; label: string; description?: string; isOther?: boolean }> {
      const q = currentQuestion();
      if (!q) return [];
      const opts = [...q.options];
      if (q.allowOther) {
        opts.push({ value: "__other__", label: "Digite algo...", isOther: true });
      }
      return opts;
    }

    function allAnswered(): boolean {
      return QUESTIONS.every((q) => answers.has(q.id));
    }

    function advanceAfterAnswer() {
      if (currentTab < QUESTIONS.length - 1) {
        currentTab++;
      } else {
        currentTab = QUESTIONS.length; // Submit tab
      }
      optionIndex = 0;
      refresh();
    }

    function saveAnswer(
      id: keyof WizardAnswers,
      value: string,
      label: string,
      wasCustom: boolean,
    ) {
      answers.set(id, { id, value, label, wasCustom });
    }

    editor.onSubmit = (value) => {
      if (!inputQuestionId) return;
      const trimmed = value.trim() || "(sem resposta)";
      saveAnswer(inputQuestionId, trimmed, trimmed, true);
      inputMode = false;
      inputQuestionId = null;
      editor.setText("");
      advanceAfterAnswer();
    };

    function handleInput(data: string) {
      if (inputMode) {
        if (matchesKey(data, Key.escape)) {
          inputMode = false;
          inputQuestionId = null;
          editor.setText("");
          refresh();
          return;
        }
        editor.handleInput(data);
        refresh();
        return;
      }

      const q = currentQuestion();
      const opts = currentOptions();

      // Tab navigation
      if (matchesKey(data, Key.tab) || matchesKey(data, Key.right)) {
        currentTab = (currentTab + 1) % totalTabs;
        optionIndex = 0;
        refresh();
        return;
      }
      if (matchesKey(data, Key.shift("tab")) || matchesKey(data, Key.left)) {
        currentTab = (currentTab - 1 + totalTabs) % totalTabs;
        optionIndex = 0;
        refresh();
        return;
      }

      // Submit tab
      if (currentTab === QUESTIONS.length) {
        if (matchesKey(data, Key.enter) && allAnswered()) {
          submit(false);
        } else if (matchesKey(data, Key.escape)) {
          submit(true);
        }
        return;
      }

      // Option navigation
      if (matchesKey(data, Key.up)) {
        optionIndex = Math.max(0, optionIndex - 1);
        refresh();
        return;
      }
      if (matchesKey(data, Key.down)) {
        optionIndex = Math.min(opts.length - 1, optionIndex + 1);
        refresh();
        return;
      }

      // Select option
      if (matchesKey(data, Key.enter) && q) {
        const opt = opts[optionIndex];
        if (opt?.isOther) {
          inputMode = true;
          inputQuestionId = q.id;
          editor.setText("");
          refresh();
          return;
        }
        if (opt) {
          saveAnswer(q.id, opt.value, opt.label, false);
          advanceAfterAnswer();
        }
        return;
      }

      // Cancel
      if (matchesKey(data, Key.escape)) {
        submit(true);
      }
    }

    function render(width: number): string[] {
      if (cachedLines) return cachedLines;

      const lines: string[] = [];
      const q = currentQuestion();
      const opts = currentOptions();
      const add = (s: string) => lines.push(truncateToWidth(s, width));

      add(theme.fg("accent", "─".repeat(width)));

      // Tab bar
      const tabs: string[] = ["← "];
      for (let i = 0; i < QUESTIONS.length; i++) {
        const isActive = i === currentTab;
        const isAnswered = answers.has(QUESTIONS[i].id);
        const lbl = QUESTIONS[i].label;
        const box = isAnswered ? "■" : "□";
        const color = isAnswered ? "success" : "muted";
        const text = ` ${box} ${lbl} `;
        const styled = isActive ? theme.bg("selectedBg", theme.fg("text", text)) : theme.fg(color, text);
        tabs.push(`${styled} `);
      }
      const canSubmit = allAnswered();
      const isSubmitTab = currentTab === QUESTIONS.length;
      const submitText = " ✓ Criar módulo ";
      const submitStyled = isSubmitTab
        ? theme.bg("selectedBg", theme.fg("text", submitText))
        : theme.fg(canSubmit ? "success" : "dim", submitText);
      tabs.push(`${submitStyled} →`);
      add(` ${tabs.join("")}`);
      lines.push("");

      function renderOptions() {
        for (let i = 0; i < opts.length; i++) {
          const opt = opts[i];
          const selected = i === optionIndex;
          const isOther = opt.isOther === true;
          const prefix = selected ? theme.fg("accent", "> ") : "  ";
          const color = selected ? "accent" : "text";
          if (isOther && inputMode) {
            add(prefix + theme.fg("accent", `${i + 1}. ${opt.label} ✎`));
          } else {
            add(prefix + theme.fg(color, `${i + 1}. ${opt.label}`));
          }
          if (opt.description) {
            add(`     ${theme.fg("muted", opt.description)}`);
          }
        }
      }

      if (inputMode && q) {
        add(theme.fg("text", ` ${q.prompt}`));
        lines.push("");
        renderOptions();
        lines.push("");
        add(theme.fg("muted", " Sua resposta:"));
        for (const line of editor.render(width - 2)) {
          add(` ${line}`);
        }
        lines.push("");
        add(theme.fg("dim", " Enter para confirmar • Esc para voltar"));
      } else if (currentTab === QUESTIONS.length) {
        add(theme.fg("accent", theme.bold(" Pronto para criar o módulo")));
        lines.push("");
        for (const question of QUESTIONS) {
          const answer = answers.get(question.id);
          if (answer) {
            const prefix = answer.wasCustom ? "(digitado) " : "";
            add(`${theme.fg("muted", ` ${question.label}: `)}${theme.fg("text", prefix + answer.label)}`);
          }
        }
        lines.push("");
        if (allAnswered()) {
          add(theme.fg("success", " Pressione Enter para criar"));
        } else {
          const missing = QUESTIONS.filter((q) => !answers.has(q.id))
            .map((q) => q.label)
            .join(", ");
          add(theme.fg("warning", ` Faltando: ${missing}`));
        }
      } else if (q) {
        add(theme.fg("text", ` ${q.prompt}`));
        lines.push("");
        renderOptions();
      }

      lines.push("");
      if (!inputMode) {
        add(theme.fg("dim", " Tab/←→ navegar • ↑↓ selecionar • Enter confirmar • Esc cancelar"));
      }
      add(theme.fg("accent", "─".repeat(width)));

      cachedLines = lines;
      return lines;
    }

    return {
      render,
      invalidate: () => {
        cachedLines = undefined;
      },
      handleInput,
    };
  });

  if (result.cancelled || !allQuestionsAnswered(result.answers)) {
    return null;
  }

  const map = new Map(result.answers.map((a) => [a.id, a.value]));
  return {
    topic: map.get("topic")!,
    objective: map.get("objective")!,
    timeCommitment: map.get("timeCommitment")!,
    level: map.get("level")!,
    prerequisites: map.get("prerequisites")!,
  };
}

function allQuestionsAnswered(answers: WizardAnswer[]): boolean {
  const ids = new Set(answers.map((a) => a.id));
  return QUESTIONS.every((q) => ids.has(q.id));
}

function parseWeeks(timeCommitment: string): number {
  const match = timeCommitment.match(/(\d+)\s*semanas?/i);
  return match ? parseInt(match[1], 10) : 4;
}

/**
 * Build a prompt message for the agent to generate the full plan based on wizard answers.
 */
export function buildAgentPrompt(answers: WizardAnswers, moduleSlug: string): string {
  const weeks = parseWeeks(answers.timeCommitment);
  return `Crie um plano de estudo Lori completo para o módulo "${moduleSlug}" com base nas seguintes respostas do usuário:

**Tópico:** ${answers.topic}
**Objetivo:** ${answers.objective}
**Tempo disponível:** ${answers.timeCommitment}
**Nível atual:** ${answers.level}
**Pré-requisitos/Contexto:** ${answers.prerequisites}

Gere e salve os seguintes arquivos usando as tools write/edit do Pi:

1. \`.lori/modules/${moduleSlug}/plan.md\` com:
   - Objetivo claro e mensurável
   - Decomposição 3D: Conceitos (40%), Fatos (20%), Procedimentos (40%) — cada um com checkboxes
   - Tabela de semanas com Foco, Técnica e Benchmark Parcial
   - Benchmark de conclusão
   - Link para resources.md

2. \`.lori/modules/${moduleSlug}/resources.md\` com recursos curados organizados por:
   - **Conceitos**: links/docs para entender o "como/por que" (ler ativo, analisar)
   - **Fatos**: tabelas, referências rápidas, sintaxe para decorar (decorar, consultar)
   - **Procedimentos**: tutoriais, exemplos de código para replicar (codar, analisar)
   Cada recurso deve ter: título, tag de semana, tipo (conceito/fato/procedimento) e nota de uso obrigatória (ler/codar/consultar/decorar/analisar + tempo estimado).
   Use placeholders ??? quando não souber um recurso específico.

3. \`.lori/modules/${moduleSlug}/week-01.md\` até \`week-${String(weeks).padStart(2, "0")}.md\` (exatamente ${weeks} semanas), cada uma com:
   - Objetivo da semana
   - Listas de checkboxes para Conceitos, Fatos e Procedimentos daquela semana
   - Seção **Recursos da semana** linkando para os recursos em resources.md
   - Benchmark parcial e Notas

Use o template e estrutura já existentes no Lori.`;
}

/**
 * Generate a URL-friendly slug from the topic string.
 */
export function slugifyTopic(topic: string): string {
  return topic
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 40);
}
