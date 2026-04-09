# Como Usar o Ultralearning System

> Guia completo para estudar com o framework. Do primeiro `/ul-setup-check` ao dominio de CS Fundamentals.

**Última atualização**: 2026-03-17

> **🧠 Memória Persistente**: O sistema agora usa **OpenViking** para memória entre sessões. Os agentes lembram conversas anteriores, preferências e padrões de erro automaticamente. Veja [Integração OpenViking](#memória-persistente-openviking).

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
# 1. Verificar dependências (1x só)
/ul-setup-check

# 2. Criar seu primeiro modulo
/ul-module-create
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
│  │ /ul-     │──────────────│ /ul-practice │────────│ /ul-  │  │
│  │  study-  │  Contexto    │   -drill     │        │ study │  │
│  │  start   │              │   -feynman   │        │ -end  │  │
│  └──────────┘              │   -project   │        └───────┘  │
│       |                    │   -quiz      │        5 min      │
│       |                    └──────────────┘                   │
│       └──────────────────────────────────────────────────->   │
│                                                               │
│  COMMANDS DISPONIVEIS:                                        │
│  /ul-practice-drill -> Repeticao de procedimentos             │
│  /ul-practice-feynman -> Explicar conceito                    │
│  /ul-practice-quiz -> Warm-up rapido                          │
│  /ul-practice-project -> Projeto pratico                      │
│  /ul-learn-explain -> Introducao a conceito novo              │
│  /ul-learn-debug -> Debug socratico                           │
│  /ul-productivity-start -> Superar procrastinação             │
│  /ul-setup-scaffold -> Estrutura base                         │
│  /ul-memory-create -> Criar flashcards                        │
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

Escolha um command baseado no que precisa:

| Situação | Command | Por quê |
|----------|---------|---------|
| Conceito completamente novo | `/ul-learn-explain [conceito]` | Analogia primeiro |
| Aprender fazendo | `/ul-practice-project [desafio]` | Projeto real |
| Praticar sintaxe/procedimento | `/ul-practice-drill [conceito]` | Repetição = automatização |
| Revisar conceito | `/ul-practice-feynman [conceito]` | Se nao explica, nao entendeu |
| Warm-up rapido | `/ul-practice-quiz N [tópico]` | Retrieval practice |
| Comecar projeto novo | `/ul-setup-scaffold [projeto]` | Estrutura pronta |
| Bug dificil | `/ul-learn-debug` | Guia socratico |
| Sem vontade de estudar | `/ul-productivity-start` | Two-Minute Rule |
| Criar flashcard | `/ul-memory-create` | Memorização |

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
/ul-retro-weekly  # Retrospectiva: o que funcionou? O que nao?
/ul-plan-weekly N  # Planejar proxima semana
```

### Qualquer Dia

```bash
/ul-memory-create review   # Revisar flashcards (SRS) — ideal 3x/semana
/ul-data-status                        # Ver streak e progresso
```

### Checklist Semanal

- [ ] **Retrospectiva feita** (`/ul-retro-weekly`)
- [ ] **Plano da semana criado** (`/ul-plan-weekly`)
- [ ] **Streak mantido** — 7 dias seguidos? (`/ul-data-status`)
- [ ] **SRS revisado** — minimo 3x na semana (`/ul-memory-create review`)
- [ ] **Projetos avancando** — algum projeto pratico em andamento?

### 💡 Dica: Criar Hábitos Automáticos

**Problema**: Dificuldade para manter consistência?

**Solução**: Use [Habit Stacking](guides/habit-stacking.md) de James Clear (Atomic Habits):

```
"Após [HÁBITO EXISTENTE], eu vou [ESTUDAR]"

Exemplos:
☕ Após café da manhã → /ul-study-start (25 min)
🍽️  Após almoço → /ul-memory-review (10 min)
🌙 Após jantar → /ul-practice-quiz 5 [tópico]
```

**Chave**: Não crie novos gatilhos. Use os que já existem.

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
| `/ul-setup-check` | Primeira vez | Verificar dependências do sistema |
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
| `/ul-retro-weekly` | Fim de semana | Retrospectiva semanal |
| `/ul-plan-benchmark [skill]` | Criar teste | 3 níveis de proficiência |
| `/ul-plan-weekly [N]` | Início de semana | Criar plano detalhado |
| `/ul-plan-adjust [situação]` | Desvio de cronograma | Reajustar plano |
| `/ul-plan-resources [tópico]` | Novo tópico | Mapear recursos em 3 tiers |

### Commands de Dados (/ul-data-*)

| Command | Quando Usar | Descrição |
|---------|-------------|-----------|
| `/ul-data-status` | Ver progresso | Streak, sessões, módulo atual |
| `/ul-data-analytics` | Analytics | Relatório completo de métricas |
| `/ul-data-dashboard` | Dashboard | Visão geral consolidada |
| `/ul-data-manage` | Gerenciar dados | Init ou reset dos CSVs |
| `/ul-data-backup` | Backup | Criar backup dos dados |

---

## 7. Commands no TUI do OpenCode

Digite `/` no TUI do OpenCode para acessar os 29 commands disponíveis.

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

---

## Como Funciona a Nova Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     INTERFACE DO USUÁRIO                    │
├─────────────────────────────────────────────────────────────┤
│  Commands (digite / no TUI)                                 │
│  ├── /ul-data-status     → Tool status.ts                   │
│  ├── /ul-data-analytics  → Tool insights.ts                 │
│  ├── /ul-data-dashboard  → Tool insights.ts                 │
│  └── /ul-data-manage     → Tool data.ts                     │
├─────────────────────────────────────────────────────────────┤
│  Agents (@tutor, @meta)                                     │
│  └── Invocam tools automaticamente                          │
├─────────────────────────────────────────────────────────────┤
│  Tools TypeScript (.opencode/tools/)                        │
│  ├── data.ts         → CRUD nos CSVs (facade)               │
│  ├── data-*.ts       → Módulos especializados (6)           │
│  ├── context.ts      → Contexto da sessão                   │
│  ├── insights.ts     → Análises consolidadas (metrics)      │
│  ├── status.ts       → Formatação visual                    │
│  ├── retro.ts        → Retrospectivas                       │
│  ├── setup.ts        → Setup e dependências                 │
│  └── utils-csv.ts    → Utilitários CSV                      │
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

## Memória Persistente (OpenViking)

> **Novo na v3.2**: O sistema agora usa OpenViking para memória entre sessões.

### O que mudou?

Antes, cada sessão do LLM começava do zero — o @tutor não lembrava conversas anteriores, preferências ou padrões de erro. Agora:

- **@tutor lembra** conversas anteriores automaticamente
- **@meta considera** histórico de planejamento
- **@review compara** com auditorias anteriores

### Como funciona

```
┌─────────────────────────────────────────────────────────────┐
│                    OPENVIKING SERVER                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  viking://user/memories/                              │  │
│  │  ├── preferences/  → Estilo de aprendizado           │  │
│  │  ├── events/       → Marcos e decisões               │  │
│  │  └── entities/     → Projetos, conceitos, pessoas    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  viking://agent/memories/                            │  │
│  │  ├── tutor/   → Casos e padrões do @tutor           │  │
│  │  ├── meta/    → Histórico de planejamento           │  │
│  │  └── review/  → Auditorias anteriores               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Hierarquia de Contexto (L0/L1/L2)

O OpenViking carrega contexto de forma hierárquica para economizar tokens:

| Nível | Tokens | Uso |
|-------|--------|-----|
| **L0 (abstract)** | ~100 | Quick check — ver se é relevante |
| **L1 (overview)** | ~2k | Planning — visão geral |
| **L2 (read)** | Completo | Deep dive — detalhes |

**Economia**: -70% a -90% de tokens comparado a carregar tudo.

### Configuração

O OpenViking está configurado em `~/.openviking/` (global) para compartilhar entre projetos:

```bash
# Verificar se está rodando
docker-compose ps

# Deve mostrar:
# ultralearning-ollama       (healthy)
# ultralearning-openviking   (healthy)
```

### Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `docker-compose ps` | Verificar status dos containers |
| `docker-compose logs -f openviking` | Ver logs |
| `docker-compose restart` | Reiniciar servidos |
| `curl http://localhost:1933/health` | Health check |

Mais detalhes: [`planning/proposta-openviking-integration-2026-03-13.md`](proposta-openviking-integration-2026-03-13.md)

---

## Contexto Híbrido (CSV + OpenViking)

> **Novo na v3.3**: O sistema agora usa contexto híbrido para máxima flexibilidade.

### Arquitetura de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    DADOS ESTRUTURADOS (CSV)                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  sessions.csv        → Sessões de estudo               │  │
│  │  session_skills.csv  → Métricas por técnica            │  │
│  │  flashcards.csv      → Flashcards SRS                  │  │
│  │  insights.csv        → Streak, métricas                │  │
│  │  modules.csv         → Progresso de módulos            │  │
│  └───────────────────────────────────────────────────────┘  │
│                     ↓ context-hybrid.ts ↓                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  OpenViking                                            │  │
│  │  ├── preferences/   → Estilo de aprendizado            │  │
│  │  ├── entities/      → Conceitos aprendidos             │  │
│  │  └── cases/         → Contexto conversacional          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Como Usar

```typescript
// Contexto completo (CSV + OpenViking)
const context = await contextHybrid({ operation: "getFullContext" });

// Contexto de sessão (mais leve)
const session = await contextHybrid({ operation: "getSessionContext" });

// Preferências do usuário
const prefs = await contextHybrid({ operation: "getUserPreferences" });
```

### Fallback

Se OpenViking indisponível, o sistema continua funcionando:

```typescript
// CSV funciona mesmo sem OpenViking
const result = await contextHybrid({ operation: "getFullContext" });
// {
//   success: true,
//   data: { sessions: [...], flashcards: [...] },
//   warnings: ["OpenViking not available"]
// }
```

---

## Memória Automática

### Sincronização ao Final da Sessão

O `/ul-study-end` automaticamente sincroniza memória:

```
1. Salvar sessão no CSV (sessions.csv)
2. Salvar skills usadas (session_skills.csv)
3. Atualizar streak (insights.csv)
4. Commitar memória no OpenViking ← NOVO
5. Retornar resumo
```

### O que é Salvo Automaticamente

| Dado | Onde | Como |
|------|------|------|
| Sessão | `sessions.csv` | CSV |
| Técnicas | `session_skills.csv` | CSV (campo `correct`) |
| Streak | `insights.csv` | CSV |
| Preferências | OpenViking `preferences/` | `memcommit()` |
| Conceitos | OpenViking `entities/` | `memcommit()` |
| Casos | OpenViking `cases/` | `memcommit()` |

### Verificar Memória

```bash
# Ver preferências
membrowse "viking://user/default/memories/preferences/"

# Ver conceitos aprendidos
membrowse "viking://user/default/memories/entities/"

# Ver casos do tutor
membrowse "viking://agent/{id}/memories/cases/"
```

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
3. **Projetos reais**: Nao fique so em tutoriais — use `/ul-practice-project`
4. **Seja honesto**: Se nao entendeu, use `/ul-practice-feynman` para testar
5. **Mantenha o streak**: A gamificação funciona — `/ul-data-status` para acompanhar

---

## 9. Troubleshooting

### Setup e Ambiente

**Modulo nao encontrado?**
```bash
/ul-module-switch  # Lista modulos disponiveis
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
/ul-practice-drill [conceito]  # Continue praticando (overlearning)
```

**Procrastinando?**
```bash
/ul-productivity-start
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
/ul-study-start -> /ul-practice-drill (ou feynman, project) -> /ul-study-end

POS-SESSAO:
[ ] Sessao salva no CSV | [ ] Streak ok | [ ] Proxima marcada
[ ] Dificeis no SRS

SE TRAVAR: /ul-productivity-break
SE NAO CONSEGUIR COMECAR: /ul-productivity-start
SE NAO SABE O QUE FAZER: /ul-study-start

SEMANAL (domingo):
/ul-retro-weekly + /ul-plan-weekly
```

---

## 11. Sistema de Dados

O sistema salva automaticamente seus dados em arquivos CSV para acompanhamento e analytics.

### Onde os Dados São Salvos

```
data/
├── sessions.csv              # Suas sessões diárias
├── session_skills.csv        # Técnicas usadas por sessão
├── insights.csv             # Métricas (streak, tempo, foco)
├── flashcards.csv           # Flashcards SRS
├── reviews.csv              # Histórico SRS
├── modules.csv              # Módulos de estudo
├── users.csv                # Metadados do usuário
└── schema.md               # Documentação completa
```

> **Nota**: Preferências do usuário estão em OpenViking (`viking://user/default/memories/preferences/`), não em CSV.

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
| Técnicas usadas | `session_skills.csv` | Tool data.ts |
| Acertos/Erros | `session_skills.correct` | Derivado de `success_rating >= 6` |
| Flashcards revisados | `reviews.csv` | Tool data.ts (SM-2) |
| Pontos fracos | `insights.csv` | Tool insights.ts |
| Efetividade | Calculado em tempo real | Tool insights.ts |
| Padrões | Calculado em tempo real | Tool insights.ts |

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
/ul-data-backup
```

Cria backup de todos os dados em `backups/`.

### Mais Informações

Consulte [`data/schema.md`](data/schema.md) para documentação completa do schema.

---

## Proximos Passos

Apos dominar a rotina basica:

1. **Aprofunde nos principios**: Explore os [9 principios](guides/principios/) do Ultralearning
2. **Domine as tecnicas**: Consulte o [indice de tecnicas](guides/indice.md) (23 tecnicas)
3. **Planeje com estrategia**: Use `/ul-plan-decompose` para quebrar objetivos grandes
4. **Acompanhe o progresso**: Use [`/ul-data-analytics`](guides/sistema-dados.md) para ver métricas
5. **Entenda os dados**: Leia [Sistema de Dados](guides/sistema-dados.md) para entender como os dados são salvos

---

*Feito para aprender melhor. Comece agora com `/ul-setup-check`.*
