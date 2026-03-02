# Learning Map: M3 Data Structures (Semanas 18-29)

> **Plano tático** para as 12 semanas deste módulo. Para visão estratégica global, veja [master-learning-map](../../shared/master-learning-map.md).

---

## Pergunta Central do Módulo

**Como escolher a estrutura de dados certa para cada problema?**

---

## Estratégia Dual-Language

Para cada estrutura: **Python primeiro** (entender o conceito), **Zig depois** (aprender gerenciamento de memória).

| Passo | Linguagem | Objetivo |
|-------|-----------|----------|
| 1 | Python | Verificar que o algoritmo/conceito está claro |
| 2 | Zig | Reimplementar com allocators explícitos e segurança de memória |

Se travar >30min na implementação Zig, volte ao Python e revise o conceito antes de continuar.

---

## Timeline

| Semana | Tema | Pergunta Guia | LeetCode |
|--------|------|---------------|---------|
| 18 | Grafos (intro) | Quais as representações básicas? | - |
| 19-20 | Arrays & ArrayList | Como ArrayList cresce dinamicamente em Zig? | - |
| 21-22 | Linked Lists | Como gerenciar nós com allocators explícitos? | - |
| 23-24 | Stacks & Queues | Quais problemas resolvem naturalmente? | - |
| 25-26 | Hash Tables | Como colisões são resolvidas? Open addressing? | - |
| 27-28 | Trees & BST/AVL | Por que O(log n) não é garantido? AVL rebalanceia como? | - |
| 29 | Heaps & Union-Find + Mini-Projeto 2 | Como representar árvore em array? Config Parser (key=value) | **Benchmark Q1** |

---

## Horas Estimadas

- Total: ~60h (12 semanas + mini-projeto)
- Distribuição sugerida: 1h/dia, 5 dias/semana

---

## Benchmark Q1 (Semana 29)

**Critério de sucesso**: Implementar 5 estruturas do zero em 90 minutos.

Estruturas obrigatórias:
1. LinkedList (singly ou doubly)
2. Stack
3. Queue
4. HashMap (open addressing ou chaining)
5. BST

Regras:
- Sem consultar código anterior
- Cada estrutura com init/deinit e operações principais
- Código deve compilar e passar testes básicos

---

## Métricas de Acompanhamento

| Semana | Status | Horas | Estrutura implementada |
|--------|--------|-------|----------------------|
| 18 | [ ] | | Grafos intro |
| 19-20 | [ ] | | ArrayList |
| 21-22 | [ ] | | LinkedList |
| 23-24 | [ ] | | Stack, Queue |
| 25-26 | [ ] | | HashMap |
| 27-28 | [ ] | | BST, AVL |
| 29 (Benchmark Q1) | [ ] | | Heap, Union-Find + Config Parser |
| Buffer 3 | [ ] | | |

**Total M3**: 0/60h  
**Benchmark Q1**: [ ] Não feito
