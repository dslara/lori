# 📅 Semana 21-22: Stacks & Queues 📚

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar Stack e Queue do zero
- Reconhecer problemas que usam Stack/Queue
- Implementar Queue usando dois Stacks
- Resolver problemas clássicos de parsing

---

## ❓ Perguntas Guia

### Conceitos
1. O que significa LIFO? Exemplos do mundo real?
2. O que significa FIFO? Exemplos do mundo real?
3. Quais as operações fundamentais de Stack?
4. Quais as operações fundamentais de Queue?
5. Por que Stack e Queue são chamados de "ADT" (Abstract Data Type)?

### Implementação
6. Como implementar Stack usando Vec?
7. Como implementar Queue usando VecDeque?
8. Por que implementar Queue com Vec simples é ineficiente?
9. Como implementar Queue usando dois Stacks?
10. Qual a complexidade amortizada da queue com dois stacks?

### Variações
11. O que é Deque (Double-ended queue)?
12. O que é Priority Queue? (preview de Heaps)
13. O que é Monotonic Stack/Queue?

### Problemas com Stack
14. Como validar parênteses balanceados?
15. Como avaliar expressão em notação pós-fixa (RPN)?
16. Como converter infix para postfix (Shunting Yard)?
17. Como implementar "undo" com Stack?

### Problemas com Queue
18. Como implementar BFS com Queue?
19. O que é o pattern "sliding window maximum"?
20. Como implementar rate limiting com Queue?

---

## 📚 Recursos

### Leitura
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| Rust std docs | `std::collections::VecDeque` | Deque em Rust |
| CLRS | Stack and Queue chapters | Teoria |

### Prática
| Recurso | Propósito |
|---------|-----------|
| LeetCode Stack tag (Easy) | Problemas guiados |
| LeetCode Queue tag (Easy) | Problemas guiados |

---

## 📋 Entregas

### Semana 21: Implementação

**Dia 1: Stack**
- [ ] Responder perguntas 1-3, 6
- [ ] Implementar `Stack<T>` usando Vec
- [ ] Operações: new, push, pop, peek, is_empty, len
- [ ] Testar com vários tipos

**Dia 2: Queue Básica**
- [ ] Responder perguntas 4-5, 7-8
- [ ] Implementar `Queue<T>` usando VecDeque
- [ ] Operações: new, enqueue, dequeue, peek, is_empty
- [ ] Por que não usar Vec com remove(0)?

**Dia 3: Queue com Dois Stacks**
- [ ] Responder perguntas 9-10
- [ ] Implementar `QueueFromStacks<T>`
- [ ] Analisar: quando "transfer" acontece?
- [ ] Provar complexidade amortizada O(1)

**Dia 4: Deque**
- [ ] Responder perguntas 11-13
- [ ] Explorar `std::collections::VecDeque`
- [ ] Implementar Deque próprio (opcional)
- [ ] Listar operações e complexidades

**Dia 5: Comparação**
- [ ] Criar tabela: Stack vs Queue vs Deque
- [ ] Quando usar cada um?
- [ ] 5 exemplos de uso real de cada

### Semana 22: Problemas Clássicos

**Dia 1: Parênteses Balanceados**
- [ ] Responder pergunta 14
- [ ] Problema: Valid Parentheses `()[]{}`
- [ ] Problema: Longest Valid Parentheses
- [ ] Explicar por que Stack é perfeito para isso

**Dia 2: Expressões**
- [ ] Responder perguntas 15-16
- [ ] Implementar: avaliar RPN (Reverse Polish Notation)
- [ ] Desafio: converter infix → postfix (Shunting Yard)

**Dia 3: Monotonic Stack**
- [ ] Pesquisar: o que é monotonic stack?
- [ ] Problema: Next Greater Element
- [ ] Problema: Daily Temperatures
- [ ] Problema: Largest Rectangle in Histogram

**Dia 4: Queue Problems**
- [ ] Responder perguntas 18-20
- [ ] Implementar BFS básico usando Queue
- [ ] Problema: Sliding Window Maximum (monotonic deque)

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Criar decision tree: quando Stack vs Queue
- [ ] Cards SRS para patterns
- [ ] Resumo: 10 problemas clássicos e qual estrutura usar

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar Stack e Queue em < 5 minutos
2. [ ] Ver problema e identificar se usa Stack ou Queue
3. [ ] Implementar Queue com dois Stacks
4. [ ] Resolver Valid Parentheses sem pensar
5. [ ] Explicar monotonic stack

### Padrões para Reconhecer
- "Último a entrar, primeiro a sair" → Stack
- "Primeiro a entrar, primeiro a sair" → Queue
- "Matching pairs" (parênteses, tags) → Stack
- "Level-order traversal" → Queue
- "Next greater element" → Monotonic Stack

### Red flags (precisa revisar):
- Confunde quando usar Stack vs Queue
- Não sabe implementar Queue com dois Stacks
- Não reconhece padrões de problemas

---

## 🔄 Reflexão

### Abstração
_Por que Stack/Queue são úteis mesmo sendo "simples"?_

### Patterns
_Quais problemas você agora reconhece como Stack/Queue?_

### Conexão
_Como Stack se relaciona com recursão?_

---

## ⏭️ Próximo

**Semana 23-24**: Hash Tables
- Como ter O(1) lookup?
- O que são colisões e como resolvê-las?
- Quando HashMap não é a melhor escolha?
