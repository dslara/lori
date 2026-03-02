# M2: Zig Foundations + Comptime

**Objetivo**: Dominar gestão explícita de memória em Zig — o modelo mental central para tudo que vem depois.

**Semanas**: 7-16 (9 semanas de estudo + 1 mini-projeto, ~50h)  
**Pré-requisitos**: M1 (básico — entender notação de complexidade)  
**Módulo anterior**: [M1: Math Foundations](../M1-math-foundations/README.md)  
**Próximo módulo**: [M3: Data Structures](../M3-data-structures/README.md)

---

## O que você vai aprender

- Como stack e heap funcionam em Zig
- Ponteiros, optionals e null safety explícito
- Error handling com `try`/`catch`/`errdefer`
- Structs, enums, unions e testes unitários
- Modelo de memória profundo: alignment e padding
- Allocators: Arena vs GPA vs FixedBuffer
- Comptime patterns: type functions, `@TypeOf`, `@typeInfo`, code gen simples
- **Resultado**: Explicar modelo de memória de Zig sem consulta; implementar `MyArrayList(T)` funcional

---

## Pré-requisitos (checklist)

Antes de começar M2, confirme:
- [ ] Consigo ler Big O notation e entender o que significa
- [ ] Entendo o conceito de função matemática
- [ ] Sei o que é logaritmo e por que aparece em complexidade
- [ ] Zig instalado: `zig version` retorna 0.13+

---

## Timeline Semanal

| Semana | Tema | Pergunta Central |
|--------|------|-----------------|
| 7 | Zig Setup | Tenho tudo que preciso para começar Zig? |
| 8 | Básico + Memória Overview | Como stack e heap funcionam em Zig? |
| 9 | Ponteiros + Optionals | Diferença entre `*T`, `?T` e `?*T`? |
| 10 | Error Handling | Como `try`/`catch`/`errdefer` funcionam? |
| 11 | Structs/Enums/Unions + Testes | Como definir tipos customizados com testes? |
| 12 | Memory Deep Dive | Por que alignment e padding importam? |
| 13 | Allocators + ArrayList | Como allocators funcionam? Arena vs GPA? |
| 14 | Comptime Patterns | Como type functions funcionam em Zig? |
| 15 | Comptime Code Gen | Como gerar código em compile-time? |
| 16 | Mini-Projeto 1: Arena Allocator | Arena Allocator com instrumentação |

**Buffer 2** (Semana 17): Recuperação antes do M3.

---

## Arquivos deste módulo

```
meta/
├── phase-1-overview.md              # Visão completa do phase
├── week-07-zig-setup.md
├── week-08-zig-basics-memory.md
├── week-09-pointers-optionals.md
├── week-10-error-handling.md
├── week-11-structs-enums-tests.md
├── week-12-memory-deep-dive.md
├── week-13-allocators-arraylist.md
├── week-14-comptime-patterns.md
├── week-15-comptime-codegen.md
└── mini-project-1-arena-allocator.md
```

---

## Benchmark de conclusão

Ao terminar M2, você deve conseguir:
- [ ] Explicar a diferença entre stack e heap sem consulta
- [ ] Implementar `MyArrayList(T)` do zero com allocator explícito
- [ ] Escrever um Arena Allocator funcional com instrumentação (Semana 16)
- [ ] Explicar por que Zig não tem GC e o que isso implica

---

## Conexões com outros módulos

- **M3 (Data Structures)**: Ownership de nós em linked lists, custom allocators para DS
- **M4 (Algorithms)**: Implementação de algoritmos em Zig usa alocação explícita
- **M3 (Data Structures)**: Graphs intro e DS complexas dependem de base de Zig sólida
- **M4 (Algorithms + DP)**: DP é técnica algorítmica — conexões com analise de complexidade
- **M5 (Go + OS/CPU)**: Comparacao Zig (explicito) vs Go (GC) — M2 da o lado Zig

---

## Retrieval de módulos anteriores

**Semana 7 deste módulo** (antes de começar):
- [ ] Quiz M1 (5 min): "O que significa O(n log n)? Quando aparece?"
- [ ] Quiz M1 (5 min): "Como calcular a complexidade de um loop aninhado?"

---

## Como começar

```
echo "M2-zig-foundations" > .current-topic
make start
```

Comece por `meta/phase-1-overview.md`, depois `meta/week-07-zig-setup.md`.
