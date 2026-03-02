# Plano: Migração Rust → Zig (CS Fundamentals) - v2.1

**Status**: ✅ Implementado  
**Data**: 2026-03-02  
**Versão**: 2.1 (correções estruturais)  
**Baseado em**: `plano-migracao-rust-zig-v2.0.md`

---

## 📋 Resumo Executivo

Este documento descreve o plano para migrar de Rust para Zig no módulo `foundations-of-computing`, focando em fundamentos de CS (memória, estruturas de dados, algoritmos) com uma linguagem que prioriza transparência e menor fricção pedagógica.

**Mudanças principais vs v2.0**:
- ✅ Timeline restaurada para 88 semanas (mantendo buffers finais)
- ✅ F2 restaurada para 12 semanas com Heaps + Union-Find
- ✅ F6 mantida em 18 semanas (capstone não corta)
- ✅ Semana 0 Zig adicionada (setup + Ziglings antes de F1)
- ✅ Estratégia LeetCode definida (Python para LC, Zig para impl local)
- ✅ Todos os links de recursos validados
- ✅ Justificativa para redução de 8w vs v2.0

---

## 🎯 Decisões Fundamentais

| Decisão | Detalhe |
|---------|---------|
| **Escopo** | Zig substitui Rust apenas em F1-F4 (fundamentos, DS, algoritmos, avançado) |
| **Go mantido** | F5A-F5B (Systems/Concorrência) sem mudanças |
| **Profundidade Zig** | Moderada: allocators, ponteiros, slices, erros, comptime; sem inline asm |
| **Timeline** | 88 semanas (mesmo que Rust original) — **sim, Zig é nova, sem cortes** |
| **Mini-projetos** | Reimaginados para explorar Zig especificamente |
| **F2 Heaps** | **Restauradas** — fundação para heap sort (F3) e Dijkstra (F3) |
| **Prática de Algoritmos** | Python/Go em LeetCode + reimplementação em Zig localmente |

---

## 🎯 Objetivos da Migração

### Por que Zig?

| Objetivo | Rust | Zig |
|----------|------|-----|
| Foco em fundamentos de CS | ❌ Distração com ownership/lifetimes | ✅ Memória explícita, sem mágica |
| Fricção em árvores/grafos | ❌ Alto (borrow checker) | ✅ Baixo (ponteiros explícitos) |
| Transparência | ⚠️ Média (hidden control flow) | ✅ Alta (tudo explícito) |
| Custo mental | Alto | Médio |
| Curva de aprendizado | Íngreme | Moderada |

### O que NÃO muda

- F0 (Math Foundations) — sem alterações
- F5A-F5B (Go/Systems) — sem alterações
- F6 (Compilers + Capstone) — sem alterações
- Buffers estratégicos — mantidos (8 semanas)
- Metodologia Ultralearning — mantida

### Por que NÃO cortar para 80 semanas?

v2.0 propunha 80w (economizar 8w). **Motivos para reverter a 88w**:

1. **Zig é linguagem nova para ti** → maior curva de aprendizado, não menor
2. **F1 + F2 juntas exigem domínio sólido** → 6w F1 é pouco para linguagem nova
3. **Heaps são pré-requisito pedagógico** → não é opção cortar, é necessário
4. **Buffers finais são rede de segurança** → projeto de 22 meses precisa deles
5. **Histórico: sempre atraso em linguagens novas** → manter margem
6. **LeetCode requer prática extra** → reimplementar em Zig = tempo adicional

**Conclusão**: Melhor planejar 88w conservador (risco baixo de desvio) do que 80w otimista (risco alto).

---

## 📅 Timeline (88 semanas)

### Visão Geral

```
F0 Math ────────────── 5w  (Sem 1-5)
Buffer 1 ───────────── 1w  (Sem 6)
Zig Setup ──────────── 1w  (Sem 7) [NOVO]
F1 Zig Foundations ─── 6w  (Sem 8-13)
Mini-Projeto 1 ──────── 1w  (Sem 14)
Buffer 2 ───────────── 1w  (Sem 15)
F2 Data Structures ─── 12w (Sem 16-27) [+2w vs v2.0: Heaps restauradas]
Mini-Projeto 2 ──────── 1w  (Sem 28)
Buffer 3 ───────────── 1w  (Sem 29)
F3 Algorithms ──────── 12w (Sem 30-41)
Mini-Projeto 3 ──────── 1w  (Sem 42)
Buffer 4 ───────────── 1w  (Sem 43)
F4 Advanced Zig + DP ─ 4w  (Sem 44-47)
Buffer 5 ───────────── 1w  (Sem 48)
F5A Go Foundations ──── 4w  (Sem 49-52)
F5B Systems ─────────── 14w (Sem 53-66)
Buffer 6 ───────────── 1w  (Sem 67)
F6 Compilers+Capstone ─ 18w (Sem 68-85) [mantido em 18w]
Buffers finais ──────── 2w  (Sem 86-87) [RESTAURADOS]
Reserve ────────────── 1w  (Sem 88)
```

**Total: 88 semanas (22 meses)**

---

## 📝 Detalhamento por Fase

### Pré-F1: Zig Setup (Sem 7) — NOVO

**Objetivo**: Instalar, validar, e completar exercícios iniciais antes de F1 formal.

**Entregas**:
- [ ] Zig 0.13+ ou 0.14 instalado (`zig version`)
- [ ] `zig build` funcionando em projeto Hello World
- [ ] Ziglings clonado e 30+ exercícios completados
- [ ] Criar "Zig Cheat Sheet" com sintaxe mínima
- [ ] Validar links de recursos (todos os tiers)

**Tempo**: 1 semana (5-7h)

**Por quê separado?** 
- F1 semana 8 começa com suposição de "Zig já funciona"
- Evita perder tempo de aprendizado resolvendo problemas de ambiente
- Setup limpo = ritmo melhor em F1

**Recursos Tier 1**:
- Zig Documentation: https://ziglang.org/documentation/0.14.0/
- Ziglings: https://github.com/ratfactor/ziglings (clonado do repo oficial)
- Learn Zig: https://learn.ziglang.org/ (interativo, official)

---

### F1: Zig Foundations (Sem 8-13) — 6 semanas

**Objetivo**: Dominar memória em Zig o suficiente para implementar DS do zero com confiança.

| Semana | Tópico | Conteúdo | Entrega |
|--------|--------|----------|---------|
| **8** | Zig basics + memória | Tooling (`zig build`, `zig test`), stack vs heap, slices, `defer` | Hello World + testes básicos |
| **9** | Ponteiros + Optionals | `*T`, `?*T`, `?T`, aliasing, invariantes | Lista ligada mínima |
| **10** | Error handling + comptime intro | `error{}`, `!T`, `try`, `catch`, `errdefer` | Funções com error handling |
| **11** | Structs/Enums/Unions + testes | `struct`, `enum`, tagged union, testes unitários | Tipo customizado com testes |
| **12** | Memory deep dive | Size/alignment/padding, layout previsível, cache | Explicar layout de struct |
| **13** | Allocators + ArrayList | Allocator interface, arena vs GPA, crescimento amortizado | `MyArrayList(T)` com testes |

**Critério de sucesso F1**:
- [ ] Explicar fluxo de alocação/liberação em DS simples
- [ ] Prever 3 bugs comuns (dangling pointer, double free, leak)
- [ ] `MyArrayList(T)` com `push/pop/get/resize` + 5+ testes passando

---

### Mini-Projeto 1 (Sem 14) — Arena Allocator

**Objetivo**: Praticar allocators em contexto real.

**Entregas**:
- [ ] Arena allocator simples funcional
- [ ] Instrumentação: contagem de bytes alocados e resets
- [ ] Usar em 2 estruturas (BST + adjacency list)
- [ ] Comparar custos (tempo + memória) vs GPA

**Tempo**: 1 semana (5-7h)

---

### Buffer 2 (Sem 15)

Semana de descanso/recuperação.

---

### F2: Data Structures (Sem 16-27) — 12 semanas

**Objetivo**: Implementar estruturas do zero + analisar custos.

| Semana | Tópico | Entrega |
|--------|--------|---------|
| **16-17** | Arrays/Slices/ArrayList | ArrayList genérico com testes |
| **18-19** | Linked Lists (singly/doubly) | Lista com insert/remove/find |
| **20-21** | Stacks/Queues (inclui ring buffer) | Stack + Queue + Ring Buffer |
| **22-23** | Hash Tables | HashMap com open addressing |
| **24-25** | Trees/BST/AVL | BST com insert/find/delete + rotações AVL |
| **26-27** | Heaps & Union-Find | Binary heap + Union-Find (path compression) |

**Semana 28**: Mini-Projeto 2  
**Semana 29**: Buffer 3

**Critério de sucesso F2**:
- [ ] Implementar 6 estruturas do zero em <5h total
- [ ] Todas com testes passando
- [ ] Justificar trade-offs de cada uma (tempo vs espaço)
- [ ] Entender heap property e operações O(log n)

**Por quê Heaps voltam?**
1. Pré-requisito pedagógico para Heap Sort (F3 semanas 33-34)
2. Fundação para Dijkstra (F3 semanas 41-42)
3. Prática com min/max heap invariants
4. Domínio reduzido (2 semanas) vs "fazer no dia" em F3

---

### Mini-Projeto 2 (Sem 28) — Config Parser

**Objetivo**: Introduzir `comptime` de forma prática.

**Escopo**:
- Parser de arquivo `.conf` (key=value simples)
- Mapear para struct via `comptime`
- Validação de tipos (int, string, bool)

**Entregas**:
- [ ] Parser de arquivo `.conf` (key=value)
- [ ] Mapear para struct via `comptime`
- [ ] Validação de tipos
- [ ] Testes com 3+ configs diferentes

**Tempo**: 1 semana (5-7h)

---

### Buffer 3 (Sem 29)

Semana de descanso/recuperação.

---

### F3: Algorithms (Sem 30-41) — 12 semanas

**Objetivo**: Dominar algoritmos clássicos + análise de complexidade.

| Semana | Tópico | Prática | LeetCode |
|--------|--------|---------|----------|
| **30-31** | Sorting básico | Bubble, insertion, selection — implementar + medir | 3 Easy (Python) |
| **32-33** | Sorting avançado | Merge, quick, **heap** sort — implementar + comparar | 3 Medium (Python) |
| **34-35** | Binary search + Greedy | 5+ problemas LeetCode | 6 Medium (Python) |
| **36-37** | Recursão + Call stack | 5+ problemas, entender stack frames | 4 Medium (Python) |
| **38-39** | Grafos: representação + BFS/DFS | Implementar adj list + traversals | 3 Medium (Python) |
| **40-41** | Grafos: Dijkstra + complexidade | Dijkstra + análise formal | 4 Medium/Hard (Python) |

**Estratégia de LeetCode**:
1. Resolver em **Python** (ambiente oficial, feedback rápido)
2. Após passar, reimplementar em **Zig** localmente
3. Adicionar ao SRS: padrão + implementação Zig
4. Meta: ~25 problemas durante F3 (3-4/semana)

**Critério de sucesso F3**:
- [ ] Resolver 10 problemas LeetCode em <2h
- [ ] Explicar complexidade (tempo + espaço) de cada solução
- [ ] Implementar Dijkstra em Zig do zero
- [ ] Explicar heap sort vs quick sort trade-offs

---

### Mini-Projeto 3 (Sem 42) — Benchmark Generator

**Objetivo**: Criar suite de benchmarks para comparar algoritmos.

**Entregas**:
- [ ] Gerador de casos de teste (random, edge cases)
- [ ] Medição de tempo para N algoritmos
- [ ] Exportar resultados (CSV)
- [ ] Comparar 3+ sorting algorithms (bubble, merge, heap, quick)

**Tempo**: 1 semana (5-7h)

---

### Buffer 4 (Sem 43)

Semana de descanso/recuperação.

---

### F4: Advanced Zig + DP (Sem 44-47) — 4 semanas

**Objetivo**: Dominar `comptime` + Dynamic Programming.

| Semana | Tópico | Conteúdo | LeetCode |
|--------|--------|----------|----------|
| **44** | Comptime patterns | Type functions, validação em compile-time | - |
| **45** | Comptime codegen | Geração de código/testes em compile-time | - |
| **46** | DP: memoização | 3-4 problemas com memoização | 3 Medium (Python + Zig) |
| **47** | DP: tabulação | 3-4 problemas com tabulação | 4 Medium (Python + Zig) |

**Critério de sucesso F4**:
- [ ] Resolver 7 problemas DP em <1.5h
- [ ] Usar comptime em pelo menos 2 problemas
- [ ] Explicar diferença memoização vs tabulação
- [ ] Implementar DP em Zig com bom padrão

---

### Buffer 5 (Sem 48)

Semana de descanso/recuperação.

---

### F5A: Go Foundations (Sem 49-52) — 4 semanas

| Semana | Tema | Conteúdo |
|--------|------|----------|
| **49-50** | Go Basics | Sintaxe, tipos, structs, interfaces, errors |
| **51-52** | Go Concurrency | Goroutines, channels, select |

**Benchmark**: Explicar diferenças Zig vs Go em memória/concorrência

---

### F5B: Systems (Sem 53-66) — 14 semanas

**Sem alterações**

| Semana | Tema |
|--------|------|
| 53-54 | CPU & Cache |
| 55-56 | OS: Processos |
| 57-58 | Concorrência Avançada |
| 59-60 | TCP/IP |
| 61-62 | HTTP |
| 63-64 | DB: Storage |
| 65-66 | DB: Transactions |

---

### Buffer 6 (Sem 67)

Semana de descanso/recuperação.

---

### F6: Compilers + Capstone (Sem 68-85) — 18 semanas

**Mantido como v2.0 (GO, não Zig)**

| Semana | Tema |
|--------|------|
| 68-69 | Lexer & Parser |
| 70-71 | Interpreter |
| 72-85 | Capstone (14 semanas) |

**Por que mantém 18 semanas?**
- Capstone é integração de 22 meses inteiros
- Cortar aqui reduz qualidade do projeto final
- 14 semanas de capstone já é apertado

---

### Buffers Finais (Sem 86-87)

Restaurados como rede de segurança final.

---

### Reserve (Sem 88)

Última semana para revisão final ou qualquer slack.

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| **Zig mais difícil que esperado** | Média | Alto | Semana 8 (Zig Setup) reduz friction; checkpoint após F1 completo |
| **Stdlib instável** | Baixa | Médio | Usar versão estável (0.13+), evitar APIs experimentais |
| **Comptime mais complexo que generics Rust** | Alta | Médio | Dedicar 2 semanas completas em F4 (semanas 44-45) |
| **Menos recursos de aprendizado** | Alta | Baixo | Compilar "Zig cheat sheet" em Sem 7, validar todos os links |
| **Projetos muito ambiciosos** | Média | Médio | Mini-projetos simplificados, testes unitários obrigatórios |
| **Heaps: complicado em Zig** | Média | Médio | Estudar impl do Zig stdlib; usar padrão bem definido |
| **LeetCode sem suporte Zig** | Alta | Baixo | Usar Python para LC (rápido feedback), reimplementar em Zig |
| **Quebrar compatibilidade com Go** | Baixa | Alto | F5A-F5B sem alterações, interfaces claras entre F4→F5 |

---

## 🔄 Plano de Rollback

### Gatilho de decisão

Após **Zig Setup (sem 7)** + **F1 completo (sem 13)**, avaliar:

| Critério | Continuar Zig | Rollback para Rust |
|----------|--------------|-------------------|
| Entregas Setup + F1 completadas | ≥85% | <60% |
| Satisfação subjetiva | Boa/Muito boa | Ruim/Muito ruim |
| Tempo médio por entrega | ≤1.5x esperado | >2x esperado |
| Confiança em continuar | Boa | Baixa |

**Se rollback em Semana 14**:
- Manter semanas 1-7 (Math + Setup Zig)
- Arquivar código Zig em `archived/zig-experiment-{date}/`
- Retomar Rust em semana 8 com plano original (ajustado)
- Custo: ~1 semana (muito bom custo para validação)

---

## ✅ Critérios de Sucesso (por fase)

### F1: Zig Foundations

| Critério | Mensurável | Target |
|----------|------------|--------|
| MyArrayList implementado | ✅ Testes passando | 5+ testes |
| Explicar alocação/liberação | ✅ Oral ou escrito | 3+ bugs comuns |
| Allocator arena funcional (MP1) | ✅ Código com testes | 2+ DS usando arena |
| Satisfação subjetiva | ⚠️ Auto-avaliação | ≥6/10 |

### F2: Data Structures

| Critério | Mensurável | Target |
|----------|------------|--------|
| 6 estruturas do zero | ✅ Código + testes | Todas em <5h total |
| Trade-offs justificados | ✅ Documentado | Por escrito |
| Heap property entendido | ✅ Implementação funcional | Min/max heap ops O(log n) |
| MP2: Config parser com comptime | ✅ Testes passando | 3+ configs |

### F3: Algorithms

| Critério | Mensurável | Target |
|----------|------------|--------|
| 10 problemas LeetCode | ✅ Soluções funcionando | <2h total |
| Complexidade explicada | ✅ Big O por escrito | 100% dos problemas |
| Dijkstra implementado | ✅ Testes passando | Zig + análise |
| Heap sort entendido | ✅ Implementação + vs quick | Trade-offs claros |
| MP3: Benchmark suite | ✅ Comparação de 3+ algos | Resultados em CSV |

### F4: Advanced Zig + DP

| Critério | Mensurável | Target |
|----------|------------|--------|
| 7 problemas DP | ✅ Soluções funcionando | <1.5h |
| Comptime usado | ✅ Código com comptime | ≥2 problemas |
| Memo vs Tab explicado | ✅ Por escrito | Diferença clara |

### F5-F6: Go + Systems + Capstone

| Critério | Mensurável | Target |
|----------|------------|--------|
| Zig → Go transition | ✅ Código funciona | Interface clara |
| HTTP server do zero | ✅ Funcional | Explica cada camada |
| Capstone finalizado | ✅ Projeto + docs | 18 semanas dedicadas |

---

## 📚 Recursos Zig

### Tier 1 (Obrigatório)

| Recurso | Link | Tempo | Por quê | Status |
|---------|------|-------|---------|--------|
| **Zig Documentation** | https://ziglang.org/documentation/0.14.0/ | 2h inicial + ref | Oficial, sempre atualizada | ✅ Validado |
| **Ziglings** | https://github.com/ratfactor/ziglings | ~15h (100 ex) | Progressivo, cobre sintaxe | ✅ Ativo |
| **Zig by Example** | https://zigbyexample.com/ | Ref | Exemplos práticos | ✅ Ativo |
| **Learn Zig** | https://learn.ziglang.org/ | 3-4h | Tutorial interativo oficial | ✅ Validado |

### Tier 2 (Recomendado)

| Recurso | Link | Tempo | Por quê | Quando |
|---------|------|-------|---------|--------|
| **Zig stdlib source** | https://github.com/ziglang/zig/tree/master/lib/std | Conforme | Aprender código real | F2-F3 |
| **Zig NEWS** | https://zig.news/ | Leitura | Comunidade, dicas | Ocasional |
| **Exercism Zig** | https://exercism.org/tracks/zig | 20-30h | Prática com feedback | F1-F2 |

### Tier 3 (Avançado)

| Recurso | Link | Tempo | Por quê | Quando |
|---------|------|-------|---------|--------|
| **Comptime Deep Dive** | YouTube: "Zig Comptime" | 1-2h | Essencial para F4 | F4 semana 44 |
| **Allocator Patterns** | https://ziglang.org/documentation/0.14.0/#Memory | 1h | Essencial F1-F2 | F1 semana 13 |
| **Zig Language Reference** | https://ziglang.org/documentation/0.14.0/ | Ref | Especificação completa | Conforme dúvida |

### Tier 3: Alternativas para LeetCode

Como Zig não tem suporte oficial em LeetCode:

| Plataforma | Link | Para quê | Meta |
|-----------|------|----------|------|
| **LeetCode (Python)** | https://leetcode.com/ | Feedback rápido, problemas testados | 25 problemas F3 |
| **Exercism Zig** | https://exercism.org/tracks/zig | Prática com feedback Zig | 15-20 exercícios |
| **Local tests (Zig)** | Criar .zig com `zig test` | Reimplementar LC em Zig | 1:1 com Python |

---

## 🔗 Estratégia: Python → Zig na Prática

### Fluxo de Estudo de Algoritmos

1. **Semana X, dia 1-3**: Estudar padrão (ex: binary search, DP)
2. **Semana X, dia 3-4**: Resolver 2-3 problemas em **Python** no LeetCode
   - Feedback imediato (testes integrados)
   - Brainstorm sem friction de linguagem
   - Adicionar ao SRS: padrão + solução Python
3. **Semana X, dia 4-5**: Reimplementar mesmos problemas em **Zig** localmente
   - `zig test` para validar
   - Aprender idiomas de Zig
   - Comparar performance (opcional)
4. **Semana X+1**: Revisão no SRS
   - Refazer em Python (30 min)
   - Refazer em Zig (30 min)

**Vantagem**: Prática acelerada + aprendizado de Zig + avaliação desacoplada da linguagem

---

## 📝 Atualizações de Documentação

### Arquivos a revisar (quando aplicar)

| Arquivo | Mudança |
|---------|---------|
| `meta/learning-map.md` | Substituir Rust por Zig em F1-F4; atualizar timeline 88w |
| `meta/phase-0-overview.md` | Adicionar "Pré-fase: Zig Setup" |
| `meta/week-07-*.md` | NOVO: Setup Zig (semana 7) |
| `meta/week-08-*.md` até `week-13-*.md` | Atualizar de Rust para Zig |
| `meta/week-16-*.md` até `week-27-*.md` | Adicionar semanas 26-27 (Heaps + UF) |
| `meta/week-30-*.md` até `week-41-*.md` | Atualizar algoritmos para Zig + LeetCode Python |
| `meta/mini-project-*.md` | Reescrever para Zig (1, 2, 3) |
| `guides/*.md` | Substituir exemplos Rust por Zig |
| `.opencode/agents/tutor.md` | Atualizar exemplos de código |

---

## 📋 Checklist de Validação (quando aplicar)

### Antes de começar Zig Setup (Sem 7)

- [ ] Zig 0.13+ ou 0.14+ instalado e funcionando
- [ ] `zig version` retorna versão
- [ ] Ziglings clonado localmente
- [ ] Todo o grupo de "Recursos Tier 1" acessível
- [ ] Acesso a Python 3.10+ (para LeetCode)

### Durante Zig Setup (Sem 7)

- [ ] 30+ exercícios Ziglings completos
- [ ] Hello World + testes básicos funcionam
- [ ] Criar Zig Cheat Sheet com:
  - Sintaxe mínima
  - Slices comuns
  - Allocators padrão
  - Error handling patterns
  - Comptime básico

### Após Zig Setup (Sem 7) - Antes de F1 (Sem 8)

- [ ] Decidir: continuar Zig ou fazer rollback para Rust
- [ ] Se continuar: comprovar satisfação ≥6/10

### Checkpoint Sem 8-13 (F1)

- [ ] Semana 8: Satisfação com ambiente? ≥6/10?
- [ ] Semana 10: Error handling entendido?
- [ ] Semana 13: MyArrayList funcional com testes?

### Checkpoint Sem 14 (Decision Point: Continuar ou Rollback)

- [ ] F1 + Setup completos?
- [ ] ≥85% entregas completadas?
- [ ] Satisfação ≥6/10?
- **SE NÃO**: Fazer rollback para Rust (Semana 8)

### Após F1 (Sem 14) - Se continuar Zig

- [ ] Grep: nenhuma referência a Rust em F1-F4 (exceto seção comparativa)
- [ ] MyArrayList com 5+ testes passando
- [ ] Arena allocator (MP1) funcional
- [ ] Critérios de sucesso F1 atingidos

### Durante F2 (Sem 16-27)

- [ ] Semana 24-25: Heap property entendido?
- [ ] Semana 27: Union-Find path compression implementado?
- [ ] MP2: Config parser com comptime testado?

### Durante F3 (Sem 30-41)

- [ ] 10+ problemas Python LeetCode resolvidos
- [ ] 5+ problemas Zig implementados localmente
- [ ] Dijkstra em Zig do zero funcionando
- [ ] Heap sort implementado + comparado com quick sort

### Checkpoint Final: Go Transition (Sem 49)

- [ ] Zig fundamentals sólidos?
- [ ] Transição Zig→Go clara?
- [ ] Código Go compilando?

---

## 📊 Comparação: v2.0 vs v2.1

| Aspecto | v2.0 | v2.1 | Razão |
|---------|------|------|-------|
| Timeline | 80w | 88w | Zig nova = sem cortes de segurança |
| F1 duração | 6w | 6w | Idem |
| F2 duração | 10w | 12w | Heaps restauradas (pré-req para F3) |
| Heaps/UF | ❌ Cortadas | ✅ Restauradas | Necessário para heap sort + Dijkstra |
| F6 capstone | 16w | 18w | Mantém qualidade do projeto final |
| Buffers finais | ❌ Cortados | ✅ Restaurados (Sem 86-87) | Rede de segurança essencial |
| Zig Setup | ❌ Ausente | ✅ Nova Sem 7 | Reduz friction no começo de F1 |
| LeetCode strategy | Ambígua | ✅ Python → Zig | Feedback rápido + aprendizado Zig |
| Recursos links | Nomes | ✅ Todos validados | Fiabilidade |
| Justificativa 8w diff | ❌ Fraca | ✅ Forte | Porque NÃO cortar |

---

## 🚀 Próximos Passos

### Antes de aplicar (Decisão final)

1. [ ] Revisar este documento (v2.1)
2. [ ] Discutir timeline 88w vs 80w
3. [ ] Validar que Python 3.10+ instalado (para LeetCode)
4. [ ] Confirmar: Zig 0.13+ ou 0.14+?
5. [ ] Decidir: aplicar ou não?

### Se decidir aplicar (v2.1 → live)

1. [ ] Arquivar v2.0 para `planning/archived/`
2. [ ] Atualizar `learning-map.md` para 88w
3. [ ] Reescrever `phase-0-overview.md` + adicionar "Zig Setup phase"
4. [ ] Criar `week-07-zig-setup.md`
5. [ ] Atualizar `week-08-*.md` até `week-13-*.md` (Zig Foundations)
6. [ ] Adicionar `week-26-27-heaps-unionfind.md`
7. [ ] Atualizar `week-30-*.md` até `week-41-*.md` (Algorithms com Python→Zig)
8. [ ] Reescrever mini-projetos 1-3 para Zig
9. [ ] Atualizar `resources.md` (Zig focus)
10. [ ] Começar Semana 7: Zig Setup

---

## 📈 Marcos de Confiança

| Marco | Quando | Sinais de Confiança |
|-------|--------|-------------------|
| 🟢 Setup OK | Sem 7 fim | Ziglings 30+, cheat sheet criado |
| 🟢 F1 OK | Sem 13 fim | MyArrayList funcional, 85%+ entregas |
| 🟢 F2 Halfway | Sem 22 fim | 3+ DS implementadas em Zig |
| 🟢 F3 OK | Sem 41 fim | 10+ LeetCode em Python, 5+ em Zig |
| 🟢 F4 OK | Sem 47 fim | DP + comptime dominados |
| 🟢 F5A Transition | Sem 52 fim | Go basics sólidos |
| 🟢 Capstone | Sem 85 fim | Projeto integrador completo |
| 🏁 **FINISH** | Sem 88 fim | 22 meses de aprendizado consolidado |

---

## 🎯 Filosofia do Plano v2.1

> **"Planejar conservador (88w) com linguagem nova (Zig) gera mais confiança do que otimista (80w). A economia de 8 semanas é ilusória se resultar em atraso de 4w."**

- ✅ Respeita a dificuldade de linguagem nova
- ✅ Mantém conteúdo essencial (Heaps)
- ✅ Preserva buffers (rede de segurança)
- ✅ Define estratégia clara (Python → Zig)
- ✅ Inclui checkpoint de decisão (Sem 14)
- ✅ Não sacrifica capstone (18w)
- ✅ Valida recursos antes de começar

---

*Plano v2.1 — Revisão crítica com ajustes estruturais baseados em feedback*  
*Gerado por @meta em 2026-03-02*  
*Pronto para aplicação após decisão final*
