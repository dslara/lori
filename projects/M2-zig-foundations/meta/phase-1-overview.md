# ⚡ Fase 1: Zig Foundations + Comptime (Meses 2-4)

> **Semanas reais no timeline**: 8-16 (após F0 + Buffer 1 + Zig Setup)
> **Arquivos**: `week-08-zig-basics-memory.md` até `week-16-mini-project-1-arena-allocator.md`

## 📋 Visão Geral

**Duração**: 10 semanas (~50 horas) + mini-projeto
**Objetivo**: Dominar memória explícita em Zig o suficiente para implementar DS do zero com confiança

---

## 🎯 Pergunta Central

> Como Zig gerencia memória de forma explícita e transparente?

Esta é a pergunta que você deve ser capaz de responder completamente ao final desta fase. Não apenas "tem allocators", mas uma explicação profunda de como alocação funciona, onde cada byte vive, e como prevenir bugs de memória.

---

## 📅 Semanas

| Semana | Tema | Arquivo | Status |
|--------|------|---------|--------|
| 8 | Zig basics + memória | `week-08-zig-basics-memory.md` | [ ] |
| 9 | Ponteiros + Optionals | `week-09-pointers-optionals.md` | [ ] |
| 10 | Error handling | `week-10-error-handling.md` | [ ] |
| 11 | Structs/Enums/Unions + testes | `week-11-structs-enums-tests.md` | [ ] |
| 12 | Memory deep dive | `week-12-memory-deep-dive.md` | [ ] |
| 13 | Allocators + ArrayList | `week-13-allocators-arraylist.md` | [ ] |
| 14 | Comptime Patterns | `week-14-comptime-patterns.md` | [ ] |
| 15 | Comptime Code Gen | `week-15-comptime-codegen.md` | [ ] |
| 16 | Mini-Projeto 1 | `mini-project-1-arena-allocator.md` | [ ] |

---

## 🧠 Conceitos-Chave

### Memória Básica
- Stack vs heap: onde cada tipo vive
- `defer` para cleanup automático
- Slices: ponteiro + comprimento
- Strings em Zig (`[]const u8`)

### Ponteiros
- `*T` — ponteiro simples
- `*const T` — ponteiro para valor imutável
- `?T` — optional (null safety)
- `?*T` — optional pointer
- Aliasing e invariantes

### Error Handling
- `error{}` — enum de erros
- `!T` — union de T e error
- `try` — propaga erro
- `catch` — captura erro
- `errdefer` — defer que só roda em erro

### Tipos Compostos
- `struct` — agregação de campos
- `enum` — valores discretos
- `union` — tagged union
- Testes unitários inline (`test "nome" {}`)

### Memória Profunda
- Size, alignment, padding
- Layout previsível de structs
- Cache lines e prefetch
- Por que layout importa em DS

### Allocators
- Allocator interface (`std.mem.Allocator`)
- `std.heap.GeneralPurposeAllocator` — detecta leaks
- `std.heap.ArenaAllocator` — libera tudo de uma vez
- Crescimento amortizado de ArrayList
- `MyArrayList(T)` do zero

### Comptime
- `comptime T: type` e `@TypeOf`
- `@typeInfo` e geração de código simples
- `@compileError` para validação

---

## ✅ Benchmark da Fase

### Teste Oral (sem consulta)
Você dominou se consegue:

1. **Explicar** fluxo de alocação e liberação em DS simples
2. **Prever** 3 bugs comuns: dangling pointer, double free, leak
3. **Escolher** allocator correto: quando arena vs GPA?
4. **Implementar** `MyArrayList(T)` com push/pop/get do zero
5. **Explicar** por que `defer allocator.free(slice)` é idiomático em Zig

### Projeto Final da Fase
Implementar `MyArrayList(T)` funcional com:
- `init(allocator)`, `deinit()`, `push()`, `pop()`, `get()`, `len()`
- Crescimento automático (capacidade dobra)
- Sem memory leaks (`defer` ou `errdefer` corretos)
- 5+ testes passando com `zig test`

---

## 📚 Recursos Principais

| Recurso | Uso | Tier |
|---------|-----|------|
| Zig Documentation | Referência oficial | 1 |
| Ziglings (exercícios 40+) | Prática progressiva | 1 |
| Zig by Example | Exemplos pontuais | 1 |
| Zig stdlib source (std/array_list.zig) | Ver implementação real | 2 |
| Learn Zig (learn.ziglang.org) | Tutorial interativo | 2 |

---

## 🔗 Conexões

### Pré-requisitos
- Zig Setup (Semana 7): ambiente funcionando, 30+ Ziglings
- Fase 0 (Math): notação para análise
- Programação básica em qualquer linguagem

### Prepara para
- Fase 2 (Data Structures): implementar DS do zero com allocators
- Fase 3 (Algorithms): entender custo de operações de memória
- Fase 3 (Algorithms + DP): conexões com abstrações e análise

---

## 📊 Tracking

- [ ] Semana 8 completa (Zig basics + memória)
- [ ] Semana 9 completa (Ponteiros + Optionals)
- [ ] Semana 10 completa (Error handling)
- [ ] Semana 11 completa (Structs/Enums + testes)
- [ ] Semana 12 completa (Memory deep dive)
- [ ] Semana 13 completa (Allocators + ArrayList)
- [ ] Semana 14 completa (Comptime Patterns)
- [ ] Semana 15 completa (Comptime Code Gen)
- [ ] Semana 16 completa (Mini-Projeto 1)
- [ ] MyArrayList(T) com 5+ testes passando
- [ ] Cards SRS criados (mínimo 25)

**Checkpoint (Semana 16 fim)**:
- Satisfação com Zig: _/10 (≥6 para continuar)
- Entregas completadas: _/8 semanas (≥85% = 7+)
- Decisão: [ ] Continuar Zig | [ ] Rollback para Rust

**Confiança geral**: _/5

---

*"Em Zig, nada acontece por baixo dos panos. Se você não pediu, não aconteceu."*
