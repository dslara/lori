# 📅 Semana 27-28: Heaps & Union-Find 🏔️

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar Binary Heap do zero
- Entender heap property (min/max)
- Implementar Priority Queue usando Heap
- Usar heapsort e entender suas propriedades
- Implementar Union-Find (Disjoint Set Union) com otimizações

---

## ❓ Perguntas Guia

### Conceitos
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
24. Em Rust, como usar `std::collections::BinaryHeap`?

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
36. Problema: Número de ilhas (connected components)

---

## 📚 Recursos

### Leitura
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| CLRS | Chapter 6 - Heapsort | Teoria completa |
| Visualgo.net | Heap | Visualização interativa |

### Em Rust
| Recurso | Propósito |
|---------|-----------|
| `std::collections::BinaryHeap` docs | Max-heap em Rust |

---

## 📋 Entregas

### Semana 27: Implementação

**Dia 1: Conceitos**
- [ ] Responder perguntas 1-5
- [ ] Desenhar min-heap com 10 elementos
- [ ] Desenhar max-heap com 10 elementos
- [ ] Verificar: todos os níveis completos exceto último?

**Dia 2: Array Representation**
- [ ] Responder perguntas 6-10
- [ ] Implementar funções: parent(i), left(i), right(i)
- [ ] Converter árvore desenhada para array
- [ ] Converter array para visualização de árvore

**Dia 3: Heapify e Build**
- [ ] Responder perguntas 11, 16
- [ ] Implementar `heapify(i)` / sift-down
- [ ] Implementar `build_heap(array)`
- [ ] Testar: array aleatório vira heap válido?

**Dia 4: Insert e Extract**
- [ ] Responder perguntas 12-15
- [ ] Implementar `insert(value)`
- [ ] Implementar `extract_min()` ou `extract_max()`
- [ ] Implementar `peek()`

**Dia 5: MinHeap Completo**
- [ ] Implementar `MinHeap<T>` completo
- [ ] Todos os métodos funcionando
- [ ] Testar com múltiplas operações
- [ ] Benchmark vs BinaryHeap

### Semana 28: Heapsort, Priority Queue & Union-Find

**Dia 1: Heapsort**
- [ ] Responder perguntas 17-20
- [ ] Implementar heapsort
- [ ] Testar com arrays de vários tamanhos
- [ ] Comparar tempo com outros sorts

**Dia 2: Priority Queue**
- [ ] Responder perguntas 21-24
- [ ] Criar `PriorityQueue<T>` usando seu Heap
- [ ] Explorar `std::collections::BinaryHeap`
- [ ] Note: BinaryHeap é max-heap, como fazer min-heap?

**Dia 3: Union-Find Basics**
- [ ] Responder perguntas 28-30
- [ ] Implementar Union-Find básico (sem otimizações)
- [ ] Testar com exemplos simples
- [ ] Visualizar árvores formadas

**Dia 4: Union-Find Otimizado**
- [ ] Responder perguntas 31-34
- [ ] Implementar path compression
- [ ] Implementar union by rank/size
- [ ] Comparar performance: com vs sem otimizações

**Dia 5: Consolidação**
- [ ] Responder perguntas 35-36
- [ ] Problema: Number of Islands (com Union-Find)
- [ ] Problema: Kth Largest Element (com Heap)
- [ ] Criar cheat sheet: Heap + Union-Find operations
- [ ] Cards SRS para fórmulas e complexidades

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar min-heap do zero em 20 minutos
2. [ ] Calcular índices parent/child sem pensar
3. [ ] Explicar por que build-heap é O(n)
4. [ ] Resolver "K largest" em 10 minutos
5. [ ] Explicar quando heap é melhor que sorting
6. [ ] Implementar Union-Find com path compression em 10 minutos
7. [ ] Explicar quando usar Union-Find vs DFS

### Fórmulas para Decorar
```
// Heap
parent(i) = (i - 1) / 2
left(i) = 2 * i + 1
right(i) = 2 * i + 2

// Union-Find com path compression
fn find(x) -> root:
    if parent[x] != x:
        parent[x] = find(parent[x])  // path compression
    return parent[x]
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
- Confunde heapify com build
- Não entende por que build é O(n)
- Não consegue implementar path compression

---

## 🔄 Reflexão

### Array vs Ponteiros
_Por que representar árvore em array funciona bem para heaps?_

### Trade-offs
_Quando usar Heap vs BST vs HashMap?_

### Union-Find
_Por que Union-Find é tão eficiente para conectividade?_

### Conexão
_Como Heap e Union-Find serão usados em algoritmos de grafos?_

---

## 🏁 Fim da Fase 2!

### Benchmark Q1
Você está pronto para o benchmark:
- Implementar 5 estruturas em 90 minutos
- Vec, Stack, Queue, HashMap, BST ou Heap
- **Bônus**: Union-Find

### Próximo

**Semana 31-32**: Sorting Básico (Fase 3)
- Bubble, Selection, Insertion
- Por que O(n²) às vezes é aceitável?
- Quando cada um é melhor?
