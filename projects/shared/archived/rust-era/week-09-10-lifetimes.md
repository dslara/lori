# 📅 Semana 9-10: Lifetimes

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Explicar o que são lifetimes e por que existem
- Saber quando o compilador precisa de anotações
- Escrever funções que retornam referências corretamente

---

## ❓ Perguntas Guia

### Conceito
1. O que é um lifetime em Rust?
2. Por que o compilador precisa saber sobre lifetimes?
3. O que é uma "dangling reference" e como Rust previne?

### Elision
4. O que são "lifetime elision rules"?
5. Quais são as 3 regras de elision?
6. Quando o compilador consegue inferir lifetimes?
7. Quando você PRECISA anotar explicitamente?

### Sintaxe
8. O que significa `'a` em `fn foo<'a>(x: &'a str)`?
9. O que significa `'static`?
10. Como lifetimes funcionam em structs?

### Aplicação
11. Por que esta função precisa de lifetime annotation?
    ```
    fn longest(x: &str, y: &str) -> &str
    ```
12. Como você consertaria?

---

## 📚 Recursos

### Leitura Obrigatória
- **Rust Book Capítulo 10.3**: Validating References with Lifetimes
  - https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html

### Aprofundamento
- **Rust by Example**: Lifetimes
  - https://doc.rust-lang.org/rust-by-example/scope/lifetime.html

---

## 📋 Entregas

### Semana 9

**Dia 1: Conceito**
- [ ] Ler Rust Book 10.3
- [ ] Responder perguntas 1-3

**Dia 2: Elision Rules**
- [ ] Descobrir as 3 regras de elision
- [ ] Responder perguntas 4-7

**Dia 3: Prática**
- [ ] Criar 5 funções que precisam de lifetime annotations
- [ ] Para cada uma, explicar POR QUE precisa

**Dia 4: Experimentação**
- [ ] Criar exemplos que quebram lifetime rules
- [ ] Entender as mensagens de erro

**Dia 5: Structs**
- [ ] Criar struct que contém referências
- [ ] Responder pergunta 10

### Semana 10

**Dia 1-2: Projeto**
- [ ] Criar parser de CSV com zero-copy
- [ ] Structs que referenciam o input original
- [ ] Usar lifetime annotations

**Dia 3: Consolidação**
- [ ] Responder todas as perguntas guia
- [ ] Criar cards SRS

**Dia 4-5: Revisão Fase 1**
- [ ] Revisar ownership + borrowing + lifetimes
- [ ] Preparar para Memory Deep Dive

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Explicar por que lifetimes existem
2. [ ] Saber quando anotar vs quando o compilador infere
3. [ ] Consertar erros de lifetime sem "chutar"
4. [ ] Criar structs com referências

### Red flags:
- Adiciona `'static` em tudo para compilar
- Não entende as elision rules
- Converte tudo para owned types para evitar lifetimes

---

## 🔄 Reflexão

### Conexão com semanas anteriores
_Como lifetimes se relacionam com ownership e borrowing?_

### O que lifetimes previnem?
_Sua explicação_

---

## ⏭️ Próximo

**Semana 11-12**: Memory Deep Dive
- Onde os dados realmente vivem?
- Stack vs Heap
