/**
 * Tokenizer - Quebra a string em tokens
 * 
 * Input: "true ∧ false"
 * Output: ["true", "∧", "false"]
 */

export interface Token {
  type: "literal" | "operator";
  value: string;
}

export function tokenize(input: string): Token[] {
  // TODO: Implementar tokenização
  // Dica: Use input.split() ou regex para separar os tokens
  // Dica: Identifique se é literal (true/false) ou operador (∧, ∨, ¬, →, ↔)
  
  return [];
}
