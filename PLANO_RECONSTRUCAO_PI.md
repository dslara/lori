# Plano: Ultralearning System Reconstruido como Pi Extension

> Prompt executavel para recriar projeto do zero aproveitando Pi Agent nativo.

---

## 1. Diagnostico do Projeto Atual

### O que existe (OpenCode-based)

| Camada | Implementacao | Problema |
|--------|---------------|----------|
| Commands | `.opencode/commands/*.md` (40+ arquivos markdown) | Nao sao executaveis; LLM interpreta texto e decide acoes |
| Tools | `.opencode/tools/*.ts` (15+ tools) | Roda dentro de plugin system externo (`@opencode-ai/plugin`) |
| Agents | `.opencode/agents/*.md` (@tutor, @meta, @review) | Frontmatter YAML + markdown; sem estado proprio |
| Dados | CSV local + OpenViking Docker | OpenViking requer container separado (2GB+ RAM), complexo |
| Memoria | OpenViking `viking://` URIs | Dependencia infra extra; fallback manual |
| UI | Nenhuma | Texto puro no chat |

### Dependencias problematicas

- `docker-compose.yml` com Ollama (12GB limite) + OpenViking (2GB)
- `@opencode-ai/plugin` como runtime de tools
- `zod` + `csv-parse` + `date-fns` + `glob` como deps
- Memoria distribuida entre CSV (quantitativo) e OpenViking (qualitativo)

---

## 2. O que Pi Agent resolve nativamente

| Problema Atual | Solucao Pi Nativa |
|----------------|-------------------|
| Commands como markdown | `pi.registerCommand()` — executavel com handler TypeScript |
| Tools em plugin externo | `pi.registerTool()` — tools nativas do Pi, chamadas pelo LLM |
| Agents como markdown | Skills (`SKILL.md`) + Extensions com logica de estado |
| Memoria OpenViking externa | `pi.appendEntry()` + `ctx.sessionManager` — persistencia nativa |
| UI texto puro | `ctx.ui.notify()`, `ctx.ui.setWidget()`, `ctx.ui.setStatus()` |
| Cronometro manual | Extension com `setInterval` + `ctx.ui.notify()` |
| Analytics manual | Tool results com `details` + reconstrucao de estado em `session_start` |
| Compactacao de contexto | `session_before_compact` — resumo customizado de sessoes de estudo |
| Branching de sessoes | `/tree` nativo do Pi — navegar entre tentativas de exercicio |

---

## 3. Arquitetura Alvo (Pi-Native)

```
pi-ultralearning/                    # Pi Package ou projeto local
├── .pi/
│   ├── extensions/
│   │   └── ultralearning/
│   │       ├── index.ts             # Entry point: registra tools, commands, eventos
│   │       ├── tools.ts             # Custom tools: session, flashcard, module, streak
│   │       ├── state.ts             # Logica de estado: CSV + reconstrucao sessionManager
│   │       ├── ui.ts                # Widgets, timer, notificacoes
│   │       └── analytics.ts         # Dashboard, relatorios
│   ├── skills/
│   │   ├── decomposition/           # Skill: decomposicao de objetivos
│   │   │   └── SKILL.md
│   │   ├── srs-generator/           # Skill: flashcards SRS
│   │   │   └── SKILL.md
│   │   ├── debug-socratic/          # Skill: debug com perguntas
│   │   │   └── SKILL.md
│   │   └── session-orchestrator/    # Skill: fluxo start/drill/end
│   │       └── SKILL.md
│   └── prompts/                     # Prompt templates (ex: /ul-study-start)
│       ├── ul-study-start.md
│       ├── ul-study-end.md
│       └── ul-plan-weekly.md
├── data/                            # CSV (mesmo schema, simplificado)
│   ├── sessions.csv
│   ├── flashcards.csv
│   ├── modules.csv
│   └── insights.csv
└── projects/                        # Modulos de aprendizado
```

### Por que Pi-native e superior

1. **Zero containers**: Sem Docker, sem OpenViking, sem Ollama. Pi usa modelos via API nativa.
2. **State nativo**: `appendEntry()` persiste no proprio session file do Pi. CSV continua como fonte de verdade quantitativa.
3. **Tools reais**: LLM chama tools via function calling nativo, nao interpreta markdown.
4. **UI integrada**: Streak aparece no footer. Timer como widget. Notificacoes no TUI.
5. **Eventos**: `tool_call` intercepta qualquer edicao em `data/` para auto-log. `before_agent_start` injeta contexto de estudo automaticamente.
6. **Hot reload**: `/reload` atualiza extensions sem restart.

---

## 4. Componentes Pi a Implementar

### 4.1 Extension `ultralearning`

Local: `.pi/extensions/ultralearning/index.ts`

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  // === STATE ===
  // Reconstroi estado de data/*.csv em session_start
  // Persiste operacoes via appendEntry()

  // === EVENTS ===
  pi.on("session_start", async (event, ctx) => {
    // Carrega CSVs para memoria
    // Injeta contexto do modulo ativo no system prompt se detectar prompt de estudo
  });

  pi.on("before_agent_start", async (event, ctx) => {
    // Se prompt comecar com "/ul-" ou keywords de estudo,
    // injeta contexto hibrido (sessoes recentes, streak, flashcards pendentes)
  });

  pi.on("tool_call", async (event, ctx) => {
    // Log automatico: qualquer tool de estudo incrementa metricas
    // Gate: confirmar antes de resetAll
  });

  pi.on("session_before_compact", async (event, ctx) => {
    // Resumo customizado: manter pontos fracos, recursos descobertos, marcos
  });

  // === CUSTOM TOOLS ===
  pi.registerTool({ name: "ul_session", ... });      // createSession, getSessions
  pi.registerTool({ name: "ul_flashcard", ... });    // createFlashcard, review (SM-2)
  pi.registerTool({ name: "ul_module", ... });       // createModule, switch, archive
  pi.registerTool({ name: "ul_insight", ... });      // streak, dashboard, analytics
  pi.registerTool({ name: "ul_context", ... });      // getSessionContext, getWeaknesses

  // === COMMANDS ===
  pi.registerCommand("ul-status", { ... });          // /ul-status → widget streak
  pi.registerCommand("ul-timer", { ... });           // /ul-timer start|stop
  pi.registerCommand("ul-backup", { ... });          // /ul-backup → zip data/

  // === UI ===
  // Timer pomodoro no widget
  // Streak no status bar
}
```

### 4.2 Skills

| Skill | Conteudo | Gatilho |
|-------|----------|---------|
| `decomposition` | Framework 3D (Conceitos 40%, Fatos 20%, Procedimentos 40%), decomposicao em 5 niveis | `/skill:decomposition` ou quando usuario pede para planejar modulo |
| `srs-generator` | Algoritmo SM-2, criacao de cards, revisao | `/skill:srs-generator` ou `/ul-study-memorize` |
| `debug-socratic` | 5 perguntas para debug, nunca entrega solucao | `/skill:debug-socratic` ou `/ul-study-debug` |
| `session-orchestrator` | Checklist pre-sessao, fluxo start/drill/end, dicas de foco | Automatico quando `before_agent_start` detecta contexto de estudo |

### 4.3 Prompt Templates

Migrar os commands markdown atuais para prompt templates Pi (`/template`):

| Template | Conteudo |
|----------|----------|
| `ul-study-start` | Carrega contexto, quiz warm-up, sugere atividade baseada em error_rate |
| `ul-study-end` | Salva sessao, atualiza streak, memcommit equivalente |
| `ul-plan-weekly` | Estrutura Seg-Qua (conceitos) / Qui-Sex (projeto) / Sab (revisao) |
| `ul-plan-retro` | Perguntas: o que funcionou, o que nao, ajustes |

### 4.4 Dados

Mantem CSV como fonte primaria (offline-first, diff-friendly), mas simplifica:

| Arquivo | Campos essenciais |
|---------|-------------------|
| `sessions.csv` | id, date, module_id, duration, focus_score, success_rating, notes |
| `session_skills.csv` | session_id, topic, technique, correct |
| `flashcards.csv` | id, front, back, next_review, interval, ef, repetitions, module_id |
| `modules.csv` | id, name, status, started_at, total_hours, is_active |
| `insights.csv` | date, metric, value |

Elimina `reviews.csv` (derivado de flashcards.csv) e `users.csv` (nao necessario com Pi).

---

## 5. Prompt Executavel

> Cole isto no Pi para criar projeto do zero.

```
Crie sistema de ultralearning como Pi Extension nativo. Requisitos:

1. EXTENSION `.pi/extensions/ultralearning/index.ts`:
   - Registar 5 custom tools: ul_session, ul_flashcard, ul_module, ul_insight, ul_context
   - Registar 3 commands: /ul-status, /ul-timer, /ul-backup
   - Eventos:
     * session_start: carregar CSVs para memoria
     * before_agent_start: se prompt contiver "estudar", "drill", "feynman", "quiz", injetar contexto (streak, modulo ativo, cards pendentes)
     * tool_call: interceptar "rm" ou "resetAll" para confirmacao; logar operacoes de estudo
     * session_before_compact: gerar resumo que mantenha pontos fracos e recursos descobertos
   - UI: widget mostrando streak atual e timer de foco ativo; notificacao quando timer acabar

2. SKILLS em `.pi/skills/`:
   - decomposition: framework 3D para decompor objetivos de aprendizado
   - srs-generator: criar e revisar flashcards com algoritmo SM-2
   - debug-socratic: guia com perguntas, nunca entrega solucao
   - session-orchestrator: checklist e fluxo de sessao

3. PROMPT TEMPLATES em `.pi/prompts/`:
   - ul-study-start: carrega contexto, warm-up, sugere atividade
   - ul-study-end: salva sessao, atualiza streak
   - ul-plan-weekly: plano semanal com estrutura fixa
   - ul-plan-retro: retrospectiva com perguntas padrao

4. DADOS em `data/*.csv` (schema minimo):
   - sessions: id,date,module_id,duration,focus_score,success_rating,notes
   - session_skills: session_id,topic,technique,correct
   - flashcards: id,front,back,next_review,interval,ef,repetitions,module_id
   - modules: id,name,status,started_at,total_hours,is_active
   - insights: date,metric,value

5. LOGICA DE ESTADO:
   - Usar appendEntry() para persistir operacoes no session file do Pi
   - Em session_start, reconstruir estado lendo entries customType "ul-state"
   - Manter CSV como fonte de verdade; appendEntry como log de operacoes para reconstrucao rapida

6. INTEGRACAO:
   - Nao usar containers Docker
   - Nao usar memoria externa (OpenViking)
   - Nao usar plugin system externo
   - Tudo via Pi Extension API nativa

Comecar criando estrutura de diretorios, package.json com dependencias minimas (date-fns, csv-parse, csv-stringify), e extension principal. Depois skills e templates.
```

---

## 6. Roadmap de Implementacao

### Fase 1: Scaffold (30 min)
- [ ] Criar `.pi/extensions/ultralearning/` com `index.ts`, `package.json`
- [ ] Configurar `package.json` com deps: `date-fns`, `csv-parse`, `csv-stringify`
- [ ] Criar schema CSV e funcoes utilitarias (`utils-csv.ts`)
- [ ] Registrar entry point basico com `pi.registerTool()` e `pi.registerCommand()`

### Fase 2: Core Tools (1h)
- [ ] Implementar `ul_session`: createSession, getSessions
- [ ] Implementar `ul_flashcard`: createFlashcard, review com SM-2
- [ ] Implementar `ul_module`: createModule, switchModule, archiveModule
- [ ] Implementar `ul_insight`: getStreak, updateStreak, dashboard
- [ ] Implementar `ul_context`: getSessionContext, getWeaknesses

### Fase 3: Eventos e State (45 min)
- [ ] `session_start`: carregar CSVs
- [ ] `before_agent_start`: injetar contexto de estudo
- [ ] `tool_call`: logging automatico + gates de seguranca
- [ ] `session_before_compact`: resumo customizado
- [ ] `appendEntry` + reconstrucao de estado

### Fase 4: UI e Commands (45 min)
- [ ] `/ul-status`: widget com streak e modulo ativo
- [ ] `/ul-timer`: pomodoro timer com notificacao
- [ ] `/ul-backup`: zip data/
- [ ] Status bar mostrando streak persistente

### Fase 5: Skills (1h)
- [ ] `decomposition/SKILL.md`
- [ ] `srs-generator/SKILL.md`
- [ ] `debug-socratic/SKILL.md`
- [ ] `session-orchestrator/SKILL.md`

### Fase 6: Prompt Templates (30 min)
- [ ] `ul-study-start.md`
- [ ] `ul-study-end.md`
- [ ] `ul-plan-weekly.md`
- [ ] `ul-plan-retro.md`

### Fase 7: Migracao de Dados (30 min)
- [ ] Converter dados existentes para novo schema (se houver)
- [ ] Validar CSVs
- [ ] Testar end-to-end: /ul-study-start -> drill -> /ul-study-end

---

## 7. Comparativo: Antes vs Depois

| Aspecto | Antes (OpenCode) | Depois (Pi Native) |
|---------|------------------|--------------------|
| Runtime | Plugin externo + Docker | Pi Extension nativa |
| Memoria | CSV + OpenViking container | CSV + sessionManager nativo |
| Commands | Markdown interpretado | Commands executaveis TypeScript |
| Tools | Plugin system | registerTool() nativo |
| UI | Texto puro | Widgets, status bar, notificacoes |
| Timer | Manual/externo | Extension com setInterval + UI |
| State | Manual em CSV | appendEntry + reconstrucao automatica |
| Compactacao | Padrao do OpenCode | Customizada para contexto de estudo |
| Branching | Nao existe | /tree nativo para tentativas de exercicio |b
| Hot Reload | Restart container | `/reload` instantaneo |
| Dependencias | 7 packages + 2 containers | 3 packages + 0 containers |

---

## 8. Extensoes Futuras (pos-MVP)

1. **Analytics Visual**: Custom renderer para `ul_insight` mostrar grafico ASCII no TUI
2. **Habit Tracker**: Extension que detecta horario do dia e sugere sessao automaticamente via `ctx.ui.notify()`
3. **Spaced Repetition Scheduler**: Background job usando `pi.sendUserMessage()` para lembrar revisoes
4. **Benchmark Runner**: Tool que executa testes de proficiencia e grava resultados
5. **Sync Cloud**: Command `/ul-sync` para fazer push/pull de dados CSV via git ou API
6. **Modelo Adaptativo**: Ajustar temperature do Pi baseado em error_rate do aluno via `pi.setThinkingLevel()`

---

*Plano gerado em 2026-04-17. Executar prompt da secao 5 no Pi para comecar.*
