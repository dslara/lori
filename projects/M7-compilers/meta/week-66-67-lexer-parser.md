# 📅 Semana 66-67: Lexer & Parser 📝

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar lexer que tokeniza código
- Implementar parser que gera AST
- Entender gramáticas formais
- Transformar texto em estrutura

---

## ❓ Perguntas Guia

### Visão Geral
1. O que é compilador vs interpreter?
2. Quais as fases de um compilador?
3. O que é frontend vs backend de compilador?
4. O que é source code → tokens → AST?

### Lexer (Tokenizer)
5. O que é lexer/tokenizer?
6. O que é token?
7. Quais tipos de tokens existem?
8. O que é lexeme?
9. Como lidar com whitespace?
10. Como lidar com comentários?
11. Como reportar erros de lexing?

### Tokens
12. Como representar tokens em código?
13. O que é token type vs token value?
14. Como tokenizar números?
15. Como tokenizar strings?
16. Como tokenizar identificadores vs keywords?

### Parser
17. O que é parser?
18. O que é AST (Abstract Syntax Tree)?
19. O que é grammar/gramática?
20. O que é BNF/EBNF?
21. O que é recursive descent parser?
22. O que é precedência de operadores?
23. O que é associatividade?

### Implementação de Parser
24. Como parsear expressões?
25. O que é Pratt parser?
26. Como lidar com precedência?
27. Como reportar erros de parsing?
28. O que é error recovery?

---

## 📚 Recursos

### Leitura Obrigatória
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| Crafting Interpreters | Chapters 4-6 | Guia completo |
| | https://craftinginterpreters.com/ | Gratuito! |
| Writing an Interpreter in Go | Chapters 1-2 | Alternativa em Go |

### 📖 Leitura Complementar (Avançado)
**"Structure and Interpretation of Computer Programs" (SICP)** - JavaScript Edition
- **Quando ler**: Durante Semana 71-72 (Interpreter) se precisar de mais exemplos
- **Foco**: APENAS Capítulos 4-5 (Meta-circular Evaluator & Compilers)
- **Por quê**: SICP tem exemplos excelentes de interpreters em Scheme/JS
- **ATENÇÃO**: NÃO leia o livro inteiro (1235 páginas = 6 meses)
- **Link**: https://www.amazon.es/dp/B094X8316F (€40.22)
- **Alternativa gratuita**: https://sourceacademy.org/sicpjs (online)
- **Nota**: Só consulte se "Crafting Interpreters" não for suficiente

### ❌ Livro NÃO Recomendado
**"Abre Tu Mente a Los Números"** - Barbara Oakley
- **Por quê**: Foca em técnicas de estudo, não em CS fundamentals
- **Overlap**: Você já tem um sistema ultralearning
- **Veredicto**: Tempo melhor investido em implementar código

---

## 📋 Entregas

### Semana 66: Lexer

**Dia 1: Conceitos**
- [ ] Responder perguntas 1-4
- [ ] Desenhar pipeline: source → tokens → AST
- [ ] O que cada fase faz?
- [ ] Estudar exemplo de linguagem simples

**Dia 2: Tokens**
- [ ] Responder perguntas 5-11
- [ ] Definir tipos de tokens para sua linguagem
- [ ] Criar enum/struct para Token
- [ ] Quais tokens sua linguagem terá?

**Dia 3: Lexer Básico**
- [ ] Responder perguntas 12-16
- [ ] Implementar Lexer struct
- [ ] Tokenizar: números
- [ ] Tokenizar: operadores (+, -, *, /)

**Dia 4: Lexer Completo**
- [ ] Tokenizar: identificadores
- [ ] Tokenizar: keywords (let, if, fn)
- [ ] Tokenizar: strings
- [ ] Lidar com whitespace

**Dia 5: Testes**
- [ ] Escrever testes para lexer
- [ ] Testar edge cases
- [ ] Melhorar error messages
- [ ] Lexer completo funcionando

### Semana 67: Parser

**Dia 1: Gramática**
- [ ] Responder perguntas 17-23
- [ ] Escrever gramática da sua linguagem em BNF
- [ ] O que é terminal vs non-terminal?
- [ ] Definir precedência de operadores

**Dia 2: AST**
- [ ] Definir structs para AST nodes
- [ ] Expression nodes
- [ ] Statement nodes
- [ ] Program node

**Dia 3: Parser Básico**
- [ ] Responder perguntas 24-26
- [ ] Implementar recursive descent parser
- [ ] Parsear expressões simples
- [ ] Lidar com precedência

**Dia 4: Parser Completo**
- [ ] Responder perguntas 27-28
- [ ] Parsear statements (let, return)
- [ ] Parsear if/else
- [ ] Parsear function definitions

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Parser completo funcionando
- [ ] Print AST em formato legível
- [ ] Cards SRS para conceitos de parsing

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar lexer funcional
2. [ ] Implementar parser funcional
3. [ ] Explicar como precedência funciona
4. [ ] Desenhar AST para código dado
5. [ ] Escrever gramática em BNF

### Sua Linguagem Deve Suportar

```
// Tokens
let x = 5;
let y = 10;
let add = fn(a, b) { a + b };
add(x, y);

// AST para: 1 + 2 * 3
//       +
//      / \
//     1   *
//        / \
//       2   3
```

### Pipeline

```
"let x = 5 + 3;"
       ↓ Lexer
[LET, IDENT("x"), ASSIGN, INT(5), PLUS, INT(3), SEMICOLON]
       ↓ Parser
LetStatement {
    name: "x",
    value: InfixExpression {
        left: IntegerLiteral(5),
        operator: "+",
        right: IntegerLiteral(3)
    }
}
```

### Red flags (precisa revisar):
- Lexer não lida com todos os tokens
- Parser ignora precedência
- AST não é árvore correta

---

## 🔄 Reflexão

### Estruturas de Dados
_Como árvores aparecem em parsers?_

### Recursão
_Por que recursive descent funciona?_

### Design
_Que decisões você tomou na sua linguagem?_

---

## ⏭️ Próximo

**Semana 68-69**: Interpreter
- Como executar o AST?
- Como implementar variáveis?
- Como implementar funções?
