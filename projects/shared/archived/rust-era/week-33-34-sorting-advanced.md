# 📅 Semana 33-34: Sorting Avançado ⚡

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar Merge Sort e Quick Sort
- Entender paradigma "divide and conquer"
- Analisar quando Quick Sort é O(n²)
- Escolher algoritmo certo para cada situação

---

## ❓ Perguntas Guia

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

## 📚 Recursos

### Leitura
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| CLRS | Chapter 7 - Quicksort | Análise completa |
| CLRS | Chapter 2.3 - Merge Sort | Divide and conquer |

### Visualização
| Recurso | Propósito |
|---------|-----------|
| Visualgo.net | Ver partitioning em ação |

---

## 📋 Entregas

### Semana 33: Implementação

**Dia 1: Divide and Conquer**
- [ ] Responder perguntas 1-4
- [ ] Pesquisar: outros algoritmos divide and conquer
- [ ] Desenhar árvore de recursão para array de 8 elementos

**Dia 2: Merge Sort**
- [ ] Responder perguntas 5-10
- [ ] Implementar função `merge(left, right)`
- [ ] Implementar `merge_sort(arr)` recursivo
- [ ] Testar com vários tamanhos

**Dia 3: Quick Sort - Básico**
- [ ] Responder perguntas 11-13
- [ ] Implementar `partition(arr, low, high)`
- [ ] Implementar `quick_sort(arr)` recursivo
- [ ] Usar último elemento como pivot

**Dia 4: Quick Sort - Otimizações**
- [ ] Responder perguntas 14-18
- [ ] Implementar "median of three" pivot
- [ ] Implementar versão iterativa (com stack)
- [ ] Testar: array já ordenado (worst case)

**Dia 5: Comparação**
- [ ] Responder perguntas 19-23
- [ ] Benchmark: Merge vs Quick vs Heap
- [ ] Testar com arrays grandes (1M elementos)
- [ ] Documentar resultados

### Semana 34: Análise e Variações

**Dia 1: Análise de Complexidade**
- [ ] Derivar T(n) = 2T(n/2) + O(n) para Merge Sort
- [ ] Entender Master Theorem (básico)
- [ ] Por que resulta em O(n log n)?

**Dia 2: Quick Select**
- [ ] Problema: Find Kth largest element
- [ ] Implementar Quick Select
- [ ] Qual a complexidade média? E pior caso?

**Dia 3: Híbridos**
- [ ] Responder perguntas 24-26
- [ ] Pesquisar: como Rust implementa sort?
- [ ] Pesquisar: como Python implementa sort?
- [ ] Implementar: switch para Insertion Sort quando n < 10

**Dia 4: Problemas**
- [ ] Problema: Sort an array (usar seu algoritmo)
- [ ] Problema: Sort List (merge sort em linked list)
- [ ] Problema: Kth Largest Element in an Array

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Criar decision tree para escolher algoritmo
- [ ] Cards SRS para complexidades e trade-offs
- [ ] Resumo: quando usar qual sorting

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar Merge Sort em 10 minutos
2. [ ] Implementar Quick Sort em 10 minutos
3. [ ] Explicar por que são O(n log n)
4. [ ] Explicar quando Quick Sort é O(n²)
5. [ ] Escolher algoritmo certo para situação

### Teste Prático
Dado um cenário, escolher algoritmo:
- Array de 10 elementos? → Insertion Sort
- Array de 1M elementos, memória limitada? → Quick Sort ou Heap Sort
- Linked list? → Merge Sort
- Dados chegando em stream? → ?
- Precisa ser estável? → Merge Sort

### Red flags (precisa revisar):
- Não sabe implementar partitioning
- Não entende por que merge é O(n)
- Não sabe quando Quick Sort degrada

---

## 🔄 Reflexão

### Divide and Conquer
_Por que dividir o problema ajuda?_

### Prática vs Teoria
_Por que Quick Sort é mais rápido na prática?_

### Trade-offs
_Estabilidade vs velocidade: quando cada um importa?_

---

## ⏭️ Próximo

**Semana 35-36**: Binary Search & Greedy Algorithms
- Como Binary Search resolve mais do que busca em array?
- O que são algoritmos greedy e quando funcionam?
- Binary Search em espaço de busca abstrato
