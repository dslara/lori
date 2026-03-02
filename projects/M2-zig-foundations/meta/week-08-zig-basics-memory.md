# Semana 8: Zig Basics + Memória

## Objetivo
Ao final desta semana, você será capaz de:
- Escrever programas Zig básicos com tipos, funções e controle de fluxo
- Explicar onde cada variável vive (stack vs heap)
- Usar `defer` para cleanup automático
- Entender slices como fat pointers

---

## Perguntas Guia

### Sintaxe Básica
1. Qual a diferença entre `const` e `var` em Zig?
2. Como você declara uma variável sem inicializar? (`undefined`)
3. O que é `comptime` em 1 frase? (introdução apenas)
4. Como funciona o `switch` em Zig vs outras linguagens?
5. Qual a diferença entre `while` e `for` em Zig?

### Memória
6. Quando uma variável local vive na stack? Quando não?
7. O que é um "stack frame"? O que acontece quando uma função retorna?
8. Por que stack allocation é O(1)?
9. Qual a diferença entre `[4]u8` (array) e `[]u8` (slice)?
10. O que é um "fat pointer"? Quais dois campos um slice carrega?

### Strings
11. O que é `[]const u8` em Zig?
12. Por que strings literais têm tipo `*const [N:0]u8`?
13. Por que `std.debug.print` usa `{s}` para strings e `{}` para outros tipos?

### defer
14. O que `defer` faz exatamente?
15. Em que ordem múltiplos `defer` numa função executam? (LIFO)
16. Por que `defer allocator.free(buf)` é idiomático em Zig?

---

## Recursos

### Tier 1 (obrigatório esta semana)
| Recurso | Seção | Ação |
|---------|-------|------|
| Zig Documentation | Language Reference: Variables, Types, Control Flow | Ler |
| Ziglings | Exercícios 041–060 | Completar |
| Zig by Example | Basic types, Strings, Arrays, Slices | Ler + testar |

### Tier 2 (referência)
| Recurso | Quando usar |
|---------|-------------|
| Zig stdlib source: `std/mem.zig` | Ver como slices são manipuladas |
| Zig playground (zig.godbolt.org) | Experimentar snippets rápidos |

---

## Entregas por Dia

### Dia 1: Sintaxe Core
- [ ] Ler Zig docs: Variables e Basic Types
- [ ] Responder perguntas 1-3
- [ ] Escrever programa com: variáveis, funções, if/else, loops
- [ ] Ziglings exercícios 041–045

### Dia 2: Tipos e Controle de Fluxo
- [ ] Responder perguntas 4-5
- [ ] Escrever 3 funções que usam `switch` em enums
- [ ] Escrever função com `for` sobre slice
- [ ] Ziglings exercícios 046–050

### Dia 3: Stack e Memória
- [ ] Responder perguntas 6-10
- [ ] Desenhar: o que está no stack quando `main` chama `foo` chama `bar`?
- [ ] Criar exemplos mostrando diferença `[4]u8` vs `[]u8`
- [ ] Verificar: o que acontece se você retornar ponteiro para variável local?

### Dia 4: Strings e Slices
- [ ] Responder perguntas 11-13
- [ ] Escrever 5 funções que manipulam `[]const u8`
- [ ] Verificar: como `std.mem.eql(u8, ...)` funciona?
- [ ] Ziglings exercícios 051–055

### Dia 5: defer + Consolidação
- [ ] Responder perguntas 14-16
- [ ] Escrever 3 exemplos mostrando ordem de execução de múltiplos `defer`
- [ ] Implementar função `readFile` (mock) com `defer` para cleanup
- [ ] Criar cheat sheet pessoal: tipos, operadores, control flow
- [ ] Ziglings exercícios 056–060

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Escrever programa Zig sem consultar sintaxe básica
2. [ ] Explicar a diferença entre array e slice sem hesitar
3. [ ] Usar `defer` corretamente em função com múltiplos recursos
4. [ ] Prever onde cada variável vive (stack vs heap)
5. [ ] Explicar o que são fat pointers

### Red flags (precisa revisar):
- Confunde array `[N]T` com slice `[]T`
- Não entende por que `defer` é necessário em Zig
- Não consegue escrever um loop `for` sobre slice sem consultar

---

## Conceitos em Código

```zig
const std = @import("std");

pub fn main() void {
    // Array: tamanho fixo no stack
    const arr: [4]u8 = .{ 1, 2, 3, 4 };

    // Slice: fat pointer (ptr + len), pode apontar para stack
    const s: []const u8 = &arr;

    // defer: executa quando o bloco termina
    var x: u32 = 10;
    defer std.debug.print("fim: {}\n", .{x}); // imprime por último

    // String literal: []const u8
    const msg: []const u8 = "hello";
    std.debug.print("{s} len={}\n", .{ msg, msg.len });
}
```

---

## Cards SRS (criar você mesmo)
- Diferença `[N]T` (array) vs `[]T` (slice)
- O que é um fat pointer e quais 2 campos carrega
- O que `defer` faz e quando executa (LIFO)
- Diferença `const` vs `var` em Zig
- Por que strings literais são `[]const u8`

---

## Reflexão (preencher ao final)

### O que foi mais diferente de linguagens que você já conhece?
_Escreva_

### O que `defer` resolve que outras linguagens resolvem de outro jeito?
_Escreva_

### Confiança (1-5):
- Sintaxe básica: _/5
- Memória / stack: _/5
- Slices: _/5

---

## Próximo

**Semana 9**: Ponteiros + Optionals
- O que é `*T` vs `*const T`?
- Como Zig elimina null pointer dereferences?
- Quando usar `?T` vs `!T`?
