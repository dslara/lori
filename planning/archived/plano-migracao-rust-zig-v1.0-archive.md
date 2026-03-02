# Plano: Migracao Rust -> Zig (CS Fundamentals)

Este documento descreve o plano para trocar Rust por Zig no modulo `foundations-of-computing` (CS Fundamentals), com ajustes no cronograma e sugestoes de refinamento.

Status: NAO APLICADO (somente planejamento).

## Decisoes

- Escopo: Zig substitui Rust apenas nas Fases 1-4 (fundamentos, DS, algoritmos, avancado)
- Go: mantido para Systems/Concorrencia (Fases 5A-5B) e continua no pipeline
- Profundidade Zig: moderada (allocators, ponteiros, slices, erros; sem inline asm)
- Mini-projetos: reimaginados para explorar `comptime` e a ergonomia de Zig
- Timeline: ajustar para reduzir friccao e tempo total (proposta: 80 semanas em vez de 88)

## Objetivos da troca

- Priorizar fundamentos de CS (memoria, representacoes, trade-offs) vs detalhes especificos do modelo de ownership de Rust
- Reduzir tempo gasto em "workarounds" de borrow checker em arvores/grafos
- Aumentar transparencia: alocacao e liberacao explicitas, custo mental menor
- Manter sustentabilidade do programa (buffers + benchmarks) e qualidade de pratica

## Timeline proposta (80 semanas)

Base: manter F0 e buffers; encurtar F1 e F2; manter F3 e F4; manter Go/Systems.

- F0 Math Foundations: Sem 1-5 (5w)
- Buffer 1: Sem 6 (1w)
- F1 Zig Foundations (memoria + Zig core): Sem 7-12 (6w)  [antes: Rust 7-14 (8w)]
- Mini-Projeto 1: Sem 13 (1w)  [antes: Sem 15]
- Buffer 2: Sem 14 (1w)        [antes: Sem 16]
- F2 Data Structures (em Zig): Sem 15-24 (10w) [antes: 17-28 (12w)]
- Mini-Projeto 2: Sem 25 (1w)  [antes: Sem 29]
- Buffer 3: Sem 26 (1w)        [antes: Sem 30]
- F3 Algorithms (em Zig): Sem 27-38 (12w)      [duracao mantida]
- Mini-Projeto 3: Sem 39 (1w)  [antes: Sem 43]
- Buffer 4: Sem 40 (1w)        [antes: Sem 44]
- F4 Advanced Zig + DP: Sem 41-44 (4w)         [antes: Advanced Rust + DP 45-48]
- Buffer 5: Sem 45 (1w)        [antes: Sem 49]
- F5A Go Foundations: Sem 46-49 (4w)           [duracao mantida]
- F5B Systems: Sem 50-63 (14w)                 [duracao mantida]
- Buffer 6: Sem 64 (1w)        [antes: Sem 68]
- F6 Compilers + Capstone: Sem 65-80 (16w)     [antes: 69-86 (18w)]
- Buffers finais: manter reserva (ajustar para caber no total se necessario)

Observacao: os indices acima sao uma proposta. A aplicacao do plano deve atualizar todos os arquivos que fixam numeracao.

## Conteudo por fase (proposta)

### F1: Zig Foundations (6 semanas)

Objetivo: dominar memoria em Zig o suficiente para implementar DS do zero com confianca.

- Semana 7: Zig basics + modelo de memoria
  - Tooling: `zig build`, `zig test`, estrutura de projeto
  - Conceitos: stack vs heap (conceitual), slices, `defer`

- Semana 8: ponteiros + optionals
  - Conceitos: `*T`, `?*T`, `?T`, aliasing e invariantes
  - Exercicios: lista ligada minima

- Semana 9: error handling + intro `comptime`
  - Conceitos: `error{}`, `!T`, `try`, `catch`, `errdefer`
  - Meta: explicar fluxo de erro sem excecoes

- Semana 10: structs/enums/unions + testes
  - Conceitos: `struct`, `enum`, tagged union, testes unitarios

- Semana 11: memory deep dive
  - Conceitos: size/alignment/padding, layout previsivel, impactos em cache

- Semana 12: allocators + ArrayList do zero
  - Conceitos: allocator interface, arena vs gpa, crescimento amortizado
  - Entrega: `MyArrayList(T)` com `push/pop/get` + testes

Benchmark (F1): desenhar e explicar o fluxo de alocacao/liberacao em um DS simples e prever bugs comuns (dangling pointer, double free, leak).

### Mini-Projeto 1 (reimaginado)

"Arena allocator + instrumentacao":

- Implementar um arena allocator simples
- Instrumentar contagem de bytes alocados e resets
- Usar em 2-3 estruturas (por ex: BST e adjacency list) e comparar custos

### F2: Data Structures (10 semanas)

Foco: implementacao do zero + analise de custo.

- Arrays/slices/ArrayList
- Linked lists (singly/doubly) com ponteiros explicitos
- Stacks/queues (inclui ring buffer)
- Hash tables (open addressing ou chaining; decidir na execucao)
- Trees/BST/AVL (sem friccao de ownership)
- Heaps/Union-Find
- Grafos (representacao e basicos)

Benchmark Q1: implementar N estruturas do zero em tempo limitado (com testes) + justificar trade-offs.

### Mini-Projeto 2 (reimaginado)

"Comptime-driven parser/decoder":

- Um parser simples (JSON-lite ou key=value) que mapeia para `struct` via `comptime`/type introspection
- Objetivo: aprender compile-time vs runtime e validacao de schema

### F3: Algorithms (12 semanas)

Manter duracao; adaptar exemplos para Zig.

- Sorting basico/avancado
- Binary search + greedy
- Recursao + stack
- Grafos: BFS/DFS/Dijkstra
- Analise de complexidade + pratica (metas de problemas)

### Mini-Projeto 3 (reimaginado)

"Benchmark generator":

- Suite de benchmarks para algoritmos (gerar casos, medir tempo, plot opcional via export)
- Enfase: comparar implementacoes e custos (tempo/espaco)

### F4: Advanced Zig + DP (4 semanas)

Substituir "traits/generics" de Rust por generics + `comptime` em Zig.

- `comptime` patterns: type functions, validacao, geracao de codigo/testes
- DP: memoizacao/tabulacao; selecionar 5-8 problemas representativos

## Atualizacoes de documentacao (quando aplicar)

### Principais arquivos a revisar

- `foundations-of-computing/meta/learning-map.md`
- `shared/master-learning-map.md`
- `foundations-of-computing/meta/phase-1-overview.md` (reescrever para Zig)
- Semanas: `foundations-of-computing/meta/week-*.md` (especialmente weeks 7-48)
- Mini-projetos: `foundations-of-computing/meta/mini-project-*.md`
- Guias gerais: `2-GUIDE-FOCUS.md`, `3-GUIDE-DIRECTNESS.md`, `4-GUIDE-DRILL.md`, `5-GUIDE-RETRIEVAL.md`, `6-GUIDE-FEEDBACK.md`, `8-GUIDE-FEYNMAN.md`, `9-GUIDE-EXPERIMENTATION.md`, `7-GUIDE-FLASHCARDS.md`, `GUIDES-INDEX.md`
- Conexoes em `01-math-foundations/README.md`
- Agentes: `.opencode/agents/tutor.md`, `.opencode/agents/meta.md`

### Definicao de "remover referencias a Rust"

- Substituir exemplos de codigo `rust` por `zig`
- Trocar objetivos/benchmarks que medem conhecimento de ownership/lifetimes por objetivos de memoria/allocators
- Atualizar recursos (Rust Book/Rustlings -> Zig docs/Ziglings)
- Manter referencias a Rust apenas onde fizer sentido historico/comparativo (opcional; idealmente em uma secao "comparacao")

## Recursos Zig (proposta)

Tier 1:

- Zig Documentation (Language Reference)
- Ziglings
- Zig by Example (ou colecao equivalente)
- Leitura do codigo da stdlib (secoes selecionadas)

Tier 2:

- Posts/talks sobre `comptime` e allocators
- Estudos de caso de CLIs simples em Zig

## Checklist de validacao (quando aplicar)

- Grep: nenhuma referencia a Rust dentro do escopo F1-F4 (exceto secao comparativa, se existir)
- Numeracao/links: semanas e referencias cruzadas consistentes
- Benchmarks: ainda factiveis em 1h/dia
- Projetos: definidos com entregas testaveis (`zig test`)
- Go/Systems: comparacao atualizada (Zig vs Go), nao (Rust vs Go)

## Sugestoes de refinamento (nao aplicadas)

1. Criar um "Zig cheat sheet" do modulo
   - Sintaxe minima, slices, allocators comuns, erros, `comptime` basico

2. Definir uma regra de alocacao por fase
   - F1: `std.heap.GeneralPurposeAllocator`
   - F2: alternar arena vs gpa (para sentir trade-offs)
   - F3/F4: escolher allocator por problema, justificar no log

3. Consolidar pratica de testes
   - Toda entrega semanal inclui pelo menos 5 testes pequenos
   - Uma sessao quinzenal so de refactor + testes

4. Replanejar mini-projetos para maximizar aprendizado
   - Cada mini-projeto deve ensinar 1 conceito "unico" de Zig (allocator model, `comptime`, slices/sentinels)

5. Ajustar metas de LeetCode por fase
   - Manter a quantidade, mas adicionar regra: reimplementar 1 solucao por semana sem consulta e explicar complexidade

6. Documentar criterios de "moderado" low-level
   - Permitido: ponteiros, allocators, `@sizeOf`, `@alignOf`, layouts
   - Evitar por enquanto: inline asm, SIMD manual, hacking de UB
