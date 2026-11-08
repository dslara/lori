# Lori — Arquitetura

> **Status:** Fase 1 travada via [Mapa: arquitetura da Lori](https://github.com/dslara/lori/issues/25), 7 de 7
> **Data:** 2026-09-12
> **Driver:** Simplicidade e YAGNI > Didático > Desafio técnico
> **Base:** `CONTEXT.md`, `docs/GAME_DESIGN.md`, `docs/LORI_PROJECT.md`, `docs/adr/0001-no-malus-regime.md`, `docs/wayfinder/research/`

---

## 1. Filosofia

Lori é **extensão Pi** que transforma terminal em RPG single-player de aprendizado acelerado.

Não é app standalone. Não tem backend. Não roda fora do Pi.

Arquitetura escolhe o mais simples que fecha a Fase 1: abrir e fechar Lori session com veredito sobre persistência local. Cada camada futura paga seu didático quando chegar, nunca antes. Regime sem malus em tudo: nada subtrai, fazer soma mais.

---

## 2. Decisões da Fase 1

| # | Decisão | Alternativa Rejeitada | Por Quê |
|---|---------|----------------------|---------|
| 1 | **Store simples, sem `subscribe`** | Redux-like com middleware | Sem processo persistente, effects chamam direto. Persist é chamada explícita após `dispatch`. |
| 2 | **Core funcional puro com ban de imports** | OO com classes mutáveis | Dados planos mais funções puras serializam de graça e testam sem mock. `core/` não importa `fs`, Pi SDK, skin ou store. |
| 3 | **Snapshot JSON atômico versionado** | Event log com replay | Zero query na Fase 1. Replay vira fog para quando SRS e ghost pedirem audit. Tipos Action e Event mantidos para migração barata. |
| 4 | **`bun:sqlite` como upgrade, `better-sqlite3` fora** | SQLite via `better-sqlite3` | Pi embute Bun: `node:sqlite` não resolve, `better-sqlite3` é risco nativo sem necessidade. Research em `docs/wayfinder/research/sqlite-vs-flat-files.md`. |
| 5 | **Lifecycle com timer stateless e abandon neutro** | Timeout punitivo de 24h | ADR sem malus enterrou punição. Timestamps sobrevivem ao processo, pausa sempre retoma. |
| 6 | **Skin Minimal sem DSL** | Mini-DSL já | Template é função pura `(params) => string`. Parser e condicionais esperam uso real. |
| 7 | **`State.hot` só com player, session e skinConfig** | Hot completo mais cold lazy | YAGNI até SRS e ghost existirem. Cold split é fog. |
| 8 | **Rebuild em `session_start`, nada na factory** | Processo próprio ou init na factory | Instância é religada por sessão. Research em `docs/wayfinder/research/pi-extension-lifecycle.md`. `appendEntry` só para metadados de agent session. |

---

## 3. Arquitetura em Camadas (Fase 1)

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION (runtime only, não persiste)                  │
│  Skin Minimal: provider (loadSkin + render)                 │
│  Entrada: CoreEvent tipado + params. Saída: string.         │
│  Evento desconhecido cai no Minimal. Skin nunca toca estado.│
│  Persona: fog (loader, builder, switcher).                  │
├─────────────────────────────────────────────────────────────┤
│  EFFECTS (side effects isolados)                            │
│  - Pi adapter: entry point único, rebuild em session_start  │
│  - Persist: snapshot JSON atômico + schemaVersion no projeto│
│  - UI: commands /lori-*, setStatus, setWidget               │
│  - Sem timers, processos ou watchers. Timer é derivado.     │
├─────────────────────────────────────────────────────────────┤
│  STORE (single source of truth, sem regra de negócio)       │
│  - dispatch + getState, sem subscribe, sem middleware       │
│  - State.hot: { player, session, skinConfig }               │
│  - rootReducer em src/store/, só combina slices             │
│  - Selectors co-located por reducer                         │
├─────────────────────────────────────────────────────────────┤
│  CORE (100% puro, zero deps externas)                       │
│  - Reducers: player, session (guards de invariante dentro)  │
│  - Entities: dados planos (Session, Verdict, Player)        │
│  - LifecycleProc: deriva elapsed, marca pausa, sem persistir│
│  - Runtime, content, ghost: fog                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Estrutura de Pastas (Fase 1)

```
.
├── src/
│   ├── core/                            # 100% puro, zero deps externas
│   │   ├── player/
│   │   │   ├── types.ts
│   │   │   ├── reducer.ts
│   │   │   ├── selectors.ts
│   │   │   └── player.test.ts
│   │   ├── session/                     # Mesmo shape do player
│   │   └── processors/
│   │       └── lifecycle/               # runtime, content, ghost = fog
│   ├── store/                           # Só orquestra, sem regra
│   │   ├── index.ts
│   │   ├── store.ts                     # dispatch + getState
│   │   ├── root-reducer.ts              # Só combina, sem lógica
│   │   └── store.test.ts
│   ├── effects/
│   │   ├── pi-extension.ts              # Único entry point Pi
│   │   ├── pi-commands.ts
│   │   ├── persist.ts                   # Snapshot atômico + schemaVersion
│   │   └── ui.ts
│   └── presentation/
│       └── skin/
│           ├── provider.ts              # loadSkin + render + fallback
│           ├── loader.ts
│           └── validator.ts
├── skins/
│   └── minimal.json                     # Built-in; custom com fallback
├── docs/
│   └── wayfinder/research/              # Achados dos tickets research
├── tests/                               # Integração Pi + e2e
└── package.json
```

**Regras de localização:**

| Onde | O que | Não pode |
|------|-------|----------|
| `src/core/` | Regras de negócio, estado, lifecycle processor | Importar `fs`, Pi SDK, skin, store ou qualquer dep externa |
| `src/store/` | Single source of truth, sem middleware | Conter regra de negócio (só orquestra reducers) |
| `src/effects/` | Side effects: snapshot, Pi SDK | Conter regra de negócio (só orquestra) |
| `src/presentation/` | Skin Minimal, provider e fallback | Modificar estado, parser ou condicionais (só traduz core → string) |
| `.pi/extensions/lori/` | Entry point Pi, adapter | Conter core (só importa de `src/`), abrir recursos na factory |
| `tests/` na raiz | Integração Pi + e2e | Conter testes unitários (estes são co-located) |

**Testes unitários são co-located.** Cada arquivo em `src/` leva seu `.test.ts` ao lado.

---

## 4. Conceitos e Patterns (Fase 1 travada, resto fog)

### 4.1 Snapshot direto, event sourcing no fog

Toda mutação passa por action serializável. Fase 1 persiste snapshot direto; replay vira fog. Distinção Action contra Event segue nos tipos.

**Patterns:** Unidirectional Data Flow, Functional Composition.

### 4.2 Store simples sem framework

`dispatch` mais `getState`, sem `subscribe`, sem middleware. Actions como discriminated unions, nenhum `any` no fluxo.

### 4.3 Lifecycle processor, resto fog

Só `LifecycleProcessor`: roda no boot e após `dispatch` de session, deriva elapsed e marca pausa retomável. Runtime, content e ghost são fog.

**Patterns:** Derivation, State Machine (open, paused, closed com veredito).

### 4.4 Template como função, mini-DSL no fog

Skin é `(params) => string` com interpolação direta. Sem parser, sem `eval`, sem condicionais.

### 4.5 Stateless timer sem punição

Só timestamps (`startedAt`, `pausedAt`, `totalPaused`). Elapsed derivado no boot e no veredito. Sem `setInterval`, sem timeout de 24h, sem auto-pause punitivo.

### 4.6 Hot mínimo, cold no fog

Hot é player, session e skinConfig. Lazy loading de cards e histórico espera medição de boot real.

### 4.7 Fingerprint Jaccard (fog)

Decidido no game design, sem recorte até existir Session com Verdict.

### 4.8 Passivas (fog)

Técnica nível 10 vira ativação automática. Desenho espera o estilo do core ser exercido.

### 4.9 Combos (fog)

Bônus dentro da sessão, nunca malus. Detection temporal espera técnicas reais.

### 4.10 SM-2 puro, sem penalty layer

Regime sem malus: reviews atrasados viram pilha visível, nunca tocam `easeFactor`. Penalty como camada está vetada pelo ADR.

### 4.11 Plugin mínimo (Fase 1)

Core define catálogo fixo de `CoreEvent`, nunca conhece nomes de skin. Loader aceita custom com fallback por evento. Hot-swap e schema evolution são fog.

### 4.12 Pi Extension API (Fase 1)

Commands `/lori-*`, `setStatus`, `setWidget`, `before_agent_start` para personas futuras. Reconstrói do snapshot em `session_start`. Nada de background na factory, limpeza idempotente em `session_shutdown`.

---

## 6. Trade-offs Explícitos

| Trade-off | Escolha | Custo |
|-----------|---------|-------|
| **Funcional puro vs OO** | Funcional puro | Menos intuitivo para game dev tradicional; OO entra só com dor real |
| **Snapshot vs Event sourcing** | Snapshot direto | Sem replay nem audit até o fog virar ticket |
| **Skin função vs DSL** | Função pura | Sem condicionais até uso real pedir a DSL |
| **Ghost e SRS agora vs depois** | Depois | Fase 1 sem queries; `bun:sqlite` espera o fog |
| **`bun:sqlite` vs `better-sqlite3`** | `bun:sqlite` futuro, JSON agora | `node:sqlite` indisponível no Bun; nativo Node é risco à toa |
| **Processors vs tick contínuo** | Só lifecycle, sem loop | Lógica contínua só via timestamps derivados |

---

## 7. Roadmap

### Fase 1 — Fundação (travada, executar)
1. `src/store/` simples + slices `core/player` e `core/session`
2. `effects/persist.ts` (snapshot JSON atômico + `schemaVersion`)
3. `core/session` com timer stateless + `processors/lifecycle`
4. Entry point com rebuild em `session_start` + `/lori-status` + dashboard
5. Skin Minimal (`provider`, `loader`, `validator` + fallback)

### Fases 2 a 5 — Direção validada, não travada
SM-2 puro sem penalty, cards manuais, técnicas e combos com bônus-ou-nada, skins `rpg`/`horror`/`scifi`/`zen` com DSL, personas com switcher, ghost Jaccard, export e import, Pi package. Cada fase vira mapa próprio antes de codar.

---

## 8. Regras de Ouro

| # | Regra | Violação = |
|---|-------|-----------|
| 1 | `core/` não importa nada de fora (nem Pi SDK, nem `fs`, nem `skin`, nem store) | Refatorar |
| 2 | `skin/` e `persona/` não modificam estado. Só traduzem. | Bug |
| 3 | `effects/` não contém regra de negócio. Só orquestra. | Refatorar |
| 4 | Actions são serializáveis (JSON). Tipos Action e Event seguem distintos. | Corrigir |
| 5 | Snapshot guarda `player`, `session` e `skinConfig` com `schemaVersion`, escrita atômica, no projeto de estudo | Corrigir |
| 6 | Pi SDK vive só no adapter e em `ui.ts`. Nada na factory além de registro. | Isolar |
| 7 | `runtime.*` nunca persiste quando existir. Sempre recalcula no boot. | Bug |
| 8 | Modifiers são bônus derivados, nunca abaixo do neutro. | Refatorar |
| 9 | Quando SQLite pousar: `bun:sqlite` com prepared statements, nunca interpolação. | Segurança |
| 10 | Dados sensíveis (paths, tokens) são filtrados antes de virar contexto LLM. | Privacidade |
| 11 | `pi-extension.ts` é o único entry point. Estado reconstrói em `session_start`. | Manutenção |
| 12 | `appendEntry()` só para metadados de agent session, nunca dados de jogo. Validada no doc oficial. | Arquitetura |

---

## 9. Conclusão

Fase 1 travada é **store simples mais core puro mais snapshot versionado**: abrir e fechar Lori session com veredito, timer derivado, abandon neutro, Skin Minimal sem DSL. Didático na medida: data flow unidirecional, functional core, derivation, plugin mínimo e Pi Extension API, sem pagar event sourcing ou DSL antes da hora.

Fog consciente: SRS, combos, passivas, ghost, DSL, personas, cold split, export e package. Cada um vira mapa próprio. Nada aqui redecide game design; tudo aqui respeita o ADR sem malus.
