# Ultralearning System Tools

Tools TypeScript para processamento de dados e integração com OpenViking.

## Visão Geral

```
.opencode/tools/
├── data.ts              # Facade CRUD (delega para módulos)
├── data-core.ts         # Init, backup, reset
├── data-session.ts     # Sessions CRUD
├── data-module.ts      # Modules CRUD
├── data-flashcard.ts   # Flashcards & SRS
├── data-insight.ts     # Insights & metrics
├── context.ts          # Contexto de sessão (CSV)
├── context-hybrid.ts   # Contexto híbrido (CSV + OpenViking)
├── openviking-utils.ts # Utilitários OpenViking (getAgentId)
├── insights.ts         # Analytics consolidados
├── status.ts           # Formatação visual
├── retro.ts            # Retrospectivas
├── setup.ts            # Setup e dependências
├── model-types.ts      # Interfaces TypeScript
└── utils-csv.ts        # Utilitários CSV
```

## Tools por Categoria

### Dados Estruturados (CSV)

| Tool | Operações | Descrição |
|------|-----------|-----------|
| `data.ts` | `init`, `createSession`, `getSessions`, `createFlashcard`, `getFlashcards`, `createReview`, `updateInsight`, `getStreak`, `updateStreak`, `createModule`, `switchModule`, `archiveModule`, `createBackup`, `resetAll` | Facade para todas as operações de dados |
| `data-session.ts` | `createSession`, `getSessions` | Sessões de estudo |
| `data-module.ts` | `createModule`, `switchModule`, `archiveModule` | Módulos de aprendizado |
| `data-flashcard.ts` | `createFlashcard`, `getFlashcards`, `createReview` | Flashcards SRS |
| `data-insight.ts` | `updateInsight`, `getInsight`, `getAllInsights`, `getStreak`, `updateStreak` | Métricas aggregadas |
| `data-core.ts` | `initDataDir`, `resetAllData`, `createBackup` | Operações core |

### Contexto

| Tool | Operações | Descrição |
|------|-----------|-----------|
| `context.ts` | `getCurrentModule`, `getRecentSessions`, `getWeekContext`, `getSRSPending`, `getProjectInfo`, `getFullContext` | Contexto de sessão (CSV only) |
| `context-hybrid.ts` | `getFullContext`, `getUserPreferences`, `getRelevantSessions`, `getLearningPatterns`, `getAgentId`, `getSessionContext` | Contexto híbrido (CSV + OpenViking) |

### Analytics

| Tool | Operações | Descrição |
|------|-----------|-----------|
| `insights.ts` | `getSummary`, `getEffectiveness`, `getPatterns`, `getWeaknesses`, `getSRS`, `getDifficultyLevel`, `generateReport`, `showDashboard`, `comparePeriods` | Analytics consolidados |

### OpenViking

| Tool | Funções | Descrição |
|------|---------|-----------|
| `openviking-utils.ts` | `getAgentId()`, `getAgentBaseUri()`, `getAgentMemoryUri()`, `clearAgentIdCache()`, `getUserPreferencesUri()`, `isOpenVikingAvailable()` | Utilitários para descoberta dinâmica de URIs |

### Sistema

| Tool | Operações | Descrição |
|------|-----------|-----------|
| `status.ts` | `getStatus`, `formatStatus` | Formatação visual de status |
| `retro.ts` | `getWeeklyStats`, `createRetro`, `listRetros` | Retrospectivas semanais |
| `setup.ts` | `checkDependencies`, `initialize`, `verify` | Setup e dependências |

## Uso

### Dados (facade)

```typescript
import data from "./data.js";

// Criar sessão
await data({ operation: "createSession", moduleId: "M1", duration: 60, focusScore: 8 });

// Buscar sessões
await data({ operation: "getSessions", limit: 5 });

// Criar flashcard
await data({ operation: "createFlashcard", front: "∀", back: "Para todo", category: "symbols" });
```

### Contexto Híbrido

```typescript
import contextHybrid from "./context-hybrid.js";

// Contexto completo (CSV + OpenViking)
const result = await contextHybrid({ operation: "getFullContext" });

// Preferências do usuário
const prefs = await contextHybrid({ operation: "getUserPreferences" });

// Descobrir ID do agente
const agentInfo = await contextHybrid({ operation: "getAgentId" });
```

### Utilitários OpenViking

```typescript
import { getAgentId, getAgentBaseUri, getAgentMemoryUri } from "./openviking-utils.js";

// Descobrir ID do agente dinamicamente
const agentId = await getAgentId(); // ex: "a1b2c3d4"

// URI base do agente
const baseUri = await getAgentBaseUri(); // ex: "viking://agent/a1b2c3d4/memories/"

// URI específica
const patternsUri = await getAgentMemoryUri('patterns'); // ex: "viking://agent/a1b2c3d4/memories/patterns/"
```

### Analytics

```typescript
import insights from "./insights.js";

// Dashboard
await insights({ operation: "showDashboard" });

// Efetividade por técnica
await insights({ operation: "getEffectiveness", days: 30 });

// Pontos fracos
await insights({ operation: "getWeaknesses", threshold: 0.3 });
```

## Migração v3.3

### Arquivos Removidos

| Arquivo | Motivo |
|---------|--------|
| `data-interaction.ts` | Redundante com `session_skills.csv` |

### Arquivos Novos

| Arquivo | Propósito |
|---------|-----------|
| `context-hybrid.ts` | Integração CSV + OpenViking |
| `openviking-utils.ts` | Descoberta dinâmica de ID do agente |

### Mudanças

| Mudança | Antes | Depois |
|---------|-------|--------|
| Preferências | `users.csv` (campo preferences) | OpenViking `preferences/` |
| Métricas por técnica | `tutor_interactions.csv` | `session_skills.csv` (campo correct) |
| Contexto | `context.ts` (CSV only) | `context-hybrid.ts` (CSV + OpenViking) |
| ID do agente | Hardcoded (ID fixo) | Dinâmico (`getAgentId()`) |

## Fallback

Quando OpenViking indisponível:

```typescript
// Contexto funciona mesmo sem OpenViking
const result = await contextHybrid({ operation: "getFullContext" });
// {
//   success: true,
//   data: {
//     sessions: [...],      // CSV funciona
//     flashcards: [...],    // CSV funciona
//     preferences: null,    // OpenViking falhou
//     patterns: []          // OpenViking falhou
//   },
//   warnings: ["OpenViking not available"]
// }
```

## Cache

| Dado | Cache | TTL |
|------|-------|-----|
| ID do agente | Memória | 30 min |
| Dados CSV | Memória | 5 min |
| Preferências OpenViking | Memória | 5 min |

## Ver Também

- `data/schema.md` - Schema dos CSVs
- `planning/proposta-arquitetura-dados-hibrida-2026-03-19.md` - Proposta de migração