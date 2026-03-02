# Plano de Migração Rust → Zig (CS Fundamentals) - v2.0

**Status**: PLANEJAMENTO REVISADO (não aplicado)  
**Data**: 2026-02-23  
**Versão**: 2.0 (revisão completa com ajustes críticos)

---

## 📋 Sumário Executivo

Este documento descreve o plano completo para migrar o módulo `foundations-of-computing` de Rust para Zig, focando em fundamentos de CS (memória, estruturas de dados, algoritmos) com uma linguagem moderna que prioriza transparência.

**Mudanças principais vs v1.0**:
- ✅ Mini-projetos simplificados (viáveis e focados)
- ✅ F1 rebalanceada (error handling e comptime separados)
- ✅ F4 detalhada (4 semanas estruturadas)
- ✅ Análise de risco + mitigação
- ✅ Recursos completos (links + debugging)
- ✅ Checklist expandido (validações técnicas)
- ✅ Regras de stdlib/allocators (decisões aplicadas)

---

## 🎯 Decisões Fundamentais

### Escopo
- **Zig substitui Rust**: Apenas Fases 1-4 (fundamentos, DS, algoritmos, avançado)
- **Go mantido**: Fases 5A-5B (Systems/Concorrência) sem mudanças
- **Timeline**: 80 semanas (vs 88 originais) — redução de 8 semanas
- **Profundidade Zig**: Moderada (allocators, ponteiros, slices, comptime, error handling)

### Objetivos da Migração

1. **Priorizar fundamentos de CS** sobre detalhes de linguagem
   - Memória, representações, trade-offs > ownership/lifetimes específicos de Rust
   
2. **Reduzir fricção pedagógica**
   - Eliminar tempo gasto em "workarounds" de borrow checker (árvores/grafos)
   - Menos luta com compilador, mais foco em complexidade algorítmica

3. **Aumentar transparência**
   - Alocação/liberação explícitas via allocator interface
   - Custo mental menor: sem lifetimes, borrowing rules complexas

4. **Manter sustentabilidade**
   - Buffers estratégicos preservados
   - Benchmarks factíveis em 1h/dia
   - Mini-projetos time-boxed (≤8h cada)

### Regras de Uso de Stdlib

| Fase | Regra | Justificativa |
|------|-------|---------------|
| **F1** | ❌ Proibido usar stdlib de DS | Implementar do zero (aprender internals) |
| **F2** | ⚠️ Permitido após implementar próprio | Comparar com `std.ArrayList`, `std.HashMap` |
| **F3-F4** | ✅ Usar stdlib livremente | Foco em algoritmos, não em DS |

**Exceções**: `std.testing`, `std.debug`, `std.mem` (utilities) permitidos em todas as fases.

### Regras de Allocators por Fase

| Fase | Allocator | Justificativa |
|------|-----------|---------------|
| **F1** | `GeneralPurposeAllocator` apenas | Simplicidade, um conceito de cada vez |
| **F2** | Arena vs GPA (alternar) | Sentir trade-offs (performance vs simplicidade) |
| **F3-F4** | Escolher por problema | Justificar no log diário |
| **MP1** | Comparar 3 tipos | Arena, GPA, FixedBuffer (análise empírica) |

### Prática de Testes

- **Toda entrega semanal**: Mínimo 5 testes unitários
- **Sessão quinzenal**: 1h dedicada a refactor + cobertura de testes
- **Benchmarks**: Incluir testes de performance (opcional mas recomendado)

### Critérios de "Moderado" Low-Level

**✅ Permitido/Incentivado**:
- Ponteiros (`*T`, `[*]T`, `?*T`)
- Allocators (interface padrão)
- Introspecção de tipos (`@sizeOf`, `@alignOf`, `@typeInfo`)
- Layouts de memória (padding, alignment)
- Slices e arrays (sentinel-terminated)
- Comptime (generics, type functions, validação)

**❌ Evitar por Enquanto**:
- Inline assembly (muito low-level para escopo)
- SIMD manual (otimização prematura)
- Undefined Behavior intencional (hacking)
- Packed structs (exceto se necessário para layout específico)

---

## 📅 Timeline Completa (80 semanas)

```
F0  Math Foundations          Sem 1-5     (5w)
    Buffer 1                   Sem 6       (1w)

F1  Zig Foundations            Sem 7-12    (6w)   [antes: Rust 8w]
    Mini-Projeto 1             Sem 13      (1w)
    Buffer 2                   Sem 14      (1w)

F2  Data Structures (Zig)      Sem 15-24   (10w)  [antes: 12w]
    Mini-Projeto 2             Sem 25      (1w)
    Buffer 3                   Sem 26      (1w)

F3  Algorithms (Zig)           Sem 27-38   (12w)  [mantido]
    Mini-Projeto 3             Sem 39      (1w)
    Buffer 4                   Sem 40      (1w)

F4  Advanced Zig + DP          Sem 41-44   (4w)   [antes: 4w]
    Buffer 5                   Sem 45      (1w)

F5A Go Foundations             Sem 46-49   (4w)   [mantido]
F5B Systems Programming        Sem 50-63   (14w)  [mantido]
    Buffer 6                   Sem 64      (1w)

F6  Compilers + Capstone       Sem 65-80   (16w)  [antes: 18w]
```

**Redução de 8 semanas**:
- F1: -2w (Zig mais simples que Rust para fundamentos)
- F2: -2w (menos fricção com ponteiros/ownership)
- F6: -2w (ajuste para compensar total)
- Buffers: -2w (redistribuídos)

**⚠️ Observação**: Os índices acima são proposta. A aplicação deve atualizar **todos** os arquivos que referenciam numeração de semanas.

---

## 📚 Conteúdo por Fase

### F1: Zig Foundations (6 semanas)

**Objetivo Geral**: Dominar memória em Zig o suficiente para implementar DS do zero com confiança.

#### **Semana 7: Zig Basics + Modelo de Memória**
- **Tooling**: `zig build`, `zig test`, estrutura de projeto, VSCode+zls
- **Conceitos**: 
  - Tipos básicos (int, float, bool, arrays)
  - Stack vs heap (conceitual)
  - Slices (`[]T`, `[:0]T`)
  - `defer` (cleanup básico)
- **Exercícios**: 
  - "Hello World" com build.zig
  - Manipulação de arrays e slices
  - Primeiros testes unitários
- **Benchmark**: Explicar diferença entre stack e heap (desenhar diagrama)

#### **Semana 8: Ponteiros + Optionals**
- **Conceitos**:
  - `*T` (single-item pointer)
  - `[*]T` (many-item pointer)
  - `?T` (optional value)
  - `?*T` (optional pointer)
  - Aliasing e invariantes
- **Exercícios**: 
  - Lista ligada mínima (singly-linked list)
  - Swap via ponteiros
- **Benchmark**: Implementar `append` e `find` em lista ligada

#### **Semana 9: Error Handling**
- **Conceitos**:
  - `error{}` (error sets)
  - `!T` (error union)
  - `try`, `catch`, `errdefer`
  - Propagação de erros
- **Exercícios**:
  - Funções que retornam erros (file I/O simulado)
  - Implementar stack com error handling
- **Meta**: Explicar fluxo de erro sem exceções
- **Benchmark**: Escrever função com 3+ casos de erro tratados corretamente

#### **Semana 10: Structs/Enums/Unions + Testes**
- **Conceitos**:
  - `struct` (definição, métodos)
  - `enum` (tipos enumerados)
  - Tagged union (variant types)
  - Testes unitários (`std.testing`)
- **Introdução leve**: `comptime var` (variáveis compile-time)
- **Exercícios**:
  - Definir estrutura de Node + Tree
  - Testes para DS simples
- **Benchmark**: Struct com 5+ métodos + 10+ testes

#### **Semana 11: Memory Deep Dive + Comptime Basics**
- **Conceitos**:
  - `@sizeOf`, `@alignOf`, `@offsetOf`
  - Padding, alignment
  - Layout previsível de structs
  - Impactos em cache (conceitual)
  - Comptime blocks (cálculos em compile-time)
- **Exercícios**:
  - Calcular tamanho de structs complexas
  - Prever layouts de memória
  - Usar `@sizeOf` em comptime
- **Benchmark**: Desenhar memory layout de 3 structs diferentes (com padding)

#### **Semana 12: Allocators + ArrayList do Zero**
- **Conceitos**:
  - Allocator interface (`std.mem.Allocator`)
  - `GeneralPurposeAllocator` (GPA)
  - `alloc`, `free`, `create`, `destroy`
  - Crescimento amortizado (capacity vs len)
- **Exercícios**:
  - Implementar `MyArrayList(T)` completo
  - Operações: `init`, `deinit`, `append`, `pop`, `get`, `insert`, `remove`
  - Testes de edge cases (empty, single, growth)
- **Entrega**: `MyArrayList(T)` genérico + 15+ testes
- **Benchmark F1**: 
  - Desenhar fluxo de alocação/liberação em DS simples
  - Prever 5 bugs comuns (dangling pointer, double free, leak, use-after-free, OOM não tratado)

---

### Mini-Projeto 1: Comparação de Allocators (Semana 13)

**Título**: "Allocator Strategy Analysis"

**Objetivo**: Entender trade-offs de diferentes allocators em contextos reais.

**Especificação**:
1. **Implementar 3 estruturas de dados**:
   - BST (Binary Search Tree)
   - Dynamic array (similar a ArrayList)
   - Graph (adjacency list)

2. **Testar cada uma com 3 allocators**:
   - `GeneralPurposeAllocator` (gpa)
   - `ArenaAllocator`
   - `FixedBufferAllocator`

3. **Instrumentar e medir**:
   - Tempo de execução (operações)
   - Memória pico (peak usage)
   - Número de alocações
   - Fragmentação (onde aplicável)

4. **Responder no relatório**:
   - "Quando usar Arena?" (ex: lifetime conhecido, bulk operations)
   - "Quando usar GPA?" (ex: lifetime variável, long-running)
   - "Quando usar FixedBuffer?" (ex: embedded, stack memory)

**Deliverable**:
- Código instrumentado (3 DS × 3 allocators = 9 combinações)
- Relatório markdown com tabela comparativa
- Conclusão: "O que aprendi sobre allocators"

**Time-box**: 8h máximo (se ultrapassar, reduzir escopo para 2 DS)

**Conceito aprendido**: Allocator selection strategy (não implementação de allocator)

---

### F2: Data Structures (10 semanas)

**Objetivo Geral**: Implementar DS clássicas do zero em Zig com foco em custo, trade-offs e transparência de memória.

**Semanas 15-24** (10 semanas totais):

#### **Estruturas Cobertas**:
1. **Arrays/Slices/Dynamic Arrays** (1w)
   - ArrayList genérico
   - Crescimento amortizado
   - Benchmarks: insert, delete, access

2. **Linked Lists** (1w)
   - Singly-linked
   - Doubly-linked
   - Circular (opcional)
   - Trade-off: vs arrays

3. **Stacks/Queues** (1w)
   - Stack (array-based e linked)
   - Queue (array-based e linked)
   - Ring buffer (circular queue)

4. **Hash Tables** (2w)
   - Hash functions (int, string)
   - Collision resolution: chaining OU open addressing (escolher um)
   - Load factor e resize
   - Benchmarks: insert, lookup, delete

5. **Trees** (2w)
   - Binary Search Tree (BST)
   - AVL Tree (balanced BST)
   - Tree traversals (in/pre/post-order)
   - Sem fricção de ownership (ponteiros diretos)

6. **Heaps** (1w)
   - Min-heap, Max-heap
   - Priority queue
   - Heapsort

7. **Union-Find** (1w)
   - Disjoint set
   - Path compression
   - Union by rank

8. **Grafos** (1w)
   - Representações: adjacency list, adjacency matrix
   - Operações básicas: add_edge, neighbors
   - Preparação para algoritmos (F3)

**Prática de Testes**: Cada DS com mínimo 10 testes (edge cases, performance)

**Benchmark Q1** (fim de F2):
- **Prova prática**: Implementar 2 DS (sorteadas) do zero em tempo limitado (2h)
- **Critério**: Testes passam + código compila + explicação de trade-offs
- **Objetivo**: Retrieval practice (recall sem consulta)

---

### Mini-Projeto 2: HashMap Genérico com Comptime (Semana 25)

**Título**: "Generic HashMap with Compile-Time Dispatch"

**Objetivo**: Aprender generics via `comptime` em contexto prático.

**Especificação**:
1. **Implementar `HashMap(K, V)`** genérico sobre key/value types
   
2. **Hash function via comptime dispatch**:
   ```zig
   fn hash(key: K) u64 {
       return switch (@typeInfo(K)) {
           .Int => hashInt(key),
           .Pointer => |ptr| switch (ptr.size) {
               .Slice => hashString(key), // assume []const u8
               else => @compileError("Unsupported pointer type"),
           },
           else => @compileError("Type must implement hash()"),
       };
   }
   ```

3. **Collision handling**: Escolher uma estratégia
   - Chaining (linked list) OU
   - Open addressing (linear probing)

4. **Testes para múltiplos tipos**:
   - `HashMap(i32, []const u8)`
   - `HashMap([]const u8, i32)`
   - Edge cases: empty, collisions, resize

5. **Benchmark vs stdlib**:
   - Comparar com `std.HashMap` (performance)
   - Análise: onde stdlib é melhor? Por quê?

**Deliverable**:
- `HashMap(K, V)` genérico + testes (20+)
- Relatório: "O que aprendi sobre comptime"
- Comparação com `std.HashMap` (tabela)

**Time-box**: 8h máximo

**Conceito aprendido**: Generics via `comptime`, type introspection básica

**Por que é melhor que parser JSON?**:
- ✅ Constrói em cima de F2 (já implementou hash table)
- ✅ Foca em **um** conceito (comptime generics)
- ✅ Menos edge cases (parsing tem muitos)
- ✅ Deliverable testável e comparável

---

### F3: Algorithms (12 semanas)

**Objetivo Geral**: Dominar algoritmos clássicos com análise de complexidade. Zig é ferramenta, não foco.

**Semanas 27-38** (12 semanas):

#### **Conteúdo Coberto**:

**Weeks 27-28: Sorting**
- Bubble, Selection, Insertion (básicos)
- Merge Sort, Quick Sort (divide-and-conquer)
- Heap Sort (usando heap de F2)
- Counting Sort, Radix Sort (linear time)
- Análise: melhor/médio/pior caso, estabilidade

**Week 29: Binary Search + Variants**
- Binary search básico
- Lower bound, upper bound
- Rotated array search
- Peak finding

**Weeks 30-31: Greedy Algorithms**
- Activity selection
- Huffman coding
- Fractional knapsack
- Interval scheduling

**Weeks 32-33: Recursion + Backtracking**
- Recursion patterns (tail call, multiple recursive calls)
- Backtracking: N-Queens, Sudoku solver
- Memoization intro (preparation for DP)

**Weeks 34-36: Graph Algorithms**
- BFS (Breadth-First Search)
- DFS (Depth-First Search)
- Dijkstra (shortest path)
- Topological sort
- MST: Prim's, Kruskal's (usando Union-Find)

**Weeks 37-38: Advanced Topics**
- Two pointers
- Sliding window
- Bit manipulation
- String algorithms (KMP opcional)

**Prática Paralela**: 
- LeetCode/HackerRank: 2-3 problemas/semana (progressivo)
- Manter regra: reimplementar 1 solução/semana sem consulta

**Benchmark Q2** (fim de F3):
- **Prova prática**: Resolver 3 problemas algorítmicos (médio/difícil) em tempo limitado (3h)
- **Critério**: Código funciona + análise de complexidade correta
- **Objetivo**: Consolidação de F3

---

### Mini-Projeto 3: Benchmark Generator Suite (Semana 39)

**Título**: "Algorithm Benchmarking Framework"

**Objetivo**: Construir framework para análise empírica de algoritmos.

**Especificação**:
1. **Gerador de casos de teste**:
   - Random arrays (tamanhos variados: 10³, 10⁴, 10⁵, 10⁶)
   - Sorted, reverse-sorted, random
   - Com duplicatas, sem duplicatas

2. **Benchmark runner**:
   - Medir tempo de execução (std.time.nanoTimestamp)
   - Múltiplas runs (média + desvio padrão)
   - Export para CSV ou JSON

3. **Algoritmos testados** (mínimo 3):
   - Sorting: Quick Sort, Merge Sort, Heap Sort
   - OU Search: Linear, Binary, Interpolation
   - OU Graph: BFS, DFS, Dijkstra

4. **Análise**:
   - Plot opcional (via gnuplot ou export para Python)
   - Tabela comparativa (tempo vs tamanho de input)
   - Validar complexidade teórica vs prática

**Deliverable**:
- Framework de benchmark (`benchmark.zig`)
- Resultados (CSV/JSON + análise)
- Relatório: "Validação empírica de complexidade"

**Time-box**: 8h máximo

**Conceito aprendido**: Performance analysis, empirical validation

---

### F4: Advanced Zig + Dynamic Programming (4 semanas)

**Objetivo Geral**: Dominar `comptime` avançado e técnicas de DP clássicas.

#### **Semana 41: Comptime Avançado I - Type Functions**
- **Conceitos**:
  - Type functions: `fn MyType(comptime T: type) type`
  - Generic DS revisitados (List, HashMap, Tree)
  - Return types dependentes de comptime
- **Exercícios**:
  - Implementar `Result(T, E)` genérico (Rust-like)
  - Implementar `Option(T)` genérico
- **Entrega**: Mini-biblioteca de tipos genéricos

#### **Semana 42: Comptime Avançado II - Code Generation**
- **Conceitos**:
  - Loops em comptime (`inline for`)
  - Compile-time validation (`@compileError`)
  - Type introspection avançada (`@typeInfo`, `@hasField`)
- **Exercícios**:
  - Generic min/max com comptime comparator
  - Struct printer (via comptime field iteration)
- **Entrega**: Utilities genéricos usando comptime

#### **Semana 43: Dynamic Programming I - Memoização**
- **Conceitos**:
  - Top-down DP (recursão + cache)
  - Memoização usando HashMap
- **Problemas**:
  - Fibonacci (trivial, warmup)
  - Longest Common Subsequence (LCS)
  - Edit Distance (Levenshtein)
  - Coin Change (variações)
- **Entrega**: 4+ problemas resolvidos com testes

#### **Semana 44: Dynamic Programming II - Tabulação**
- **Conceitos**:
  - Bottom-up DP (iterativo)
  - Space optimization (rolling arrays)
- **Problemas**:
  - 0/1 Knapsack
  - Longest Increasing Subsequence (LIS)
  - Matrix Chain Multiplication
  - Optimal BST
- **Entrega**: 4+ problemas resolvidos com testes

**Benchmark Q3** (fim de F4):
- **Prova prática**: 
  - Resolver 2 problemas DP (um top-down, um bottom-up) em tempo limitado (2h)
  - Implementar 1 generic DS usando comptime type functions
- **Critério**: Código funciona + análise de complexidade + explicação de comptime
- **Objetivo**: Consolidação de F4

**Deliverable F4 (geral)**:
- Generic DS library (5+ estruturas com comptime)
- DP problem set (8+ problemas resolvidos)
- Ensaio: "Quando usar comptime vs runtime?" (análise crítica)

---

### F5A-F6: Go e Compilers (Sem Mudanças)

**F5A: Go Foundations** (Semanas 46-49, 4w) — Mantido do plano original  
**F5B: Systems Programming** (Semanas 50-63, 14w) — Mantido do plano original  
**F6: Compilers + Capstone** (Semanas 65-80, 16w) — Mantido com redução de 2w

**Ajustes em F6**:
- Comparação Zig vs Go (não Rust vs Go)
- Aproveitar conhecimento de comptime de Zig (metaprogramação)

---

## 📚 Recursos Zig

### Tier 1 (Obrigatórios)

**Documentação Oficial**:
- [Zig Language Reference](https://ziglang.org/documentation/master/) — Referência completa
- [Zig Standard Library Docs](https://ziglang.org/documentation/master/std/) — stdlib API

**Tutoriais Interativos**:
- [Ziglings](https://github.com/ratfactor/ziglings) — Exercícios progressivos (completar antes de F1)
- [Zig Learn](https://ziglearn.org/) — Tutorial estruturado

**Stdlib Específica** (leitura de código recomendada):
- `std.mem` — Memory utilities (copy, set, compare)
- `std.heap` — Allocators (GPA, Arena, FixedBuffer)
- `std.testing` — Unit testing framework
- `std.ArrayList` — Dynamic array (comparar com implementação própria em F2)
- `std.HashMap` — Hash table (comparar em MP2)

**Debugging**:
- [LLDB for Zig](https://zig.news/jarredsumner/debugging-zig-with-lldb-2gag) — Como usar LLDB com Zig
- Print debugging patterns (usar `std.debug.print`)
- AddressSanitizer com Zig (se disponível)

### Tier 2 (Recomendados)

**Artigos e Talks**:
- "Zig Allocators Explained" — (buscar posts atualizados em 2026)
- "Comptime in Zig" — Andrew Kelley talks (YouTube/ZigConf)
- "What is Zig's Comptime?" — Loris Cro articles

**Casos de Estudo**:
- [Zig Showtime](https://zig.show/) — Projetos da comunidade
- CLI tools em Zig: `zls` (language server), `bun` (JavaScript runtime)
- Comparações: "Zig vs C", "Zig vs Rust" (para entender trade-offs)

**Comunidade**:
- [Zig Discord](https://discord.gg/zig) — Ajuda em tempo real
- [Ziggit Forum](https://ziggit.dev/) — Discussões técnicas
- [/r/Zig](https://reddit.com/r/zig) — Reddit

### Tier 3 (Opcional, Avançado)

- Zig compiler source code (para F6 - Compilers)
- Zig RFC proposals (entender evolução da linguagem)
- Embedded Zig (microcontrollers) — Fora de escopo, mas interessante

---

## 🛠️ Zig Cheat Sheet (Criar em F1)

**Estrutura Sugerida** (atualizar conforme aprende):

### 1. Syntax Básica
```zig
// Variáveis
const x: i32 = 10;          // Imutável, tipo explícito
var y = 20;                 // Mutável, tipo inferido
comptime z = 30;            // Compile-time constant

// Controle de fluxo
if (cond) { } else { }
switch (value) { 0 => {}, 1 => {}, else => {} }
for (slice) |item| { }
while (cond) { }
```

### 2. Ponteiros e Memória
```zig
// Tipos de ponteiros
*T              // Single-item pointer
[*]T            // Many-item pointer (desconhece tamanho)
[]T             // Slice (pointer + length)
?*T             // Optional pointer (pode ser null)

// Arrays e slices
[5]i32          // Array fixo (5 elementos)
[]const u8      // Slice de bytes (imutável)
[:0]const u8    // Sentinel-terminated (null-terminated string)

// Stack vs Heap
var x: i32 = 10;              // Stack
var ptr = try allocator.create(i32);  // Heap
defer allocator.destroy(ptr); // Cleanup
```

### 3. Allocators
```zig
const std = @import("std");

// GeneralPurposeAllocator (GPA)
var gpa = std.heap.GeneralPurposeAllocator(.{}){};
defer _ = gpa.deinit();
const allocator = gpa.allocator();

// ArenaAllocator
var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
defer arena.deinit();
const allocator = arena.allocator();

// Uso
const list = try std.ArrayList(i32).init(allocator);
defer list.deinit();
```

### 4. Error Handling
```zig
// Error sets
const MyErrors = error{ OutOfMemory, InvalidInput };

// Error union
fn foo() !i32 {  // !i32 = anyerror!i32
    if (cond) return error.InvalidInput;
    return 42;
}

// Tratamento
const result = foo() catch |err| {
    std.debug.print("Error: {}\n", .{err});
    return;
};

// try = catch + return
const result = try foo();  // Propaga erro

// errdefer (cleanup on error)
const ptr = try allocator.create(Node);
errdefer allocator.destroy(ptr);
```

### 5. Comptime Essentials
```zig
// Compile-time variables
comptime var count = 0;

// Generic functions
fn List(comptime T: type) type {
    return struct {
        items: []T,
        // ...
    };
}

// Type introspection
fn printSize(comptime T: type) void {
    std.debug.print("Size: {}\n", .{@sizeOf(T)});
}

// Comptime execution
const len = comptime blk: {
    var l = 0;
    for ("hello") |_| l += 1;
    break :blk l;
};  // len = 5 (computed at compile-time)
```

### 6. Testing
```zig
const std = @import("std");
const testing = std.testing;

test "basic test" {
    try testing.expect(true);
    try testing.expectEqual(42, add(40, 2));
}

fn add(a: i32, b: i32) i32 {
    return a + b;
}
```

### 7. Common Pitfalls
- **Sentinel-terminated strings**: `"hello"` é `*const [5:0]u8`, não `[]const u8`
- **Defer ordem**: LIFO (último defer executa primeiro)
- **Undefined**: `var x: i32 = undefined;` (não inicializa, cuidado!)
- **Alignment**: Structs têm padding automático, usar `@alignOf` para verificar

---

## ⚠️ Análise de Riscos e Mitigação

### Risco 1: Zig 0.14 Quebra Código Mid-Program
**Probabilidade**: Média (Zig ainda em 0.x, breaking changes comuns)  
**Impacto**: Alto (pode bloquear progresso por dias)

**Mitigação**:
- ✅ **Fixar versão de Zig** no início (ex: `0.13.0`)
- ✅ **Não atualizar durante F1-F4** (evitar breaking changes)
- ✅ **Atualizar apenas em buffers** (semanas 14, 26, 40, 45)
- ✅ **Manter changelog** de breaking changes (ler release notes)
- ✅ **Testar antes de atualizar** (rodar `zig build test` antes de commitar)

**Plano B**: Se 0.14 quebrar criticamente, rolar back para versão anterior

---

### Risco 2: Comptime é Difícil Demais
**Probabilidade**: Média (conceito novo, pode frustrar)  
**Impacto**: Médio (travamento em MP2 ou F4 por 1-2 dias)

**Mitigação**:
- ✅ **Introdução gradual**: `comptime var` (S10) → blocks (S11) → generics (MP2) → type functions (F4)
- ✅ **MP2 simplificado**: HashMap genérico (mais direto que parser JSON)
- ✅ **Skip rule**: Se travar >2h em comptime, pular exercício avançado (não é blocker)
- ✅ **Recursos alternativos**: ChatGPT/Claude para explicações (se docs insuficientes)
- ✅ **Fallback**: Usar generics simples sem comptime avançado (ok para fundamentos)

**Plano B**: Postergar comptime avançado para depois de F6 (opcional)

---

### Risco 3: Allocators Confusos
**Probabilidade**: Baixa-Média (conceito novo, mas bem documentado)  
**Impacto**: Médio (frustração em F1, especialmente semana 12)

**Mitigação**:
- ✅ **Usar apenas GPA em F1** (simplicidade, um allocator de cada vez)
- ✅ **MP1 compara allocators** (não implementa) — reduz complexidade
- ✅ **Implementar allocator só em F4** (quando tem base sólida)
- ✅ **Instrumentação explícita**: Sempre logar alocações/liberações (debug)
- ✅ **Valgrind/leak detection**: Se disponível para Zig (verificar)

**Plano B**: Se allocators travarem, usar só GPA em todo F1-F4 (simplificar)

---

### Risco 4: Documentação Insuficiente
**Probabilidade**: Média (Zig docs são técnicas, não pedagógicas)  
**Impacto**: Médio (dificuldade em conceitos específicos)

**Mitigação**:
- ✅ **Manter Cheat Sheet atualizado** (resumos próprios)
- ✅ **Ler código da stdlib** (exemplos práticos, não docs abstratas)
- ✅ **Consultar comunidade**: Discord Zig (resposta rápida)
- ✅ **ChatGPT/Claude**: Explicações alternativas quando docs falharem
- ✅ **Ziglings**: Exemplos práticos (complementa docs)

**Plano B**: Se conceito específico travar, pular temporariamente e voltar depois

---

### Risco 5: Mini-Projetos Muito Ambiciosos
**Probabilidade**: Baixa (após simplificações v2.0)  
**Impacto**: Alto se ocorrer (travamento por 1+ semana)

**Mitigação**:
- ✅ **MP1 simplificado**: Comparar allocators (não implementar)
- ✅ **MP2 simplificado**: HashMap genérico (não parser JSON)
- ✅ **Time-box estrito**: 8h máximo por mini-projeto
- ✅ **Permitir entrega parcial**: Se não terminar, entregar o que tem + justificativa
- ✅ **Prototipar antes**: Validar viabilidade antes de aplicar plano (recomendado)

**Plano B**: Se ultrapassar 8h, reduzir escopo (ex: MP1 com 2 DS em vez de 3)

---

### Risco 6: Tooling Imaturo (LSP, Debugger)
**Probabilidade**: Baixa (zls é funcional, LLDB funciona)  
**Impacto**: Baixo-Médio (DX ruim, mas não blocker)

**Mitigação**:
- ✅ **Setup de zls** (language server) no início
- ✅ **Testar LLDB** antes de F1 (verificar debugging funciona)
- ✅ **Print debugging**: `std.debug.print` como fallback (sempre funciona)
- ✅ **Compilation errors claros**: Zig tem boas mensagens de erro (melhor que C++)

**Plano B**: Se debugger falhar, usar print debugging + testes (suficiente para CS fundamentals)

---

### Risco 7: Perda de Motivação (Breaking Changes Constantes)
**Probabilidade**: Baixa (se versão fixada)  
**Impacto**: Alto (abandono do programa)

**Mitigação**:
- ✅ **Fixar versão** (evita frustração com breaking changes)
- ✅ **Buffers estratégicos** (descanso, recuperação)
- ✅ **Benchmarks factíveis** (não sobrecarregar)
- ✅ **Mini-projetos interessantes** (não apenas "drill")
- ✅ **Celebrar progresso** (logs diários, retrospectivas semanais)

**Plano B**: Se frustração alta, revisar escopo (reduzir carga, não abandonar)

---

## ✅ Checklist de Validação (Quando Aplicar)

### Validações de Conteúdo

- [ ] **Grep Rust**: Nenhuma referência a Rust em F1-F4 (exceto seção comparativa)
- [ ] **Numeração consistente**: Todas as semanas 7-44 atualizadas
- [ ] **Links válidos**: Referências cruzadas funcionam
- [ ] **Benchmarks factíveis**: Cada benchmark <= 1h (testar cronometrando)
- [ ] **Mini-projetos prototipados**: MP1, MP2, MP3 validados (implementar antes de aplicar)
- [ ] **Go/Systems atualizado**: Comparação Zig vs Go (não Rust vs Go)

### Validações Técnicas

- [ ] **Zig instalado**: Versão fixada (ex: `0.13.0`)
- [ ] **`zig build` funciona**: Testar em projeto template
- [ ] **`zig test` funciona**: Rodar testes de exemplo
- [ ] **zls configurado**: Language server no VSCode/editor
- [ ] **LLDB testado**: Debug de programa Zig simples
- [ ] **Ziglings disponível**: Clonado e testado (exercícios 1-10)

### Validações de Recursos

- [ ] **Links Tier 1 acessíveis**: Zig docs, Ziglings, Zig Learn funcionam
- [ ] **Cheat Sheet criado**: Template preenchido (seção básica)
- [ ] **Exemplos de código testados**: Snippets compilam sem erros
- [ ] **Debugging guide disponível**: LLDB ou print debugging documentado

### Validações de Escopo

- [ ] **Complexidade por semana <= baseline Rust**: Não aumentar carga
- [ ] **Buffers ainda adequados**: 6 buffers (14% do tempo)
- [ ] **Timeline total <= 80 semanas**: Não ultrapassar
- [ ] **Mini-projetos time-boxed**: 8h cada (testado)

### Validações de Documentação

- [ ] **`learning-map.md` atualizado**: Zig em F1-F4
- [ ] **`phase-X-overview.md` reescritos**: 4 arquivos (F1-F4)
- [ ] **`week-X.md` atualizados**: Semanas 7-44 (38 arquivos)
- [ ] **`mini-project-X.md` reescritos**: 3 arquivos (MP1-MP3)
- [ ] **Guias atualizados**: Exemplos Rust → Zig nos 9 guias
- [ ] **Agentes atualizados**: `@meta`, `@tutor` com contexto Zig

---

## 🚀 Primeiros Passos (Ordem de Execução)

### Fase Preparatória (Antes de Semana 7)

#### **1. Setup de Ambiente** (~2h)
```bash
# Instalar Zig (fixar versão)
curl -O https://ziglang.org/download/0.13.0/zig-linux-x86_64-0.13.0.tar.xz
tar -xf zig-linux-x86_64-0.13.0.tar.xz
export PATH=$PATH:$(pwd)/zig-linux-x86_64-0.13.0

# Verificar
zig version  # 0.13.0

# Instalar zls (language server)
# Seguir: https://github.com/zigtools/zls

# Configurar VSCode
# Instalar extensão: Zig Language
```

**Checklist**:
- [ ] `zig version` funciona
- [ ] `zig build` compila projeto de exemplo
- [ ] `zig test` roda testes
- [ ] zls funciona no editor (autocomplete, go-to-definition)

---

#### **2. Ziglings** (~4-6h)
```bash
git clone https://github.com/ratfactor/ziglings
cd ziglings
zig build

# Completar exercícios 1-30 (basics)
# Objetivo: familiarizar com syntax e error messages
```

**Checklist**:
- [ ] Exercícios 1-30 completados
- [ ] Entendimento de error messages do Zig
- [ ] Conforto com `zig build` workflow

---

#### **3. Criar Zig Cheat Sheet** (~2h)
- Usar template da seção "Zig Cheat Sheet" acima
- Preencher seção 1-3 (syntax, ponteiros, allocators básicos)
- Atualizar conforme aprende (documento vivo)

**Checklist**:
- [ ] Cheat sheet criado em `foundations-of-computing/resources/zig-cheat-sheet.md`
- [ ] Seções 1-3 preenchidas

---

### Fase de Migração de Docs (1-2 semanas)

#### **4. Atualizar Phase Overviews** (~4h)
Arquivos:
- `foundations-of-computing/meta/phase-1-overview.md`
- `foundations-of-computing/meta/phase-2-overview.md`
- `foundations-of-computing/meta/phase-3-overview.md`
- `foundations-of-computing/meta/phase-4-overview.md`

**Ações**:
- Substituir exemplos de código Rust → Zig
- Atualizar objetivos: ownership/lifetimes → allocators/comptime
- Ajustar recursos: Rust Book → Zig docs

---

#### **5. Atualizar Semanas Específicas** (~10-15h)
Arquivos: `foundations-of-computing/meta/week-7.md` até `week-44.md` (38 arquivos)

**Ações por arquivo**:
- Substituir código Rust → Zig
- Atualizar conceitos: lifetimes → allocators, traits → comptime
- Ajustar exercícios (syntax changes)
- Atualizar recursos (links para Zig docs)

**Estratégia**:
- Começar por semanas críticas: 7, 12, 25, 41-44
- Usar find/replace para mudanças sistemáticas
- Revisar manualmente cada arquivo (não confiar em replace cego)

---

#### **6. Atualizar Mini-Projetos** (~6h)
Arquivos:
- `foundations-of-computing/meta/mini-project-1.md`
- `foundations-of-computing/meta/mini-project-2.md`
- `foundations-of-computing/meta/mini-project-3.md`

**Ações**:
- Reescrever usando especificações revisadas (v2.0)
- Adicionar código de exemplo (Zig)
- Prototipar para validar viabilidade (recomendado)

---

#### **7. Atualizar Guias Gerais** (~4h)
Arquivos nos `guides/`:
- `2-GUIDE-FOCUS.md`
- `3-GUIDE-DIRECTNESS.md`
- `4-GUIDE-DRILL.md`
- `5-GUIDE-RETRIEVAL.md`
- `6-GUIDE-FEEDBACK.md`
- `7-GUIDE-FLASHCARDS.md`
- `8-GUIDE-FEYNMAN.md`
- `9-GUIDE-EXPERIMENTATION.md`
- `GUIDES-INDEX.md`

**Ações**:
- Trocar exemplos de código Rust → Zig (se houver)
- Atualizar contexto (ownership → allocators, lifetimes → comptime)
- Manter princípios (são agnósticos de linguagem)

---

#### **8. Atualizar Agentes** (~2h)
Arquivos:
- `.opencode/agents/meta.md`
- `.opencode/agents/tutor.md`

**Ações**:
- Adicionar contexto Zig (syntax, allocators, comptime)
- Atualizar exemplos de code review
- Adicionar common pitfalls de Zig

---

#### **9. Atualizar Learning Maps** (~2h)
Arquivos:
- `foundations-of-computing/meta/learning-map.md`
- `shared/master-learning-map.md`

**Ações**:
- Atualizar tecnologias: Rust → Zig (F1-F4)
- Ajustar dependências (se houver)
- Atualizar timeline (80 semanas)

---

### Validação Final (1 dia)

#### **10. Executar Checklist Completo**
- Rodar todos os checks da seção "Checklist de Validação"
- Corrigir problemas encontrados
- Documentar decisões (se algo mudou durante execução)

---

#### **11. Semana de Teste** (Opcional mas Recomendado)
- **Objetivo**: Validar plano antes de commitar 80 semanas
- **Ação**: Estudar Semana 7 conforme novo plano
- **Medir**:
  - Tempo real vs estimado
  - Dificuldade vs esperada
  - Qualidade dos recursos
- **Ajustar**: Se necessário, revisar timeline/escopo

**Checklist**:
- [ ] Semana 7 completada seguindo plano novo
- [ ] Tempo <= 5-6h (meta de 1h/dia)
- [ ] Conceitos compreendidos (não apenas decorados)
- [ ] Exercícios funcionam (compilam e testam)

---

## 📋 Atualizações de Documentação (Quando Aplicar)

### Principais Arquivos a Revisar

**Meta/Learning Maps**:
- `foundations-of-computing/meta/learning-map.md`
- `shared/master-learning-map.md`

**Phase Overviews**:
- `foundations-of-computing/meta/phase-1-overview.md`
- `foundations-of-computing/meta/phase-2-overview.md`
- `foundations-of-computing/meta/phase-3-overview.md`
- `foundations-of-computing/meta/phase-4-overview.md`

**Semanas** (38 arquivos):
- `foundations-of-computing/meta/week-7.md` até `week-44.md`

**Mini-Projetos**:
- `foundations-of-computing/meta/mini-project-1.md`
- `foundations-of-computing/meta/mini-project-2.md`
- `foundations-of-computing/meta/mini-project-3.md`

**Guias Gerais** (9 arquivos):
- `guides/2-GUIDE-FOCUS.md`
- `guides/3-GUIDE-DIRECTNESS.md`
- `guides/4-GUIDE-DRILL.md`
- `guides/5-GUIDE-RETRIEVAL.md`
- `guides/6-GUIDE-FEEDBACK.md`
- `guides/7-GUIDE-FLASHCARDS.md`
- `guides/8-GUIDE-FEYNMAN.md`
- `guides/9-GUIDE-EXPERIMENTATION.md`
- `guides/GUIDES-INDEX.md`

**Agentes**:
- `.opencode/agents/tutor.md`
- `.opencode/agents/meta.md`

**Conexões**:
- `projects/foundations-of-computing/01-math-foundations/README.md` (se mencionar F1)

### Definição de "Remover Referências a Rust"

**O que trocar**:
- ✅ Blocos de código: ` ```rust` → ` ```zig`
- ✅ Exemplos: `let x = 5;` → `const x: i32 = 5;`
- ✅ Conceitos: ownership/lifetimes → allocators/comptime
- ✅ Objetivos: "Dominar borrow checker" → "Dominar allocator interface"
- ✅ Recursos: Rust Book/Rustlings → Zig docs/Ziglings
- ✅ Benchmarks: "Explicar lifetimes" → "Explicar allocators"

**O que manter**:
- ⚠️ Referências históricas (opcional): "Anteriormente usávamos Rust, agora Zig porque..."
- ⚠️ Seção comparativa (se útil): "Zig vs Rust: trade-offs" (em appendix)

**Regra geral**: Se estudante ver termo "Rust" em F1-F4, deve ser intencional (comparação educacional), não esquecimento de migração.

---

## 📊 Esforço Estimado de Migração

| Tarefa | Tempo Estimado |
|--------|----------------|
| Setup de ambiente (Zig + zls) | 2h |
| Ziglings (exercícios 1-30) | 4-6h |
| Criar Cheat Sheet inicial | 2h |
| Atualizar Phase Overviews (4 arquivos) | 4h |
| Atualizar Semanas (38 arquivos) | 10-15h |
| Atualizar Mini-Projetos (3 arquivos) | 6h |
| Atualizar Guias (9 arquivos) | 4h |
| Atualizar Agentes (2 arquivos) | 2h |
| Atualizar Learning Maps (2 arquivos) | 2h |
| Validação completa (checklist) | 2-4h |
| Semana de teste (opcional) | 5-6h |
| **TOTAL** | **43-53h** |

**Recomendação**: Distribuir ao longo de 1-2 semanas (não fazer tudo de uma vez).

---

## 🎯 Aprovação e Próximos Passos

### Status deste Plano

- ✅ **Revisado e completo** (v2.0)
- ⚠️ **Não aplicado** (decisão do usuário)
- 📋 **Pronto para execução** (se aprovado)

### Para Aplicar este Plano

1. **Decisão**: Confirmar migração Rust → Zig
2. **Preparação**: Executar "Fase Preparatória" (Setup + Ziglings)
3. **Migração**: Seguir "Fase de Migração de Docs" (1-2 semanas)
4. **Validação**: Executar "Checklist Completo"
5. **Teste**: (Recomendado) Semana 7 piloto
6. **Commit**: Se teste passar, commitar mudanças

### Se Houver Dúvidas

- Prototipar mini-projetos antes (validar viabilidade)
- Testar semana 7 antes de migrar tudo
- Consultar comunidade Zig (Discord)
- Iterar sobre este plano conforme necessário

---

## 📝 Controle de Versões

| Versão | Data | Mudanças Principais |
|--------|------|---------------------|
| v1.0 | 2026-02-20 | Plano inicial (não revisado) |
| v2.0 | 2026-02-23 | Revisão completa: MP1/MP2 simplificados, F4 detalhada, análise de risco, checklist expandido |

---

**Fim do Plano v2.0** 🎉
