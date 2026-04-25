/**
 * Parser - Entende a estrutura da expressão
 * 
 * Input: ["true", "∧", "false"]
 * Output: { left: "true", op: "∧", right: "false" }
 */

import { Token } from "./tokenizer.ts";

export interface ParsedExpression {
  left: string;
  operator: string;
  right: string;
}

export function parse(tokens: Token[]): ParsedExpression {
  // TODO: Implementar parsing
  // Dica: Assuma que tokens[0] = left, tokens[1] = op, tokens[2] = right
  
  return { left: "", operator: "", right: "" };
}
