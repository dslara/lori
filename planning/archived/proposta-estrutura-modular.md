# Proposta de Estrutura Modular (Decisão) - v2.0

## Decisão
- Proposta escolhida: 8 módulos independentes (por phase)
- Objetivos principais: facilitar retomada após pausas, organização mais clara
- Status: **Aprovado COM AJUSTES** (versão refinada após análise ultralearning)
- Data da decisão: 2026-02-07
- Última atualização: 2026-02-07

---

## Módulos Propostos

| Módulo | Nome | Semanas | Duração | Phases de origem | Dependências |
| --- | --- | --- | --- | --- | --- |
| M1 | math-foundations | 1-5 | 5s | Phase 0 | nenhum |
| M2 | rust-foundations | 7-14 | 8s | Phase 1 | M1 (básico) |
| M3 | data-structures | 17-28 | 12s | Phase 2 | M2 |
| M4 | algorithms | 31-42 | 12s | Phase 3 | M2 + M3 |
| M5 | advanced-rust | 45-48 | 4s | Phase 4 | M2 |
| M6 | go-systems | 50-67 | 18s | Phase 5A + 5B | M2 |
| M7 | compilers | 69-72 | 4s | Phase 6 (part) | M2 (+ M3 recomendado) |
| M8 | capstone-project | 73-86 | 14s | Phase 6 (part) | M1-M7 |

---

## Detalhes dos Módulos

### M1: math-foundations (5 semanas)
**Objetivo**: Dominar notação matemática e fundamentos para análise de algoritmos

**Conteúdo**:
- Semana 1: Notação & Lógica
- Semana 2: Conjuntos & Funções
- Semana 3: Logaritmos & Exponenciais
- Semana 4: Somatórios & Indução
- Semana 5: Combinatória & Probabilidade

**Entregas**:
- Compreensão de Big O notation
- Provas por indução
- Análise de complexidade de algoritmos

**Pré-requisitos**: Nenhum

**Independência**: ✅ Totalmente independente (pode ser estudado isoladamente)

**Conexões com outros módulos**:
- M2-M4: Base matemática para análise de complexidade
- M4: Combinatória para análise de algoritmos

---

### M2: rust-foundations (8 semanas)
**Objetivo**: Dominar ownership, borrowing e memory management em Rust

**Conteúdo**:
- Semanas 7-8: Ownership & Borrowing
- Semanas 9-10: Lifetimes
- Semanas 11-12: Stack vs Heap & Error Handling
- Semanas 13-14: Smart Pointers & Vec

**Entregas**:
- Mini-projeto: Memory Allocator (Semana 15)
- Explicar modelo de memória Rust sem consulta

**Pré-requisitos**: 
- M1 (básico) - Entender análise de complexidade
- Familiaridade com conceitos de programação

**Independência**: ⚠️ Requer conceitos básicos de M1

**Buffers**: Buffer 1 (Semana 6), Buffer 2 (Semana 16)

**Conexões com outros módulos**:
- M3-M7: Linguagem de implementação
- M6: Comparação com Go (garbage collector vs ownership)

---

### M3: data-structures (12 semanas)
**Objetivo**: Implementar e compreender estruturas de dados clássicas

**Conteúdo**:
- Semanas 17-18: Arrays & Vec
- Semanas 19-20: Linked Lists
- Semanas 21-22: Stacks & Queues
- Semanas 23-24: Hash Tables
- Semanas 25-26: Trees & BST
- Semanas 27-28: Heaps & Union-Find

**Entregas**:
- Implementação de 5 estruturas do zero (Benchmark Q1)
- Mini-projeto: CLI Tool (Semana 29)

**Pré-requisitos**: 
- M2 completo - Ownership necessário para implementação

**Independência**: ⚠️ Requer M2

**Buffers**: Buffer 3 (Semana 30)

**Conexões com outros módulos**:
- M1: Análise de complexidade de operações
- M4: Base para algoritmos sobre estruturas
- M7: AST é uma árvore (Trees & BST)

---

### M4: algorithms (12 semanas)
**Objetivo**: Dominar algoritmos clássicos e análise de complexidade

**Conteúdo**:
- Semanas 31-32: Sorting Básico
- Semanas 33-34: Sorting Avançado
- Semanas 35-36: Binary Search & Greedy
- Semanas 37-38: Recursão
- Semanas 39-40: Grafos - Representação
- Semanas 41-42: Grafos - Algoritmos

**Entregas**:
- Resolver 10 problemas LeetCode (Benchmark Q2)
- Mini-projeto: Sorting Visualizer (Semana 43)
- ~25 problemas LeetCode durante o módulo

**Pré-requisitos**: 
- M2 - Implementação em Rust
- M3 - Estruturas de dados para algoritmos

**Independência**: ⚠️ Requer M2 + M3

**Buffers**: Buffer 4 (Semana 44)

**Conexões com outros módulos**:
- M1: Provas de corretude e análise matemática
- M3: Usa estruturas de dados (heaps, grafos, etc)
- M7: Parsing usa recursão

---

### M5: advanced-rust (4 semanas)
**Objetivo**: Dominar traits, generics e dynamic programming

**Conteúdo**:
- Semanas 45-46: Traits & Generics
- Semanas 47-48: Dynamic Programming

**Entregas**:
- Código com abstrações avançadas
- ~15 problemas LeetCode de DP

**Pré-requisitos**: 
- M2 completo - Fundamentos de Rust

**Independência**: ⚠️ Requer M2 (pode ser feito antes de M3/M4)

**Buffers**: Buffer 5 (Semana 49)

**Conexões com outros módulos**:
- M2: Evolução natural dos conceitos de Rust
- M4: DP é uma técnica algorítmica avançada

---

### M6: go-systems (18 semanas)
**Objetivo**: Aprender Go e entender sistemas computacionais

**Conteúdo**:
- **Parte 1: Go** (Semanas 50-53)
  - Semanas 50-51: Go Basics
  - Semanas 52-53: Go Concurrency
  
- **Parte 2: Systems** (Semanas 54-67)
  - Semanas 54-55: CPU & Cache
  - Semanas 56-57: OS - Processos
  - Semanas 58-59: Concorrência Avançada
  - Semanas 60-61: TCP/IP
  - Semanas 62-63: HTTP
  - Semanas 64-65: DB Storage
  - Semanas 66-67: DB Transactions

**Entregas**:
- Benchmark Q3: HTTP server do zero
- Explicar Rust vs Go em memória/concorrência

**Pré-requisitos**: 
- M2 - Conceitos de memória e ownership ajudam a entender diferenças

**Independência**: ⚠️ Requer M2 (conceitual), independente de M3/M4/M5

**Buffers**: Buffer 6 (Semana 68)

**Nota**: Módulo mais longo (18 semanas) mas coeso tematicamente

**Conexões com outros módulos**:
- M2: Comparação Rust vs Go (ownership vs GC)
- M3: B-Trees em databases
- M4: Algoritmos de routing (Dijkstra) em TCP/IP

---

### M7: compilers (4 semanas)
**Objetivo**: Entender como linguagens de programação funcionam

**Conteúdo**:
- Semanas 69-70: Lexer & Parser
- Semanas 71-72: Interpreter

**Entregas**:
- Lexer funcional tokenizando código
- Parser gerando AST
- Interpreter executando código simples
- Linguagem com let, if, fn funcionando

**Pré-requisitos**: 
- M2 - Implementação em Rust
- M3 (recomendado) - AST é uma árvore

**Independência**: ⚠️ Requer M2, recomenda M3

**Conexões com outros módulos**:
- M2: Implementação em Rust (enums, pattern matching)
- M3: AST é uma árvore (Trees & BST)
- M4: Parsing usa recursão (Recursive Descent)

---

### M8: capstone-project (14 semanas)
**Objetivo**: Integrar todos os conhecimentos em um projeto real

**Conteúdo**:
- Semanas 73-86: Capstone Project (escolha 1 de 4 opções)

**Opções de Projeto**:
1. **Database**: Storage engine + queries simples
2. **Distributed KV Store**: Replicação básica
3. **Language**: Interpreter completo
4. **HTTP Framework**: Router + middleware

**Entregas**:
- Projeto completo funcional
- Documentação de arquitetura
- Benchmark Q4: Demo + explicação

**Pré-requisitos**: 
- Todos os módulos anteriores (M1-M7)

**Independência**: ❌ Requer conhecimento de todos os módulos

**Buffers**: Buffers 7-8 (Semanas 87-88)

**Conexões com outros módulos**:
- Integra TODOS os módulos anteriores

---

## 🎯 Ajustes Críticos para Ultralearning

### ✅ Ajustes Obrigatórios Implementados

#### 1. **SRS Unificado** (Drill + Retention)
**Problema original**: 8 arquivos `flashcards.csv` separados quebravam spaced repetition.

**Solução implementada**:
```
shared/
└── flashcards/
    ├── master-deck.csv              # ✅ Deck unificado para SRS diário
    ├── by-module/                   # Backup/fonte por módulo
    │   ├── M1-math.csv
    │   ├── M2-rust.csv
    │   ├── M3-data-structures.csv
    │   ├── M4-algorithms.csv
    │   ├── M5-advanced-rust.csv
    │   ├── M6-go-systems.csv
    │   ├── M7-compilers.csv
    │   └── M8-capstone.csv
    └── sync-script.sh               # Script para agregar cards ao master-deck
```

**Como funciona**:
- Cada módulo gera cards em `by-module/MX-nome.csv`
- Script agrega automaticamente ao `master-deck.csv`
- `make review` sempre usa `master-deck.csv`
- Garante revisão de todos os módulos, não só o atual

---

#### 2. **Retrieval Cross-Module** (Retrieval Practice)
**Problema original**: Sem mecanismo para testar conhecimento de módulos anteriores.

**Solução implementada**: Ritual de Retrieval Cross-Module

**Primeira semana de cada módulo novo**:
```markdown
## 🧠 Ritual de Retrieval Cross-Module

### Semana 1 de qualquer módulo:
1. **Quiz de 10 min** do módulo anterior (3-5 perguntas)
2. **Mini-retrieval** de módulos mais antigos (1 pergunta cada)

### Exemplo: Ao iniciar M7 (Compilers)
**Semana 69, Dia 1**:
- Quiz M6 (10 min): "Explique diferença entre goroutine e thread"
- Mini-retrieval M3 (2 min): "Como funciona hash table?"
- Mini-retrieval M2 (2 min): "O que é lifetime em Rust?"

### Frequência:
- Módulo anterior: Testado toda semana 1 de novo módulo
- Módulos antigos: 1-2 perguntas aleatórias por semana
```

**Integração no README de cada módulo**:
```markdown
## 🔄 Retrieval de Módulos Anteriores

### Semana 1 deste módulo:
- [ ] Quiz de 10 min de MX (módulo anterior)
- [ ] Mini-retrieval de módulos mais antigos
```

---

### ✅ Ajustes Recomendados Implementados

#### 3. **Conexões Cross-Module** (Intuition)
**Problema original**: Módulos isolados podem criar silos de conhecimento.

**Solução implementada**: Cada módulo tem seção "Conexões" (já incluída nos detalhes acima).

**Exemplo em README de cada módulo**:
```markdown
## 🔗 Conexões com Outros Módulos

### M7: Compilers
- **M2 (Rust)**: Implementação em Rust (enums, pattern matching)
- **M3 (DS)**: AST é uma árvore - revisite Trees & BST
- **M4 (Algo)**: Parsing usa recursão - revisite Recursive Descent
```

---

#### 4. **Retrospectivas Trimestrais** (Feedback + Metalearning)
**Problema original**: Feedback fragmentado por módulo, sem visão global.

**Solução implementada**:
```
shared/
└── retrospectives/
    ├── quarterly/
    │   ├── Q1-review.md     # Após M1-M2 (Semana 16)
    │   ├── Q2-review.md     # Após M3-M4 (Semana 44)
    │   ├── Q3-review.md     # Após M5-M6 (Semana 68)
    │   └── Q4-review.md     # Após M7-M8 (Semana 88)
    └── final-retrospective.md
```

**Template de retrospectiva trimestral**:
```markdown
# 🔄 Retrospectiva Q1 (Módulos M1-M2)

## O que funcionou?
- [3 itens]

## O que não funcionou?
- [3 itens]

## Conexões descobertas entre módulos
- [2-3 conexões]

## Ajustes para próximo trimestre
- [2-3 ajustes]

## Métricas
- Horas estudadas: X/Y
- Streak: X dias
- Módulos completados: X/Y
```

---

#### 5. **Master Learning Map Global** (Metalearning)
**Problema original**: Dividir em 8 learning-maps pode fragmentar visão do todo.

**Solução implementada**:
```
shared/
└── master-learning-map.md    # ✅ Visão global de 88 semanas
```

Cada módulo tem:
- `meta/learning-map.md` - Plano detalhado do módulo (tático)

O master global tem:
- Visão de 88 semanas
- Dependências entre módulos
- Milestones trimestrais
- Perguntas centrais de cada módulo

**Hierarquia de Metalearning**:
```
master-learning-map.md          (Estratégico - 88 semanas)
    ├── M1/meta/learning-map.md  (Tático - 5 semanas)
    ├── M2/meta/learning-map.md  (Tático - 8 semanas)
    └── ...
```

---

## Estrutura Interna de Cada Módulo (ATUALIZADA)

Cada módulo segue a estrutura padronizada:

```
{modulo}/
├── README.md                      # "Landing page" do módulo
│   ├── 🎯 O que você vai aprender
│   ├── 📋 Pré-requisitos (checklist)
│   ├── ⏱️ Tempo estimado
│   ├── 📅 Timeline semanal
│   ├── 🔗 Conexões com outros módulos    # ✅ NOVO
│   ├── 🔄 Retrieval de módulos anteriores # ✅ NOVO
│   ├── ✅ Entregas principais
│   ├── 🚀 Como começar (quick start)
│   └── ⏭️ Próximo módulo
│
├── meta/
│   ├── learning-map.md            # Mapa de aprendizado do módulo
│   ├── prerequisites.md           # Checklist detalhado de pré-requisitos
│   ├── resources.md               # Recursos tier 1/2/3 específicos
│   ├── week-XX-YY-topic.md        # Planos semanais (migrados)
│   └── retrospectives/            # Retros do módulo
│       ├── retro-semana-XX.md
│       └── final-retrospective.md
│
├── knowledge/
│   ├── concepts/                  # Explicações Feynman
│   │   ├── conceito-1.md
│   │   └── conceito-2.md
│   └── flashcards-source.csv      # ✅ RENOMEADO (fonte para master-deck)
│
├── projects/                      # Projetos práticos
│   ├── mini-project/              # Mini-projeto do módulo
│   ├── exercises/                 # Exercícios práticos
│   └── benchmarks/                # Código dos benchmarks
│
└── logs/
    ├── daily/                     # Logs diários
    │   ├── 2026-02-07.md
    │   └── ...
    └── stats.json                 # Métricas do módulo
        # { "hours": 40, "days_studied": 8, "streak": 5 }
```

### Arquivos Obrigatórios

Cada módulo **DEVE** ter:
- ✅ `README.md` - Ponto de entrada (com seção Conexões + Retrieval)
- ✅ `meta/learning-map.md` - Plano específico do módulo
- ✅ `meta/prerequisites.md` - Checklist de prontidão
- ✅ `meta/resources.md` - Recursos curados

Arquivos opcionais:
- `knowledge/concepts/` - Criado conforme estudo
- `knowledge/flashcards-source.csv` - Gerado conforme estudo, sincronizado ao master
- `projects/` - Conforme módulo requer
- `logs/` - Gerado automaticamente

---

## Estrutura de Diretórios Proposta (ATUALIZADA)

```
ultralearning/
├── README.md                          # Índice geral (atualizar)
├── .opencode/agents/                  # @meta, @tutor (globais)
├── shared/
│   ├── scripts/                       # streak.sh, SRS
│   ├── flashcards/                    # ✅ NOVO
│   │   ├── master-deck.csv            # Deck unificado SRS
│   │   ├── by-module/                 # Fontes por módulo
│   │   │   ├── M1-math.csv
│   │   │   ├── M2-rust.csv
│   │   │   └── ...
│   │   └── sync-script.sh             # Agregar cards ao master
│   ├── retrospectives/                # ✅ NOVO
│   │   ├── quarterly/
│   │   │   ├── Q1-review.md
│   │   │   ├── Q2-review.md
│   │   │   ├── Q3-review.md
│   │   │   └── Q4-review.md
│   │   └── final-retrospective.md
│   └── master-learning-map.md         # ✅ NOVO - Visão global 88 semanas
│
├── Makefile                           # Atualizar para módulos
│
├── 01-math-foundations/               # M1: Semanas 1-5
│   ├── README.md                      # Com seção Conexões
│   ├── meta/
│   │   ├── learning-map.md
│   │   ├── prerequisites.md
│   │   ├── resources.md
│   │   ├── week-01-notation-logic.md
│   │   ├── week-02-sets-functions.md
│   │   ├── week-03-log-exp.md
│   │   ├── week-04-summation-induction.md
│   │   └── week-05-combinatorics-graphs.md
│   ├── knowledge/
│   │   ├── concepts/
│   │   └── flashcards-source.csv      # Sincronizado ao master
│   ├── projects/
│   └── logs/
│
├── 02-rust-foundations/               # M2: Semanas 7-14
│   ├── README.md                      # Com Retrieval de M1
│   ├── meta/
│   │   ├── learning-map.md
│   │   ├── prerequisites.md
│   │   ├── resources.md
│   │   ├── week-07-08-ownership.md
│   │   ├── week-09-10-lifetimes.md
│   │   ├── week-11-12-memory.md
│   │   ├── week-13-14-smart-pointers.md
│   │   └── mini-project-1-allocator.md
│   ├── knowledge/
│   │   └── flashcards-source.csv
│   ├── projects/
│   │   └── memory-allocator/
│   └── logs/
│
├── 03-data-structures/                # M3: Semanas 17-28
│   ├── README.md                      # Com Retrieval de M2
│   ├── meta/
│   │   ├── learning-map.md
│   │   ├── week-17-18-arrays-vec.md
│   │   ├── week-19-20-linked-lists.md
│   │   ├── week-21-22-stacks-queues.md
│   │   ├── week-23-24-hash-tables.md
│   │   ├── week-25-26-trees-bst.md
│   │   ├── week-27-28-heaps.md
│   │   └── mini-project-2-cli.md
│   ├── knowledge/
│   │   └── flashcards-source.csv
│   ├── projects/
│   │   └── cli-tool/
│   └── logs/
│
├── 04-algorithms/                     # M4: Semanas 31-42
│   ├── README.md                      # Com Retrieval de M3 + M2
│   ├── meta/
│   │   ├── learning-map.md
│   │   ├── week-31-32-sorting-basic.md
│   │   ├── week-33-34-sorting-advanced.md
│   │   ├── week-35-36-binary-search-greedy.md
│   │   ├── week-37-38-recursion.md
│   │   ├── week-39-40-graphs-repr.md
│   │   ├── week-41-42-graphs-algo.md
│   │   └── mini-project-3-visualizer.md
│   ├── knowledge/
│   │   └── flashcards-source.csv
│   ├── projects/
│   │   └── sorting-visualizer/
│   └── logs/
│
├── 05-advanced-rust/                  # M5: Semanas 45-48
│   ├── README.md                      # Com Retrieval de M4
│   ├── meta/
│   │   ├── learning-map.md
│   │   ├── week-45-46-traits-generics.md
│   │   └── week-47-48-dynamic-programming.md
│   ├── knowledge/
│   │   └── flashcards-source.csv
│   ├── projects/
│   └── logs/
│
├── 06-go-systems/                     # M6: Semanas 50-67
│   ├── README.md                      # Com Retrieval de M5 + M2
│   ├── meta/
│   │   ├── learning-map.md
│   │   ├── part-1-go.md               # Overview semanas 50-53
│   │   ├── part-2-systems.md          # Overview semanas 54-67
│   │   ├── week-50-51-go-basics.md
│   │   ├── week-52-53-go-concurrency.md
│   │   ├── week-54-55-cpu-cache.md
│   │   ├── week-56-57-os-processes.md
│   │   ├── week-58-59-concurrency-adv.md
│   │   ├── week-60-61-tcp-ip.md
│   │   ├── week-62-63-http.md
│   │   ├── week-64-65-db-storage.md
│   │   └── week-66-67-db-transactions.md
│   ├── knowledge/
│   │   └── flashcards-source.csv
│   ├── projects/
│   │   └── http-server/
│   └── logs/
│
├── 07-compilers/                      # M7: Semanas 69-72
│   ├── README.md                      # Com Retrieval de M6 + M3 + M2
│   ├── meta/
│   │   ├── learning-map.md
│   │   ├── week-69-70-lexer-parser.md
│   │   └── week-71-72-interpreter.md
│   ├── knowledge/
│   │   └── flashcards-source.csv
│   ├── projects/
│   │   └── simple-language/
│   └── logs/
│
└── 08-capstone-project/               # M8: Semanas 73-86
    ├── README.md                      # Com Retrieval de M7 + todos
    ├── meta/
    │   ├── learning-map.md
    │   ├── project-options.md         # 4 escolhas
    │   ├── timeline.md                # 14 semanas breakdown
    │   └── week-73-86-capstone.md
    ├── knowledge/
    │   └── flashcards-source.csv
    ├── src/                           # Código do projeto escolhido
    ├── docs/                          # Documentação arquitetural
    └── logs/
```

---

## Plano de Implementação (ATUALIZADO)

### Fase 0: Protótipo (NOVA - RECOMENDADA)
**Duração**: 30-60 min

**Objetivo**: Validar estrutura com 1 módulo antes de criar os 8.

**Tarefas**:
1. Criar apenas M1 (math-foundations)
2. Criar estrutura `shared/` completa
3. Testar:
   - README com seções Conexões
   - Sincronização de flashcards
   - Learning map modular vs master

**Critério de sucesso**: 
- [ ] M1 funciona como esperado
- [ ] Master-deck.csv agrega cards de M1
- [ ] Estrutura clara e navegável

**Decisão após protótipo**:
- ✅ Funciona → Criar M2-M8
- ❌ Problemas → Ajustar antes de escalar

---

### Fase 1: Criar Estrutura Base (1-2h)

**Tarefas**:
1. Criar 8 diretórios principais
2. Criar estrutura `shared/`:
   ```bash
   mkdir -p shared/{flashcards/by-module,retrospectives/quarterly}
   touch shared/master-learning-map.md
   touch shared/flashcards/master-deck.csv
   ```

3. Para cada módulo, criar estrutura interna:
   ```bash
   for dir in 0{1..8}-*/; do
     mkdir -p "$dir"/{meta/retrospectives,knowledge/concepts,projects,logs/daily}
     touch "$dir"/meta/{learning-map.md,prerequisites.md,resources.md}
     touch "$dir"/knowledge/flashcards-source.csv
     touch "$dir"/logs/stats.json
   done
   ```

4. Gerar README.md para cada módulo com seções:
   - Conexões com outros módulos
   - Retrieval de módulos anteriores

**Entregáveis**:
- [ ] 8 diretórios criados
- [ ] Estrutura `shared/` criada
- [ ] READMEs com seções Conexões + Retrieval

---

### Fase 2: Migrar Conteúdo Existente (2-3h)

**Tarefas**:
1. Mover todos os arquivos `week-*.md`
2. Mover `mini-project-*.md` para módulos corretos
3. Mover `phase-*-overview.md` para `meta/` dos módulos
4. Mover `learning-map.md` atual para `shared/master-learning-map.md`
5. Criar learning-maps modulares (extrair seções do master)
6. Atualizar referências internas nos arquivos
7. Criar `prerequisites.md` para cada módulo

**Entregáveis**:
- [ ] Todos os arquivos migrados
- [ ] Histórico git preservado
- [ ] Master learning map criado
- [ ] Learning maps modulares criados
- [ ] Referências internas atualizadas

---

### Fase 3: Criar READMEs e Docs (1-2h)

**Tarefas**:
1. Criar README.md para cada 8 módulos (com template)
2. Preencher seção "Conexões" de cada módulo
3. Criar templates de retrospectivas trimestrais
4. Criar script `sync-flashcards.sh`

**Entregáveis**:
- [ ] 8 READMEs completos
- [ ] Templates de retro trimestral
- [ ] Script de sincronização de flashcards funcional

---

### Fase 4: Atualizar Sistema (1h)

**Tarefas**:

1. **Atualizar `Makefile`**:
   ```makefile
   # Adicionar suporte a módulos
   .PHONY: list-modules
   list-modules:
       @echo "Módulos disponíveis:"
       @ls -d [0-9][0-9]-*/ | sed 's/\///'
   
   .PHONY: module-status
   module-status:
       @echo "Status dos módulos:"
       @for dir in [0-9][0-9]-*/; do \
           echo "$$dir: $$(cat $$dir/logs/stats.json 2>/dev/null || echo 'não iniciado')"; \
       done
   
   .PHONY: sync-flashcards
   sync-flashcards:
       @bash shared/flashcards/sync-script.sh
   
   .PHONY: quarterly-review
   quarterly-review:
       @echo "Retrospectivas trimestrais disponíveis:"
       @ls -1 shared/retrospectives/quarterly/
   ```

2. **Atualizar `make review`**:
   - Usar `shared/flashcards/master-deck.csv`
   - Não usar flashcards modulares

3. **Atualizar `README.md` principal**:
   - Adicionar seção "Estrutura Modular"
   - Explicar sistema de SRS unificado
   - Explicar retrieval cross-module
   - Atualizar quick start

4. **Criar CHANGELOG.md**:
   ```markdown
   # Changelog
   
   ## [3.0.0] - 2026-02-07
   
   ### Added - Estrutura Modular
   - Dividido em 8 módulos independentes
   - SRS unificado (master-deck.csv)
   - Retrieval cross-module obrigatório
   - Retrospectivas trimestrais
   - Master learning map + learning maps modulares
   - Seção "Conexões" em cada módulo
   
   ### Changed
   - Cada módulo agora é autocontido
   - Melhor organização e navegação
   - Flashcards agregados em deck único
   
   ### Migration Guide
   - Arquivos `week-*.md` movidos para `{modulo}/meta/`
   - SRS agora usa `shared/flashcards/master-deck.csv`
   - Ver `module-structure-proposal.md` para detalhes
   ```

**Entregáveis**:
- [ ] Makefile atualizado
- [ ] README.md principal atualizado
- [ ] Scripts funcionando com módulos
- [ ] CHANGELOG.md criado

---

### Resumo do Plano (ATUALIZADO)

| Fase | Tempo Estimado | Entregáveis |
|------|----------------|-------------|
| **0. Protótipo (NOVO)** | **30-60 min** | **M1 + shared/ validados** |
| 1. Estrutura Base | 1-2h | Diretórios + shared/ + templates |
| 2. Migrar Conteúdo | 2-3h | Arquivos movidos + master learning map |
| 3. READMEs e Docs | 1-2h | 8 READMEs + templates retro + script sync |
| 4. Atualizar Sistema | 1h | Makefile + scripts + docs |
| **TOTAL** | **6-9h** | Sistema modular funcional |

---

## Próximos Passos

### Decisão Final
- [x] Revisar proposta com usuário
- [x] Aprovar estrutura de 8 módulos
- [x] Aprovar ajustes críticos ultralearning
- [x] Aprovar estrutura interna de cada módulo
- [x] Aprovar plano de implementação
- [ ] **Implementar Fase 0 (protótipo M1)** ← PRÓXIMO PASSO

### Quando Implementar
**Status**: Aprovado COM AJUSTES - Recomenda-se protótipo antes de escalar

**Abordagem recomendada**:
1. **Protótipo** (Fase 0): Validar com M1 primeiro
2. **Implementação completa** (Fases 1-4): Após validar protótipo

### Após Implementação
- [ ] Testar navegação entre módulos
- [ ] Verificar que `make review` usa master-deck.csv
- [ ] Validar retrieval cross-module funciona
- [ ] Testar sync de flashcards
- [ ] Verificar que comandos `make` funcionam
- [ ] Validar que referências não quebraram
- [ ] Documentar no README principal
- [ ] Criar issue/card para acompanhamento

---

## Justificativa (Resumo)

### Coerência com Ultralearning

| Princípio | Score | Solução |
|-----------|-------|---------|
| 1. Metalearning | ✅ 9/10 | Master learning map + learning maps modulares |
| 2. Focus | ✅ 9/10 | Módulos isolados = mais foco |
| 3. Directness | ✅ 10/10 | Projetos preservados |
| 4. Drill | ✅ 9/10 | SRS unificado resolve fragmentação |
| 5. Retrieval | ✅ 9/10 | Retrieval cross-module obrigatório |
| 6. Feedback | ✅ 9/10 | Retros modulares + trimestrais |
| 7. Retention | ✅ 9/10 | Master-deck.csv garante SRS global |
| 8. Intuition | ✅ 9/10 | Seção "Conexões" em cada módulo |
| 9. Experimentation | ✅ 9/10 | Flexibilidade mantida |
| **MÉDIA GERAL** | **✅ 9.1/10** | **Excelente** alinhamento |

### Benefícios da Proposta

- **Granularidade equilibrada**: nem muito grande, nem muito pequena
- **Retomada mais forte**: contexto máximo de pausa ~1-2 meses
- **Identidade temática clara por módulo**: cada módulo tem um objetivo único
- **Mantém os limites das phases**: respeita estrutura original, apenas reorganiza
- **Compilers separado do capstone**: permite estudar compilers sem commitment do projeto final
- **SRS unificado**: Garante revisão de todos os módulos
- **Retrieval cross-module**: Previne "completar e esquecer"
- **Conexões explícitas**: Mantém visão holística
- **Feedback em múltiplas camadas**: Modular + trimestral + global

---

## 🎯 Respostas às Perguntas Socráticas

### 1. SRS: Como garantir que cards de M1 sejam revisados em M7?
**Resposta**: `shared/flashcards/master-deck.csv` agrega todos os cards. `make review` sempre usa o master-deck.

### 2. Retrieval: Qual mecanismo para testar módulos anteriores?
**Resposta**: Ritual de Retrieval Cross-Module na Semana 1 de cada novo módulo.

### 3. Conexões: Como lembrar que AST (M7) é árvore (M3)?
**Resposta**: Seção "Conexões com outros módulos" no README de M7.

### 4. Feedback: Como consolidar aprendizados após 22 meses?
**Resposta**: Retrospectivas trimestrais (Q1-Q4) + final-retrospective.md global.

### 5. Implementação: Por que não começar com protótipo?
**Resposta**: Boa pergunta! Adicionada Fase 0 (protótipo) ao plano.

---

## Notas
- Este documento foi aprovado pelo usuário em 2026-02-07
- Versão 2.0 com ajustes críticos de ultralearning
- **Status**: Aprovado para protótipo (Fase 0)
- Última atualização: 2026-02-07
