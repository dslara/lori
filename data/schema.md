# Data Schema Documentation

Sistema de armazenamento local em CSV para o Ultralearning System.

## Visão Geral

```
data/
├── users.csv              # Usuários (multi-tenant ready)
├── modules.csv            # Módulos de aprendizado
├── sessions.csv           # Sessões diárias
├── session_skills.csv     # Técnicas usadas por sessão
├── flashcards.csv         # Flashcards SRS
├── reviews.csv            # Histórico de revisões SRS
├── insights.csv           # Métricas agregadas
├── goals.csv              # Metas do usuário
└── schema.md              # Este arquivo
```

## Tabelas

### users.csv

**Propósito**: Dados do usuário, preparado para multi-tenant.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | TEXT (PK) | Identificador único do usuário |
| `username` | TEXT | Nome de usuário |
| `email` | TEXT | Email (opcional) |
| `timezone` | TEXT | Timezone do usuário |
| `created_at` | DATE | Data de criação |
| `preferences_source` | TEXT | Fonte de preferências: 'openviking' |

**Exemplo**:
```csv
dani,dani,,America/Sao_Paulo,2026-03-01,openviking
```

> **Nota**: Preferências foram movidas para OpenViking.
> Usar `memread('viking://user/default/memories/preferences/')` para acessar.
> Ver `planning/proposta-arquitetura-dados-hibrida-2026-03-19.md` para detalhes.

---

### modules.csv

**Propósito**: Módulos de aprendizado (ex: M1-math-foundations).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | TEXT (PK) | Identificador único (ex: M1) |
| `user_id` | TEXT (FK) | Referência a users.id |
| `name` | TEXT | Nome do módulo |
| `is_active` | BOOLEAN | Módulo ativo atualmente |
| `status` | TEXT | Status geral (active, paused, completed) |
| `started_at` | DATE | Data de início |
| `completed_at` | DATE | Data de conclusão (se completo) |
| `total_hours` | REAL | Horas totais estudadas |

**Exemplo**:
```csv
M1,dani,math-foundations,true,active,2026-03-01,,0
M2,dani,zig-foundations,false,paused,2026-02-15,2026-02-28,15.0
```

---

### sessions.csv

**Propósito**: Sessões diárias de estudo.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | TEXT (PK) | Identificador único (ex: 2026-03-04-001) |
| `user_id` | TEXT (FK) | Referência a users.id |
| `module_id` | TEXT (FK) | Referência a modules.id |
| `date` | DATE | Data da sessão |
| `duration_min` | INT | Duração em minutos |
| `focus_score` | INT | Score de foco (1-10) |
| `notes` | TEXT | Notas da sessão (máx 200 chars, truncado automaticamente) |

**Exemplo**:
```csv
2026-03-04-001,dani,M1,2026-03-04,60,7,"SRS review, símbolos matemáticos"
```

**Nota**: O campo `notes` é a única fonte de narrativa da sessão. Não há mais logs markdown separados.

---

### session_skills.csv

**Propósito**: Técnicas usadas em cada sessão.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `session_id` | TEXT (FK) | Referência a sessions.id |
| `skill` | TEXT | Nome da técnica (drill, feynman, quiz, etc.) |
| `duration_min` | INT | Tempo gasto na técnica |
| `topic` | TEXT | Tópico estudado |
| `notes` | TEXT | Notas específicas |
| `success_rating` | INT | Rating de sucesso (1-10) |
| `correct` | BOOLEAN | Derivado de success_rating >= 6 (true/false) |

**Exemplo**:
```csv
2026-03-04-001,quiz,10,símbolos matemáticos,"∀, ∃, Σ, ∈",6,true
2026-03-04-001,feynman,20,∀,"Explicou bem",8,true
2026-03-04-001,drill,15,recursão,"Errou 2 de 5",4,false
```

---

### flashcards.csv

**Propósito**: Flashcards para Spaced Repetition System (SRS) — inclui dados SM-2 para calcular intervalos.

> **Nota**: O sistema SRS usa este CSV global (não JSONL por módulo). O script `scripts/spaced-repetition.sh` lê e escreve diretamente aqui.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | TEXT (PK) | Identificador único (timestamp + random) |
| `user_id` | TEXT (FK) | Referência a users.id |
| `module_id` | TEXT (FK) | Referência a modules.id |
| `front` | TEXT | Frente do card (pergunta) |
| `back` | TEXT | Verso do card (resposta) |
| `category` | TEXT | Categoria (ex: symbols, conceito, geral) |
| `created_at` | DATE | Data de criação |
| `tags` | TEXT | Tags separadas por \| |
| `next_review` | DATE | Data da próxima revisão (SM-2) |
| `interval` | INT | Intervalo atual em dias (SM-2) |
| `easiness` | REAL | Fator de facilidade (1.3–2.5, SM-2) |
| `reviews` | INT | Total de revisões realizadas |

**Exemplo**:
```csv
17251330005432,dani,M1,"O que significa ∀?","Para todo (quantificador universal)",symbols,2026-03-04,,2026-03-04,0,2.5,0
```

**Algoritmo SRS (SM-2)**:
- `quality` 0–2: `next_review` = +1 dia, `interval` = 1
- `quality` 3+ (1ª revisão): `interval` = 1
- `quality` 3+ (2ª revisão): `interval` = 3
- `quality` 3+ (demais): `interval` = `interval * easiness`
- `easiness` mínimo = 1.3, máximo = 2.5

---

### reviews.csv

**Propósito**: Histórico de revisões SRS (log de cada revisão individual).

> **Nota**: Os dados de agendamento SM-2 (`next_review`, `interval`, `easiness`) ficam inline em `flashcards.csv`. O `reviews.csv` registra o histórico detalhado de cada revisão para analytics — atualmente não populado pelo script `spaced-repetition.sh` (dados suficientes no `flashcards.csv` para o fluxo atual).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `flashcard_id` | TEXT (FK) | Referência a flashcards.id |
| `reviewed_at` | DATE | Data da revisão |
| `quality` | INT | Qualidade da resposta (0-5, SM-2) |
| `next_review` | DATE | Próxima revisão calculada |

**Exemplo**:
```csv
17251330005432,2026-03-04,4,2026-03-08
```

---

### insights.csv

**Propósito**: Métricas agregadas para analytics.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `date` | DATE | Data da métrica |
| `user_id` | TEXT (FK) | Referência a users.id |
| `metric` | TEXT | Nome da métrica |
| `value` | REAL | Valor da métrica |
| `module_id` | TEXT (FK) | Referência a modules.id (opcional) |

**Métricas comuns**:
- `streak` - Dias consecutivos
- `total_sessions` - Total de sessões
- `study_time_min` - Tempo de estudo
- `flashcards_reviewed` - Cards revisados
- `focus_avg` - Média de foco
- `error_rate_<topic>` - Taxa de erro por tópico (ex: `error_rate_recursão`)

**Métricas de Analytics Avançados**:

Calculadas pelas **Tools TypeScript** em `.opencode/tools/`:

| Métrica | Tool | Operação | Descrição |
|---------|------|----------|-----------|
| **Taxa de acerto por skill** | `effectiveness` | `getSuccessRateBySkill` | % de acertos por técnica (quiz, feynman, drill) |
| **Retenção por técnica** | `effectiveness` | `getRetentionByTechnique` | Média de `easiness` por `category` em flashcards |
| **Foco médio por técnica** | `effectiveness` | `getFocusByTechnique` | Média de `success_rating` por skill em session_skills |
| **Velocidade** | `effectiveness` | `getSpeed` | Sessões até 3 acertos consecutivos por tópico |
| **Melhor horário** | `patterns` | `getBestPeriod` | Período com maior foco médio (manhã/tarde/noite) |
| **Duração ideal** | `patterns` | `getIdealDuration` | Bucket de duração com maior foco |
| **Ponto de fadiga** | `patterns` | `getFatiguePoint` | Duração quando foco cai > 2 pontos |
| **Melhor dia da semana** | `patterns` | `getBestWeekday` | Dia com maior foco médio |
| **Nível de dificuldade** | `analytics` | `getDifficultyLevel` | easy/medium/hard baseado em error_rate |
| **Pontos fracos** | `weakness` | `identifyWeaknesses` | Tópicos com error_rate > 0.3 |
| **Dashboard completo** | `dashboard` | `show` | Visão geral de todas as métricas |

**Nota**: Scripts bash (`*.sh`) foram migrados para tools na v2.0. Veja `MIGRATION.md` para detalhes.

**Exemplo**:
```csv
2026-03-04,dani,study_time_min,60,M1
2026-03-04,dani,flashcards_reviewed,10,M1
2026-03-04,dani,streak,1,
2026-03-06,dani,error_rate_recursão,0.40,
2026-03-06,dani,error_rate_big_o,0.35,
```

---

### goals.csv

**Propósito**: Metas pessoais do usuário.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | TEXT (PK) | Identificador único (ex: G1) |
| `user_id` | TEXT (FK) | Referência a users.id |
| `module_id` | TEXT (FK) | Referência a modules.id (opcional) |
| `description` | TEXT | Descrição da meta |
| `target_date` | DATE | Data alvo |
| `status` | TEXT | in_progress, completed, abandoned |
| `progress` | REAL | Progresso (0.0-1.0) |

**Exemplo**:
```csv
G1,dani,M1,Completar fundamentos matemáticos,2026-04-30,in_progress,0.25
```

---

## Migração para SQL

O schema foi desenhado para ser **1:1 com SQL**:

```sql
-- Exemplo de migração para SQLite/PostgreSQL

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT,
    email TEXT,
    timezone TEXT,
    created_at DATE,
    preferences_source TEXT
);

CREATE TABLE modules (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    name TEXT,
    status TEXT,
    started_at DATE,
    completed_at DATE,
    total_hours REAL
);

CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    module_id TEXT REFERENCES modules(id),
    date DATE,
    duration_min INTEGER,
    focus_score INTEGER,
    notes TEXT
);

-- ... demais tabelas
```

---

## Integração com Agentes

### Leitura de Contexto

Os agentes podem ler CSVs para obter contexto:

```bash
# Últimas 5 sessões
tail -5 data/sessions.csv

# Flashcards vencidos para revisão (next_review <= hoje)
./scripts/spaced-repetition.sh list

# Estatísticas SRS
./scripts/spaced-repetition.sh stats
```

### Escrita de Dados

Os scripts `make` escrevem nos CSVs:

```bash
# end.sh - registrar sessão
echo "2026-03-04-001,dani,M1,2026-03-04,60,7,\"SRS review\"" >> data/sessions.csv
```

---

## Backup

Os CSVs são incluídos no backup automático:

```bash
/ul-data-backup  # Cria backup em backups/
```

---

## Versionamento

Os CSVs são trackeados no git:

```gitignore
# .gitignore
data/*.csv
!data/schema.md
```

**Nota**: CSVs com dados sensíveis podem ser ignorados. O `schema.md` é versionado.
