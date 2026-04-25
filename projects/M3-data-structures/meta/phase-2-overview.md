# Fase 2: Data Structures (Meses 5-7)

> **Semanas reais no timeline**: 18-29 (apos Mini-Projeto 1 + Buffer 2)
> **Arquivos**: `week-18-graphs-intro.md` ate `week-29-heaps-union-find.md`

## Visão Geral

**Duração**: 12 semanas (60 horas)
**Objetivo**: Implementar e dominar estruturas de dados clássicas em Zig

---

## Pergunta Central

> Como escolher a estrutura certa para cada problema?

Não basta saber que HashMap tem O(1) lookup. Você precisa entender:
- Por que tem O(1)
- Quando não é O(1)
- Trade-offs de memória
- Como implementar do zero em Zig com allocators explícitos

---

## Semanas

| Semana | Tema | Pergunta Guia | Arquivo |
|--------|------|---------------|---------|
| 18 | Grafos (intro) | Quais as representações básicas? | `week-18-graphs-intro.md` |
| 19-20 | Arrays & ArrayList | Como ArrayList cresce? | `week-19-20-arrays-arraylist.md` |
| 21-22 | Linked Lists | Por que linked lists são diferentes em Zig? | `week-21-22-linked-lists.md` |
| 23-24 | Stacks & Queues | Quais problemas resolvem? | `week-23-24-stacks-queues.md` |
| 25-26 | Hash Tables | Como colisões são resolvidas? | `week-25-26-hash-tables.md` |
| 27-28 | Trees & BST + AVL | Por que O(log n) não é garantido? | `week-27-28-trees-bst-avl.md` |
| 29 | Heaps & Union-Find + Mini-Projeto 2 | Como arvore vira array? | `week-29-heaps-union-find.md` |

---

## Estruturas a Dominar

### Lineares
- **Array/ArrayList**: Contíguo, acesso O(1), crescimento amortizado
- **Linked List**: Não-contíguo, inserção O(1) com nó em mãos
- **Stack**: LIFO
- **Queue**: FIFO
- **Deque**: Double-ended

### Associativas
- **Hash Table**: Key-value O(1) amortizado
- **BST**: Key-value ordenado O(log n) médio

### Hierárquicas
- **Binary Tree**: Estrutura base
- **BST**: Busca ordenada
- **AVL Tree**: BST auto-balanceada O(log n) garantido
- **Heap**: Prioridade

### Conjuntos Disjuntos
- **Union-Find**: Componentes conectados, Kruskal MST

---

## Para Cada Estrutura

Você deve ser capaz de:

1. **Implementar do zero** em Zig com allocator explícito
2. **Analisar complexidade** de cada operação
3. **Explicar trade-offs** vs alternativas
4. **Identificar casos de uso** ideais
5. **Escrever testes** sem memory leaks

---

## Benchmark da Fase (Semana 29)

### Desafio: 90 minutos
Implementar do zero, sem consulta:

1. **ArrayList(T)** com push, pop, get (20 min)
2. **Stack(T)** usando ArrayList (10 min)
3. **Queue(T)** usando dois stacks ou ring buffer (15 min)
4. **HashMap** básico com chaining (25 min)
5. **BST** com insert e search (20 min)

**Critério**: 4/5 funcionando sem leaks = passou

### Projeto da Fase
**LRU Cache**: Estrutura que combina HashMap + Doubly Linked List
- `get(key)` O(1)
- `put(key, value)` O(1)
- Evict least recently used when full
- Implementar em Zig com allocator explícito

---

## Recursos Principais

| Recurso | Uso |
|---------|-----|
| "Introduction to Algorithms" (CLRS) | Referência teórica |
| Visualgo.net | Visualizações interativas |
| Zig stdlib: `std/array_list.zig`, `std/hash_map.zig` | Implementações reais |
| LeetCode (Easy/Medium via Python) | Prática de algoritmos |

---

## Conexões

### Usa conhecimentos de
- **Fase 1**: Allocators, ponteiros, optionals, comptime para implementar DS
- **Fase 0**: Big O, logaritmos, análise de complexidade

### Prepara para
- **Fase 3**: Algoritmos sobre estruturas (sorting, searching, grafos)
- **Fase 3**: Algoritmos sobre estruturas (sorting, searching, grafos)
- **Fase 5**: Databases (B-Trees, Hash indexes)

---

## Complexidades para Decorar

| Estrutura | Access | Search | Insert | Delete |
|-----------|--------|--------|--------|--------|
| Array | O(1) | O(n) | O(n) | O(n) |
| Linked List | O(n) | O(n) | O(1)* | O(1)* |
| Stack | O(n) | O(n) | O(1) | O(1) |
| Queue | O(n) | O(n) | O(1) | O(1) |
| Hash Table | - | O(1)** | O(1)** | O(1)** |
| BST | - | O(log n)*** | O(log n)*** | O(log n)*** |
| AVL Tree | - | O(log n) | O(log n) | O(log n) |
| Heap | - | O(n) | O(log n) | O(log n) |
| Union-Find | - | O(α(n))† | O(α(n))† | - |

*Se você tem referência para o nó
**Amortizado, pior caso O(n)
***Médio, pior caso O(n) se desbalanceado
†α(n) é a inversa de Ackermann, praticamente O(1)

---

## Tracking

- [ ] Semana 18 completa (Grafos intro)
- [ ] Semana 19-20 completa (Arrays & ArrayList)
- [ ] Semana 21-22 completa (Linked Lists)
- [ ] Semana 23-24 completa (Stacks & Queues)
- [ ] Semana 25-26 completa (Hash Tables)
- [ ] Semana 27-28 completa (Trees & BST + AVL)
- [ ] Semana 29 completa (Heaps & Union-Find + Mini-Projeto 2)
- [ ] Benchmark Q1 passado (4/5 estruturas em 90 min)
- [ ] LRU Cache implementado
- [ ] Cards SRS criados (mínimo 50)

**Confiança geral**: _/5

---

*"Uma boa estrutura de dados faz um algoritmo simples parecer genial."*
