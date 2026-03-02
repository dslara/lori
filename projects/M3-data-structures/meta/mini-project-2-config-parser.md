# Mini-Projeto 2: Config Parser com Comptime

## Quando
**Semana 29** (junto de Heaps & Union-Find)

## Objetivo
Usar comptime de Zig para construir um parser de configuração type-safe, sem reflection em runtime.

---

## Pergunta Central
> Como comptime pode substituir reflection/metaprogramming em runtime, resultando em código mais seguro e rápido?

---

## Contexto

**Por que Config Parser?**
- Uso real: todo projeto de médio porte precisa de configuração
- Exercita: comptime, structs, error handling, slices, HashMap
- Demonstra poder de Zig: type-safe parsing sem runtime overhead

**O que comptime resolve aqui:**
Em Python/Java, parsers de config usam reflection para mapear strings a campos. Em Zig, comptime inspeciona o struct em tempo de compilação — zero overhead em runtime.

---

## Escopo (5 horas)

### Formato de Config (INI simplificado)
```
# comentário
host = localhost
port = 8080
debug = true
timeout_ms = 5000
```

### Requisitos Mínimos
- [ ] Struct `Config` com campos: `host: []const u8`, `port: u16`, `debug: bool`, `timeout_ms: u32`
- [ ] Função `parseConfig(comptime T: type, input: []const u8) !T`
  - Usa `@typeInfo(T)` para iterar campos do struct em comptime
  - Para cada campo, parseia o valor do tipo correto
  - Retorna erro se campo obrigatório está faltando
- [ ] Suporte a tipos: `[]const u8`, `u16`, `u32`, `i32`, `bool`
- [ ] Testes: 6+ testes cobrindo tipos, erros, campos extras

### Stretch Goals (apenas se sobrar tempo)
- [ ] Suporte a valores default (via anotação comptime)
- [ ] Seções INI: `[server]`, `[database]`
- [ ] Serialização: `serializeConfig(config: T) []const u8`

---

## Recursos

| Recurso | Seção | Propósito |
|---------|-------|-----------|
| Zig Documentation | `@typeInfo`, `std.meta` | Comptime reflection |
| Zig stdlib source | `std/fmt.zig` | Ver como tipos são parseados |
| Zig by Example | Comptime | Exemplos de `@typeInfo` |

---

## Entregas por Dia

**Dia 1**: Design e Comptime Basics
- [ ] Estudar: o que `@typeInfo(T)` retorna para um struct?
- [ ] Escrever função que imprime nomes de campos de qualquer struct
- [ ] Esboçar: como `parseConfig` vai funcionar?
- [ ] Criar projeto base

**Dia 2**: Parser de Linha
- [ ] Implementar `parseLine(line: []const u8) ?struct { key: []const u8, value: []const u8 }`
- [ ] Lidar com: `=` como separador, `#` como comentário, whitespace
- [ ] Testar parser de linha isolado

**Dia 3**: Comptime Field Mapping
- [ ] Implementar `parseValue(comptime T: type, s: []const u8) !T`
  - Para `[]const u8`: retorna o slice
  - Para `u16`/`u32`/`i32`: usa `std.fmt.parseInt`
  - Para `bool`: `"true"` → `true`, `"false"` → `false`
- [ ] Implementar `parseConfig(comptime T: type, input: []const u8) !T`
  - `@typeInfo(T).Struct.fields` para iterar campos
  - Mapear key → field por nome

**Dia 4**: Error Handling + Testes
- [ ] Criar `ConfigError` com: `MissingField`, `InvalidValue`, `UnknownKey`
- [ ] Testes: config válida, campo faltando, valor inválido, tipo errado
- [ ] Verificar: erro de compilação se `T` não é struct

**Dia 5**: Reflexão
- [ ] Comparar: como Python faria o mesmo? Quantas linhas de reflection?
- [ ] Escrever 3 parágrafos respondendo a pergunta central
- [ ] Criar 5 SRS cards sobre comptime
- [ ] Preencher reflexão abaixo

---

## Critérios de Sucesso

### Você completou se:
1. [ ] `parseConfig(Config, input)` funciona para struct com 4+ campos de tipos diferentes
2. [ ] Erro de compilação se `T` não tem campo esperado (não runtime error)
3. [ ] 6+ testes passando, incluindo casos de erro
4. [ ] Consegue explicar `@typeInfo` em 2 minutos

### Conexões com F1 e F2:
- Comptime: aplicação prática de `@typeInfo`, `@hasField`, `inline for`
- Error handling: `ConfigError` com `try`/`catch`
- HashMap: internamente pode usar para mapear key→value antes de aplicar
- Structs: parsing "into" um struct type-safe

---

## Comptime em Ação

```zig
const std = @import("std");

fn parseConfig(comptime T: type, input: []const u8) !T {
    // Verifica em compile-time que T é um struct
    const info = @typeInfo(T);
    if (info != .Struct) @compileError("T must be a struct");

    var result: T = undefined;

    // Itera campos do struct em compile-time
    inline for (info.Struct.fields) |field| {
        // field.name é conhecido em compile-time
        // field.type é o tipo do campo
        _ = field; // uso real: buscar valor no input e converter
    }

    return result;
}
```

---

## Reflexão

### Como comptime se compara a reflection em runtime?
_Escreva_

### Quais limitações você encontrou com comptime?
_Escreva_

### O que foi mais surpreendente sobre `@typeInfo`?
_Escreva_

---

## Próximo
**Semana 30**: Buffer F2→F3
**Semana 31**: Fase 3 começa — Sorting Básico
