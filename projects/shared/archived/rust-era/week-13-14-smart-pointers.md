# 📅 Semana 13-14: Implementing Vec<T> 🔧

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar um Vec do zero em Rust
- Entender alocação dinâmica de memória
- Explicar como Vec cresce (growth strategy)
- Usar unsafe Rust de forma controlada

---

## ❓ Perguntas Guia

### Como Vec funciona internamente
1. O que Vec armazena internamente? (3 campos)
2. O que é "capacity" vs "length"?
3. Por que Vec precisa de alocação na heap?
4. Como Vec sabe quando precisa crescer?
5. Qual a estratégia de crescimento padrão? Por quê?

### Alocação de Memória
6. O que é um "allocator"?
7. Como se aloca memória raw em Rust?
8. O que `std::alloc::Layout` representa?
9. Por que alignment importa na alocação?
10. O que acontece se você alocar e não desalocar?

### Unsafe Rust
11. O que significa "unsafe" em Rust?
12. Quais operações requerem unsafe?
13. O que são "raw pointers"? Como diferem de referências?
14. O que é `std::ptr::write`? Quando usar?
15. O que é `std::ptr::read`? Quando usar?

### Implementação
16. Como implementar `push()`?
17. Como implementar `pop()`?
18. Como implementar `get()` e `get_mut()`?
19. Como implementar `Drop` para Vec?
20. Por que precisa implementar Drop?

### Crescimento
21. O que significa "amortized O(1)"?
22. Por que dobrar capacity e não incrementar por 1?
23. Como realocar memória preservando dados?
24. O que é `std::alloc::realloc`?

---

## 📚 Recursos

### Leitura Obrigatória
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| Rustonomicon | Implementing Vec | Guia completo de implementação |
| | https://doc.rust-lang.org/nomicon/vec/vec.html | |
| Rust Book Ch 19 | Unsafe Rust | Fundamentos de unsafe |
| | https://doc.rust-lang.org/book/ch19-01-unsafe-rust.html | |

### Exploração
| Recurso | Propósito |
|---------|-----------|
| `std::vec::Vec` source | Ver implementação real |
| `std::alloc` module | APIs de alocação |
| `std::ptr` module | Operações com raw pointers |

### Vídeo (opcional)
| Recurso | Propósito |
|---------|-----------|
| Jon Gjengset - Implementing Vec | Walkthrough detalhado |

---

## 📋 Entregas

### Semana 13: Fundamentos de Alocação

**Dia 1: Anatomia do Vec**
- [ ] Responder perguntas 1-5
- [ ] Desenhar diagrama: Vec na stack apontando para heap
- [ ] Investigar: criar Vec vazio aloca memória?

**Dia 2: Alocação Raw**
- [ ] Responder perguntas 6-10
- [ ] Experimentar `std::alloc::alloc` e `dealloc`
- [ ] Criar programa que aloca e desaloca manualmente

**Dia 3: Unsafe Basics**
- [ ] Responder perguntas 11-15
- [ ] Listar as 5 coisas que unsafe permite
- [ ] Praticar raw pointers: criar, dereferencing

**Dia 4: MyVec Scaffold**
- [ ] Criar struct `MyVec<T>` com campos corretos
- [ ] Implementar `new()` - sem alocação inicial
- [ ] Implementar `capacity()` e `len()`

**Dia 5: Alocação em MyVec**
- [ ] Implementar método privado `grow()`
- [ ] Testar: verificar que grow dobra capacity
- [ ] Lidar com caso especial: capacity 0 → 1

### Semana 14: Completando Vec

**Dia 1: Push & Pop**
- [ ] Responder perguntas 16-17
- [ ] Implementar `push()` usando `ptr::write`
- [ ] Implementar `pop()` usando `ptr::read`
- [ ] Testar com tipos simples (i32)

**Dia 2: Acesso a Elementos**
- [ ] Responder perguntas 18-20
- [ ] Implementar `get()` → `Option<&T>`
- [ ] Implementar `get_mut()` → `Option<&mut T>`
- [ ] Implementar `Drop` trait

**Dia 3: Crescimento**
- [ ] Responder perguntas 21-24
- [ ] Testar push de muitos elementos
- [ ] Verificar que capacity dobra corretamente
- [ ] Medir: comparar crescimento x1.5 vs x2

**Dia 4: Testes & Edge Cases**
- [ ] Testar com tipos que implementam Drop
- [ ] Testar com ZST (zero-sized types)
- [ ] Verificar que não há memory leaks
- [ ] Adicionar Index trait para `vec[i]` syntax

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Comparar seu MyVec com std::vec::Vec
- [ ] Documentar: o que falta para produção?
- [ ] Cards SRS para conceitos de alocação

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar Vec funcional do zero (push, pop, get, drop)
2. [ ] Explicar por que Vec dobra capacity
3. [ ] Usar unsafe de forma controlada e segura
4. [ ] Desenhar o layout de memória de um Vec
5. [ ] Explicar amortized O(1) para push

### Teste Prático
Seu MyVec deve passar estes testes:
```
// Crie os testes você mesmo baseado em:
// - push vários elementos
// - pop retorna na ordem LIFO
// - get retorna None para índice inválido
// - drop é chamado para todos elementos
```

### Red flags (precisa revisar):
- Não sabe diferença entre len e capacity
- Não consegue explicar por que unsafe é necessário
- Programa tem memory leaks
- Não entende amortized analysis

---

## 🔄 Reflexão

### Conexão com semanas anteriores
_Como ownership funciona com alocação manual?_

### O que foi mais difícil?
_Unsafe? Alocação? Growth strategy?_

### Insight mais importante
_O que você não sabia antes?_

### Confiança (1-5)
- [ ] Alocação de memória: _/5
- [ ] Unsafe Rust: _/5
- [ ] Implementar estruturas: _/5

---

## ⏭️ Próximo

**Semana 17-18**: Arrays & Vec (Fase 2)
- Agora que você sabe como Vec funciona por dentro...
- Como usar Vec eficientemente?
- Quais operações são O(1), O(n)?
- Quando usar array fixo vs Vec?
