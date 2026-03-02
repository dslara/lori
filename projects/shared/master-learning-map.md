# Master Learning Map: CS Fundamentals (88 semanas)

> **Visão estratégica global de 22 meses**. Para detalhes táticos, veja o learning-map de cada módulo.

---

## Índice Rápido
- [Meta](#meta) - Objetivo e filosofia
- [Módulos](#módulos-8-total) - Visão geral dos 8 módulos
- [Timeline Visual](#timeline-visual) - 88 semanas em uma tabela
- [Dependências](#dependências-entre-módulos) - Grafo de pré-requisitos
- [Milestones Trimestrais](#milestones-trimestrais) - Benchmarks Q1-Q4
- [Perguntas Centrais](#perguntas-centrais-de-cada-módulo) - Uma pergunta por módulo
- [Tracking Global](#tracking-global) - Progresso de 22 meses

---

## Meta
- **Objetivo**: Dominar fundamentos profundos de CS
- **Prazo**: ~22 meses (88 semanas)
- **Disponibilidade**: 1h/dia, 5 dias/semana (~385h total)
- **Abordagem**: Math → Zig + Comptime → Data Structures → Algorithms + DP → Go + OS/CPU → Networking + DB → Compilers → Capstone
- **Filosofia**: **Sustentabilidade > Velocidade**

---

## Módulos (8 total)

| # | Módulo | Semanas | Duração | Horas | Status |
|---|--------|---------|---------|-------|--------|
| M1 | [math-foundations](../M1-math-foundations/) | 1-5 | 5w | 25h | ⬜ |
| M2 | [zig-foundations](../M2-zig-foundations/) | 7-16 | 10w | 50h | ⬜ |
| M3 | [data-structures](../M3-data-structures/) | 18-29 | 12w | 60h | ⬜ |
| M4 | [algorithms](../M4-algorithms/) | 31-44 | 14w | 70h | ⬜ |
| M5 | [go-os-cpu](../M5-go-os-cpu/) | 46-54 | 9w | 45h | ⬜ |
| M6 | [networking-db](../M6-networking-db/) | 56-64 | 9w | 45h | ⬜ |
| M7 | [compilers](../M7-compilers/) | 66-69 | 4w | 20h | ⬜ |
| M8 | [capstone](../M8-capstone/) | 71-84 | 14w | 70h | ⬜ |

**Buffers**: Semanas 6, 17, 30, 45, 55, 65, 70, 85-88 (12 semanas de buffer)

---

## Timeline Visual

```
Mês 1   [M1: Math]━━━━━━━━━━━━━━━━━━━━━ ■
Mês 2   [Buffer] [M2: Zig + CT━━━━━━━━━━
Mês 3   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mês 4   ━━━━━━━━━━━━━━━━━━━■ [Mini-P1]
Mês 5   [M3: Data Structures━━━━━━━━━━━━
Mês 6   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mês 7   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mês 8   ━━━━━━━━━━━━■ [Mini-P2] [Buffer]
Mês 9   [M4: Algorithms + DP━━━━━━━━━━━━
Mês 10  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mês 11  ━━━━━━━━━━━━━━━■ [Mini-P3] [B]
Mês 12  [M5: Go + OS/CPU━━━━━━━━━━━━━━━
Mês 13  ━━━━━━━━━━━━━━━■ [Buffer] [M6:
Mês 14  Networking + DB━━━━━━━━━━━━━━━━
Mês 15  ━━━━━━━━━━━━■ [Buffer] [M7: C]
Mês 16  Compilers■ [Buffer] [M8: Capstone
Mês 17  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mês 18  ━━━━━━━━━━━━━━━━━━━━■ [Buffers]
```

---

## Dependências entre Módulos

```
M1 (Math) ──────┬──────────────────────┐
                ↓                      ↓
M2 (Zig+CT) ───┼──────┬───────────────┤
                ↓      ↓               ↓
          M3 (DS) ─→ M4 (Algo+DP)     │
                                       ↓
                           M5 (Go+OS) ──→ M6 (Net+DB)
                                       │
                           M7 (Compilers)
                                       │
                                       ↓
                                M8 (Capstone)
```

**Legenda**:
- **Forte** (→): Pré-requisito obrigatório
- **Fraco** (⇢): Recomendado mas não obrigatório

**Flexibilidade**:
- M5 depende de M2 e beneficia de M4
- M6 depende de M5 (no minimo base de Go e OS/CPU)

---

## Milestones Trimestrais

| Trimestre | Semana | Benchmark | Critério de Sucesso |
|-----------|--------|-----------|---------------------|
| **Q1** | 17 | Mini-Projeto 1 | Arena Allocator funcional + demo de comptime |
| **Q2** | 45 | Algoritmos + DP | 7/10 LeetCode + Fibonacci/LCS/Knapsack top-down e bottom-up |
| **Q3** | 65 | Systems | HTTP server do zero explicado |
| **Q4** | 84 | Capstone | Projeto final + documentação |

**Retrospectivas obrigatórias**:
- `shared/retrospectives/quarterly/Q1-review.md` (após semana 16)
- `shared/retrospectives/quarterly/Q2-review.md` (após semana 44)
- `shared/retrospectives/quarterly/Q3-review.md` (após semana 68)
- `shared/retrospectives/quarterly/Q4-review.md` (após semana 86)

---

## Perguntas Centrais de Cada Módulo

| Módulo | Pergunta Central | Habilidade-Chave |
|--------|------------------|------------------|
| **M1** | Que matemática preciso para algoritmos? | Ler Big O, provas por indução |
| **M2** | Como Zig gerencia memória sem GC? | Pointers, allocators, comptime |
| **M3** | Como escolher estrutura certa? | Implementar DS do zero, analisar trade-offs |
| **M4** | Como analisar algoritmos? | Complexidade, resolver problemas + DP |
| **M5** | Como computadores executam código? | Go concorrência, CPU, OS |
| **M6** | Como redes e databases funcionam? | TCP/IP, HTTP, storage, transactions |
| **M7** | Como linguagens funcionam? | Lexer, parser, interpreter |
| **M8** | Como integrar tudo? | Projeto real com arquitetura sólida |

---

## Tracking Global

### Progresso por Módulo
- [ ] M1: Math Foundations (0/5 semanas)
- [ ] M2: Zig Foundations + Comptime (0/10 semanas)
- [ ] M3: Data Structures (0/12 semanas)
- [ ] M4: Algorithms + DP (0/14 semanas)
- [ ] M5: Go + OS/CPU (0/9 semanas)
- [ ] M6: Networking + DB (0/9 semanas)
- [ ] M7: Compilers (0/4 semanas)
- [ ] M8: Capstone (0/14 semanas)

### Métricas Globais

| Métrica | Meta | Atual | % |
|---------|------|-------|---|
| Módulos completados | 8 | 0 | 0% |
| Semanas estudadas | 88 | 0 | 0% |
| Horas acumuladas | 385h | 0h | 0% |
| Mini-projetos | 3 | 0 | 0% |
| Problemas LeetCode | ~100 | 0 | 0% |

### Saúde do Projeto

| Indicador | Verde | Amarelo | Vermelho | Atual |
|-----------|-------|---------|----------|-------|
| Dias/semana | 4-5 | 3 | <3 | - |
| SRS diário | Sim | 3x/sem | <3x/sem | - |
| Atraso | 0 sem | 1-2 sem | >2 sem | - |

---

## Interleaving (Proposta 5 — v5.0)

Plano 100% sequencial prejudica retenção. Estas regras implementam interleaving baseado em Bjork e Roediger:

### Revisão bi-semanal
A cada 2 semanas, 1 sessão dedicada (antes do conteúdo novo):
- **SRS review** obrigatório (30min) — ver seção Processo SRS abaixo
- **Mini-quiz** de módulos anteriores (15min)
- **Conexão explícita**: "como o que aprendi hoje conecta com M(N-1)?"

### Transição entre módulos
- **Último dia do módulo anterior**: quiz de 5 perguntas por módulo já completado
- **Primeiro dia do novo módulo**: warm-up quiz dos pré-requisitos diretos

### Exemplo concreto — início de M4
1. Quiz M1: "Prove por indução que sum(1..n) = n(n+1)/2"
2. Quiz M2: "Explique allocators em Zig como para criança de 12 anos"
3. Quiz M3: "Quando usar HashMap vs BST? Trade-offs?"
4. Só então: começar conteúdo novo de M4

**Custo estimado**: ~4h/mês (recuperado com melhor retenção).

---

## Kill-Switch / Minimum Viable (Proposta 7 — v5.0)

Se um módulo estiver **>2 semanas atrasado após consumir o buffer**:
1. Completar apenas o "Minimum Viable" do módulo
2. Documentar o que ficou pendente em `retrospectives/`
3. Seguir para o próximo módulo
4. Revisitar no capstone se necessário

| Módulo | Minimum Viable (pode avançar) | Full Scope |
|--------|-------------------------------|------------|
| M1 | Big O + logs + indução | + combinatória + probabilidade |
| M2 | Pointers + allocators + basic comptime | + Arena Allocator do zero |
| M3 | Array, LinkedList, HashMap, BST | + AVL, Heap, UnionFind |
| M4 | Sorting + Binary Search + BFS/DFS | + Dijkstra, DP avançado, backtracking |
| M5 | Go basics + goroutines | + CPU cache, OS scheduling |
| M6 | TCP basics + HTTP server | + DB storage, transactions |
| M7 | Lexer + Parser | + Interpreter completo |
| M8 | MVP do projeto + docs | + Benchmarks + profiling |

---

## Processo SRS (Proposta 6 — v5.0)

**Ferramenta escolhida**: `scripts/spaced-repetition.sh` (JSONL, algoritmo SM-2).

### Quando criar cards
- **Regra**: ao final de cada sessão de estudo, criar 3-5 cards
- **Formato**: pergunta atômica — 1 conceito por card
- **Bom**: "Qual a complexidade de busca em BST balanceada?" → "O(log n)"
- **Ruim**: "Explique BSTs" (muito amplo)

### Rotina de revisão
- **Diário**: 10-15min de SRS antes de começar conteúdo novo (warm-up)
- **Semanal**: revisar cards marcados como difíceis
- **Meta**: <50 cards pendentes a qualquer momento

### Tags por módulo
Prefixar cada card com o módulo (M1, M2, etc.) para filtrar reviews por módulo durante interleaving.

### Métricas

| Métrica | Meta |
|---------|------|
| Cards criados/semana | 15-25 |
| Taxa de acerto após 2 semanas | >80% |
| Cards pendentes | <50 |

---

## Como Usar Este Map

### Durante o estudo
1. **Use learning-map modular** do módulo atual para tática diária
2. **Volte aqui** para lembrar da visão geral e próximos passos

### Finais de semana
1. **Atualize progresso** neste arquivo
2. **Verifique saúde do projeto**
3. **Planeje ajustes** se necessário

### Final de trimestre
1. **Faça retrospectiva trimestral** (`shared/retrospectives/quarterly/`)
2. **Revise conexões** entre módulos completados
3. **Ajuste cronograma** se necessário

---

## Links Rápidos

### Módulos
- [M1: Math Foundations](../M1-math-foundations/README.md)
- [M2: Zig Foundations](../M2-zig-foundations/README.md)
- [M3: Data Structures](../M3-data-structures/README.md)
- [M4: Algorithms](../M4-algorithms/README.md)
- [M5: Go + OS/CPU](../M5-go-os-cpu/README.md)
- [M6: Networking + DB](../M6-networking-db/README.md)
- [M7: Compilers](../M7-compilers/README.md)
- [M8: Capstone](../M8-capstone/README.md)

### Recursos
- [SRS Master Deck](./flashcards/master-deck.csv)
- [Retrospectivas Trimestrais](./retrospectives/quarterly/)

---

**Última atualização**: 2026-03-02
**Versão**: 5.0 (Zig era, estrutura revisada)
