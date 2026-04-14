# 🗺️ Learning Map: CS Fundamentals (~22 meses)

> **O que é este documento?** Este é o plano de estudo detalhado para dominar fundamentos profundos de Ciência da Computação em ~22 meses. Inclui timeline, phases de aprendizado, projetos, metas e métricas de progresso.

### 📌 Índice Rápido
- [Meta](#meta) - Objetivo e prazo
- [Timeline Visual](#timeline-visual) - Visão geral de 88 semanas
- [Sistema de Sustentabilidade](#sistema-de-sustentabilidade) - Buffers e mini-projetos
- [Visão Geral das Phases](#visão-geral-das-phases) - 6 phases + benchmarks
- [Critérios de Sucesso](#critérios-de-sucesso) - O que você será capaz de fazer
- [Tracking](#tracking) - Progresso, checkpoints e métricas
- [Estrutura de Arquivos](#estrutura-de-arquivos) - Onde encontrar cada semana

---

## Meta
- **Objetivo**: Dominar fundamentos profundos de CS
- **Prazo**: ~22 meses (88 semanas)
- **Disponibilidade**: 1h/dia, 5 dias/semana (~440h total)
- **Abordagem**: Math → ZIG (F1-F4) → GO → Systems → Capstone
- **Filosofia**: Sustentabilidade > velocidade

---

## 📅 Timeline Visual

| Phase | Semanas | Duração | Horas | Descrição |
|------|---------|---------|-------|-----------|
| **F0: Math Foundations** | 1-5 | 5w | 25h | Notação, Conjuntos, Log/Exp, Indução, Combinatória |
| **Buffer 1** | 6 | 1w | 5h | Recuperação e revisão |
| **Zig Setup** | 7 | 1w | 5h | Instalar Zig, Ziglings 30+, Cheat Sheet |
| **F1: Zig Foundations** | 8-13 | 6w | 30h | Memória, Ponteiros, Error Handling, Allocators |
| **Mini-Projeto 1** | 14 | 1w | 5h | Arena Allocator em Zig |
| **Buffer 2** | 15 | 1w | 5h | Recuperação e revisão |
| **F2: Data Structures** | 16-27 | 12w | 60h | Arrays, Linked Lists, Stacks, Queues, Hash Tables, Trees, Heaps |
| **Mini-Projeto 2** | 28 | 1w | 5h | Config Parser com comptime |
| **Buffer 3** | 29 | 1w | 5h | Recuperação e revisão |
| **F3: Algorithms** | 30-41 | 12w | 60h | Sorting, Binary Search, Recursão, Grafos, Análise |
| **Mini-Projeto 3** | 42 | 1w | 5h | Benchmark Generator |
| **Buffer 4** | 43 | 1w | 5h | Recuperação e revisão |
| **F4: Advanced Zig + DP** | 44-47 | 4w | 20h | Comptime patterns, Dynamic Programming |
| **Buffer 5** | 48 | 1w | 5h | Recuperação e revisão |
| **F5A: Go Foundations** | 49-52 | 4w | 20h | Go Basics, Concurrency (Goroutines, Channels) |
| **F5B: Systems** | 53-66 | 14w | 70h | CPU, Cache, OS, Concorrência, TCP/IP, HTTP, DB |
| **Buffer 6** | 67 | 1w | 5h | Recuperação e revisão |
| **F6: Compilers + Capstone** | 68-85 | 18w | 90h | Lexer, Parser, Interpreter, Projeto Final |
| **Buffers finais** | 86-87 | 2w | 10h | Reserva final |
| **Reserve** | 88 | 1w | 5h | Slack final |
| **TOTAL** | 1-88 | 88w | 440h | ~22 meses |

---

## 🛡️ Sistema de Sustentabilidade

### Buffer Weeks (8 semanas distribuídas)
Use para:
- ✅ Recuperar atrasos
- ✅ Revisão profunda (spaced repetition)
- ✅ Descanso mental
- ✅ Imprevistos da vida

### Mini-Projetos (4 total)
Projetos de integração entre phases para aplicar conhecimento:
1. **Arena Allocator** (Semana 14, após F1) - Aplica allocators e gestão de memória em Zig
2. **Config Parser** (Semana 28, após F2) - Usa comptime + DS em Zig
3. **Benchmark Generator** (Semana 42, após F3) - Mede e compara algoritmos em Zig
4. **Capstone Project** (Semanas 68-85, F6) - Integração completa: Database, KV Store, Language ou HTTP Framework

### 🔄 Ritual de Retomada (após pausas)
```
Dia 1: Apenas revisar SRS cards (30 min)
Dia 2: Reler resumo da última semana (30 min)
Dia 3: Refazer 1 exercício da última semana (1h)
Dia 4: Retomar normalmente
```

---

## 🎯 Visão Geral das Phases

### PHASE 0: Math Foundations (Semanas 1-5)
**Pergunta central**: Que matemática preciso para entender algoritmos?

| Semana | Tema | Pergunta Guia |
|--------|------|---------------|
| 1 | Notação & Lógica | Como ler e escrever afirmações matemáticas? |
| 2 | Conjuntos & Funções | O que define uma função? |
| 3 | Logaritmos & Exponenciais | Por que log aparece em complexidade? |
| 4 | Somatórios & Indução | Como provar que algo funciona para N? |
| 5 | Combinatória & Probabilidade | Como contar possibilidades? Como analisar caso médio? |

**Benchmark**: Ler análise de algoritmo e entender cada termo

---

### Zig Setup (Semana 7)
**Pergunta central**: Tenho tudo que preciso para começar Zig?

| Entrega | Critério |
|---------|---------|
| Zig instalado | `zig version` retorna 0.13+ ou 0.14+ |
| Ziglings 30+ | Exercícios concluídos |
| Cheat Sheet criado | Sintaxe mínima, slices, error handling, comptime básico |
| Recursos validados | Links Tier 1 acessíveis |

---

### PHASE 1: Zig Foundations (Semanas 8-13)
**Pergunta central**: Como Zig gerencia memória de forma explícita e transparente?

| Semana | Tema | Pergunta Guia |
|--------|------|---------------|
| 8 | Zig basics + memória | Como stack e heap funcionam em Zig? |
| 9 | Ponteiros + Optionals | Qual a diferença entre `*T`, `?T` e `?*T`? |
| 10 | Error handling + comptime intro | Como `try`/`catch`/`errdefer` funcionam? |
| 11 | Structs/Enums/Unions + testes | Como definir tipos customizados com testes? |
| 12 | Memory deep dive | Por que alignment e padding importam? |
| 13 | Allocators + ArrayList | Como allocators funcionam? Arena vs GPA? |

**Benchmark**: Explicar modelo de memória de Zig sem consulta; MyArrayList(T) funcional

**Mini-Projeto 1** (Semana 14): Arena Allocator com instrumentação

---

### PHASE 2: Data Structures (Semanas 16-27)
**Pergunta central**: Como escolher a estrutura certa para cada problema?

| Semana | Tema | Pergunta Guia |
|--------|------|---------------|
| 16-17 | Arrays & Vec | Como ArrayList cresce dinamicamente em Zig? |
| 18-19 | Linked Lists | Como gerenciar nós com allocators explícitos? |
| 20-21 | Stacks & Queues | Quais problemas resolvem naturalmente? |
| 22-23 | Hash Tables | Como colisões são resolvidas? Open addressing em Zig? |
| 24-25 | Trees & BST/AVL | Por que O(log n) não é garantido? Como AVL rebalanceia? |
| 26-27 | Heaps & Union-Find | Como representar árvore em array? Quando usar Union-Find? |

**Benchmark Q1**: Implementar 5 estruturas do zero em 90 minutos

**Mini-Projeto 2** (Semana 28): Config Parser (key=value) com comptime

---

### PHASE 3: Algorithms (Semanas 30-41)
**Pergunta central**: Como analisar e comparar algoritmos?

| Semana | Tema | Pergunta Guia | LeetCode Meta |
|--------|------|---------------|---------------|
| 30-31 | Sorting Básico | Por que O(n²) é aceitável às vezes? | 3 Easy (Python) |
| 32-33 | Sorting Avançado | Qual o trade-off de cada algoritmo? | 3 Easy/Med (Python) |
| 34-35 | Binary Search & Greedy | Quando usar binary search? Quando greedy funciona? | 6 Med (Python) |
| 36-37 | Recursão | Como a call stack funciona? | 4 Medium (Python) |
| 38-39 | Grafos: Representação | Matriz vs Lista: quando usar cada? | 3 Medium (Python) |
| 40-41 | Grafos: Algoritmos | Como Dijkstra garante caminho mínimo? | 5 Med/Hard (Python) |

**Estratégia LeetCode**: Resolver em Python → reimplementar em Zig localmente

**Meta de Prática**: ~25 problemas durante a phase (3-4/semana)

**Benchmark Q2**: Resolver 10 problemas (7/10 para passar)

**Mini-Projeto 3** (Semana 42): Benchmark Generator (medir e comparar 3+ sorting)

---

### PHASE 4: Advanced Zig + DP (Semanas 44-47)
**Pergunta central**: Como usar comptime para abstrair e gerar código em compile-time?

| Semana | Tema | Pergunta Guia | LeetCode Meta |
|--------|------|---------------|---------------|
| 44 | Comptime patterns | Como type functions funcionam? | - |
| 45 | Comptime codegen | Como gerar código em compile-time? | - |
| 46 | DP: memoização | Como identificar subproblemas sobrepostos? | 3 Medium |
| 47 | DP: tabulação | Quando bottom-up é melhor que top-down? | 4 Medium |

---

### PHASE 5A: Go Foundations (Semanas 49-52)
**Pergunta central**: Como Go difere de Zig em modelo de memória e concorrência?

| Semana | Tema | Pergunta Guia |
|--------|------|---------------|
| 49-50 | Go Basics | Sintaxe, tipos, structs, interfaces |
| 51-52 | Go Concurrency | Goroutines, channels, select |

**Benchmark**: Explicar diferenças Zig vs Go em memória/concorrência

---

### PHASE 5B: Systems (Semanas 53-66)
**Pergunta central**: Como computadores realmente executam código?

| Semana | Tema | Pergunta Guia | LeetCode Meta |
|--------|------|---------------|---------------|
| 53-54 | CPU & Cache | Por que ordem de acesso importa? | 2 Medium |
| 55-56 | OS: Processos | Como OS decide quem executa? | 2 Medium |
| 57-58 | Concorrência Avançada | Como evitar race conditions? | 3 Medium |
| 59-60 | TCP/IP | Como dados chegam de um computador a outro? | - |
| 61-62 | HTTP | O que acontece quando você acessa um site? | - |
| 63-64 | DB: Storage | Como databases armazenam bilhões de registros? | - |
| 65-66 | DB: Transactions | Como garantir consistência? | - |

**Benchmark Q3**: HTTP server do zero, explicando cada camada

---

### PHASE 6: Compilers + Capstone (Semanas 68-85)
**Pergunta central**: Como linguagens de programação funcionam?

| Semana | Tema | Pergunta Guia |
|--------|------|---------------|
| 68-69 | Lexer & Parser | Como texto vira estrutura? |
| 70-71 | Interpreter | Como código é executado? |
| 72-85 | Capstone | Como integrar tudo em um sistema real? |

**Capstone: Escopo Realista** (14 semanas = 70h)

| Projeto | Escopo Ajustado |
|---------|-----------------|
| **Database** | Storage engine + queries simples (SEM transactions complexas) |
| **Distributed KV** | Replicação básica (SEM Raft completo) |
| **Language** | Interpreter apenas (SEM bytecode/VM) |
| **HTTP Framework** | Router + middleware (SEM template engine) |

**Benchmark Q4**: Projeto completo + documentação de arquitetura

---

## 📊 Critérios de Sucesso (~22 meses)

Ao final, você será capaz de:

### Matemática
- [ ] Ler e entender análise de complexidade
- [ ] Provar corretude com indução
- [ ] Calcular probabilidades e combinações
- [ ] Entender análise de caso médio

### Memória
- [ ] Olhar código e dizer onde cada variável vive
- [ ] Explicar allocators e gestão explícita de memória em Zig
- [ ] Escolher allocator correto para cada situação (arena vs GPA vs pool)

### Estruturas de Dados
- [ ] Implementar qualquer DS clássica do zero em Zig
- [ ] Justificar escolha de estrutura para um problema
- [ ] Analisar trade-offs de tempo vs espaço

### Algoritmos
- [ ] Analisar complexidade de qualquer código
- [ ] Resolver problemas medium/hard com estratégia
- [ ] Explicar funcionamento de algoritmos clássicos
- [ ] Implementar binary search e variações sem bugs
- [ ] Identificar quando usar greedy vs DP
- [ ] **~100 problemas LeetCode resolvidos** (Python + reimplementação em Zig)

### Sistemas
- [ ] Explicar como CPU executa código
- [ ] Descrever camadas de rede TCP/IP
- [ ] Entender internals de databases

### Linguagens
- [ ] Escrever Zig idiomático (F1-F4)
- [ ] Escrever Go idiomático (F5+)
- [ ] Criar sistemas concorrentes seguros
- [ ] Explicar como código fonte vira execução

### 📌 Tópicos para Estudo Futuro (Fora do escopo)
Estes tópicos são importantes mas ficam para após o curso de 22 meses:

| Tópico | Por quê esperar | Quando estudar |
|--------|-----------------|-----------------|
| **Zig inline assembly** | Além do escopo de fundamentos | Projetos de baixo nível |
| **Zig async** (ainda em desenvolvimento) | API instável | Após estabilizar |
| **Rust** (se quiser) | Optionally post-course | Projetos que precisam de safety garantido |
| **Kubernetes/Docker** | Orquestração de containers | Carreira em DevOps |
| **Cloud providers** (AWS/GCP/Azure) | Requer infra foundations | Trabalhos enterprise |

---

## 📈 Tracking

### Progresso por Phase
**Parte 1: Fundamentos (Sem 1-15)**
- [ ] PHASE 0 - Math Foundations (Sem 1-5)
- [ ] Buffer 1 (Sem 6)
- [ ] Zig Setup (Sem 7)
- [ ] PHASE 1 - Zig Foundations (Sem 8-13)
- [ ] Mini-Projeto 1 - Arena Allocator (Sem 14)
- [ ] Buffer 2 (Sem 15)

**Parte 2: Estruturas e Algoritmos (Sem 16-43)**
- [ ] PHASE 2 - Data Structures (Sem 16-27)
- [ ] Mini-Projeto 2 - Config Parser (Sem 28)
- [ ] Buffer 3 (Sem 29)
- [ ] PHASE 3 - Algorithms (Sem 30-41)
- [ ] Mini-Projeto 3 - Benchmark Generator (Sem 42)
- [ ] Buffer 4 (Sem 43)

**Parte 3: Zig Avançado + Linguagens (Sem 44-67)**
- [ ] PHASE 4 - Advanced Zig + DP (Sem 44-47)
- [ ] Buffer 5 (Sem 48)
- [ ] PHASE 5A - Go Foundations (Sem 49-52)
- [ ] PHASE 5B - Systems (Sem 53-66)
- [ ] Buffer 6 (Sem 67)

**Parte 4: Capstone (Sem 68-88)**
- [ ] PHASE 6 - Compilers + Capstone (Sem 68-85)
- [ ] Buffers finais (Sem 86-87)
- [ ] Reserve (Sem 88)

### Benchmarks Trimestrais
- [ ] Q1: Data Structures (Sem 27)
- [ ] Q2: Algorithms (Sem 41)
- [ ] Q3: Systems (Sem 66)
- [ ] Q4: Capstone (Sem 85)

### Checkpoints Mensais

| Mês | Checkpoint | Status |
|-----|-----------|--------|
| 1 | Math foundations completo | [ ] |
| 2 | Zig Setup + F1 iniciado | [ ] |
| 3 | Zig Foundations sólidas (ponteiros, allocators) | [ ] |
| 4-5 | Primeiras DS (ArrayList, LinkedList) em Zig | [ ] |
| 6-7 | Todas DS + Mini-projeto 1 completado | [ ] |
| 8-9 | Sorting e análise de complexidade dominados | [ ] |
| 10-11 | Grafos, DP e Mini-projeto 3 completado | [ ] |
| 12 | Go basics e goroutines funcionando | [ ] |
| 13-15 | Systems fundamentals (CPU, OS, Concorrência) | [ ] |
| 16-17 | HTTP server do zero funcional | [ ] |
| 18-19 | Lexer + Parser + Interpreter básico | [ ] |
| 20-22 | Capstone finalizado e documentado | [ ] |

### Métricas Principais

| Métrica | Meta | Atual | % Completado |
|---------|------|-------|--------------|
| Horas estudadas | 440h | 0h | 0% |
| Semanas completadas | 88 | 0 | 0% |
| Mini-projetos (1-3) | 3 | 0 | 0% |
| Capstone (projeto 4) | 1 | 0 | 0% |
| Problemas LeetCode (Python) | 100 | 0 | 0% |
| Reimplementações Zig | 50+ | 0 | 0% |
| Dias de streak (meta) | 440 dias | 0 | 0% |

### 📊 Métricas de Saúde do Projeto

| Métrica | Verde ✅ | Amarelo ⚠️ | Vermelho 🔴 |
|---------|----------|------------|-------------|
| Dias/semana | 4-5 | 3 | < 3 |
| SRS cards revisados | Diário | 3x/semana | < 3x/semana |
| Atraso acumulado | 0 semanas | 1-2 semanas | > 2 semanas |
| Confiança média | ≥ 4/5 | 3/5 | < 3/5 |

**Sinais de alerta**:
- 🔴 < 3 dias/semana por 2+ semanas → Use buffer, reavalie carga
- 🔴 SRS abandonado → Priorize revisão sobre conteúdo novo
- 🔴 Atraso > 2 semanas → Ajuste timeline ou escopo

---

## 🗂️ Estrutura de Arquivos

**Convenção**: `week-XX-YY-topic.md` = Semanas XX-YY do timeline

### Phase 0: Math Foundations (Semanas 1-5)
- `week-01-notation-logic.md`
- `week-02-sets-functions.md`
- `week-03-log-exp.md`
- `week-04-summation-induction.md`
- `week-05-combinatorics-graphs.md`

### Buffer 1 (Semana 6)
- `buffer-week.md`

### Zig Setup (Semana 7)
- `week-07-zig-setup.md`

### Phase 1: Zig Foundations (Semanas 8-13)
- `week-08-zig-basics-memory.md`
- `week-09-pointers-optionals.md`
- `week-10-error-handling-comptime.md`
- `week-11-structs-enums-tests.md`
- `week-12-memory-deep-dive.md`
- `week-13-allocators-arraylist.md`

### Mini-Projeto 1 (Semana 14)
- `mini-project-1-arena-allocator.md`

### Buffer 2 (Semana 15)
- `buffer-week.md`

### Phase 2: Data Structures (Semanas 16-27)
- `week-16-17-arrays-arraylist.md`
- `week-18-19-linked-lists.md`
- `week-20-21-stacks-queues.md`
- `week-22-23-hash-tables.md`
- `week-24-25-trees-bst-avl.md`
- `week-26-27-heaps-union-find.md`

### Mini-Projeto 2 (Semana 28)
- `mini-project-2-config-parser.md`

### Buffer 3 (Semana 29)
- `buffer-week.md`

### Phase 3: Algorithms (Semanas 30-41)
- `week-30-31-sorting-basic.md`
- `week-32-33-sorting-advanced.md`
- `week-34-35-binary-search-greedy.md`
- `week-36-37-recursion.md`
- `week-38-39-graphs-repr.md`
- `week-40-41-graphs-algo.md`

### Mini-Projeto 3 (Semana 42)
- `mini-project-3-benchmark-generator.md`

### Buffer 4 (Semana 43)
- `buffer-week.md`

### Phase 4: Advanced Zig + DP (Semanas 44-47)
- `week-44-45-comptime-patterns.md`
- `week-46-47-dynamic-programming.md`

### Buffer 5 (Semana 48)
- `buffer-week.md`

### Phase 5A: Go Foundations (Semanas 49-52)
- `week-49-50-go-basics.md`
- `week-51-52-go-concurrency.md`

### Phase 5B: Systems (Semanas 53-66)
- `week-53-54-cpu-cache.md`
- `week-55-56-os-processes.md`
- `week-57-58-concurrency-adv.md`
- `week-59-60-tcp-ip.md`
- `week-61-62-http.md`
- `week-63-64-db-storage.md`
- `week-65-66-db-transactions.md`

### Buffer 6 (Semana 67)
- `buffer-week.md`

### Phase 6: Compilers + Capstone (Semanas 68-85)
- `week-68-69-lexer-parser.md`
- `week-70-71-interpreter.md`
- `week-72-85-capstone.md`

### Buffers Finais (Semanas 86-88)
- `buffer-week.md`

### Arquivos de Suporte
- `learning-map.md` - Este arquivo (mapa principal)
- `resources.md` - Recursos organizados por phase
- `_template-week.md` - Template para criar semanas (em [`.opencode/templates/`](../../.opencode/templates/))

---

## 🔁 Ritual Semanal de Revisão

**Toda 2ª sexta-feira** (semanas pares): dedique a sessão inteira para revisão profunda.

### Rotina de Revisão (60 min total)
1. **SRS Review** (20 min) - Revisar todos os cards pendentes
2. **Conceitos** (15 min) - Reler resumos das últimas 2 semanas
3. **Explicação** (15 min) - Explicar conceitos SEM consulta (verbalmente ou escrito)
4. **Métricas** (10 min) - Atualizar saúde do projeto e identificar sinais de alerta

⚠️ **Regra importante**: Não avance conteúdo novo neste dia!

---

## 📝 Última Atualização

- **Data**: 2026-03-02
- **Versão**: 3.0 (Migração Rust → Zig aplicada)
- **Mudanças**: Plano v2.1 aplicado — F1-F4 migrados para Zig, semana 7 de Setup adicionada, LeetCode strategy Python→Zig, heaps confirmadas, timeline 88w mantida
