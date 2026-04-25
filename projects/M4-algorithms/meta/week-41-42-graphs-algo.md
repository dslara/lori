# Semana 41-42: Grafos - Algoritmos

## Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar BFS e DFS em Zig
- Resolver problemas de caminho mínimo
- Implementar Dijkstra com heap
- Fazer ordenação topológica

**Linguagem**: Python no LeetCode, Zig localmente para implementações

---

## Perguntas Guia

### BFS (Breadth-First Search)
1. Como BFS funciona?
2. Que estrutura de dados BFS usa?
3. Por que BFS encontra menor caminho em grafos não-ponderados?
4. Qual a complexidade de BFS?
5. Que problemas BFS resolve bem?
6. Como reconstruir o caminho em BFS?

### DFS (Depth-First Search)
7. Como DFS funciona?
8. Que estrutura de dados DFS usa?
9. DFS pode ser implementado com recursão?
10. Qual a complexidade de DFS?
11. Que problemas DFS resolve bem?
12. O que são "discovery time" e "finish time"?
13. Como DFS detecta ciclos?

### BFS vs DFS
14. Quando usar BFS? Quando usar DFS?
15. Qual usa mais memória para grafo largo?
16. Qual usa mais memória para grafo profundo?
17. Qual garante menor caminho (não-ponderado)?

### Dijkstra
18. Que problema Dijkstra resolve?
19. Por que BFS não funciona para grafos ponderados?
20. Como Dijkstra funciona?
21. Que estrutura de dados Dijkstra usa?
22. Qual a complexidade de Dijkstra?
23. Dijkstra funciona com pesos negativos?
24. Como reconstruir o caminho em Dijkstra?

### Topological Sort
25. O que é ordenação topológica?
26. Em que tipo de grafo funciona?
27. Como implementar usando DFS?
28. Como implementar usando BFS (Kahn's algorithm)?
29. Quais as aplicações de topological sort?

---

## Recursos

### Leitura
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| CLRS | Chapter 22 - BFS, DFS | Algoritmos base |
| CLRS | Chapter 24 - Dijkstra | Caminho mínimo |
| Visualgo.net | Graph Traversal | Ver algoritmos |

---

## Entregas

### Semana 41: BFS e DFS

**Dia 1: BFS**
- [ ] Responder perguntas 1-6
- [ ] Implementar BFS iterativo em Zig (usando `std.fifo.LinearFifo`)
- [ ] Traçar execução em grafo de exemplo
- [ ] Encontrar menor caminho (não-ponderado)

**Dia 2: DFS**
- [ ] Responder perguntas 7-13
- [ ] Implementar DFS recursivo em Zig
- [ ] Implementar DFS iterativo em Zig (usando `std.ArrayList` como stack)
- [ ] Detectar ciclo usando DFS

**Dia 3: Comparação**
- [ ] Responder perguntas 14-17
- [ ] Testar ambos no mesmo grafo
- [ ] Comparar ordem de visitação
- [ ] Medir uso de memória

**Dia 4: Problemas BFS**
- [ ] Problema: Number of Islands — Python
- [ ] Problema: Shortest Path in Binary Matrix — Python
- [ ] Problema: Rotting Oranges — Python
- [ ] Problema: Word Ladder — Python

**Dia 5: Problemas DFS**
- [ ] Problema: Clone Graph — Python
- [ ] Problema: Course Schedule (detectar ciclo) — Python
- [ ] Problema: Number of Connected Components — Python
- [ ] Problema: Pacific Atlantic Water Flow — Python

### Semana 42: Dijkstra e Topological Sort

**Dia 1: Dijkstra - Conceitos**
- [ ] Responder perguntas 18-21
- [ ] Por que BFS não funciona aqui?
- [ ] Desenhar execução passo a passo
- [ ] Implementar versão básica (sem heap) em Zig

**Dia 2: Dijkstra - Otimizado**
- [ ] Responder perguntas 22-24
- [ ] Implementar com Priority Queue (`std.PriorityQueue`) em Zig
- [ ] Reconstruir caminho, não só distância
- [ ] Testar em grafo grande

**Dia 3: Topological Sort**
- [ ] Responder perguntas 25-29
- [ ] Implementar com DFS em Zig
- [ ] Implementar com Kahn's algorithm (BFS) em Zig
- [ ] Comparar as abordagens

**Dia 4: Problemas**
- [ ] Problema: Network Delay Time (Dijkstra) — Python
- [ ] Problema: Course Schedule II (Topological Sort) — Python
- [ ] Problema: Cheapest Flights Within K Stops — Python
- [ ] Problema: Alien Dictionary — Python

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Criar biblioteca de algoritmos de grafo em Zig
- [ ] Cards SRS para algoritmos e complexidades
- [ ] Resumo: decision tree para problemas de grafo

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar BFS e DFS em 5 minutos cada
2. [ ] Explicar quando usar cada um
3. [ ] Implementar Dijkstra com heap
4. [ ] Fazer topological sort de duas formas
5. [ ] Modelar problema e escolher algoritmo

### Complexidades

| Algoritmo | Tempo | Espaço |
|-----------|-------|--------|
| BFS | O(V + E) | O(V) |
| DFS | O(V + E) | O(V) |
| Dijkstra (heap) | O((V + E) log V) | O(V) |
| Topological Sort | O(V + E) | O(V) |

### Decision Tree para Grafos

```
Problema de grafo?
├── Menor caminho?
│   ├── Não-ponderado → BFS
│   ├── Ponderado (positivo) → Dijkstra
│   └── Ponderado (negativo) → Bellman-Ford
├── Explorar tudo?
│   ├── Nível por nível → BFS
│   └── Profundidade primeiro → DFS
├── Detectar ciclo? → DFS
├── Componentes conectados? → DFS ou BFS
└── Ordenar dependências? → Topological Sort
```

### Red flags (precisa revisar):
- Confunde BFS com DFS
- Não sabe por que Dijkstra usa heap
- Não reconhece quando usar topological sort

---

## Reflexão

### Padrões
_Que padrões de problemas você reconhece agora?_

### Estruturas de Dados
_Como Queue, Stack e Heap se conectam com grafos?_

### Aplicações
_Onde você usaria esses algoritmos?_

---

## Fim da Fase 3!

### Benchmark Q2
Você está pronto para o benchmark:
- 10 problemas em 2 horas
- 7/10 para passar

### Próximo

**Semana 43**: DP - Memoizacao
- Como identificar subproblemas e subestrutura otima?
