# M3: Data Structures

**Objetivo**: Implementar e compreender estruturas de dados clássicas do zero em Zig.

**Semanas**: 18-29 (12 semanas + 1 mini-projeto, ~60h)  
**Pré-requisitos**: M2 completo (ownership necessário para gerenciar nós)  
**Módulo anterior**: [M2: Zig Foundations](../M2-zig-foundations/README.md)  
**Próximo módulo**: [M4: Algorithms](../M4-algorithms/README.md)

---

## O que você vai aprender

- Grafos (intro) — vocabulário e representações
- Arrays e ArrayList — como crescimento dinâmico funciona
- Linked Lists — gerenciar nós com allocators explícitos
- Stacks e Queues — quais problemas resolvem naturalmente
- Hash Tables — colisões e open addressing em Zig
- Trees, BST e AVL — por que O(log n) não é garantido
- Heaps e Union-Find — representação de árvore em array
- **Resultado**: Implementar 5 estruturas do zero em 90 minutos (Benchmark Q1)

---

## Estratégia Dual-Language (Proposta 4 — v5.0)

Para cada estrutura de dados, seguir esta ordem:

1. **Python primeiro** — implementar para entender o conceito sem overhead de memória
2. **Zig depois** — reimplementar para aprender gerenciamento explícito de memória

**Justificativa**: Separa duas dificuldades distintas — compreensão do algoritmo vs. implementação low-level. Quando você debugar um segfault ou allocator leak em Zig, o conceito já está claro.

**Regra prática**: Se a implementação Python passar nos testes, pode avançar para Zig. Se travar >30min em Zig, revise o Python antes de continuar.

---

## Pré-requisitos (checklist)

Antes de começar M3, confirme:
- [ ] Implementei `MyArrayList(T)` com allocator em M2
- [ ] Entendo `defer`/`errdefer` e por que usar
- [ ] Consigo escrever structs com métodos em Zig
- [ ] Mini-Projeto 1 (Arena Allocator) concluído

---

## Timeline Semanal

| Semana | Tema | Pergunta Central |
|--------|------|-----------------|
| 18 | Grafos (intro) | Quais são as representações básicas? |
| 19-20 | Arrays & ArrayList | Como ArrayList cresce dinamicamente em Zig? |
| 21-22 | Linked Lists | Como gerenciar nós com allocators explícitos? |
| 23-24 | Stacks & Queues | Quais problemas resolvem naturalmente? |
| 25-26 | Hash Tables | Como colisões são resolvidas? Open addressing em Zig? |
| 27-28 | Trees & BST/AVL | Por que O(log n) não é garantido? Como AVL rebalanceia? |
| 29 | Heaps & Union-Find + Mini-Projeto 2 | Como representar árvore em array? Config Parser (key=value) |

**Buffer 3** (Semana 30): Recuperacao antes do M4.

---

## Arquivos deste módulo

```
meta/
├── phase-2-overview.md              # Visão completa do phase
├── week-18-graphs-intro.md
├── week-19-20-arrays-arraylist.md
├── week-21-22-linked-lists.md
├── week-23-24-stacks-queues.md
├── week-25-26-hash-tables.md
├── week-27-28-trees-bst-avl.md
├── week-29-heaps-union-find.md
└── mini-project-2-config-parser.md
```

---

## Benchmark de conclusão (Q1)

**Benchmark Q1** (Semana 29): Implementar 5 estruturas do zero em 90 minutos.

Ao terminar M3, você deve conseguir:
- [ ] Implementar LinkedList, Stack, Queue, HashMap e BST do zero sem consulta
- [ ] Justificar escolha de estrutura para um problema dado
- [ ] Analisar trade-offs de tempo vs espaço para cada DS
- [ ] Config Parser funcional com comptime (Mini-Projeto 2)

---

## Conexões com outros módulos

- **M2 (Zig + Comptime)**: Ownership e allocators — base para implementar DS com segurança de memória
- **M4 (Algorithms + DP)**: Algoritmos usam DS como substrato; grafos e DS alimentam DP
- **M7 (Compilers)**: AST é uma árvore — Trees & BST são direto aplicáveis

---

## Retrieval de módulos anteriores

**Semana 18 deste modulo** (antes de comecar):
- [ ] Quiz M2 (10 min): "Explique como um Arena Allocator funciona. Qual a diferença para GPA?"
- [ ] Quiz M2 (5 min): "O que acontece se você esquecer de chamar `deinit()` em Zig?"

---

## Como começar

```
echo "M3-data-structures" > .current-topic
make start
```

Comece por `meta/phase-2-overview.md`, depois `meta/week-18-graphs-intro.md`.
