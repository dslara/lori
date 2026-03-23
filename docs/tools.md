# Documentação das Tools

Documentação centralizada das Tools TypeScript do Ultralearning System.

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tools Disponíveis](#tools-disponíveis)
- [Como Usar](#como-usar)
- [Integração com Commands](#integração-com-commands)
- [Cache](#cache)
- [Error Handling](#error-handling)
- [Referência Rápida](#referência-rápida)

---

## Visão Geral

As Tools TypeScript são a camada de processamento de dados do Ultralearning System. Elas fornecem:

- **CRUD robusto** em arquivos CSV
- **Parsing seguro** com csv-parse
- **Validação de tipos** com Zod
- **Cache inteligente** de 5 minutos
- **Error handling** padronizado

### Separação de Responsabilidades

```
┌─────────────────┐
│   Commands      │ ← Interface do usuário (/ul-*)
│   (.opencode/   │
│   commands/)    │
└────────┬────────┘
         │ Invocam
         ▼
┌─────────────────┐
│   Tools         │ ← Processamento de dados
│   (.opencode/   │
│   tools/)       │
└────────┬────────┘
         │ Leem/Escrevem
         ▼
┌─────────────────┐
│   Dados (CSV)   │ ← Persistência local
│   (data/*.csv)  │
└─────────────────┘
```

---

## Arquitetura

### Facade Pattern

A tool `data.ts` atua como **facade**, delegando operações para módulos especializados:

```typescript
// data.ts (facade)
export default async function data(params) {
  switch (params.operation) {
    case "createSession":
      return dataSession.createSession(params);
    case "createModule":
      return dataModule.createModule(params);
    // ... delega para módulos especializados
  }
}
```

### Módulos Especializados

| Módulo | Operações | Responsabilidade |
|--------|-----------|------------------|
| `data-session.ts` | createSession, getSessions | Sessões de estudo |
| `data-module.ts` | createModule, switchModule, archiveModule | Módulos de aprendizado |
| `data-flashcard.ts` | createFlashcard, getFlashcards, createReview | Flashcards SRS |
| `data-insight.ts` | updateInsight, getInsight, updateStreak | Métricas e streak |
| `data-core.ts` | initCSVDir, createBackup, resetAllData | Operações core |

---

## Tools Disponíveis

### 1. data.ts (Facade)

**Propósito**: Interface unificada para todas as operações de dados.

**Local**: `.opencode/tools/data.ts`

**Exemplo**:
```typescript
// Criar sessão
const result = await data({
  operation: "createSession",
  moduleId: "M1",
  duration: 60,
  focusScore: 8,
  notes: "Prática de recursão"
});

// Obter módulos
const modules = await data({
  operation: "getModules",
  filterModuleId: "M1"
});
```

**Operações Disponíveis**:

#### Sessions
- `createSession` - Criar nova sessão
- `getSessions` - Listar sessões (com filtros)

#### Modules
- `createModule` - Criar novo módulo
- `switchModule` - Alternar módulo ativo
- `archiveModule` - Arquivar módulo finalizado
- `getModules` - Listar módulos

#### Flashcards
- `createFlashcard` - Criar flashcard
- `getFlashcards` - Listar flashcards pendentes
- `createReview` - Registrar revisão SRS

#### Insights
- `updateInsight` - Atualizar métrica
- `getInsight` - Obter métrica específica
- `getAllInsights` - Listar todas as métricas
- `updateStreak` - Atualizar streak
- `getStreak` - Obter streak atual

#### Core
- `initCSVDir` - Inicializar estrutura de dados
- `createBackup` - Criar backup
- `resetAllData` - Resetar todos os dados (⚠️ cuidado)

---

### 2. insights.ts

**Propósito**: Análises e relatórios consolidados.

**Local**: `.opencode/tools/insights.ts`

**Histórico**: Consolida 5 tools legadas (analytics, effectiveness, patterns, weakness, dashboard).

**Exemplo**:
```typescript
// Relatório completo
const report = await insights({
  operation: "generateReport",
  period: "week",
  days: 30
});

// Identificar pontos fracos
const weaknesses = await insights({
  operation: "getWeaknesses",
  threshold: 0.3
});

// Dashboard visual
const dashboard = await insights({
  operation: "showDashboard"
});
```

**Operações**:

| Operação | Descrição |
|----------|-----------|
| `generateReport` | Relatório analítico completo |
| `getEffectiveness` | Efetividade por técnica |
| `getPatterns` | Padrões de estudo |
| `getWeaknesses` | Pontos fracos identificados |
| `getDifficultyLevel` | Nível de dificuldade por tópico |
| `showDashboard` | Dashboard visual consolidado |

---

### 3. context.ts

**Propósito**: Carregar contexto da sessão atual.

**Local**: `.opencode/tools/context.ts`

**Exemplo**:
```typescript
// Contexto completo
const fullContext = await context({
  operation: "getFullContext",
  limit: 3
});
// Retorna: módulo atual, sessões recentes, SRS pendente, plano semanal

// Apenas módulo atual
const module = await context({
  operation: "getCurrentModule"
});

// Sessões recentes
const sessions = await context({
  operation: "getRecentSessions",
  limit: 5
});
```

**Operações**:

| Operação | Retorno |
|----------|---------|
| `getFullContext` | Módulo, sessões, SRS, plano |
| `getCurrentModule` | Módulo ativo |
| `getRecentSessions` | Últimas N sessões |
| `getWeekContext` | Plano da semana |
| `getSRSPending` | Flashcards pendentes |
| `getProjectInfo` | Info do projeto atual |

---

### 4. status.ts

**Propósito**: Formatação visual de status.

**Local**: `.opencode/tools/status.ts`

**Exemplo**:
```typescript
// Status formatado
const status = await status({
  operation: "getStatus",
  includeProgressBar: true
});

// Formatar manualmente
const formatted = await status({
  operation: "formatStatus",
  includeProgressBar: true
});
```

**Output exemplo**:
```
🔥 5 dias de streak!
📚 Módulo: M1-math-foundations
⏱️  Última sessão: 2026-03-12 (60 min)
📊 Progresso: [████████░░] 80%
```

---

### 5. retro.ts

**Propósito**: Gerenciar retrospectivas semanais.

**Local**: `.opencode/tools/retro.ts`

**Exemplo**:
```typescript
// Estatísticas da semana
const stats = await retro({
  operation: "getWeeklyStats",
  weekNumber: 10
});

// Criar retrospectiva
await retro({
  operation: "createRetro",
  weekNumber: 10,
  worked: "Completei todos os exercícios",
  failed: "Não revisei SRS",
  nextFocus: "Manter consistência"
});
```

---

### 6. setup.ts

**Propósito**: Verificação e setup do sistema.

**Local**: `.opencode/tools/setup.ts`

**Exemplo**:
```typescript
// Verificar dependências
const deps = await setup({
  operation: "checkDependencies"
});
// Retorna: jq, bc, opencode, bun (status e versões)

// Inicializar sistema
await setup({
  operation: "initialize"
});

// Verificar integridade
const integrity = await setup({
  operation: "verify"
});
```

---

### 7. utils-csv.ts

**Propósito**: Utilitários para manipulação de CSV.

**Local**: `.opencode/tools/utils-csv.ts`

**Funções internas** (não invocadas diretamente):
- `readCSV` - Ler arquivo CSV
- `writeCSV` - Escrever arquivo CSV
- `parseMetadata` - Parse de metadados JSON
- `sanitize` - Sanitização de strings
- Cache management (getFromCache, setCache, clearCache)

---

## Como Usar

### Invocação Básica

Todas as tools seguem o mesmo padrão:

```typescript
const result = await toolName({
  operation: "nomeOperacao",
  // ... parâmetros específicos
});
```

### Dentro de Commands

Commands invocam tools automaticamente:

```markdown
---
description: Meu command
agent: tutor
model: opencode-go/glm-5
---

## Processo

1. Obter contexto
   ```typescript
   const ctx = await context({ operation: "getFullContext" });
   ```

2. Criar sessão
   ```typescript
   await data({
     operation: "createSession",
     moduleId: "M1",
     duration: 60,
     focusScore: 8
   });
   ```
```

### Tratamento de Erros

Todas as tools retornam objeto padronizado:

```typescript
{
  success: true,        // ou false
  data: { ... },        // dados quando sucesso
  error: null,          // mensagem quando erro
  cached: false         // true se veio do cache
}
```

**Padrão de uso**:
```typescript
const result = await data({ operation: "createSession", ... });

if (!result.success) {
  console.error("Erro:", result.error);
  return;
}

console.log("Sucesso:", result.data);
```

---

## Integração com Commands

### Commands por Tool

| Tool | Commands que Usam |
|------|------------------|
| `data` | /ul-study-start, /ul-study-end, /ul-memory-create, /ul-module-create, /ul-data-backup, ... |
| `insights` | /ul-data-analytics, /ul-data-dashboard, /ul-study-plan |
| `context` | /ul-study-start, /ul-data-status |
| `status` | /ul-data-status |
| `retro` | /ul-retro-weekly |
| `setup` | /ul-setup-check |

### Mapeamento de Operações

| Command | Tool + Operação |
|---------|----------------|
| /ul-study-start | context.getFullContext + insights.getWeaknesses |
| /ul-study-end | data.createSession + data.updateStreak |
| /ul-data-status | status.getStatus + context.getCurrentModule |
| /ul-data-analytics | insights.generateReport |
| /ul-memory-create | data.createFlashcard |
| /ul-module-create | data.createModule |

---

## Cache

### Configuração

Todas as tools de dados implementam **cache de 5 minutos**:

```typescript
// Primeira chamada: lê do disco
const result1 = await data({ operation: "getSessions" });
// cached: false

// Segunda chamada (dentro de 5min): usa cache
const result2 = await data({ operation: "getSessions" });
// cached: true
```

### Benefícios

- ✅ **Performance**: Evita leitura repetida do disco
- ✅ **Consistência**: Dados não mudam durante processamento
- ✅ **Economia**: Reduz operações de I/O

### Invalidação

Cache é invalidado automaticamente quando:
- Passam 5 minutos
- Operação de escrita é executada (create, update)

---

## Error Handling

### Tipos de Erro

| Código | Significado |
|--------|-------------|
| `FILE_NOT_FOUND` | Arquivo CSV não existe |
| `PARSE_ERROR` | Erro ao parsear CSV |
| `VALIDATION_ERROR` | Parâmetros inválidos |
| `WRITE_ERROR` | Erro ao escrever arquivo |
| `NOT_FOUND` | Registro não encontrado |

### Exemplo de Tratamento

```typescript
try {
  const result = await data({
    operation: "createSession",
    moduleId: "M1",
    duration: 60
  });
  
  if (!result.success) {
    switch (result.error?.code) {
      case "VALIDATION_ERROR":
        console.error("Parâmetros inválidos:", result.error.message);
        break;
      case "WRITE_ERROR":
        console.error("Erro de escrita. Verifique permissões.");
        break;
      default:
        console.error("Erro:", result.error);
    }
    return;
  }
  
  // Sucesso
  console.log("Sessão criada:", result.data.id);
  
} catch (err) {
  console.error("Erro inesperado:", err);
}
```

---

## Referência Rápida

### Cheat Sheet

```typescript
// Sessões
data({ operation: "createSession", moduleId, duration, focusScore, notes })
data({ operation: "getSessions", filterModuleId, limit })

// Módulos
data({ operation: "createModule", moduleName })
data({ operation: "switchModule", moduleId })
data({ operation: "getModules" })

// Flashcards
data({ operation: "createFlashcard", front, back, category, tags })
data({ operation: "getFlashcards", limit: 10 })
data({ operation: "createReview", flashcardId, quality })

// Analytics
insights({ operation: "generateReport", period: "week" })
insights({ operation: "getWeaknesses", threshold: 0.3 })
insights({ operation: "showDashboard" })

// Contexto
context({ operation: "getFullContext" })
context({ operation: "getCurrentModule" })
context({ operation: "getSRSPending" })

// Status
status({ operation: "getStatus" })
```

### Arquivos CSV

| Arquivo | Schema | Tool Principal |
|---------|--------|----------------|
| `sessions.csv` | id, user_id, module_id, date, duration_min, focus_score, notes | data-session |
| `modules.csv` | id, user_id, name, is_active, status, started_at, completed_at, total_hours | data-module |
| `flashcards.csv` | id, user_id, module_id, front, back, category, created_at, tags, next_review, interval, easiness, reviews | data-flashcard |
| `reviews.csv` | flashcard_id, reviewed_at, quality, next_review | data-flashcard |
| `insights.csv` | date, user_id, metric, value, module_id | data-insight |
| `session_skills.csv` | session_id, skill, duration_min, topic, notes, success_rating, correct | data-session |

---

## Schema dos Dados

Para documentação completa do schema dos CSVs, veja:

📄 [`../data/schema.md`](../data/schema.md)

---

## Exemplos Completos

### Exemplo 1: Fluxo de Sessão

```typescript
// 1. Iniciar sessão (/ul-study-start)
const ctx = await context({ operation: "getFullContext" });
console.log(`Módulo atual: ${ctx.currentModule.name}`);

// 2. Verificar SRS pendente
const srs = await context({ operation: "getSRSPending" });
if (srs.count > 0) {
  console.log(`Você tem ${srs.count} cards pendentes`);
}

// 3. Durante a sessão: skills são registradas em session_skills.csv
// O campo 'correct' é derivado de success_rating >= 6
// Registrou automaticamente via memcommit() no final da sessão

// 4. Encerrar sessão (/ul-study-end)
const session = await data({
  operation: "createSession",
  moduleId: ctx.currentModule.id,
  duration: 60,
  focusScore: 8,
  notes: "Quiz de recursão"
});

await data({ operation: "updateStreak" });
```

### Exemplo 2: Analytics

```typescript
// Relatório semanal
const report = await insights({
  operation: "generateReport",
  period: "week",
  days: 7
});

// Identificar pontos fracos
const weaknesses = await insights({
  operation: "getWeaknesses",
  threshold: 0.3  // error_rate > 30%
});

if (weaknesses.length > 0) {
  console.log("Pontos que precisam de atenção:");
  weaknesses.forEach(w => {
    console.log(`- ${w.topic}: ${w.errorRate}% de erro`);
  });
}

// Dashboard completo
const dashboard = await insights({
  operation: "showDashboard"
});
console.log(dashboard.formatted);
```

---

## Manutenção

### Adicionar Nova Operação

1. Adicionar função no módulo especializado
2. Exportar via `data.ts` (facade)
3. Documentar em [`data/schema.md`](../data/schema.md)
4. Atualizar este README

### Debugging

```typescript
// Ver cache
import { getFromCache, clearCache } from "./utils-csv";

const cached = await getFromCache("sessions");
console.log("Cache:", cached);

// Limpar cache
await clearCache();
```

---

*Documentação atualizada para Ultralearning System v3.2.0*

**Ver também**:
- [Schema dos Dados](../data/schema.md)
- [Commands](../../.opencode/commands/)
- [API Reference do OpenCode](https://opencode.ai/docs/custom-tools/)