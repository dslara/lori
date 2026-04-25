# Mini-Projeto 1: Arena Allocator

## Quando
**Semana 14** (após Fase 1: Zig Foundations, antes do Decision Point formal)

## Objetivo
Aplicar allocators, comptime, e structs de Zig em um projeto real que você entende internamente.

---

## Pergunta Central
> Como um arena allocator decide onde colocar dados e como liberar tudo de uma vez eficientemente?

---

## Contexto

Você já usou `std.heap.ArenaAllocator` na Fase 1. Agora vai implementar o seu do zero.

**Por que Arena Allocator?**
- Uso real: parsers, compiladores, request-per-connection servers
- Exercita: allocator interface, ponteiros, alinhamento, comptime
- Tamanho ideal: 5 horas, resultado tangível e útil

---

## Escopo (5 horas)

### Requisitos Mínimos
- [ ] Struct `MyArenaAllocator` com buffer interno (ex: 64KB)
- [ ] Implementa a interface `std.mem.Allocator` (vtable)
- [ ] `alloc(n, alignment) ![]u8` — bump pointer com alignment
- [ ] `free(...)` — no-op (arena libera tudo junto)
- [ ] `reset()` — volta o bump pointer ao início
- [ ] `deinit()` — libera o buffer principal
- [ ] Testes: 5+ testes sem leaks (GPA externo para verificar)

### Stretch Goals (apenas se sobrar tempo)
- [ ] Múltiplos segmentos: quando buffer esgota, aloca novo segmento
- [ ] Método `checkpoint()` / `restore()` — liberar até um ponto
- [ ] Benchmark: arena vs GPA para 10000 alocações pequenas

---

## Recursos

| Recurso | Seção | Propósito |
|---------|-------|-----------|
| Zig stdlib source | `std/heap/arena_allocator.zig` | Referência (mas implemente antes de ver!) |
| Zig Documentation | `std.mem.Allocator` interface | Como criar allocator customizado |
| Zig stdlib source | `std/mem.zig` | Entender alignment |

---

## Entregas por Dia

**Dia 1**: Design
- [ ] Estudar: como bump allocator funciona? Desenhar em papel
- [ ] Responder: como garantir alignment? (arredondar ptr para múltiplo de align)
- [ ] Esboçar struct e assinaturas em Zig
- [ ] Criar projeto: `zig init` em `arena-allocator/`

**Dia 2**: Implementação Core
- [ ] Implementar `MyArenaAllocator` com buffer fixo `[65536]u8`
- [ ] Implementar `alloc` com bump pointer + alignment
- [ ] Implementar `reset()` e `deinit()`
- [ ] Primeiros 3 testes passando

**Dia 3**: Interface Zig
- [ ] Fazer `MyArenaAllocator` implementar a vtable `std.mem.Allocator`
- [ ] Usar com código existente: `std.ArrayList(i32).init(my_arena.allocator())`
- [ ] Verificar: funciona como drop-in replacement para GPA?

**Dia 4**: Testes e Edge Cases
- [ ] Testar: alignment correto para `u64` (must be 8-byte aligned)
- [ ] Testar: buffer full retorna `error.OutOfMemory`
- [ ] Testar: reset e reusar o mesmo arena
- [ ] Stretch goal se houver tempo

**Dia 5**: Reflexão
- [ ] Comparar: sua implementação vs `std.heap.ArenaAllocator` — o que é diferente?
- [ ] Escrever 3 parágrafos respondendo a pergunta central
- [ ] Criar 5 SRS cards sobre o aprendizado
- [ ] Preencher seção de reflexão abaixo

---

## Critérios de Sucesso

### Você completou se:
1. [ ] Arena funciona como `std.mem.Allocator` (aceito por `ArrayList`, etc.)
2. [ ] Alignment correto para todos os tipos padrão
3. [ ] `reset()` reutiliza o mesmo buffer (sem re-alocação)
4. [ ] 5+ testes passando, incluindo edge cases
5. [ ] Consegue explicar bump pointer e alignment em 2 minutos

### Conexões com Fase 1:
- Allocator interface: o que você usou em toda F1 agora implementado
- Comptime: `alloc` usa `comptime` para alignment? (opcional)
- Ponteiros: o bump pointer é um `[*]u8` — aritmética de ponteiro em ação
- `@alignOf` e `@sizeOf` aplicados na prática

### Decision Point (Semana 14)
Após o projeto:
- Satisfação com Zig (1-10): _/10
- Entregas F1 completas: _/6 semanas
- Decisão: [ ] Continuar Zig | [ ] Rollback para Rust

---

## Reflexão

### Como alignment funciona na prática?
_Escreva_

### O que um arena allocator ganha que GPA não tem?
_Escreva_

### O que foi mais difícil?
_Escreva_

### O que faria diferente?
_Escreva_

---

## Próximo
**Semana 15**: Buffer F1→F2
**Semana 16**: Fase 2 começa — Arrays & ArrayList
