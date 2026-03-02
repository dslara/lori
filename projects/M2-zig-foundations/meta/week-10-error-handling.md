# Semana 10: Error Handling

## Objetivo
Ao final desta semana, você será capaz de:
- Usar error unions (`!T`) para propagar erros idiomaticamente
- Usar `try`, `catch`, `errdefer` corretamente

---

## Perguntas Guia

### Error Handling
1. O que é `error{Foo, Bar}` em Zig? Como difere de exceções?
2. O que é `!T` (anyerror union)? O que é `ErrorSet!T`?
3. O que `try expr` faz? O que acontece se `expr` retorna erro?
4. Qual a diferença entre `try` e `catch`?
5. O que `errdefer` faz? Como difere de `defer`?
6. Como você cria um error set customizado?
7. O que `anyerror` é? Quando usar vs error set explícito?
8. Como `switch` sobre error set funciona?


---

## Recursos

### Tier 1 (obrigatório esta semana)
| Recurso | Seção | Ação |
|---------|-------|------|
| Zig Documentation | Error Handling | Ler completamente |
| Ziglings | Exercícios sobre errors | Completar |
| Zig by Example | Errors | Ler + testar |

### Tier 2 (referência)
| Recurso | Quando usar |
|---------|-------------|
| Zig stdlib: `std/fs.zig` | Ver padrões reais de error handling |

---

## Entregas por Dia

### Dia 1: Error Sets e !T
- [ ] Ler Zig docs: Error Handling
- [ ] Responder perguntas 1-2
- [ ] Criar 3 funções que retornam `!T` com error sets customizados
- [ ] Verificar: como o compilador infere o error set de `!T`?

### Dia 2: try, catch, errdefer
- [ ] Responder perguntas 3-5
- [ ] Reescrever funções do dia anterior usando `try` para propagação
- [ ] Criar exemplo mostrando `errdefer` vs `defer` (quando cada um roda)
- [ ] Escrever função que usa `catch` para dar fallback value

### Dia 3: Padrões de Error Handling
- [ ] Responder perguntas 6-8
- [ ] Criar `FileProcessor` mock com error handling completo
- [ ] Testar: o que `switch (err)` faz quando há erros não tratados?
- [ ] Comparar: `try` em Zig vs `?` em Rust vs `if err != nil` em Go

### Dia 4: Consolidação
- [ ] Responder perguntas 6-8
- [ ] Criar cheat sheet de error handling
- [ ] Cards SRS

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Escrever função com error set customizado e propagação com `try`
2. [ ] Explicar diferença `errdefer` vs `defer` sem consultar
3. [ ] Explicar por que Zig não tem exceções e o que ganha com isso

### Red flags (precisa revisar):
- Usa `anyerror` em tudo sem entender o custo
- Confunde quando `defer` vs `errdefer` é correto
- Não consegue escrever função genérica simples sem consultar

---

## Conceitos em Código

```zig
const std = @import("std");

// Error set customizado
const ParseError = error{
    InvalidInput,
    Overflow,
    EmptyInput,
};

// Error union: retorna ParseError ou u32
fn parseInt(s: []const u8) ParseError!u32 {
    if (s.len == 0) return ParseError.EmptyInput;
    return std.fmt.parseInt(u32, s, 10) catch |err| switch (err) {
        error.InvalidCharacter => ParseError.InvalidInput,
        error.Overflow => ParseError.Overflow,
    };
}

// try propaga o erro automaticamente
fn processInput(s: []const u8) !u32 {
    const n = try parseInt(s); // se erro, retorna imediatamente
    return n * 2;
}

// errdefer: só roda se a função falhar
fn allocAndProcess(allocator: std.mem.Allocator) ![]u8 {
    const buf = try allocator.alloc(u8, 1024);
    errdefer allocator.free(buf); // libera se algo falhar depois
    // ... processamento que pode falhar ...
    return buf;
}

pub fn main() void {
    const result = processInput("42") catch |err| {
        std.debug.print("error: {}\n", .{err});
        return;
    };
    std.debug.print("result: {}\n", .{result});

}
```

---

## Cards SRS (criar você mesmo)
- O que `try expr` faz quando expr retorna erro
- Diferença `defer` vs `errdefer`
- Como criar error set customizado em Zig
- Por que Zig usa error unions em vez de exceções

---

## Reflexão (preencher ao final)

### Como error handling em Zig se compara ao que você usava antes?
_Escreva_

### Confiança (1-5):
- Error handling: _/5

---

## Próximo

**Semana 11**: Structs, Enums, Unions + Testes
- Como structs em Zig diferem de classes?
- O que é `union(enum)` (tagged union)?
- Como escrever testes inline em Zig?
