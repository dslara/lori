import type { Weakness } from "./memory.js";

/**
 * Lori skills registry
 * Maps skill names to ritual metadata
 */

export interface RitualMeta {
  name: string;
  description: string;
  durationMinutes: number;
  needsTimer: boolean;
  phase: "pre" | "core" | "post";
}

export const RITUALS: Record<string, RitualMeta> = {
  "lori-pomodoro": {
    name: "Pomodoro Foco Profundo",
    description: "Timer 50/10 com proteção de interrupções. Use antes de qualquer técnica.",
    durationMinutes: 50,
    needsTimer: true,
    phase: "pre",
  },
  "lori-decomposition": {
    name: "Decomposição 3D",
    description: "Quebrar objetivo em conceitos 40%, fatos 20%, procedimentos 40%.",
    durationMinutes: 30,
    needsTimer: false,
    phase: "pre",
  },
  "lori-retrieval": {
    name: "Quiz Adaptativo",
    description: "Active recall com perguntas baseadas em erros e weaknesses.",
    durationMinutes: 20,
    needsTimer: false,
    phase: "core",
  },
  "lori-feynman": {
    name: "Técnica Feynman",
    description: "Explicar como para criança de 12 anos. Identificar gaps.",
    durationMinutes: 30,
    needsTimer: false,
    phase: "core",
  },
  "lori-drill": {
    name: "Repetição Deliberada",
    description: "Prática com progressão de nível. Erro → análise → repetição.",
    durationMinutes: 40,
    needsTimer: true,
    phase: "core",
  },
  "lori-srs": {
    name: "SRS Flashcards",
    description: "Revisão espaçada SM-2. Revisar cards devidos.",
    durationMinutes: 15,
    needsTimer: false,
    phase: "core",
  },
  "lori-directness": {
    name: "Projeto Real",
    description: "Aprender fazendo. Review socrático a cada 20min.",
    durationMinutes: 60,
    needsTimer: true,
    phase: "core",
  },
  "lori-stuck": {
    name: "Desbloqueio Socrático",
    description: "5 perguntas quando travar. Nunca dá a resposta direta.",
    durationMinutes: 15,
    needsTimer: false,
    phase: "core",
  },
  "lori-retro": {
    name: "Retrospectiva Semanal",
    description: "Review de semana: o que funcionou, ajustes, próxima semana.",
    durationMinutes: 20,
    needsTimer: false,
    phase: "post",
  },
};

export function getRitual(name: string): RitualMeta | undefined {
  return RITUALS[name];
}

export function listRituals(): RitualMeta[] {
  return Object.values(RITUALS);
}

export function suggestRitual(weaknesses: Weakness[], technique?: string): string {
  if (technique && RITUALS[technique]) return technique;
  if (weaknesses.length > 3) return "lori-drill";
  if (weaknesses.length > 0) return "lori-retrieval";
  return "lori-feynman";
}
