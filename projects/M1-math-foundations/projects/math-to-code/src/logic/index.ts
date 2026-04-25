/**
 * math-to-code - Tradutor de símbolos matemáticos para código JavaScript
 */

import { tokenize } from "./tokenizer.ts";
import { parse } from "./parser.ts";
import { translate } from "./translator.ts";
import { evaluate } from "./evaluator.ts";

export function translateLogic(input: string) {
  // TODO: Conectar todas as etapas
  // 1. Tokenizar
  // 2. Parsear
  // 3. Traduzir
  // 4. Avaliar
  
  return { result: false, translation: "" };
}

// Teste
console.log(translateLogic("true ∧ false"));
