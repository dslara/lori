# Semana 37-38: Recursao

## Objetivo
Ao final destas duas semanas, você será capaz de:
- Entender como recursão funciona na call stack
- Converter entre recursão e iteração
- Identificar quando usar recursão
- Evitar stack overflow

**Linguagem**: Python no LeetCode, Zig localmente para implementações

---

## Perguntas Guia

### Fundamentos
1. O que é recursão?
2. O que é "base case"?
3. O que é "recursive case"?
4. Por que todo recursão precisa de base case?
5. O que acontece sem base case?

### Call Stack
6. O que é a call stack?
7. O que é um "stack frame"?
8. O que acontece quando função é chamada?
9. O que acontece quando função retorna?
10. O que é "stack overflow"?
11. Qual o tamanho típico da stack?

### Tipos de Recursão
12. O que é "tail recursion"?
13. O que é "tail call optimization"?
14. Zig faz tail call optimization?
15. O que é "head recursion"?
16. O que é recursão mútua?

### Recursão vs Iteração
17. Toda recursão pode virar iteração?
18. Toda iteração pode virar recursão?
19. Quando recursão é mais clara?
20. Quando iteração é mais eficiente?
21. Como converter recursão para iteração?

### Análise
22. Como calcular complexidade de recursão?
23. O que é "recurrence relation"?
24. Como analisar espaço de recursão?

### Técnicas
25. O que é "memoization"?
26. Como evitar recálculo em recursão?
27. O que é "divide and conquer"?
28. O que é "backtracking"?

---

## Recursos

### Leitura
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| CLRS | Chapter 4 - Divide and Conquer | Recorrências |
| Zig docs | `@call(.always_tail, ...)` | TCO em Zig |

### Visualização
| Recurso | Propósito |
|---------|-----------|
| Python Tutor | Ver call stack |
| Debugger | Step through recursion |

---

## Entregas

### Semana 37: Fundamentos

**Dia 1: Conceitos Básicos**
- [ ] Responder perguntas 1-5
- [ ] Implementar: factorial recursivo em Zig
- [ ] Implementar: fibonacci recursivo em Zig
- [ ] Traçar execução à mão

**Dia 2: Call Stack**
- [ ] Responder perguntas 6-11
- [ ] Desenhar call stack para factorial(5)
- [ ] Desenhar call stack para fibonacci(5)
- [ ] Causar stack overflow propositalmente

**Dia 3: Tipos de Recursão**
- [ ] Responder perguntas 12-16
- [ ] Converter factorial para tail recursive em Zig
- [ ] Pesquisar: Zig faz TCO? Quando usar `@call(.always_tail, ...)`?
- [ ] Exemplo de recursão mútua

**Dia 4: Recursão → Iteração**
- [ ] Responder perguntas 17-21
- [ ] Converter: factorial recursivo → iterativo
- [ ] Converter: fibonacci recursivo → iterativo
- [ ] Usar stack explícita para simular recursão

**Dia 5: Análise**
- [ ] Responder perguntas 22-24
- [ ] Analisar: T(n) de factorial
- [ ] Analisar: T(n) de fibonacci (sem memo)
- [ ] Por que fibonacci é O(2^n)?

### Semana 38: Tecnicas e Problemas

**Dia 1: Memoization**
- [ ] Responder perguntas 25-26
- [ ] Implementar: fibonacci com memoization em Zig (usando `std.AutoHashMap`)
- [ ] Comparar: com vs sem memoization
- [ ] Qual a nova complexidade?

**Dia 2: Divide and Conquer**
- [ ] Responder pergunta 27
- [ ] Exemplo: merge sort (revisar implementação Zig)
- [ ] Exemplo: binary search recursivo em Zig
- [ ] Exemplo: exponentiation by squaring

**Dia 3: Backtracking**
- [ ] Responder pergunta 28
- [ ] Problema: Generate Parentheses — Python
- [ ] Problema: N-Queens (introdução) — Python
- [ ] Problema: Subsets — Python

**Dia 4: Mais Problemas**
- [ ] Problema: Climbing Stairs — Python
- [ ] Problema: Pow(x, n) — Python
- [ ] Problema: Reverse Linked List (recursivo) — Python
- [ ] Problema: Maximum Depth of Binary Tree — Python

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Criar decision tree: recursão vs iteração
- [ ] Cards SRS para técnicas
- [ ] Resumo: quando usar recursão

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Explicar call stack para qualquer recursão
2. [ ] Converter recursão para iteração
3. [ ] Implementar memoization
4. [ ] Analisar complexidade de recursão
5. [ ] Reconhecer padrões de backtracking

### Padrões de Recursão

```zig
// Básico
fn factorial(n: u64) u64 {
    if (n <= 1) return 1;        // base case
    return n * factorial(n - 1); // recursive case
}

// Tail Recursive (com acumulador)
fn factorialTail(n: u64, acc: u64) u64 {
    if (n <= 1) return acc;
    return factorialTail(n - 1, n * acc);
}

// Com Memoization (usando HashMap)
fn fib(n: usize, memo: *std.AutoHashMap(usize, u64)) !u64 {
    if (n <= 1) return n;
    if (memo.get(n)) |v| return v;
    const result = try fib(n - 1, memo) + try fib(n - 2, memo);
    try memo.put(n, result);
    return result;
}
```

### Red flags (precisa revisar):
- Não sabe desenhar call stack
- Não entende base case
- Não sabe converter para iteração

---

## Reflexão

### Elegância vs Performance
_Quando recursão é mais elegante? Quando é problema?_

### Call Stack
_Como sua compreensão da stack mudou?_

### Conexão
_Como recursão se relaciona com estruturas de árvore?_

---

## Próximo

**Semana 39-40**: Grafos - Representacao
- O que são grafos?
- Matriz de adjacência vs Lista de adjacência
- Quando usar cada representação?
