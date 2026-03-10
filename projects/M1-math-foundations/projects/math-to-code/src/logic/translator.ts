/**
 * Translator - Substitui símbolos matemáticos por código JS
 * 
 * Input: { left: "true", op: "∧", right: "false" }
 * Output: { left: "true", op: "&&", right: "false" }
 */

import { ParsedExpression } from "./parser.ts";

export interface TranslatedExpression {
  left: string;
  operator: string;
  right: string;
  code: string; // "true && false"
}

// Mapeamento de símbolos matemáticos → operadores JS
const SYMBOL_MAP: Record<string, string> = {
  "∧": "&&",   // AND
  "∨": "||",   // OR
  "¬": "!",    // NOT
  "→": "???",  // IMPLIES - como representar em JS?
  "↔": "???",  // IFF - como representar em JS?
};

export function translate(parsed: ParsedExpression): TranslatedExpression {
  // TODO: Implementar tradução
  // Dica: Use SYMBOL_MAP para substituir operadores
  
  return { left: "", operator: "", right: "", code: "" };
}
