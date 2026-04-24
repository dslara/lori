# Lori — Plano de Implementação Técnico
## Fase 1: Dashboard + Sessões de Estudo + Timer + XP/Streak + Skins

Objetivo: validar engajamento antes de investir em sistemas complexos (SRS, árvore de habilidades, quests, etc.).

---

## Contexto

Lori é extensão Pi que transforma aprendizado acelerado em jogo single-player no terminal. Fase 1 valida engajamento com loop mínimo viável: planejar domínio, iniciar sessão Pomodoro, ganhar XP e manter streaks diários — tudo sem backend.

Codebase `lori-pi-package` está em estágio estrutural: `package.json` declarado, diretórios vazios (`extensions/`, `skins/`, `skills/`). Ainda não há código TypeScript.

---

## SDK Capabilities Mapeadas

SDK Pi fornece primitives para comandos, TUI e eventos. Fase 1 consome apenas subset necessário: extensões para comandos, widgets para timer e status, e eventos para injeção de contexto LLM.

| Capacidade SDK | Como se Aplica à Fase 1 |
|---|---|
| **Extensions** (`pi.registerCommand`, `pi.on`) | Comandos `/lori`, `/lori plan`, `/lori start [domain]`, `/lori end`, `/lori skin [name]`; event handlers para `session_start`, `before_agent_start` |
| **Custom UI / TUI** (`ctx.ui.setWidget`, `ctx.ui.setStatus`, `ctx.ui.select`, `ctx.ui.input`) | Timer como widget persistente acima do editor; footer status com streak/skin; menus simples via `select` |
| **Session persistence** (`pi.appendEntry`) | **Não usado.** Persistência via arquivo flat local apenas |
| **Themes nativos** | **Não usado.** Skins são arquivos de strings independentes do tema Pi |
| **Tools customizadas** | **Nenhuma em Fase 1.** LLM recebe contexto via `before_agent_start` |
| **Skills** (`SKILL.md`) | Skill `ultralearning` já declarada; instruções para o agente sobre técnicas de estudo |

---

## Arquitetura: Ports Diretos

Dashboard é único orquestrador. Conhece múltiplos domínios e chama ports diretamente. Domínios permanecem puros e testáveis. Não há event bus.

Cada domínio expõe port (interface), implementado por adapter concreto. Tabela abaixo mapeia entidades, contratos e persistência.

| Domínio | Entidade | Port (interface) | Adapter concreto |
|---|---|---|---|
| **Session** | `StudySession { id, domainId, startedAt, plannedDurationSec, status }` | `SessionPort`: `start(domainId, plannedDurationSec)`, `end()`, `getActive()` | `FileSessionAdapter` — grava `.lori/active-session.json` no start, reconstrói no `session_start` |
| **Timer** | `TimerState { remainingSec, intervalId? }` | `TimerPort`: `start(sec)`, `stop()`, `onTick(cb)` | `NodeTimerAdapter` (`setInterval` 1s, precisão ±1s) |
| **XP/Streak** | `PlayerProfile` (ver schema abaixo) | `XPPort`: `grantXP(domainId, minutes, completed)`, `getStreak()`, `commit()` | `JsonFileXPAdapter` (`.lori/state.json`) |
| **Skin** | `SkinManifest { id, name, strings, ascii? }` | `SkinPort`: `getString(key, vars)`, `listSkins()` | `JsonSkinAdapter` — escaneia `skins/*.json` em runtime |
| **Dashboard** | — | Orquestra comandos, aciona widgets, gerencia lifecycle Pi | `PiDashboardAdapter` (entry point em `index.ts`) |

Session não conhece Timer, XP nem Skin. Apenas inicia, encerra e persiste seu estado. Timer não conhece Session. XP não conhece UI. Skin não conhece lógica de negócio. Dashboard é única camada de infraestrutura Pi.

Comando `/lori` abre menu dinâmico. Idle exibe Plan, Start, Skin. Active exibe Plan, End, Skin. Atalhos diretos pulam menu para ações frequentes.

```
/lori         → Dashboard abre menu dinâmico via ctx.ui.select()
  ↳ Plan      → ctx.ui.input("Domain name:") → slug auto (kebab-case)
              → cria .lori/domains/<slug>/domain.json
  ↳ Start     → Se 1 domínio: usa lastDomainId
                Se 2+ domínios: ctx.ui.select() de domínios
              → Session.start() → grava active-session.json
              → Timer.start() → widget atualiza a cada tick
              → Footer status: streak + skin
  ↳ End       → Session.end() → Timer.stop()
              → XP.grantXP() → commit state.json
              → notificação com string da skin ativa
  ↳ Skin      → ctx.ui.select() de skins descobertos em skins/
              → salva activeSkin em state.json

Atalhos diretos:
/lori plan <name>    → cria domínio sem menu
/lori start [domain] → inicia sessão (sem arg = lastDomainId)
/lori end            → finaliza sessão ativa
/lori skin <name>    → muda skin
```

---

## Decisões Arquiteturais

### 1. Persistência — Arquivo Flat Local

`.lori/state.json` é o save game duradouro. Sobrevive a `/new`, `/resume`, `/reload`. Commit apenas no `end` da sessão. Schema versionado para migrações futuras.

`.lori/active-session.json` é estado volátil. Gravado no `start`, reconstruído no `session_start` calculando `remaining` pelo wall clock. Deletado no `end` limpo. Threshold stale: 30 min.

Arquivo flat é única fonte de verdade. `pi.appendEntry` não participa do contexto LLM. Para contexto ao LLM, usamos `before_agent_start` injetando estado ativo no system prompt.

### 2. Timer — Widget + Overtime

Widget via `ctx.ui.setWidget` acima do editor. Mostra tempo restante (MM:SS, pode ir negativo) + nome do domínio. Footer via `ctx.ui.setStatus` exibe streak + skin.

Ao atingir 00:00, timer continua contando negativo. Usuário deve `/lori end` manualmente. XP calculado por minuto real estudado.

`setInterval` de 1s recalcula `remaining` a partir de `startedAt` a cada tick, evitando drift. Evento `session_start` reconstrói timer a partir de `active-session.json`.

### 3. Skins — Decoupled do Tema Pi

Skin é arquivo JSON de strings temáticas em `skins/<id>.json`. Contém `id`, `name`, `strings` com templates (`{domain}`, `{xp}`, `{streak}`, `{name}`, `{min}`), e `ascii?` opcional.

```json
{
  "id": "rpg",
  "name": "RPG",
  "strings": {
    "session.started": "Aventura em {domain} começou!",
    "session.ended": "Missão completa. {xp} XP conquistados.",
    "xp.gained": "+{xp} XP",
    "streak.incremented": "{streak} dias de fogo sagrado!",
    "streak.broken": "A chama se extinguiu...",
    "domain.created": "Novo território: {name}",
    "timer.overtime": "Além do limite! +{min} min"
  },
  "ascii": {
    "session.started": "   ⚔️   ",
    "session.ended": "   🏆   "
  }
}
```

`JsonSkinAdapter` escaneia `skins/*.json` em runtime. Usuário adiciona skins sem editar código. `activeSkin` fica em `state.json`. Padrão é `minimal` (neutro).

Cores do widget seguem tema Pi ativo (`theme.fg()`/`theme.bg()`). Skin define apenas texto e atmosfera narrativa, nunca cores.

### 4. XP/Streak — Fórmula Definida

Base: 10 XP/min. Bônus completion: +25 XP se `elapsedSec >= plannedDurationSec`. Bônus streak: +10% XP por dia consecutivo, máx +50% em 5+ dias.

Dia de qualificação é calendar day local. Sessão completada (`elapsed >= planned`) conta para aquele dia. Streak incrementa se última sessão completada foi no dia anterior. Gap de um calendar day zera streak na próxima sessão.

Limite de bônus: streak máximo de 5 dias para efeito de multiplicador. Streak visual pode continuar além.

Exemplo: 25 min completos, streak 3 dias. Base 250 + completion 25 = 275. Streak +30% = 357,5 → arredonda para 358 XP.

### 5. Scaffolding do `plan`

Wizard `/lori plan` pede nome do domínio via `ctx.ui.input`. Slug auto em kebab-case. Se existe, append `-2`, `-3`, etc. Cria `.lori/domains/<slug>/domain.json`.

```json
{
  "slug": "japanese",
  "name": "Japanese",
  "createdAt": "2026-04-24T10:00:00.000Z",
  "totalXP": 0,
  "sessions": 0
}
```

Schema do domínio: `slug`, `name`, `createdAt`, `totalXP`, `sessions`. Sem descrição. Técnica é Pomodoro 25 min, hardcoded e não configurável.

### 6. Tratamento de Erros

`state.json` corrompido: renomeia para `state.json.bak.<timestamp>`, inicia fresh com defaults (`totalXP: 0`, `streak: 0`, `activeSkin: "minimal"`), notifica sobre possível perda de dados.

Falha ao escrever `active-session.json`: fail fast. Não inicia sessão. Notifica erro explícito ao usuário.

### 7. LLM Context Injection

`before_agent_start` injeta no system prompt quando há sessão ativa:

```
[Lori] Domain: Japanese | Remaining: 12:34 | Streak: 3 days | Skin: RPG
```

Sem sessão ativa, nenhuma injeção. Contexto funcional para que LLM saiba que usuário está estudando, sem fantasias que confundiriam o modelo.

### 8. Dashboard Menu Dinâmico

`/lori` sem args abre `ctx.ui.select()`. Idle: [Planar domínio] [Iniciar sessão] [Trocar skin]. Active: [Planar domínio] [Encerrar sessão] [Trocar skin].

Start é substituído por End quando há sessão ativa. Nunca permite iniciar nova sessão sobre outra ativa, evitando erro silencioso.

---

## Dependências e Pré-requisitos

| Pré-requisito | Especificação |
|---|---|
| **Pi SDK** | Peer dependencies já declarados: `@mariozechner/pi-coding-agent`, `@mariozechner/pi-tui`, `@mariozechner/pi-ai`, `@sinclair/typebox` |
| **Node.js** | >= 18 (jiti transpilation, fs/promises) |
| **Permissões** | Leitura/escrita no diretório do projeto para criar `.lori/` e subdiretórios |
| **Infraestrutura** | Zero — tudo local, sem backend, sem API keys externas |
| **Integrações** | Nenhuma externa nesta fase |

---

## Estrutura de Arquivos do Codebase

Entry point em `extensions/lori/index.ts` registra comandos e eventos. `core/` define ports e types. `domain/` implementa adapters. `dashboard.ts` orquestra tudo.

```
lori-pi-package/
├── extensions/
│   └── lori/
│       ├── index.ts              # Entry point: registra comandos, eventos, wiring
│       ├── core/
│       │   ├── ports.ts          # Interfaces SessionPort, TimerPort, XPPort, SkinPort
│       │   └── types.ts          # Entidades (StudySession, PlayerProfile, SkinManifest)
│       ├── domain/
│       │   ├── session.ts        # FileSessionAdapter (active-session.json)
│       │   ├── timer.ts          # NodeTimerAdapter (setInterval + widget)
│       │   ├── xp.ts             # Cálculo puro + JsonFileXPAdapter (state.json)
│       │   └── skin.ts           # JsonSkinAdapter (escaneia skins/)
│       └── dashboard.ts          # PiDashboardAdapter: orquestração + menus + widgets
├── skins/
│   ├── minimal.json              # Skin padrão (neutro)
│   └── rpg.json                  # Skin temática
├── skills/
│   └── ultralearning/
│       └── SKILL.md
├── package.json
└── PLAN.md
```

---

## Critérios de Entrega (Definition of Done)

Funcional: menu dinâmico, criação de domínio, timer com widget, cálculo de XP, streak diário funcional. Skins: troca altera mensagens; `minimal` e `rpg` funcionando.

Timer: precisão ±1s em 25 min; atualiza a cada segundo sem travar TUI; survive `/reload` via reconstrução de `active-session.json`.

XP/Streak: `state.json` persiste entre sessões; streak incrementa em dia consecutivo com sessão completada; zera após gap; bônus de streak aplica corretamente.

Testes manuais end-to-end (comandos + widget + persistência) e unitários para cálculo de XP e streak. Performance: widget renderiza em <16ms, timer não causa flicker, memória estável em 2h+.

Métrica proxy: número de sessões iniciadas/finalizadas por dia durante período de teste (7 dias).

---

## Resumo de Decisões

Tabela rápida das 26 decisões arquiteturais tomadas para Fase 1. Serve como referência para revisões e alinhamento da equipe.

| # | Decisão | Escolha |
|---|---|---|
| 1 | Scope Fase 1 | Completo: Dashboard + Sessions + Timer + XP/Streak + Skins |
| 2 | Arquitetura | Sem event bus; Dashboard orquestra ports diretamente |
| 3 | Persistência | Flat file: `.lori/state.json` (save) + `.lori/active-session.json` (volátil) |
| 4 | Timer | Widget persistente acima do editor; overtime (conta negativo); usuário encerra manualmente |
| 5 | Timer persistência | Grava `startedAt` + `plannedDuration` + `domainId` no start; recalcula remaining do wall clock |
| 6 | Timer stale | 30 min threshold; arquivo mais velho = sessão abandonada |
| 7 | Skin | Decoupled do tema Pi; `activeSkin` em `state.json`; strings temáticas em `skins/*.json` |
| 8 | Skin descoberta | Escaneia `skins/` em runtime; usuário adiciona sem código |
| 9 | Skin schema | `id`, `name`, `strings` (templates com vars), `ascii?` opcional |
| 10 | Pi themes | Nenhum custom theme; usa built-in dark/light do Pi |
| 11 | `plan` wizard | Apenas nome via `ctx.ui.input()`; slug auto kebab-case; sem descrição |
| 12 | Técnica/duração | Hardcoded Pomodoro 25 min; não configurável em Fase 1 |
| 13 | `/lori start` no domain | Usa `lastDomainId` de `state.json`; se 2+ domínios mostra selector |
| 14 | `/lori start` collision | Bloqueia se sessão ativa; notifica erro |
| 15 | Widget conteúdo | Timer (MM:SS) + nome do domínio |
| 16 | Footer conteúdo | Streak atual + nome da skin via `ctx.ui.setStatus` |
| 17 | Dashboard menu | Dinâmico: idle=[Plan][Start][Skin], active=[Plan][End][Skin] |
| 18 | Dashboard UI | `ctx.ui.select()` simples; sem overlay custom |
| 19 | `/lori end` no session | Erro explícito: "Nenhuma sessão ativa" |
| 20 | `state.json` corruption | Backup com timestamp → fresh start → notificação |
| 21 | Session save failure | Fail hard; não inicia sessão |
| 22 | Custom tools | Nenhuma em Fase 1 |
| 23 | LLM context | `before_agent_start` injeta domain/remaining/streak/skin |
| 24 | Streak qualification | Sessões completadas apenas (`elapsed >= planned`) |
| 25 | XP fórmula | 10 XP/min + 25 completion + 10%/dia streak bônus (máx 50%) |
| 26 | `state.json` schema | Aceito: version, totalXP, streak, activeSkin, lastDomainId, domains, sessionHistory |
