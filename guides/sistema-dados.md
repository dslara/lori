# Sistema de Dados

Guia completo sobre como o Ultralearning System armazena e gerencia seus dados.

## Visão Geral

O sistema usa **arquivos CSV** para armazenar dados localmente, acessados via **Tools TypeScript**. Isso permite:

- **Portabilidade**: Arquivos simples que você pode mover para qualquer lugar
- **Transparência**: Você pode abrir e ler qualquer arquivo
- **Integração nativa**: Tools se comunicam diretamente com o OpenCode
- **Parsing robusto**: Usando `csv-parse` em vez de grep/awk

## Arquitetura de Dados

```
┌─────────────────────────────────────────────────────────────┐
│  Commands (Interface do Usuário)                            │
│  ├── /status      → Tool status.ts                          │
│  ├── /analytics   → Tool analytics.ts                       │
│  └── /data        → Tool data.ts                            │
├─────────────────────────────────────────────────────────────┤
│  Tools TypeScript (.opencode/tools/)                        │
│  ├── data.ts      → CRUD nos CSVs                           │
│  ├── context.ts   → Contexto da sessão                      │
│  ├── analytics.ts → Cálculos e métricas                     │
│  └── status.ts    → Formatação visual                       │
├─────────────────────────────────────────────────────────────┤
│  Dados (CSV)                                                │
│  └── data/*.csv                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Arquivos

```
data/
├── users.csv                 # Usuários
├── modules.csv              # Módulos de estudo
├── sessions.csv              # Sessões diárias
├── session_skills.csv        # Técnicas usadas por sessão
├── flashcards.csv            # Flashcards SRS
├── reviews.csv              # Histórico de revisões SRS
├── insights.csv             # Métricas agregadas
├── goals.csv                # Metas do usuário
├── tutor_interactions.csv   # Memória do tutor
└── schema.md               # Documentação técnica completa
```

---

## Como Acessar Dados

### Via Commands (Recomendado)

No TUI do OpenCode (digite `/`):

```bash
/status          # Status geral (streak, sessões, módulo)
/analytics       # Analytics avançados
/data init       # Inicializar estrutura
/data reset      # Resetar todos os dados (cuidado!)
```

### Via Tools (Para Agents)

As tools são invocadas automaticamente pelos agents:

- `@tutor #start` → Tool `context` (carrega contexto)
- `@tutor #end` → Tool `data` (salva sessão)
- `@tutor #quiz` → Tool `analytics` (calcula dificuldade)

### Via Arquivos (Terminal)

```bash
# Ver todas as sessões
cat data/sessions.csv

# Ver métricas
cat data/insights.csv

# Ver interações do tutor
cat data/tutor_interactions.csv

# Ver sessões de um módulo específico
grep ",M1," data/sessions.csv

# Ver streak atual
grep "streak" data/insights.csv
```

---

## Arquivos Detalhados

### sessions.csv

**O que salva**: Cada sessão de estudo que você faz.

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| `id` | ID único da sessão | `2026-03-06-085708` |
| `user_id` | Seu usuário | `dani` |
| `module_id` | Módulo estudado | `M1` |
| `date` | Data | `2026-03-06` |
| `duration_min` | Duração em minutos | `45` |
| `focus_score` | Score de foco (1-10) | `8` |
| `notes` | Resumo da sessão | `Aprendi símbolos...` |

**Exemplo**:
```csv
id,user_id,module_id,date,duration_min,focus_score,notes
2026-03-06-085708,dani,M1,2026-03-06,45,8,"Revisão de 10 cards SRS"
```

**Tool**: `data.ts` (operações: `createSession`, `getSessions`)

---

### insights.csv

**O que salva**: Métricas agregadas do seu progresso.

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| `date` | Data da métrica | `2026-03-06` |
| `user_id` | Seu usuário | `dani` |
| `metric` | Nome da métrica | `streak` |
| `value` | Valor | `1` |
| `module_id` | Módulo (opcional) | `M1` |

**Métricas salvas**:
- `streak` - Dias consecutivos
- `best_streak` - Melhor streak já alcançado
- `total_sessions` - Total de sessões
- `last_session` - Última data de sessão
- `total_time_min` - Tempo total de estudo
- `avg_focus` - Média de foco
- `error_rate_*` - Taxa de erro por tópico

**Exemplo**:
```csv
date,user_id,metric,value,module_id
2026-03-06,dani,streak,1,
2026-03-06,dani,best_streak,1,
2026-03-06,dani,total_sessions,2,
```

**Tool**: `data.ts` (operações: `updateInsight`, `getInsight`, `getAllInsights`)

---

### tutor_interactions.csv

**O que salva**: Histórico das suas interações com o tutor (perguntas, quizzes, drills).

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| `id` | ID único | `I20260306085731` |
| `session_id` | Sessão relacionada | `2026-03-06-085708` |
| `skill` | Técnica usada | `quiz` |
| `topic` | Tópico | `símbolos matemáticos` |
| `user_message` | Sua pergunta | `O que significa ∀?` |
| `user_response` | Sua resposta | `Para todo` |
| `tutor_response` | Resposta do tutor | `Correto!` |
| `timestamp` | Data/hora | `2026-03-06T08:57:31+01:00` |
| `metadata` | Dados extras (JSON) | `{"correct":true}` |

**Exemplo**:
```csv
id,session_id,skill,topic,user_message,user_response,tutor_response,timestamp,metadata
I20260306085731,2026-03-06-085708,quiz,símbolos matemáticos,"O que significa ∀?","Para todo","Correto!",2026-03-06T08:57:31+01:00,"{""correct"":true}"
```

**Tool**: `data.ts` (operação: `createInteraction`)

---

### flashcards.csv

**O que salva**: Flashcards para o sistema SRS (Spaced Repetition).

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| `id` | ID único | `F1712345678901` |
| `user_id` | Seu usuário | `dani` |
| `module_id` | Módulo | `M1` |
| `front` | Frente do card | `∀` |
| `back` | Verso do card | `Para todo` |
| `category` | Categoria | `math-symbols` |
| `created_at` | Data de criação | `2026-03-01` |
| `tags` | Tags | `logic,notation` |
| `next_review` | Próxima revisão | `2026-03-02` |
| `interval` | Intervalo (dias) | `1` |
| `easiness` | Fator de facilidade (SM-2) | `2.5` |
| `reviews` | Número de revisões | `0` |

**Tool**: `data.ts` (operações: `createFlashcard`, `getFlashcards`)

---

### reviews.csv

**O que salva**: Histórico de revisões de flashcards.

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| `flashcard_id` | ID do flashcard | `F1712345678901` |
| `reviewed_at` | Data/hora da revisão | `2026-03-02T10:30:00Z` |
| `quality` | Qualidade (0-5, SM-2) | `4` |
| `next_review` | Próxima revisão calculada | `2026-03-03` |

**Tool**: `data.ts` (operação: `createReview`)

---

## Como os Dados São Salvos

### `@tutor #start`

1. Tool `context` com `getFullContext` carrega:
   - Módulo ativo
   - Sessões recentes
   - Plano da semana
   - SRS pendente

### `@tutor #end`

1. Coleta dados da sessão (duração, foco, notas)
2. Tool `data` com `createSession` salva em `sessions.csv`
3. Tool `data` com `updateStreak` atualiza `insights.csv`
4. Tool `analytics` atualiza métricas calculadas

### `@tutor #quiz`

1. Tool `analytics` com `getDifficultyLevel` calcula nível adaptativo
2. Tool `data` com `createInteraction` salva resultado

### `/status` e `/analytics`

1. Tools `status` e `analytics` leem os CSVs
2. Calculam métricas em tempo real
3. Apresentam ao usuário

---

## Tools Disponíveis

### data.ts

**Operações**:
- `init` - Inicializar estrutura de arquivos
- `createSession` - Criar nova sessão
- `getSessions` - Listar sessões
- `updateInsight` / `getInsight` - Gerenciar métricas
- `getStreak` / `updateStreak` - Gerenciar streak
- `createFlashcard` / `getFlashcards` - Gerenciar flashcards
- `createReview` - Registrar revisão
- `createInteraction` - Registrar interação
- `resetAll` - Resetar todos os dados

### context.ts

**Operações**:
- `getCurrentModule` - Módulo ativo
- `getRecentSessions` - Últimas N sessões
- `getWeekContext` - Plano da semana
- `getSRSPending` - Flashcards pendentes
- `getFullContext` - Todas as informações

### analytics.ts

**Operações**:
- `getTotalTime` - Tempo total de estudo
- `getAvgFocus` - Foco médio
- `getSessionsByWeekday` - Distribuição por dia
- `getMostUsedSkill` - Técnica mais usada
- `getErrorRateByTopic` - Taxa de erro
- `getFlashcardsReviewed` - Cards revisados
- `getDifficultyLevel` - Nível adaptativo
- `generateReport` - Relatório completo

### status.ts

**Operações**:
- `getStatus` - Dados crus
- `formatStatus` - String formatada com emojis

---

## Migração Futura

Os CSVs foram desenhados para serem **1:1 compatíveis com SQL**:

```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    module_id TEXT,
    date DATE,
    duration_min INTEGER,
    focus_score INTEGER,
    notes TEXT
);
```

Quando quiser migrar para SQLite ou PostgreSQL, será só importar os CSVs.

---

## Resolução de Problemas

### Dados corrompidos?

```bash
# Verificar integridade
head -1 data/sessions.csv
tail -5 data/sessions.csv

# Se necessário, restaurar do backup
cp backups/data-20260306/* data/
```

### Tool não funciona?

```bash
# Verificar se dependências estão instaladas
cd .opencode && npm list

# Reinstalar se necessário
npm install
```

### Dados não aparecem?

```bash
# Inicializar estrutura
/data init

# Verificar permissões
ls -la data/
```

---

## Backup

```bash
# Criar backup
make backup

# Ver backups anteriores
ls -la backups/
```

---

## Próximos Passos

Agora que você entende como os dados funcionam:

1. **Use `/status`** regularmente para acompanhar progresso
2. **Use `/analytics`** semanalmente para análise detalhada
3. **Use `/data init`** se precisar resetar ou reconfigurar
4. **Use `make backup`** antes de fazer mudanças grandes
5. **Consulte `data/schema.md`** para documentação técnica completa

---

*Sistema de dados do Ultralearning v2.0 — Powered by TypeScript Tools*
