# Lori — Arquitetura Final

> Sistema de aprendizado autodirigido para qualquer domínio. CS, música, ilustração, idiomas. Construído como Pi Package nativo. Sem bancos. Sem containers. O terminal é a sala de aula.

---

## 1. Visão

O estudante não "usa" um sistema. O Pi **é** o ambiente de aprendizado. Cada sessão de estudo acontece dentro de uma sessão Pi normal. O aluno conversa, escreve, pratica, lê — tudo no mesmo terminal.

**Instalação:**
```bash
pi install git:github.com/dslara/lori
```

---

## 2. Filosofia

| Princípio | Implicação |
|-----------|------------|
| **O terminal é a sala de aula** | Sem dashboards web, sem apps mobile. Tudo no TUI do Pi. |
| **Aprendizado é cíclico, não transacional** | Ciclos: preparar → focar → consolidar → refletir → planejar. Não CRUD. |
| **Memória é contexto, não banco** | LLM sabe que aluno erra acordes porque contexto é injetado, não consultado. |
| **Técnica é ritual, não feature** | Cada método (Feynman, SRS, Drill) é workflow completo com passos. |
| **Erro é dado, não falha** | Cada erro gera evento. Padrões de erro = matéria-prima da estratégia. |
| **Curadoria sobre indexação** | Recursos selecionados manualmente com ajuda do agente, não crawleados. |

---

## 3. O que muda radicalmente

| Aspecto | Abordagem Atual | Nova Proposta |
|---------|----------------|---------------|
| **Distribuição** | Clone git + Docker + setup manual | `pi install` como Pi Package |
| **Infra** | Docker (Ollama + OpenViking) | Zero containers. Zero bancos. |
| **Dados** | CSVs + memória vetorial externa | Event sourcing nativo (`appendEntry` + `state.jsonl`) |
| **Agentes** | Arquivos markdown estáticos | Extension TypeScript viva + skills com ritual |
| **Contexto** | Tool `context-hybrid` chamada manual | Injeção automática via `before_agent_start` |
| **Interface** | Commands markdown + texto puro | Widgets TUI, timer integrado, status bar |
| **Branching** | Inexistente | `/tree` nativo para tentar exercício de formas diferentes |
| **Compactação** | Padrão do Pi (genérica) | Customizada: mantém pontos fracos, recursos, decisões |
| **Curadoria** | Indexação automática de recursos | Seleção manual com ajuda do agente |

---

## 4. Arquitetura de Componentes

### 4.1 Pi Package

Distribuído como pacote npm/git. Instala extension, skills, prompts e tema.

```
package.json
  pi:
    extensions: ["./extensions/lori/index.ts"]
    skills: ["./skills"]
    prompts: ["./prompts"]
    themes: ["./themes"]
```

### 4.2 Extension `.pi/extensions/lori/`

Cérebro do sistema. TypeScript. Event-driven.

| Módulo | Responsabilidade |
|--------|-----------------|
| `index.ts` | Entry point. Registra tools, commands, listeners. |
| `cycle.ts` | Máquina de estados: idle → pre-session → in-session → post-session. |
| `context.ts` | Monta e injeta `lori-context` via `before_agent_start`. |
| `events.ts` | Persiste e recupera eventos (`appendEntry` + `state.jsonl`). |
| `memory.ts` | Reconstrói estado projetado a partir do log de eventos. |
| `ui.ts` | Timer, widgets, notificações, status bar. |
| `skills.ts` | Registra skills dinamicamente e mapeia para rituais. |

**Eventos Pi interceptados:**

| Evento Pi | O que a extension faz |
|-----------|----------------------|
| `session_start` | Carrega `state.jsonl`. Reconstrói estado. Mostra streak no status bar. |
| `before_agent_start` | Se prompt contém keywords de estudo, injeta `lori-context` como `custom_message`. |
| `tool_call` (edit/write em `.lori/`) | Gera eventos automáticos (ex: `resource_curated`, `concept_learned`). |
| `session_before_compact` | Resumo UL-aware: mantém pontos fracos, recursos, próximos passos. |
| `turn_end` | Se timer ativo, verifica se sessão acabou. Notifica. |
| `session_shutdown` | Garante que eventos pendentes foram salvos. |

### 4.3 Ciclo de Aprendizado

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

### 4.4 Event Sourcing

Tudo que acontece é evento append-only. Estado = projeção dos eventos.

**Persistência dupla:**
1. `pi.appendEntry("lori-event", event)` — vive na sessão Pi, sobrevive compaction
2. `.lori/state.jsonl` — réplica local para durabilidade entre sessões

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

**Exemplos de `state.jsonl`:**

CS:
```jsonl
{"type":"plan_created","module":"rust-async","weeks":5,"goals":["lifetimes","async/await","tokio"],"date":"2026-04-01T10:00:00Z"}
{"type":"session_started","module":"rust-async","technique":"drill","objective":"Lifetime elision","date":"2026-04-02T08:00:00Z"}
{"type":"drill_completed","topic":"lifetime-elision","attempts":3,"errors":1,"date":"2026-04-02T08:52:00Z"}
{"type":"weakness_identified","concept":"closure-ownership","symptom":"erro ao passar closure para thread","date":"2026-04-02T08:45:00Z"}
{"type":"concept_learned","concept":"lifetime-elision","analogy":"é como o compilador adivinhar o pronome 'ele' em português","confidence":7,"date":"2026-04-02T08:50:00Z"}
{"type":"session_ended","duration":52,"focus":8,"honest":true,"notes":"achei fácil demais, devia ter pulado para nível 3","date":"2026-04-02T08:55:00Z"}
```

Música:
```jsonl
{"type":"plan_created","module":"jazz-harmonia","weeks":4,"goals":["ii-V-I","substituições tritonô","voicings"],"date":"2026-04-01T10:00:00Z"}
{"type":"session_started","module":"jazz-harmonia","technique":"drill","objective":"Voicings de mão esquerda em todas as tonalidades","date":"2026-04-02T08:00:00Z"}
{"type":"drill_completed","topic":"voicings-ii-V-I","attempts":5,"errors":2,"date":"2026-04-02T08:52:00Z"}
{"type":"weakness_identified","concept":"substituicao-tritono","symptom":"demora para achar o acorde substituto em tempo real","date":"2026-04-02T08:45:00Z"}
{"type":"concept_learned","concept":"substituicao-tritono","analogy":"é como trocar um tom escuro pelo seu oposto brilhante, mantendo a função","confidence":6,"date":"2026-04-02T08:50:00Z"}
{"type":"session_ended","duration":50,"focus":9,"honest":true,"notes":"mão travou no Eb, preciso isolar","date":"2026-04-02T08:55:00Z"}
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

### 4.5 Contexto Vivo

Bloco injetado automaticamente quando `before_agent_start` detecta contexto de estudo:

```
[LORI CONTEXT]

Módulo ativo: jazz-harmonia
Semana: 3 de 4
Streak: 12 dias

Foco de hoje (do plano):
  - Voicings de mão esquerda em ii-V-I

Pontos fracos ativos:
  - substituição tritônica (2 erros)
  - modulação para tonalidades remotas

Última sessão:
  - Técnica: drill
  - Tópico: voicings em todas as tonalidades
  - Duração: 50min, foco: 9/10
  - Honestidade: "mão travou no Eb, preciso isolar"

Próxima revisão SRS: círculo de quintas (hoje)

Recursos descobertos recentemente:
  - jazz-piano-comping/voicings-shell.md
  - realbook/standards/bluebossa.pdf
```

Não existe "consulta". O contexto **já está lá** na janela de contexto do LLM.

### 4.6 Markdown como Memória Qualitativa

Eventos capturam **o que aconteceu**. Markdown captura **o que foi aprendido**.

```markdown
<!-- .lori/modules/jazz-harmonia/concepts.md -->

## Substituição Tritônica
**Data**: 2026-04-02
**Confiança**: 6/10
**Analogia**: "Trocar um terno escuro pelo oposto brilhante. A função harmônica continua, mas a cor muda completamente."
**Gaps**: Aplicar em tempo real durante improvisação. Preciso isolar por tonalidade.
**Cards SRS**: ✅ Criado
```

### 4.7 Flashcards SRS

```jsonl
// .lori/flashcards/jazz-harmonia.jsonl
{"front":"Qual acorde substitui G7 em ii-V-I em C?","back":"Db7 (mesmo trítono F-B)","next_review":"2026-04-05","ef":2.5,"interval":3,"reps":2}
{"front":"Regra do shell voicing mão esquerda","back":"3ª + 7ª do acorde. No máximo 2 notas.","next_review":"2026-04-03","ef":2.3,"interval":1,"reps":1}
```

Algoritmo SM-2. Revisão diária via `/ul-review-srs`.

---

## 5. Skills: Rituais de Aprendizado

Cada skill é workflow completo. Invocada via `/skill:ul-feynman` ou guiada pelo ciclo.

### 5.1 `ul-pomodoro` — Foco Protegido

```markdown
---
name: ul-pomodoro
description: Ritual de foco profundo para sessões de estudo. Configura timer, elimina interrupções, protege ciclo de aprendizado. Use antes de qualquer técnica de estudo.
---

# Pomodoro para Lori

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

### 5.2 `ul-feynman` — Validar Compreensão

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

### 5.3 `ul-retrieval` — Quiz Socrático

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

### 5.4 `ul-drill` — Repetição Deliberada

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
2. Aluno resolve SOZINHO (agente não dá a solução)
3. Se erro: agente guia com 3 perguntas socráticas
   - "O que você espera que aconteça neste passo?"
   - "O que realmente acontece?"
   - "Qual a diferença?"
4. Aluno refaz. Repete até acerto.
5. Acerto: variação mais difícil (mais parâmetros, edge case)

## Progressão

- Nível 1: Exercício guiado (muitas dicas)
- Nível 2: Exercício independente
- Nível 3: Exercício com twist
- Nível 4: Exercício sob pressão (tempo limitado, condições reais)

## Output

- Evento: `drill_completed` (tentativas, erros)
- Se erro persistente: evento `weakness_identified`
```

### 5.5 `ul-srs` — Flashcards

```markdown
---
name: ul-srs
description: Spaced Repetition System para memorização. Criar flashcards com front/back. Revisão diária via algoritmo SM-2. Use para fatos, termos, regras, fórmulas.
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

- Arquivo: `.lori/flashcards/{module}.jsonl`
- Evento: `concept_learned` (novo) ou reforço
```

### 5.6 `ul-directness` — Projeto Real

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
   - Ruim (música): "tocar escala maior em loop"
   - Bom (música): "compor uma lead sheet de 32 compassos usando ii-V-I"
2. Agente ajuda a decompor em 3-5 milestones
3. Aluno executa milestone 1 SOZINHO
4. Review socrático do agente (não corrige, pergunta)
5. Próximo milestone

## Regras

- Agente NUNCA executa o trabalho do projeto
- Agente pode explicar conceito relacionado
- Agente pode sugerir referência, não solução pronta
- Aluno pode usar pesquisa, livros, vídeos
- Objetivo: funcionar, não ser perfeito

## Output

- Evento: `drill_completed` (cada milestone)
- Artefato: projeto no diretório de trabalho
- Recurso: `resource_curated` (referências usadas)
```

### 5.7 `ul-debug-socratic` — Debug com Perguntas

```markdown
---
name: ul-stuck
description: Guia socrático para quando travar. Agente faz 5 perguntas sistemáticas. Nunca dá a resposta. Use quando não consegue avançar e não sabe por quê.
---

# Quando Travar

## As 5 Perguntas

1. "O que você espera que aconteça? Descreva em português."
2. "O que REALMENTE acontece? (Observe, não interprete)"
3. "Qual o primeiro ponto onde expectativa ≠ realidade?"
4. "O que você SABE que é verdade sobre [elemento chave] neste ponto?"
5. "Qual a menor mudança que testaria sua hipótese?"

## Regras

- Agente NUNCA aponta diretamente o erro
- Agente NUNCA resolve pelo aluno
- Agente pode pedir para isolar o elemento em questão
- Agente pode pedir para registrar observações

## Output

- Evento: `weakness_identified` (se conceito mal entendido)
- Evento: `drill_completed` (se foi só erro de atenção)
```

### 5.8 `ul-decomposition` — Quebrar Objetivos

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

### 5.9 `ul-retro` — Retrospectiva

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

## 6. UI/UX Integrada

### 6.1 Status Bar Persistente

```
[rust-async W3] 🔥12 ⚡2 weaknesses ⏳3 SRS  [glm-5]  [tokens: 12k/200k]
```

### 6.2 Widget de Sessão Ativa

```
┌────────────────────────────────────┐
│ ⏱️ 32m / 50m  ████████████████░░░░ │
│ 🎯 Lifetime elision                │
│ 🔧 Drill Nível 2                   │
│ 💡 Dica: pense em "quem empresta"  │
└────────────────────────────────────┘
```

### 6.3 Notificações

- Timer acabando: `ctx.ui.notify("⏱️ 5 minutos restantes", "warning")`
- SRS pendente: `ctx.ui.notify("📚 3 flashcards para revisar", "info")`
- Streak em risco: `ctx.ui.notify("🔥 Streak acaba em 4h!", "error")`

---

## 7. Commands

| Command | Ação |
|---------|------|
| `/ul-start` | Inicia ciclo de estudo. Injetor de contexto + ritual pré-sessão. |
| `/ul-end` | Finaliza ciclo. Ritual pós-sessão + evento `session_ended`. |
| `/ul-timer [start\|stop\|status]` | Pomodoro integrado no TUI. |
| `/ul-plan` | Mostra plano da semana e progresso. |
| `/ul-retro` | Guia retrospectiva interativa. |
| `/ul-weak` | Lista pontos fracos ativos com contagem de erros. |
| `/ul-resources` | Lista recursos curados do módulo ativo. |
| `/ul-stats` | Analytics derivados dos eventos (streak, horas, técnicas). |
| `/ul-review-srs` | Flashcards pendentes de revisão. |

---

## 8. Custom Tools

| Tool | Uso |
|------|-----|
| `lori_log_event` | Persistir evento no `state.jsonl`. Chamado implicitamente pelos ciclos. |
| `lori_get_context` | Retorna contexto vivo reconstruído de eventos. |
| `lori_review_srs` | Listar flashcards pendentes de revisão. |
| `lori_search_concepts` | Busca exata em `concepts.md` + eventos. |
| `lori_add_resource` | Curar recurso: salva URL + notas + tags. |

---

## 9. Estrutura de Diretórios

```
.pi/                                # Nativo do Pi
  extensions/
    lori/
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
    ul-stuck/SKILL.md
    ul-decomposition/SKILL.md
    ul-retro/SKILL.md
  prompts/
    pre-session.md
    post-session.md
    plan-weekly.md
    plan-retro.md
    stuck.md

.lori/                     # Dados do sistema
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

## 10. Fluxos Completos

### 10.1 Iniciar novo módulo

```
Usuário: "Quero aprender Rust async"

Pi:
  1. Detecta novo módulo via before_agent_start
  2. Sugere /skill:ul-decomposition
  3. Skill guia decomposição em 5 semanas
  4. Gera .lori/modules/rust-async/plan.md
  5. Gera week-01.md
  6. Evento: plan_created
  7. Próximo passo: /ul-start amanhã
```

### 10.2 Sessão diária completa

```
Usuário: /ul-start

Pi:
  1. before_agent_start injeta lori-context
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

### 10.3 Travou no exercício

```
Usuário: "Não consigo fazer isso funcionar"

Pi:
  1. Detecta frustração (palavras-chave ou explicitamente)
  2. Sugere: pausa de 15 min (modo difuso)
  3. Timer de pausa
  4. Após pausa, /skill:ul-stuck
  5. Se ainda travado após 5 perguntas:
     - Registra weakness_identified
     - Sugere downgradear para exercício mais simples
     - Ou sugerir /skill:ul-feynman no conceito subjacente
```

### 10.4 Domingo: Planejamento + Retro

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

## 11. Roadmap de Implementação

### Fase 1: Foundation (2h)
- [ ] Scaffold `.pi/extensions/lori/` com `index.ts`
- [ ] Configurar `package.json` com manifest `pi` (extension + skills + prompts)
- [ ] Criar `.lori/` com estrutura de diretórios
- [ ] Implementar `state.jsonl` e funções de event sourcing
- [ ] Registrar commands básicos: `/ul-start`, `/ul-end`, `/ul-stats`

### Fase 2: Ciclos (2h)
- [ ] Máquina de estados: idle → pre-session → in-session → post-session
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
- [ ] `ul-stuck` — quando travar, perguntas socráticas genéricas
- [ ] `ul-decomposition` — quebrar objetivos
- [ ] `ul-retro` — retrospectiva semanal

### Fase 5: UI (2h)
- [ ] Status bar persistente (streak, módulo, SRS, weaknesses)
- [ ] Widget de timer ativo
- [ ] Notificações (timer, SRS, streak)
- [ ] `/ul-stats` com analytics derivados

### Fase 6: Integração + Pi Package (1h)
- [ ] Prompt templates: `/ul-start`, `/ul-end`, `/ul-plan`, `/ul-stuck`
- [ ] Testar `pi install` local
- [ ] Teste end-to-end: novo módulo → sessão → retro
- [ ] Documentação: `HOW_TO_USE.md`

**Total estimado: ~12h**

---

## 12. Prompt Executável

```
Crie sistema Lori como Pi Package nativo.

1. PI PACKAGE: package.json com manifest pi (extensions, skills, prompts, themes)
   - Distribuição: pi install git:dslara/lori

2. EXTENSION `.pi/extensions/lori/index.ts`:
   - Event sourcing: eventos append-only em `.lori/state.jsonl` + `appendEntry`
   - Eventos Pi:
     * session_start: reconstruir estado de state.jsonl + session entries
     * before_agent_start: detectar keywords de estudo, injetar lori-context
     * tool_call: interceptar edit/write em .lori/ para eventos automáticos
     * session_before_compact: resumo UL-aware mantendo weaknesses, recursos
     * turn_end: verificar timer ativo, notificar
   - Commands: /ul-start, /ul-end, /ul-timer, /ul-plan, /ul-retro, /ul-stats, /ul-review-srs
   - Custom tools: lori_log_event, lori_get_context, lori_review_srs, lori_search_concepts, lori_add_resource
   - UI: status bar [módulo] [streak] [SRS] [weaknesses], widget de timer, notificações

3. SKILLS `.pi/skills/` (rituais completos, cada uma com SKILL.md):
   - ul-pomodoro: timer 50/10, proteção de interrupções
   - ul-retrieval: quiz adaptativo baseado em erros
   - ul-feynman: explicar para criança, identificar gaps
   - ul-drill: repetição deliberada com progressão de nível
   - ul-srs: flashcards SM-2, criação e revisão
   - ul-directness: projeto real, review socrático
   - ul-stuck: 5 perguntas sistemáticas para quando travar
   - ul-decomposition: framework 3D (conceitos 40%, fatos 20%, procedimentos 40%)
   - ul-retro: retrospectiva semanal com ajustes

4. ESTRUTURA `.lori/`:
   - state.jsonl: eventos append-only
   - config.json: preferências estáveis
   - modules/{name}/: plan.md, week-*.md, retro-*.md, concepts.md, drills.md, resources.md, benchmark.md
   - resources/: materiais curados como markdown
   - flashcards/{module}.jsonl: SRS com SM-2

5. FLUXOS implementados:
   - Novo módulo: decomposição → plano → semanas
   - Sessão diária: pré-sessão → técnica → pós-sessão → eventos
   - Travou: pausa modo difuso → debug socrático → weakness
   - Domingo: retro → ajuste → próxima semana

6. PRINCÍPIOS:
   - Zero containers, zero vector DB, zero infra externa
   - Contexto sobre consulta: LLM recebe estado diretamente via custom_message
   - Skills como rituais completos, não commands soltos
   - Honestidade forçada: pós-sessão sempre pergunta "o que ficou confuso?"
   - Branching nativo: /tree para tentativas de exercício

Comece pela extension foundation (event sourcing + context injection + commands).
Depois skills core (pomodoro, retrieval, feynman, drill).
Depois UI (timer, status bar, notificações).
Depois empacotar como Pi Package.
```

---

*Arquitetura final. Funde o melhor das duas propostas: substância das skills + Pi Package + todos os eventos Pi + exemplos reais.*
