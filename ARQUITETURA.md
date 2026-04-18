# Lori — Arquitetura

Este documento explica como o Lori funciona por dentro. É útil se você quer entender o framework para usá-lo melhor, estendê-lo ou depurar algo.

---

## 1. Visão geral

O Lori é uma extension TypeScript para o Pi. Ele não tem banco de dados, não tem servidor, não tem container. O estado inteiro do sistema vive em dois lugares:

1. **Arquivos locais** em `.lori/` — eventos, planos, flashcards.
2. **Contexto da conversa** — a extension injeta informações do estudante antes de cada turno do agente.

Quando você abre uma sessão Pi em um diretório que tem o Lori instalado, a extension:

1. Lê o histórico de eventos (`.lori/state.jsonl`).
2. Reconstrói o estado atual (módulos, weaknesses, streak, timer).
3. Começa a escutar eventos do Pi — novas mensagens, edições de arquivo, fim de turno.
4. Injeta contexto automaticamente quando você fala sobre estudo.

---

## 2. Princípios

**Event sourcing.** Tudo que acontece é um evento append-only. O estado atual é uma projeção — você reconstrói lendo os eventos do início ao fim.

**Contexto sobre consulta.** O agente não pergunta "qual o plano?". O contexto já está na janela de atenção, injetado automaticamente.

**Ciclo, não CRUD.** Aprendizado é um ciclo: preparar → focar → refletir. A arquitetura reflete isso na máquina de estados da sessão.

**Erro é dado.** Eventos de weakness alimentam o sistema. Eles mudam o que o agente pergunta no quiz, qual exercício aparece no drill, e o que vai no SRS.

---

## 3. Event Sourcing

O arquivo `.lori/state.jsonl` é uma lista de eventos, um por linha:

```jsonl
{"type":"plan_created","timestamp":1745000000000,"data":{"module":"rust-foundations","weeks":8}}
{"type":"session_started","timestamp":1745000100000,"data":{"module":"rust-foundations","technique":"drill","objective":"ownership"}}
{"type":"weakness_identified","timestamp":1745000200000,"data":{"concept":"ownership","symptom":"erro ao passar String para função"}}
{"type":"session_ended","timestamp":1745000400000,"data":{"duration":50,"focus":8,"honest":true}}
```

### Por que event sourcing?

- **Auditoria completa.** Você sabe exatamente quando começou um módulo, quantas vezes errou um conceito, qual técnica usou em cada sessão.
- **Reconstrução.** Perdeu o estado em memória? Reconstrói lendo o arquivo.
- **Compactação.** O Pi resume conversas antigas. Os eventos Lori sobrevivem porque são `appendEntry("lori-event", ...)`.

### Eventos principais

| Evento | Quando acontece | O que representa |
|--------|-----------------|------------------|
| `plan_created` | `/lori-plan` | Novo módulo com decomposição |
| `session_started` | `/lori-start` | Início do ciclo de estudo |
| `session_ended` | `/lori-end` | Fim do ciclo, com métricas |
| `timer_started` | `/lori-timer start` | Pomodoro iniciado |
| `timer_ended` | Timer expira ou `/lori-timer stop` | Foco encerrado |
| `weakness_identified` | Erro no drill, quiz, ou pós-sessão | Conceito não dominado |
| `weakness_resolved` | Acerto consistente | Conceito dominado |
| `concept_learned` | `/skill:lori-feynman` | Entendimento validado |
| `drill_completed` | Exercício resolvido | Progresso no procedimento |
| `feynman_done` | Explicação aceita | Gap preenchido |
| `resource_curated` | Link salvo no módulo | Material de referência |
| `retro_done` | `/lori-retro` | Retrospectiva semanal |
| `streak_broken` | Gap > 1 dia sem estudo | Quebra de sequência |

### Persistência dupla

Cada evento é salvo em dois lugares:

1. `.lori/state.jsonl` — arquivo local, independente da sessão Pi.
2. `pi.appendEntry("lori-event", event)` — entra no contexto da conversa, sobrevive a compactações.

Isso garante durabilidade mesmo se você trocar de sessão ou o contexto for resumido.

### Snapshot

Para não reconstruir do zero a cada `session_start`, a extension grava um snapshot (`state-snapshot.json`) a cada 50 eventos. A reconstrução carrega o snapshot e aplica só os eventos mais recentes.

---

## 4. Estado projetado

`memory.ts` lê os eventos e monta um objeto `LoriState` — a visão atual do mundo:

```typescript
interface LoriState {
  config: LoriConfig;              // módulos ativos, weaknesses, streak, metas
  modules: Map<string, LoriModule>; // planos, semanas, retros, conceitos por módulo
  flashcards: Map<string, Flashcard[]>; // SRS por módulo
  activeTimer?: { module, technique, startedAt, durationMinutes };
  todayMinutes: number;            // tempo de estudo hoje
  totalHours: number;              // tempo total acumulado
  recentSessions: RecentSession[]; // últimas 5 sessões
  pendingSRS: number;              // cards devidos hoje
  planProgress: number;            // % do plano concluído
  drillLevels: Map<string, number>; // nível atual por tópico
}
```

Este estado é recalculado inteiro a cada `session_start` ou quando necessário. Não é mutável em disco — só os eventos são persistentes.

---

## 5. Ciclo de aprendizado

`cycle.ts` implementa uma máquina de estados simples:

```
idle → pre-session → in-session → post-session → idle
```

| Fase | O que acontece |
|------|----------------|
| **idle** | Nenhuma sessão ativa. Aguarda `/lori-start`. |
| **pre-session** | Ritual de preparação. Timer configurado. Objetivo definido. |
| **in-session** | Foco. Timer rodando. Você pratica, lê, escreve. |
| **post-session** | Honestidade forçada. "O que ficou confuso?". Registro de métricas. |

A fase atual é reconstruída a partir dos eventos (`getCycleFromEvents`). Não há variável global persistente — se você fecha e reabre o Pi, o ciclo é restaurado lendo o `state.jsonl`.

---

## 6. Injeção de contexto

`context.ts` é o mecanismo que faz o Pi "lembrar" do seu aprendizado.

Antes de cada turno do agente (`before_agent_start`), a extension:

1. Olha o seu prompt.
2. Se contém palavras-chave de estudo (`estudar`, `exercício`, `drill`, etc.), monta uma mensagem de contexto.
3. Se detecta frustração (`travei`, `não consigo`, etc.), monta uma mensagem de protocolo de bloqueio.
4. Injeta como `custom_message` no início do turno.

### Exemplo de contexto injetado

```
[LORI CONTEXT]
Semana: W16 | rust-foundations: Semana 3 de 8
Total: 47.5h
Módulos ativos: rust-foundations
Foco de hoje: ownership e borrowing
Weaknesses: ownership (3 erros); lifetimes (1 erro)
Próxima revisão SRS: 5 cards devidos hoje
Streak: 12 dias | Hoje: 90/120m
Última sessão: rust-foundations | drill | ownership | 50min | foco=8/10 | honest=true
Timer ativo: pomodoro (rust-foundations)
---
```

O agente recebe isso automaticamente. Não há tool call, não há delay. É como se o Pi já soubesse.

---

## 7. Extension e eventos Pi

`index.ts` registra handlers para eventos do ciclo de vida do Pi:

| Evento Pi | Handler |
|-----------|---------|
| `session_start` | Carrega estado, reconstrói ciclo, inicia timer periódico (30s), mostra notificações (SRS devido, streak em risco). |
| `session_tree` | Recarrega estado se mudou. |
| `session_shutdown` | Para timer, salva evento de sessão se timer ativo, limpa estado em memória. |
| `before_agent_start` | Detecta contexto de estudo ou bloqueio, injeta mensagens customizadas. |
| `tool_call` | Intercepta `write`/`edit` em arquivos `.lori/`, gera evento `file_mutated`. |
| `turn_end` | Verifica se timer ativo expirou, notifica no TUI. |
| `session_before_compact` | Resume eventos Lori importantes (weaknesses, recursos, decisões) para que sobrevivam à compactação do contexto. |

### Timer periódico

A extension roda um `setInterval` a cada 30 segundos durante a sessão. Ele:

- Atualiza o widget de timer no TUI.
- Notifica quando faltam 5 minutos.
- Notifica quando o timer acaba.
- Gera evento `timer_ended` automaticamente.

---

## 8. Commands

`commands.ts` registra comandos `/lori-*`. Eles são a interface entre você e o sistema.

| Command | Função |
|---------|--------|
| `/lori-start [mod] [tec]` | Transiciona para `pre-session`, registra `session_started`, envia mensagem de ritual para o agente. |
| `/lori-end [foco] [honesto]` | Transiciona para `post-session`, registra `session_ended`, atualiza streak, força pergunta de honestidade. |
| `/lori-timer start\|stop\|status [min]` | Controla o pomodoro, registra `timer_started`/`timer_ended`. |
| `/lori-plan` | Inicia wizard interativo. Coleta tópico, objetivo, tempo, nível. Cria `plan-draft.md`, `resources.md` (template), dispara agente para gerar plano completo com decomposition 3D + resources curados. Sempre wizard, nunca legacy. |
| `/lori-retro` | Gera artefatos de retrospectiva para cada módulo ativo, cria próxima semana, registra `retro_done`. |
| `/lori-stats` | Mostra resumo calculado do estado: módulos, streak, weaknesses, SRS, honestidade. |
| `/lori-review-srs` | Inicia revisão de flashcards pendentes. |
| `/lori-weak` | Lista weaknesses ativas com contagem de erros. |
| `/lori-resources` | Lista recursos do módulo ativo. |

---

## 9. Skills

Skills não são commands. São rituais completos — um workflow com passos, regras e output esperado. Cada skill é um diretório `.pi/skills/lori-*/SKILL.md`.

A extension não executa a skill. Ela sugere qual skill usar (`skills.ts`) e o agente Pi lê o SKILL.md e guia o ritual. A extension só registra os eventos que resultam do ritual.

### Como uma skill gera eventos

1. Você invoca `/skill:lori-drill`.
2. O agente lê `SKILL.md`, apresenta exercício, guia análise de erro.
3. Quando você acerta ou erra, o agente chama `lori_log_event` (ou a extension detecta via contexto).
4. A extension grava `drill_completed` ou `weakness_identified`.
5. No próximo turno, o contexto injetado já reflete o erro.

---

## 10. Estrutura de diretórios

```
.pi/                              # Bundle do Pi Package
  extensions/lori/                # Extension TypeScript
    index.ts                      # Entry point e listeners
    cycle.ts                      # Máquina de estados da sessão
    context.ts                    # Detecção e injeção de contexto
    events.ts                     # Persistência append-only
    memory.ts                     # Reconstrução de estado
    ui.ts                         # Status bar, widgets, notificações
    skills.ts                     # Sugestão de rituais
    sm2.ts                        # Algoritmo SM-2 para SRS
    tools.ts                      # Custom tools (log_event, review_srs)
    commands.ts                   # Registro de /lori-*
  skills/                         # 9 rituais de aprendizado
    lori-pomodoro/SKILL.md
    lori-decomposition/SKILL.md
    lori-retrieval/SKILL.md
    lori-feynman/SKILL.md
    lori-drill/SKILL.md
    lori-directness/SKILL.md
    lori-srs/SKILL.md
    lori-stuck/SKILL.md
    lori-retro/SKILL.md
  prompts/                        # Templates de sessão
    pre-session.md
    post-session.md
    plan-weekly.md
    plan-retro.md
    stuck.md

.lori/                            # Dados do usuário (event sourcing)
  state.jsonl                     # Eventos append-only
  state-snapshot.json             # Snapshot periódico para performance
  config.json                     # Preferências (módulos ativos, metas, streak)
  modules/
    {nome}/
      plan.md                     # Plano de 4-8 semanas
      week-01.md .. week-NN.md    # Plano semanal (cada uma com seção Recursos da semana)
      retro-WNN.md                # Retrospectiva
      concepts.md                 # Conceitos aprendidos com analogias
      drills.md                   |  Lista de exercícios
      resources.md                # Recursos curados por 3D (Conceitos, Fatos, Procedimentos)
  flashcards/
    {modulo}.jsonl                # Flashcards SRS (front/back/interval/ef)
```

---

## 11. Fluxos típicos

### Novo módulo

```
Usuário: "Quero aprender Rust"
→ before_agent_start detecta contexto de estudo
→ injeta lori-context (nenhum módulo ativo ainda)

Usuário: /lori-plan
→ Wizard interativo: tópico, objetivo, tempo, nível, pré-requisitos
→ Cria plan-draft.md + resources.md (template com placeholders)
→ Dispara agente para gerar:
   - plan.md com decomposition 3D completa
   - resources.md com recursos curados por categoria
   - week-01.md até week-NN.md (N = semanas extraídas do tempo)
   - Cada week linka resources.md na seção Recursos da semana
→ Registra evento plan_created
→ Adiciona rust-foundations em activeModules
```

### Sessão diária

```
Usuário: /lori-start rust-foundations drill
→ evento session_started
→ ciclo: idle → pre-session
→ agente recebe mensagem de ritual (pré-sessão)

Usuário: /lori-timer start 50
→ evento timer_started
→ ciclo: pre-session → in-session
→ widget de timer aparece no TUI

... 50 minutos de foco ...

Timer expira → notificação no TUI
→ evento timer_ended (auto)

Usuário: /lori-end 8 true
→ evento session_ended (50min, foco 8, honesto)
→ ciclo: in-session → post-session → idle
→ atualiza streak
→ agente pergunta: "o que ficou confuso?"

Usuário responde → weakness_identified ou concept_learned
```

### Travou no exercício

```
Usuário: "não consigo fazer isso funcionar"
→ before_agent_start detecta stuck keywords
→ injeta protocolo de bloqueio
→ agente sugere pausa de 15min ou /skill:lori-stuck

Usuário: /skill:lori-stuck
→ agente faz 5 perguntas socráticas
→ se conceito mal entendido: weakness_identified
→ se erro de atenção: drill_completed
```

### Retrospectiva semanal

```
Usuário: /lori-retro
→ para cada módulo ativo:
   - lê eventos da semana
   - gera retro-WNN.md
   - cria week-{NN+1}.md se não existe
→ evento retro_done
→ agente guia perguntas da retrospectiva
```

---

## 12. SRS e SM-2

`sm2.ts` implementa o algoritmo SM-2 para flashcards. Cada módulo tem seu próprio arquivo `.jsonl` de cards.

Um card tem: `front`, `back`, `nextReview` (timestamp), `ef` (fator de facilidade), `interval` (dias), `reps` (repetições).

Quando você revisa, avalia qualidade 0-5. O algoritmo ajusta `ef` e calcula o próximo `nextReview`. Cards com qualidade < 3 são repetidos no mesmo dia.

O comando `/lori-review-srs` lista só os cards com `nextReview <= agora`.

---

## 13. Custom Tools

`tools.ts` registra ferramentas que o agente pode chamar:

| Tool | O que faz |
|------|-----------|
| `lori_log_event` | Grava evento genérico no `state.jsonl`. Usado pelas skills para registrar resultado de ritual. |
| `lori_review_srs` | Lista cards devidos ou registra revisão com qualidade. |
| `lori_get_context` | Retorna string do contexto atual (para debugging). |
| `lori_add_resource` | Salva recurso curado no módulo. |

---

## 14. Compactação de contexto

Conversas longas são resumidas pelo Pi. A extension intercepta `session_before_compact` e gera um resumo Lori-aware que inclui:

- Módulos ativos e weaknesses atuais
- Eventos de tool calls Lori relevantes
- Decisões e recursos recentes

Isso garante que, mesmo após compactação, o agente continue sabendo que você está estudando Rust e erra em lifetimes.
