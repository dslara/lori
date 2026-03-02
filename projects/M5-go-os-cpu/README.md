# M5: Go + OS/CPU

**Objetivo**: Aprender Go e entender fundamentos de CPU e OS.

**Semanas**: 46-54 (9 semanas, ~45h)  
**Pré-requisitos**: M2 completo (conceitos de memória ajudam a entender GC)  
**Módulo anterior**: [M4: Algorithms + DP](../M4-algorithms/README.md)  
**Próximo módulo**: [M6: Networking + DB](../M6-networking-db/README.md)

---

## O que você vai aprender

- Go basics: sintaxe, tipos, structs, interfaces, slices, maps
- Go concurrency: goroutines, channels, select, sync primitives
- CPU & Cache: hierarquia de memoria, cache lines, locality
- OS: processos, threads, scheduling, system calls
- **Resultado**: explicar diferencas Go vs Zig e desenhar pipeline CPU/OS

---

## Pré-requisitos (checklist)

Antes de começar M5, confirme:
- [ ] Entendo diferenças de gerenciamento de memoria (M2)
- [ ] Conheço estruturas de dados basicas (M3)
- [ ] Benchmark Q2 concluido

---

## Timeline Semanal

| Semana | Tema | Pergunta Central |
|--------|------|-----------------|
| 46-47 | Go Basics | Como Go difere de Zig em modelo de memoria? |
| 48-49 | Go Concurrency | Como goroutines diferem de threads? |
| 50-51 | CPU & Cache | Por que ordem de acesso a memoria importa? |
| 52-53 | OS: Processos | Como o OS decide quem executa? |
| 54 | OS: Scheduling | O que e preempcao? |

**Buffer 5** (Semana 55): Recuperacao antes do M6.

---

## Arquivos deste modulo

```
meta/
├── phase-4-overview.md              # Visao completa do phase
├── week-46-47-go-basics.md
├── week-48-49-go-concurrency.md
├── week-50-51-cpu-cache.md
├── week-52-53-os-processes.md
└── week-54-os-scheduling.md
```

---

## Benchmark de conclusao

Ao terminar M5, voce deve conseguir:
- [ ] Escrever Go idiomatico com goroutines e channels
- [ ] Explicar cache locality com exemplo simples
- [ ] Descrever processos vs threads vs goroutines

---

## Conexoes com outros modulos

- **M2 (Zig Foundations)**: Comparacao de memoria explicita vs GC
- **M3 (Data Structures)**: Base para entender caches e locality
- **M4 (Algorithms + DP)**: Complexidade aplicada a sistemas
- **M6 (Networking + DB)**: OS/CPU preparam para redes

---

## Retrieval de modulos anteriores

**Semana 46 deste modulo** (antes de comecar):
- [ ] Quiz M4 (10 min): "Explique Dijkstra. Qual a complexidade?"
- [ ] Quiz M2 (5 min): "Qual a diferenca entre GC e memoria explicita?"

---

## Como começar

```
echo "M5-go-os-cpu" > .current-topic
make start
```

Comece por `meta/phase-4-overview.md`, depois `meta/week-46-47-go-basics.md`.
