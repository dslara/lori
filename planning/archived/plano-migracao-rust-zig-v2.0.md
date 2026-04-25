# Plano: Migração Rust → Zig (CS Fundamentals) - v2.0

**Status**: 🟡 Proposta (não aplicado)  
**Data**: 2026-02-28  
**Versão**: 2.0 (revisão completa)  
**Baseado em**: `plano-migracao-rust-zig-v1.0-archive.md`

---

## 📋 Resumo Executivo

Este documento descreve o plano para migrar de Rust para Zig no módulo `foundations-of-computing`, focando em fundamentos de CS (memória, estruturas de dados, algoritmos) com uma linguagem que prioriza transparência e menor fricção pedagógica.

**Mudanças principais vs v1.0**:
- ✅ Timeline reorganizada para clareza
- ✅ F3 detalhado por semana
- ✅ Mini-projetos revisados (MP2 simplificado)
- ✅ Seção de riscos + mitigações adicionada
- ✅ Critérios de sucesso mensuráveis
- ✅ Plano de rollback definido
- ✅ Recursos completos com links

---

## 🎯 Decisões Fundamentais

| Decisão | Detalhe |
|---------|---------|
| **Escopo** | Zig substitui Rust apenas em F1-F4 (fundamentos, DS, algoritmos, avançado) |
| **Go mantido** | F5A-F5B (Systems/Concorrência) sem mudanças |
| **Profundidade Zig** | Moderada: allocators, ponteiros, slices, erros, comptime; sem inline asm |
| **Timeline** | 80 semanas (vs 88 original) — redução de 8 semanas |
| **Mini-projetos** | Reimaginados para explorar Zig especificamente |

---

## 🎯 Objetivos da Migração

### Por que Zig?

| Objetivo | Rust | Zig |
|----------|------|-----|
| Foco em fundamentos de CS | ❌ Distracao com ownership/lifetimes | ✅ Memória explícita, sem mágica |
| Fricção em árvores/grafos | ❌ Alto (borrow checker) | ✅ Baixo (ponteiros explícitos) |
| Transparência | ⚠️ Média (hidden control flow) | ✅ Alta (tudo explícito) |
| Custo mental | Alto | Médio |
| Curva de aprendizado | Íngreme | Moderada |

### O que NÃO muda

- F0 (Math Foundations) — sem alterações
- F5A-F5B (Go/Systems) — sem alterações
- F6 (Compilers + Capstone) — sem alterações
- Buffers estratégicos — mantidos
- Metodologia Ultralearning — mantida

---

## 📅 Timeline (80 semanas)

### Visão Geral

```
F0 Math ────────────── 5w  (Sem 1-5)
Buffer 1 ───────────── 1w  (Sem 6)
F1 Zig Foundations ─── 6w  (Sem 7-12)
Mini-Projeto 1 ──────── 1w  (Sem 13)
Buffer 2 ───────────── 1w  (Sem 14)
F2 Data Structures ─── 10w (Sem 15-24)
Mini-Projeto 2 ──────── 1w  (Sem 25)
Buffer 3 ───────────── 1w  (Sem 26)
F3 Algorithms ──────── 12w (Sem 27-38)
Mini-Projeto 3 ──────── 1w  (Sem 39)
Buffer 4 ───────────── 1w  (Sem 40)
F4 Advanced Zig + DP ─ 4w  (Sem 41-44)
Buffer 5 ───────────── 1w  (Sem 45)
F5A Go Foundations ──── 4w  (Sem 46-49)
F5B Systems ─────────── 14w (Sem 50-63)
Buffer 6 ───────────── 1w  (Sem 64)
F6 Compilers+Capstone ─ 16w (Sem 65-80)
```

### Detalhamento por Fase

#### F0: Math Foundations (Sem 1-5) — Sem alterações

| Semana | Tópico |
|--------|--------|
| 1 | Notação & Lógica |
| 2 | Conjuntos & Funções |
| 3 | Logaritmos & Exponenciais |
| 4 | Somatórios & Indução |
| 5 | Combinatória & Probabilidade |

---

#### Buffer 1 (Sem 6)

Semana de descanso/recuperação.

---

#### F1: Zig Foundations (Sem 7-12) — 6 semanas

**Objetivo**: Dominar memória em Zig o suficiente para implementar DS do zero com confiança.

| Semana | Tópico | Conteúdo | Entrega |
|--------|--------|----------|---------|
| **7** | Zig basics + memória | Tooling (`zig build`, `zig test`), stack vs heap, slices, `defer` | Hello World + testes básicos |
| **8** | Ponteiros + Optionals | `*T`, `?*T`, `?T`, aliasing, invariantes | Lista ligada mínima |
| **9** | Error handling + comptime intro | `error{}`, `!T`, `try`, `catch`, `errdefer` | Funções com error handling |
| **10** | Structs/Enums/Unions + testes | `struct`, `enum`, tagged union, testes unitários | Tipo customizado com testes |
| **11** | Memory deep dive | Size/alignment/padding, layout previsível, cache | Explicar layout de struct |
| **12** | Allocators + ArrayList | Allocator interface, arena vs GPA, crescimento amortizado | `MyArrayList(T)` com testes |

**Critério de sucesso F1**:
- [ ] Explicar fluxo de alocação/liberação em DS simples
- [ ] Prever 3 bugs comuns (dangling pointer, double free, leak)
- [ ] `MyArrayList(T)` com `push/pop/get` + 5+ testes passando

---

#### Mini-Projeto 1 (Sem 13) — Arena Allocator

**Objetivo**: Praticar allocators em contexto real.

**Entregas**:
- [ ] Arena allocator simples funcional
- [ ] Instrumentação: contagem de bytes alocados e resets
- [ ] Usar em 2 estruturas (BST + adjacency list)
- [ ] Comparar custos (tempo + memória) vs GPA

**Tempo**: 1 semana (5-7h)

---

#### Buffer 2 (Sem 14)

Semana de descanso/recuperação.

---

#### F2: Data Structures (Sem 15-24) — 10 semanas

**Objetivo**: Implementar estruturas do zero + analisar custos.

| Semana | Tópico | Entrega |
|--------|--------|---------|
| **15-16** | Arrays/Slices/ArrayList | ArrayList genérico com testes |
| **17-18** | Linked Lists (singly/doubly) | Lista com insert/remove/find |
| **19-20** | Stacks/Queues (inclui ring buffer) | Stack + Queue + Ring Buffer |
| **21-22** | Hash Tables | HashMap com open addressing |
| **23-24** | Trees/BST/AVL | BST com insert/find/delete |

**Semana 25**: Mini-Projeto 2  
**Semana 26**: Buffer 3

**Critério de sucesso F2**:
- [ ] Implementar 5 estruturas do zero em <4h
- [ ] Todas com testes passando
- [ ] Justificar trade-offs de cada uma (tempo vs espaço)

---

#### Mini-Projeto 2 (Sem 25) — Config Parser (simplificado)

**Objetivo**: Introduzir `comptime` de forma prática.

**Escopo reduzido vs v1.0**:
- ~~Parser JSON-lite com comptime~~ → **Parser key=value simples**
- Mapear para struct via comptime
- Validar schema

**Entregas**:
- [ ] Parser de arquivo `.conf` (key=value)
- [ ] Mapear para struct via `comptime`
- [ ] Validação de tipos (int, string, bool)
- [ ] Testes com 3+ configs diferentes

**Tempo**: 1 semana (5-7h)

**Por que simplificado?**
- Parser JSON completo com comptime é muito para 1 semana
- Key=value é suficiente para aprender comptime
- Pode evoluir em F4 se necessário

---

#### F3: Algorithms (Sem 27-38) — 12 semanas

**Objetivo**: Dominar algoritmos clássicos + análise de complexidade.

| Semana | Tópico | Prática |
|--------|--------|---------|
| **27-28** | Sorting básico | Bubble, insertion, selection — implementar + medir |
| **29-30** | Sorting avançado | Merge, quick, heap — implementar + comparar |
| **31-32** | Binary search + Greedy | 5+ problemas LeetCode |
| **33-34** | Recursão + Call stack | 5+ problemas, entender stack frames |
| **35-36** | Grafos: representação + BFS/DFS | Implementar adj list + traversals |
| **37-38** | Grafos: Dijkstra + complexidade | Dijkstra + análise formal |

**Critério de sucesso F3**:
- [ ] Resolver 10 problemas LeetCode em <2h
- [ ] Explicar complexidade (tempo + espaço) de cada solução
- [ ] Implementar Dijkstra do zero

---

#### Mini-Projeto 3 (Sem 39) — Benchmark Generator

**Objetivo**: Criar suite de benchmarks para comparar algoritmos.

**Entregas**:
- [ ] Gerador de casos de teste (random, edge cases)
- [ ] Medição de tempo para N algoritmos
- [ ] Exportar resultados (CSV ou JSON)
- [ ] Comparar 3+ sorting algorithms

**Tempo**: 1 semana (5-7h)

---

#### Buffer 4 (Sem 40)

Semana de descanso/recuperação.

---

#### F4: Advanced Zig + DP (Sem 41-44) — 4 semanas

**Objetivo**: Dominar `comptime` + Dynamic Programming.

| Semana | Tópico | Conteúdo |
|--------|--------|----------|
| **41** | Comptime patterns | Type functions, validação em compile-time |
| **42** | Comptime codegen | Geração de código/testes em compile-time |
| **43** | DP: memoização | 3-4 problemas com memoização |
| **44** | DP: tabulação | 3-4 problemas com tabulação |

**Critério de sucesso F4**:
- [ ] Resolver 5 problemas DP em <1.5h
- [ ] Usar comptime em pelo menos 1 problema
- [ ] Explicar diferença memoização vs tabulação

---

#### Buffer 5 (Sem 45)

Semana de descanso/recuperação.

---

#### F5A-F5B: Go + Systems (Sem 46-63) — Sem alterações

Mantido como no plano original (Go para systems/concorrência).

---

#### F6: Compilers + Capstone (Sem 65-80) — Sem alterações

Mantido como no plano original.

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| **Zig mais difícil que esperado** | Média | Alto | Semana 7-8: checkpoint — se <50% entregues, avaliar rollback |
| **Stdlib instável** | Baixa | Médio | Usar versão estável (0.13+), evitar APIs experimentais |
| **Comptime mais complexo que generics Rust** | Alta | Médio | Dedicar 2 semanas em F4, não 1 |
| **Menos recursos de aprendizado** | Alta | Baixo | Compilar "Zig cheat sheet" antes de começar |
| **Projetos muito ambiciosos** | Média | Médio | Mini-projetos simplificados (MP2 revisado) |
| **Quebrar compatibilidade com Go** | Baixa | Alto | F5A-F5B sem alterações, interfaces claras |

---

## 🔄 Plano de Rollback

### Gatilho de decisão

Após **F1 completo (semana 12)**, avaliar:

| Critério | Continuar Zig | Rollback para Rust |
|----------|--------------|-------------------|
| Entregas F1 completadas | ≥80% | <50% |
| Satisfação subjetiva | Boa | Ruim |
| Tempo médio por entrega | ≤1.5x esperado | >2x esperado |

### Procedimento de rollback

Se decidir voltar para Rust:

1. **Manter** semanas 1-6 (Math + Buffer) — sem perda
2. **Arquivar** código Zig em `archived/zig-experiment/`
3. **Retomar** Rust em semana 7 com plano original
4. **Ajustar** numeração de semanas subsequentes
5. **Atualizar** learning-map.md e week-*.md

**Custo do rollback**: ~2 semanas de retrabalho (semanas 7-12)

---

## ✅ Critérios de Sucesso (por fase)

### F1: Zig Foundations

| Critério | Mensurável | Target |
|----------|------------|--------|
| MyArrayList implementado | ✅ Testes passando | 5+ testes |
| Explicar alocação/liberação | ✅ Oral ou escrito | 3+ bugs previstos |
| Satisfação subjetiva | ⚠️ Auto-avaliação | ≥6/10 |

### F2: Data Structures

| Critério | Mensurável | Target |
|----------|------------|--------|
| 5 estruturas do zero | ✅ Código + testes | <4h total |
| Trade-offs justificados | ✅ Documentado | Por escrito |
| Benchmark Q1 | ✅ Tempo medido | <4h |

### F3: Algorithms

| Critério | Mensurável | Target |
|----------|------------|--------|
| 10 problemas LeetCode | ✅ Soluções funcionando | <2h |
| Complexidade explicada | ✅ Big O por escrito | 100% |
| Dijkstra implementado | ✅ Testes passando | Do zero |

### F4: Advanced Zig + DP

| Critério | Mensurável | Target |
|----------|------------|--------|
| 5 problemas DP | ✅ Soluções funcionando | <1.5h |
| Comptime usado | ✅ Código com comptime | ≥1 problema |
| Memo vs Tab explicado | ✅ Por escrito | Diferença clara |

---

## 📚 Recursos Zig

### Tier 1 (Obrigatório)

| Recurso | Link | Tempo | Por quê |
|---------|------|-------|---------|
| **Zig Documentation** | https://ziglang.org/documentation/master/ | 2h inicial + referência | Fonte oficial, mais atualizada |
| **Ziglings** | https://github.com/ratfactor/ziglings | ~10h (100 exercícios) | Hands-on, progressivo, cobre sintaxe |
| **Zig by Example** | https://zigbyexample.com/ | Referência | Exemplos práticos para consultas |

### Tier 2 (Recomendado)

| Recurso | Link | Tempo | Por quê |
|---------|------|-------|---------|
| **Zig stdlib source** | https://github.com/ziglang/zig/tree/master/lib/std | Conforme necessário | Aprender com código real |
| **Learn Zig** | https://learn.ziglang.org/ | 2-3h | Tutorial oficial interativo |
| **Zig NEWS discussions** | https://zig.news/ | Leitura ocasional | Comunidade ativa, dicas |

### Tier 3 (Avançado)

| Recurso | Link | Tempo | Por quê |
|---------|------|-------|---------|
| **Comptime deep dive** | Buscar talk em YouTube | 1h | Essencial para F4 |
| **Allocator patterns** | https://ziglang.org/documentation/master/#Memory | 1h | Essencial para F1-F2 |

---

## 📝 Atualizações de Documentação

### Arquivos a revisar (quando aplicar)

| Arquivo | Mudança |
|---------|---------|
| `meta/learning-map.md` | Substituir Rust por Zig em F1-F4 |
| `meta/phase-1-overview.md` | Reescrever para Zig |
| `meta/week-07-*.md` até `week-44-*.md` | Atualizar conteúdo |
| `meta/mini-project-*.md` | Reescrever para Zig |
| `guides/*.md` | Substituir exemplos Rust por Zig |
| `.opencode/agents/tutor.md` | Atualizar exemplos de código |
| `.opencode/agents/meta.md` | Atualizar referências |

### Definição de "remover referências a Rust"

- ✅ Substituir exemplos de código `rust` por `zig`
- ✅ Trocar objetivos/benchmarks de ownership/lifetimes por memória/allocators
- ✅ Atualizar recursos (Rust Book → Zig docs)
- ⚠️ Manter referências a Rust em seção "comparação" (opcional)

---

## 📋 Checklist de Validação (quando aplicar)

### Antes de começar F1

- [ ] Zig 0.13+ instalado e funcionando
- [ ] Ziglings clonado
- [ ] Cheat sheet criado
- [ ] Recursos Tier 1 acessíveis

### Durante F1

- [ ] Semana 7-8: checkpoint de satisfação
- [ ] Semana 12: decisão de continuar ou rollback

### Após F1

- [ ] Grep: nenhuma referência a Rust em F1 (exceto seção comparativa)
- [ ] MyArrayList com testes passando
- [ ] Critérios de sucesso F1 atingidos

### Após F2-F4

- [ ] Benchmarks factíveis em 1h/dia
- [ ] Projetos com entregas testáveis (`zig test`)
- [ ] Go/Systems: comparação atualizada (Zig vs Go, não Rust vs Go)

---

## 🎯 Sugestões de Refinamento (opcional)

### 1. Zig Cheat Sheet

Criar documento com:
- Sintaxe mínima
- Slices comuns
- Allocators padrão
- Error handling patterns
- Comptime básico

### 2. Regra de alocação por fase

| Fase | Allocator | Justificativa |
|------|-----------|---------------|
| F1 | GPA (`std.heap.GeneralPurposeAllocator`) | Simples, detecta leaks |
| F2 | Alternar arena vs GPA | Sentir trade-offs |
| F3/F4 | Escolher por problema | Justificar no log |

### 3. Prática de testes

- Toda entrega semanal: ≥5 testes pequenos
- Sessão quinzenal: refactor + testes

### 4. Metas de LeetCode

- Manter quantidade
- Regra: reimplementar 1 solução por semana sem consulta
- Explicar complexidade

---

## 📊 Comparação: v1.0 vs v2.0

| Aspecto | v1.0 | v2.0 |
|---------|------|------|
| Timeline | Confusa | Clara com tabela |
| F3 detalhado | ❌ Vago | ✅ Por semana |
| Mini-projeto 2 | Parser JSON completo | Parser key=value (simplificado) |
| Riscos | ❌ Ausente | ✅ 6 riscos + mitigações |
| Critérios de sucesso | Vagos | Mensuráveis |
| Plano de rollback | ❌ Ausente | ✅ Definido |
| Recursos | Nomes apenas | Links + justificativas |

---

## 🚀 Próximos Passos

### Antes de aplicar

1. [ ] Revisar este documento com usuário
2. [ ] Instalar Zig 0.13+
3. [ ] Completar Ziglings (ou pelo menos 50 exercícios)
4. [ ] Criar Zig Cheat Sheet
5. [ ] Decidir: aplicar ou não

### Se decidir aplicar

1. [ ] Atualizar `learning-map.md`
2. [ ] Reescrever `phase-1-overview.md`
3. [ ] Atualizar `week-07-*.md` até `week-12-*.md`
4. [ ] Criar `mini-project-1-arena.md`
5. [ ] Começar F1

---

*Plano v2.0 — Revisão completa baseada em análise crítica do v1.0*  
*Gerado por @review em 2026-02-28*
