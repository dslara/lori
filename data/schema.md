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
├── tutor_interactions.csv # Memória das interações
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
| `preferences` | JSON | Preferências em JSON |

**Exemplo**:
```csv
dani,dani,,America/Sao_Paulo,2026-03-01,"{""daily_goal_min"":60}"
```

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
| `notes` | TEXT | Notas da sessão |

**Exemplo**:
```csv
2026-03-04-001,dani,M1,2026-03-04,60,7,"SRS review, símbolos matemáticos"
```

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

**Exemplo**:
```csv
2026-03-04-001,quiz,10,símbolos matemáticos,"∀, ∃, Σ, ∈",6
2026-03-04-001,feynman,20,∀,"Explicou bem",8
```

---

### flashcards.csv

**Propósito**: Flashcards para Spaced Repetition System (SRS).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | TEXT (PK) | Identificador único (ex: F001) |
| `user_id` | TEXT (FK) | Referência a users.id |
| `module_id` | TEXT (FK) | Referência a modules.id |
| `front` | TEXT | Frente do card |
| `back` | TEXT | Verso do card |
| `created_at` | DATE | Data de criação |
| `tags` | TEXT | Tags separadas por \| |

**Exemplo**:
```csv
F001,dani,M1,∀,Para todo (quantificador universal),2026-03-04,logic|symbols
```

---

### reviews.csv

**Propósito**: Histórico de revisões SRS.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `flashcard_id` | TEXT (FK) | Referência a flashcards.id |
| `reviewed_at` | DATE | Data da revisão |
| `quality` | INT | Qualidade da resposta (0-5, SM-2) |
| `next_review` | DATE | Próxima revisão calculada |

**Exemplo**:
```csv
F001,2026-03-04,4,2026-03-08
```

**Algoritmo SRS (SM-2)**:
- quality 0-2: next_review = +1 dia
- quality 3-4: next_review = +3 dias
- quality 5: next_review = +7 dias

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

**Exemplo**:
```csv
2026-03-04,dani,study_time_min,60,M1
2026-03-04,dani,flashcards_reviewed,10,M1
2026-03-04,dani,streak,1,
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

### tutor_interactions.csv

**Propósito**: Memória das interações com o tutor.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | TEXT (PK) | Identificador único (ex: I001) |
| `session_id` | TEXT (FK) | Referência a sessions.id |
| `skill` | TEXT | Técnica usada |
| `topic` | TEXT | Tópico discutido |
| `user_message` | TEXT | Mensagem/pergunta do usuário |
| `user_response` | TEXT | Resposta do usuário (se houver) |
| `tutor_response` | TEXT | Resposta do tutor |
| `timestamp` | DATETIME | Timestamp da interação |
| `metadata` | JSON | Metadados em JSON |

**Exemplo**:
```csv
I001,2026-03-04-001,quiz,símbolos matemáticos,"O que significa ∀?","Para todo","Correto! ∀ é o quantificador universal",2026-03-04T10:15:00,"{""correct"":true}"
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
    preferences JSON
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

# Flashcards vencidos para revisão
grep "$(date +%Y-%m-%d)" data/reviews.csv
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
make backup  # Inclui data/ no tarball
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
