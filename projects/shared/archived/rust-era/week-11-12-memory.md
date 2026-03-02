# 📅 Semana 11-12: Memory Deep Dive & Error Handling 🧠

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Olhar qualquer código Rust e dizer onde cada variável vive
- Calcular o tamanho em bytes de qualquer struct
- Explicar alignment e padding
- Escolher entre Box, Rc, Arc, RefCell baseado em requisitos
- Usar Result e Option idiomaticamente para error handling

---

## ❓ Perguntas Guia

### Stack vs Heap
1. O que é a stack? Quais suas características?
2. O que é a heap? Quais suas características?
3. Por que a stack é mais rápida?
4. Quais tipos vivem na stack? Quais na heap?
5. Onde vive uma `String`? E um `&str`?
6. Onde vive um `Vec<i32>`? E um `[i32; 5]`?
7. O que significa "tamanho conhecido em compile time"?

### Memory Layout
8. O que é "size" de um tipo?
9. O que é "alignment"?
10. O que é "padding" e por que existe?
11. Qual o tamanho de uma struct com campos u8, u64, u8? Por quê?
12. Como otimizar o layout de uma struct?

### Smart Pointers
13. O que é `Box<T>`? Quando usar?
14. O que é `Rc<T>`? Quando usar?
15. O que é `Arc<T>`? Como difere de Rc?
16. O que é `RefCell<T>`? Que problema resolve?
17. Por que `Rc<RefCell<T>>` é um padrão comum?
18. O que é um memory leak com Rc? Como criar um?

### Decisões
19. Como decidir entre stack e heap allocation?
20. Como decidir entre Box, Rc, e Arc?
21. Quando usar clone() vs referência vs smart pointer?

### Error Handling (Result & Option)
22. O que é `Option<T>`? Quando usar?
    - `Some(T)` vs `None`
    - Por que Rust não tem null?

23. O que é `Result<T, E>`? Quando usar?
    - `Ok(T)` vs `Err(E)`
    - Diferença entre Option e Result

24. Como propagar erros com `?` operator?
    - Quando você pode usar `?`?
    - O que `?` faz internamente?

25. Quais são os métodos importantes de Option?
    - `unwrap()`, `expect()`, `unwrap_or()`, `unwrap_or_default()`
    - `map()`, `and_then()`, `ok_or()`
    - Por que `unwrap()` é desencorajado em produção?

26. Quais são os métodos importantes de Result?
    - `unwrap()`, `expect()`, `unwrap_or()`, `unwrap_or_else()`
    - `map()`, `map_err()`, `and_then()`
    - Convertendo entre Result e Option

27. Como criar seus próprios tipos de erro?
    - Enums de erro
    - Implementando `std::error::Error`

28. O que é o padrão `Box<dyn Error>`?
    - Quando usar para simplificar error handling?

---

## 📚 Recursos

### Leitura Obrigatória
- **Rust Book Capítulo 9**: Error Handling
  - https://doc.rust-lang.org/book/ch09-00-error-handling.html
- **Rust Book Capítulo 15**: Smart Pointers
  - https://doc.rust-lang.org/book/ch15-00-smart-pointers.html

### Exploração
- **std::mem** documentation
  - Descubra: `size_of`, `align_of`, `size_of_val`
- **Rustonomicon**: Data Representation
  - https://doc.rust-lang.org/nomicon/data.html

### Ferramenta
- **Rust Playground** para experimentar
  - https://play.rust-lang.org/

---

## 📋 Entregas

### Semana 11: Stack, Heap, Layout, Error Handling Básico

**Dia 1: Stack vs Heap**
- [ ] Responder perguntas 1-4
- [ ] Listar 10 tipos e classificar: stack, heap, ou ambos

**Dia 2: Tipos Compostos**
- [ ] Responder perguntas 5-7
- [ ] Desenhar diagrama de memória para String e Vec

**Dia 3: Size e Alignment**
- [ ] Descobrir como verificar tamanho de tipos em Rust
- [ ] Responder perguntas 8-10
- [ ] Medir tamanho de 10 tipos diferentes

**Dia 4: Padding + Option/Result Intro**
- [ ] Responder perguntas 11-12
- [ ] Criar 3 structs e calcular tamanho ANTES de verificar
- [ ] Responder perguntas 22-23
- [ ] Converter 3 funções que usam panic! para usar Result

**Dia 5: Error Handling**
- [ ] Responder perguntas 24-26
- [ ] Praticar ? operator em 5 exemplos
- [ ] Implementar função que lê arquivo e retorna Result

### Semana 12: Smart Pointers + Error Handling Avançado

**Dia 1: Box + Custom Errors**
- [ ] Responder pergunta 13
- [ ] Criar tipo recursivo usando Box
- [ ] Responder perguntas 27-28
- [ ] Criar enum de erro customizado

**Dia 2: Rc**
- [ ] Responder perguntas 14 e 18
- [ ] Criar exemplo com múltiplos donos
- [ ] Demonstrar memory leak com ciclo

**Dia 3: Arc + RefCell**
- [ ] Responder perguntas 15-17
- [ ] Criar exemplo multi-threaded com Arc
- [ ] Criar exemplo com interior mutability

**Dia 4: Decisões**
- [ ] Responder perguntas 19-21
- [ ] Criar "decision tree" para escolher smart pointer
- [ ] 5 cenários: qual smart pointer usar?
- [ ] 5 cenários: Option, Result, ou panic?

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Projeto: Memory Visualizer com error handling robusto
- [ ] Cards SRS para conceitos de memória e error handling

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Dado qualquer tipo, dizer onde vive (stack/heap)
2. [ ] Calcular tamanho de struct manualmente
3. [ ] Explicar por que padding existe
4. [ ] Escolher smart pointer correto sem hesitar
5. [ ] Desenhar diagrama de memória para código complexo
6. [ ] Usar Result/Option idiomaticamente
7. [ ] Criar e usar tipos de erro customizados

### Teste Prático
Olhe este código e responda sem rodar:
- Onde cada variável vive?
- Qual o tamanho de cada tipo?
- Há algum problema de memória?
- Quais funções podem falhar? Como tratar?

```
let x = 42;
let s = String::from("hello");
let v = vec![1, 2, 3];
let b = Box::new(100);
let r = Rc::new(RefCell::new(vec![1, 2]));
let file = File::open("data.txt")?;
let parsed: i32 = "42".parse()?;
```

---

## 🔄 Reflexão

### Conexão
_Como memória se relaciona com ownership?_

### Error Handling
_Quando usar panic! vs Result?_

### Insight mais importante
_O que mudou na sua compreensão?_

### Ainda confuso sobre
_Para revisitar_

---

## ⏭️ Próximo

**Semana 13-14**: Smart Pointers & Implementing Vec<T>
- Como Vec cresce dinamicamente?
- Como implementar do zero?
- Aplicar error handling em implementações
