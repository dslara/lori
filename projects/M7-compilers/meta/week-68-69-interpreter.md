# 📅 Semana 68-69: Interpreter 🎯

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar tree-walking interpreter
- Criar sistema de environment/scope
- Implementar variáveis e funções
- Ter linguagem funcional completa

---

## ❓ Perguntas Guia

### Interpreter Basics
1. O que é tree-walking interpreter?
2. Como interpreter difere de compiler?
3. O que significa "avaliar" uma expressão?
4. O que é visitor pattern?

### Avaliação
5. Como avaliar literal (número, string)?
6. Como avaliar operação binária (+, -, etc)?
7. Como avaliar operação unária (-, !)?
8. Como avaliar expressão com parênteses?
9. O que são truthy/falsy values?

### Environment
10. O que é environment?
11. Como implementar variáveis?
12. O que é scope?
13. Como implementar scopes aninhados?
14. O que é shadowing?

### Statements
15. Como avaliar let statement?
16. Como avaliar if/else?
17. Como avaliar return?
18. Como avaliar block de statements?

### Funções
19. Como representar função no runtime?
20. O que é closure?
21. Como implementar chamada de função?
22. O que é call stack no interpreter?
23. Como implementar recursão?

### Built-ins
24. O que são built-in functions?
25. Como implementar print()?
26. Como implementar len()?
27. Como adicionar novas built-ins?

---

## 📚 Recursos

### Leitura
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| Crafting Interpreters | Chapters 7-10 | Avaliação e funções |
| Writing an Interpreter in Go | Chapters 3-4 | Implementação em Go |

---

## 📋 Entregas

### Semana 68: Avaliacao Basica

**Dia 1: Setup**
- [ ] Responder perguntas 1-4
- [ ] Criar struct Evaluator
- [ ] Definir tipo para valores (Object)
- [ ] Implementar eval() básico

**Dia 2: Expressões**
- [ ] Responder perguntas 5-9
- [ ] Avaliar números
- [ ] Avaliar operações aritméticas
- [ ] Avaliar operações de comparação

**Dia 3: Environment**
- [ ] Responder perguntas 10-14
- [ ] Implementar Environment struct
- [ ] Get e Set de variáveis
- [ ] Scopes aninhados

**Dia 4: Statements**
- [ ] Responder perguntas 15-18
- [ ] Avaliar let statements
- [ ] Avaliar if/else
- [ ] Avaliar blocks

**Dia 5: REPL**
- [ ] Criar REPL (Read-Eval-Print Loop)
- [ ] Testar interativamente
- [ ] Melhorar error messages
- [ ] Variáveis persistem entre linhas

### Semana 69: Funcoes e Completude

**Dia 1: Funções Básicas**
- [ ] Responder perguntas 19-21
- [ ] Definir struct Function
- [ ] Avaliar function literal
- [ ] Armazenar funções em environment

**Dia 2: Chamada de Função**
- [ ] Responder perguntas 22-23
- [ ] Implementar call expression
- [ ] Criar novo environment para call
- [ ] Testar funções simples

**Dia 3: Closures**
- [ ] Entender closures
- [ ] Capturar environment externo
- [ ] Testar closure funciona
- [ ] Implementar recursão

**Dia 4: Built-ins**
- [ ] Responder perguntas 24-27
- [ ] Implementar print()
- [ ] Implementar len()
- [ ] Implementar type()

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Interpreter completo funcionando
- [ ] Escrever programas na sua linguagem
- [ ] Documentar a linguagem

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Avaliar expressões complexas
2. [ ] Implementar scopes corretamente
3. [ ] Funções com closures funcionam
4. [ ] REPL interativo funcionando
5. [ ] Escrever fibonacci na sua linguagem

### Sua Linguagem Deve Executar

```javascript
// Variáveis
let x = 5;
let y = 10;
print(x + y);  // 15

// Funções
let add = fn(a, b) { a + b };
print(add(2, 3));  // 5

// Closures
let makeAdder = fn(x) {
    fn(y) { x + y }
};
let addFive = makeAdder(5);
print(addFive(3));  // 8

// Recursão
let fib = fn(n) {
    if (n < 2) {
        n
    } else {
        fib(n - 1) + fib(n - 2)
    }
};
print(fib(10));  // 55

// Condicionais
let max = fn(a, b) {
    if (a > b) { a } else { b }
};
print(max(5, 3));  // 5
```

### Arquitetura

```
Source Code
    ↓
  Lexer
    ↓
  Tokens
    ↓
  Parser
    ↓
   AST
    ↓
Evaluator + Environment
    ↓
  Result
```

### Red flags (precisa revisar):
- Scopes não funcionam corretamente
- Closures não capturam environment
- Recursão causa stack overflow

---

## 🔄 Reflexão

### Integração
_Como todas as partes se conectam?_

### Design de Linguagem
_Que decisões você tomou? Por quê?_

### Próximos Passos
_O que você adicionaria à linguagem?_

---

## ⏭️ Próximo

**Semana 71-84**: Capstone Project
- 14 semanas para projeto grande
- Integrar tudo que aprendeu
- Criar algo substancial
