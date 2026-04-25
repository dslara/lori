# 📅 Semana 47-48: Dynamic Programming 🧩

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Identificar problemas que usam DP
- Implementar soluções top-down (memoization)
- Implementar soluções bottom-up (tabulation)
- Reconhecer patterns clássicos de DP

---

## ❓ Perguntas Guia

### Fundamentos
1. O que é Dynamic Programming?
2. O que é "overlapping subproblems"?
3. O que é "optimal substructure"?
4. Como DP difere de divide and conquer?
5. Como DP difere de greedy?

### Abordagens
6. O que é memoization (top-down)?
7. O que é tabulation (bottom-up)?
8. Quais as vantagens de memoization?
9. Quais as vantagens de tabulation?
10. Quando usar cada abordagem?

### Processo de Solução
11. Como identificar se problema é DP?
12. Como definir o "estado" de DP?
13. Como escrever a "recurrence relation"?
14. Como identificar base cases?
15. Qual a complexidade de tempo e espaço?

### Otimização
16. O que é "space optimization" em DP?
17. Quando podemos reduzir de O(n²) para O(n) espaço?
18. Quando podemos reduzir de O(n) para O(1) espaço?

### Patterns
19. O que é o pattern "0/1 Knapsack"?
20. O que é o pattern "Unbounded Knapsack"?
21. O que é o pattern "Fibonacci-like"?
22. O que é o pattern "Longest Common Subsequence"?
23. O que é o pattern "Palindrome"?
24. O que é o pattern "Matrix Chain"?

---

## 📚 Recursos

### Leitura
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| CLRS | Chapter 15 - Dynamic Programming | Teoria |
| Educative.io | Grokking DP Patterns | Patterns |

### Prática
| Recurso | Propósito |
|---------|-----------|
| LeetCode DP tag | Problemas classificados |
| NeetCode DP playlist | Explicações em vídeo |

---

## 📋 Entregas

### Semana 47: Fundamentos e Abordagens

**Dia 1: Conceitos**
- [ ] Responder perguntas 1-5
- [ ] Fibonacci: recursivo vs DP
- [ ] Identificar: overlapping subproblems em Fibonacci
- [ ] Identificar: optimal substructure

**Dia 2: Memoization**
- [ ] Responder perguntas 6-7
- [ ] Implementar Fibonacci com memoization
- [ ] Implementar Climbing Stairs com memoization
- [ ] Traçar chamadas recursivas

**Dia 3: Tabulation**
- [ ] Responder perguntas 8-10
- [ ] Converter Fibonacci para tabulation
- [ ] Converter Climbing Stairs para tabulation
- [ ] Comparar as abordagens

**Dia 4: Processo**
- [ ] Responder perguntas 11-15
- [ ] Problema: House Robber
- [ ] Definir estado, recurrence, base case
- [ ] Implementar ambas abordagens

**Dia 5: Otimização de Espaço**
- [ ] Responder perguntas 16-18
- [ ] Otimizar Fibonacci para O(1) espaço
- [ ] Otimizar House Robber para O(1) espaço
- [ ] Quando é possível otimizar?

### Semana 48: Patterns Clássicos

**Dia 1: Fibonacci-like**
- [ ] Responder pergunta 21
- [ ] Problema: Climbing Stairs (variações)
- [ ] Problema: House Robber II (circular)
- [ ] Problema: Decode Ways

**Dia 2: 0/1 Knapsack**
- [ ] Responder perguntas 19-20
- [ ] Problema: 0/1 Knapsack clássico
- [ ] Problema: Partition Equal Subset Sum
- [ ] Problema: Target Sum

**Dia 3: LCS Pattern**
- [ ] Responder pergunta 22
- [ ] Problema: Longest Common Subsequence
- [ ] Problema: Edit Distance
- [ ] Problema: Longest Increasing Subsequence

**Dia 4: Grid/Matrix DP**
- [ ] Problema: Unique Paths
- [ ] Problema: Minimum Path Sum
- [ ] Problema: Coin Change
- [ ] Problema: Coin Change II

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Criar cheat sheet de DP patterns
- [ ] Cards SRS para patterns
- [ ] Resumo: como abordar problema de DP

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Identificar se problema é DP
2. [ ] Definir estado e recurrence
3. [ ] Implementar memoization e tabulation
4. [ ] Otimizar espaço quando possível
5. [ ] Reconhecer patterns clássicos

### Framework para Resolver DP

```
1. Identificar se é DP:
   - Tem overlapping subproblems?
   - Tem optimal substructure?
   
2. Definir estado:
   - O que preciso saber para resolver subproblema?
   - dp[i] representa o quê?
   
3. Escrever recurrence:
   - dp[i] = f(dp[j]) para j < i
   - Como combino subproblemas?
   
4. Base cases:
   - dp[0] = ?
   - Casos triviais?
   
5. Ordem de computação:
   - Memoization: começa do problema original
   - Tabulation: começa dos base cases
   
6. Otimizar:
   - Posso reduzir espaço?
```

### Patterns para Reconhecer

| Pattern | Exemplo | Estado típico |
|---------|---------|---------------|
| Fibonacci | Climbing Stairs | dp[i] = f(dp[i-1], dp[i-2]) |
| 0/1 Knapsack | Subset Sum | dp[i][w] = include or not |
| Unbounded | Coin Change | dp[i] = min coins for i |
| LCS | Edit Distance | dp[i][j] = two strings |
| Palindrome | Longest Palindrome | dp[i][j] = substring i to j |

### Red flags (precisa revisar):
- Não consegue identificar o estado
- Confunde memoization com tabulation
- Não sabe definir recurrence

---

## 🔄 Reflexão

### Processo
_Como você aborda um problema de DP agora?_

### Patterns
_Quais patterns você reconhece mais facilmente?_

### Trade-offs
_Memoization vs Tabulation: quando cada um?_

---

## 🏁 Fim da Fase 4!

### Próximo

**Semana 50-51**: Go Basics (Fase 5)
- Nova linguagem, nova perspectiva
- Como Go difere de Rust?
- Goroutines e channels
