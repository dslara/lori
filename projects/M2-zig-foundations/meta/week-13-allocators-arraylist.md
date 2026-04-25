# Semana 13: Allocators + ArrayList

## Objetivo
Ao final desta semana, você será capaz de:
- Usar a interface `std.mem.Allocator` corretamente
- Escolher o allocator certo para cada situação
- Implementar `MyArrayList(T)` do zero com crescimento amortizado
- Detectar e eliminar memory leaks com `GeneralPurposeAllocator`

---

## Perguntas Guia

### Interface Allocator
1. O que é a interface `std.mem.Allocator` em Zig?
2. Quais são os 3 métodos principais do Allocator? (`alloc`, `free`, `realloc`)
3. Por que Zig passa `allocator` como parâmetro em vez de ter um global?
4. O que `allocator.alloc(T, n)` retorna? (`![]T`)
5. O que `allocator.free(slice)` faz?
6. O que `allocator.realloc(old_slice, new_n)` faz?

### Tipos de Allocator
7. O que é `std.heap.GeneralPurposeAllocator`? Quando usar?
8. O que é `std.heap.ArenaAllocator`? Como funciona `arena.deinit()`?
9. O que é `std.heap.page_allocator`?
10. O que é `std.heap.FixedBufferAllocator`? Quando usar?
11. Quando você usaria Arena vs GPA?
12. O que `GeneralPurposeAllocator.detectLeaks()` faz?

### ArrayList
13. O que é uma ArrayList (dynamic array)?
14. Qual a diferença entre `len` (comprimento) e `capacity` (capacidade)?
15. O que acontece quando você `append` além da capacity?
16. Por que dobrar a capacidade (grow by 2x) é O(1) amortizado?
17. Qual a complexidade de `append`? De `get`? De `delete` no meio?
18. Como `std.ArrayList(T)` funciona internamente?

### Implementação
19. Quais campos um `MyArrayList(T)` precisa?
20. Como implementar `push` com realloc?
21. Como implementar `pop`?
22. Como garantir que não há leak mesmo se `push` falhar no meio?

---

## Recursos

### Tier 1 (obrigatório esta semana)
| Recurso | Seção | Ação |
|---------|-------|------|
| Zig Documentation | Allocators, Memory | Ler completamente |
| Zig stdlib source | `std/array_list.zig` | Ler implementação real |
| Zig by Example | Memory allocation | Ler + testar |

### Tier 2 (referência)
| Recurso | Quando usar |
|---------|-------------|
| Zig stdlib: `std/heap.zig` | Ver todos os allocators disponíveis |
| Zig stdlib: `std/mem.zig` | Ver helpers de memória |

---

## Entregas por Dia

### Dia 1: Interface Allocator
- [ ] Ler Zig docs: Memory
- [ ] Responder perguntas 1-6
- [ ] Escrever 3 programas usando `alloc`/`free` com `defer`
- [ ] Verificar: `zig run` com GPA detecta leak se você esquecer `free`?

### Dia 2: Tipos de Allocator
- [ ] Responder perguntas 7-12
- [ ] Criar programa que usa `ArenaAllocator` para processar dados e libera tudo de uma vez
- [ ] Criar programa que propositalmente vaza memória e ver GPA detectar
- [ ] Criar `FixedBufferAllocator` a partir de buffer no stack

### Dia 3: ArrayList da stdlib
- [ ] Responder perguntas 13-18
- [ ] Ler `std/array_list.zig` na stdlib: onde está o `realloc`?
- [ ] Usar `std.ArrayList(i32)`: append, get, delete, iterate
- [ ] Imprimir `len` e `capacity` antes e depois de vários appends
- [ ] Verificar: em que pontos a capacity dobra?

### Dia 4: Implementar MyArrayList(T)
- [ ] Responder perguntas 19-22
- [ ] Implementar `MyArrayList(T)` com:
  - `init(allocator: std.mem.Allocator) MyArrayList(T)`
  - `deinit(self: *Self) void`
  - `push(self: *Self, item: T) !void` — cresce por 2x quando cheio
  - `pop(self: *Self) ?T`
  - `get(self: Self, index: usize) T`
  - `len(self: Self) usize`
- [ ] Capacity inicial: 4; capacity máxima: dobra a cada overflow

### Dia 5: Testes + Checkpoint de Fase
- [ ] Escrever 8+ testes para `MyArrayList(T)`:
  - push até overflow (verifica que capacity dobra)
  - pop em lista vazia (retorna null)
  - get fora dos limites (panic em modo debug)
  - sem leaks (GPA.detectLeaks())
  - funciona com `i32`, `f64`, `[]const u8`
- [ ] Rodar: `zig test src/main.zig`
- [ ] Todos os testes passando?
- [ ] Preencher checkpoint F1 em `phase-1-overview.md`

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] `MyArrayList(T)` com push/pop/get/len passando 8+ testes
2. [ ] GPA não detecta leaks em nenhum teste
3. [ ] Explicar por que amortizado O(1) funciona para push (com cálculo)
4. [ ] Escolher allocator correto: GPA vs Arena vs FixedBuffer — com justificativa
5. [ ] Explicar por que Zig passa allocator como parâmetro em vez de usar global

### Red flags (precisa revisar):
- Usa `std.ArrayList` diretamente sem entender internamente
- Não testa casos de overflow de capacity
- Não sabe a diferença entre GPA e Arena
- Há memory leaks detectados pelo GPA

---

## Implementação Guia

```zig
const std = @import("std");

pub fn MyArrayList(comptime T: type) type {
    return struct {
        items: []T,
        capacity: usize,
        allocator: std.mem.Allocator,

        const Self = @This();
        const INITIAL_CAPACITY = 4;

        pub fn init(allocator: std.mem.Allocator) Self {
            return Self{
                .items = &[_]T{},
                .capacity = 0,
                .allocator = allocator,
            };
        }

        pub fn deinit(self: *Self) void {
            if (self.capacity > 0) {
                self.allocator.free(self.items.ptr[0..self.capacity]);
            }
            self.* = undefined;
        }

        pub fn push(self: *Self, item: T) !void {
            if (self.items.len == self.capacity) {
                const new_cap = if (self.capacity == 0) INITIAL_CAPACITY else self.capacity * 2;
                // realloc ou alloc + copy
                const new_mem = try self.allocator.realloc(
                    self.items.ptr[0..self.capacity],
                    new_cap,
                );
                self.items = new_mem[0..self.items.len];
                self.capacity = new_cap;
            }
            self.items.ptr[self.items.len] = item;
            self.items = self.items.ptr[0 .. self.items.len + 1];
        }

        pub fn pop(self: *Self) ?T {
            if (self.items.len == 0) return null;
            const item = self.items[self.items.len - 1];
            self.items = self.items[0 .. self.items.len - 1];
            return item;
        }

        pub fn get(self: Self, index: usize) T {
            return self.items[index]; // panic se out of bounds (debug mode)
        }

        pub fn len(self: Self) usize {
            return self.items.len;
        }
    };
}

test "MyArrayList basic" {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();

    var list = MyArrayList(i32).init(gpa.allocator());
    defer list.deinit();

    try list.push(1);
    try list.push(2);
    try list.push(3);

    try std.testing.expectEqual(@as(usize, 3), list.len());
    try std.testing.expectEqual(@as(i32, 2), list.get(1));
    try std.testing.expectEqual(@as(?i32, 3), list.pop());
    try std.testing.expectEqual(@as(usize, 2), list.len());
}
```

---

## Cards SRS (criar você mesmo)
- O que `std.mem.Allocator` é (interface, não implementação concreta)
- Diferença GPA vs ArenaAllocator (detecta leaks vs libera tudo de uma vez)
- Por que push em ArrayList é O(1) amortizado (análise de custo amortizado)
- Campos necessários em MyArrayList: `items []T`, `capacity usize`, `allocator`
- Como `errdefer allocator.free(...)` protege contra leaks em caso de erro

---

## Reflexão (preencher ao final)

### O que é diferente sobre alocar memória explicitamente vs linguagens com GC?
_Escreva_

### Qual foi a parte mais difícil de implementar MyArrayList?
_Escreva_

### Confiança (1-5):
- Interface Allocator: _/5
- Escolha de allocator: _/5
- MyArrayList implementado: _/5

---

## Checkpoint Fase 1

**Preencha antes de seguir para Semana 14 (Decision Point):**

- [ ] MyArrayList com 8+ testes passando sem leaks
- [ ] Cards SRS criados: mínimo 25
- [ ] Cheat sheet pessoal: tipos, ponteiros, optionals, errors, comptime, allocators
- [ ] Satisfação com Zig: _/10

**Critério para continuar:**
- Satisfação ≥6/10
- Entregas ≥5/6 semanas completas

---

## Semana 14: Decision Point + Mini-Projeto 1

**Semana 14** é para:
1. Avaliação honesta da Fase 1
2. Mini-Projeto 1: Arena Allocator (ver `mini-project-1-arena-allocator.md`)
3. Decisão formal: Continuar Zig ou rollback para Rust?

**Próximo (Fase 2):**

**Semana 15**: Buffer entre F1 e F2
**Semana 16**: Fase 2 começa — Arrays e ArrayList em profundidade
