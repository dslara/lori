# Semana 14: Comptime Patterns

## Objetivo
Ao final desta semana, você será capaz de:
- Explicar `comptime` em uma frase clara
- Escrever type functions simples com `comptime T: type`
- Usar `@TypeOf` e `@typeInfo` para introspecao basica
- Validar parametros em compile-time com `@compileError`

---

## Perguntas Guia

1. O que significa "comptime" em Zig, na pratica?
2. Qual a diferenca entre `comptime T` e `type`?
3. O que `@TypeOf(x)` retorna?
4. Quando `@typeInfo(T)` e util?
5. O que `comptime_int` e `comptime_float` significam?
6. Quando usar `@compileError("msg")`?
7. Como criar uma funcao generica segura para tipos numericos?

---

## Recursos

### Tier 1 (obrigatorio)
| Recurso | Secao | Acao |
|---------|-------|------|
| Zig Documentation | comptime, builtin funcs | Ler completamente |
| Zig by Example | Comptime | Ler + testar |
| Ziglings | Exercicios de comptime | Completar |

### Tier 2 (referencia)
| Recurso | Quando usar |
|---------|-------------|
| Zig stdlib: `std/meta.zig` | Ver patterns reais |
| Zig stdlib: `std/math.zig` | Exemplos de type functions |

---

## Entregas por Dia

### Dia 1: Conceito e `@TypeOf`
- [ ] Ler docs: comptime + builtin funcs
- [ ] Responder perguntas 1-3
- [ ] Escrever `fn identity(x: anytype) @TypeOf(x) { return x; }`

### Dia 2: `@typeInfo`
- [ ] Responder pergunta 4
- [ ] Implementar `fn isInteger(comptime T: type) bool`
- [ ] Usar `@typeInfo` para aceitar apenas inteiros

### Dia 3: `comptime_int` e `@compileError`
- [ ] Responder perguntas 5-6
- [ ] Criar funcao `fn square(comptime T: type, x: T) T` com validacao
- [ ] Forcar erro quando `T` nao e numerico

### Dia 4: Type function util
- [ ] Responder pergunta 7
- [ ] Escrever `fn Stack(comptime T: type) type { ... }`
- [ ] Criar stack simples com `push`/`pop`

### Dia 5: Consolidacao
- [ ] Revisar exemplos
- [ ] Criar 5 cards SRS
- [ ] Escrever resumo de 10 linhas sobre comptime

---

## Critérios de Sucesso

- [ ] Explica comptime em 1 frase sem consultar
- [ ] Usa `@TypeOf` e `@typeInfo` corretamente
- [ ] Cria type function simples (Stack, Queue, etc.)
- [ ] Usa `@compileError` para validar tipos

---

## Cards SRS (criar voce mesmo)
- O que `comptime` significa em Zig
- Diferenca entre `comptime T` e `type`
- Quando usar `@typeInfo`
- O que `@compileError` faz
- Exemplo de type function

---

## Proximo

**Semana 15**: Comptime Code Gen
