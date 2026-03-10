# Como Usar o Ultralearning System

> Guia completo para estudar com o framework. Do primeiro `make setup` ao dominio de CS Fundamentals.

**Última atualização**: 2026-03-08

---

## Índice

- [1. Quick Start (Primeira Vez)](#1-quick-start-primeira-vez)
- [2. Checklist Pré-Sessão](#2-checklist-pré-sessão)
- [3. Rotina Diaria (1 hora)](#3-rotina-diaria-1-hora)
- [4. Rotina Semanal](#4-rotina-semanal)
- [5. Validação Pós-Sessão](#5-validação-pós-sessão)
- [6. Referencia de Keywords](#6-referencia-de-keywords)
- [7. Commands (No TUI)](#7-commands-no-tui-do-opencode)
- [8. Armadilhas Comuns e Dicas](#8-armadilhas-comuns-e-dicas)
- [9. Troubleshooting](#9-troubleshooting)
- [10. Checklist Imprimivel](#10-checklist-imprimivel)

---

## 1. Quick Start (Primeira Vez)

3 passos para comecar. 5 minutos de setup, 1 hora de estudo.

```bash
# 1. Configuração inicial (1x só)
make setup

# 2. Criar seu primeiro modulo
make module
# Digite o tema: ex "python-basics"

# 3. (Opcional) Planejar com @meta
/ul-plan-decompose "Python basico"
```

Apos o setup, a rotina diaria e:

```bash
/ul-study-start              # Inicia sessao com contexto (5 min)
/ul-practice-drill recursão  # Escolha técnica (50 min)
/ul-study-end                # Encerra e salva progresso (5 min)
```

**Tempo total**: ~1 hora | **Custo estimado**: ~0.01EUR por sessao

---

## 2. Checklist Pré-Sessão

> 2 minutos de preparação = sessão 3x mais produtiva.

### Verificação de Ambiente

Confirme antes de comecar:

- [ ] **OpenCode instalado**
  ```bash
  opencode --version
  # Deve retornar versao (ex: 0.5.1)
  ```

- [ ] **Make disponivel** (opcional)
  ```bash
  make help
  # Deve listar atalhos de terminal
  ```

- [ ] **Modulo ativo definido**
  ```bash
  /ul-data-status
  # Deve mostrar: M1-math-foundations, M2-zig-foundations, etc.
  ```

### Checklist Mental

Responda mentalmente antes de `/ul-study-start`:

- [ ] **Objetivo claro**: O que vou aprender/praticar hoje? (1 frase)
- [ ] **Duração definida**: Quanto tempo vou estudar? (recomendado: 1h)
- [ ] **Distracoes eliminadas**:
  - [ ] Celular no modo Nao Perturbe
  - [ ] Notificacoes desligadas
  - [ ] Abas irrelevantes fechadas
- [ ] **Materiais prontos**:
  - [ ] Cafe/agua a mao
  - [ ] Caderno/digital para anotacoes rapidas

### Auto-Avaliação de Readiness

**Readiness de 1 a 10:** ___/10

| Score | Acao Recomendada |
|-------|------------------|
| **8-10** | Va para `/ul-study-start` |
| **5-7** | Use `/ul-productivity-start` (Two-Minute Rule) |
| **1-4** | Considere descansar e remarcar |

Se score < 7:
```bash
/ul-productivity-start
# O agente vai te guiar para comecar ridiculamente pequeno
```

---

## 3. Rotina Diaria (1 hora)

### Visao Geral

```
┌───────────────────────────────────────────────────────────────┐
│                    SESSAO DE ULTRALEARNING                    │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  START (5 min)              STUDY (50 min)            END     │
│  ┌──────────┐              ┌──────────────┐        ┌───────┐  │
│  │ @tutor   │──────────────│  #feynman    │────────│@tutor │  │
│  │  #start  │  Contexto    │  #drill      │        │ #end  │  │
│  └──────────┘              │  #directness │        └───────┘  │
│       |                    │  #quiz       │        5 min      │
│       |                    └──────────────┘                   │
│       └──────────────────────────────────────────────────->   │
│                                                               │
│  KEYWORDS DISPONIVEIS:                                        │
│  #drill -> Repeticao de procedimentos                         │
│  #feynman -> Explicar conceito                                │
│  #quiz -> Warm-up rapido                                      │
│  #directness -> Projeto pratico                               │
│  #explain -> Introducao a conceito novo                       │
│  #debug -> Debug socratico                                    │
│  #zombie -> Superar procrastinação                            │
│  #scaffold -> Estrutura base                                  │
│  #srs-generator -> Criar flashcards                           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 3.1 Start (5 min)

```bash
/ul-study-start
```

O que acontece:
- Tool `context.getFullContext` carrega contexto automatico (modulo, sessoes, SRS, plano)
- `@tutor` com skill `session` sugere atividade baseada no contexto
- Quiz automatico testa o que voce estudou ontem (3 perguntas)
- Ativa memoria antes de aprender conteudo novo

### 3.2 Study (50 min)

Escolha uma keyword baseado no que precisa:

| Situação | Keyword | Skill | Por quê |
|----------|---------|-------|---------|
| Conceito completamente novo | `#explain [conceito]` | `explain-concept` | Analogia primeiro |
| Aprender fazendo | `#directness [desafio]` | `directness` | Projeto real |
| Praticar sintaxe/procedimento | `#drill [conceito]` | `drill` | Repetição = automatização |
| Revisar conceito | `#feynman [conceito]` | `feynman` | Se nao explica, nao entendeu |
| Warm-up rapido | `#quiz N [tópico]` | `quiz` | Retrieval practice |
| Comecar projeto novo | `#scaffold [projeto]` | `scaffold` | Estrutura pronta |
| Bug dificil | `#debug` | `debug-socratic` | Guia socratico |
| Sem vontade de estudar | `#zombie` | `zombie-mode` | Two-Minute Rule |
| Criar flashcard | `#srs-generator` | `srs-generator` | Memorização |

**Exemplos**:
```bash
/ul-practice-drill recursão
/ul-practice-feynman closures
/ul-practice-project "API REST com autenticação"
/ul-practice-quiz 3 Big O
```

**Dica**: Se nao sabe o que fazer, use `/ul-study-start` — ele vai ler seu plano e sugerir a melhor atividade.

### 3.3 End (5 min)

```bash
/ul-study-end
```

O que acontece:
- Skill `session` consolida a sessao com reflexao estruturada
- Tool `data.createSession` salva no CSV automaticamente
- Tool `data.updateStreak` atualiza streak automaticamente
- Tool `analytics.generateReport` atualiza métricas

---

## 4. Rotina Semanal

### Domingo (30 min)

```bash
/ul-plan-retro    # Retrospectiva: o que funcionou? O que nao?
/ul-plan-weekly N  # Planejar proxima semana
```

### Qualquer Dia

```bash
/ul-memory-create review   # Revisar flashcards (SRS) — ideal 3x/semana
/ul-data-status                        # Ver streak e progresso
```

### Checklist Semanal

- [ ] **Retrospectiva feita** (`/ul-plan-retro`)
- [ ] **Plano da semana criado** (`/ul-plan-weekly`)
- [ ] **Streak mantido** — 7 dias seguidos? (`/ul-data-status`)
- [ ] **SRS revisado** — minimo 3x na semana (`/ul-memory-create review`)
- [ ] **Projetos avancando** — algum projeto pratico em andamento?

---

## 5. Validação Pós-Sessão

Confirme antes de sair:

- [ ] **Sessão salva no CSV**
  ```bash
  tail -3 data/sessions.csv
  # Deve conter sua sessão de hoje
  ```

- [ ] **Streak atualizado**
  ```bash
  /ul-data-status
  # Confirme que o streak incrementou
  ```

- [ ] **Proxima sessao agendada**
  - Data/hora definida no calendario
  - Objetivo pre-definido (anotado)

- [ ] **Conceitos dificeis marcados**
  ```bash
  /ul-memory-create
  # Adicione ao SRS o que nao dominou 100%
  ```

---

## 6. Referência de Commands

### Commands de Sessão (/ul-study-*)

| Command | Quando Usar | Descrição |
|---------|-------------|-----------|
| `/ul-study-start` | Iniciar sessão | Carrega contexto e sugere atividade |
| `/ul-study-end` | Encerrar sessão | Salva progresso e atualiza streak |
| `/ul-study-plan` | Ver progresso | Mostra plano e métricas da semana |

### Commands de Prática (/ul-practice-*)

| Command | Quando Usar | Descrição |
|---------|-------------|-----------|
| `/ul-practice-drill [conceito]` | Praticar procedimento | Repetição 5-10x até automatizar |
| `/ul-practice-feynman [conceito]` | Validar compreensão | Explicar para criança de 12 anos |
| `/ul-practice-quiz [N] [tópico]` | Warm-up | Quiz adaptativo (dificuldade automática) |
| `/ul-practice-project [desafio]` | Projeto real | Aprender fazendo (invoca skill directness) |

### Commands de Aprendizado (/ul-learn-*)

| Command | Quando Usar | Descrição |
|---------|-------------|-----------|
| `/ul-learn-explain [conceito]` | Conceito novo | Introduzir com analogias |
| `/ul-learn-debug [problema]` | Bug difícil | Debug socrático (invoca skill debug-socratic) |

### Commands de Produtividade (/ul-productivity-*)

| Command | Quando Usar | Descrição |
|---------|-------------|-----------|
| `/ul-productivity-start` | Procrastinação | Two-Minute Rule (começar pequeno) |
| `/ul-productivity-break` | Travado >30min | Modo difuso de Barbara Oakley |

### Commands de Setup (/ul-setup-*)

| Command | Quando Usar | Descrição |
|---------|-------------|-----------|
| `/ul-setup-scaffold [projeto]` | Novo projeto | Criar estrutura com TODOs |

### Commands de Memória (/ul-memory-*)

| Command | Quando Usar | Descrição |
|---------|-------------|-----------|
| `/ul-memory-create` | Criar flashcard | Adicionar ao SRS |
| `/ul-memory-review` | Revisar cards | Revisão espaçada SM-2 (invoca skill srs-generator) |

### Commands de Planejamento (/ul-plan-*)

| Command | Quando Usar | Descrição |
|---------|-------------|-----------|
| `/ul-plan-decompose [objetivo]` | Decompor meta | Framework 3D (invoca skill decomposition) |
| `/ul-plan-retro` | Fim de semana | Retrospectiva semanal |
| `/ul-plan-benchmark [skill]` | Criar teste | 3 níveis de proficiência |
| `/ul-plan-weekly [N]` | Início de semana | Criar plano detalhado |

### Commands de Dados (/ul-data-*)

| Command | Quando Usar | Descrição |
|---------|-------------|-----------|
| `/ul-data-status` | Ver progresso | Streak, sessões, módulo atual |
| `/ul-data-analytics` | Analytics | Relatório completo de métricas |
| `/ul-data-dashboard` | Dashboard | Visão geral consolidada |
| `/ul-data-manage` | Gerenciar dados | Init ou reset dos CSVs |

### Inline Keywords (Complementares)

Estas keywords podem ser usadas dentro de sessões ativas:

| Keyword | Quando Usar |
|---------|-------------|
| `#intuition [conceito]` | Entender o "por quê" profundo |
| `#feedback` | Revisar código específico |
| `#experiment [conceito]` | Comparar múltiplas abordagens |
| `#diffuse` | Ativar modo difuso rapidamente |

---

## 7. Commands no TUI do OpenCode

Digite `/` no TUI do OpenCode para acessar os 22 commands disponíveis.

### Interface Unificada: Todos os Commands `/ul-*`

O sistema foi migrado para uma interface unificada baseada em commands. Não há mais keywords — tudo é acessível via `/` no TUI.

### Commands Principais por Categoria

#### 📚 Sessão de Estudo
| Command | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/ul-study-start` | Iniciar sessão com contexto | Começo do estudo |
| `/ul-study-end` | Encerrar e salvar progresso | Fim do estudo |
| `/ul-study-plan` | Ver progresso da semana | Qualquer momento |

#### 🎯 Prática
| Command | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/ul-practice-drill` | Prática deliberada 5-10x | Automatizar procedimentos |
| `/ul-practice-feynman` | Validar compreensão | Testar se entendeu |
| `/ul-practice-quiz` | Quiz adaptativo | Warm-up / retrieval |
| `/ul-practice-project` | Projeto real | Aprender fazendo |

#### 🧠 Aprendizado
| Command | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/ul-learn-explain` | Explicar conceito novo | Introdução com analogias |
| `/ul-learn-debug` | Debug socrático | Bug difícil |

#### ⚡ Produtividade
| Command | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/ul-productivity-start` | Two-Minute Rule | Procrastinação |
| `/ul-productivity-break` | Modo difuso | Travado >30min |

#### 🗄️ Dados
| Command | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/ul-data-status` | Ver streak e progresso | Quick check |
| `/ul-data-analytics` | Analytics avançados | Revisão semanal |
| `/ul-data-dashboard` | Dashboard consolidado | Visão geral |
| `/ul-data-manage` | Gerenciar dados | Setup / reset |

### Como Escolher o Command Certo

**Fluxo de decisão:**

1. **Começando a estudar?** → `/ul-study-start`
2. **Não consegue começar?** → `/ul-productivity-start`
3. **Conceito novo?** → `/ul-learn-explain`
4. **Já estudou e quer validar?** → `/ul-practice-feynman`
5. **Quer praticar?** → `/ul-practice-drill`
6. **Projeto prático?** → `/ul-practice-project`
7. **Bug difícil?** → `/ul-learn-debug`
8. **Travado mentalmente?** → `/ul-productivity-break`
9. **Terminando?** → `/ul-study-end`

### Dificuldade Adaptativa

O sistema ajusta automaticamente baseado no seu histórico:

| Nível | Critério | Comportamento |
|-------|----------|---------------|
| **Easy** | error_rate < 20% | Perguntas mais desafiadoras |
| **Medium** | error_rate 20-40% | Perguntas balanceadas |
| **Hard** | error_rate > 40% | Perguntas mais simples |

**Commands afetados:**
- `/ul-practice-quiz`: Ajusta complexidade das perguntas
- `/ul-memory-review`: Ajusta feedback baseado no erro por tópico

### Utilitários (Terminal - Opcional)

| Comando | Descrição |
|---------|-----------|
| `make setup` | Configuração inicial |
| `make backup` | Backup dos dados |
| `make module` | Criar novo módulo |
| `make switch` | Alternar módulo ativo |

---

## Como Funciona a Nova Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     INTERFACE DO USUÁRIO                    │
├─────────────────────────────────────────────────────────────┤
│  Commands (digite / no TUI)                                 │
│  ├── /ul-data-status     → Tool status.ts                   │
│  ├── /ul-data-analytics  → Tool analytics.ts                │
│  ├── /ul-data-dashboard  → Tool dashboard.ts                │
│  └── /ul-data-manage     → Tool data.ts                     │
├─────────────────────────────────────────────────────────────┤
│  Agents (@tutor, @meta)                                     │
│  └── Invocam tools automaticamente                          │
├─────────────────────────────────────────────────────────────┤
│  Tools TypeScript (.opencode/tools/)                        │
│  ├── data.ts         → CRUD nos CSVs                        │
│  ├── context.ts      → Contexto da sessão                   │
│  ├── analytics.ts    → Métricas e cálculos                  │
│  ├── status.ts       → Formatação visual                    │
│  ├── weakness.ts     → Identifica pontos fracos             │
│  ├── effectiveness.ts→ Efetividade por técnica              │
│  ├── patterns.ts     → Padrões de estudo                    │
│  ├── dashboard.ts    → Dashboard consolidado                │
│  └── tutor-log.ts    → Registro de interações               │
├─────────────────────────────────────────────────────────────┤
│  Dados (CSV)                                                │
│  └── data/*.csv (mesmo formato)                             │
└─────────────────────────────────────────────────────────────┘
```

**Benefícios:**
- ✅ Parsing de CSV robusto (sem grep/awk frágil)
- ✅ Contexto automático carregado pelo `/ul-study-start`
- ✅ Dados salvos automaticamente pelo `/ul-study-end`
- ✅ Analytics em tempo real via `/ul-data-analytics`

---

## 8. Armadilhas Comuns e Dicas

### NAO COMECE SE:

```
┌──────────────────────────────────────────────────────────────┐
│ x NAO TENHO OBJETIVO ESPECIFICO                              │
│   "Vou estudar Python" -> VAGO                               │
│   "Vou implementar binary search em Python" -> BOM           │
├──────────────────────────────────────────────────────────────┤
│ x VOU PULAR O WARM-UP                                        │
│   O quiz ativa memoria do dia anterior                       │
│   Sem warm-up = perde 20% de eficiencia                      │
├──────────────────────────────────────────────────────────────┤
│ x PLANEJO ESTUDAR +2 HORAS SEM PAUSA                         │
│   Use pomodoro: 50 min foco + 10 min break                   │
│   Ou: /ul-productivity-break (15 min modo difuso - Oakley)          │
├──────────────────────────────────────────────────────────────┤
│ x VOU ENCERRAR SEM SALVAR                                    │
│   /ul-study-end = streak + memoria consolidada                 │
│   Nao salvar = esquece 40% em 24h                            │
└──────────────────────────────────────────────────────────────┘
```

### 5 Dicas de Ouro

1. **Consistencia > Intensidade**: 1h/dia todo dia > 5h no fim de semana
2. **Nao releia, recupere**: Quiz diario forca memoria ativa (retrieval practice)
3. **Projetos reais**: Nao fique so em tutoriais — use `#directness`
4. **Seja honesto**: Se nao entendeu, use `#feynman` para testar
5. **Mantenha o streak**: A gamificação funciona — `/ul-data-status` para acompanhar

---

## 9. Troubleshooting

### Setup e Ambiente

**Modulo nao encontrado?**
```bash
make switch  # Lista modulos disponiveis
```

**Quiz nao funciona?**
```bash
# Verifique se opencode esta instalado
opencode --version

# Verifique o modelo selecionado
# No TUI: /models -> deve mostrar opencode/glm-5
```

**Skills nao carregam?**
```bash
# Verifique se as skills existem
ls .opencode/skills/*/SKILL.md

# Teste manual
opencode run --agent @tutor "#drill binary search"
```

**Streak nao atualiza?**
```bash
/ul-data-manage init  # Reinicializar dados (no TUI do OpenCode)
```

### Durante o Estudo

**Travou no meio do estudo?**
```bash
/ul-productivity-break  # 15 min modo difuso (Oakley)
```

**Nao consegue focar?**
```bash
/ul-productivity-break
# Ou consulte: guides/tecnicas/pomodoro.md
```

**Erros recorrentes no drill?**
```bash
@tutor "#drill [conceito] 5 variações"  # Overlearning
```

**Procrastinando?**
```bash
opencode run --agent @tutor "#zombie"
# Ou consulte: guides/tecnicas/procrastination-zombie.md
```

---

## 10. Checklist Imprimivel

Copia curta para deixar na mesa:

```
PRE-SESSAO:
[ ] OpenCode ok | [ ] Objetivo definido | [ ] Distracoes off
[ ] Materiais prontos | [ ] 1h disponivel

ROTINA:
/ul-study-start -> /ul-practice-drill (ou #feynman, #directness) -> /ul-study-end

POS-SESSAO:
[ ] Sessao salva no CSV | [ ] Streak ok | [ ] Proxima marcada
[ ] Dificeis no SRS

SE TRAVAR: /ul-productivity-break (ou use a técnica de modo difuso)
SE NAO CONSEGUIR COMECAR: /ul-productivity-start
SE NAO SABE O QUE FAZER: /ul-study-start

SEMANAL (domingo):
/ul-plan-retro + /ul-plan-weekly
```

---

## 11. Sistema de Dados

O sistema salva automaticamente seus dados em arquivos CSV para acompanhamento e analytics.

### Onde os Dados São Salvos

```
data/
├── sessions.csv              # Suas sessões diárias
├── insights.csv             # Métricas (streak, tempo, foco)
├── tutor_interactions.csv   # Histórico de interações com o tutor
├── modules.csv              # Módulos de estudo
└── schema.md               # Documentação completa
```

### Verificando Seus Dados

```bash
# No TUI do OpenCode (digite /)
/ul-data-status          # Ver status geral (streak, sessões)
/ul-data-analytics       # Ver analytics avançados
/ul-data-manage init     # Inicializar estrutura de dados

# Via terminal (arquivos CSV)
cat data/sessions.csv
cat data/insights.csv
```

### O que é Salvo Automaticamente

| Dado | Arquivo | Como |
|------|---------|------|
| Sessão diária | `sessions.csv` | `/ul-study-end` (tool data.ts) |
| Streak | `insights.csv` | `/ul-study-end` (tool data.ts) |
| Tempo de estudo | `sessions.csv` | `/ul-study-end` (tool data.ts) |
| Foco (1-10) | `sessions.csv` | `/ul-study-end` (tool data.ts) |
| Interações do tutor | `tutor_interactions.csv` | Tool tutor-log.ts |
| Flashcards revisados | `reviews.csv` | Tool data.ts (SM-2) |
| Técnicas usadas | `session_skills.csv` | Tool data.ts |
| Pontos fracos | `insights.csv` | Tool weakness.ts |
| Efetividade | Calculado em tempo real | Tool effectiveness.ts |
| Padrões | Calculado em tempo real | Tool patterns.ts |

### Analytics Disponíveis

```bash
/ul-data-analytics       # Analytics detalhados
/ul-data-dashboard       # Dashboard consolidado visual
```

**`/ul-data-analytics` mostra:**
- Streak atual e melhor
- Total de sessões
- Tempo total de estudo
- Foco médio por módulo
- Técnica mais usada
- Taxa de erro por tópico
- Recomendações adaptativas

**`/ul-data-dashboard` mostra (visão geral):**
- Resumo geral (streak, sessões, tempo)
- Efetividade das técnicas
- Padrões de estudo (melhor horário, duração)
- Pontos fracos identificados
- Formatação visual com emojis

### Backup

```bash
make backup
```

Cria backup de todos os dados em `backups/`.

### Mais Informações

Consulte [`data/schema.md`](data/schema.md) para documentação completa do schema.

---

## Proximos Passos

Apos dominar a rotina basica:

1. **Aprofunde nos principios**: Explore os [9 principios](guides/principios/) do Ultralearning
2. **Domine as tecnicas**: Consulte o [indice de tecnicas](guides/indice.md) (23 tecnicas)
3. **Planeje com estrategia**: Use `@meta` com `#decompose-goal` para quebrar objetivos grandes
4. **Acompanhe o progresso**: Use [`/ul-data-analytics`](guides/sistema-dados.md) para ver métricas
5. **Entenda os dados**: Leia [Sistema de Dados](guides/sistema-dados.md) para entender como os dados são salvos

---

*Feito para aprender melhor. Comece agora com `make setup`.*
