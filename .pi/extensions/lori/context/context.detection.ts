/**
 * Lori context detection
 */

// Keywords that trigger Lori context injection
export const STUDY_KEYWORDS = [
  "estudar", "estudo", "aprender", "aprendizagem", "curso", "módulo",
  "flashcard", "srs", "pomodoro", "feynman", "drill", "revisar",
  "conceito", "exercício", "prova", "benchmark", "weakness",
  "revisão", "retrospectiva", "timer",
];

// Keywords that detect user is stuck
export const STUCK_KEYWORDS = [
  "travei", "travado", "não consigo", "não entendo", "não sei",
  "bloqueado", "perdido", "desisti", "desisto", "impossível",
];

export function isStudyContext(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return STUDY_KEYWORDS.some((k) => lower.includes(k));
}

export function isStuckContext(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return STUCK_KEYWORDS.some((k) => lower.includes(k));
}
