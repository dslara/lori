# 📅 Semana 7: Zig Setup

## 🎯 Objetivo
Ao final desta semana, você terá um ambiente Zig funcional, terá completado exercícios iniciais e criado um cheat sheet pessoal — pronto para começar F1 sem fricção de setup.

---

## ❓ Perguntas Guia

1. `zig version` retorna a versão correta?
2. `zig build` e `zig test` funcionam em projeto local?
3. Qual a diferença entre `zig build-exe`, `zig run` e `zig test`?
4. Como Ziglings está organizado? Quantos exercícios existem?
5. O que é `zig.zon` (package manifest)?

---

## 📚 Recursos

### Tier 1 (obrigatório esta semana)
| Recurso | Link | Ação |
|---------|------|------|
| **Zig Documentation** | https://ziglang.org/documentation/0.14.0/ | Ler seções: Getting Started, Build System |
| **Ziglings** | https://github.com/ratfactor/ziglings | Clonar + fazer 30+ exercícios |
| **Learn Zig** | https://learn.ziglang.org/ | Completar tutorial interativo básico |

### Tier 2 (referência, use conforme precisar)
| Recurso | Link | Quando usar |
|---------|------|-------------|
| **Zig by Example** | https://zigbyexample.com/ | Exemplos pontuais |
| **Zig stdlib source** | https://github.com/ziglang/zig/tree/master/lib/std | Ver implementações reais |

---

## 📋 Entregas por Dia

### Dia 1: Instalação e Hello World
- [ ] Instalar Zig 0.13+ ou 0.14+ (https://ziglang.org/download/)
- [ ] Verificar: `zig version` funciona
- [ ] Criar projeto: `zig init` em pasta `cs-fundamentals-zig/`
- [ ] Hello World compilando: `zig run src/main.zig`
- [ ] Criar primeiro teste: `zig test src/main.zig`

### Dia 2: Build System e Projeto Base
- [ ] Entender `build.zig` (o equivalente de Makefile/Cargo.toml)
- [ ] Criar módulo separado e importar
- [ ] Explorar: `zig build test` vs `zig test`
- [ ] Ler: Overview da documentação oficial (30 min)

### Dia 3: Ziglings — parte 1
- [ ] Clonar Ziglings: `git clone https://github.com/ratfactor/ziglings`
- [ ] Completar exercícios 001–020
- [ ] Anotar sintaxe que parece estranha (vai ser útil no cheat sheet)
- [ ] Anotar 3 diferenças notadas vs linguagens que já conhece

### Dia 4: Ziglings — parte 2
- [ ] Completar exercícios 021–040
- [ ] Anotar: como Zig faz error handling vs outras linguagens?
- [ ] Anotar: o que é `comptime` em 1 frase simples

### Dia 5: Cheat Sheet + Validação
- [ ] Criar `zig-cheat-sheet.md` com:
  - Tipos básicos (`u8`, `i32`, `f64`, `bool`, `[]u8`, `[N]T`)
  - Slice vs Array vs ArrayList
  - Error handling: `!T`, `try`, `catch`, `errdefer`
  - Null safety: `?T`, `.?`, `orelse`
  - Ponteiros: `*T`, `*const T`
  - Allocators: quando usar `std.heap.GeneralPurposeAllocator`
  - Comptime: o que é em 1 linha
  - `defer` e por que é importante
- [ ] Verificar: todos os links Tier 1 estão acessíveis?
- [ ] Decisão: satisfação com Zig ≥6/10? → Continuar para F1

---

## ✅ Critérios de Sucesso

### Você completou se:
1. [ ] `zig version` retorna ≥0.13.0
2. [ ] `zig build test` funciona no projeto base
3. [ ] Ziglings 30+ exercícios completados
4. [ ] Cheat sheet criado com todos os tópicos acima
5. [ ] Satisfação ≥6/10 com a linguagem

### Red flags (reconsiderar migração):
- Não conseguiu instalar Zig sem problemas sérios
- Ziglings parece completamente incompreensível após 30 exercícios
- Satisfação <4/10 ("não gostei mesmo")

---

## 🧠 Cards SRS (criar você mesmo)
- Sintaxe de slice (`[]T`) vs array (`[N]T`)
- Como declarar erro customizado em Zig
- O que `defer` faz e quando usar
- Como declarar variável opcional: `?T`
- Como "unwrap" opcional com segurança: `orelse`

---

## 🔄 Reflexão (preencher ao final)

### O que chamou mais atenção positivamente?
_Escreva_

### O que pareceu mais estranho/difícil?
_Escreva_

### Satisfação geral com Zig (1-10):
_/10

### Decisão: continuar Zig ou rollback para Rust?
- [ ] Continuar Zig (≥6/10 e 30+ exercícios)
- [ ] Rollback para Rust (ver plano de rollback em `planning/plano-migracao-rust-zig-v2.1.md`)

---

## ⏭️ Próximo

**Semana 8**: Zig basics + memória
- Como stack e heap funcionam em Zig?
- O que é `defer` e por que é fundamental?
- Como Zig difere de C em gestão de memória?
