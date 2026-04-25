# M7: Compilers

**Objetivo**: Entender como linguagens de programação funcionam implementando um interpreter do zero.

**Semanas**: 66-69 (4 semanas, ~20h)  
**Pré-requisitos**: M2 (implementação em Zig), M3 recomendado (AST é uma árvore)  
**Módulo anterior**: [M6: Networking + DB](../M6-networking-db/README.md)  
**Próximo módulo**: [M8: Capstone](../M8-capstone/README.md)

---

## O que você vai aprender

- Lexer: tokenizar código fonte em tokens significativos
- Parser: tokens → AST (Abstract Syntax Tree) por Recursive Descent
- Interpreter: executar código percorrendo a AST
- Implementar uma linguagem com `let`, `if`, `fn` funcionando
- **Resultado**: Linguagem interpretada funcional do zero em Zig

---

## Pré-requisitos (checklist)

Antes de começar M7, confirme:
- [ ] Conheço enums e pattern matching em Zig (M2)
- [ ] Entendo árvores e BST: inserção, busca, traversal (M3)
- [ ] Conheço recursão: call stack, casos base, recursão mútua (M4)
- [ ] Benchmarks Q1, Q2 e Q3 concluídos

---

## Timeline Semanal

| Semana | Tema | Pergunta Central |
|--------|------|-----------------|
| 66-67 | Lexer & Parser | Como texto vira estrutura? |
| 68-69 | Interpreter | Como codigo e executado? |

---

## Arquivos deste módulo

```
meta/
├── phase-6-overview.md              # Visão completa do phase (compartilhada com M8)
├── week-66-67-lexer-parser.md
└── week-68-69-interpreter.md
```

---

## Benchmark de conclusão

Ao terminar M7, você deve conseguir:
- [ ] Lexer funcional tokenizando código básico
- [ ] Parser gerando AST correta para expressões e statements
- [ ] Interpreter executando: `let x = 5; if (x > 3) { fn add(a, b) { a + b } }`
- [ ] Explicar a diferença entre compilação e interpretação

---

## Conexões com outros módulos

- **M2 (Zig Foundations)**: Enums e pattern matching — essenciais para AST node types
- **M3 (Data Structures)**: AST é uma árvore — revisitar Trees & BST traversal
- **M4 (Algorithms)**: Recursive Descent usa recursão diretamente — revisitar M4 Semana 36-37
- **M8 (Capstone)**: Opção "Language" no Capstone é extensão direta deste módulo

---

## Retrieval de módulos anteriores

**Semana 66 deste modulo** (antes de comecar):
- [ ] Quiz M5 (10 min): "Explique como goroutines funcionam. Diferenca para thread OS?"
- [ ] Quiz M3 (5 min): "Como funciona tree traversal in-order? Escreva o código de cabeça."
- [ ] Quiz M4 (5 min): "O que é recursão mútua? Dê um exemplo."

---

## Como começar

```
echo "M7-compilers" > .current-topic
/ul-study-start
```

Comece por `meta/phase-6-overview.md`, depois `meta/week-66-67-lexer-parser.md`.

**Recurso principal**: [Crafting Interpreters](https://craftinginterpreters.com/) (gratuito)
