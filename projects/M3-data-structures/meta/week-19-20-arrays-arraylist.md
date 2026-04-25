# Semana 19-20: Arrays & ArrayList

## Objetivo
Ao final destas duas semanas, você será capaz de:
- Dominar todas as operações de ArrayList e seus trade-offs
- Analisar complexidade de cada operação (incluindo amortizado)
- Resolver problemas clássicos com arrays usando two-pointer e sliding window
- Usar ArrayList da stdlib Zig e entender seus internals

---

## Perguntas Guia

### Fundamentos
1. Qual a diferença entre `[N]T` (array fixo) e `ArrayList(T)` em Zig?
2. Por que array fixo vive no stack?
3. Quando usar array fixo vs ArrayList?
4. O que significa "contiguous memory"? Por que acesso por índice é O(1)?
5. O que é um slice `[]T`? Como ele se relaciona com ArrayList?

### Operações de ArrayList
6. Qual a complexidade de `append`? Por quê? (amortizado O(1))
7. Qual a complexidade de `pop`?
8. Qual a complexidade de `insert(0, x)`? Por quê? (O(n) — shift)
9. Qual a complexidade de `orderedRemove(0)`? Por quê?
10. O que `swapRemove` faz? Por que é O(1)?

### Iteração
11. Como iterar sobre ArrayList em Zig? (`for (list.items) |item|`)
12. Como iterar com índice? (`for (list.items, 0..) |item, i|`)
13. O que é "iterator invalidation"? Quando pode acontecer com ArrayList?

### Patterns Clássicos
14. Two-pointer technique: como funciona? Para que problemas?
15. Sliding window: quando usar?
16. Como reverter slice in-place em Zig?
17. Como encontrar duplicatas em array ordenado?

---

## Recursos

### Tier 1 (obrigatório)
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| Zig stdlib source | `std/array_list.zig` | Ver implementação real |
| Zig Documentation | `std.ArrayList` API | API completa |
| Visualgo.net | Array | Visualização |

### Tier 2 (referência)
| Recurso | Quando usar |
|---------|-------------|
| CLRS | Chapter 17 - Amortized Analysis | Por que amortizado O(1) funciona |
| LeetCode (via Python) | Problemas de array | Two-pointer, sliding window |

---

## Entregas

### Semana 16: Fundamentos

**Dia 1: Array vs ArrayList**
- [ ] Responder perguntas 1-5
- [ ] Criar 5 exemplos: quando array fixo é melhor
- [ ] Criar 5 exemplos: quando ArrayList é necessário
- [ ] Imprimir `capacity` de ArrayList antes e depois de vários appends

**Dia 2: Operações e Complexidades**
- [ ] Responder perguntas 6-10
- [ ] Implementar benchmark: `insert(0, x)` vs `append` — medir diferença
- [ ] Verificar: em que pontos capacity dobra? Quantos reallocs em 100 appends?

**Dia 3: Slices e Iteração**
- [ ] Responder perguntas 11-13
- [ ] Escrever 5 funções que recebem `[]T` (slice) em vez de `ArrayList(T)`
- [ ] Praticar: `list.items[1..3]`, `list.items[..]`

**Dia 4: Implementar MyArrayList v2**
- [ ] Expandir MyArrayList da semana 13:
  - `insertAt(index, item) !void` — O(n)
  - `removeAt(index) T` — O(n) com shift
  - `swapRemove(index) T` — O(1)
  - `contains(item) bool` — O(n)
- [ ] Todos os métodos com testes

**Dia 5: Consolidação**
- [ ] Responder todas as perguntas guia
- [ ] Criar cheat sheet de complexidades ArrayList
- [ ] Cards SRS para operações e complexidades

### Semana 17: Problemas Clássicos

**Dia 1: Two-Pointer**
- [ ] Responder pergunta 14
- [ ] Problema: Two Sum (sorted array) — em Python para LC, reimplementar em Zig
- [ ] Problema: Container with Most Water
- [ ] Implementar em Zig: `twoSum(arr: []const i32, target: i32) ?[2]usize`

**Dia 2: Sliding Window**
- [ ] Responder pergunta 15
- [ ] Problema: Maximum sum subarray of size k
- [ ] Problema: Longest substring without repeating characters
- [ ] Implementar em Zig: `maxSumSubarray(arr: []const i32, k: usize) i64`

**Dia 3: In-Place Operations**
- [ ] Responder perguntas 16-17
- [ ] Problema: Reverse array in-place
- [ ] Problema: Remove duplicates from sorted array
- [ ] Problema: Move zeros to end
- [ ] Implementar em Zig com testes para cada

**Dia 4: Mais Problemas**
- [ ] Problema: Merge two sorted arrays
- [ ] Problema: Find majority element (Boyer-Moore)
- [ ] Problema: Rotate array by k positions

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Verificar: todos os exercícios Zig têm testes passando?
- [ ] Cards SRS para patterns: two-pointer, sliding window

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Listar complexidade de todas operações de ArrayList (sem consultar)
2. [ ] Identificar quando usar two-pointer vs sliding window
3. [ ] Escrever código iterando sobre slice em Zig idiomaticamente
4. [ ] Explicar por que amortizado O(1) para append funciona
5. [ ] Resolver problema medium de array em 20 min

### Teste Rápido (sem consulta):
- `list.append(x)` é O(?)
- `list.insert(0, x)` é O(?)
- `list.swapRemove(i)` é O(?)
- `list.items[i]` é O(?)

### Red flags (precisa revisar):
- Não sabe quando ArrayList realoca
- Confunde `list.items` (slice) com `list` (ArrayList)
- Não entende por que `insert(0, x)` é O(n)

---

## Reflexão

### Conexão com Fase 1
_Como MyArrayList que você implementou na semana 13 ajudou a entender ArrayList da stdlib?_

### Patterns mais úteis
_Quais técnicas você vai usar mais? Two-pointer? Sliding window?_

### Confiança (1-5)
- Operações de ArrayList: _/5
- Two-pointer / sliding window: _/5
- Problem solving: _/5

---

## Próximo

**Semana 18-19**: Linked Lists
- Por que linked lists requerem atenção a ponteiros em Zig?
- Quando são melhores que ArrayList?
- Como implementar singly e doubly linked lists?
