# Plan Review v5: Proposta de Revisao do Master Learning Map

> **Data**: 2026-03-02
> **Contexto**: Analise critica do plano v4.0 com propostas de melhoria
> **Status**: Proposta (nao implementado ainda)

---

## Indice

- [Diagnostico](#diagnostico)
- [Proposta 1: Dissolver M5](#proposta-1-dissolver-m5)
- [Proposta 2: Quebrar M6](#proposta-2-quebrar-m6)
- [Proposta 3: Mover Grafos de M1 para M3](#proposta-3-mover-grafos-de-m1-para-m3)
- [Proposta 4: Dual-Language em M3/M4](#proposta-4-dual-language-em-m3m4)
- [Proposta 5: Interleaving](#proposta-5-interleaving)
- [Proposta 6: Processo SRS](#proposta-6-processo-srs)
- [Proposta 7: Kill-Switch / Minimum Viable](#proposta-7-kill-switch--minimum-viable)
- [Nova Estrutura Proposta](#nova-estrutura-proposta)
- [Decisoes Pendentes](#decisoes-pendentes)

---

## Diagnostico

### O que esta bom no plano v4.0
- Buffers explicitos (8 semanas) -- essencial para 22 meses
- Milestones com criterios concretos ("7/10 LeetCode", "HTTP server do zero")
- Tracking de saude com semaforo verde/amarelo/vermelho
- Perguntas centrais por modulo -- boa ancora para manter foco
- Filosofia "Sustentabilidade > Velocidade"

### Problemas identificados

| # | Problema | Impacto | Severidade |
|---|---------|---------|------------|
| 1 | M5 mistura comptime + DP sem conexao pedagogica | Confusao conceitual | Alto |
| 2 | M6 cobre 5+ disciplinas em 18 semanas sem milestone intermediario | Risco de superficialidade | Alto |
| 3 | Plano 100% sequencial sem interleaving | Retencao baixa a longo prazo | Alto |
| 4 | SRS mencionado mas sem processo definido | Abandono provavel | Medio |
| 5 | M1-W5 tenta cobrir combinatoria + probabilidade + grafos em 1 semana | Overload | Medio |
| 6 | Sem mecanismo de kill-switch para modulos atrasados | Efeito domino de atrasos | Medio |
| 7 | M3 implementa tudo em Zig, misturando dificuldade da linguagem com conceito de DS | Overhead cognitivo | Medio |

---

## Proposta 1: Dissolver M5

### Problema
Comptime (metaprogramacao Zig) e Dynamic Programming (paradigma algoritmico) nao tem conexao pedagogica. Estao juntos por conveniencia de scheduling.

### Solucao
- **Comptime (2w)** -> absorver no final de M2 (Zig Foundations), que passa de 8w para 10w
- **DP (2w)** -> absorver em M4 (Algorithms), que passa de 12w para 14w

### Justificativa
- Comptime e extensao natural de Zig foundations (pointers -> allocators -> comptime)
- DP e um paradigma algoritmico e pertence organicamente junto com sorting, grafos, etc.
- Reduz de 8 para 7 modulos, mais coeso

### Impacto
- M2: 8w/40h -> 10w/50h (inclui comptime patterns + code gen)
- M4: 12w/60h -> 14w/70h (inclui memoization + tabulation + ~15 problemas DP)
- M5: eliminado

---

## Proposta 2: Quebrar M6

### Problema
90h para Go + CPU + OS + Concorrencia + TCP/IP + HTTP + DB Storage + DB Transactions e disperso. Sem milestone intermediario, problemas so aparecem na semana 67.

### Solucao

| Sub | Semanas | Foco | Horas |
|-----|---------|------|-------|
| **M5: Go + OS/CPU** | W50-58 (9w) | Go basics, concorrencia, CPU/cache, OS processes, scheduling | 45h |
| **M6: Networking + DB** | W59-67 (9w) | TCP/IP, HTTP from scratch, DB storage (B-Trees), transactions | 45h |

### Milestones intermediarios
- **M5 milestone (W58)**: goroutine scheduler diagram + mutex implementation explicada
- **M6 milestone (W67)**: HTTP server from scratch (benchmark Q3 original)

### Justificativa
- Ponto de decisao na W58: se M5 atrasar, voce sabe antes de comprometer M6
- Cada sub-modulo tem foco tematico coerente
- OS/CPU e prerequisito conceitual para networking (entender sockets precisa entender processos)

---

## Proposta 3: Mover Grafos de M1 para M3

### Problema
M1-W5 tenta cobrir combinatoria + probabilidade + grafos numa so semana. Grafos sao mais Data Structures que Math Foundations.

### Solucao
- M1-W5: apenas combinatoria e probabilidade
- M3 comeca com 1 semana de intro a grafos (representacao, terminologia) antes de arrays

### Impacto
- M1-W5 fica gerenciavel
- M3 ganha contexto de grafos cedo, que reaparece em M4

---

## Proposta 4: Dual-Language em M3/M4

### Problema
M3 implementa todas as DS 100% em Zig. Quando o foco deveria ser entender AVL rotation ou hash collision resolution, o aluno gasta tempo debugando segfaults e allocator leaks.

### Solucao
Para cada DS/Algoritmo, seguir a ordem:
1. **Primeiro**: implementar em Python (ou pseudocodigo) para entender o conceito
2. **Depois**: reimplementar em Zig para aprender memory management

### Justificativa
- Separa dificuldades: conceito vs implementacao low-level
- M4 ja faz isso (LeetCode em Python, reimplementa em Zig) -- estender para M3
- Python e mais rapido para prototipar, Zig e melhor para entender memoria

### Nota
M4 ja segue essa abordagem parcialmente (LeetCode em Python). A proposta e formalizar e estender para M3.

---

## Proposta 5: Interleaving

### Problema
Plano 100% sequencial. Pesquisa sobre aprendizado (Bjork, Roediger) mostra que interleaving melhora retencao significativamente.

### Solucao

#### Retrieval bi-semanal
A cada 2 semanas, 1 sessao dedicada a revisao:
- **SRS review** obrigatorio (30min)
- **Mini-quiz** de modulos anteriores (15min)
- **Conexao explicita**: "como o que aprendi hoje conecta com M(N-1)?"

#### Transicao entre modulos
- **Ultimo dia do modulo anterior**: revisao de todos os modulos anteriores (quiz de 5 perguntas por modulo completado)
- **Primeiro dia do novo modulo**: warm-up quiz dos pre-requisitos

#### Exemplo concreto
Ao iniciar M4 (Algorithms), dia 1:
1. Quiz M1: "Prove por inducao que sum(1..n) = n(n+1)/2"
2. Quiz M2: "Explique allocators em Zig como para crianca de 12 anos"
3. Quiz M3: "Quando usar HashMap vs BST? Trade-offs?"
4. So entao: comecar conteudo novo de M4

### Custo
~4h/mes (recuperado com melhor retencao)

---

## Proposta 6: Processo SRS

### Problema
SRS mencionado no tracking de saude mas sem processo definido. 10 cards existem em CSV, nenhum revisado. sync-script referenciado mas inexistente.

### Solucao

#### Ferramenta
**Anki** (desktop + mobile). CSV atual e prototipo -- Anki tem algoritmo SM-2 otimizado e e battle-tested. Importar CSVs existentes e trivial.

#### Quando criar cards
- **Regra**: ao final de cada sessao de estudo, criar 3-5 cards
- **Formato**: pergunta atomica (1 conceito por card)
- **Bom**: "Qual a complexidade de busca em BST balanceada?" -> "O(log n)"
- **Ruim**: "Explique BSTs" (muito amplo)

#### Rotina de revisao
- **Diario**: 10-15min de Anki antes de comecar estudo novo (warm-up)
- **Semanal**: revisar cards marcados como "dificil"
- **Meta**: <50 cards pendentes a qualquer momento

#### Tags
- Tag cada card com modulo (M1, M2, etc.)
- Permite filtrar reviews por modulo para interleaving

#### Metricas

| Metrica | Meta |
|---------|------|
| Cards criados/semana | 15-25 |
| Taxa de acerto apos 2 semanas | >80% |
| Cards pendentes | <50 |

---

## Proposta 7: Kill-Switch / Minimum Viable

### Problema
Nao ha mecanismo para lidar com modulos atrasados. Atraso em um modulo causa efeito domino.

### Solucao
Para cada modulo, definir dois niveis:

| Modulo | Minimum Viable (pode seguir adiante) | Full Scope |
|--------|---------------------------------------|------------|
| M1 | Big O notation + logs + inducao | + combinatoria + probabilidade |
| M2 | Pointers + allocators + basic comptime | + Arena allocator from scratch |
| M3 | Array, LinkedList, HashMap, BST | + AVL, Heap, UnionFind |
| M4 | Sorting + Binary Search + BFS/DFS | + Dijkstra, DP avancado, backtracking |
| M5 (novo) | Go basics + goroutines | + CPU cache, OS scheduling |
| M6 (novo) | TCP basics + HTTP server | + DB storage, transactions |
| M7 | Lexer + Parser | + Interpreter completo |
| M8 | MVP do projeto + docs | + Benchmarks + profiling |

### Regra de kill-switch
Se um modulo esta >2 semanas atrasado **apos consumir o buffer**:
1. Completar apenas o "Minimum Viable"
2. Documentar o que ficou pendente em `retrospectives/`
3. Seguir para o proximo modulo
4. Revisitar no capstone se necessario/desejado

---

## Nova Estrutura Proposta

### Modulos (7 total + Capstone)

| # | Modulo | Semanas | Duracao | Horas | Mudanca vs v4.0 |
|---|--------|---------|---------|-------|-----------------|
| M1 | Math Foundations | 1-5 | 5w | 25h | Grafos movido para M3 |
| M2 | Zig Foundations + Comptime | 7-16 | 10w | 50h | +2w comptime (ex-M5) |
| M3 | Data Structures | 18-29 | 12w | 60h | +intro grafos, dual-language |
| M4 | Algorithms + DP | 31-44 | 14w | 70h | +2w DP (ex-M5) |
| M5 | Go + OS/CPU | 46-54 | 9w | 45h | ex-M6 parte 1 |
| M6 | Networking + DB | 56-64 | 9w | 45h | ex-M6 parte 2 |
| M7 | Compilers | 66-69 | 4w | 20h | sem mudanca |
| M8 | Capstone | 71-84 | 14w | 70h | sem mudanca |

**Buffers**: Semanas 6, 17, 30, 45, 55, 65, 70, 85-88 (12 semanas de buffer)

**Total**: 77 semanas de estudo + 11 semanas de buffer = 88 semanas / 385h

**Nota**: O budget caiu de 440h para 385h. As 55h extras sao margem real para atrasos, aprofundamento, ou interleaving.

### Timeline Visual Revisada

```
Mes 1   [M1: Math]========================= B
Mes 2   [M2: Zig + Comptime================
Mes 3   ====================================
Mes 4   ================== B [M3: Data Str==
Mes 5   ====================================
Mes 6   ====================================
Mes 7   =================== B [M4: Algo+DP=
Mes 8   ====================================
Mes 9   ====================================
Mes 10  ========================= B [M5: Go
Mes 11  ====================================
Mes 12  ====== B [M6: Net+DB================
Mes 13  ====================================
Mes 14  ========= B [M7: Compilers==== B
Mes 15  [M8: Capstone=======================
Mes 16  ====================================
Mes 17  ====================================
Mes 18  ========================= B=========
```

### Dependencias Revisadas

```
M1 (Math) ──────┬──────────────────────┐
                v                      v
M2 (Zig+CT) ───┼──────┬───────────────┤
                v      v               v
          M3 (DS) ─> M4 (Algo+DP)     │
                                       v
                            M5 (Go+OS) ──> M6 (Net+DB)
                                       │
                            M7 (Compilers)
                                       │
                                       v
                                M8 (Capstone)
```

### Milestones Revisados

| Trimestre | Semana | Benchmark | Criterio de Sucesso |
|-----------|--------|-----------|---------------------|
| **Q1** | ~17 | Mini-Projeto 1 | Arena Allocator funcional + comptime patterns demo |
| **Q2** | ~45 | Algoritmos + DP | 7/10 LeetCode + Fibonacci/LCS/Knapsack top-down e bottom-up |
| **Q3** | ~65 | Systems | HTTP server from scratch explicado |
| **Q4** | ~84 | Capstone | Projeto final + documentacao |

---

## Decisoes Pendentes

Estas decisoes devem ser tomadas antes de implementar as mudancas no master-learning-map:

- [ ] Confirmar dissolucao de M5 (comptime -> M2, DP -> M4) vs manter como modulo separado
- [ ] Confirmar quebra de M6 em dois sub-modulos
- [ ] Escolher ferramenta SRS: Anki vs manter CSV custom
- [ ] Definir se M3 adota dual-language (Python + Zig) ou mantem Zig-only
- [ ] Revisar weekly plans dos modulos afetados (M2, M3, M4, M6)
- [ ] Atualizar resources-master.md com novas atribuicoes de recursos por modulo
- [ ] Criar template de interleaving quiz por modulo

---

**Proximos passos**: Apos decisoes acima, atualizar:
1. `shared/master-learning-map.md` (v5.0)
2. READMEs dos modulos afetados
3. learning-maps dos modulos afetados
4. `shared/resources-master.md`
5. Template de interleaving quiz
6. Processo SRS documentado

---

*Documento criado em 2026-03-02 como proposta de revisao.*
