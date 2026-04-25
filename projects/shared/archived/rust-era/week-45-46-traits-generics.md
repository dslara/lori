# 📅 Semana 45-46: Traits & Generics 🎭

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Criar e implementar traits
- Escrever código genérico
- Usar trait bounds efetivamente
- Escolher entre generics e trait objects

---

## ❓ Perguntas Guia

### Traits Básicos
1. O que é uma trait em Rust?
2. Como trait se compara a interface de outras linguagens?
3. Como definir uma trait?
4. Como implementar trait para um tipo?
5. O que são default implementations?
6. Pode implementar trait externa para tipo externo?

### Traits da Standard Library
7. O que é `Clone`? Quando implementar?
8. O que é `Copy`? Qual a relação com Clone?
9. O que é `Debug`? Como usar `#[derive()]`?
10. O que é `PartialEq` e `Eq`?
11. O que é `PartialOrd` e `Ord`?
12. O que é `Default`?
13. O que é `Display` vs `Debug`?

### Generics
14. O que são generics em Rust?
15. Como escrever função genérica?
16. Como escrever struct genérica?
17. O que é "monomorphization"?
18. Qual o custo de runtime de generics?

### Trait Bounds
19. O que são trait bounds?
20. Como usar `where` clause?
21. O que significa `T: Clone + Debug`?
22. O que são "blanket implementations"?

### Trait Objects
23. O que é trait object?
24. O que significa `dyn Trait`?
25. O que é "dynamic dispatch"?
26. Quando usar `Box<dyn Trait>` vs generics?
27. O que é "object safety"?

### Associated Types
28. O que são associated types?
29. Quando usar associated type vs generic?
30. Exemplo: Iterator trait

---

## 📚 Recursos

### Leitura
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| Rust Book | Chapter 10 - Generics, Traits | Fundamentos |
| Rust Book | Chapter 17.2 - Trait Objects | Dynamic dispatch |
| Rust by Example | Traits | Exemplos práticos |

---

## 📋 Entregas

### Semana 45: Traits e Generics

**Dia 1: Traits Básicos**
- [ ] Responder perguntas 1-6
- [ ] Criar trait `Drawable` com método `draw()`
- [ ] Implementar para `Circle` e `Rectangle`
- [ ] Usar default implementation

**Dia 2: Std Traits**
- [ ] Responder perguntas 7-13
- [ ] Implementar Clone manualmente
- [ ] Implementar Debug manualmente
- [ ] Implementar PartialEq para struct custom
- [ ] Usar `#[derive()]` para comparar

**Dia 3: Generics**
- [ ] Responder perguntas 14-18
- [ ] Reescrever função para ser genérica
- [ ] Criar struct genérica `Pair<T>`
- [ ] Implementar métodos genéricos

**Dia 4: Trait Bounds**
- [ ] Responder perguntas 19-22
- [ ] Escrever função que requer Clone
- [ ] Usar `where` para bounds complexos
- [ ] Explorar blanket implementations

**Dia 5: Prática**
- [ ] Criar trait `Summary` para vários tipos
- [ ] Implementar para diferentes structs
- [ ] Função que aceita `impl Summary`

### Semana 46: Trait Objects e Advanced

**Dia 1: Trait Objects**
- [ ] Responder perguntas 23-27
- [ ] Criar `Vec<Box<dyn Drawable>>`
- [ ] Comparar: generics vs trait objects
- [ ] Quando cada um é melhor?

**Dia 2: Associated Types**
- [ ] Responder perguntas 28-30
- [ ] Estudar Iterator trait
- [ ] Implementar Iterator para tipo custom
- [ ] Por que associated type em vez de generic?

**Dia 3: Patterns Comuns**
- [ ] Newtype pattern
- [ ] Extension traits
- [ ] Marker traits (Sized, Send, Sync)
- [ ] Supertraits

**Dia 4: Problemas**
- [ ] Refatorar código anterior usando traits
- [ ] Criar abstração para suas estruturas de dados
- [ ] Implementar operador overloading

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Criar trait hierarchy para projeto
- [ ] Cards SRS para traits da stdlib
- [ ] Resumo: generics vs trait objects

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Criar trait com default implementation
2. [ ] Escrever função genérica com bounds
3. [ ] Implementar Iterator para tipo custom
4. [ ] Escolher entre generics e trait objects
5. [ ] Explicar monomorphization vs dynamic dispatch

### Comparação Rápida

| Aspecto | Generics | Trait Objects |
|---------|----------|---------------|
| Dispatch | Static (compile time) | Dynamic (runtime) |
| Performance | Zero-cost | Indirection overhead |
| Binary size | Pode aumentar | Menor |
| Flexibility | Homogêneo | Heterogêneo |

### Red flags (precisa revisar):
- Não sabe diferença entre Clone e Copy
- Confunde generics com trait objects
- Não entende object safety

---

## 🔄 Reflexão

### Abstração
_Como traits permitem código reutilizável?_

### Trade-offs
_Quando você escolheria trait objects?_

### Conexão
_Como isso se compara a interfaces em outras linguagens?_

---

## ⏭️ Próximo

**Semana 47-48**: Dynamic Programming
- Como identificar problemas de DP?
- Memoization vs Tabulation
- Patterns clássicos de DP
