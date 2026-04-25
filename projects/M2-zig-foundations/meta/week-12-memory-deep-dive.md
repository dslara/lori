# Semana 12: Memory Deep Dive

## Objetivo
Ao final desta semana, você será capaz de:
- Calcular o tamanho e alignment de qualquer tipo Zig
- Prever o layout de memória de structs (incluindo padding)
- Entender por que layout importa para performance de data structures
- Explicar cache lines e como afetam DS iterativos

---

## Perguntas Guia

### Tipos e Tamanhos
1. Qual o tamanho de `u8`, `u16`, `u32`, `u64`, `u128`?
2. Qual o tamanho de `f32`, `f64`?
3. Qual o tamanho de um ponteiro em sistema 64-bit? E em 32-bit?
4. O que é `usize` e qual o seu tamanho?
5. Como você obtém o tamanho de um tipo em Zig? (`@sizeOf`)
6. Como você obtém o alignment de um tipo? (`@alignOf`)

### Alignment e Padding
7. O que é "alignment" de um tipo?
8. Por que CPUs têm requisitos de alignment?
9. Dado um struct `{ a: u8, b: u32, c: u16 }`, qual o tamanho?
   - Pista: considere padding
10. Como você pode reduzir padding em um struct? (reordenação de campos)
11. O que é `@offsetOf(Type, "field")`?
12. O que `packed struct` faz? Quais são os trade-offs?

### Stack vs Heap
13. Quais tipos vivem no stack por padrão?
14. Quando algo **precisa** ir para o heap?
15. Qual o limite típico de tamanho do stack? (8MB em muitos OS)
16. O que é "stack overflow"? Como Zig detecta?

### Cache e Performance
17. O que é uma cache line? (64 bytes típico em x86)
18. O que é "cache hit" vs "cache miss"?
19. Por que iterar sobre `[]T` é mais rápido que iterar sobre `[]*T`?
20. O que é "false sharing"? Quando acontece em multi-thread?
21. Por que `ArrayList` (array contíguo) é mais rápido que linked list para iteração?

---

## Recursos

### Tier 1 (obrigatório esta semana)
| Recurso | Seção | Ação |
|---------|-------|------|
| Zig Documentation | `@sizeOf`, `@alignOf`, `@offsetOf`, packed struct | Ler |
| Zig by Example | Memory layout | Ler + testar |
| Blog: "Data-Oriented Design" | Qualquer artigo introdutório | Ler 1 artigo |

### Tier 2 (referência)
| Recurso | Quando usar |
|---------|-------------|
| godbolt.org | Ver assembly gerado, verificar padding real |
| CPU-Z ou `sysctl hw.cachelinesize` | Ver cache line size real da sua máquina |

---

## Entregas por Dia

### Dia 1: Tamanhos e Alignment
- [ ] Ler Zig docs: `@sizeOf`, `@alignOf`
- [ ] Responder perguntas 1-6
- [ ] Criar programa que imprime `@sizeOf` e `@alignOf` de 10+ tipos
- [ ] Verificar: `@sizeOf([]u8)` — por que é 16? (fat pointer: ptr + len)

### Dia 2: Struct Layout e Padding
- [ ] Responder perguntas 7-12
- [ ] Criar 5 structs diferentes e prever o tamanho antes de verificar com `@sizeOf`
- [ ] Para cada um, identificar onde há padding
- [ ] Reordenar campos para minimizar padding e verificar melhora
- [ ] Usar `@offsetOf` para ver exatamente onde cada campo está

### Dia 3: Stack vs Heap em Profundidade
- [ ] Responder perguntas 13-16
- [ ] Criar programa que deliberadamente causa stack overflow (com cuidado)
- [ ] Verificar: qual o maior array que cabe no stack no seu sistema?
- [ ] Criar função recursiva e medir profundidade antes de overflow

### Dia 4: Cache Lines e Performance
- [ ] Responder perguntas 17-21
- [ ] Implementar dois benchmarks simples:
  - Iterar `[]Point` (x, y contíguos)
  - Iterar `[]*Point` (ponteiros para heap, cache miss)
- [ ] Medir diferença de tempo com `std.time.Timer`
- [ ] Desenhar: como os dados estão distribuídos em memória em cada caso?

### Dia 5: Consolidação
- [ ] Criar tabela de referência: tipo → size → align → notas
- [ ] Escrever em 3 parágrafos: por que layout de memória importa para DS?
- [ ] Verificar: quais DS da Fase 2 serão arrays contíguos? Quais usarão ponteiros?
- [ ] Cards SRS para fórmulas e conceitos de alignment

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Calcular tamanho de qualquer struct com padding sem usar `@sizeOf`
2. [ ] Explicar por que array de structs é melhor que array de ponteiros para cache
3. [ ] Reordenar struct para minimizar padding
4. [ ] Prever se código vai causar stack overflow antes de rodar
5. [ ] Explicar o que "false sharing" é e quando pode ser problema

### Red flags (precisa revisar):
- Não sabe o que alignment significa
- Não entende por que padding existe
- Não consegue conectar cache lines com escolha de DS

---

## Referência Rápida: Tamanhos Típicos (x86-64)

| Tipo | Size | Align |
|------|------|-------|
| `u8` / `i8` | 1 | 1 |
| `u16` / `i16` | 2 | 2 |
| `u32` / `i32` / `f32` | 4 | 4 |
| `u64` / `i64` / `f64` | 8 | 8 |
| `usize` / `isize` | 8 | 8 |
| `*T` (ponteiro) | 8 | 8 |
| `[]T` (slice) | 16 | 8 |
| `?T` | size(T) + 1 (ou mais) | align(T) |
| `bool` | 1 | 1 |

### Regra de Padding
```
struct { a: u8, b: u32 }
// Layout:  [a: 1 byte][padding: 3 bytes][b: 4 bytes] = 8 bytes total
// Reordenado para otimizar:
struct { b: u32, a: u8 }
// Layout:  [b: 4 bytes][a: 1 byte][padding: 3 bytes] = 8 bytes total
// Mesmo neste caso. Mas com mais campos a diferença fica maior.
```

---

## Cards SRS (criar você mesmo)
- Como calcular tamanho de struct com padding (regra: cada campo alinhado ao seu align)
- O que `@sizeOf([]T)` retorna e por quê (fat pointer = 16 bytes)
- O que é uma cache line (64 bytes) e por que importa para DS
- Diferença de performance: `[]T` contíguo vs `[]*T` com pointer indirection
- O que `packed struct` faz (sem padding, mas sem garantias de align)

---

## Reflexão (preencher ao final)

### Como o conhecimento de layout de memória vai mudar como você implementa DS na Fase 2?
_Escreva_

### Em quais DS a localidade de cache é mais importante?
_Escreva_

### Confiança (1-5):
- Sizes e alignment: _/5
- Padding e layout: _/5
- Cache e performance: _/5

---

## Próximo

**Semana 13**: Allocators + ArrayList
- Como a interface `Allocator` funciona?
- Quando usar `ArenaAllocator` vs `GeneralPurposeAllocator`?
- Como implementar `MyArrayList(T)` do zero?
