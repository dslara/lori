# Lori — Arquitetura Recomendada (Final)

> **Status:** Consolidado após iteração de 8 branches arquiteturais  
> **Data:** 2026-04-25  
> **Driver:** Desafio técnico > Oportunidade de aprendizado > Alinhamento com produto

---

## 1. Filosofia

Lori é **extensão Pi** que transforma terminal em RPG single-player de aprendizado acelerado.

Não é app standalone. Não tem backend. Não roda fora do Pi.

Arquitetura escolhida maximiza **desafio técnico** dentro dessas restrições. Cada camada introduz conceito não-trivial de software ou game dev.

---

## 2. Decisões Arquiteturais Consolidadas

| # | Decisão | Alternativa Rejeitada | Por Quê |
|---|---------|----------------------|---------|
| 1 | **Processors event-driven** | ECS-lite com tick contínuo | Pi recria processo Node.js a cada sessão. `setInterval` morre entre interações. Processors sobrevivem recalculando estado no boot. |
| 2 | **Domínio 100% funcional puro** | Classes OO mutáveis (`Player.gainXp()`) | Imutabilidade = time-travel debugging, replay de sessões inteiras, hot reload de reducers. Propriedade arquitetural rara em games. |
| 3 | **Skin system profundo** | Skin simples (evento → mensagem fixa) | Template engine + expression evaluator + eventos atmosféricos = mini-DSL. Mesma mecânica gera 4 experiências completamente distintas. |
| 4 | **Combos + passivas completos** | Apenas níveis de técnica | Sistema de progression real com agência do jogador. Interações não-triviais entre mecânicas. |
| 5 | **SRS penalty + ghost run no MVP** | Adiar para pós-MVP | Penalty como camada sobre SM-2 puro (zero breaking change). Ghost run híbrido: matching simples + fingerprint Jaccard. Card-generator por LLM adiado (dependência externa de alto risco). |
| 6 | **Event log append-only + replay** | Snapshots periódicos apenas | Event sourcing enxuto. Cada action = row em `events`. Replay = `events.reduce(reducer, initialState)`. Debugging e audit trail gloriosos. |
| 7 | **SQLite puro, hot/cold split** | JSONL para event log | Queries complexas nativas, transacional, single file. Hot = carrega no boot. Cold = lazy-loaded quando view pede. |
| 8 | **TUI via Pi SDK nativo** | Processo standalone / ncurses | Commands, tools, widgets, status bar — tudo via Pi Extension API. Zero processo persistente fora do Pi. |

---

## 3. Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION (runtime only, não persiste)                  │
│  ┌─────────────────┐  ┌──────────────────────────────────┐ │
│  │ Skin System     │  │ Persona System                   │ │
│  │ - SkinProvider  │  │ - Loader (principle + skin)      │ │
│  │ - TemplateEngine│  │ - Builder (systemPrompt)         │ │
│  │ - ExprEvaluator │  │ - Switcher (auto/manual)         │ │
│  │ - AtmosphereGen │  │                                  │ │
│  │ Entrada: CoreEvent │ Entrada: CoreState + user msg   │ │
│  │ Saída: PresentationEvent │ Saída: systemPrompt string │ │
│  └─────────────────┘  └──────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  EFFECTS / IMPERATIVE SHELL (side effects isolados)         │
│  ┌─────────────┐  ┌─────────────────────────────┐  ┌────────┐│
│  │ Pi Adapters │  │ Persistence                 │  │ Timer  ││
│  │ - commands  │  │ - SQLite (hot + cold + WAL) │  │ Stateless│
│  │ - tools     │  │ - Event log append-only     │  │ (timestamps)
│  │ - listeners │  │ - Schema versionado         │  │        ││
│  │ - TUI       │  │ - Prepared statements       │  │        ││
│  │   contracts │  │ - Log rotation / compaction │  │        ││
│  └─────────────┘  └─────────────────────────────┘  └────────┘│
├─────────────────────────────────────────────────────────────┤
│  APPLICATION / STORE (Single Source of Truth)               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Redux-like Store                                    │    │
│  │                                                     │    │
│  │  State.hot (memória): { player, quests, tree,      │    │
│  │    session, techniques, inventory, skinConfig }     │    │
│  │  State.cold (lazy SQLite): { srsCards, history,    │    │
│  │    ghostSnapshots, allWeaknesses }                  │    │
│  │                                                     │    │
│  │  Dispatch: action → rootReducer → newState          │    │
│  │  Subscribe: store.subscribe(effectHandler)          │    │
│  │  Middleware: persistência em SQLite                 │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  DOMAIN / FUNCTIONAL CORE (100% puro, zero deps externas)   │
│  ┌──────────┐ ┌─────────────────┐ ┌──────────┐ ┌──────────┐│
│  │ Reducers │ │   Processors    │ │Algorithms│ │ Entities ││
│  │ (pure)   │ │ (state-event)   │ │(SM-2,   │ │(Session, ││
│  │          │ │                 │ │ XP calc,│ │Flashcard,││
│  │ player   │ │ RuntimeProc     │ │ combo,  │ │ Weakness,││
│  │ quests   │ │ (modifiers,     │ │ streak, │ │Technique,││
│  │ skillTree│ │  combos,        │ │ level,  │ │ Modifier,││
│  │ session  │ │  passives)      │ │ penalty)│ │  Combo)  ││
│  │ srs      │ │ LifecycleProc   │ │         │ │          ││
│  │ ...      │ │ (timer state,   │ │         │ │          ││
│  │          │ │  streak,        │ │         │ │          ││
│  │          │ │  abandon)       │ │         │ │          ││
│  │          │ │ ContentProc     │ │         │ │          ││
│  │          │ │ (quests, cards, │ │         │ │          ││
│  │          │ │  achievements,  │ │         │ │          ││
│  │          │ │  story unlock)  │ │         │ │          ││
│  │          │ │ GhostProc       │ │         │ │          ││
│  │          │ │ (match +        │ │         │ │          ││
│  │          │ │  fingerprint)   │ │         │ │          ││
│  └──────────┘ └─────────────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Estrutura de Pastas

```
.
├── src/
│   ├── shared/                          # Types + algorithms cross-cutting
│   │   ├── types.ts
│   │   ├── algorithms/
│   │   │   ├── sm2.ts
│   │   │   ├── jaccard.ts
│   │   │   ├── xp-calc.ts
│   │   │   └── level-calc.ts
│   │   └── utils/
│   │       └── (compose, clamp, deepEquals)
│   │
│   ├── domain/                          # 100% puro, zero deps externas
│   │   ├── player/
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── reducer.ts
│   │   │   ├── selectors.ts
│   │   │   └── player.test.ts
│   │   ├── quests/
│   │   │   ├── index.ts
│   │   │   └── ...
│   │   ├── skill-tree/
│   │   ├── session/
│   │   ├── techniques/
│   │   ├── inventory/
│   │   ├── srs/
│   │   ├── weaknesses/
│   │   ├── achievements/
│   │   ├── story/
│   │   └── processors/                  # Cross-cutting (não são features)
│   │       ├── runtime/
│   │       ├── lifecycle/
│   │       ├── content/
│   │       └── ghost/
│   │
│   ├── store/                           # Redux-like à mão
│   │   ├── index.ts
│   │   ├── store.ts
│   │   ├── root-reducer.ts
│   │   ├── middleware/
│   │   │   └── persist.ts
│   │   └── store.test.ts
│   │
│   ├── effects/                         # Imperative shell (side effects)
│   │   ├── pi-extension.ts              # Único entry point Pi
│   │   ├── pi-commands.ts
│   │   ├── pi-tools.ts
│   │   ├── persist.ts
│   │   ├── timer.ts
│   │   └── ui.ts
│   │
│   └── presentation/                    # Skin + Persona (runtime only)
│       ├── skin/
│       │   ├── provider.ts
│       │   ├── loader.ts
│       │   ├── validator.ts
│       │   ├── template-engine.ts
│       │   └── expression-evaluator.ts
│       └── persona/
│           ├── loader.ts
│           ├── builder.ts
│           └── switcher.ts
│
├── skins/                               # Assets de skins (JSON/TS)
│   ├── minimal.json
│   ├── rpg.json
│   └── ...
│
├── .pi/
│   ├── extensions/
│   │   └── lori/
│   │       └── index.ts                 # Adapter puro; importa de src/
│   ├── prompts/                         # Prompts Pi
│   │   └── ...
│   └── themes/                          # Temas Pi
│       └── ...
│
├── tests/                               # Testes de integração + e2e Pi
│   └── ...
│
├── package.json
└── docs/
```

**Regras de localização:**

| Onde | O que | Não pode |
|------|-------|----------|
| `src/shared/` | Types base, algorithms genéricos, helpers puros | Importar de `domain/`, `effects/`, `presentation/` |
| `src/domain/` | Regras de negócio, estado, processors | Importar `fs`, Pi SDK, ou qualquer dep externa |
| `src/store/` | Single source of truth, middleware | Conter regra de negócio (só orquestra reducers) |
| `src/effects/` | Side effects: SQLite, Pi SDK, timer | Conter regra de negócio (só orquestra) |
| `src/presentation/` | Skin system, persona builder | Modificar estado (só traduz core → string) |
| `.pi/extensions/lori/` | Entry point Pi, adapter | Conter domain (só importa de `src/`) |
| `tests/` na raiz | Integração Pi + e2e | Conter testes unitários (estes são co-located) |

**Testes unitários são co-located.** Cada feature/ arquivo em `src/` leva seu `.test.ts` ao lado. Testes de integração (store + effects + Pi adapter) ficam em `tests/` na raiz.

---

## 4. Conceitos Técnicos e Patterns Explorados

### 4.1 Event Sourcing Enxuto

Toda mutação de estado passa por action serializável. Actions são logadas em tabela `events` (append-only). Estado reconstruído por `events.reduce(rootReducer, initialState)`.

**Patterns:** Event Sourcing (Fowler), CQRS light (leitura via selectors, escrita via actions).

**Desafio:** Compaction de eventos antigos sem perder audit trail. Snapshots periódicas do estado para boot rápido.

### 4.2 Redux em TypeScript sem Framework

Store implementado à mão com `dispatch`, `subscribe`, `getState`. Reducers compostos via `combineReducers`. Selectors tipados. Middleware para persistência.

**Patterns:** Unidirectional Data Flow, Pure Functions, Functional Composition.

**Desafio:** Type safety total em actions discriminated unions. Nenhum `any` no fluxo de estado.

### 4.3 Game Architecture: Processors vs Systems

`RuntimeProcessor`, `LifecycleProcessor`, `ContentProcessor`, `GhostProcessor` rodam em eventos e no boot. Não há game loop/tick. Cada processor consome estado e emite novas actions.

**Patterns:** Observer (subscribe a eventos), Strategy (diferentes algoritmos de matching), State Machine (fases de sessão).

**Desafio:** Ordem de processamento. Ciclo de actions (processor A emite action → processor B reage). Prevenir loops infinitos.

### 4.4 Mini-DSL: Template Engine + Expression Evaluator

Skin define templates (`{{resource.primary}}`) e condições (`resource.primary < 20`). Template engine compila strings com placeholders. Expression evaluator parseia e avalia condições seguras (sem `new Function()`).

**Patterns:** Interpreter (GoF), Template Method, Strategy.

**Desafio:** Parser seguro de expressões. Sem `eval`, sem `new Function`. Implementação manual de tokenizer + AST ou regex limitada.

### 4.5 Stateless Timer

Timer armazena apenas timestamps (`startedAt`, `pausedAt`, `totalPaused`). Elapsed calculado por `Date.now() - startedAt - totalPaused`. Sem `setInterval`. Correto mesmo se processo morreu há dias.

**Patterns:** Functional State, Derivation.

**Desafio:** Edge cases — sessão >24h perdida = abandon automático. Break em pausa = cálculo de tempo restante. Auto-pause por inatividade.

### 4.6 Hot/Cold State Split

Dados quentes (player, sessão, quests ativas) carregados no boot. Dados frios (SRS cards, histórico, ghost snapshots) carregados sob demanda via query SQLite.

**Patterns:** Lazy Loading, CQRS, Cache.

**Desafio:** Consistência entre hot e cold. Invalidação de cache. Queries SQL performáticas para due cards, matching de ghost runs.

### 4.7 Fingerprint Matching (Jaccard Similarity)

Cada sessão gera fingerprint — Set de fraquezas trabalhadas, conceitos da skill tree, técnicas usadas. Comparação entre sessões por similaridade de Jaccard: `|A ∩ B| / |A ∪ B|`.

**Patterns:** Similarity Search, Set Operations.

**Desafio:** Representação eficiente de fingerprints em SQLite. Query de similaridade sem vector DB. Threshold de matching.

### 4.8 Passive System (Observer Pattern)

Técnicas dominadas (nível 10) viram passivas ativáveis. Uma vez ativas, observam estado e disparam ações automaticamente via triggers.

**Patterns:** Observer, Event-Driven Architecture.

**Desafio:** Trigger explosion — muitas passivas ativas verificando estado a cada evento. Otimização: indexação de triggers por tipo.

### 4.9 Combo Detection (Temporal Pattern Matching)

Buffer de técnicas usadas com timestamps. Detecção de padrão em janela de tempo. Progresso parcial, expiração, falha.

**Patterns:** Sliding Window, Pattern Matching, State Machine.

**Desafio:** Janelas de tempo sobrepostas. Múltiplos combos possíveis. Prioridade de combos.

### 4.10 SM-2 + Penalty Layer

Algoritmo SM-2 puro intacto. Penalty de atraso como camada adicional que ajusta `easeFactor` antes do cálculo SM-2.

**Patterns:** Decorator, Strategy, Layered Architecture.

**Desafio:** Penalty não quebrar SM-2. Validação com playtest. Penalidade justa — frustrante o suficiente para motivar, não para abandonar.

### 4.11 Plugin Architecture (Skin System)

Core não conhece skins. Skin carregada de arquivo JSON/TS em runtime. Validação de schema. Fallback para skin default.

**Patterns:** Plugin Architecture, Inversion of Control, Dependency Injection.

**Desafio:** Hot-swap de skin sem perder estado. Schema evolution de skins. Comunidade criando skins sem código.

### 4.12 Pi Extension API Integration

Commands (`/lori-*`), tools (`lori_timer_status`), widgets (`setWidget`), status bar (`setStatus`), systemPrompt injection (`before_agent_start`). Tudo via Pi SDK. Nenhum processo standalone.

**Patterns:** Adapter, Facade, Inversion of Control.

**Desafio:** Pi recria extensão a cada sessão. Estado reconstruído do SQLite no `session_start`. Timer correto mesmo com gaps de tempo.

---

## 6. Trade-offs Explícitos

| Trade-off | Escolha | Custo |
|-----------|---------|-------|
| **Funcional puro vs OO** | Funcional puro | Curva de aprendizado. Menos intuitivo para game dev tradicional. |
| **Event sourcing vs Snapshots** | Event sourcing | Mais espaço em disco. Compaction necessária. |
| **Skin profundo vs Simples** | Profundo | Mais código no template engine/expression evaluator. Edge cases. |
| **Ghost run híbrido vs Simples** | Híbrido | Fingerprint requer estruturação de dados da sessão. Query Jaccard em SQLite. |
| **SQLite puro vs JSONL** | SQLite puro | Schema rígido. Migrations implícitas. Build nativo de `better-sqlite3`. |
| **Processors vs ECS ticks** | Processors | Sem game loop real. Lógica contínua (timer) via timestamps. |

---

## 7. Roadmap de Implementação

### Fase 1 — Fundação
1. `store/` (Redux-like à mão) + `domain/reducers/` (player, session)
2. `effects/persist.ts` (SQLite, schema versionado, WAL, prepared statements)
3. `domain/reducers/session.ts` (timer stateless) + `effects/timer.ts`
4. `domain/processors/lifecycle-processor.ts` (session resume, abandon guard)
5. `presentation/views/dashboard.ts` + `effects/pi-extension.ts` (entry point)
6. Skin `minimal` built-in (`skin/provider.ts`, `skin/loader.ts`, `skin/validator.ts`)

### Fase 2 — Aprendizado Ativo
7. `domain/algorithms/sm2.ts` + `domain/reducers/srs.ts` (SM-2 puro)
8. `domain/algorithms/srs-penalty.ts` (penalty layer sobre SM-2)
9. `domain/reducers/weaknesses.ts` + `domain/processors/runtime-processor.ts` (debuffs)
10. Primeiras técnicas: `Pomodoro`, `Feynman`, `Active Recall`
11. Cards manuais (`/lori-card`) + templates fixos

### Fase 3 — Gamificação Profunda
12. `domain/reducers/techniques.ts` (27 rituais, passivas, combos)
13. `domain/processors/runtime-processor.ts` (passives, modifiers, combo detection)
14. `domain/reducers/inventory.ts` + `domain/reducers/achievements.ts` + `domain/processors/content-processor.ts`
15. `domain/algorithms/combo.ts` + `domain/entities/combo.ts`
16. `data/story-quests.ts`

### Fase 4 — Personalização
17. Skins built-in: `rpg`, `horror`, `scifi`, `zen` + template engine + expression evaluator
18. `persona/loader.ts` + `persona/builder.ts` + `persona/switcher.ts`
19. `effects/suggestion-engine.ts`

### Fase 5 — Polimento
20. `domain/processors/ghost-processor.ts` (matching simples + fingerprint Jaccard)
21. `effects/export.ts` + `effects/import.ts` (JSON/Markdown/CSV)
22. `domain/processors/content-processor.ts` (card-generator com LLM/heurística — pós-MVP de verdade, agora com foundation sólido)
23. Estatísticas avançadas e leaderboard pessoal
24. Documentação para criação de skins por terceiros
25. Empacotamento como Pi Package

---

## 8. Regras de Ouro

| # | Regra | Violação = |
|---|-------|-----------|
| 1 | `domain/` não importa nada de fora (nem Pi SDK, nem `fs`, nem `skin`) | Refatorar |
| 2 | `skin/` e `persona/` não modificam estado. Só traduzem. | Bug |
| 3 | `effects/` não contém regra de negócio. Só orquestra. | Refatorar |
| 4 | Actions são serializáveis (JSON). Podem ser logadas/replayadas. | Corrigir |
| 5 | Persistência salva só `core` + `skinConfig`. `persona` e `presentation` são runtime. | Otimizar |
| 6 | Pi SDK vive só em `effects/pi-extension.ts` e `effects/ui.ts` | Isolar |
| 7 | `runtime.*` (modifiers, passives, combos) nunca persiste. Sempre recalcula no boot. | Bug |
| 8 | Modifiers são derivados, não primários. XP base + modifiers = XP final. | Refatorar |
| 9 | SQLite usa prepared statements. Nunca interpolação de strings SQL. | Segurança |
| 10 | Dados sensíveis (paths, tokens) são filtrados antes de virar contexto LLM. | Privacidade |
| 11 | `pi-extension.ts` é o único entry point da extensão Pi. | Manutenção |
| 12 | `appendEntry()` usado apenas para metadados de sessão Pi, nunca para dados de jogo. | Arquitetura |

---

## 9. Conclusão

Arquitetura recomendada é **síntese híbrida** que:

1. **Maximiza desafio técnico** — event sourcing, mini-DSL, game processors, stateless timer, fingerprint matching, passive system, combo detection.
2. **Maximiza aprendizado** — 12 patterns/conceitos não-triviais em único projeto: Event Sourcing, Redux, Processors, Mini-DSL, Stateless Design, Hot/Cold Split, Jaccard Similarity, Observer, Sliding Window, Decorator, Plugin Architecture, Pi Extension API.
3. **Alinha 100% com proposta** — todas 10 funcionalidades principais cobertas. Skin + Persona = mitologia completa. Técnicas passivas + combos = progression real. Ghost run = feedback comparativo. SRS penalty = retenção rigorosa.
4. **Respeita restrições** — local, offline, single-player, terminal, <50MB, sem backend.
5. **Escala incrementalmente** — core puro pode virar Hexagonal/CA no futuro. Skin system pode ganhar mais features sem tocar core.

**Diferencial educacional:** projeto que mistura **arquitetura de software** (event sourcing, functional core, layered architecture) com **game architecture** (processors, passive system, combo detection, progression) e **design patterns** (12 patterns aplicados). Não é CRUD gamificado. É game engine enxuta para aprendizado.
