# 📅 Semana 19-20: Linked Lists 🔗

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar singly e doubly linked list em Rust
- Entender por que linked lists são difíceis em Rust
- Comparar trade-offs vs Vec
- Usar std::collections::LinkedList

---

## ❓ Perguntas Guia

### Por que Linked Lists?
1. Quais as vantagens de linked list sobre array?
2. Quais as desvantagens?
3. Quando linked list é a escolha certa?
4. Por que linked lists são raras em código moderno?

### Anatomia
5. O que é um "node" em linked list?
6. O que é "head" e "tail"?
7. Qual a diferença entre singly e doubly linked?
8. O que é "sentinel node"? Por que usar?

### Complexidade
9. Qual a complexidade de inserir no início?
10. Qual a complexidade de inserir no final (sem tail pointer)?
11. Qual a complexidade de buscar um elemento?
12. Qual a complexidade de deletar um elemento?

### Rust e Linked Lists
13. Por que linked lists são notoriamente difíceis em Rust?
14. Qual o problema com ownership em linked lists?
15. Por que precisamos de `Option<Box<Node>>` para singly linked?
16. Por que precisamos de `Rc<RefCell<Node>>` para doubly linked?
17. O que é `std::collections::LinkedList`? Quando usar?

### Operações
18. Como reverter uma linked list?
19. Como detectar ciclo em linked list?
20. Como encontrar o meio de uma linked list?
21. Como merge duas linked lists ordenadas?

---

## 📚 Recursos

### Leitura Obrigatória
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| "Learn Rust With Entirely Too Many Linked Lists" | Todo | Guia definitivo |
| | https://rust-unofficial.github.io/too-many-lists/ | |

### Referência
| Recurso | Propósito |
|---------|-----------|
| `std::collections::LinkedList` docs | API padrão |

---

## 📋 Entregas

### Semana 19: Singly Linked List

**Dia 1: Conceitos**
- [ ] Responder perguntas 1-8
- [ ] Desenhar diagrama de singly linked list
- [ ] Desenhar diagrama de doubly linked list
- [ ] Listar 5 casos de uso reais

**Dia 2: Estrutura Básica**
- [ ] Responder perguntas 13-15
- [ ] Criar struct `Node<T>` para singly linked
- [ ] Criar struct `SinglyLinkedList<T>`
- [ ] Implementar `new()` e `is_empty()`

**Dia 3: Push e Pop**
- [ ] Responder perguntas 9-12
- [ ] Implementar `push_front()`
- [ ] Implementar `pop_front()`
- [ ] Testar com vários elementos

**Dia 4: Mais Operações**
- [ ] Implementar `push_back()` (com tail pointer)
- [ ] Implementar `len()`
- [ ] Implementar `peek()` → `Option<&T>`

**Dia 5: Iteração**
- [ ] Implementar `iter()` que retorna Iterator
- [ ] Implementar `into_iter()` (consuming)
- [ ] Testar com for loops

### Semana 20: Doubly Linked e Problemas

**Dia 1: Doubly Linked**
- [ ] Responder pergunta 16
- [ ] Por que singly linked não é suficiente para algumas operações?
- [ ] Criar struct para doubly linked com Rc<RefCell<>>
- [ ] Implementar push_front e push_back

**Dia 2: Problemas Clássicos**
- [ ] Responder perguntas 18-21
- [ ] Implementar: reverter lista
- [ ] Implementar: detectar ciclo (Floyd's algorithm)

**Dia 3: Mais Problemas**
- [ ] Problema: encontrar meio da lista (fast/slow pointers)
- [ ] Problema: merge duas listas ordenadas
- [ ] Problema: remover n-ésimo do final

**Dia 4: Comparação**
- [ ] Benchmark: linked list vs Vec para insert(0)
- [ ] Benchmark: linked list vs Vec para iteration
- [ ] Documentar quando usar cada um

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Ler capítulos relevantes de "Too Many Linked Lists"
- [ ] Cards SRS para operações e trade-offs
- [ ] Escrever: "Por que evitar linked lists na maioria dos casos"

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar singly linked list funcional
2. [ ] Explicar por que doubly linked precisa Rc<RefCell>
3. [ ] Detectar ciclo usando Floyd's algorithm
4. [ ] Comparar linked list vs Vec com dados concretos
5. [ ] Justificar quando linked list é a escolha certa

### Teste Prático
Seu singly linked list deve:
- Push/pop front em O(1)
- Iterar sobre elementos
- Não ter memory leaks

### Red flags (precisa revisar):
- Não entende por que ownership complica linked lists
- Não sabe a complexidade de operações
- Sempre usa linked list em vez de Vec

---

## 🔄 Reflexão

### Insight sobre Rust
_O que linked lists ensinam sobre ownership?_

### Trade-offs
_Em que situações você usaria linked list?_

### Cache locality
_Por que arrays são geralmente mais rápidos na prática?_

---

## ⏭️ Próximo

**Semana 21-22**: Stacks & Queues
- Como implementar usando o que aprendemos?
- Quais problemas Stack e Queue resolvem naturalmente?
