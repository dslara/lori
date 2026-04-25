# 📅 Semana 17-18: Arrays & Vec 📊

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Dominar todas as operações de Vec
- Analisar complexidade de cada operação
- Escolher entre array fixo e Vec
- Resolver problemas clássicos com arrays

---

## ❓ Perguntas Guia

### Fundamentos
1. Qual a diferença entre `[T; N]` e `Vec<T>`?
2. Por que array fixo vive na stack?
3. Quando usar array fixo vs Vec?
4. O que significa "contiguous memory"?
5. Por que acesso por índice é O(1)?

### Operações de Vec
6. Qual a complexidade de `push()`? Por quê?
7. Qual a complexidade de `pop()`?
8. Qual a complexidade de `insert(0, x)`? Por quê?
9. Qual a complexidade de `remove(0)`? Por quê?
10. Qual a diferença entre `remove()` e `swap_remove()`?

### Iteração
11. Como `iter()`, `iter_mut()`, e `into_iter()` diferem?
12. Por que iteradores são mais eficientes que índices?
13. O que é "iterator invalidation"?
14. Como filtrar, mapear, e coletar com iteradores?

### Slices
15. O que é um slice (`&[T]`)?
16. Qual a diferença entre `&Vec<T>` e `&[T]`?
17. Por que funções devem receber `&[T]` em vez de `&Vec<T>`?
18. Como criar slice de parte de um Vec?

### Patterns Comuns
19. Two-pointer technique: como funciona?
20. Sliding window: quando usar?
21. Como reverter array in-place?
22. Como encontrar duplicatas?

---

## 📚 Recursos

### Leitura
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| Rust Book | Ch 8.1 - Vectors | Fundamentos |
| Rust std docs | `std::vec::Vec` | API completa |
| Rust std docs | `std::slice` | Operações de slice |

### Prática
| Recurso | Propósito |
|---------|-----------|
| Exercism Rust Track | Exercícios guiados |
| LeetCode Easy (Arrays) | Problemas clássicos |

---

## 📋 Entregas

### Semana 17: Fundamentos de Array/Vec

**Dia 1: Arrays vs Vec**
- [ ] Responder perguntas 1-5
- [ ] Criar 5 exemplos: quando array fixo é melhor
- [ ] Criar 5 exemplos: quando Vec é necessário

**Dia 2: Operações Básicas**
- [ ] Responder perguntas 6-10
- [ ] Implementar benchmark: insert(0) vs push
- [ ] Descobrir por que swap_remove é O(1)

**Dia 3: Slices**
- [ ] Responder perguntas 15-18
- [ ] Reescrever 3 funções para usar &[T]
- [ ] Praticar slice syntax: `&v[1..3]`, `&v[..]`, etc.

**Dia 4: Iteradores**
- [ ] Responder perguntas 11-14
- [ ] Converter 5 loops `for i in 0..n` para iteradores
- [ ] Praticar: map, filter, fold, collect

**Dia 5: Projeto**
- [ ] Implementar biblioteca de manipulação de arrays
- [ ] Funções: reverse, rotate, unique, merge_sorted

### Semana 18: Problemas Clássicos

**Dia 1: Two-Pointer**
- [ ] Responder pergunta 19
- [ ] Problema: Two Sum (sorted array)
- [ ] Problema: Container with Most Water

**Dia 2: Sliding Window**
- [ ] Responder pergunta 20
- [ ] Problema: Maximum sum subarray of size k
- [ ] Problema: Longest substring without repeating

**Dia 3: In-Place Operations**
- [ ] Responder perguntas 21-22
- [ ] Problema: Reverse array in-place
- [ ] Problema: Remove duplicates from sorted array
- [ ] Problema: Move zeros to end

**Dia 4: Mais Problemas**
- [ ] Problema: Merge two sorted arrays
- [ ] Problema: Find majority element
- [ ] Problema: Rotate array by k positions

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Criar cheat sheet de complexidades Vec
- [ ] Cards SRS para operações e complexidades
- [ ] 3 problemas de revisão

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Listar complexidade de todas operações de Vec
2. [ ] Identificar quando usar two-pointer vs sliding window
3. [ ] Escrever código usando iteradores idiomáticos
4. [ ] Explicar trade-offs de array fixo vs Vec
5. [ ] Resolver problemas medium de array em 15 min

### Teste Rápido
Sem consulta, responda:
- `vec.push()` é O(?)
- `vec.insert(0, x)` é O(?)
- `vec.swap_remove(i)` é O(?)
- `vec[i]` é O(?)
- `vec.contains(x)` é O(?)

### Red flags (precisa revisar):
- Não sabe diferença entre iter() e into_iter()
- Usa índices quando iteradores são melhores
- Não sabe quando Vec realoca

---

## 🔄 Reflexão

### Conexão com Fase 1
_Como seu conhecimento de implementação de Vec ajuda?_

### Patterns mais úteis
_Quais técnicas você mais usará?_

### Confiança (1-5)
- [ ] Operações de Vec: _/5
- [ ] Iteradores: _/5
- [ ] Problem solving: _/5

---

## ⏭️ Próximo

**Semana 19-20**: Linked Lists
- Por que linked lists são difíceis em Rust?
- Quando são melhores que Vec?
- Como implementar sem clonar tudo?
