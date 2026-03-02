# Semana 25-26: Hash Tables

## Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar hash table básica com separate chaining em Zig
- Explicar como colisões são tratadas (chaining vs open addressing)
- Entender quando O(1) se torna O(n)
- Usar `std.AutoHashMap` e `std.StringHashMap` idiomaticamente

---

## Perguntas Guia

### Conceitos
1. O que é uma hash function? O que a torna "boa"?
2. O que é uma colisão de hash?
3. O que é load factor? Como afeta performance?
4. Quando hash table tem complexidade O(n) em vez de O(1)?
5. O que é "avalanche effect" em hash functions?

### Separate Chaining
6. O que é separate chaining?
7. Qual a complexidade de get/put/delete com chaining?
8. O que acontece quando o load factor fica alto? (rehashing)
9. O que é rehashing? Qual a complexidade? Por que é O(n) amortizado O(1)?

### Open Addressing
10. O que é open addressing?
11. O que é linear probing? Qual o problema?
12. O que é quadratic probing?
13. O que é double hashing?
14. O que é "tombstone" e por que é necessário?
15. Qual a diferença prática entre chaining e open addressing?

### Hash Functions
16. O que é FNV-1a hash? Por que é popular?
17. O que é MurmurHash / xxHash?
18. Por que strings precisam de hash diferente de inteiros?
19. O que é "hash table DoS attack"? Como prevenir? (seed aleatório)

### Zig HashMap
20. Como usar `std.AutoHashMap(K, V)` em Zig?
21. Qual a diferença entre `AutoHashMap` e `HashMap` com hasher customizado?
22. O que `std.StringHashMap(V)` faz de diferente?
23. Como iterar sobre HashMap em Zig?

---

## Recursos

### Tier 1 (obrigatório)
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| Zig stdlib source | `std/hash_map.zig` | Ver implementação real |
| CLRS | Chapter 11 - Hash Tables | Teoria completa |
| Visualgo.net | Hash Table | Visualização |

### Tier 2 (referência)
| Recurso | Quando usar |
|---------|-------------|
| LeetCode (via Python) | #1, #49, #387 | Problemas clássicos |

---

## Entregas

### Semana 22: Implementação

**Dia 1: Conceitos e Hash Functions**
- [ ] Responder perguntas 1-5
- [ ] Implementar FNV-1a hash para strings em Zig
- [ ] Testar: distribuição de hashes para 1000 strings aleatórias
- [ ] Verificar: quantas colisões com load factor 0.5? 0.75? 1.0?

**Dia 2: Separate Chaining**
- [ ] Responder perguntas 6-9
- [ ] Implementar `MyHashMap(K, V)` com separate chaining:
  - Array de linked lists (buckets)
  - `put(key, value) !void`
  - `get(key) ?V`
  - `delete(key) bool`
  - `len() usize`
  - `loadFactor() f32`
- [ ] Capacity inicial: 16 buckets

**Dia 3: Rehashing**
- [ ] Implementar rehashing automático quando load factor > 0.75
- [ ] Verificar: todos os elementos preservados após rehash?
- [ ] Benchmark: performance antes e depois de rehash
- [ ] Escrever 6+ testes (incluindo após rehash)

**Dia 4: Open Addressing (teoria + simples)**
- [ ] Responder perguntas 10-15
- [ ] Implementar versão simples com linear probing
- [ ] Implementar tombstone para delete
- [ ] Comparar: chaining vs open addressing com benchmark

**Dia 5: Consolidação**
- [ ] Responder perguntas 16-19
- [ ] Criar cheat sheet: hash functions e quando usar cada estratégia
- [ ] Cards SRS

### Semana 23: Zig HashMap + Problemas

**Dia 1: std.AutoHashMap**
- [ ] Responder perguntas 20-23
- [ ] Usar `AutoHashMap(u32, []const u8)` — put, get, delete, iterate
- [ ] Usar `StringHashMap(u32)` para contar frequência de palavras
- [ ] Comparar performance: sua implementação vs stdlib

**Dia 2: Problemas Clássicos — Frequência**
- [ ] Resolver (Python): #1 Two Sum
- [ ] Resolver (Python): #49 Group Anagrams
- [ ] Reimplementar Two Sum em Zig com `AutoHashMap`

**Dia 3: Problemas Clássicos — Window**
- [ ] Resolver (Python): #387 First Unique Character
- [ ] Resolver (Python): #3 Longest Substring Without Repeating Characters
- [ ] Reimplementar em Zig

**Dia 4: LRU Cache (preparação)**
- [ ] Estudar: como HashMap + DoublyLinkedList = LRU Cache?
- [ ] Desenhar estrutura antes de implementar
- [ ] Resolver (Python): #146 LRU Cache

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Quando usar HashMap vs TreeMap vs Array?
- [ ] Cards SRS para complexidades e patterns

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar hash table com separate chaining do zero
2. [ ] Explicar por que rehashing é O(n) mas O(1) amortizado
3. [ ] Explicar diferença entre chaining e open addressing
4. [ ] Resolver Two Sum em O(n) com HashMap
5. [ ] Usar `std.AutoHashMap` idiomaticamente em Zig

### Complexidades
| Operação | Média | Pior Caso |
|----------|-------|-----------|
| get | O(1) | O(n) |
| put | O(1)* | O(n) |
| delete | O(1) | O(n) |

*Amortizado (inclui eventual rehash)

### Red flags (precisa revisar):
- Memory leaks nos testes de hash table
- Não entende por que load factor importa
- Usa HashMap para tudo sem considerar alternativas

---

## Reflexão

### Colisões
_Como a estratégia de resolução de colisões afeta performance em casos extremos?_

### Quando não usar HashMap
_Em quais situações você escolheria BST (TreeMap) em vez de HashMap?_

### Confiança (1-5)
- Implementação: _/5
- std.AutoHashMap: _/5
- Problem solving: _/5

---

## Próximo

**Semana 24-25**: Trees & BST + AVL
- O que é uma BST e por que O(log n) não é garantido?
- O que é rotação de árvore?
- Como AVL mantém balanceamento automático?
