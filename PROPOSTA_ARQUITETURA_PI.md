# Ultralearning sobre Pi — Nova Proposta Arquitetural

> Sistema de aprendizado autodirigido para CS Fundamentals. Não é adaptação do atual. É reinvenção usando Pi Agent como plataforma nativa.

---

## 1. Visão

O estudante não "usa" um sistema. O Pi **é** o ambiente de aprendizado. Cada sessão de estudo acontece dentro de uma sessão Pi normal. O aluno conversa, escreve código, lê documentação — tudo no mesmo terminal. O Pi sabe onde ele parou, o que erra, o que domina. Não há context switching.

**Objetivo final:** Instalar via `pi install git:dslara/ultralearning` e começar a estudar.

---

## 2. Filosofia

| Princípio | Implicação |
|-----------|------------|
| **O terminal é a sala de aula** | Sem dashboards web, sem apps mobile. Tudo no TUI do Pi. |
| **Aprendizado é narrativa, não transação** | Não existe "CREATE session". Existe ciclos: preparar → focar → consolidar → refletir. |
| **Memória é contexto, não banco** | O LLM sabe que o aluno erra closures porque o contexto é injetado, não consultado. |
| **Técnica é ritual, não feature** | Cada método de aprendizado (Feynman, SRS, Drill) é um ritual completo com passos, não um comando solto. |
| **Erro é dado, não falha** | Cada erro gera evento. Padrões de erro são a matéria-prima da estratégia. |

---

## 3. O que muda radicalmente

| Aspecto | Abordagem Atual | Nova Proposta |
|---------|----------------|---------------|
| **Distribuição** | Clone git + Docker + setup manual | `pi install` como Pi Package |
| **Infraestrutura** | Docker (Ollama + OpenViking) | Zero containers. Zero bancos. |
| **Dados** | CSVs + memória vetorial externa | Event sourcing nativo do Pi (`appendEntry`) |
| **Agentes** | Arquivos markdown estáticos (`@tutor`, `@meta`) | Extension TypeScript viva, eventos, UI |
| **Contexto** | Tool `context-hybrid` chamada manual | Injeção automática via `before_agent_start` |
| **Interface** | Commands markdown + texto puro | Widgets TUI, timer integrado, status bar |
| **Branching** | Inexistente | `/tree` nativo para tentar exercício de 3 formas diferentes |
| **Compactação** | Padrão do Pi (genérica) | Customizada: mantém pontos fracos, recursos, decisões |
| **Curadoria** | Indexação automática de recursos | Seleção manual com ajuda do agente |

---

## 4. Arquitetura de Componentes

### 4.1 Pi Package `ultralearning`

Distribuído como pacote npm/git. Instala extension, skills, prompts e tema.

```
package.json
  pi:
    extensions: ["./extensions/ultralearning/index.ts"]
    skills: ["./skills"]
    prompts: ["./prompts"]
    themes: ["./themes"]
```

Instalação única:
```bash
pi install git:github.com/dslara/ultralearning
```

### 4.2 Extension `.pi/extensions/ultralearning/`

Cérebro do sistema. TypeScript. Event-driven.

**Módulos internos:**

| Módulo | Responsabilidade |
|--------|-----------------|
| `index.ts` | Entry point. Registra tools, commands, listeners. |
| `cycle.ts` | Máquina de estados dos ciclos de aprendizado. |
| `context.ts` | Monta e injeta `ul-context` via `before_agent_start`. |
| `events.ts` | Persiste e recupera eventos de `appendEntry` + `state.jsonl`. |
| `memory.ts` | Reconstrói estado projetado a partir do log de eventos. |
| `ui.ts` | Timer, widgets, notificações, status bar. |
| `skills.ts` | Registra skills dinamicamente e mapeia para rituais. |

**Eventos Pi interceptados:**

| Evento Pi | O que a extension faz |
|-----------|----------------------|
| `session_start` | Carrega eventos. Reconstrói estado. Mostra streak no footer. |
| `before_agent_start` | Detecta keywords de estudo. Injeta `ul-context` como mensagem customizada. |
| `tool_call` (write/edit) | Intercepta mutações em `.ultralearning/` para gerar eventos automáticos. |
| `session_before_compact` | Gera resumo UL-aware: mantém pontos fracos, recursos, próximos passos. |
| `turn_end` | Se timer ativo, verifica se sessão acabou. Notifica. |
| `session_shutdown` | Garante que eventos pendentes foram salvos. |

### 4.3 Estado: Event Sourcing Nativo

Tudo que acontece é um evento append-only. O estado atual é projeção dos eventos.

**Persistência dupla:**
1. `pi.appendEntry("ul-event", event)` — vive na sessão Pi, sobrevive a compaction
2. `.ultralearning/state.jsonl` — réplica local para durabilidade entre sessões

**Eventos:**

```typescript
type ULEvent =
  | { type: "plan_created"; module: string; weeks: number; goals: string[] }
  | { type: "session_started"; module: string; technique: string; objective: string }
  | { type: "session_ended"; duration: number; focus: number; honest: boolean; notes: string }
  | { type: "concept_learned"; concept: string; analogy: string; confidence: number }
  | { type: "drill_completed"; topic: string; attempts: number; errors: number }
  | { type: "feynman_done"; concept: string; gaps: string[] }
  | { type: "weakness_identified"; concept: string; symptom: string }
  | { type: "weakness_resolved"; concept: string }
  | { type: "resource_curated"; url: string; notes: string; tags: string[] }
  | { type: "retro_done"; wins: string[]; losses: string[]; adjustments: string[] }
  | { type: "streak_broken"; reason: string }
  | { type: "module_completed"; module: string; benchmark: number };
```

**Estado projetado (recalculado no `session_start`):**

```typescript
interface ULState {
  activeModule: string;
  streak: number;
  totalHours: number;
  weekNumber: number;
  weaknesses: Array<{ concept: string; errors: number; lastSeen: string }>;
  recentSessions: Array<{ date: string; technique: string; topic: string }>;
  pendingSRS: number;
  planProgress: number;
}
```

### 4.4 Contexto Vivo

Bloco injetado automaticamente quando `before_agent_start` detecta contexto de estudo:

```
[ULTRALEARNING CONTEXT]

Módulo ativo: rust-async
Semana: 3 de 6
Streak: 12 dias

Foco de hoje: Lifetime elision

Pontos fracos ativos:
  - closure + ownership (3 erros)
  - async/await pinning

Última sessão:
  - Técnica: drill
  - Tópico: move semantics
  - Duração: 52min, foco: 8/10

Próxima revisão SRS: closure (hoje)
```

Não existe "consulta". O contexto **já está lá** na janela de contexto do LLM.

### 4.5 Skills como Rituais

Cada técnica de aprendizado é uma skill com ritual completo. Invocada via `/skill:ul-feynman` ou guiada automaticamente pelo ciclo.

**Skills core:**

| Skill | Ritual | Quando usar |
|-------|--------|-------------|
| `ul-pomodoro` | Timer 50/10, proteção de interrupções | Antes de qualquer técnica |
| `ul-retrieval` | Quiz adaptativo baseado em histórico de erros | Warm-up ou revisão |
| `ul-feynman` | Explicar para criança de 5 anos, identificar gaps | Quando achar que "entendeu" |
| `ul-drill` | Exercício → erro → análise → repetição → progressão | Para automatizar procedimentos |
| `ul-srs` | Flashcards SM-2, criação e revisão | Para fatos, sintaxe, APIs |
| `ul-directness` | Projeto real, code review socrático | Para consolidar em contexto real |
| `ul-debug-socratic` | 5 perguntas sistemáticas | Quando travar no código |
| `ul-decomposition` | Framework 3D (conceitos/fatos/procedimentos) | Ao iniciar novo tópico |
| `ul-retro` | Retrospectiva semanal com ajustes | Todo domingo |

Cada skill é um diretório com `SKILL.md`, scripts auxiliares, e referências.

### 4.6 UI Integrada no TUI

**Status bar persistente:**
```
[rust-async W3] 🔥12 ⚡2 weaknesses ⏳3 SRS  [glm-5]  [tokens: 12k/200k]
```

**Widget de sessão ativa:**
```
┌────────────────────────────────────┐
│ ⏱️ 32m / 50m  ████████████████░░░░ │
│ 🎯 Lifetime elision                │
│ 🔧 Drill Nível 2                   │
│ 💡 Dica: pense em "quem empresta"  │
└────────────────────────────────────┘
```

**Notificações:**
- Timer acabando: `ctx.ui.notify("⏱️ 5 minutos restantes", "warning")`
- SRS pendente: `ctx.ui.notify("📚 3 flashcards para revisar", "info")`
- Streak em risco: `ctx.ui.notify("🔥 Streak acaba em 4h!", "error")`

**Custom footer:** Substitui footer padrão do Pi para mostrar dados UL.

### 4.7 Markdown como Memória Qualitativa

Eventos capturam **o que aconteceu**. Markdown captura **o que foi aprendido**.

```markdown
<!-- .ultralearning/modules/rust-async/concepts.md -->

## Lifetime Elision
**Data**: 2026-04-02
**Confiança**: 7/10
**Analogia**: "O compilador adivinha o pronome 'ele' em português."
**Gaps**: Regra dos 3 contextos. Preciso revisar.
**Cards SRS**: ✅ Criado
```

### 4.8 Flashcards SRS

```jsonl
// .ultralearning/flashcards/rust-async.jsonl
{"front":"O que lifetime elision elimina?","back":"A necessidade de anotar lifetimes óbvios","next_review":"2026-04-05","ef":2.5,"interval":3,"reps":2}
```

Algoritmo SM-2. Revisão diária via `/ul-review-srs`.

---

## 5. Fluxos de Uso

### 5.1 Iniciar novo módulo

```
Usuário: "Quero aprender Rust async"

Pi:
  1. Detecta novo módulo via before_agent_start
  2. Sugere /skill:ul-decomposition
  3. Skill guia decomposição em 5 semanas
  4. Gera .ultralearning/modules/rust-async/plan.md
  5. Gera week-01.md
  6. Evento: plan_created
  7. Próximo passo: /ul-start amanhã
```

### 5.2 Sessão diária completa

```
Usuário: /ul-start

Pi:
  1. before_agent_start injeta ul-context
  2. Pergunta: "Qual técnica hoje?" (ou sugere baseado em contexto)
  3. Usuário escolhe: "drill"
  4. /skill:ul-pomodoro → inicia timer 50min
  5. /skill:ul-drill → apresenta exercício
  6. Usuário resolve, erra, refaz, acerta
  7. Timer acaba ou usuário chama /ul-end
  8. /skill:ul-retrieval → quiz rápido de warm-down
  9. Ritual pós-sessão:
     - "Quão honesto você foi? (1-10)"
     - "O que ficou confuso?"
  10. Gera eventos: session_started, drill_completed, weakness_identified
  11. Atualiza UI: streak +1, mostra resumo
```

### 5.3 Travou no exercício

```
Usuário: "Não consigo fazer isso funcionar"

Pi:
  1. Detecta frustração
  2. Sugere pausa de 15 min (modo difuso)
  3. Timer de pausa
  4. Após pausa, /skill:ul-debug-socratic
  5. Se ainda travado: registra weakness, sugere downgradear ou Feynman
```

### 5.4 Domingo: Planejamento + Retro

```
Usuário: /ul-retro

Pi:
  1. Lê eventos da semana
  2. Mostra estatísticas derivadas
  3. Guia perguntas da retrospectiva
  4. Gera retro-{N}.md
  5. Evento: retro_done
  6. Propõe plano ajustado para semana seguinte
```

---

## 6. Estrutura de Diretórios

```
.pi/                                # Nativo do Pi
  extensions/
    ultralearning/
      index.ts                      # Entry point
      cycle.ts                      # Máquina de estados
      context.ts                    # Injeção de contexto
      events.ts                     # Persistência
      memory.ts                     # Projeções
      ui.ts                         # Widgets e timer
      skills.ts                     # Mapeamento de skills
  skills/
    ul-pomodoro/SKILL.md
    ul-retrieval/SKILL.md
    ul-feynman/SKILL.md
    ul-drill/SKILL.md
    ul-srs/SKILL.md
    ul-directness/SKILL.md
    ul-debug-socratic/SKILL.md
    ul-decomposition/SKILL.md
    ul-retro/SKILL.md
  prompts/
    pre-session.md
    post-session.md
    plan-weekly.md
    plan-retro.md
    stuck.md

.ultralearning/                     # Dados do sistema
  state.jsonl                       # Eventos append-only
  config.json                       # Preferências
  modules/
    rust-async/
      plan.md
      week-01.md .. week-06.md
      retro-01.md .. retro-06.md
      concepts.md
      drills.md
      resources.md
      benchmark.md
  resources/                        # Materiais curados
    rust-book/ch4-ownership.md
  flashcards/
    rust-async.jsonl
```

---

## 7. Commands Registrados

| Command | Ação |
|---------|------|
| `/ul-start` | Inicia ciclo de estudo. Injetor de contexto + ritual pré-sessão. |
| `/ul-end` | Finaliza ciclo. Ritual pós-sessão + evento. |
| `/ul-timer [start\|stop\|status]` | Pomodoro integrado no TUI. |
| `/ul-plan` | Mostra plano da semana e progresso. |
| `/ul-retro` | Guia retrospectiva interativa. |
| `/ul-weak` | Lista pontos fracos ativos com contagem de erros. |
| `/ul-resources` | Lista recursos curados do módulo ativo. |
| `/ul-stats` | Analytics derivados dos eventos. |
| `/ul-review-srs` | Flashcards pendentes de revisão. |

---

## 8. Custom Tools

| Tool | Uso |
|------|-----|
| `ul_log_event` | Persistir evento no state.jsonl. Chamado implicitamente pelos ciclos. |
| `ul_get_context` | Retorna contexto vivo reconstruído de eventos. |
| `ul_search_concepts` | Busca em concepts.md + eventos. |
| `ul_add_resource` | Curar recurso: salva URL + notas + tags. |

---

## 9. Vantagens desta Arquitetura

| Aspecto | Benefício |
|---------|-----------|
| **Zero infra** | Sem Docker, sem vector DB, sem serviços. Apenas Pi + arquivos locais. |
| **Distribuição** | `pi install` e pronto. Atualizações via `pi update`. |
| **Event sourcing** | Estado = histórico. Auditável. Recuperável. Branchable. |
| **Contexto nativo** | Injeção automática. LLM sempre sabe o que está acontecendo. |
| **UI integrada** | Timer, streak, foco — tudo no terminal. Sem context switching. |
| **Branching** | `/tree` para tentar exercício de formas diferentes. Sem perder nada. |
| **Skills rituais** | Técnicas de aprendizado como workflows completos, não comandos soltos. |
| **Honestidade** | Pós-sessão sempre pergunta "o que ficou confuso?". Não deixa marcar "entendi" sem validar. |
| **Custo** | Apenas API do modelo. Zero infra local. |

---

## 10. Roadmap de Implementação

### Fase 1: Foundation (2h)
- Scaffold extension com `index.ts`
- Criar `.ultralearning/` com estrutura de diretórios
- Implementar `state.jsonl` e funções de event sourcing
- Registrar commands básicos: `/ul-start`, `/ul-end`, `/ul-stats`

### Fase 2: Ciclos (2h)
- Máquina de estados: idle → pre-session → in-session → post-session
- Eventos `session_started`, `session_ended`, `drill_completed`
- `before_agent_start` detector e injetor de contexto
- `session_before_compact` customizado

### Fase 3: Skills Core (3h)
- `ul-pomodoro` — timer + ritual de foco
- `ul-retrieval` — quiz adaptativo
- `ul-feynman` — validação de compreensão
- `ul-drill` — repetição deliberada

### Fase 4: Skills Avançadas (2h)
- `ul-srs` — flashcards com SM-2
- `ul-directness` — projeto real
- `ul-debug-socratic` — debug com perguntas
- `ul-decomposition` — quebrar objetivos
- `ul-retro` — retrospectiva semanal

### Fase 5: UI (2h)
- Status bar persistente (streak, módulo, SRS)
- Widget de timer ativo
- Notificações (timer, SRS, streak)
- `/ul-stats` com analytics derivados

### Fase 6: Pi Package (1h)
- Criar `package.json` com manifest `pi`
- Testar `pi install` local
- Documentação: `HOW_TO_USE.md` novo

**Total estimado: ~12h**

---

## 11. Prompt Executável (Resumo)

```
Crie sistema de ultralearning como Pi Package nativo.

EXTENSION `.pi/extensions/ultralearning/index.ts`:
- Event sourcing: eventos append-only em `.ultralearning/state.jsonl` + `appendEntry`
- Eventos Pi: session_start (reconstruir), before_agent_start (injetar contexto), session_before_compact (resumo UL-aware)
- Commands: /ul-start, /ul-end, /ul-timer, /ul-plan, /ul-retro, /ul-stats, /ul-review-srs
- UI: status bar [módulo] [streak] [SRS] [weaknesses], widget de timer, notificações

SKILLS `.pi/skills/` (rituais completos):
- ul-pomodoro: timer 50/10, proteção de interrupções
- ul-retrieval: quiz adaptativo baseado em erros
- ul-feynman: explicar para criança, identificar gaps
- ul-drill: repetição deliberada com progressão de nível
- ul-srs: flashcards SM-2
- ul-directness: projeto real, code review socrático
- ul-debug-socratic: 5 perguntas sistemáticas
- ul-decomposition: framework 3D (conceitos 40%, fatos 20%, procedimentos 40%)
- ul-retro: retrospectiva semanal

ESTRUTURA `.ultralearning/`:
- state.jsonl: eventos append-only
- modules/{name}/: plan.md, week-*.md, retro-*.md, concepts.md, drills.md, resources.md
- flashcards/{module}.jsonl: SRS SM-2

FLUXOS:
- Novo módulo: decomposição → plano → semanas
- Sessão diária: pré-sessão → técnica → pós-sessão → eventos
- Travou: pausa modo difuso → debug socrático → weakness
- Domingo: retro → ajuste → próxima semana

PRINCÍPIOS:
- Zero containers, zero vector DB, zero infra externa
- Contexto sobre consulta: LLM recebe estado diretamente
- Skills como rituais completos
- Honestidade forçada: pós-sessão sempre pergunta "o que ficou confuso?"
- Branching nativo: /tree para tentativas de exercício
```

---

*Proposta pensada do zero. Não migração. Reinvenção usando Pi como plataforma nativa.*
