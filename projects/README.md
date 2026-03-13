# Projects

Container de todos os projetos de aprendizado Ultralearning. Cada subdiretório é um projeto independente.

## Projetos Ativos

| Projeto | Descrição | Status |
|---------|-----------|--------|
| [M1-math-foundations](M1-math-foundations/README.md) | Fundamentos matemáticos para CS | ⬜ |
| [M2-zig-foundations](M2-zig-foundations/README.md) | Zig + comptime: memória, pointers, allocators | ⬜ |
| [M3-data-structures](M3-data-structures/README.md) | Estruturas de dados do zero | ⬜ |
| [M4-algorithms](M4-algorithms/README.md) | Algoritmos + DP | ⬜ |
| [M5-go-os-cpu](M5-go-os-cpu/README.md) | Go + OS/CPU | ⬜ |
| [M6-networking-db](M6-networking-db/README.md) | Networking + DB | ⬜ |
| [M7-compilers](M7-compilers/README.md) | Lexer, parser, interpreter | ⬜ |
| [M8-capstone](M8-capstone/README.md) | Projeto capstone final | ⬜ |

> Para criar um novo projeto: `/ul-module-create`

## Estrutura Esperada de um Projeto

Cada projeto pode ter sua própria estrutura interna. A convenção adotada nos projetos atuais:

```
nome-do-projeto/
├── README.md          # Objetivos, pré-requisitos, quick-start
├── meta/
│   ├── learning-map.md  # Timeline e métricas
│   ├── resources.md     # Recursos por semana
│   └── week-NN-tema.md  # Planos de semana
└── projects/            # Sub-projetos de prática (Opcional)
    └── [nome]/          # Cada sub-projeto tem sua própria estrutura
```

### Estrutura de Sub-projetos de Estudo

Esta estrutura aplica-se a **projetos de estudo teórico** (não de código):

```
projects/M1-math-foundations/projects/symbols-essentials/
├── README.md           # Este projeto
├── reference/         # Material de consulta (cheatsheets)
├── practice/          # Exercícios e drills
├── srs/              # Flashcards de referência
└── [outros]/         # O que precisar
```

> **Nota**: Esta estrutura é para projetos de **estudo/revisão** (como M1). Para projetos de **código** (ex: M2-zig-foundations), use a estrutura padrão de projeto de código.

**Para criar um sub-projeto**: Use `/ul-setup-scaffold` que automaticamente criará na estrutura adequada.

## Shared

A pasta `shared/` contém recursos transversais a múltiplos projetos:

| Arquivo/Pasta | Descrição |
|---------------|-----------|
| `master-learning-map.md` | Visão global do plano atual — timeline, dependências, milestones |
| `resources-master.md` | Recursos globais: comunidades, plataformas, estratégia LeetCode |
| `_template-week.md` | Template para criar arquivos de semana |
| `buffer-week.md` | Template para semanas de buffer |
| `flashcards/` | Master deck SRS + decks por projeto |
| `retrospectives/` | Retrospectivas trimestrais |
| `archived/` | Projetos e arquivos encerrados |

## Commands

```bash
/ul-module-create [nome]  # Criar novo projeto
/ul-module-switch [nome]  # Trocar projeto ativo
/ul-study-start           # Iniciar sessão no projeto atual
/ul-data-status           # Ver status geral
```
