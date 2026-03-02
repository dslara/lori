# 📅 Semana 25-26: Trees & BST 🌳

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar Binary Search Tree do zero
- Entender traversals (inorder, preorder, postorder)
- Analisar por que BST pode degenerar para O(n)
- Introdução a árvores balanceadas

---

## ❓ Perguntas Guia

### Conceitos de Árvores
1. O que é uma árvore em CS?
2. O que são: root, leaf, internal node?
3. O que são: parent, child, sibling?
4. O que é "height" de uma árvore?
5. O que é "depth" de um nó?
6. O que é "binary tree"?

### Binary Search Tree
7. O que define uma BST?
8. Qual a propriedade que BST mantém?
9. Por que essa propriedade permite busca O(log n)?
10. Quando BST tem O(n) em vez de O(log n)?
11. O que é uma "degenerate tree"?

### Operações
12. Como buscar um valor em BST?
13. Como inserir um valor em BST?
14. Como deletar um valor em BST? (3 casos)
15. Como encontrar mínimo e máximo?
16. Como encontrar o "successor" de um nó?

### Traversals
17. O que é inorder traversal? O que produz em BST?
18. O que é preorder traversal? Quando usar?
19. O que é postorder traversal? Quando usar?
20. O que é level-order traversal? Qual estrutura usa?
21. Como implementar traversal iterativo (sem recursão)?

### Árvores Balanceadas (introdução)
22. O que significa "balanceada"?
23. O que é AVL tree? (conceito)
24. O que é Red-Black tree? (conceito)
25. Por que `std::collections::BTreeMap` usa B-Tree?

---

## 📚 Recursos

### Leitura
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| CLRS | Chapter 12 - Binary Search Trees | Teoria completa |
| Visualgo.net | BST | Visualização interativa |

### Em Rust
| Recurso | Propósito |
|---------|-----------|
| `std::collections::BTreeMap` docs | Árvore balanceada em Rust |

---

## 📋 Entregas

### Semana 25: BST Básica

**Dia 1: Conceitos de Árvores**
- [ ] Responder perguntas 1-6
- [ ] Desenhar árvore com 10 nós
- [ ] Identificar: root, leaves, height, depth
- [ ] Calcular: máximo de nós em árvore de height h

**Dia 2: BST Propriedade**
- [ ] Responder perguntas 7-11
- [ ] Criar struct `TreeNode<T>` em Rust
- [ ] Desenhar BST para inserções: 5, 3, 7, 1, 4, 6, 8
- [ ] Desenhar BST degenerada para: 1, 2, 3, 4, 5

**Dia 3: Search e Insert**
- [ ] Responder perguntas 12-13
- [ ] Implementar `search(value) -> bool`
- [ ] Implementar `insert(value)`
- [ ] Testar com sequências diferentes

**Dia 4: Delete**
- [ ] Responder pergunta 14
- [ ] Implementar delete para folha
- [ ] Implementar delete para nó com 1 filho
- [ ] Implementar delete para nó com 2 filhos

**Dia 5: Min/Max/Successor**
- [ ] Responder perguntas 15-16
- [ ] Implementar `find_min()` e `find_max()`
- [ ] Implementar `successor(node)`
- [ ] Testar todas as operações

### Semana 26: Traversals e Problemas

**Dia 1: Traversals Recursivos**
- [ ] Responder perguntas 17-20
- [ ] Implementar inorder traversal
- [ ] Implementar preorder traversal
- [ ] Implementar postorder traversal
- [ ] Testar: inorder de BST é ordenado?

**Dia 2: Traversals Iterativos**
- [ ] Responder pergunta 21
- [ ] Implementar inorder iterativo (com Stack)
- [ ] Implementar level-order (com Queue)
- [ ] Comparar: recursivo vs iterativo

**Dia 3: Problemas Clássicos**
- [ ] Problema: Validate BST
- [ ] Problema: Lowest Common Ancestor
- [ ] Problema: Kth Smallest Element in BST
- [ ] Problema: Convert Sorted Array to BST

**Dia 4: Balanceamento (Conceitos)**
- [ ] Responder perguntas 22-25
- [ ] Pesquisar: como AVL mantém balanceamento?
- [ ] Pesquisar: rotações (left, right)
- [ ] Por que não implementamos AVL do zero?

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Comparar: BST vs HashMap para busca
- [ ] Cards SRS para operações e complexidades
- [ ] Resumo: quando usar BST vs HashMap vs sorted array

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar BST com insert, search, delete
2. [ ] Executar todos os traversals
3. [ ] Explicar por que BST pode ser O(n)
4. [ ] Validar se árvore é BST
5. [ ] Calcular height de árvore

### Complexidades para Saber
| Operação | Média | Pior (degenerada) |
|----------|-------|-------------------|
| Search | O(log n) | O(n) |
| Insert | O(log n) | O(n) |
| Delete | O(log n) | O(n) |
| Min/Max | O(log n) | O(n) |

### Red flags (precisa revisar):
- Não sabe a propriedade de BST
- Confunde traversals
- Não entende quando BST degenera

---

## 🔄 Reflexão

### Recursão
_Como árvores e recursão se relacionam?_

### Trade-offs
_Quando usar BST vs HashMap vs sorted array?_

### Balanceamento
_Por que árvores balanceadas existem?_

---

## ⏭️ Próximo

**Semana 27-28**: Heaps
- Como representar árvore em array?
- O que é heap property?
- Como implementar priority queue?
