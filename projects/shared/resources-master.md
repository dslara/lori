# Recursos: CS Fundamentals (~22 meses)

## Como Usar Este Documento

**Regra de ouro**: Use recursos para encontrar respostas, não para receber respostas.

1. Tente responder as perguntas guia PRIMEIRO
2. Consulte recursos quando travar
3. Volte ao recurso para aprofundar DEPOIS de tentar

---

## 🏗️ Estrutura de Recursos

### Tier 1 - Essenciais (use sempre)
### Tier 2 - Aprofundamento (quando dominar Tier 1)
### Tier 3 - Referência avançada (consulta pontual)

---

# 📐 FASE 0: Math Foundations

## Tier 1

| Recurso | Link | Semanas |
|---------|------|---------|
| **Discrete Mathematics (Rosen)** | Livro | 1-5 |
| **Khan Academy - Algebra** | https://www.khanacademy.org/math/algebra | 3 |
| **Khan Academy - Precalculus** | https://www.khanacademy.org/math/precalculus | 3-4 |
| **Khan Academy - Probability** | https://www.khanacademy.org/math/statistics-probability | 5 |

## Tier 2

| Recurso | Link | Quando Usar |
|---------|------|-------------|
| **Brilliant.org - Logic** | https://brilliant.org/courses/logic/ | Lógica e provas (pago) |
| **Book of Proof** | https://www.people.vcu.edu/~rhammack/BookOfProof/ | Provas e indução (grátis) |
| **MIT 6.042J** | https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/ | Aprofundamento |

## Por Semana

| Semana | Tema | Recurso Principal |
|--------|------|-------------------|
| 1 | Notação & Lógica | Rosen Cap 1 |
| 2 | Conjuntos & Funções | Rosen Cap 2 |
| 3 | Logaritmos | Khan Academy |
| 4 | Somatórios & Indução | Rosen Cap 5 |
| 5 | Combinatoria e Probabilidade | Rosen Cap 6, 7 + Khan Probability |

---

# FASE 1: Zig Foundations + Comptime

## Tier 1

| Recurso | Link | Semanas |
|---------|------|---------|
| **Zig Language Reference** | https://ziglang.org/documentation/master/ | 8-16 |
| **ziglearn.org** | https://ziglearn.org/ | 8-11 (tutorial estruturado) |
| **Zig std docs** | https://ziglang.org/documentation/master/std/ | Referencia |
| **Exercism Zig Track** | https://exercism.org/tracks/zig | 8-13 (pratica adicional) |

## Tier 2

| Recurso | Link | Quando Usar |
|---------|------|-------------|
| **Zig by Example** (community) | https://zig.guide/ | Exemplos práticos |
| **Andrew Kelley talks** | YouTube | Filosofia de design |
| **Zig std source** | https://github.com/ziglang/zig/tree/master/lib/std | Quando quiser ver como stdlib funciona |

## Tier 3

| Recurso | Link | Quando Usar |
|---------|------|-------------|
| **Zig GitHub issues/PRs** | https://github.com/ziglang/zig | Mudanças de linguagem |
| **#zig channel** (Discord) | https://discord.gg/gxsFFjE | Dúvidas community |

## Por Semana

| Semana | Tema | Recurso Principal |
|--------|------|-------------------|
| 7 | Zig Setup | ziglearn.org Cap 1 |
| 8 | Basico + Memoria Overview | ziglearn.org Cap 1-2 |
| 9 | Pointers & Optionals | Zig Reference - Pointers |
| 10 | Error Handling | ziglearn.org Cap 2 |
| 11 | Structs, Enums & Tests | Zig Reference - Structs |
| 12 | Memory Deep Dive | ziglearn.org Cap 2 + std.mem |
| 13 | Allocators & ArrayList | std.mem.Allocator docs |
| 14 | Comptime Patterns | Zig Reference - comptime |
| 15 | Comptime Code Gen | std.meta + Zig Reference |
| 16 | Mini-Projeto 1 | Arena allocator + comptime patterns |

---

# FASE 2: Data Structures

## Tier 1

| Recurso | Link | Semanas |
|---------|------|---------|
| **Grokking Algorithms** | Livro | 18-30 |
| **Visualgo** | https://visualgo.net/ | Visualização |
| **Zig std** (ArrayList, HashMap) | https://ziglang.org/documentation/master/std/ | Implementações de referência |
| **Exercism Zig Track** | https://exercism.org/tracks/zig | Prática com DS |

## Tier 2

| Recurso | Link | Quando Usar |
|---------|------|-------------|
| **CLRS** | Livro "Introduction to Algorithms" | Teoria formal |
| **LeetCode** | https://leetcode.com/ | Prática problemas (em Python) |
| **NeetCode** | https://neetcode.io/ | Problemas curados |

## Por Semana

| Semana | Tema | Recurso Principal |
|--------|------|-------------------|
| 18 | Grafos (intro) | Visualgo + CLRS 22 |
| 19-20 | Arrays & ArrayList | Grokking Cap 2 + std.ArrayList |
| 21-22 | Linked Lists | CLRS Cap 10 |
| 23-24 | Stacks & Queues | Grokking Cap 3 |
| 25-26 | Hash Tables | Grokking Cap 5 |
| 27-28 | Trees & BST & AVL | CLRS Cap 12-13 |
| 29 | Heaps & Union-Find + Mini-Projeto 2 | CLRS Cap 6, 21 + Config Parser |

---

# FASE 3: Algorithms + DP

## Tier 1

| Recurso | Link | Semanas |
|---------|------|---------|
| **Grokking Algorithms** | Livro | 31-44 |
| **Visualgo** | https://visualgo.net/ | Sorting, Graphs |
| **Big O Cheat Sheet** | https://www.bigocheatsheet.com/ | Referencia |

## Tier 2

| Recurso | Link | Quando Usar |
|---------|------|-------------|
| **CLRS** | Livro | Teoria formal |
| **Algorithm Design Manual** | Skiena | Problemas reais |
| **LeetCode Patterns** | https://seanprashad.com/leetcode-patterns/ | Prática |

## Estratégia F3: Python no LeetCode, Zig localmente

> LeetCode não suporta Zig oficialmente. A estratégia desta fase é:
> 1. Resolver problemas no LeetCode **em Python** (foco no algoritmo)
> 2. Reimplementar as soluções mais importantes **em Zig localmente** (foco no controle de memória)
> 3. Os dois complementam: Python para velocidade de iteração, Zig para profundidade

## Python para LeetCode (Tier 1)

| Recurso | Link | Para quê |
|---------|------|----------|
| **Python Docs** | https://docs.python.org/3/ | Referência rápida |
| **Real Python - Data Structures** | https://realpython.com/python-data-structures/ | Collections úteis |
| **Python Cheatsheet** | https://www.pythoncheatsheet.org/ | Sintaxe rápida |

## Por Semana

| Semana | Tema | Recurso Principal |
|--------|------|-------------------|
| 31-32 | Sorting Basico | CLRS Cap 2 |
| 33-34 | Sorting Avancado | CLRS Cap 7-8 |
| 35-36 | Binary Search & Greedy | CLRS Cap 16 + Grokking |
| 37-38 | Recursao | CLRS Cap 4 |
| 39-40 | Grafos: Representacao | CLRS Cap 22 |
| 41-42 | Grafos: Algoritmos | CLRS Cap 22-24 |
| 43 | DP: Memoizacao | CLRS Cap 15 |
| 44 | DP: Tabulacao | CLRS Cap 15 |
| 45 | Mini-Projeto 3 | Benchmark Generator |

---

# FASE 4: Go + OS/CPU

## Tier 1

| Recurso | Link | Semanas |
|---------|------|---------|
| **A Tour of Go** | https://go.dev/tour/ | 46-47 |
| **Go by Example** | https://gobyexample.com/ | 46-49 |
| **Effective Go** | https://go.dev/doc/effective_go | 46-49 |
| **CS:APP** | Livro | 50-51 |
| **OSTEP** | https://pages.cs.wisc.edu/~remzi/OSTEP/ | 52-54 |

## Tier 2

| Recurso | Link | Quando Usar |
|---------|------|-------------|
| **What Every Programmer Should Know About Memory** | https://people.freebsd.org/~lstewart/articles/cpumemory.pdf | Cache deep dive |
| **Go Blog - Concurrency** | https://go.dev/blog/pipelines | Concurrency patterns |

## Por Semana

| Semana | Tema | Recurso Principal |
|--------|------|-------------------|
| 46-47 | Go Basics | Tour of Go |
| 48-49 | Go Concurrency | Go Blog + Effective Go |
| 50-51 | CPU & Cache | CS:APP Cap 6 |
| 52-53 | OS: Processos | OSTEP |
| 54 | OS: Scheduling | OSTEP |

---

# 🐹 FASE 5: Networking + DB

## Networking

| Recurso | Link | Semanas |
|---------|------|---------|
| **Beej's Guide to Network Programming** | https://beej.us/guide/bgnet/ | 56-57 |
| **High Performance Browser Networking** | https://hpbn.co/ | 58-59 |
| **MDN HTTP Guide** | https://developer.mozilla.org/en-US/docs/Web/HTTP | 58-59 |

## Databases

| Recurso | Link | Semanas |
|---------|------|---------|
| **Designing Data-Intensive Applications** | Livro (Kleppmann) | 60-63 |
| **Database Internals** | Livro (Petrov) | 60-61 |
| **Use The Index, Luke** | https://use-the-index-luke.com/ | 60-61 |

## Ferramentas

| Ferramenta | Uso |
|------------|-----|
| `tcpdump` | Capturar pacotes |
| `Wireshark` | Analisar pacotes |
| `curl` / `httpie` | HTTP requests |
| `netcat` (nc) | TCP raw |
| `dig` / `nslookup` | DNS queries |
| `strace` | System calls |
| `perf` | Performance/cache |

## Por Semana

| Semana | Tema | Recurso Principal |
|--------|------|-------------------|
| 56-57 | TCP/IP | Beej's Guide |
| 58-59 | HTTP | MDN + HPBN |
| 60-61 | DB: Storage | DDIA Cap 3 |
| 62-63 | DB: Transactions | DDIA Cap 7 |
| 64 | Integracao | Projeto pequeno |

---

# 🛠️ FASE 6: Compilers + Capstone

## Compilers

| Recurso | Link | Semanas |
|---------|------|---------|
| **Crafting Interpreters** | https://craftinginterpreters.com/ | 66-69 (grátis!) |
| **Writing an Interpreter in Go** | Livro (Ball) | Alternativa |

## Capstone

| Projeto | Recurso Principal |
|---------|-------------------|
| Database | DDIA + Database Internals |
| Distributed KV | DDIA + Raft Paper |
| Language | Crafting Interpreters |
| Web Framework | Go stdlib + Gin source |

## Por Semana

| Semana | Tema | Recurso Principal |
|--------|------|-------------------|
| 66-67 | Lexer & Parser | Crafting Interpreters Cap 4-6 |
| 68-69 | Interpreter | Crafting Interpreters Cap 7-10 |
| 71-84 | Capstone | Depende do projeto |

---

# 📊 Resumo de Investimento

## Livros Recomendados (Comprar)

| Livro | Preço Aprox | Fases |
|-------|-------------|-------|
| Grokking Algorithms | $40 | 2, 3 |
| CLRS (opcional) | $80 | 2, 3 |
| DDIA | $50 | 5 |
| CS:APP (opcional) | $100 | 5 |
| **Total mínimo** | **~$90** | |
| **Total completo** | **~$270** | |

## Recursos Gratuitos Essenciais

| Recurso | Link |
|---------|------|
| Zig Language Reference | https://ziglang.org/documentation/master/ |
| ziglearn.org | https://ziglearn.org/ |
| Exercism (Zig & Go) | https://exercism.org/ |
| Tour of Go | https://go.dev/tour/ |
| OSTEP | https://pages.cs.wisc.edu/~remzi/OSTEP/ |
| Crafting Interpreters | https://craftinginterpreters.com/ |
| Visualgo | https://visualgo.net/ |
| Beej's Guide | https://beej.us/guide/bgnet/ |
| HPBN | https://hpbn.co/ |
| Book of Proof | https://www.people.vcu.edu/~rhammack/BookOfProof/ |

## Tempo por Recurso

| Recurso | Horas Est. | Fases |
|---------|------------|-------|
| ziglearn.org + Zig Reference | 30h | 1 |
| Exercism Zig | 15h | 1 |
| Grokking | 20h | 2, 3 |
| Tour of Go | 5h | 4 |
| CS:APP (selecao) | 25h | 4 |
| OSTEP (selecao) | 15h | 4 |
| DDIA (selecao) | 25h | 5 |
| Crafting Interpreters | 30h | 6 |
| **Leitura Total** | **~145h** | |
| **Projetos/Pratica** | **~240h** | |
| **TOTAL** | **~385h** | |

---

# 🌐 Comunidades & Suporte

## Discord Servers

| Comunidade | Link | Para quê |
|------------|------|----------|
| **Zig Community** | https://discord.gg/gxsFFjE | Dúvidas de Zig, code review |
| **Gophers** | https://discord.gg/golang | Dúvidas de Go |
| **CS Career Hub** | https://discord.gg/cscareerhub | Preparação para entrevistas |
| **The Programmer's Hangout** | https://discord.gg/programming | Discussões gerais |

## Reddit

| Subreddit | Link | Para quê |
|-----------|------|----------|
| r/learnprogramming | https://reddit.com/r/learnprogramming | Dúvidas gerais |
| r/zig | https://reddit.com/r/zig | Zig específico |
| r/golang | https://reddit.com/r/golang | Go específico |
| r/cscareerquestions | https://reddit.com/r/cscareerquestions | Carreira |
| r/leetcode | https://reddit.com/r/leetcode | Discussão de problemas |

## Accountability & Tracking

| Ferramenta | Link | Para quê |
|------------|------|----------|
| **Beeminder** | https://beeminder.com | Commitment com $ em jogo |
| **Stickk** | https://stickk.com | Metas com accountability |
| **Habitica** | https://habitica.com | Gamificação de hábitos |
| **WakaTime** | https://wakatime.com | Track tempo de código |

## Encontrar Parceiro de Estudos

- **Discord #study-buddies** nos servers acima
- **Reddit weekly threads** em r/learnprogramming
- **Twitter/X #100DaysOfCode** comunidade

## Como Usar Comunidades Efetivamente

### ✅ Faça
- Pesquise antes de perguntar
- Mostre o que você já tentou
- Seja específico na dúvida
- Retribua ajudando outros

### ❌ Evite
- Pedir respostas prontas
- Postar código sem contexto
- Esperar respostas imediatas
- Comparar seu progresso com outros

---

# 🎯 Prática de Algoritmos (LeetCode)

## Meta por Fase

| Fase | Problemas | Dificuldade | Foco |
|------|-----------|-------------|------|
| Fase 3 | ~40 | Easy/Medium | Arrays, Sorting, Grafos, DP (Python) |
| Fase 5 | ~10 | Medium | Networking, DB |
| **Total** | **~65** | - | - |

> Meta estendida: ~100 problemas ao longo dos 22 meses (se tempo permitir)

## Recursos de Prática

| Recurso | Link | Para quê |
|---------|------|----------|
| **NeetCode 150** | https://neetcode.io/practice | Lista curada |
| **LeetCode Patterns** | https://seanprashad.com/leetcode-patterns/ | Por padrão |
| **Grind 75** | https://www.techinterviewhandbook.org/grind75 | Lista eficiente |
| **Blind 75** | (pesquisar) | Lista clássica |

## Estratégia de Prática

1. **Tente 20-30 min** antes de ver hints
2. **Leia solução** se travar completamente
3. **Implemente você mesmo** após entender
4. **Revise no dia seguinte** sem olhar
5. **Adicione ao SRS** padrões aprendidos

---

# ⚠️ Anti-Patterns

| Evitar | Por quê | Alternativa |
|--------|---------|-------------|
| Cursos em vídeo longos | Passivo, ilusão de aprendizado | Livros + projetos |
| Múltiplos recursos | Fragmenta atenção | Um principal + referência |
| Tutoriais copy-paste | Não constrói entendimento | Implementar do zero |
| Respostas prontas | Não desenvolve retrieval | Perguntas guia primeiro |
| Ler sem praticar | Conhecimento não consolida | 50% leitura, 50% código |

---

# 🧠 Como Usar Recursos Efetivamente

## Antes de Ler
1. Leia as perguntas guia da semana
2. Tente responder sozinho (5-10 min)
3. Anote o que não sabe

## Durante a Leitura
1. Leia ativamente (faça perguntas)
2. Anote em suas palavras
3. Pare para implementar exemplos
4. Não copie código - digite

## Depois de Ler
1. Feche o material
2. Tente explicar (técnica Feynman)
3. Implemente sem olhar
4. Crie cards SRS

## No Dia Seguinte
1. Quiz você mesmo
2. Revise cards SRS
3. Tente explicar novamente
4. Só então continue

---

*"A leitura fornece conhecimento; a prática fornece habilidade."*
