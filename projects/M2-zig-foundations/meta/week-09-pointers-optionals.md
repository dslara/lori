# Semana 9: Ponteiros + Optionals

## Objetivo
Ao final desta semana, você será capaz de:
- Usar ponteiros (`*T`, `*const T`) com segurança
- Usar optionals (`?T`) para representar ausência de valor
- Eliminar null pointer dereferences do seu código
- Entender aliasing e quando ponteiros causam problemas

---

## Perguntas Guia

### Ponteiros
1. Qual a diferença entre `*T` e `*const T`?
2. O que é `*T` vs `[*]T` (many-item pointer)?
3. Como você obtém um ponteiro para variável local? (`&x`)
4. Como você dereferencia um ponteiro? (`ptr.*`)
5. O que é aliasing e por que pode ser problemático?
6. Por que Zig não tem aritmética de ponteiro por padrão em `*T`?

### Optionals
7. O que é `?T` em Zig?
8. Qual é o valor "null" de um optional? (`null`)
9. Como você "unwraps" um optional com segurança? (`orelse`, `if`)
10. O que é `.?` e quando é seguro usar?
11. Qual a diferença entre `?T` e `?*T`?
12. Como optional se compara a `Option<T>` em Rust ou `nil` em Go?

### Combinando Ponteiros e Optionals
13. O que é `?*T` (optional pointer)?
14. Como você verifica se um ponteiro é não-nulo em Zig?
15. O que `if (optional) |value| { }` faz?

### Quando Usar
16. Quando usar ponteiro em vez de passar por valor?
17. Quando `?T` é a escolha certa? Quando `!T` (error union) é melhor?

---

## Recursos

### Tier 1 (obrigatório esta semana)
| Recurso | Seção | Ação |
|---------|-------|------|
| Zig Documentation | Pointers, Optionals | Ler completamente |
| Ziglings | Exercícios 061–075 (ponteiros e optionals) | Completar |
| Zig by Example | Pointers, Optional types | Ler + testar |

### Tier 2 (referência)
| Recurso | Quando usar |
|---------|-------------|
| Zig stdlib: qualquer linked list | Ver uso real de ponteiros opcionais |
| godbolt.org | Ver assembly gerado para pointer dereference |

---

## Entregas por Dia

### Dia 1: Ponteiros Básicos
- [ ] Ler Zig docs: Pointers
- [ ] Responder perguntas 1-4
- [ ] Escrever 5 funções que recebem `*T` e modificam via pointer
- [ ] Verificar: o que acontece com dangling pointer em Zig?

### Dia 2: Ponteiros Avançados
- [ ] Responder perguntas 5-6
- [ ] Criar exemplo mostrando aliasing problemático
- [ ] Comparar `*T` vs `*const T` em função que não deveria modificar
- [ ] Ziglings exercícios 061–065

### Dia 3: Optionals
- [ ] Ler Zig docs: Optionals
- [ ] Responder perguntas 7-12
- [ ] Escrever função `findFirst(slice, value) ?usize`
- [ ] Usar `orelse`, `if |val|`, e `.?` em exemplos separados

### Dia 4: Optional Pointers
- [ ] Responder perguntas 13-15
- [ ] Implementar linked list node simples: `next: ?*Node`
- [ ] Escrever `traverse` que itera até `next == null`
- [ ] Ziglings exercícios 066–075

### Dia 5: Consolidação + Decisão
- [ ] Responder perguntas 16-17
- [ ] Criar tabela: `T` vs `*T` vs `?T` vs `?*T` — quando usar cada um
- [ ] Reescrever função antiga usando ponteiro em vez de retornar cópia
- [ ] Cards SRS criados
- [ ] Adicionar ao cheat sheet pessoal

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Explicar quando passar por valor vs por ponteiro
2. [ ] Usar `?T` sem `.?` desnecessário (sem "force unwrap" inseguro)
3. [ ] Implementar linked list node com `?*Node` sem memory issues
4. [ ] Diferenciar `?T` (missing value) de `!T` (error) corretamente
5. [ ] Descrever o que aliasing é e por que importa

### Red flags (precisa revisar):
- Usa `.?` em todo lugar sem verificar null antes
- Não sabe quando passar `*T` vs `T` para função
- Confunde `?T` com `!T`

---

## Conceitos em Código

```zig
const std = @import("std");

// Ponteiro para modificar in-place
fn increment(x: *u32) void {
    x.* += 1;
}

// Optional: pode ou não ter valor
fn findIndex(haystack: []const u8, needle: u8) ?usize {
    for (haystack, 0..) |c, i| {
        if (c == needle) return i;
    }
    return null;
}

pub fn main() void {
    var n: u32 = 5;
    increment(&n);
    // n == 6

    const idx = findIndex("hello", 'l') orelse {
        std.debug.print("not found\n", .{});
        return;
    };
    std.debug.print("found at {}\n", .{idx});

    // Optional pointer para linked-list style
    const Node = struct {
        val: i32,
        next: ?*const @This(),
    };
    const c = Node{ .val = 3, .next = null };
    const b = Node{ .val = 2, .next = &c };
    const a = Node{ .val = 1, .next = &b };

    var cur: ?*const Node = &a;
    while (cur) |node| {
        std.debug.print("{} ", .{node.val});
        cur = node.next;
    }
}
```

---

## Cards SRS (criar você mesmo)
- Diferença `*T` vs `*const T`
- Como dereferenciar ponteiro em Zig: `ptr.*`
- Como "unwrap" optional com segurança: `orelse` e `if |val|`
- Diferença `?T` (optional) vs `!T` (error union)
- O que é `?*T` (optional pointer) — uso típico: linked list `next`

---

## Reflexão (preencher ao final)

### Como Zig previne null pointer dereferences?
_Sua explicação_

### Quando você escolheria `?T` vs lançar um erro `!T`?
_Escreva_

### Confiança (1-5):
- Ponteiros: _/5
- Optionals: _/5

---

## Próximo

**Semana 10**: Error Handling + Comptime intro
- Como `!T` funciona em profundidade?
- O que é `try`, `catch`, `errdefer`?
- O que comptime resolve que runtime não resolve?
