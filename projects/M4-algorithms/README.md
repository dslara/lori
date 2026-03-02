# M4: Algorithms + DP

**Objetivo**: Dominar algoritmos clássicos e análise de complexidade.

**Semanas**: 31-44 (14 semanas, ~70h)  
**Pré-requisitos**: M2 (implementação em Zig) + M3 (estruturas de dados como substrato)  
**Módulo anterior**: [M3: Data Structures](../M3-data-structures/README.md)  
**Próximo módulo**: [M5: Go + OS/CPU](../M5-go-os-cpu/README.md)

---

## O que você vai aprender

- Sorting básico (bubble, insertion, selection) — quando O(n²) é aceitável
- Sorting avançado (merge, quick, heap) — trade-offs de cada algoritmo
- Binary Search e variações — quando e como aplicar
- Greedy algorithms — quando greedy funciona e quando não funciona
- Recursão e backtracking — como a call stack funciona
- Grafos: representação (matriz vs lista de adjacência)
- Grafos: BFS, DFS, Dijkstra, Topological Sort
- Dynamic Programming: memoizacao e tabulacao
- **Estrategia**: Resolver ~40 problemas LeetCode em Python, reimplementar em Zig

---

## Pré-requisitos (checklist)

Antes de começar M4, confirme:
- [ ] Implementei BST, Heap e HashMap do zero em M3
- [ ] Benchmark Q1 concluído (5 DS em 90 min)
- [ ] Entendo análise de complexidade Big O com clareza (M1)
- [ ] Mini-Projeto 2 (Config Parser) concluído

---

## Timeline Semanal

| Semana | Tema | Pergunta Central | LeetCode Meta |
|--------|------|-----------------|---------------|
| 31-32 | Sorting Básico | Por que O(n²) é aceitável às vezes? | 3 Easy (Python) |
| 33-34 | Sorting Avançado | Qual o trade-off de cada algoritmo? | 3 Easy/Med (Python) |
| 35-36 | Binary Search & Greedy | Quando usar binary search? Quando greedy funciona? | 6 Med (Python) |
| 37-38 | Recursão | Como a call stack funciona? | 4 Medium (Python) |
| 39-40 | Grafos: Representação | Matriz vs Lista: quando usar cada? | 3 Medium (Python) |
| 41-42 | Grafos: Algoritmos | Como Dijkstra garante caminho mínimo? | 5 Med/Hard (Python) |
| 43 | DP: Memoizacao | Como identificar subproblemas? | 4 Medium (Python) |
| 44 | DP: Tabulacao + Mini-Projeto 3 | Quando bottom-up e melhor? | 4 Medium (Python) |

**Buffer 4** (Semana 45): Recuperacao antes do M5.

---

## Arquivos deste módulo

```
meta/
├── phase-3-overview.md              # Visão completa do phase
├── week-31-32-sorting-basic.md
├── week-33-34-sorting-advanced.md
├── week-35-36-binary-search-greedy.md
├── week-37-38-recursion.md
├── week-39-40-graphs-repr.md
├── week-41-42-graphs-algo.md
├── week-43-dp-memoization.md
├── week-44-dp-tabulation.md
└── mini-project-3-benchmark-generator.md
```

---

## Benchmark de conclusão (Q2)

**Benchmark Q2** (Semana 44): Resolver 10 problemas LeetCode (7/10 para passar).

Ao terminar M4, você deve conseguir:
- [ ] Analisar complexidade de qualquer código com confiança
- [ ] Resolver problemas medium no LeetCode com estratégia clara
- [ ] Explicar Dijkstra, merge sort e binary search sem consulta
- [ ] Identificar quando usar greedy vs backtracking vs DP
- [ ] Benchmark Generator funcional (Mini-Projeto 3)

---

## Conexões com outros módulos

- **M1 (Math)**: Provas de corretude e análise matemática de complexidade
- **M3 (Data Structures)**: Algoritmos usam DS como substrato (heaps em heapsort, etc.)
- **M5 (Go + OS/CPU)**: Conexoes de analise e performance
- **M7 (Compilers)**: Parsing usa recursão (Recursive Descent) — M4 prepara

---

## Retrieval de módulos anteriores

**Semana 31 deste modulo** (antes de comecar):
- [ ] Quiz M3 (10 min): "Implemente um BST insert de cabeça. O que garante balanceamento?"
- [ ] Quiz M2 (5 min): "O que é um allocator? Por que não usar malloc diretamente em Zig?"

---

## Como começar

```
echo "M4-algorithms" > .current-topic
make start
```

Comece por `meta/phase-3-overview.md`, depois `meta/week-31-32-sorting-basic.md`.
