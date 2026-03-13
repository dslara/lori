# M8: Capstone Project

**Objetivo**: Integrar todos os conhecimentos dos 22 meses em um projeto real de software.

**Semanas**: 71-84 (14 semanas, ~70h)  
**Pré-requisitos**: Todos os módulos anteriores (M1-M7)  
**Módulo anterior**: [M7: Compilers](../M7-compilers/README.md)

---

## O que você vai construir

Escolha **1 de 4 projetos**:

| Projeto | Descrição | Módulos mais relevantes |
|---------|-----------|------------------------|
| **Database** | Storage engine + queries simples (sem transactions complexas) | M3, M6 |
| **Distributed KV Store** | Key-value store com replicação básica (sem Raft completo) | M4, M6 |
| **Language** | Interpreter completo com mais features (extensão de M7) | M7, M2 |
| **HTTP Framework** | Router + middleware + handler pipeline (sem template engine) | M6 |

---

## Pré-requisitos (checklist)

Antes de começar M8, confirme:
- [ ] M7 concluído: interpreter funcional com `let`, `if`, `fn`
- [ ] Benchmark Q3 concluído: HTTP server do zero explicado
- [ ] Projetos M1-M7 revisados — identifique quais conectam com seu capstone
- [ ] Escolha de projeto feita (ver opções acima)

---

## Timeline (14 semanas)

| Semanas | Foco |
|---------|------|
| 71-72 | Escolha do projeto, design de arquitetura, PRD inicial |
| 73-74 | Implementação: fundações (tipos de dados, estrutura core) |
| 75-76 | Implementação: funcionalidades principais |
| 77-78 | Implementação: integração e edge cases |
| 79-80 | Testes, benchmark e profiling |
| 81-82 | Documentação de arquitetura e refatoração |
| 83-84 | Demo final + retrospectiva completa |

**Buffers finais** (Semanas 85-88): Reserva para finalizacao.

---

## Arquivos deste módulo

```
meta/
└── week-71-84-capstone.md           # Guia completo das 14 semanas
```

---

## Benchmark de conclusão (Q4)

**Benchmark Q4** (Semana 84): Projeto completo + documentação de arquitetura.

Ao terminar M8, você deve conseguir:
- [ ] Apresentar o projeto funcionando com demo ao vivo
- [ ] Explicar decisões de arquitetura e trade-offs feitos
- [ ] Responder perguntas técnicas sobre qualquer parte do sistema
- [ ] Documentação de arquitetura legível por outro engenheiro

---

## Conexões com todos os módulos

- **M1 (Math)**: Análise de complexidade do sistema
- **M2 (Zig)**: Implementação em Zig (se projeto escolhido usar Zig)
- **M3 (Data Structures)**: Escolha de estruturas para o domínio do projeto
- **M4 (Algorithms)**: Algoritmos usados no core do sistema
- **M5 (Go + OS/CPU)**: Abstrações de sistemas e performance
- **M6 (Networking + DB)**: Database, KV Store ou HTTP Framework usam este módulo extensamente
- **M7 (Compilers)**: Language project é extensão direta

---

## Retrieval de módulos anteriores

**Semana 71 deste modulo** (antes de comecar):
- [ ] Quiz M7 (10 min): "Explique o pipeline lexer → parser → interpreter. Como o AST é percorrido?"
- [ ] Quiz M6 (5 min): "Como HTTP/1.1 funciona? O que é keep-alive?"
- [ ] Quiz M3 (5 min): "Como funciona uma B-Tree? Por que databases usam B-Trees e não BSTs?"
- [ ] Mini-retrieval M2 (3 min): "Qual allocator usar para um servidor HTTP? Por quê?"

---

## Como começar

```
echo "M8-capstone" > .current-topic
/ul-study-start
```

Comece escolhendo seu projeto em `meta/week-71-84-capstone.md`. A decisao de projeto e a primeira entrega (Semana 71).
