# Semana 21-22: Linked Lists

## Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar singly e doubly linked list em Zig com allocator explícito
- Explicar quando linked list é melhor que ArrayList
- Resolver problemas clássicos com linked lists (reverter, detectar ciclo, merge)
- Entender por que linked list é mais complexa que parece em linguagens com controle de memória explícito

---

## Perguntas Guia

### Conceitos
1. O que é uma singly linked list? O que cada nó contém?
2. O que é uma doubly linked list? Qual o overhead vs singly?
3. Por que linked list tem O(1) insert/delete se você tem referência para o nó?
4. Por que linked list tem O(n) access?
5. Quando linked list é melhor que ArrayList? (inserções frequentes no meio, ou com nó em mãos)

### Memória e Ponteiros em Zig
6. Como você representa um nó com `next: ?*Node` em Zig?
7. Por que cada nó precisa ser alocado individualmente no heap?
8. Como você libera todos os nós sem memory leak? (iterar e free cada um)
9. O que acontece na memória quando você insere um nó no meio?
10. Por que linked lists causam mais cache misses que ArrayList?

### Implementação
11. Como implementar `prepend` (inserir no início)? Qual a complexidade?
12. Como implementar `append` (inserir no fim)? Como otimizar com `tail` pointer?
13. Como implementar `removeHead`?
14. Como implementar `findNode(value)`?
15. Para doubly linked list: o que muda? Quais ponteiros precisam ser atualizados?

### Problemas Clássicos
16. Como reverter uma linked list in-place?
17. Como detectar ciclo em linked list? (Floyd's algorithm — two pointers)
18. Como encontrar o meio de uma linked list?
19. Como fazer merge de duas linked lists ordenadas?
20. O que é problema de "merge k sorted lists"?

---

## Recursos

### Tier 1 (obrigatório)
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| Zig stdlib source | `std/linked_list.zig` (TailQueue) | Ver implementação real |
| Visualgo.net | Linked List | Visualização |
| CLRS | Chapter 10.2 - Linked Lists | Teoria |

### Tier 2 (referência)
| Recurso | Quando usar |
|---------|-------------|
| LeetCode #206, #141, #876, #21 | Problemas clássicos (via Python) |

---

## Entregas

### Semana 18: Singly Linked List

**Dia 1: Conceitos e Estrutura**
- [ ] Responder perguntas 1-5
- [ ] Desenhar: o que está na memória com lista [1, 2, 3]?
- [ ] Comparar com ArrayList: por que ponteiros causam cache misses?

**Dia 2: Node e Alocação**
- [ ] Responder perguntas 6-8
- [ ] Implementar `Node(T)` com `value: T, next: ?*Node(T)`
- [ ] Criar função que aloca nó: `createNode(allocator, value) !*Node(T)`
- [ ] Criar função que libera lista completa: `freeList(allocator, head) void`

**Dia 3: Operações Básicas**
- [ ] Responder perguntas 11-14
- [ ] Implementar `SinglyLinkedList(T)`:
  - `init(allocator)`, `deinit()`
  - `prepend(value) !void`
  - `append(value) !void` (com tail pointer)
  - `removeHead() ?T`
  - `contains(value) bool`
  - `len() usize`

**Dia 4: Testes + Complexidades**
- [ ] Escrever 6+ testes sem memory leaks (GPA.detectLeaks)
- [ ] Responder perguntas 9-10 (memória e cache)
- [ ] Benchmark: iterar ArrayList vs LinkedList de 10000 elementos

**Dia 5: Problemas Clássicos**
- [ ] Responder pergunta 16: reverter lista
- [ ] Implementar em Zig: `reverse(list) void`
- [ ] Resolver no LeetCode (Python): #206 Reverse Linked List
- [ ] Responder pergunta 18: encontrar meio (dois ponteiros — slow/fast)

### Semana 19: Doubly Linked List + Problemas

**Dia 1: Doubly Linked List**
- [ ] Responder pergunta 15
- [ ] Implementar `DoublyLinkedList(T)`:
  - `Node` com `prev: ?*Node, next: ?*Node, value: T`
  - `prepend`, `append`, `removeHead`, `removeTail`
  - `insertAfter(node, value)`, `removeNode(node)`
- [ ] Verificar: por que doubly é necessário para LRU Cache?

**Dia 2: Ciclo e Floyd's**
- [ ] Responder pergunta 17
- [ ] Estudar Floyd's cycle detection (slow/fast pointers)
- [ ] Implementar `hasCycle(head: ?*Node) bool`
- [ ] Resolver no LeetCode (Python): #141 Linked List Cycle

**Dia 3: Merge**
- [ ] Responder perguntas 19-20
- [ ] Implementar `mergeSorted(a: ?*Node, b: ?*Node) ?*Node`
- [ ] Resolver no LeetCode (Python): #21 Merge Two Sorted Lists

**Dia 4: Zig stdlib TailQueue**
- [ ] Ler `std/linked_list.zig`
- [ ] Como `std.TailQueue(T)` difere da sua implementação?
- [ ] Usar `TailQueue` para resolver um problema real

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Criar tabela: ArrayList vs SinglyLL vs DoublyLL — quando usar cada
- [ ] Cards SRS para complexidades e Floyd's algorithm

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar SinglyLinkedList do zero em 25 minutos sem consultar
2. [ ] Explicar por que linked list tem mais cache misses que ArrayList
3. [ ] Implementar reverter lista in-place
4. [ ] Explicar Floyd's cycle detection
5. [ ] Dizer claramente quando linked list é melhor que ArrayList

### Complexidades para Decorar
| Operação | Singly LL | Doubly LL |
|----------|-----------|-----------|
| prepend | O(1) | O(1) |
| append (com tail) | O(1) | O(1) |
| removeHead | O(1) | O(1) |
| removeTail | O(n) | O(1) |
| removeNode (com ref) | O(n)* | O(1) |
| search | O(n) | O(n) |
| access by index | O(n) | O(n) |

*Singly: precisa encontrar predecessor

### Red flags (precisa revisar):
- Memory leaks nos testes
- Não consegue reverter lista in-place
- Confunde quando usar LL vs ArrayList

---

## Reflexão

### Cache Misses
_Desenhe o que acontece na memória ao iterar LinkedList vs ArrayList. Por que ArrayList é mais rápida para iteração?_

### Trade-offs Reais
_Em quais situações você usaria DoublyLinkedList no mundo real?_

### Confiança (1-5)
- Singly LL: _/5
- Doubly LL: _/5
- Problemas clássicos: _/5

---

## Próximo

**Semana 20-21**: Stacks & Queues
- Como implementar Stack sobre ArrayList?
- O que é uma Queue circular (ring buffer)?
- Como dois stacks fazem uma queue?
