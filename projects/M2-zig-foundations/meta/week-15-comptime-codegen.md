# Semana 15: Comptime Code Gen

## Objetivo
Ao final desta semana, voce sera capaz de:
- Gerar tabelas e funcoes simples em compile-time
- Usar loops `comptime` para criar dados estaticos
- Entender limites e custos de comptime

---

## Perguntas Guia

1. Quando faz sentido gerar codigo em comptime?
2. O que muda no binario quando o resultado e gerado em compile-time?
3. Como criar uma tabela de lookup em compile-time?
4. Quais sao os limites de tamanho e tempo para comptime?
5. Como testar se o codigo gerado esta correto?

---

## Recursos

### Tier 1 (obrigatorio)
| Recurso | Secao | Acao |
|---------|-------|------|
| Zig Documentation | comptime, builtin funcs | Ler completamente |
| Zig by Example | Comptime | Ler + testar |

### Tier 2 (referencia)
| Recurso | Quando usar |
|---------|-------------|
| Zig stdlib: `std/fmt.zig` | Ver geracao de codigo real |
| Zig stdlib: `std/meta.zig` | Patterns de code gen |

---

## Entregas por Dia

### Dia 1: Lookup Table
- [ ] Responder perguntas 1-3
- [ ] Criar tabela `pow2[0..16]` em comptime
- [ ] Validar com testes

### Dia 2: Code Gen simples
- [ ] Responder pergunta 4
- [ ] Gerar funcoes `isEven`, `isOdd` em compile-time
- [ ] Comparar com versao runtime

### Dia 3: Validacao
- [ ] Responder pergunta 5
- [ ] Adicionar testes unitarios para todas funcoes geradas
- [ ] Rodar `zig test`

### Dia 4: Refatoracao
- [ ] Criar helper `fn buildLookup(comptime n: usize) [n]usize`
- [ ] Documentar limites e custos

### Dia 5: Consolidacao
- [ ] Criar 5 cards SRS
- [ ] Escrever resumo de 10 linhas sobre code gen

---

## Critérios de Sucesso

- [ ] Gera lookup table em comptime sem consultar
- [ ] Explica trade-off entre comptime e runtime
- [ ] Testa codigo gerado com testes automatizados

---

## Cards SRS (criar voce mesmo)
- Quando usar comptime code gen
- Como criar tabela em comptime
- Limites de comptime

---

## Proximo

**Semana 16**: Mini-Projeto 1: Arena Allocator
