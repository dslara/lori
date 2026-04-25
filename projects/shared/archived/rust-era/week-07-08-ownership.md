# 📅 Semana 7-8: Ownership & Borrowing

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Explicar as 3 regras de ownership sem consulta
- Prever se código compila ou não baseado em ownership
- Escrever funções que usam borrowing corretamente

---

## ❓ Perguntas Guia

Você precisa descobrir as respostas para:

### Ownership
1. Quais são as 3 regras de ownership em Rust?
2. O que acontece quando você faz `let y = x` com uma String?
3. Por que isso é diferente de `let y = x` com um i32?
4. O que significa "move" em Rust?
5. Quando um valor é "dropped"?

### Borrowing
6. Qual a diferença entre `&` e `&mut`?
7. Por que não pode ter `&` e `&mut` ao mesmo tempo?
8. O que esse sistema previne?
9. Quando usar `clone()` vs referência?

### Aplicação
10. Por que funções recebem `&str` em vez de `String`?
11. Como passar um valor para função sem perder ownership?
12. O que o compilador está tentando te dizer nos erros?

---

## 📚 Recursos

### Leitura Obrigatória
- **Rust Book Capítulo 4**: What is Ownership?
  - https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html

### Prática Obrigatória
- **Rustlings**: Seções `move_semantics` (6 exercícios)
  - https://github.com/rust-lang/rustlings

### Referência
- **Rust by Example**: Ownership and moves
  - https://doc.rust-lang.org/rust-by-example/scope/move.html

---

## 📋 Entregas

### Semana 7

**Dia 1: Setup**
- [ ] Rust instalado e funcionando
- [ ] Projeto `cs-fundamentals` criado
- [ ] "Hello, world!" executando

**Dia 2: Rust Basics**
- [ ] Ler Rust Book capítulos 1-3
- [ ] 5 funções básicas escritas e testadas

**Dia 3: Ownership**
- [ ] Ler Rust Book capítulo 4.1 e 4.2
- [ ] Responder perguntas 1-5 em suas próprias palavras

**Dia 4: Experimentação**
- [ ] Criar 5 exemplos que NÃO compilam por ownership
- [ ] Para cada um, explicar POR QUE não compila

**Dia 5: Rustlings**
- [ ] Completar `intro` e `variables`

### Semana 8

**Dia 1: Borrowing**
- [ ] Ler Rust Book capítulo 4.3
- [ ] Responder perguntas 6-9

**Dia 2: Prática**
- [ ] Completar Rustlings `move_semantics`
- [ ] Criar 3 exemplos demonstrando regras de borrowing

**Dia 3: Aplicação**
- [ ] Responder perguntas 10-12
- [ ] Reescrever código existente usando borrowing

**Dia 4: Projeto**
- [ ] Criar CLI que processa texto
- [ ] Usar ownership e borrowing corretamente
- [ ] Nenhum `clone()` desnecessário

**Dia 5: Consolidação**
- [ ] Técnica Feynman: explicar ownership em 1 parágrafo
- [ ] Criar 5 cards para SRS

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Olhar código e prever se compila (ownership)
2. [ ] Explicar ownership para outra pessoa
3. [ ] Escrever código sem lutar com o compilador
4. [ ] Justificar cada uso de `&`, `&mut`, `clone()`

### Red flags (precisa revisar):
- Usa `clone()` para "fazer compilar"
- Não entende os erros do compilador
- Não consegue explicar sem olhar material

---

## 🧠 Cards SRS (criar você mesmo)

Crie cards para:
- As 3 regras de ownership
- Diferença move vs copy
- Diferença `&` vs `&mut`
- Quando usar clone vs referência
- O que borrowing previne

---

## 🔄 Reflexão (preencher ao final)

### O que eu descobri?
_Suas respostas às perguntas guia_

### O que foi difícil?
_Onde você travou_

### O que ainda não está claro?
_Para revisitar_

### Confiança (1-5)
- [ ] Ownership: _/5
- [ ] Borrowing: _/5

---

## ⏭️ Próximo

**Semana 9-10**: Lifetimes
- Quando o compilador precisa de ajuda?
- O que significa `'a`?
