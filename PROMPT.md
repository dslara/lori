# Prompt Executável — Lori

Copie e cole este prompt em uma sessão Pi para gerar o sistema completo.

---

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
   - Commands: /lori-start, /lori-end, /lori-timer, /lori-plan, /lori-retro, /lori-stats, /lori-review-srs
   - Custom tools: lori_log_event, lori_get_context, lori_review_srs, lori_search_concepts, lori_add_resource
   - UI: status bar [módulo] [streak] [SRS] [weaknesses], widget de timer, notificações

3. SKILLS `.pi/skills/` (rituais completos, cada uma com SKILL.md):
   - lori-pomodoro: timer 50/10, proteção de interrupções
   - lori-retrieval: quiz adaptativo baseado em erros
   - lori-feynman: explicar para criança, identificar gaps
   - lori-drill: repetição deliberada com progressão de nível
   - lori-srs: flashcards SM-2, criação e revisão
   - lori-directness: projeto real, review socrático
   - lori-stuck: 5 perguntas sistemáticas para quando travar
   - lori-decomposition: framework 3D (conceitos 40%, fatos 20%, procedimentos 40%)
   - lori-retro: retrospectiva semanal com ajustes

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
