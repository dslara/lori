# Sistema de Dados

Guia completo sobre como o Ultralearning System armazena e gerencia seus dados.

## Visão Geral

O sistema usa **arquivos CSV** para armazenar dados localmente. Isso permite:
- **Portabilidade**: Arquivos simples que você pode mover para qualquer lugar
- **Transparência**: Você pode abrir e ler qualquer arquivo
- **Migração fácil**: Preparado para migrar para SQL no futuro

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
└── schema.md               # Documentação completa
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

**Exemplo**:
```csv
date,user_id,metric,value,module_id
2026-03-06,dani,streak,1,
2026-03-06,dani,best_streak,1,
2026-03-06,dani,total_sessions,2,
```

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

---

## Como Consultar Dados

### Via Comandos Make

```bash
# Ver status geral (streak, sessões)
make status

# Ver analytics avançados
make analytics
```

### Via Arquivos

```bash
# Ver todas as sessões
cat data/sessions.csv

# Ver métricas
cat data/insights.csv

# Ver interações do tutor
cat data/tutor_interactions.csv
```

### Via grep

```bash
# Ver sessões de um módulo específico
grep ",M1," data/sessions.csv

# Ver streak atual
grep "streak" data/insights.csv

# Ver interações sobre um tópico
grep "símbolos matemáticos" data/tutor_interactions.csv
```

---

## Como os Dados São Salvos

### make start
- Cria arquivo de log diário em `projects/[modulo]/logs/daily/`

### make end
- Salva sessão em `data/sessions.csv`
- Atualiza métricas em `data/insights.csv`
- Atualiza streak

### make analytics
- Gera relatório a partir de `data/insights.csv` e `data/sessions.csv`

### make backup
- Cria backup de todos os CSVs em `backups/`

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
```

### Backup?

```bash
# Criar backup
make backup

# Ver backups anteriores
ls -la backups/
```

### Resetar dados?

```bash
# Cuidado! Isso apaga todos os dados
rm data/*.csv
# Depois recrie com scripts/data.sh init
```

---

## Próximos Passos

Agora que você entende como os dados são salvos:

1. **Use `make analytics`** regularmente para acompanhar progresso
2. **Use `make backup`** antes de fazer mudanças grandes
3. **Consulte `data/schema.md`** para documentação técnica completa

---

*Sistema de dados do Ultralearning - Versão 1.0*
