# M6: Networking + DB

**Objetivo**: Entender redes e databases na pratica.

**Semanas**: 56-64 (9 semanas, ~45h)  
**Pré-requisitos**: M5 completo (Go + OS/CPU)  
**Módulo anterior**: [M5: Go + OS/CPU](../M5-go-os-cpu/README.md)  
**Próximo módulo**: [M7: Compilers](../M7-compilers/README.md)

---

## O que você vai aprender

### Parte unica: Networking + DB (Semanas 56-64)
- TCP/IP: como dados chegam de A a B
- HTTP: o que acontece ao acessar um site
- DB Storage: B-Trees, indices, como databases armazenam bilhoes de registros
- DB Transactions: ACID, isolamento, concorrencia em databases

**Resultado**: HTTP server do zero em Go, explicando cada camada (Benchmark Q3)

---

## Pré-requisitos (checklist)

Antes de começar M6, confirme:
- [ ] M5 concluido (Go + OS/CPU)
- [ ] Estruturas de dados basicas (M3)
- [ ] Benchmarks Q1 e Q2 concluidos

---

## Timeline Semanal

| Semana | Tema | Pergunta Central |
|--------|------|-----------------|
| 56-57 | TCP/IP | Como dados chegam de um computador a outro? |
| 58-59 | HTTP | O que acontece quando você acessa um site? |
| 60-61 | DB: Storage | Como databases armazenam bilhoes de registros? |
| 62-63 | DB: Transactions | Como garantir consistencia? O que e ACID? |
| 64 | Integracao | Conectar HTTP + storage simples |

**Buffer 6** (Semana 65): Recuperacao antes do M7.

---

## Arquivos deste módulo

```
meta/
├── phase-5-overview.md              # Visão completa do phase
├── week-56-57-tcp-ip.md
├── week-58-59-http.md
├── week-60-61-db-storage.md
├── week-62-63-db-transactions.md
└── week-64-integration.md
```

---

## Benchmark de conclusão (Q3)

**Benchmark Q3** (Semana 65): HTTP server do zero em Go, explicando cada camada.

Ao terminar M6, você deve conseguir:
- [ ] Descrever o que acontece entre `curl http://example.com` e receber a resposta
- [ ] Explicar como B-Trees funcionam em databases
- [ ] Descrever o TCP three-way handshake (SYN, SYN-ACK, ACK) e por que existe
- [ ] Explicar as 4 propriedades ACID e o que cada uma garante
- [ ] Descrever como um índice B-Tree acelera queries e qual o trade-off de espaço

---

## Conexões com outros módulos

- **M2 (Zig Foundations)**: Comparacao Zig (explicito) vs Go (GC)
- **M3 (Data Structures)**: B-Trees em databases — árvores de M3 aplicadas
- **M4 (Algorithms + DP)**: Dijkstra em routing TCP/IP; algoritmos de scheduling
- **M8 (Capstone)**: Projeto Database ou HTTP Framework usa muito deste módulo

---

## Retrieval de módulos anteriores

**Semana 56 deste modulo** (antes de comecar):
- [ ] Quiz M5 (10 min): "Explique goroutines vs threads"
- [ ] Quiz M2 (5 min): "O que e um Arena Allocator? Quando usar em vez de GPA?"
- [ ] Quiz M3 (5 min): "Qual a complexidade de busca numa BST? E numa AVL?"

---

## Como começar

```
echo "M6-networking-db" > .current-topic
make start
```

Comece por `meta/phase-5-overview.md`, depois `meta/week-56-57-tcp-ip.md`.
