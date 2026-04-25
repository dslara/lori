# Semana 31-32: Sorting Básico

> **Estratégia**: Implementar em Zig; LeetCode via Python

## Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar Bubble, Selection, e Insertion Sort em Zig
- Analisar complexidade de cada um
- Explicar quando O(n²) é aceitável
- Identificar qual usar em cada situação

---

## Perguntas Guia

### Fundamentos
1. O que significa "ordenar" formalmente?
2. O que é um algoritmo "in-place"?
3. O que é um algoritmo "estável"? Por que importa?
4. O que são "comparisons" e "swaps"?
5. Por que comparamos algoritmos por número de operações?

### Bubble Sort
6. Como Bubble Sort funciona?
7. Por que se chama "bubble"?
8. Qual a complexidade no melhor caso? Por quê?
9. Qual a complexidade no pior caso?
10. Como otimizar Bubble Sort? (early termination)

### Selection Sort
11. Como Selection Sort funciona?
12. Quantos swaps Selection Sort faz no máximo?
13. Por que Selection Sort não é estável?
14. Quando Selection Sort é melhor que Bubble Sort?

### Insertion Sort
15. Como Insertion Sort funciona?
16. Por que é como "ordenar cartas na mão"?
17. Qual a complexidade para array já ordenado?
18. Qual a complexidade para array invertido?
19. Por que Insertion Sort é bom para arrays pequenos?
20. Por que Insertion Sort é bom para arrays "quase ordenados"?

### Comparação
21. Quando usar cada algoritmo?
22. Por que algoritmos O(n²) ainda são ensinados?
23. Qual usa menos memória?
24. Qual faz menos swaps?

---

## Recursos

| Recurso | Seção | Propósito |
|---------|-------|-----------|
| CLRS | Chapter 2 - Getting Started | Insertion Sort analysis |
| Visualgo.net | Sorting | Ver algoritmos em ação |
| https://www.toptal.com/developers/sorting-algorithms | | Comparação visual |

---

## Entregas

### Semana 30: Implementação

**Dia 1: Fundamentos**
- [ ] Responder perguntas 1-5
- [ ] Definir: o que significa array ordenado?
- [ ] Listar 5 situações onde ordenação é necessária

**Dia 2: Bubble Sort**
- [ ] Responder perguntas 6-10
- [ ] Implementar `bubbleSort(arr: []i32) void` em Zig
- [ ] Implementar versão otimizada (early termination)
- [ ] Contar comparisons e swaps com contador

**Dia 3: Selection Sort**
- [ ] Responder perguntas 11-14
- [ ] Implementar `selectionSort(arr: []i32) void` em Zig
- [ ] Demonstrar que não é estável (exemplo)
- [ ] Contar comparisons e swaps

**Dia 4: Insertion Sort**
- [ ] Responder perguntas 15-20
- [ ] Implementar `insertionSort(arr: []i32) void` em Zig
- [ ] Testar com array ordenado vs invertido
- [ ] Contar comparisons e swaps

**Dia 5: Comparação**
- [ ] Responder perguntas 21-24
- [ ] Criar tabela comparativa
- [ ] Benchmark com arrays de vários tamanhos usando `std.time.Timer`

### Semana 31: Análise e Prática

**Dia 1: Análise Formal**
- [ ] Escrever prova de complexidade do Insertion Sort
- [ ] Contar operações em cada caso
- [ ] Entender notação Big O vs Theta vs Omega

**Dia 2: Casos Especiais**
- [ ] Testar com: já ordenado, invertido, aleatório
- [ ] Testar com: duplicatas
- [ ] Testar com: arrays pequenos (n < 10)
- [ ] Documentar comportamento

**Dia 3: Otimizações**
- [ ] Binary Insertion Sort: usar binary search para encontrar posição
- [ ] Implementar em Zig
- [ ] Quando a otimização ajuda?

**Dia 4: Problemas (Python → Zig)**
- [ ] Resolver (Python): Sort Colors (Dutch National Flag) — LeetCode
- [ ] Resolver (Python): Sort array by parity
- [ ] Reimplementar Dutch National Flag em Zig

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Criar cheat sheet de sorting básico
- [ ] Cards SRS para complexidades
- [ ] Preparar: por que precisamos de algo melhor?

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar os 3 algoritmos em Zig em 15 minutos total
2. [ ] Explicar complexidade de cada um
3. [ ] Dizer quando usar cada um
4. [ ] Demonstrar estabilidade/instabilidade
5. [ ] Otimizar Bubble Sort com early termination

### Teste Rápido (sem consulta):
- Bubble Sort é estável?
- Selection Sort faz quantos swaps no máximo?
- Insertion Sort para array ordenado é O(?)?
- Qual dos 3 é melhor para array quase ordenado?

### Red flags (precisa revisar):
- Confunde os algoritmos
- Não sabe explicar "estável"
- Não entende por que O(n²) pode ser OK

---

## Reflexão

### Trade-offs
_Quando O(n²) é aceitável na prática?_

### Simplicidade vs Performance
_Qual o valor de algoritmos simples?_

---

## Próximo

**Semana 32-33**: Sorting Avançado
- Merge Sort: divide and conquer
- Quick Sort: partitioning
- Por que são O(n log n)?
