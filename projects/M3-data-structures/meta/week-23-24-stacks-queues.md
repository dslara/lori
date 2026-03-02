# Semana 23-24: Stacks & Queues

## Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar Stack e Queue em Zig de múltiplas formas
- Reconhecer quando um problema pede Stack vs Queue
- Resolver problemas clássicos: expressões, BFS, sliding window maximum
- Implementar Queue circular (ring buffer) eficiente

---

## Perguntas Guia

### Stack
1. O que é uma Stack? Qual o princípio LIFO?
2. Quais são as operações fundamentais? Complexidade?
3. Quais são as 3 formas de implementar Stack? (ArrayList, LinkedList, array fixo)
4. Por que Stack é usada em chamadas de função (call stack)?
5. Como Stack é usada em DFS?

### Queue
6. O que é uma Queue? Qual o princípio FIFO?
7. Quais são as operações fundamentais? Complexidade?
8. Por que implementar Queue com ArrayList é ineficiente? (dequeue é O(n))
9. O que é um ring buffer (circular buffer)? Como resolve o problema?
10. Como dois Stacks implementam uma Queue? Qual a complexidade amortizada?

### Deque
11. O que é um Deque (double-ended queue)?
12. Quando usar Deque em vez de Stack ou Queue?
13. O que é `std.ArrayList(T)` vs `std.ArrayListUnmanaged(T)` em Zig?
   (nota: Zig tem `std.ArrayList` que funciona como Deque com `appendFirst`/`append`)

### Problemas Clássicos
14. Como usar Stack para validar parênteses balanceados?
15. Como usar Stack para avaliar expressão pós-fixa (RPN)?
16. Como usar Queue para BFS em grafo?
17. O que é "Sliding Window Maximum"? Como Deque resolve em O(n)?
18. O que é "Monotonic Stack"? Para que problemas?

---

## Recursos

### Tier 1 (obrigatório)
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| Zig stdlib | `std.ArrayList` (como stack/queue) | API base |
| Visualgo.net | Stack, Queue | Visualização |
| LeetCode (via Python) | #20, #739, #239 | Problemas clássicos |

### Tier 2 (referência)
| Recurso | Quando usar |
|---------|-------------|
| CLRS | Chapter 10.1 - Stacks and Queues | Teoria |

---

## Entregas

### Semana 20: Stack

**Dia 1: Conceitos**
- [ ] Responder perguntas 1-4
- [ ] Desenhar: call stack durante chamada recursiva de Fibonacci(4)
- [ ] Comparar: Stack vs Queue — como memória é acessada diferente?

**Dia 2: Implementar Stack**
- [ ] Implementar `Stack(comptime T: type)` sobre ArrayList:
  - `init(allocator)`, `deinit()`
  - `push(item) !void`
  - `pop() ?T`
  - `peek() ?T`
  - `isEmpty() bool`
  - `size() usize`
- [ ] 5+ testes passando sem leaks

**Dia 3: Problemas com Stack**
- [ ] Responder perguntas 14-15
- [ ] Resolver (Python): #20 Valid Parentheses
- [ ] Reimplementar em Zig: `isBalanced(s: []const u8) bool`
- [ ] Resolver (Python): avaliação de expressão pós-fixa `3 4 + 2 *`

**Dia 4: Monotonic Stack**
- [ ] Responder pergunta 18
- [ ] Estudar monotonic stack: para que serve?
- [ ] Resolver (Python): #739 Daily Temperatures
- [ ] Reimplementar em Zig

**Dia 5: Consolidação Stack**
- [ ] Responder perguntas 5, 16 (DFS com Stack)
- [ ] Criar cheat sheet: quando usar Stack
- [ ] Cards SRS

### Semana 21: Queue + Deque

**Dia 1: Queue com Ring Buffer**
- [ ] Responder perguntas 6-9
- [ ] Implementar `Queue(comptime T: type)` com ring buffer:
  - Buffer de capacidade fixa N
  - `head` e `tail` indices (mod N)
  - `enqueue(item) !void`
  - `dequeue() ?T`
  - `peek() ?T`
  - `isEmpty() bool`
  - `isFull() bool`
- [ ] Verificar: o que acontece quando head==tail? (empty vs full)

**Dia 2: Queue com Dois Stacks**
- [ ] Responder pergunta 10
- [ ] Implementar `QueueTwoStacks(T)` usando dois `Stack(T)`
- [ ] Analisar complexidade amortizada: por que dequeue é O(1) amortizado?
- [ ] Comparar: ring buffer vs dois stacks — quando preferir cada?

**Dia 3: Deque e Sliding Window Maximum**
- [ ] Responder perguntas 11-13, 17
- [ ] Estudar: por que Deque resolve Sliding Window Maximum em O(n)?
- [ ] Resolver (Python): #239 Sliding Window Maximum
- [ ] Reimplementar em Zig usando ArrayList como Deque (appendFirst/append/popFirst/pop)

**Dia 4: BFS com Queue**
- [ ] Responder pergunta 16
- [ ] Implementar BFS básico em grafo representado como adjacency list
- [ ] Usar sua Queue para o BFS
- [ ] Resolver (Python): #102 Binary Tree Level Order Traversal

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Criar tabela: Stack vs Queue vs Deque — quando usar
- [ ] Cards SRS para operações e patterns

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar Stack(T) do zero em 15 minutos
2. [ ] Implementar Queue circular em 20 minutos
3. [ ] Identificar imediatamente que "valid parentheses" é problema de Stack
4. [ ] Implementar BFS usando Queue
5. [ ] Explicar por que Queue com dois Stacks é O(1) amortizado

### Complexidades
| Operação | Stack (ArrayList) | Queue (Ring Buffer) | Queue (2 Stacks) |
|----------|------------------|---------------------|------------------|
| push/enqueue | O(1)* | O(1) | O(1) |
| pop/dequeue | O(1) | O(1) | O(1)** |
| peek | O(1) | O(1) | O(1) |

*Amortizado para ArrayList
**Amortizado

### Red flags (precisa revisar):
- Implementa Queue com ArrayList sem ring buffer (dequeue O(n))
- Não reconhece problema de Stack vs Queue
- Memory leaks nos testes

---

## Reflexão

### Quando Stack vs Queue?
_Como você decide rapidamente qual usar?_

### Ring Buffer
_Por que ring buffer é mais eficiente que ArrayList para Queue?_

### Confiança (1-5)
- Stack: _/5
- Queue: _/5
- Problem solving: _/5

---

## Próximo

**Semana 22-23**: Hash Tables
- Como colisões são resolvidas?
- O que determina a qualidade de uma hash function?
- Quando O(1) se torna O(n)?
