# Ultralearning System — Arquitetura Nova

> Sistema de aprendizado autodirigido para CS Fundamentals. Construído como camada nativa do Pi Agent. Sem bancos de dados. Sem containers. O próprio Pi é o ambiente de aprendizado.

---

## 1. Filosofia

### O estudante já está no terminal

Não criamos um "sistema separado" que o Pi consulta. O Pi **é** o ambiente de estudo. Cada sessão de aprendizado acontece dentro de uma sessão Pi normal. O aluno conversa com o agente, escreve código, lê documentação — tudo no mesmo lugar.

### Aprendizado é cíclico, não transacional

Não existe "CREATE session", "UPDATE streak". Existe:
- **Pré-sessão**: preparar mente e ambiente
- **Sessão**: foco intenso com técnica correta
- **Pós-sessão**: consolidar, registrar honestidade, planejar próxima
- **Retrospectiva**: olhar padrões, ajustar estratégia
- **Planejamento**: decompor próximo ciclo

Cada ciclo é uma **narrativa**, não uma transação.

### Memória é contexto, não banco

O que importa não é que o aluno "estudou 45 minutos ontem". O que importa é que o LLM **sabe** que ele está com dificuldade em closures, que prefere aprender pela manhã, que o último exercício de borrow checker falhou 3 vezes.

A memória vive no **contexto da conversa**, comprimida inteligentemente, não em tabelas separadas.

---

## 2. Princípios de Design

| # | Princípio | Implicação |
|---|-----------|------------|
| 1 | **Zero infra externa** | Sem Docker, sem vector DB, sem serviços. Tudo via Pi nativo + arquivos locais. |
| 2 | **Event sourcing como estado** | Estado = sequência de eventos append-only. Reconstruído sob demanda. |
| 3 | **Skills como micro-workflows** | Cada técnica de aprendizado (Feynman, SRS, Pomodoro) é uma skill com ritual próprio. |
| 4 | **Contexto sobre consulta** | LLM recebe contexto diretamente via `custom_message`, não busca em banco. |
| 5 | **UI no TUI** | Timer, streak, foco — tudo aparece no terminal, não em dashboards separados. |
| 6 | **Branching para tentativas** | `/tree` nativo do Pi permite tentar exercício de formas diferentes sem perder contexto. |
| 7 | **Honestidade forçada** | Sistema não deixa aluno marcar "entendi" sem validar (Feynman, quiz). |
| 8 | **Curadoria sobre indexação** | Recursos são selecionados manualmente pelo aluno com ajuda do agente, não crawleados. |

---

## 3. Conceitos Fundamentais

### 3.1 Ciclo de Aprendizado

```
┌─────────────────────────────────────────────────────────────────┐
│                         CICLO SEMANAL                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Domingo           Seg-Sáb           Sábado/Domingo            │
│   ┌──────┐         ┌──────┐          ┌──────┐                  │
│   │Plan  │◄────────┤Study │─────────►│Retro │                  │
│   │      │         │      │          │      │                  │
│   │Meta  │         │Drill │          │Ajuste│                  │
│   │Decomp│         │Learn │          │Padrão│                  │
│   │Recurs│         │Feyn  │          │Semana│                  │
│   └──────┘         │Proj  │          └──────┘                  │
│                    │Quiz  │                                     │
│                    └──────┘                                     │
│                                                                 │
│   Ciclo diário dentro de "Study":                               │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐                      │
│   │Pre      │──►│Core     │──►│Post     │                      │
│   │  Warmup │   │  Foco   │   │  Log    │                      │
│   │  Objet  │   │  50min  │   │  Honest │                      │
│   │  Timer  │   │         │   │  Commit │                      │
│   └─────────┘   └─────────┘   └─────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Eventos de Estado

Tudo que acontece gera um evento. O estado atual é a projeção de todos os eventos.

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

**Persistência:** Eventos são salvos via `pi.appendEntry("ul-event", event)` na sessão Pi. Além disso, replica para `.ultralearning/state.jsonl` para durabilidade entre sessões Pi.

### 3.3 Contexto Vivo

O que o LLM "sabe" sobre o aluno em cada momento:

```
[system prompt normal do Pi]

[ul-context: custom_message injetado via before_agent_start]
┌─────────────────────────────────────────┐
│ ULTRALEARNING CONTEXT                   │
│                                         │
│ Módulo ativo: rust-async                │
│ Semana: 3 de 6                          │
│ Streak: 12 dias                         │
│                                         │
│ Foco de hoje (do plano):                │
│   - Lifetime elision                    │
│                                         │
│ Pontos fracos ativos:                   │
│   - closure + ownership (3 erros)       │
│   - async/await pinning                 │
│                                         │
│ Última sessão:                          │
│   - Técnica: drill                      │
│   - Tópico: move semantics              │
│   - Duração: 52min, foco: 8/10          │
│   - Honestidade: "achei fácil demais,   │
│     devia ter feito desafio maior"      │
│                                         │
│ Próxima revisão SRS: closure (hoje)     │
│                                         │
│ Recursos descobertos recentemente:      │
│   - rust-book/ch4-ownership.md          │
│   - rustlings/exercises/threads/        │
└─────────────────────────────────────────┘
```

Este bloco é injetado automaticamente quando `before_agent_start` detecta contexto de estudo. Não existe "consulta". O contexto **já está lá**.

---

## 4. Estrutura de Diretórios

```
.ultralearning/                    # Tudo do sistema aqui
  state.jsonl                      # Eventos append-only (fonte de verdade)
  config.json                      # Preferências estáveis
  modules/
    rust-async/
      plan.md                      # Decomposição do módulo
      week-01.md .. week-06.md     # Planos semanais
      retro-01.md .. retro-06.md   # Retrospectivas
      concepts.md                  # Conceitos anotados (log de aprendizado)
      drills.md                    # Exercícios praticados
      resources.md                 # Links curados com notas
      benchmark.md                 # Critério de conclusão
    algorithms/
      ...
  resources/                       # Materiais baixados/curados
    rust-book/
      ch4-ownership.md             # Trecho relevante (não o livro inteiro)
      ch10-lifetimes.md
    cracking-the-coding-interview/
      ch1-arrays.md
  flashcards/                      # Flashcards SRS (um arquivo por módulo)
    rust-async.jsonl               # { front, back, next_review, ef, interval, reps }
    algorithms.jsonl

.pi/                               # Nativo do Pi
  extensions/
    ultralearning/
      index.ts                     # Entry point
      cycle.ts                     # Máquina de estados dos ciclos
      context.ts                   # Monta e injeta ul-context
      events.ts                    # Persiste eventos
      ui.ts                        # Timer, widgets, notificações
      memory.ts                    # Reconstrói estado de eventos
      skills.ts                    # Registra skills dinamicamente
  skills/
    ul-pomodoro/
      SKILL.md                     # Ritual de foco: 50/10, proteção de interrupções
    ul-retrieval/
      SKILL.md                     # Quiz socrático, active recall
    ul-feynman/
      SKILL.md                     # Explicar para criança de 5 anos
    ul-directness/
      SKILL.md                     # Projetos reais, aprender fazendo
    ul-drill/
      SKILL.md                     # Repetição deliberada, erro → repetição
    ul-srs/
      SKILL.md                     # Criar e revisar flashcards
    ul-debug-socratic/
      SKILL.md                     # 5 perguntas para debug
    ul-decomposition/
      SKILL.md                     # Quebrar objetivos complexos
    ul-retro/
      SKILL.md                     # Retrospectiva semanal
  prompts/
    pre-session.md                 # Ritual de início (warm-up, objetivo, timer)
    post-session.md                # Ritual de fim (honestidade, log, commit)
    plan-weekly.md                 # Estrutura do plano semanal
    plan-retro.md                  # Perguntas da retrospectiva
    stuck.md                       # Quando travar (modo difuso, pausa)
```

**Nota:** Não há `data/sessions.csv`, `data/insights.csv`, etc. Tudo é evento em `state.jsonl` ou markdown legível.

---

## 5. Extension Pi: `ultralearning`

### 5.1 Eventos Pi interceptados

| Evento Pi | O que a extension faz |
|-----------|----------------------|
| `session_start` | Carrega `state.jsonl`. Reconstrói contexto. Mostra streak no status bar. |
| `before_agent_start` | Se prompt contém estudo/UL keywords, injeta `ul-context` como `custom_message`. |
| `tool_call` | Intercepta `edit`/`write` em `.ultralearning/` para gerar eventos automáticos. |
| `session_before_compact` | Gera resumo UL-aware: mantém pontos fracos, recursos, decisões, próximos passos. |
| `turn_end` | Se timer ativo, verifica se sessão acabou. Notifica. |
| `session_shutdown` | Garante que eventos pendentes foram salvos. |

### 5.2 Commands registrados

| Command | Ação |
|---------|------|
| `/ul-start` | Inicia ciclo de estudo. Injetor de contexto + ritual pré-sessão. |
| `/ul-end` | Finaliza ciclo. Ritual pós-sessão + gera evento `session_ended`. |
| `/ul-timer [start\|stop\|status]` | Pomodoro integrado no TUI. |
| `/ul-plan` | Mostra plano da semana e progresso. |
| `/ul-retro` | Guia retrospectiva interativa. |
| `/ul-weak` | Lista pontos fracos ativos com contagem de erros. |
| `/ul-resources` | Lista recursos curados do módulo ativo. |
| `/ul-stats` | Analytics derivados dos eventos (streak, horas, técnicas). |

### 5.3 Custom Tools

| Tool | Uso |
|------|-----|
| `ul_log_event` | Persistir evento no `state.jsonl`. Chamado implicitamente pelos ciclos. |
| `ul_get_context` | Retorna contexto vivo reconstruído de eventos. |
| `ul_review_srs` | Listar flashcards pendentes de revisão. |
| `ul_search_concepts` | Busca exata em `concepts.md` + eventos. |
| `ul_add_resource` | Curar recurso: salva URL + notas + tags. |

### 5.4 Widgets UI

```
┌────────────────────────────────────┐
│ [rust-async] 🔥12  ⏱️ 32min        │  <- status bar (sempre visível)
│                                    │
│ Messages...                        │
│                                    │
│                                    │
├────────────────────────────────────┤
│ Timer: ████████████████████░░ 32m  │  <- widget ativo durante sessão
│ Objetivo: Lifetime elision         │
│ Técnica: Drill                     │
├────────────────────────────────────┤
│ > _                                │
└────────────────────────────────────┘
```

---

## 6. Skills: Rituais de Aprendizado

Cada skill é um workflow completo. O aluno invoca via `/skill:ul-feynman` ou é guiado automaticamente pelo ciclo.

### 6.1 `ul-pomodoro` — Foco Protegido

```markdown
---
name: ul-pomodoro
description: Ritual de foco profundo para sessões de estudo. Configura timer, elimina interrupções, e protege o ciclo de aprendizado. Use antes de qualquer técnica de estudo.
---

# Pomodoro para Ultralearning

## Ritual (2 minutos)

1. Defina timer: `/ul-timer start 50`
2. Celular: Não Perturbe
3. Editor: apenas arquivos do módulo ativo
4. Feche todas as abas irrelevantes
5. Diga em voz alta (ou digite): "Próximos 50 minutos, só [objetivo]"

## Regras

- Se interrompido: pause timer, anote interrupção, volte em < 2 min
- Se travar por > 5 min: use `/skill:ul-stuck`
- Se terminar antes: overlearning — faça variação mais difícil
- NUNCA pule o ritual

## Pausa (10 min)

- Não tela
- Caminhar, água, respirar
- Não redes sociais

## Comandos

- `/ul-timer start [minutos]` — inicia
- `/ul-timer stop` — interrompe
- `/ul-timer status` — tempo restante
```

### 6.2 `ul-feynman` — Validar Compreensão

```markdown
---
name: ul-feynman
description: Técnica Feynman para validar compreensão real. Aluno explica conceito como se ensinasse criança de 5 anos. Agente identifica gaps e guia preenchimento. Use quando achar que "entendeu".
---

# Técnica Feynman

## Ritual

1. Escolha conceito: ___________
2. Explique em voz alta (ou digite) usando:
   - Zero jargão técnico
   - Analogia do mundo real
   - Máximo 3 frases
3. Agente faz perguntas sobre gaps:
   - "Mas por que X acontece?"
   - "O que acontece se Y mudar?"
   - "Como isso se compara a Z?"
4. Preencha gaps. Repita até explicação fluir.
5. Agente marca: `event: feynman_done`

## Falha comum

Aluno explica com jargão. Agente interrompe: "Explique como se eu não soubesse o que é [termo]".

## Output

- Analogia final salva em `concepts.md`
- Gaps identificados viram flashcards SRS
```

### 6.3 `ul-retrieval` — Quiz Socrático

```markdown
---
name: ul-retrieval
description: Active recall via quiz adaptativo. Agente pergunta sobre conceitos do módulo ativo. Dificuldade ajustada pelo histórico de erros. Use como warm-up ou revisão.
---

# Quiz de Recuperação

## Ritual

1. Agente seleciona 3-5 perguntas baseado em:
   - Conceitos fracos (eventos `weakness_identified`)
   - Última sessão (tópico praticado)
   - SRS pendentes
2. Aluno responde SEM olhar material
3. Agente pontua: correto / parcial / errado
4. Erros geram evento `weakness_identified` ou reforçam existente
5. Acertos consolidam confiança

## Adaptação

| Erros recentes no tema | Comportamento |
|------------------------|---------------|
| 0-1 | Pergunta mais profunda, conexões |
| 2-3 | Pergunta direta, aplicação |
| 4+ | Volta à definição, exemplo concreto |

## Output

- Eventos: `drill_completed` ou `weakness_identified`
```

### 6.4 `ul-drill` — Repetição Deliberada

```markdown
---
name: ul-drill
description: Prática deliberada com repetição e progressão. Aluno resolve exercício tipo. Erro → análise → repetição. Acerto → variação mais difícil. Use para automatizar procedimentos.
---

# Drill

## Ritual

1. Agente apresenta exercício baseado em:
   - Pontos fracos ativos
   - Progresso do plano semanal
2. Aluno resolve SOZINHO (agente não dá código)
3. Se erro: agente guia com 3 perguntas socráticas
   - "O que você espera que aconteça na linha X?"
   - "O que realmente acontece?"
   - "Qual a diferença?"
4. Aluno refaz. Repete até acerto.
5. Acerto: variação mais difícil (mais parâmetros, edge case)

## Progressão

- Nível 1: Exercício guiado (muitas dicas)
- Nível 2: Exercício independente
- Nível 3: Exercício com twist
- Nível 4: Exercício de entrevista (tempo limitado)

## Output

- Evento: `drill_completed` (tentativas, erros)
- Se erro persistente: evento `weakness_identified`
```

### 6.5 `ul-srs` — Flashcards

```markdown
---
name: ul-srs
description: Spaced Repetition System para memorização. Criar flashcards com front/back. Revisão diária via algoritmo SM-2. Use para fatos, sintaxe, APIs, fórmulas.
---

# SRS

## Criar card

1. Conceito: ___________
2. Front (pergunta): máx 1 sentença
3. Back (resposta): máx 3 sentenças
4. Tags: [módulo] [categoria]
5. Agente avalia qualidade:
   - "Este card é atômico?"
   - "A resposta pode ser deduzida da pergunta?"

## Revisão diária

1. `/ul-review-srs` lista pendentes
2. Aluno tenta responder mentalmente
3. Auto-avalia: Again (0) / Hard (1) / Good (3) / Easy (4)
4. Agente atualiza `next_review` via SM-2
5. Cards "Again" são repetidos no mesmo dia

## Output

- Arquivo: `.ultralearning/flashcards/{module}.jsonl`
- Evento: `concept_learned` (novo) ou reforço
```

### 6.6 `ul-directness` — Projeto Real

```markdown
---
name: ul-directness
description: Aprender fazendo projeto real. Não tutoriais. Agente guia estrutura, não solução. Aluno constrói algo que funciona. Use para consolidar conhecimento em contexto real.
---

# Projeto Real

## Ritual

1. Escolha projeto que USE o conceito em contexto real
   - Ruim: "fazer tutorial de threads"
   - Bom: "fazer download paralelo de arquivos"
2. Agente ajuda a decompor em 3-5 milestones
3. Aluno implementa milestone 1 SOZINHO
4. Code review socrático do agente (não corrige, pergunta)
5. Próximo milestone

## Regras

- Agente NUNCA escreve código do projeto
- Agente pode explicar conceito relacionado
- Agente pode sugerir biblioteca, não snippet
- Aluno pode usar Google, StackOverflow, docs
- Objetivo: funcionar, não ser perfeito

## Output

- Evento: `drill_completed` (cada milestone)
- Arquivo: projeto no diretório de trabalho
- Recurso: `resource_curated` (libs usadas)
```

### 6.7 `ul-debug-socratic` — Debug com Perguntas

```markdown
---
name: ul-debug-socratic
description: Guia socrático para encontrar bugs. Agente faz 5 perguntas sistemáticas. Nunca diz onde está o erro. Use quando código não funciona e aluno não sabe por quê.
---

# Debug Socrático

## As 5 Perguntas

1. "O que você espera que este código faça? Descreva em português."
2. "O que ele REALMENTE faz? (Rode e observe, não interprete)"
3. "Qual a primeira linha onde expectativa ≠ realidade?"
4. "O que você SABE que é verdade sobre [variável/função] neste ponto?"
5. "Qual a menor mudança que testaria sua hipótese?"

## Regras

- Agente NUNCA diz "o erro está na linha X"
- Agente NUNCA corrige o código
- Agente pode pedir para adicionar `println!` / `dbg!`
- Agente pode pedir para isolar função em teste

## Output

- Evento: `weakness_identified` (se conceito mal entendido)
- Evento: `drill_completed` (se foi só erro de atenção)
```

### 6.8 `ul-decomposition` — Quebrar Objetivos

```markdown
---
name: ul-decomposition
description: Decompor objetivo de aprendizado complexo em módulos de 4-6 semanas. Framework: Conceitos 40%, Fatos 20%, Procedimentos 40%. Use ao iniciar novo tópico.
---

# Decomposição

## Framework 3D

Para cada objetivo, classificar em:
- **Conceitos** (40%): entender "por que" — Feynman, analogia
- **Fatos** (20%): memorizar — SRS
- **Procedimentos** (40%): fazer — Drill, Projeto

## Ritual

1. Objetivo: "Ser capaz de ______ em ______"
2. Agente pergunta: "O que você precisa SABER?" (conceitos)
3. Agente pergunta: "O que você precisa LEMBRAR?" (fatos)
4. Agente pergunta: "O que você precisa FAZER?" (procedimentos)
5. Ordenar por dependência
6. Agrupar em semanas de ~6h
7. Definir benchmark de conclusão

## Output

- `plan.md` no diretório do módulo
- Evento: `plan_created`
```

### 6.9 `ul-retro` — Retrospectiva

```markdown
---
name: ul-retro
description: Retrospectiva semanal de aprendizado. Revisar plano, identificar padrões, ajustar próxima semana. Use todo domingo.
---

# Retrospectiva

## Ritual (20 min)

1. Agente mostra dados da semana:
   - Sessões feitas vs planejadas
   - Técnicas usadas
   - Pontos fracos identificados
   - Tempo total
2. Perguntas:
   - "O que funcionou bem?" (padrão positivo)
   - "O que não funcionou?" (padrão negativo)
   - "O que foi surpreendente?" (insight)
   - "Qual ajuste na próxima semana?" (1 só)
3. Agente propõe plano ajustado
4. Aluno confirma ou modifica

## Regras

- Sempre reduzir escopo, nunca aumentar
- Se < 80% completado, metade do objetivo na próxima semana
- Documentar padrões: "estudo matinal = mais foco"

## Output

- `retro-{N}.md`
- Evento: `retro_done`
- Ajuste no `week-{N+1}.md`
```

---

## 7. Fluxos Completos

### 7.1 Iniciar novo módulo

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

### 7.2 Sessão diária completa

```
Usuário: /ul-start

Pi:
  1. before_agent_start injeta ul-context
  2. Pergunta: "Qual técnica hoje?" (ou sugere baseado em contexto)
  3. Usuário escolhe: "drill"
  4. /skill:ul-pomodoro → inicia timer 50min
  5. /skill:ul-drill → apresenta exercício
  6. Usuário resolve, erra, refaz, acerta
  7. Timer acaba (notificação) ou usuário chama /ul-end
  8. /skill:ul-retrieval → quiz rápido de warm-down (3 perguntas)
  9. Ritual pós-sessão:
     - "Quão honesto você foi? (1-10)"
     - "O que ficou confuso?"
     - "Qual próximo foco?"
  10. Gera eventos: session_started, drill_completed, weakness_identified
  11. Atualiza UI: streak +1, mostra resumo
```

### 7.3 Travou no exercício

```
Usuário: "Não consigo fazer isso funcionar"

Pi:
  1. Detecta frustração (palavras-chave ou explicitamente)
  2. Sugere: pausa de 15 min (modo difuso)
  3. Timer de pausa
  4. Após pausa, /skill:ul-debug-socratic
  5. Se ainda travado após 5 perguntas:
     - Registra weakness_identified
     - Sugere downgradear para exercício mais simples
     - Ou sugerir /skill:ul-feynman no conceito subjacente
```

### 7.4 Domingo: Planejamento + Retro

```
Usuário: /ul-retro

Pi:
  1. Lê eventos da semana
  2. Mostra estatísticas derivadas
  3. Guia perguntas da retrospectiva
  4. Gera retro-{N}.md
  5. Evento: retro_done
  6. Pergunta: "Próxima semana?"
  7. Gera week-{N+1}.md (ajustado pela retro)
  8. Agenda lembretes SRS para a semana
```

---

## 8. Estado e Persistência

### 8.1 Event Sourcing

**Arquivo:** `.ultralearning/state.jsonl`

```jsonl
{"type":"plan_created","module":"rust-async","weeks":5,"goals":["lifetimes","async/await","tokio"],"date":"2026-04-01T10:00:00Z"}
{"type":"session_started","module":"rust-async","technique":"drill","objective":"Lifetime elision","date":"2026-04-02T08:00:00Z"}
{"type":"drill_completed","topic":"lifetime-elision","attempts":3,"errors":1,"date":"2026-04-02T08:52:00Z"}
{"type":"weakness_identified","concept":"closure-ownership","symptom":"erro ao passar closure para thread","date":"2026-04-02T08:45:00Z"}
{"type":"concept_learned","concept":"lifetime-elision","analogy":"é como o compilador adivinhar o pronome 'ele' em português","confidence":7,"date":"2026-04-02T08:50:00Z"}
{"type":"session_ended","duration":52,"focus":8,"honest":true,"notes":"achei fácil demais, devia ter pulado para nível 3","date":"2026-04-02T08:55:00Z"}
```

**Projeções (derivadas, recalculadas sob demanda):**

```typescript
interface ULState {
  activeModule: string;
  streak: number;
  totalHours: number;
  weekNumber: number;
  weaknesses: Array<{ concept: string; errors: number; lastSeen: string }>;
  recentSessions: Array<{ date: string; technique: string; topic: string }>;
  pendingSRS: number;
  planProgress: number; // 0-1
}
```

Reconstruído em `session_start` lendo `state.jsonl`. Cache em memória da extension.

### 8.2 Replicação na sessão Pi

Todo evento é também salvo via `pi.appendEntry("ul-event", event)`.

**Por quê:**
- Se `state.jsonl` for corrompido, reconstruímos de `sessionManager.getEntries()`
- Se sessão Pi for arquivada, eventos ficam no histórico
- Compaction do Pi mantém resumo de estudos no contexto

### 8.3 Markdown como Memória Qualitativa

Eventos capturam **o que aconteceu**. Markdown captura **o que foi aprendido**.

```markdown
<!-- .ultralearning/modules/rust-async/concepts.md -->

## Lifetime Elision
**Data**: 2026-04-02
**Confiança**: 7/10
**Analogia**: "O compilador adivinha o pronome 'ele' em português. Você não precisa dizer 'ele' toda vez se é óbvio quem é."
**Gaps**: Regra dos 3 contextos (input, output, método). Preciso revisar.
**Cards SRS**: ✅ Criado
```

### 8.4 Flashcards

```jsonl
// .ultralearning/flashcards/rust-async.jsonl
{"front":"O que lifetime elision elimina?","back":"A necessidade de anotar lifetimes óbvios em funções","next_review":"2026-04-05","ef":2.5,"interval":3,"reps":2}
{"front":"Regra dos 3 contextos de elision","back":"1. Input único → output herda; 2. &self → output herda self; 3. Múltiplos inputs → não aplica","next_review":"2026-04-03","ef":2.3,"interval":1,"reps":1}
```

---

## 9. UI/UX Integrada

### 9.1 Status Bar Persistente

```
[rust-async W3] 🔥12 ⚡2 weaknesses ⏳3 SRS  [glm-5]  [tokens: 12k/200k]
```

### 9.2 Widget de Sessão Ativa

```
┌────────────────────────────────────┐
│ ⏱️ 32m / 50m  ████████████████░░░░ │
│ 🎯 Lifetime elision                │
│ 🔧 Drill Nível 2                   │
│ 💡 Dica: pense em "quem empresta"  │
└────────────────────────────────────┘
```

### 9.3 Notificações

- Timer acabando: `ctx.ui.notify("⏱️ 5 minutos restantes", "warning")`
- SRS pendente: `ctx.ui.notify("📚 3 flashcards para revisar", "info")`
- Streak em risco: `ctx.ui.notify("🔥 Streak acaba em 4h!", "error")`

### 9.4 Prompt Templates como Atalhos

| Atalho | Expande para |
|--------|--------------|
| `/ul-start` | Ritual pré-sessão + timer |
| `/ul-end` | Ritual pós-sessão + log |
| `/ul-stuck` | Modo difuso + pausa |
| `/ul-plan` | Mostrar plano semanal |
| `/skill:ul-feynman` | Técnica Feynman completa |

---

## 10. Vantagens desta Arquitetura

| Aspecto | Arquitetura Antiga | Arquitetura Nova |
|---------|-------------------|------------------|
| **Infra** | Docker (Ollama + OpenViking) | Zero containers |
| **Estado** | CSVs + memória vetorial externa | Event sourcing nativo Pi |
| **Contexto** | Tool `context-hybrid` chamada manual | Injeção automática via `before_agent_start` |
| **Branching** | Inexistente | `/tree` nativo para tentativas de exercício |
| **Compaction** | Padrão do OpenCode | Customizado para manter pontos fracos e recursos |
| **UI** | Texto puro | Widgets, timer, status bar no TUI |
| **Técnicas** | Commands markdown interpretados | Skills com ritual completo |
| **Workflow** | CRUD sobre dados | Ciclos de aprendizado como eventos |
| **Curadoria** | Indexação automática (resource.add) | Seleção manual com ajuda do agente |
| **Honestidade** | Self-reported em CSV | Ritual forçado pós-sessão |
| **Custo** | Containers locais (~14GB RAM) | Apenas API do modelo |

---

## 11. Roadmap de Implementação

### Fase 1: Foundation (2h)
- [ ] Scaffold `.pi/extensions/ultralearning/` com `index.ts`
- [ ] Configurar `package.json` com zero deps externos
- [ ] Criar `.ultralearning/` com estrutura de diretórios
- [ ] Implementar `state.jsonl` e funções de event sourcing
- [ ] Registrar commands básicos: `/ul-start`, `/ul-end`, `/ul-stats`

### Fase 2: Ciclos (2h)
- [ ] Implementar máquina de estados: idle → pre-session → in-session → post-session
- [ ] Eventos `session_started`, `session_ended`, `drill_completed`, etc.
- [ ] `before_agent_start` detector e injetor de contexto
- [ ] `session_before_compact` customizado

### Fase 3: Skills Core (3h)
- [ ] `ul-pomodoro` — timer + ritual de foco
- [ ] `ul-retrieval` — quiz adaptativo
- [ ] `ul-feynman` — validação de compreensão
- [ ] `ul-drill` — repetição deliberada

### Fase 4: Skills Avançadas (2h)
- [ ] `ul-srs` — flashcards com SM-2
- [ ] `ul-directness` — projeto real
- [ ] `ul-debug-socratic` — debug com perguntas
- [ ] `ul-decomposition` — quebrar objetivos
- [ ] `ul-retro` — retrospectiva semanal

### Fase 5: UI (2h)
- [ ] Status bar persistente (streak, módulo, SRS)
- [ ] Widget de timer ativo
- [ ] Notificações (timer, SRS, streak)
- [ ] `/ul-stats` com analytics derivados

### Fase 6: Integração (1h)
- [ ] Prompt templates: `/ul-start`, `/ul-end`, `/ul-plan`, `/ul-stuck`
- [ ] Teste end-to-end: novo módulo → sessão → retro
- [ ] Documentação: `HOW_TO_USE.md` novo

**Total estimado: ~12h**

---

## 12. Prompt Executável

```
Crie sistema de ultralearning como camada nativa do Pi Agent. Requisitos:

1. EXTENSION `.pi/extensions/ultralearning/index.ts`:
   - Event sourcing: eventos append-only em `.ultralearning/state.jsonl`
   - Estados projetados: módulo ativo, streak, pontos fracos, SRS pendentes
   - Eventos Pi:
     * session_start: reconstruir estado de state.jsonl + session entries
     * before_agent_start: detectar keywords de estudo, injetar ul-context
     * session_before_compact: resumo customizado mantendo weaknesses, recursos
   - Commands: /ul-start, /ul-end, /ul-timer, /ul-plan, /ul-retro, /ul-stats
   - UI: status bar com [módulo] [streak] [SRS] [weaknesses]

2. SKILLS em `.pi/skills/` (cada uma com ritual completo):
   - ul-pomodoro: timer 50/10, proteção de interrupções
   - ul-retrieval: quiz adaptativo baseado em erros
   - ul-feynman: explicar para criança, identificar gaps
   - ul-drill: repetição deliberada com progressão de nível
   - ul-srs: flashcards SM-2, criação e revisão
   - ul-directness: projeto real, code review socrático
   - ul-debug-socratic: 5 perguntas sistemáticas
   - ul-decomposition: framework 3D (conceitos 40%, fatos 20%, procedimentos 40%)
   - ul-retro: retrospectiva semanal com ajustes

3. ESTRUTURA `.ultralearning/`:
   - state.jsonl: eventos append-only
   - config.json: preferências estáveis
   - modules/{name}/: plan.md, week-*.md, retro-*.md, concepts.md, drills.md, resources.md
   - resources/: materiais curados como markdown
   - flashcards/{module}.jsonl: SRS com SM-2

4. FLUXOS implementados:
   - Novo módulo: decomposição → plano → semanas
   - Sessão diária: pré-sessão → técnica → pós-sessão → eventos
   - Travou: pausa modo difuso → debug socrático → weakness
   - Domingo: retro → ajuste → próxima semana

5. PRINCÍPIOS:
   - Zero containers, zero vector DB, zero infra externa
   - Contexto sobre consulta: LLM recebe estado diretamente
   - Skills como rituais completos, não commands soltos
   - Honestidade forçada: pós-sessão sempre pergunta "o que ficou confuso?"
   - Branching nativo: /tree para tentativas de exercício

Comece pela extension foundation (event sourcing + context injection + commands).
Depois skills core (pomodoro, retrieval, feynman, drill).
Depois UI (timer, status bar, notificações).
```

---

*Arquitetura pensada do zero. Não migração. Reinvenção.*
