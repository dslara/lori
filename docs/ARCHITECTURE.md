# Arquitetura de Dados — Ultralearning System

## Visão Geral

O sistema usa **duas camadas de dados complementares**, cada uma otimizada para um propósito específico.

| Camada | Tecnologia | Propósito | Exemplos |
|--------|------------|-----------|----------|
| **Dados Estruturados** | CSV | Dados quantitativos, queries simples | sessões, streaks, flashcards, módulos |
| **Memória Contextual** | OpenViking | Dados qualitativos, semântica | preferências, padrões, casos conversacionais |

## Fonte de Verdade

### CSV — Dados Quantitativos

**Localização**: `data/*.csv`

| Arquivo | Propósito | Schema |
|---------|-----------|--------|
| `sessions.csv` | Sessões de estudo | id, user_id, module_id, date, duration_min, focus_score, notes |
| `session_skills.csv` | Técnicas por sessão | session_id, skill, duration_min, topic, notes, success_rating, correct |
| `insights.csv` | Métricas agregadas | date, user_id, metric, value, module_id |
| `flashcards.csv` | Flashcards SRS | id, user_id, module_id, front, back, category, created_at, tags, next_review, interval, easiness, reviews |
| `reviews.csv` | Histórico SRS | flashcard_id, reviewed_at, quality, next_review |
| `modules.csv` | Módulos de estudo | id, user_id, name, is_active, status, started_at, completed_at, total_hours |
| `users.csv` | Metadados do usuário | id, username, email, timezone, created_at, preferences_source |

**Ferramentas**:
- `data.ts` (facade)
- `data-session.ts`, `data-module.ts`, `data-flashcard.ts`, `data-insight.ts`, `data-core.ts`
- `insights.ts`, `status.ts`, `retro.ts`

**Quando usar**:
- Sempre que precisar de dados estruturados
- Queries por data, módulo, usuário
- Métricas, streaks, estatísticas
- SRS (flashcards e reviews)

### OpenViking — Memória Contextual

**Localização**: `~/.openviking/` (global)

| URI | Propósito | Exemplo |
|-----|-----------|---------|
| `viking://user/default/memories/preferences/` | Preferências de aprendizado | "Prefere estudar pela manhã" |
| `viking://user/default/memories/entities/` | Conceitos aprendidos | "async/await em Rust" |
| `viking://user/default/memories/events/` | Marcos e decisões | "Começou módulo Rust em 2026-04-01" |
| `viking://agent/{id}/memories/cases/` | Casos e problemas resolvidos | "Bug em lifetime parameters" |
| `viking://agent/{id}/memories/patterns/` | Padrões identificados | "Usuário erra em recursão aos sábados" |

**Ferramentas**:
- `memsearch()` — Busca semântica
- `memread()` — Lê conteúdo de URI específica
- `membrowse()` — Navega estrutura de diretórios
- `memcommit()` — Persiste memória da sessão

**Quando usar**:
- Preferências do usuário (estilo de aprendizado, horários)
- Contexto conversacional entre sessões
- Padrões e casos detectados pelos agentes
- Memórias qualitativas

### Contexto Híbrido — `context-hybrid.ts`

**O que é**: Abstração que combina CSV + OpenViking com fallback automático.

```typescript
// Contexto completo (CSV + OpenViking)
const context = await contextHybrid({ operation: "getFullContext" });
// Retorna: { sessions, flashcards, streak, preferences, patterns, ... }
// Se OpenViking indisponível: { sessions, flashcards, streak, warnings: ["OpenViking not available"] }

// Contexto de sessão (mais leve)
const session = await contextHybrid({ operation: "getSessionContext" });

// Preferências do usuário
const prefs = await contextHybrid({ operation: "getUserPreferences" });

// Estatísticas da semana
const week = await contextHybrid({ operation: "getWeekContext" });
```

**Fallback**: Se OpenViking indisponível, retorna dados CSV com `warnings`.

## Commands por Arquitetura

| Command | Arquitetura | Ferramentas |
|---------|-------------|-------------|
| `/ul-study-start` | Híbrida | `context-hybrid`, `memread`, `memsearch`, `membrowse` |
| `/ul-study-end` | CSV + memcommit | `data.createSession`, `data.updateStreak`, `memcommit` |
| `/ul-practice-drill` | CSV | `data.createFlashcard` |
| `/ul-practice-feynman` | CSV | `data.createFlashcard` |
| `/ul-practice-quiz` | CSV | `insights.getDifficultyLevel`, `insights.getWeaknesses` |
| `/ul-practice-project` | Híbrida | `context-hybrid.getProjectInfo` |
| `/ul-data-status` | CSV | `status.getStatus` |
| `/ul-data-analytics` | CSV | `insights.getSummary`, `insights.getPatterns` |
| `/ul-data-dashboard` | CSV | `insights.showDashboard` |
| `/ul-memory-create` | OpenViking | `memcommit` |
| `/ul-memory-review` | OpenViking | `memsearch`, `memread` |
| `/ul-retro-weekly` | CSV + memcommit | `retro.getWeeklyStats`, `memcommit` |

## Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                        INÍCIO DA SESSÃO                          │
│                                                                 │
│  /ul-study-start                                                │
│  └── context-hybrid.getFullContext()                            │
│      ├── Lê CSV (sessions, flashcards, insights)                │
│      └── Lê OpenViking (preferences, patterns) ─── fallback OK   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DURANTE A SESSÃO                          │
│                                                                 │
│  /ul-practice-drill, /ul-practice-feynman, etc.                 │
│  └── CSV apenas (flashcards, sessões)                           │
│      └── Operações síncronas, offline-first                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FIM DA SESSÃO                             │
│                                                                 │
│  /ul-study-end                                                  │
│  ├── 1. CSV: data.createSession() → sessions.csv                │
│  ├── 2. CSV: data.updateStreak() → insights.csv                │
│  └── 3. OpenViking: memcommit() ─── opcional, não-bloqueante    │
└─────────────────────────────────────────────────────────────────┘
```

## Regras de Ouro

### 1. CSV é Obrigatório
**Sempre** escreva em CSV primeiro. OpenViking é opcional.

```typescript
// ✅ Correto
await writeCSV("sessions.csv", session);
await memcommit(); // Pode falhar, não quebra nada

// ❌ Errado
await memcommit(); // Se falhar antes do CSV, dados perdidos
await writeCSV("sessions.csv", session);
```

### 2. OpenViking é Contexto, não Dados
OpenViking armazena **interpretações** e **padrões**, não dados brutos.

| Tipo | Onde armazenar |
|------|----------------|
| "Usuário estudou 45 min hoje" | CSV (quantitativo) |
| "Usuário tem dificuldade com recursão" | OpenViking (qualitativo) |
| "Streak atual é 7" | CSV (quantitativo) |
| "Usuário prefere estudar pela manhã" | OpenViking (preferência) |

### 3. Fallback é Automático
`context-hybrid.ts` já implementa fallback. Não reinvente.

```typescript
const context = await contextHybrid({ operation: "getFullContext" });

// Se OpenViking cai:
// context = { sessions: [...], flashcards: [...], preferences: {}, warnings: ["OpenViking not available"] }
//                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Dados CSV intactos, preferências vazias (não crítico)
```

### 4. Não Duplicar
Escolha uma fonte. Não duplique dados.

```typescript
// ❌ Errado: duplicar
await writeCSV("insights.csv", { metric: "streak", value: 7 });
await memcommit({ memories: [{ content: "streak: 7" }] });

// ✅ Correto: escolher a fonte certa
// Streak = CSV (quantitativo)
await writeCSV("insights.csv", { metric: "streak", value: 7 });
// Padrão = OpenViking (qualitativo)
await memcommit({ memories: [{ content: "Usuário mantém streak consistente" }] });
```

## Troubleshooting

### OpenViking indisponível
```bash
# Verificar status
docker-compose ps

# Reiniciar
docker-compose restart openviking

# Verificar health
curl http://localhost:1933/health
```

**Comportamento esperado**: Sistema continua funcionando com dados CSV apenas.

### Dados divergentes
Se CSV e OpenViking divergem:

```bash
# CSV é a fonte de verdade para dados quantitativos
# Rebuilt OpenViking memories a partir do CSV se necessário

# Exemplo: Reconstruir preferências
/ul-study-start
→ context-hybrid carrega CSV
→ OpenViking vazio ou desatualizado
→ memcommit() sincroniza estado atual
```

### Cache desatualizado
```bash
# Limpar cache global
rm -rf .opencode/cache/

# OpencViking cache é em memória, reiniciar container limpa
docker-compose restart openviking
```

## Referências

- [HOW_TO_USE.md](../HOW_TO_USE.md) — Guia de uso
- [data/schema.md](../data/schema.md) — Schema dos CSVs
- [OpenViking Docs](https://github.com/anomalyco/openviking) — Documentação oficial