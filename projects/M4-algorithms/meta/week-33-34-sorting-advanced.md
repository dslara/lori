# Semana 33-34: Sorting Avançado

> **Estratégia**: Implementar em Zig; LeetCode via Python

## Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar Merge Sort e Quick Sort em Zig
- Entender paradigma "divide and conquer"
- Analisar quando Quick Sort é O(n²)
- Escolher algoritmo certo para cada situação

---

## Perguntas Guia

### Divide and Conquer
1. O que é o paradigma "divide and conquer"?
2. Quais são os 3 passos?
3. Por que divide and conquer geralmente resulta em O(n log n)?
4. Como recursão se relaciona com divide and conquer?

### Merge Sort
5. Como Merge Sort funciona?
6. O que significa "merge" duas listas ordenadas?
7. Por que Merge Sort é sempre O(n log n)?
8. Qual a complexidade de espaço? Por quê?
9. Merge Sort é estável? Por quê?
10. Como implementar merge sem espaço extra? (É possível?)

### Quick Sort
11. Como Quick Sort funciona?
12. O que é "pivot"?
13. O que é "partitioning"?
14. Qual a complexidade no caso médio?
15. Quando Quick Sort é O(n²)?
16. Como escolher bom pivot?
17. O que é "median of three"?
18. Quick Sort é estável? Por quê?
19. Por que Quick Sort é geralmente mais rápido que Merge Sort na prática?

### Comparação
20. Merge Sort vs Quick Sort: quando usar cada?
21. O que significa "cache-friendly"?
22. Por que Quick Sort é mais cache-friendly?
23. Quando usar Heap Sort em vez dos dois?

### Híbridos
24. O que é Introsort?
25. Por que stdlib geralmente usa algoritmos híbridos?
26. O que é Timsort? Onde é usado?

---

## Recursos

| Recurso | Seção | Propósito |
|---------|-------|-----------|
| CLRS | Chapter 7 - Quicksort | Análise completa |
| CLRS | Chapter 2.3 - Merge Sort | Divide and conquer |
| Visualgo.net | Sorting | Ver partitioning em ação |
| Zig stdlib | `std/sort.zig` | Ver implementação real |

---

## Entregas

### Semana 32: Implementação

**Dia 1: Divide and Conquer**
- [ ] Responder perguntas 1-4
- [ ] Pesquisar: outros algoritmos divide and conquer
- [ ] Desenhar árvore de recursão para array de 8 elementos

**Dia 2: Merge Sort**
- [ ] Responder perguntas 5-10
- [ ] Implementar `merge(allocator, left: []T, right: []T) ![]T` em Zig
- [ ] Implementar `mergeSort(allocator, arr: []T) ![]T` recursivo
- [ ] Testar com vários tamanhos

**Dia 3: Quick Sort — Básico**
- [ ] Responder perguntas 11-13
- [ ] Implementar `partition(arr: []i32, low: usize, high: usize) usize`
- [ ] Implementar `quickSort(arr: []i32) void` recursivo
- [ ] Usar último elemento como pivot

**Dia 4: Quick Sort — Otimizações**
- [ ] Responder perguntas 14-18
- [ ] Implementar "median of three" pivot
- [ ] Implementar versão iterativa (com stack explícita em Zig)
- [ ] Testar: array já ordenado (worst case)

**Dia 5: Comparação**
- [ ] Responder perguntas 19-23
- [ ] Benchmark: Merge vs Quick vs Heap com `std.time.Timer`
- [ ] Testar com arrays grandes (100k elementos)
- [ ] Documentar resultados

### Semana 33: Análise e Variações

**Dia 1: Análise de Complexidade**
- [ ] Derivar T(n) = 2T(n/2) + O(n) para Merge Sort
- [ ] Entender Master Theorem (básico)
- [ ] Por que resulta em O(n log n)?

**Dia 2: Quick Select**
- [ ] Problema: Find Kth largest element
- [ ] Implementar Quick Select em Zig
- [ ] Qual a complexidade média? E pior caso?

**Dia 3: Híbridos e stdlib**
- [ ] Responder perguntas 24-26
- [ ] Pesquisar: como Zig stdlib implementa sort? (`std.sort.block`)
- [ ] Implementar: switch para Insertion Sort quando n < 16
- [ ] Comparar: stdlib vs sua implementação

**Dia 4: Problemas (Python → Zig)**
- [ ] Resolver (Python): Sort an array (LeetCode 912)
- [ ] Resolver (Python): Kth Largest Element (LeetCode 215)
- [ ] Reimplementar Quick Select em Zig

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Criar decision tree para escolher algoritmo
- [ ] Cards SRS para complexidades e trade-offs

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar Merge Sort em Zig em 10 minutos
2. [ ] Implementar Quick Sort em Zig em 10 minutos
3. [ ] Explicar por que são O(n log n)
4. [ ] Explicar quando Quick Sort é O(n²)
5. [ ] Escolher algoritmo certo para situação

### Teste Prático
Dado cenário, escolher algoritmo:
- Array de 10 elementos? → Insertion Sort
- Array de 1M elementos, memória limitada? → Quick Sort ou Heap Sort
- Linked list? → Merge Sort
- Precisa ser estável? → Merge Sort

### Red flags (precisa revisar):
- Não sabe implementar partitioning
- Não entende por que merge é O(n)
- Não sabe quando Quick Sort degrada

---

## Reflexão

### Divide and Conquer
_Por que dividir o problema ajuda?_

### Prática vs Teoria
_Por que Quick Sort é mais rápido na prática?_

### Trade-offs
_Estabilidade vs velocidade: quando cada um importa?_

---

## Próximo

**Semana 34-35**: Binary Search & Greedy Algorithms
- Como Binary Search resolve mais do que busca em array?
- O que são algoritmos greedy e quando funcionam?
- Binary Search em espaço de busca abstrato
