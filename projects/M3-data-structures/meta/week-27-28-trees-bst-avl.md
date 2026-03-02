# Semana 27-28: Trees & BST + AVL

## Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar Binary Search Tree com insert, search, delete
- Explicar por que BST não garante O(log n) no pior caso
- Implementar traversals: inorder, preorder, postorder
- Entender rotações de AVL e implementar auto-balanceamento

---

## Perguntas Guia

### Binary Trees
1. O que é um nó de árvore binária? Quais campos tem?
2. O que é uma árvore completa (complete)? Cheia (full)? Perfeita (perfect)?
3. O que é altura de árvore? Qual a altura de árvore com n nós no melhor caso?
4. O que é DFS em árvore? Quais as 3 ordens de traversal?
5. O que é BFS em árvore (level-order traversal)?

### BST
6. O que é a BST property? Como ela permite busca eficiente?
7. Como inserir em BST? Complexidade?
8. Como buscar em BST? Complexidade?
9. Como encontrar mínimo e máximo?
10. Como fazer delete em BST? Os 3 casos?
11. Por que BST sem balanceamento pode ser O(n) no pior caso?

### Traversals
12. O que inorder traversal produz em uma BST? (lista ordenada!)
13. Como implementar traversal recursivamente?
14. Como implementar traversal iterativamente (com Stack)?
15. O que é Morris Traversal? (sem stack e sem recursão)

### AVL Trees
16. O que é fator de balanceamento (balance factor)?
17. Quando uma AVL tree faz rotação?
18. O que é rotação à direita? À esquerda?
19. O que são rotações duplas (LR, RL)?
20. Como AVL garante O(log n) para todas as operações?
21. Qual o overhead de AVL vs BST simples?

---

## Recursos

### Tier 1 (obrigatório)
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| CLRS | Chapter 12 - BST, Chapter 13 intro | Teoria |
| Visualgo.net | BST, AVL | Visualização de rotações |
| LeetCode (via Python) | #94, #102, #98, #235 | Problemas clássicos |

### Tier 2 (referência)
| Recurso | Quando usar |
|---------|-------------|
| Wikipedia: AVL tree | Pseudo-código de rotações |

---

## Entregas

### Semana 27: BST

**Dia 1: Estrutura e Traversals**
- [ ] Responder perguntas 1-5
- [ ] Implementar `BSTNode(T)` com `left: ?*Node, right: ?*Node, value: T`
- [ ] Implementar inorder, preorder, postorder (recursivos)
- [ ] Verificar: inorder de BST produz lista ordenada?

**Dia 2: Insert e Search**
- [ ] Responder perguntas 6-9
- [ ] Implementar `BST(T)`:
  - `init(allocator)`, `deinit()` (libera todos os nós)
  - `insert(value) !void`
  - `contains(value) bool`
  - `min() ?T`, `max() ?T`
- [ ] 5+ testes passando

**Dia 3: Delete**
- [ ] Responder pergunta 10
- [ ] Implementar `delete(value) bool` com os 3 casos:
  - Nó é folha: remover diretamente
  - Nó tem 1 filho: substituir por filho
  - Nó tem 2 filhos: substituir por inorder successor
- [ ] Verificar: árvore continua válida após delete?

**Dia 4: Worst Case + Traversal Iterativo**
- [ ] Responder perguntas 11, 13-14
- [ ] Demonstrar: inserir [1, 2, 3, 4, 5] cria lista degenerada
- [ ] Implementar traversal iterativo com Stack
- [ ] Comparar: recursivo vs iterativo — quando iterativo é necessário?

**Dia 5: Problemas**
- [ ] Resolver (Python): #94 Binary Tree Inorder Traversal
- [ ] Resolver (Python): #98 Validate BST
- [ ] Resolver (Python): #235 LCA of BST
- [ ] Reimplementar #98 em Zig

### Semana 28: AVL Tree

**Dia 1: Balance Factor e Rotação**
- [ ] Responder perguntas 16-18
- [ ] Implementar `height(node)` e `balanceFactor(node)`
- [ ] Desenhar: rotação à direita e à esquerda em papel
- [ ] Implementar `rotateRight(node)` e `rotateLeft(node)`

**Dia 2: Rotações Duplas e Rebalanceamento**
- [ ] Responder perguntas 19-20
- [ ] Implementar `balance(node)` com os 4 casos:
  - LL: rotate right
  - RR: rotate left
  - LR: rotate left + rotate right
  - RL: rotate right + rotate left

**Dia 3: AVL Insert**
- [ ] Implementar `AVLTree(T)` com insert que mantém balanceamento
- [ ] Verificar: altura máxima de árvore AVL com n nós é O(log n)?
- [ ] Testar: inserir [1,2,3,4,5] — arvore ainda fica balanceada?

**Dia 4: AVL Delete (opcional — se tempo permitir)**
- [ ] Implementar delete com rebalanceamento
- [ ] Verificar: delete mantém propriedades AVL?
- [ ] Benchmark: BST vs AVL em sequência ordenada de inserções

**Dia 5: Consolidação**
- [ ] Responder pergunta 21: overhead de AVL vs BST simples
- [ ] Criar tabela: BST vs AVL vs HashMap — quando usar cada
- [ ] Cards SRS para rotações e casos de rebalanceamento

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar BST com insert/search/delete do zero em 25 minutos
2. [ ] Explicar os 3 casos de delete em BST
3. [ ] Desenhar rotação AVL em papel e explicar por que corrige desbalanceamento
4. [ ] Dizer imediatamente por que `[1,2,3,4,5]` cria BST O(n)
5. [ ] Verificar se uma árvore é BST válida

### Complexidades
| Operação | BST (médio) | BST (pior) | AVL |
|----------|-------------|------------|-----|
| insert | O(log n) | O(n) | O(log n) |
| search | O(log n) | O(n) | O(log n) |
| delete | O(log n) | O(n) | O(log n) |

### Red flags (precisa revisar):
- Não entende os 3 casos de delete
- Não consegue desenhar rotação AVL
- Confunde complete/full/perfect tree

---

## Reflexão

### BST vs AVL vs HashMap
_Em quais situações cada estrutura é claramente melhor?_

### Rotações
_Por que rotações preservam a BST property?_

### Confiança (1-5)
- BST: _/5
- Traversals: _/5
- AVL: _/5

---

## Próximo

**Semana 29**: Heaps & Union-Find
- Como representar árvore completa em array?
- Por que build-heap é O(n) e não O(n log n)?
- O que Union-Find resolve que DFS/BFS não resolve eficientemente?
