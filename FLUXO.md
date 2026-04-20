# Lori — Fluxo do Sistema e Dependências

Documento para entender como as peças se conectam, quem chama quem, e onde o estado vive.

---

## 1. Visão Geral

Lori é uma extension TypeScript para o Pi. Sem banco de dados, sem servidor.

- **Estado = projeção de eventos.** Tudo vive em `.lori/state.jsonl`. Cada ação gera um evento append-only. O estado atual é reconstruído lendo todos os eventos do início ao fim.
- **Dual persistence.** Cada evento é salvo em `state.jsonl` (disco) e em `pi.appendEntry("lori-event", ...)` (contexto da conversa). Isso sobrevive a compactações de contexto.
- **Snapshot periódico.** A cada 50 eventos, `events.projection.ts` grava `state-snapshot.json` para não reconstruir do zero toda vez.

---

## 2. Ciclo de Vida da Extension

```
session_start
  └─> core.listeners.ts
      ├─> loadConfig
      ├─> rebuildState (events.projection.ts)
      │   ├─> loadEvents + tryLoadSnapshot
      │   ├─> loadFlashcards (por módulo ativo)
      │   ├─> loadModule (por módulo ativo)
      │   └─> replay events → calcula métricas
      ├─> setState
      ├─> cycleService.restoreFromEvents
      ├─> updateStatus + updateTimerWidget
      └─> startPeriodicTimer (index.ts)

... sessão ativa ...

session_shutdown
  └─> stopPeriodicTimer
      ├─> se timer ativo: grava SESSION_ENDED auto
      └─> setStateRef(null)
```

---

## 3. O que cada módulo faz

### `events/` — Persistência e projeção

| Arquivo | Responsabilidade |
|---------|------------------|
| `events.model.ts` | Constantes `LoriEvents` (PLAN_CREATED, SESSION_STARTED, etc) e tipos. |
| `events.persistence.ts` | `appendEvent`, `loadEvents`, `ensureLoriDir`, `getLoriDir`. Único lugar que escreve em `state.jsonl`. |
| `events.projection.ts` | `rebuildState`. Função mais importante do sistema: lê eventos, aplica snapshot se existir, carrega módulos/flashcards do disco, replay de eventos, calcula métricas (todayMinutes, planProgress, pendingSRS, streak, weaknesses), escreve snapshot se atingir intervalo. |

### `core/` — Cola e configuração

| Arquivo | Responsabilidade |
|---------|------------------|
| `core.model.ts` | `LoriOptions`: contrato de injeção de dependência (pi, getState, setState, cycleService). |
| `core.config.ts` | `loadConfig`, `saveConfig`, `getTodayKey`, `getWeekNumber`. Config vive em `.lori/config.json`. |
| `core.snapshot.ts` | `serializeState`, `deserializeState`, `writeSnapshot`, `tryLoadSnapshot`. Otimiza `rebuildState`. |
| `core.listeners.ts` | Registra todos os handlers de eventos Pi: `session_start`, `session_tree`, `session_shutdown`, `before_agent_start`, `tool_call`, `turn_end`, `session_before_compact`. É o arquivo com mais dependências do sistema. |
| `core.rituals.ts` | Catálogo de 9 rituais (`RITUALS`). `suggestRitual` escolhe técnica baseada em weaknesses. |

### `modules/` — Modelos e I/O de módulos

| Arquivo | Responsabilidade |
|---------|------------------|
| `modules.model.ts` | Tipos: `LoriState`, `LoriConfig`, `LoriModule`, `Weakness`, `RecentSession`, `Flashcard`. |
| `modules.io.ts` | `loadModule`, `writeModuleFile`, `readModuleFile`. Lê/Escreve arquivos em `.lori/modules/{nome}/`. |

### `cycle/` — Máquina de estados da sessão

| Arquivo | Responsabilidade |
|---------|------------------|
| `cycle.model.ts` | Tipos: `CyclePhase` (idle, pre-session, in-session, post-session), `CycleState`. |
| `cycle.service.ts` | `CycleService`. Mantém `_cycle` em memória. `restoreFromEvents` reconstrói a partir do log. Transições: `startPreSession`, `startInSession`, `startTimer`, `stopTimer`, `startPostSession`. |

### `context/` — Injeção automática de contexto

| Arquivo | Responsabilidade |
|---------|------------------|
| `context.detection.ts` | `isStudyContext`, `isStuckContext`. Detecta palavras-chave no prompt do usuário. |
| `context.injection.ts` | `buildContextMessage`, `buildStuckMessage`. Monta string `[LORI CONTEXT]` injetada no LLM via `before_agent_start`. |

### `srs/` — Algoritmo SM-2

| Arquivo | Responsabilidade |
|---------|------------------|
| `srs.model.ts` | Tipo `Flashcard` (front, back, interval, easeFactor, nextReview, history). |
| `srs.algorithm.ts` | Funções puras: `calculateNextReview`, `getDueCards`, `createFlashcard`. Sem side effects. |
| `srs.persistence.ts` | `loadFlashcards`, `saveFlashcards`, `addFlashcard`. I/O em `.lori/flashcards/{modulo}.jsonl`. |

### `ui/` — Interface no TUI

| Arquivo | Responsabilidade |
|---------|------------------|
| `ui.status-bar.ts` | `updateStatus`. Atualiza barra inferior com timer, módulo, streak, SRS, weaknesses, minutos de hoje. |
| `ui.timer-widget.ts` | `updateTimerWidget`. Mostra widget de progresso do pomodoro com barra de blocos e dica da técnica. |
| `ui.notifications.ts` | `notifyTimerEnd`, `notifyTimerEnding`, `notifyWeaknessAdded`. Dispara notificações no TUI. |
| `ui.wizard.ts` | `runModuleWizard`, `buildAgentPrompt`, `slugifyTopic`. TUI interativo para `/lori-plan`. |

### `tools/` — Custom tools registradas no Pi

| Arquivo | Tool | O que faz |
|---------|------|-----------|
| `tools.ts` | — | Registra todas as tools abaixo. |
| `tools.model.ts` | — | Constantes `LoriTool` (nomes). |
| `tools.log-event.ts` | `lori_log_event` | Grava evento genérico em `state.jsonl`. Se for weakness, dispara notificação. |
| `tools.get-context.ts` | `lori_get_context` | Retorna resumo JSON do estado atual (módulos, weaknesses, timer, SRS). |
| `tools.review-srs.ts` | `lori_review_srs` | Lista cards devidos (`list_due`) ou aplica SM-2 (`review` com quality). |
| `tools.search-concepts.ts` | `lori_search_concepts` | Busca texto em `concepts.md`, `plan.md`, `drills.md` de todos os módulos. |
| `tools.add-resource.ts` | `lori_add_resource` | Adiciona recurso a `resources.md` do módulo ou global. Grava evento. |
| `tools.create-flashcard.ts` | `lori_create_flashcard` | Cria card SRS e salva em `.jsonl`. Atualiza estado em memória. |

### `commands/` — Comandos `/lori-*`

| Arquivo | Comando | O que faz |
|---------|---------|-----------|
| `commands.ts` | — | Registra todos os comandos abaixo. |
| `commands.model.ts` | — | Constantes `LoriCommand` e tipos. |
| `commands.start.ts` | `/lori-start` | Inicia sessão. Sugere ritual se não informado. Grava `SESSION_STARTED`. Envia mensagem de ritual para o agente. |
| `commands.end.ts` | `/lori-end` | Finaliza sessão. Calcula minutos. Atualiza streak em `config.json`. Grava `SESSION_ENDED`. Força pergunta de honestidade. |
| `commands.timer.ts` | `/lori-timer` | Start/stop/status do pomodoro. Grava `TIMER_STARTED` / `TIMER_ENDED`. |
| `commands.plan.ts` | `/lori-plan` | Roda wizard TUI. Cria `plan-draft.md` + `resources.md`. Adiciona módulo em `activeModules`. Dispara agente para gerar plano completo. |
| `commands.retro.ts` | `/lori-retro` | Cria `retro-{semana}.md` e próxima `week-NN.md` para cada módulo ativo. Grava `RETRO_DONE`. |
| `commands.stats.ts` | `/lori-stats` | Mostra estatísticas calculadas do estado em memória. |
| `commands.review.ts` | `/lori-review` | Envia mensagem instruindo agente a usar `lori_review_srs`. |
| `commands.rituals.ts` | `/lori-rituals` | Lista rituais por fase (pre/core/post). |
| `commands.weak.ts` | `/lori-weak` | Lista weaknesses ativas com contagem de erros. |
| `commands.resources.ts` | `/lori-resources` | Abre navegador TUI de arquivos `.md` do módulo ativo. |

### `index.ts` — Entry point

Cria `state` ref, `CycleService`, `timerInterval`. Chama `registerLoriListeners`, `registerTools`, `registerCommands`. Contém `startPeriodicTimer` e `stopPeriodicTimer`. Único lugar que gerencia o `setInterval` de 30s.

---

## 4. Grafo de Dependências

### Quem depende de quem (direção da seta: "chama/usa")

```
index.ts
  ├─> cycle.service.ts
  ├─> registerTools → tools/*.ts
  ├─> registerCommands → commands/*.ts
  ├─> registerLoriListeners → core.listeners.ts
  ├─> ui.status-bar.ts
  ├─> ui.timer-widget.ts
  ├─> ui.notifications.ts
  └─> events.persistence.ts

core.listeners.ts
  ├─> events.persistence.ts (appendEvent)
  ├─> events.projection.ts (rebuildState)
  ├─> core.config.ts (loadConfig, getTodayKey)
  ├─> context.detection.ts (isStudyContext, isStuckContext)
  ├─> context.injection.ts (buildContextMessage, buildStuckMessage)
  ├─> cycle.service.ts (restoreFromEvents)
  ├─> ui.status-bar.ts (updateStatus)
  ├─> ui.timer-widget.ts (updateTimerWidget)
  ├─> ui.notifications.ts (notifyTimerEnd, notifyTimerEnding, notifyWeaknessAdded)
  └─> srs.algorithm.ts (getDueCards)

events.projection.ts
  ├─> srs.persistence.ts (loadFlashcards)
  ├─> core.config.ts (loadConfig, getTodayKey, getWeekNumber)
  ├─> events.persistence.ts (loadEvents, ensureLoriDir)
  ├─> modules.io.ts (loadModule)
  ├─> modules.model.ts (LoriState)
  ├─> core.snapshot.ts (tryLoadSnapshot, deserializeState, writeSnapshot)
  └─> events.model.ts (LoriEvents)

context.injection.ts
  ├─> modules.model.ts (LoriState)
  └─> srs.algorithm.ts (getDueCards)

ui.status-bar.ts
  ├─> modules.model.ts (LoriState)
  └─> srs.algorithm.ts (getDueCards)

ui.timer-widget.ts
  ├─> modules.model.ts (LoriState)
  └─> cycle.service.ts (CycleService)

commands.start.ts
  ├─> events.projection.ts (rebuildState)
  ├─> core.config.ts (getTodayKey)
  ├─> events.persistence.ts (appendEvent)
  ├─> core.rituals.ts (suggestRitual, getRitual)
  └─> cycle.service.ts (startPreSession)

commands.end.ts
  ├─> events.persistence.ts (appendEvent)
  ├─> events.projection.ts (rebuildState)
  ├─> core.config.ts (loadConfig, saveConfig, getTodayKey)
  ├─> ui.status-bar.ts (updateStatus)
  ├─> ui.timer-widget.ts (updateTimerWidget)
  └─> cycle.service.ts (startPostSession, getElapsedMinutes)

commands.timer.ts
  ├─> events.persistence.ts (appendEvent)
  ├─> events.projection.ts (rebuildState)
  ├─> ui.status-bar.ts + ui.timer-widget.ts
  └─> cycle.service.ts (startTimer, startInSession, stopTimer)

commands.plan.ts
  ├─> events.persistence.ts (appendEvent, ensureLoriDir)
  ├─> events.projection.ts (rebuildState)
  ├─> core.config.ts (loadConfig, saveConfig)
  ├─> modules.io.ts (writeModuleFile, readModuleFile)
  ├─> ui.status-bar.ts (updateStatus)
  └─> ui.wizard.ts (runModuleWizard, buildAgentPrompt, slugifyTopic)

commands.retro.ts
  ├─> modules.io.ts (readModuleFile, writeModuleFile)
  └─> events.persistence.ts (appendEvent)

tools.log-event.ts
  ├─> events.persistence.ts (appendEvent)
  └─> ui.notifications.ts (notifyWeaknessAdded)

tools.review-srs.ts
  ├─> srs.algorithm.ts (calculateNextReview, getDueCards)
  └─> srs.persistence.ts (loadFlashcards, saveFlashcards)

tools.get-context.ts
  └─> srs.algorithm.ts (getDueCards)

tools.search-concepts.ts
  ├─> events.persistence.ts (getLoriDir)
  └─> modules.io.ts (readModuleFile)

tools.add-resource.ts
  ├─> events.persistence.ts (appendEvent, getLoriDir)
  └─> modules.io.ts (readModuleFile, writeModuleFile)

tools.create-flashcard.ts
  ├─> srs.algorithm.ts (createFlashcard)
  └─> srs.persistence.ts (addFlashcard)
```

### Módulos sem dependências internas (folhas)

- `events.model.ts`
- `events.persistence.ts` (só depende de node:fs)
- `cycle.model.ts`
- `srs.model.ts`
- `srs.algorithm.ts` (só depende de srs.model.ts)
- `context.detection.ts`
- `ui.notifications.ts`
- `core.rituals.ts`
- `commands.model.ts`
- `tools.model.ts`

---

## 5. Fluxos Principais

### 5.1 Inicialização (`session_start`)

1. Pi dispara `session_start`.
2. `core.listeners.ts` executa:
   - `loadConfig` → lê `.lori/config.json`.
   - `rebuildState` → lê `state.jsonl`, tenta `state-snapshot.json`, carrega flashcards e módulos do disco, replay de eventos, calcula métricas.
   - `setState` → guarda `LoriState` na ref criada em `index.ts`.
   - `cycleService.restoreFromEvents` → reconstrói fase da sessão.
   - `updateStatus` + `updateTimerWidget` → renderiza TUI.
   - `startPeriodicTimer` → inicia `setInterval` de 30s.
3. Se streak quebrado (gap > 1 dia), grava `STREAK_BROKEN` e notifica.
4. Se startup, notifica módulos ativos, SRS devido, streak em risco.

### 5.2 Ciclo de Estudo Completo

```
Usuário: /lori-start rust-foundations drill
  └─> commands.start.ts
      ├─> getState() (ou rebuildState se null)
      ├─> suggestRitual / getRitual
      ├─> cycleService.startPreSession(module, technique, objective)
      ├─> appendEvent(SESSION_STARTED)
      ├─> pi.appendEntry("lori-event", ...)
      └─> pi.sendMessage(mensagem de ritual para agente)

Usuário: /lori-timer start 50
  └─> commands.timer.ts
      ├─> cycleService.startTimer(50) + startInSession()
      ├─> appendEvent(TIMER_STARTED)
      ├─> rebuildState → setState
      └─> updateStatus + updateTimerWidget

... timer roda ...

Timer expira (turn_end ou periodic timer)
  └─> notifyTimerEnd
      ├─> appendEvent(TIMER_ENDED)
      ├─> pi.appendEntry
      └─> rebuildState → updateTimerWidget

Usuário: /lori-end 8 true
  └─> commands.end.ts
      ├─> cycleService.startPostSession()
      ├─> getElapsedMinutes()
      ├─> appendEvent(SESSION_ENDED)
      ├─> loadConfig + saveConfig (atualiza streak)
      ├─> rebuildState → setState
      ├─> updateStatus + updateTimerWidget
      └─> pi.sendMessage("Pós-sessão obrigatório...")
```

### 5.3 Criação de Módulo (`/lori-plan`)

1. `commands.plan.ts` chama `runModuleWizard` (TUI interativo com 5 perguntas).
2. Se cancelado: retorna.
3. Se confirmado:
   - `slugifyTopic` gera nome do módulo.
   - `ensureLoriDir` cria diretórios.
   - `writeModuleFile` cria `plan-draft.md` e `resources.md` (template).
   - `loadConfig` + `saveConfig` adiciona módulo em `activeModules`.
   - `appendEvent(PLAN_CREATED)` + `pi.appendEntry`.
   - `pi.sendMessage` dispara agente com prompt para gerar `plan.md`, `resources.md` completos e `week-01.md` até `week-NN.md`.
   - `rebuildState` + `updateStatus`.

### 5.4 SRS — Revisão de Flashcards

1. Usuário executa `/lori-review` → `commands.review.ts` envia mensagem para agente usar `lori_review_srs`.
2. Agent chama `lori_review_srs action=list_due`:
   - `tools.review-srs.ts` percorre `state.flashcards` (ou carrega do disco com `loadFlashcards`) → `getDueCards` → retorna JSON de cards devidos.
3. Agent chama `lori_review_srs action=review cardId=X quality=4`:
   - Carrega flashcards do módulo → encontra card → `calculateNextReview` (SM-2) → `saveFlashcards` → atualiza `state.flashcards` via `setState`.

### 5.5 Context Injection (`before_agent_start`)

1. Em todo turno do agente, `core.listeners.ts` intercepta `before_agent_start`.
2. Se `state` é null (ex: após compactação), faz `rebuildState`.
3. Se prompt do usuário contém palavras de bloqueio (`travei`, `não consigo`), injeta mensagem `lori-stuck` com protocolo de desbloqueio.
4. Se prompt contém palavras de estudo ou há módulos ativos, injeta mensagem `lori-context` (invisível) com: semana, módulos, weaknesses, SRS devido, streak, minutos de hoje, última sessão, timer ativo.
5. O Pi recebe essas mensagens como contexto extra no início do turno.

### 5.6 Timer Periódico (`setInterval` 30s)

1. `index.ts` inicia intervalo em `startPeriodicTimer`.
2. A cada 30s:
   - Se `activeTimer` existe, calcula `remaining`.
   - Se `remaining <= 0`: `notifyTimerEnd`, grava `TIMER_ENDED`, limpa timer, atualiza widget.
   - Se `remaining == 5`: atualiza widget (notificação de 5min restantes é tratada em `turn_end`).
   - Senão: atualiza widget.
   - Sempre: `updateStatus`.
3. `stopPeriodicTimer` limpa o intervalo no shutdown.

### 5.7 Compactação (`session_before_compact`)

1. Quando o Pi vai compactar contexto longo, dispara `session_before_compact`.
2. `core.listeners.ts` garante que `state` está carregado (`rebuildState` se necessário).
3. Percorre `messagesToSummarize`, extrai:
   - Tool calls `lori_*` (log event, review SRS, etc).
   - Mensagens do usuário contendo `/lori`, `weakness`, `confuso`.
4. Monta resumo com:
   - Estado preservado (módulos, weaknesses, streak, minutos).
   - Eventos chave recentes (até 20).
5. Retorna `compaction.summary` — o Pi usa isso no resumo, garantindo que o estado Lori sobreviva à compactação.

---

## 6. Onde o estado vive

| Tipo de estado | Arquivo | Quem escreve | Quem lê |
|----------------|---------|--------------|---------|
| Eventos brutos | `.lori/state.jsonl` | `events.persistence.ts:appendEvent` | `events.persistence.ts:loadEvents` |
| Snapshot | `.lori/state-snapshot.json` | `core.snapshot.ts:writeSnapshot` | `core.snapshot.ts:tryLoadSnapshot` |
| Config | `.lori/config.json` | `core.config.ts:saveConfig` | `core.config.ts:loadConfig` |
| Flashcards | `.lori/flashcards/{mod}.jsonl` | `srs.persistence.ts` | `srs.persistence.ts` |
| Módulos (planos, semanas) | `.lori/modules/{nome}/*.md` | `modules.io.ts:writeModuleFile` | `modules.io.ts:readModuleFile`, `loadModule` |
| Estado em memória | `let state: LoriState` em `index.ts` | `setState` | `getState`, `getStateRef` |
| Ciclo de sessão | `_cycle` em `CycleService` | métodos do CycleService | `getCycle`, `getTimerRemaining` |

---

## 7. Regras de Ouro

1. **Só `events.persistence.ts` escreve em `state.jsonl`.** Todos os outros módulos usam `appendEvent`.
2. **Só `events.projection.ts` faz `rebuildState`.** Commands e listeners chamam `rebuildState` quando precisam de estado fresco.
3. **Nenhum command/tool modifica estado em memória diretamente.** Eles gravam eventos e depois chamam `rebuildState` para refletir mudanças.
4. **Dual log sempre.** `appendEvent` no disco + `pi.appendEntry` no contexto. Exceção: alguns commands já fazem isso inline.
5. **CycleService é memória pura.** Se a sessão Pi reiniciar, o ciclo é reconstruído a partir dos eventos (`restoreFromEvents`).
