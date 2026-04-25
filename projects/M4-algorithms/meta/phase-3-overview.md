# Fase 3: Algorithms + DP (Meses 8-11)

> **Semanas reais no timeline**: 31-44 (após Mini-Projeto 2 + Buffer F2→F3)
> **Arquivos**: `week-31-32-sorting-basic.md` até `week-44-dp-tabulation.md`

## Visão Geral

**Duração**: 14 semanas (70 horas)
**Objetivo**: Dominar análise e implementação de algoritmos clássicos

---

## Estratégia: Python + Zig

> **LeetCode em Python, reimplementar em Zig localmente**

Zig não tem suporte oficial no LeetCode. A estratégia para esta fase:

1. **LeetCode**: Resolver em Python (aceito oficialmente, rápido de testar)
2. **Zig local**: Reimplementar algoritmos centrais em Zig no projeto `cs-fundamentals-zig/`
3. **Objetivo**: Entender o algoritmo; Python é apenas o meio de teste no LC

Cada arquivo de semana indica explicitamente quais problemas resolver em Python e quais reimplementar em Zig.

---

## Pergunta Central

> Como analisar e comparar algoritmos?

Não basta saber que quicksort é O(n log n). Você precisa entender:
- Por que é O(n log n)?
- Quando é O(n²)?
- Quando usar vs mergesort?
- Como analisar algoritmo novo?

---

## Semanas

| Semana | Tema | Pergunta Guia | Arquivo |
|--------|------|---------------|---------|
| 31-32 | Sorting Básico | Por que O(n²) é aceitável às vezes? | `week-31-32-sorting-basic.md` |
| 33-34 | Sorting Avançado | Qual o trade-off de cada algoritmo? | `week-33-34-sorting-advanced.md` |
| 35-36 | Binary Search & Greedy | Quando usar BS? Quando greedy funciona? | `week-35-36-binary-search-greedy.md` |
| 37-38 | Recursão | Como a call stack funciona? | `week-37-38-recursion.md` |
| 39-40 | Grafos: Representação | Matriz vs Lista: quando usar? | `week-39-40-graphs-repr.md` |
| 41-42 | Grafos: Algoritmos | Como Dijkstra garante caminho mínimo? | `week-41-42-graphs-algo.md` |
| 43 | DP: Memoizacao | Como identificar subproblemas? | `week-43-dp-memoization.md` |
| 44 | DP: Tabulacao | Quando bottom-up e melhor? | `week-44-dp-tabulation.md` |

---

## Algoritmos a Dominar

### Sorting
- **Bubble Sort**: O mais simples, O(n²)
- **Selection Sort**: Mínimo de swaps
- **Insertion Sort**: Bom para quase-ordenados
- **Merge Sort**: Divide and conquer, estável
- **Quick Sort**: In-place, cache-friendly
- **Heap Sort**: Garantido O(n log n)

### Busca
- **Linear Search**: O(n), qualquer array
- **Binary Search**: O(log n), array ordenado
- **Binary Search Variações**: lower_bound, upper_bound, search on answer

### Greedy
- **Activity Selection**: Escolha local ótima
- **Fractional Knapsack**: Greedy funciona
- **Interval Scheduling**: Maximizar intervalos

### Grafos
- **BFS**: Menor caminho (não-ponderado)
- **DFS**: Exploração, ciclos
- **Dijkstra**: Menor caminho (ponderado)
- **Topological Sort**: Ordenação de dependências

---

## Para Cada Algoritmo

Você deve ser capaz de:

1. **Implementar do zero** sem consulta (em Zig)
2. **Analisar complexidade** (tempo e espaço)
3. **Explicar funcionamento** com exemplo
4. **Identificar casos de uso** ideais
5. **Comparar trade-offs** vs alternativas

---

## Benchmark da Fase (Q2)

### Desafio: 10 Problemas
Resolver em 2 horas (Python no LC), 7/10 para passar:

1. Binary search em array rotacionado
2. Merge two sorted arrays
3. Quick select (Kth element)
4. Detect cycle in linked list
5. Valid parentheses
6. BFS — shortest path in grid
7. DFS — number of islands
8. Topological sort
9. Two sum
10. Maximum subarray

### Projeto da Fase
**Mini-Projeto 3**: Benchmark Generator (ver `mini-project-3-benchmark-generator.md`)

---

## Recursos Principais

| Recurso | Uso |
|---------|-----|
| CLRS | Referência teórica |
| Visualgo.net | Visualizações |
| LeetCode (via Python) | Prática de problemas |
| Zig stdlib: `std/sort.zig` | Implementação real de sorting |

---

## Conexões

### Usa conhecimentos de
- **Fase 0**: Big O, logaritmos, indução
- **Fase 1**: Zig — allocators, ponteiros, comptime para implementar
- **Fase 2**: Estruturas de dados como substrato

### Prepara para
- **Fase 4**: Go + OS/CPU
- **Fase 5**: Algoritmos de sistemas

---

## Complexidades para Decorar

### Sorting
| Algoritmo | Melhor | Médio | Pior | Espaço | Estável |
|-----------|--------|-------|------|--------|---------|
| Bubble | O(n) | O(n²) | O(n²) | O(1) | Sim |
| Selection | O(n²) | O(n²) | O(n²) | O(1) | Não |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | Sim |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | Sim |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | Não |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | Não |

### Grafos
| Algoritmo | Complexidade | Estrutura |
|-----------|-------------|-----------|
| BFS | O(V + E) | Queue |
| DFS | O(V + E) | Stack/Recursão |
| Dijkstra | O((V + E) log V) | Priority Queue |

---

## Tracking

- [ ] Semana 31-32 completa (Sorting Básico)
- [ ] Semana 33-34 completa (Sorting Avançado)
- [ ] Semana 35-36 completa (Binary Search & Greedy)
- [ ] Semana 37-38 completa (Recursão)
- [ ] Semana 39-40 completa (Grafos: Representação)
- [ ] Semana 41-42 completa (Grafos: Algoritmos)
- [ ] Semana 43 completa (DP: Memoizacao)
- [ ] Semana 44 completa (DP: Tabulacao)
- [ ] Benchmark Q2 passado (7/10)
- [ ] Mini-Projeto 3 concluído
- [ ] Cards SRS criados (mínimo 60)

**Confiança geral**: _/5

---

*"Um algoritmo deve ser visto para ser acreditado." — Donald Knuth*
