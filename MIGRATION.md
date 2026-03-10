# Guia de Migração v1.x → v2.0

Guia completo para migrar do Ultralearning System v1.x (scripts bash) para v2.0 (Tools + Commands).

---

## 📋 Índice

1. [O que Mudou?](#o-que-mudou)
2. [Resumo Técnico](#resumo-técnico)
3. [Passo a Passo de Migração](#passo-a-passo-de-migração)
4. [Mapeamento de Comandos](#mapeamento-de-comandos)
5. [FAQ](#faq)
6. [Troubleshooting](#troubleshooting)
7. [Benefícios e Estatísticas](#benefícios-e-estatísticas)

---

## O que Mudou?

### Antes (v1.x) — Scripts Bash
```bash
# Ver progresso
make status

# Ver analytics
make analytics

# Iniciar sessão (REMOVIDO)
# make start      # ❌ Removido na v2.0

# Encerrar sessão (REMOVIDO)
# make end        # ❌ Removido na v2.0
```

### Depois (v2.0) — Tools + Commands
```bash
# No TUI do OpenCode (digite /)
/ul-data-status     # Ver progresso
/ul-data-analytics  # Ver analytics
/ul-data-manage init  # Inicializar dados

# Sessões via @tutor (com tools automáticas)
@tutor #start    # Carrega contexto automaticamente
@tutor #end      # Salva dados automaticamente
```

---

## Resumo Técnico

### Nova Arquitetura

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
│  ├── data.ts      → CRUD nos CSVs                           │
│  ├── context.ts   → Contexto da sessão                      │
│  ├── analytics.ts → Métricas e cálculos                     │
│  ├── status.ts    → Formatação visual                       │
│  ├── weakness.ts  → Identifica pontos fracos                │
│  ├── effectiveness.ts → Efetividade por técnica             │
│  ├── patterns.ts  → Padrões de estudo                       │
│  ├── dashboard.ts → Dashboard consolidado                   │
│  └── tutor-log.ts → Registro de interações                  │
├─────────────────────────────────────────────────────────────┤
│  Dados (CSV)                                                │
│  └── data/*.csv (mesmo formato)                             │
└─────────────────────────────────────────────────────────────┘
```

### Tools Implementadas (9 total)

| Tool | Operações Principais |
|------|---------------------|
| **data.ts** | init, createSession, getSessions, updateInsight, getStreak, updateStreak, createFlashcard, getFlashcards, createReview, createInteraction, resetAll |
| **context.ts** | getCurrentModule, getRecentSessions, getWeekContext, getSRSPending, getProjectInfo, getFullContext |
| **analytics.ts** | getTotalTime, getAvgFocus, getSessionsByWeekday, getMostUsedSkill, getErrorRateByTopic, getFlashcardsReviewed, generateReport, getDifficultyLevel |
| **status.ts** | getStatus, formatStatus (com progress bar) |
| **weakness.ts** | identifyWeaknesses, suggestTechnique |
| **effectiveness.ts** | getSuccessRateBySkill, getRetentionByTechnique, getFocusByTechnique, getSpeed, generateReport |
| **patterns.ts** | getBestPeriod, getIdealDuration, getFatiguePoint, getBestWeekday, compareWeeks |
| **dashboard.ts** | show, compare (consolida outras tools) |
| **tutor-log.ts** | logInteraction, getInteractionsByTopic, getInteractionsBySession, getRecentInteractions |

**Features:**
- ✅ Parsing robusto de CSV (csv-parse)
- ✅ Cache de 5 minutos em todas as tools
- ✅ Tipagem segura com TypeScript + Zod
- ✅ Algoritmo SM-2 para SRS
- ✅ Dificuldade adaptativa baseada em error_rate

### Commands Disponíveis (4 total)

| Command | Descrição |
|---------|-----------|
| `/ul-data-status` | Status geral (streak, sessões, módulo atual) |
| `/ul-data-analytics` | Relatório completo de métricas |
| `/ul-data-dashboard` | Dashboard consolidado visual |
| `/ul-data-manage` | Gerenciamento de dados (init, reset) |

### Skills Atualizadas

- **session**: #start, #end, #plan agora usam tools automaticamente
- **quiz**: Usa analytics.getDifficultyLevel para dificuldade adaptativa
- **srs-generator**: Usa data tool para criar/revisar flashcards (SM-2)
- **benchmarking**: Integrado com effectiveness tool

### Scripts Removidos (21 total)

**Migrados para Tools:**
- data.sh → data.ts
- common.sh → context.ts
- analytics.sh → analytics.ts
- status.sh → status.ts
- tutor-difficulty.sh → analytics.ts
- tutor-interaction.sh → data.ts
- spaced-repetition.sh → data.ts
- weakness-analysis.sh → weakness.ts
- skill-effectiveness.sh → effectiveness.ts
- patterns.sh → patterns.ts
- dashboard.sh → dashboard.ts
- tutor-log.sh → tutor-log.ts

**Removidos Permanentemente:**
- start.sh → use @tutor #start
- end.sh → use @tutor #end
- break.sh → use @tutor #diffuse
- drill-extra.sh → use @tutor "#drill variações"
- plan.sh → use @meta #create-weekly-plan
- resources.sh → use @meta #map-resources
- sync-flashcards.sh → funcionalidade não utilizada

### Scripts Mantidos (7)

Operações de sistema que permanecem em bash:
- setup.sh — Configuração inicial
- backup.sh — Backup dos dados
- module.sh — Criar módulos
- switch.sh — Alternar módulos
- archive.sh — Arquivamento de projetos
- retro.sh — Retrospectiva (interativo)
- review.sh — Revisão SRS (atualizado para usar data tool)

---

## Passo a Passo de Migração

### 1. Backup dos Dados (Importante!)

```bash
cd /home/dani/Work/dslara/ultralearning
make backup
# ou manualmente:
cp -r data backups/data-$(date +%Y%m%d)
```

### 2. Atualizar para Nova Versão

```bash
# Pull das mudanças
git pull origin main

# Instalar dependências das tools
cd .opencode && npm install
```

### 3. Inicializar Estrutura

No TUI do OpenCode:
```
/ul-data-manage init
```

Isso garante que todos os arquivos CSV existam e estejam no formato correto.

### 4. Verificar Migração

Teste se os dados antigos foram preservados:
```
/ul-data-status
```

Você deve ver seu streak, sessões anteriores e módulo atual.

### 5. Testar Fluxo Completo

Faça uma sessão de teste:
1. `/ul-data-status` — Verifique status atual
2. `@tutor #start` — Iniciar sessão (deve carregar contexto)
3. `@tutor #end` — Encerrar sessão (deve salvar dados)
4. `/ul-data-analytics` — Ver se sessão aparece no relatório

---

## Mapeamento de Comandos

| Antigo (v1.x) | Novo (v2.0) | Notas |
|--------------|-------------|-------|
| `make status` | `/ul-data-status` | No TUI do OpenCode |
| `make analytics` | `/ul-data-analytics` | No TUI do OpenCode |
| `make dashboard` | `/ul-data-dashboard` | No TUI do OpenCode |
| `make start` ❌ | `@tutor #start` | **Removido** - comando não existe mais |
| `make end` ❌ | `@tutor #end` | **Removido** - comando não existe mais |
| `make data init` | `/ul-data-manage init` | No TUI do OpenCode |
| `make backup` | `make backup` | **Mantido** (operação de sistema) |
| `make setup` | `make setup` | **Mantido** (operação de sistema) |
| `make module` | `make module` | **Mantido** (operação de sistema) |
| `make switch` | `make switch` | **Mantido** (operação de sistema) |
| `scripts/data.sh` | Tool `data.ts` | Invocado automaticamente |
| `scripts/analytics.sh` | Tool `analytics.ts` | Invocado automaticamente |
| `scripts/status.sh` | Tool `status.ts` | Invocado automaticamente |

---

## FAQ

### Meus dados antigos serão perdidos?

**Não.** Os CSVs são 100% compatíveis. O `/ul-data-manage init` apenas garante que os arquivos existam. Seus dados de sessões, streaks e flashcards serão preservados.

### Posso continuar usando `make status`?

Não recomendado. O comando foi removido. Use `/ul-data-status` no TUI do OpenCode para ter acesso às novas features.

### Como funciona a nova arquitetura?

Agora temos **tools** (funções TypeScript que o LLM invoca) e **commands** (interface do usuário no TUI). O `@tutor` invoca as tools automaticamente para:

1. **Carregar contexto** no início da sessão (`context.ts`)
2. **Salvar dados** no fim da sessão (`data.ts`)
3. **Calcular dificuldade** antes de quizzes (`analytics.ts`)
4. **Identificar fraquezas** durante estudos (`weakness.ts`)

### O que aconteceu com os scripts bash?

Foram migrados para tools TypeScript. Isso proporciona:
- ✅ Parsing de CSV robusto (sem grep/awk frágil)
- ✅ Tipagem segura com TypeScript
- ✅ Manipulação de datas com `date-fns`
- ✅ Integração nativa com o OpenCode
- ✅ Cache para performance

### Por que remover `make start` e `make end`?

Esses comandos invocavam scripts bash que faziam parsing manual de CSV. Agora o `@tutor` usa as tools diretamente, proporcionando:

- Contexto mais rico (módulo, plano da semana, SRS pendente)
- Salvamento automático sem intervenção manual
- Melhor integração com as skills
- Dificuldade adaptativa automática

### E se eu encontrar bugs nas tools?

Reporte como sempre! As tools são TypeScript, então erros são mais fáceis de diagnosticar. Verifique:

1. Se as dependências estão instaladas: `cd .opencode && npm list`
2. Se os arquivos CSV não estão corrompidos: `head -5 data/sessions.csv`
3. Se o OpenCode está atualizado: `opencode --version`

---

## Troubleshooting

### "Tool não encontrada"

```bash
# Verifique se as tools existem
ls .opencode/tools/*.ts

# Reinstale dependências
cd .opencode && npm install
```

### "Dados não aparecem no /ul-data-status"

```bash
# Verifique se os CSVs existem
ls data/*.csv

# Se não existirem, inicialize
# No TUI: /ul-data-manage init

# Se existirem mas estão vazios
# Verifique o formato: deve ter header na primeira linha
cat data/sessions.csv
```

### "Módulo ativo não detectado"

```bash
# Verifique se há um módulo ativo no CSV
grep "true" data/modules.csv

# Se não houver, crie ou ative um:
# make module    # Criar novo
# make switch    # Alternar ativo
```

### "Analytics não aparecem no relatório"

```bash
# Verifique se há dados suficientes
# Tools analytics precisam de pelo menos algumas sessões

# Limpe o cache (recarrega do zero)
# No TUI: /ul-data-analytics (vai gerar novo cache)
```

---

## Benefícios e Estatísticas

### 🎯 Benefícios da Migração

| Aspecto | Antes (v1.x) | Depois (v2.0) |
|---------|--------------|---------------|
| **Parsing** | grep, awk, cut (frágil) | csv-parse (RFC 4180) |
| **Tipagem** | Bash (sem tipos) | TypeScript + Zod |
| **Integração** | Scripts via opencode run | Tools invocadas pelo LLM |
| **Manutenção** | 21 scripts interdependentes | 9 tools bem definidas |
| **Testabilidade** | Difícil testar bash | Jest support |
| **Contexto** | Parsing manual em cada script | context.getFullContext |
| **Performance** | Sem cache | Cache 5 minutos |
| **SRS** | Algoritmo customizado | SM-2 padrão |

### 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| Tools criadas | 9 |
| Commands criados | 4 |
| Scripts removidos | 21 |
| Scripts atualizados | 1 (review.sh) |
| Scripts mantidos | 7 (operações de sistema) |
| Arquivos de documentação atualizados | 12 |
| Skills atualizadas | 4 |
| Agentes atualizados | 2 (@tutor, @review) |
| Linhas de código (tools) | ~2,200 |
| Dependências adicionadas | 4 (csv-parse, csv-stringify, date-fns, zod) |

---

## 🚀 Próximos Passos

Após a migração:

1. **Leia o HOW_TO_USE.md atualizado** — Interface nova documentada
2. **Explore os /commands** — `/ul-data-status`, `/ul-data-analytics`, `/ul-data-dashboard`, `/ul-data-manage`
3. **Use @tutor normalmente** — Agora com contexto automático e dificuldade adaptativa
4. **Consulte o sistema-dados.md** — Como funcionam as tools e o sistema de dados
5. **Teste o @review** — Auditoria atualizada para arquitetura v2.0

---

## Feedback

Encontrou problemas na migração? Tem sugestões?

- Abra uma issue no repositório
- Ou mencione no seu próximo `@review`

---

*Guia de Migração v2.0 — Migrando de Scripts Bash para Tools TypeScript + Commands*
