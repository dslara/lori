# Semana 29: Heaps & Union-Find

## Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar Binary Heap do zero em Zig
- Entender heap property (min/max) e representação em array
- Implementar Priority Queue usando Heap
- Usar heapsort e entender suas propriedades
- Implementar Union-Find (Disjoint Set Union) com otimizações

---

## Perguntas Guia

### Conceitos de Heap
1. O que é um Heap?
2. O que é "heap property"?
3. Qual a diferença entre min-heap e max-heap?
4. Por que Heap é uma "complete binary tree"?
5. Como árvore completa pode ser representada em array?

### Representação em Array
6. Dado índice i, qual o índice do pai?
7. Dado índice i, qual o índice do filho esquerdo?
8. Dado índice i, qual o índice do filho direito?
9. Por que essa representação é eficiente?
10. Qual o índice do último nó não-folha?

### Operações
11. O que é "heapify" (sift-down)?
12. O que é "sift-up"?
13. Qual a complexidade de inserção?
14. Qual a complexidade de extract-min/max?
15. Qual a complexidade de peek?
16. Qual a complexidade de build-heap? Por que não é O(n log n)?

### Heapsort
17. Como heapsort funciona?
18. Qual a complexidade de heapsort?
19. Heapsort é estável? Por quê?
20. Quando usar heapsort vs quicksort vs mergesort?

### Priority Queue
21. O que é Priority Queue?
22. Por que Heap é a implementação padrão?
23. Quais são as operações de PQ?
24. Como implementar min-heap em Zig com `std.PriorityQueue`?

### Aplicações
25. Como encontrar K maiores elementos?
26. Como merge K sorted arrays?
27. O que é Dijkstra e por que usa Heap?

### Union-Find (Disjoint Set Union)
28. O que é Union-Find? Que problema resolve?
29. O que são "conjuntos disjuntos"?
30. Quais são as duas operações principais?
    - `find(x)`: encontrar representante do conjunto
    - `union(x, y)`: unir dois conjuntos
31. O que é "path compression"? Por que é importante?
32. O que é "union by rank/size"? Por que ajuda?
33. Qual a complexidade amortizada com ambas otimizações?
34. Quando usar Union-Find vs DFS/BFS?
35. Como Union-Find é usado em Kruskal's MST?
36. Problema: Número de componentes conectados

---

## Recursos

### Tier 1 (obrigatório)
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| CLRS | Chapter 6 - Heapsort | Teoria completa |
| Visualgo.net | Heap | Visualização interativa |
| LeetCode (via Python) | #215, #23, #547 | Problemas clássicos |

### Tier 2 (referência)
| Recurso | Quando usar |
|---------|-------------|
| Zig stdlib source | `std/priority_queue.zig` | Ver implementação real |

---

## Entregas

### Semana 26: Heap

**Dia 1: Conceitos e Array Representation**
- [ ] Responder perguntas 1-5
- [ ] Desenhar min-heap com 10 elementos
- [ ] Desenhar max-heap com 10 elementos
- [ ] Responder perguntas 6-10: fórmulas de índices
- [ ] Implementar funções: `parent(i)`, `leftChild(i)`, `rightChild(i)`

**Dia 2: Heapify e Build**
- [ ] Responder perguntas 11, 16
- [ ] Implementar `siftDown(heap, i)` (heapify-down)
- [ ] Implementar `buildHeap(arr)` (O(n))
- [ ] Testar: array aleatório vira heap válido?
- [ ] Verificar: por que build é O(n) e não O(n log n)?

**Dia 3: Insert e Extract**
- [ ] Responder perguntas 12-15
- [ ] Implementar `MinHeap(T)` completo em Zig:
  - `init(allocator)`, `deinit()`
  - `insert(value) !void` (sift-up)
  - `extractMin() ?T` (sift-down após swap com último)
  - `peek() ?T`
  - `len() usize`
- [ ] 6+ testes passando sem leaks

**Dia 4: Heapsort + Priority Queue**
- [ ] Responder perguntas 17-24
- [ ] Implementar heapsort in-place em Zig
- [ ] Usar `std.PriorityQueue` da stdlib
- [ ] Comparar: stdlib vs sua implementação

**Dia 5: Problemas com Heap**
- [ ] Responder perguntas 25-27
- [ ] Resolver (Python): #215 Kth Largest Element
- [ ] Resolver (Python): #23 Merge K Sorted Lists
- [ ] Reimplementar Kth Largest em Zig com seu MinHeap

### Semana 27: Union-Find

**Dia 1: Conceito e Implementação Básica**
- [ ] Responder perguntas 28-30
- [ ] Implementar Union-Find básico (sem otimizações):
  - `parent: []usize` array
  - `find(x) usize` — busca raiz naïve
  - `union(x, y) void` — une dois conjuntos
- [ ] Testar com exemplos simples
- [ ] Visualizar árvores formadas

**Dia 2: Path Compression e Union by Rank**
- [ ] Responder perguntas 31-33
- [ ] Adicionar path compression ao `find`:
  - `parent[x] = find(parent[x])` — compressão recursiva
- [ ] Adicionar union by rank/size
- [ ] Benchmark: com vs sem otimizações em 10000 operações

**Dia 3: Aplicações**
- [ ] Responder perguntas 34-36
- [ ] Resolver (Python): #547 Number of Provinces
- [ ] Reimplementar em Zig com Union-Find
- [ ] Estudar: como Kruskal's MST usa Union-Find?

**Dia 4: Consolidação**
- [ ] Resolver (Python): #200 Number of Islands (com Union-Find vs BFS — comparar)
- [ ] Criar cheat sheet: Heap + Union-Find operations e complexidades
- [ ] Cards SRS para fórmulas e complexidades

**Dia 5: Benchmark Final da Fase 2**
- [ ] **Benchmark Q1**: 90 minutos, implementar 5 estruturas
  - ArrayList(T) com push/pop/get
  - Stack(T) usando ArrayList
  - Queue(T) com ring buffer ou dois stacks
  - HashMap básico com chaining
  - BST com insert e search
- [ ] **Critério**: 4/5 funcionando sem leaks = passou
- [ ] Preencher tracking em `phase-2-overview.md`

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar min-heap do zero em 20 minutos
2. [ ] Calcular índices parent/child sem pensar
3. [ ] Explicar por que build-heap é O(n) (não O(n log n))
4. [ ] Resolver "K largest" em 10 minutos com heap
5. [ ] Implementar Union-Find com path compression em 10 minutos
6. [ ] Explicar quando usar Union-Find vs DFS

### Fórmulas para Decorar
```zig
// Heap (0-indexed)
fn parent(i: usize) usize { return (i - 1) / 2; }
fn left(i: usize) usize { return 2 * i + 1; }
fn right(i: usize) usize { return 2 * i + 2; }

// Union-Find com path compression
fn find(parent: []usize, x: usize) usize {
    if (parent[x] != x) {
        parent[x] = find(parent, parent[x]); // compressão
    }
    return parent[x];
}
```

### Complexidades
| Operação | Complexidade |
|----------|-------------|
| Heap: peek | O(1) |
| Heap: insert | O(log n) |
| Heap: extract | O(log n) |
| Heap: build | O(n) |
| Heapsort | O(n log n) |
| UF: find (otimizado) | O(α(n)) ≈ O(1) amortizado |
| UF: union (otimizado) | O(α(n)) ≈ O(1) amortizado |

### Red flags (precisa revisar):
- Não sabe fórmulas de índices de heap
- Confunde heapify (sift-down) com build-heap
- Não entende por que build é O(n)
- Não consegue implementar path compression

---

## Reflexão

### Array vs Ponteiros
_Por que representar árvore em array funciona bem para heaps?_

### Trade-offs
_Quando usar Heap vs BST vs HashMap?_

### Union-Find
_Por que Union-Find é tão eficiente para problemas de conectividade?_

---

## Fim da Fase 2!

### Benchmark Q1
Você está pronto para o benchmark:
- Implementar 5 estruturas em 90 minutos
- ArrayList, Stack, Queue, HashMap, BST
- **Bônus**: MinHeap ou Union-Find

### Próximo

**Semana 28**: Mini-Projeto 2 — Config Parser comptime
**Semana 29**: Buffer F2→F3

**Semana 31**: Fase 3 começa — Sorting Básico
- Bubble, Selection, Insertion
- Por que O(n²) às vezes é aceitável?
