# Semana 11: Structs, Enums, Unions + Testes

## Objetivo
Ao final desta semana, você será capaz de:
- Criar structs com métodos e constructors idiomáticos em Zig
- Usar enums com e sem payloads
- Usar tagged unions (`union(enum)`) como alternativa a polimorfismo
- Escrever testes unitários inline com `zig test`

---

## Perguntas Guia

### Structs
1. Como você define um struct com métodos em Zig?
2. O que é `@This()` e por que é usado em métodos?
3. Qual a diferença entre método que recebe `Self` vs `*Self`?
4. O que é um "constructor" idiomático em Zig? (`init` / `deinit` pattern)
5. Structs em Zig são value types ou reference types?
6. O que são "anonymous structs" (tuple-structs) em Zig?

### Enums
7. Como você define um enum básico em Zig?
8. Zig enums podem ter métodos? Como?
9. O que é `@intFromEnum` e `@enumFromInt`?
10. Como `switch` sobre enum funciona em Zig? O que acontece com casos não tratados?

### Unions
11. O que é um `union` em Zig?
12. O que é um `union(enum)` (tagged union)?
13. Como você acessa o valor de um tagged union com `switch`?
14. Quando usar tagged union vs struct com optional fields?

### Testes
15. Como escrever um teste inline em Zig? (`test "nome" {}`)
16. O que `std.testing.expectEqual` faz?
17. Como rodar apenas um teste específico? (`zig test --test-filter`)
18. O que acontece quando um teste falha?
19. Como testar função que retorna `!T`? (usando `try` dentro do teste)

---

## Recursos

### Tier 1 (obrigatório esta semana)
| Recurso | Seção | Ação |
|---------|-------|------|
| Zig Documentation | Structs, Enums, Unions, Testing | Ler completamente |
| Zig by Example | Structs, Enums, Unions | Ler + testar |
| Ziglings | Exercícios sobre structs e enums | Completar |

### Tier 2 (referência)
| Recurso | Quando usar |
|---------|-------------|
| Zig stdlib: `std/testing.zig` | Ver todos os helpers de teste disponíveis |
| Zig stdlib: `std/math.zig` | Ver exemplo de enums e tagged unions reais |

---

## Entregas por Dia

### Dia 1: Structs e Métodos
- [ ] Ler Zig docs: Structs
- [ ] Responder perguntas 1-3
- [ ] Implementar struct `Point` com:
  - campos `x`, `y: f64`
  - método `distance(self, other: Point) f64`
  - método `scale(self: *Point, factor: f64) void`
- [ ] Implementar struct `Rectangle` com `init`, `area`, `perimeter`

### Dia 2: Constructors e Lifecycle
- [ ] Responder perguntas 4-6
- [ ] Criar struct `Buffer` com `init(allocator)`, `deinit()`, `append()`
- [ ] Verificar: o que acontece se você não chama `deinit`?
- [ ] Criar exemplo com anonymous struct (inline struct literal)

### Dia 3: Enums
- [ ] Ler Zig docs: Enums
- [ ] Responder perguntas 7-10
- [ ] Implementar enum `Direction` com método `opposite()`
- [ ] Implementar enum `Color` com valor inteiro associado
- [ ] Usar `switch` com enum e verificar que todos os casos são cobertos

### Dia 4: Tagged Unions
- [ ] Ler Zig docs: Unions
- [ ] Responder perguntas 11-14
- [ ] Implementar `union(enum) Value { int: i64, float: f64, bool: bool, str: []const u8 }`
- [ ] Escrever função `printValue(v: Value) void` usando `switch`
- [ ] Verificar: o que acontece se você acessa campo errado em union?

### Dia 5: Testes
- [ ] Ler Zig docs: Testing
- [ ] Responder perguntas 15-19
- [ ] Adicionar 5+ testes inline ao `Point` e `Rectangle` do dia 1
- [ ] Adicionar testes para `Value` union
- [ ] Rodar: `zig test src/main.zig`
- [ ] Criar testes que verificam casos de erro (usando `try std.testing.expectError`)

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar struct com `init`/`deinit` pattern sem consultar
2. [ ] Usar tagged union em vez de `if/else` com type-checking manual
3. [ ] Escrever 5 testes que cobrem casos normais e de erro
4. [ ] Explicar diferença entre `switch` em Zig vs outras linguagens (exhaustive)
5. [ ] Criar enum com métodos

### Red flags (precisa revisar):
- Não entende diferença método `Self` vs `*Self`
- Cria structs sem `init`/`deinit` quando tem recursos alocados
- Não escreve testes por achar desnecessário nesta fase

---

## Conceitos em Código

```zig
const std = @import("std");

// Tagged union: sum type
const Shape = union(enum) {
    circle: f64,       // radius
    rectangle: struct { w: f64, h: f64 },
    triangle: struct { base: f64, height: f64 },

    pub fn area(self: Shape) f64 {
        return switch (self) {
            .circle => |r| std.math.pi * r * r,
            .rectangle => |rect| rect.w * rect.h,
            .triangle => |t| 0.5 * t.base * t.height,
        };
    }
};

// Struct com métodos e constructors
const Counter = struct {
    count: u32,

    pub fn init() Counter {
        return .{ .count = 0 };
    }

    pub fn increment(self: *Counter) void {
        self.count += 1;
    }

    pub fn get(self: Counter) u32 {
        return self.count;
    }
};

// Testes inline
test "Counter starts at zero" {
    const c = Counter.init();
    try std.testing.expectEqual(@as(u32, 0), c.get());
}

test "Counter increments" {
    var c = Counter.init();
    c.increment();
    c.increment();
    try std.testing.expectEqual(@as(u32, 2), c.get());
}

test "Shape area" {
    const c = Shape{ .circle = 1.0 };
    try std.testing.expectApproxEqAbs(@as(f64, std.math.pi), c.area(), 0.001);
}
```

---

## Cards SRS (criar você mesmo)
- Como declarar método em struct Zig: `pub fn name(self: Self)`
- Diferença `Self` vs `*Self` em método (read-only vs mutável)
- O que `union(enum)` é e como difere de `union` simples
- Como `switch` sobre enum em Zig é exhaustive (compile-time check)
- Como escrever teste inline: `test "desc" { try std.testing.expectEqual(...) }`

---

## Reflexão (preencher ao final)

### Como tagged unions resolvem problemas que você normalmente resolveria com herança/polimorfismo?
_Escreva_

### Qual a vantagem de switch exhaustivo sobre if/else?
_Escreva_

### Confiança (1-5):
- Structs e métodos: _/5
- Enums e unions: _/5
- Testes: _/5

---

## Próximo

**Semana 12**: Memory Deep Dive
- Qual o tamanho e alignment de cada tipo?
- Como o compilador faz padding em structs?
- Por que layout de memória importa para performance de DS?
