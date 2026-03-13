# 🚀 Ultralearning System

Sistema de aprendizado autodirigido integrando três abordagens científicas:

| Abordagem | Autor | Foco |
|-----------|-------|------|
| **Ultralearning** | Scott Young | Intensidade e imersão profunda |
| **A Mind for Numbers** | Dra. Barbara Oakley | Eficiência cognitiva para exatas |
| **Atomic Habits** | James Clear | Consistência e rituais sustentáveis |

Otimizado para aprendizado acelerado de Ciência da Computação.

## ⚡ Como Usar

> **Guia completo**: [`HOW_TO_USE.md`](HOW_TO_USE.md) — Setup, rotina diária, commands, troubleshooting.

### Interface Principal (OpenCode)

Todas as funcionalidades são acessíveis via **commands** no TUI do OpenCode:

```bash
# Sessão de estudo
/ul-study-start              # Iniciar sessão com contexto
/ul-practice-drill recursão  # Prática deliberada
/ul-practice-feynman closures  # Validar compreensão
/ul-practice-quiz 3 Big O    # Warm-up
/ul-study-end                # Encerrar e salvar progresso

# Planejamento
/ul-plan-decompose "Aprender algoritmos"  # Decompor objetivo
/ul-plan-weekly 1            # Criar plano semanal
/ul-retro-weekly             # Retrospectiva semanal

# Revisão
/ul-memory-create            # Criar flashcard
/ul-memory-review            # Revisar flashcards

# Módulos
/ul-module-create [nome]     # Criar novo módulo
/ul-module-switch [nome]     # Alternar módulo ativo
/ul-module-archive [nome]    # Arquivar módulo finalizado
```

### Commands Disponíveis

Digite `/` no TUI para acessar todos os commands:

#### Commands de Sessão (`/ul-study-*`)

| Command | Descrição |
|---------|-----------|
| `/ul-study-start` | Iniciar sessão com contexto automático |
| `/ul-study-end` | Encerrar sessão e salvar progresso |
| `/ul-study-plan` | Ver progresso da semana e plano atual |

#### Commands de Prática (`/ul-practice-*`)

| Command | Descrição |
|---------|-----------|
| `/ul-practice-drill [conceito]` | Prática deliberada 5-10x |
| `/ul-practice-feynman [conceito]` | Validar compreensão explicando |
| `/ul-practice-quiz N [tópico]` | Warm-up com quiz adaptativo |
| `/ul-practice-project [desafio]` | Aprender fazendo projetos reais |

#### Commands de Aprendizado (`/ul-learn-*`)

| Command | Descrição |
|---------|-----------|
| `/ul-learn-explain [conceito]` | Introduzir conceito novo com analogias |
| `/ul-learn-debug` | Debug socrático - guia para encontrar bugs |

#### Commands de Produtividade (`/ul-productivity-*`)

| Command | Descrição |
|---------|-----------|
| `/ul-productivity-start` | Superar procrastinação (Two-Minute Rule) |
| `/ul-productivity-break` | Modo difuso - pausa ativa quando travado |

#### Commands de Setup (`/ul-setup-*`)

| Command | Descrição |
|---------|-----------|
| `/ul-setup-scaffold [projeto]` | Criar estrutura/boilerplate de projeto |
| `/ul-setup-check` | Verificar dependências do sistema |

#### Commands de Memória (`/ul-memory-*`)

| Command | Descrição |
|---------|-----------|
| `/ul-memory-create` | Criar flashcards SRS |
| `/ul-memory-review` | Revisar flashcards pendentes |

#### Commands de Planejamento (`/ul-plan-*`)

| Command | Descrição |
|---------|-----------|
| `/ul-plan-decompose [objetivo]` | Decompor objetivo complexo |
| `/ul-plan-weekly [semana]` | Criar plano semanal detalhado |
| `/ul-retro-weekly` | Retrospectiva semanal |
| `/ul-plan-benchmark [skill]` | Criar teste de proficiência mensurável |
| `/ul-plan-adjust [situação]` | Reajustar cronograma |
| `/ul-plan-resources [tópico]` | Mapear recursos em 3 tiers |

#### Commands de Módulos (`/ul-module-*`)

| Command | Descrição |
|---------|-----------|
| `/ul-module-create [nome]` | Criar novo módulo de estudo |
| `/ul-module-switch [nome]` | Alternar módulo ativo |
| `/ul-module-archive [nome]` | Arquivar módulo finalizado |

#### Commands de Dados (`/ul-data-*`)

| Command | Descrição |
|---------|-----------|
| `/ul-data-status` | Ver streak, sessões, módulo atual |
| `/ul-data-analytics` | Ver relatório analítico avançado |
| `/ul-data-dashboard` | Ver dashboard completo com métricas |
| `/ul-data-manage [op]` | Gerenciar dados (init, reset) |
| `/ul-data-backup` | Criar backup dos dados |

#### Commands de Revisão (`/ul-retro-*`)

| Command | Descrição |
|---------|-----------|
| `/ul-retro-weekly` | Criar retrospectiva semanal |

---

## 🤖 Agentes & Skills

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  COMMANDS (.opencode/commands/)                             │
│  ════════════════════════════════════════════════════════   │
│  29 commands /ul-* — Interface principal via TUI            │
│                                                             │
│  Cada command define:                                       │
│  - agent: tutor, meta ou review                             │
│  - model: glm-5, kimi-k2.5 ou minimax-m2.5                  │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ Invocam
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  TOOLS (.opencode/tools/)                                   │
│  ════════════════════════════════════════════════════════   │
│  13 tools TypeScript — Processamento de dados                │
│                                                             │
│  - data.ts (facade) — Delega para módulos                │
│  - data-session.ts — Sessões                            │
│  - data-module.ts — Módulos                              │
│  - data-flashcard.ts — Flashcards/SRS                       │
│  - data-insight.ts — Insights/streak                        │
│  - data-interaction.ts — Interações                        │
│  - data-core.ts — Core ops (init, backup)                    │
│  - context.ts, insights.ts, status.ts                      │
│  - retro.ts, setup.ts                                       │
│                                                             │
│  Cache de 5min • Tipagem Zod • CSV parsing                  │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ Carregam on-demand
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  SKILLS (.opencode/skills/)                                 │
│  ════════════════════════════════════════════════════════   │
│  5 skills mantidas — Guias especializados                   │
│                                                             │
│  - session → Orquestrar sessões                             │
│  - directness → Projetos reais                              │
│  - debug-socratic → Guia socrático de bugs                  │
│  - srs-generator → Gerar flashcards                         │
│  - decomposition → Dividir objetivos                        │
└─────────────────────────────────────────────────────────────┘
```

### Separação de Responsabilidades

| Camada | Responsabilidade | Exemplos |
|--------|------------------|----------|
| **Commands** | Interface do usuário | `/ul-study-start`, `/ul-practice-drill` |
| **Tools** | Processamento de dados | `data.ts`, `insights.ts`, `context.ts` |
| **Skills** | Guias especializados | `directness`, `debug-socratic` |
| **Agents** | Comportamento dos LLMs | `@tutor`, `@meta`, `@review` |

### Agentes

| Agente | Modelo | Função |
|--------|--------|--------|
| **@tutor** | GLM-5 / Kimi K2.5 / MiniMax M2.5 | Mentor socrático, quiz, drills, feedback |
| **@meta** | GLM-5 / MiniMax M2.5 | Planejamento estratégico, decomposição |
| **@review** | GLM-5 | Auditoria do framework |

### Skills Mantidas

| Skill | Command que invoca | Descrição |
|-------|-------------------|-----------|
| `session` | `/ul-study-*` | Orquestrar início/fim de sessão |
| `directness` | `/ul-practice-project` | Guia socrático para projetos reais |
| `debug-socratic` | `/ul-learn-debug` | Guia socrático para encontrar bugs |
| `srs-generator` | `/ul-memory-create`, `/ul-memory-review` | Gerar flashcards dinamicamente |
| `decomposition` | `/ul-plan-decompose` | Dividir objetivos complexos |

### Commands por Agente

| Agente | Commands |
|--------|----------|
| **@tutor** | `/ul-study-*`, `/ul-practice-*`, `/ul-learn-*`, `/ul-productivity-*`, `/ul-memory-*`, `/ul-setup-*`, `/ul-data-*` |
| **@meta** | `/ul-plan-*`, `/ul-module-*`, `/ul-retro-*` |
| **@review** | `/ul-review-*` |

### Keywords Avançadas

Funcionalidades acessíveis via invocação direta do agente:

#### @meta - Planejamento

| Keyword | Descrição | Exemplo |
|---------|-----------|---------|
| `#update-plan semana N` | Registrar progresso | `@meta #update-plan semana 3` |
| `#habit-stack` | Criar cadeia de hábitos | `@meta #habit-stack` |

> **Nota**: As funcionalidades `#map-resources` e `#adjust-plan` agora são commands: `/ul-plan-resources` e `/ul-plan-adjust`

#### @review - Auditoria

| Keyword | Descrição | Exemplo |
|---------|-----------|---------|
| `#review-structure` | Estrutura do projeto | `@review #review-structure` |
| `#review-tools` | Qualidade das tools | `@review #review-tools` |
| `#review-docs` | Documentação | `@review #review-docs` |
| `#review-commands` | Commands `/ul-*` | `@review #review-commands` |
| `#review-agents` | Agentes | `@review #review-agents` |
| `#review-skills` | Skills | `@review #review-skills` |
| `#review-consistency` | Análise completa | `@review #review-consistency` |
| `#review-costs` | Otimização de tokens | `@review #review-costs` |

---

## 📚 Fundamentação Científica

Este sistema integra três abordagens complementares:

| Abordagem | Autor | Foco | Implementação |
|-----------|-------|------|---------------|
| **Ultralearning** | Scott Young | Intensidade e imersão | 9 princípios + 24 técnicas |
| **A Mind for Numbers** | Dra. Barbara Oakley | Eficiência cognitiva | Chunking, Foco/Difuso, Overlearning |
| **Atomic Habits** | James Clear | Consistência e rituais | Cue-Routine-Reward, Habit Stacking, Two-Minute Rule |

### Técnicas de James Clear (Atomic Habits)

**Cue-Routine-Reward (Loop do Hábito):**
Os commands `/ul-*` implementam o loop completo:
- **Cue**: Configurar ambiente (`environment-design.md`)
- **Routine**: `/ul-study-start` → `/ul-practice-*` → `/ul-study-end`
- **Reward**: Streak atualizado (`/ul-data-status`)

**Habit Stacking (Empilhamento):**
Acople ao seu dia existente:
```bash
# Após café da manhã:
/ul-study-start  # 25 min de estudo

# Após almoço:
/ul-memory-review # SRS de 10 min
```

**Two-Minute Rule:**
Comece ridicularmente pequeno:
- "Vou abrir só o VS Code" (5 segundos)
- "Vou ler 1 linha de código" (10 segundos)
- Naturalmente continua além dos 2 minutos

---

### Técnicas da Dra. Barbara Oakley

**Chunking (Blocos de Conhecimento):**
- `drill.md` → Chunks de procedimentos
- `feynman.md` → Chunks conceituais
- `flashcards.md` → Chunks de fatos

**Modos de Pensamento:**
- `pomodoro.md` → Alternância foco/difuso
- `focused-diffuse.md` → Gestão intencional dos modos

**Transferência & Overlearning:**
- `chunk-transfer.md` → Conectar entre domínios
- `drill.md` → Praticar além do básico

**Procrastinação:**
- `procrastination-zombie.md` → Zombie Mode

---

## 📁 Estrutura do Projeto

```
ultralearning/
├── .opencode/
│   ├── agents/           # @meta, @tutor, @review
│   ├── commands/         # 29 commands /ul-*
│   ├── skills/           # 5 skills carregadas on-demand
│   ├── tools/            # 9 tools TypeScript
│   └── opencode.json     # Config de modelos + agents
├── data/                 # Base de dados local (CSV)
│   ├── sessions.csv      # Sessões diárias
│   ├── insights.csv      # Métricas (streak, tempo, foco)
│   ├── tutor_interactions.csv  # Memória do tutor
│   ├── modules.csv       # Módulos de estudo
│   └── schema.md         # Documentação do schema
├── projects/             # Módulos de aprendizado
│   ├── [modulo]/
│   │   ├── meta/         # Planos ativos (learning-map, weeks)
│   │   ├── projects/     # Projetos práticos
│   │   └── knowledge/    # Conceitos aprendidos
│   └── shared/           # Recursos compartilhados
│       └── planning/     # Planejamento multi-módulo
├── guides/               # 9 princípios + 24 técnicas
├── reviews/              # Revisões técnicas do framework
└── planning/             # Propostas de mudança do FRAMEWORK
```

O projeto está organizado em pastas especializadas:

| Pasta | Propósito | Documentação |
|-------|-----------|--------------|
| `.opencode/agents/` | Agentes opencode com frontmatter YAML | — |
| `.opencode/commands/` | 29 commands `/ul-*` (interface principal) | — |
| `.opencode/tools/` | 9 tools TypeScript (processamento de dados) | — |
| `.opencode/skills/` | Skills carregadas on-demand pelos agentes | [Template](.opencode/skills/_template-skill/SKILL.md) |
| `data/` | Base de dados local (CSV) | [schema.md](data/schema.md) |
| `projects/` | Módulos e projetos de aprendizado | [README](projects/README.md) |
| `guides/` | Biblioteca de técnicas e princípios de aprendizado | [README](guides/README.md) |
| `planning/` | Propostas de mudança do framework | [README](planning/README.md) |
| `reviews/` | Revisões técnicas do framework (consolidadas) | [README](reviews/README.md) |
| `archived/` | Projetos finalizados e arquivados | [README](archived/README.md) |

### Separação de Planejamento

| Domínio | Local |
|---------|-------|
| **Framework** (commands, tools, agents) | `planning/` |
| **Módulo específico** (currículo, migração de linguagem) | `projects/[modulo]/planning/` |
| **Compartilhado** (múltiplos módulos) | `projects/shared/planning/` |
| **Planos ativos** (learning-map, weeks, phases) | `projects/[modulo]/meta/` |

## 📦 Arquivamento de Projetos

Quando um projeto é concluído, use `/ul-module-archive [nome]` para:
- Mover todos os arquivos para `archived/[modulo]/[data]-[nome]/`
- Preservar logs, código, conhecimento e metadados
- Criar um relatório final de lições aprendidas
- Manter o módulo ativo limpo

O projeto arquivado mantém todo o histórico e pode ser consultado futuramente.

---

## 🔥 Workflow Diário

```
┌───────────────────────────────────────────────┐
│  /ul-study-start    (5 min)                   │
│  └── Carrega contexto + sugere atividade      │
├───────────────────────────────────────────────┤
│  /ul-practice-*     (50 min)                  │
│  ├── drill      → Exercícios repetitivos      │
│  ├── feynman    → Explicar conceito           │
│  ├── quiz       → Warm-up com perguntas       │
│  └── project    → Projeto prático             │
├───────────────────────────────────────────────┤
│  /ul-study-end      (5 min)                   │
│  └── Salva sessão + atualiza streak           │
└───────────────────────────────────────────────┘
```

**Alternativas durante a sessão**:
- `/ul-learn-explain [conceito]` — Introduzir conceito novo
- `/ul-learn-debug` — Debug socrático
- `/ul-productivity-break` — Modo difuso quando travado
- `/ul-productivity-start` — Superar procrastinação

---

## 💰 Custo Estimado (Plano Go)

| Modelo | Uso | Preço |
|--------|-----|-------|
| **GLM-5** | Raciocínio complexo | Incluído no plano Go |
| **Kimi K2.5** | Código e projetos | Incluído no plano Go |
| **MiniMax M2.5** | Orquestração simples | Incluído no plano Go |

**Plano Go**: $10/mês com requests generosos

- **Por sessão (1h)**: ~0.01€
- **Por mês (30 dias)**: ~0.30€
- **Orçamento**: 15€/mês (margem generosa)

---

## 📚 Metodologia

Baseado em **Ultralearning** de Scott Young:
1. **Metalearning**: Planeje antes de executar (@meta)
2. **Focus**: Sessões de 1h focadas
3. **Directness**: Aprenda fazendo projetos reais
4. **Drill**: Repita pontos fracos
5. **Retrieval**: Quiz diário (não releia, recupere)
6. **Feedback**: Feedback honesto (@tutor)
7. **Retention**: Spaced repetition (SRS)
8. **Intuition**: Entenda o "por quê"
9. **Experimentation**: Teste múltiplas abordagens

---

## 🏗️ Arquitetura & Design

### Por que Commands Unificados?

**Antes** (v2.0 - keywords dispersas):
```
@tutor #drill, @tutor #feynman, @tutor #quiz...
@meta #decompose-goal, @meta #create-weekly-plan...
→ Interface fragmentada entre agentes
```

**Depois** (v3.0 - commands unificados):
```
/ul-practice-drill, /ul-practice-feynman, /ul-practice-quiz
/ul-plan-decompose, /ul-plan-weekly
→ Interface unificada via TUI
```

### Benefícios

| Benefício | Antes | Depois |
|-----------|-------|--------|
| Interface | Keywords dispersas | Commands `/ul-*` unificados |
| Dependências | Scripts bash | Tools TypeScript |
| Tipagem | Nenhuma | Zod validation |
| Portabilidade | Requer bash | 100% TypeScript |

### Modelos por Command

Cada command define seu modelo ideal no frontmatter:

| Categoria | Modelo | Commands | Justificativa |
|-----------|--------|----------|---------------|
| **Raciocínio complexo** | GLM-5 | `/ul-practice-drill`, `/ul-practice-feynman`, `/ul-learn-explain` | Análise, analogias, validação |
| **Código e dados** | Kimi K2.5 | `/ul-practice-project`, `/ul-learn-debug`, `/ul-setup-scaffold`, `/ul-data-*` | Projetos, debug, estruturação |
| **Orquestração simples** | MiniMax M2.5 | `/ul-study-*`, `/ul-productivity-*`, `/ul-retro-weekly`, `/ul-plan-weekly` | Templates, orquestração, tarefas leves |

**Padrão**: Verifique o campo `model` no arquivo `.opencode/commands/[command].md`

---

Feito com 🧠 para aprender melhor.
