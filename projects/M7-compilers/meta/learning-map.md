# Learning Map: M7 Compilers (Semanas 66-69)

> **Plano tático** para as 4 semanas deste módulo. Para visão estratégica global, veja [master-learning-map](../../shared/master-learning-map.md).

---

## Pergunta Central do Módulo

**Como linguagens de programação funcionam?**

---

## Timeline

| Semana | Tema | Pergunta Guia | Entrega |
|--------|------|---------------|---------|
| 66-67 | Lexer & Parser | Como texto vira estrutura? | Lexer + Parser funcional |
| 68-69 | Interpreter | Como codigo e executado? | Interpreter com `let`, `if`, `fn` |

---

## Horas Estimadas

- Total: ~20h (4 semanas)
- Distribuição sugerida: 1h/dia, 5 dias/semana

---

## Entregas por Semana

**Semanas 66-67 (Lexer & Parser)**:
- Lexer tokenizando: números, strings, identificadores, operadores, keywords
- Parser gerando AST para expressões: `1 + 2 * 3`, `if (x > 0) { ... }`
- Testes unitários para lexer e parser

**Semanas 68-69 (Interpreter)**:
- Interpreter percorrendo AST (tree-walking)
- Suporte a: variáveis (`let`), condicionais (`if/else`), funções (`fn`)
- Chamadas de função funcionando
- Linguagem exemplo executando:
  ```
  let x = 5;
  fn add(a, b) { a + b }
  if (x > 3) { add(x, 10) }
  ```

---

## Recurso Principal

[Crafting Interpreters](https://craftinginterpreters.com/) — gratuito, excelente.

Siga os capítulos:
- Cap 4-6: Lexer & Parser (Semanas 66-67)
- Cap 7-10: Interpreter (Semanas 68-69)

---

## Métricas de Acompanhamento

| Semana | Status | Horas | Entrega |
|--------|--------|-------|---------|
| 66-67 | [ ] | | Lexer + Parser |
| 68-69 | [ ] | | Interpreter |

**Total M7**: 0/20h
