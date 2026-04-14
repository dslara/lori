# API Reference

Ultralearning TypeScript Tools - Comprehensive reference for all operations.

## Overview

13 tools for data operations, OpenViking integration, and system management.

---

## Data Operations

### data

CRUD operations for Ultralearning System data (CSV files).

**Operations**: 17

| Operation | Description |
|-----------|-------------|
| `init` | Initialize data directory |
| `createSession` | Create study session |
| `getSessions` | List sessions |
| `getSessionSkills` | Get session skills |
| `updateInsight` | Update insight metric |
| `getInsight` | Get insight value |
| `getAllInsights` | Get all insights |
| `getStreak` | Get current streak |
| `updateStreak` | Update streak |
| `createFlashcard` | Create flashcard |
| `getFlashcards` | List flashcards |
| `createReview` | Create flashcard review |
| `resetAll` | Reset all data |
| `createModule` | Create module |
| `switchModule` | Switch active module |
| `archiveModule` | Archive module |
| `createBackup` | Create backup |

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `operation` | enum | Yes | Operation to perform |
| `moduleId` | string | Conditional | Module ID (e.g., M1, M2). Required for: createSession, switchModule, archiveModule |
| `duration` | number | No | Session duration in minutes (0+) |
| `focusScore` | number | No | Focus score (1-10) |
| `notes` | string | No | Session notes (max 200 chars) |
| `filterModuleId` | string | No | Filter sessions by module |
| `limit` | number | No | Limit number of results (1-100) |
| `metric` | string | Conditional | Metric name. Required for: updateInsight, getInsight |
| `value` | string | Conditional | Metric value. Required for: updateInsight |
| `insightModuleId` | string | No | Module ID for insight |
| `front` | string | Conditional | Flashcard front text. Required for: createFlashcard |
| `back` | string | Conditional | Flashcard back text. Required for: createFlashcard |
| `category` | string | No | Flashcard category |
| `tags` | string[] | No | Flashcard tags |
| `flashcardId` | string | Conditional | Flashcard ID. Required for: createReview |
| `quality` | number | Conditional | Review quality (0-5, SM-2). Required for: createReview |
| `moduleName` | string | Conditional | Module name. Required for: createModule, archiveModule |

**Error Codes**:
- `MODULE_ID_REQUIRED`: moduleId is required
- `METRIC_REQUIRED`: metric is required
- `FLASHCARD_CONTENT_REQUIRED`: front and back are required
- `REVIEW_DATA_REQUIRED`: flashcardId and quality are required
- `MODULE_NAME_REQUIRED`: moduleName is required

---

### data-session

Session management operations (submodule of data).

**Operations**: 2

| Operation | Description |
|-----------|-------------|
| `createSession` | Create new session |
| `getSessions` | List sessions |

---

### data-module

Module management operations (submodule of data).

**Operations**: 3

| Operation | Description |
|-----------|-------------|
| `createModule` | Create module |
| `switchModule` | Switch active module |
| `archiveModule` | Archive module |

---

### data-insight

Insight tracking operations (submodule of data).

**Operations**: 4

| Operation | Description |
|-----------|-------------|
| `updateInsight` | Update insight metric |
| `getInsight` | Get insight value |
| `getAllInsights` | Get all insights |
| `getStreak` | Get current streak |

---

### data-flashcard

Flashcard operations (submodule of data).

**Operations**: 3

| Operation | Description |
|-----------|-------------|
| `createFlashcard` | Create flashcard |
| `getFlashcards` | List flashcards |
| `createReview` | Create flashcard review |

---

### data-core

Core data operations (init, reset, backup).

**Operations**: 3

| Operation | Description |
|-----------|-------------|
| `initDataDir` | Initialize data directory |
| `resetAllData` | Reset all data |
| `createBackup` | Create backup |

---

## Display & Status

### status

Get formatted status display for Ultralearning System.

**Operations**: 2

| Operation | Description |
|-----------|-------------|
| `getStatus` | Get status object |
| `formatStatus` | Get formatted status text |

**Parameters**:

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `operation` | enum | Yes | - | Status operation to perform |
| `includeProgressBar` | boolean | No | true | Include visual progress bar |

**Returns**:
```typescript
{
  streak: number;
  bestStreak: number;
  totalSessions: number;
  lastSession: string | null;
  currentModule: { id: string; name: string } | null;
  level: string;
  progressBar: string;
  progressPercent: number;
}
```

---

### insights

Learning analytics and insights.

**Operations**: 9

| Operation | Description |
|-----------|-------------|
| `getSummary` | Get summary stats |
| `getEffectiveness` | Get effectiveness metrics |
| `getPatterns` | Identify learning patterns |
| `getWeaknesses` | Identify weak areas |
| `getSRS` | Get SRS cards due |
| `getDifficultyLevel` | Get difficulty level |
| `generateReport` | Generate insight report |
| `showDashboard` | Show dashboard |
| `comparePeriods` | Compare time periods |

**Parameters**:

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `operation` | enum | Yes | - | Insights operation to perform |
| `days` | number | No | 30 | Number of days to analyze (1-90) |
| `threshold` | number | No | 0.3 | Error rate threshold for weaknesses (0-1) |
| `period` | enum | No | "week" | Period for comparison ("week" or "month") |

**Returns** (varies by operation):

`getSummary`:
```typescript
{
  streak: number;
  bestStreak: number;
  totalSessions: number;
  weeklyTime: number;
  totalTime: number;
  avgFocus: number;
}
```

`getEffectiveness`:
```typescript
{
  mostEffective: string | null;
  leastUsed: string | null;
  topSkills: Array<{ skill: string; successRate: number; count: number }>;
  retention: Record<string, { avgEasiness: number; count: number }>;
}
```

`getPatterns`:
```typescript
{
  bestDuration: { name: string; avgFocus: number };
  bestWeekday: { name: string; avgFocus: number };
  idealDuration: number;
  fatiguePoint: number;
  weekdayDistribution: Record<string, number>;
}
```

`getWeaknesses`:
```typescript
Array<{
  topic: string;
  errorRate: number;
  attempts: number;
  suggestedTechnique: string;
}>
```

`getSRS`:
```typescript
{
  reviewedToday: number;
  pending: number;
}
```

---

## OpenViking Integration

### resource

Manage OpenViking resources for semantic search.

**Operations**: 13

| Operation | Description |
|-----------|-------------|
| `add` | Add resource |
| `list` | List resources |
| `info` | Get resource info |
| `mv` | Move resource |
| `rm` | Delete resource |
| `link` | Link resources |
| `unlink` | Unlink resources |
| `relations` | Get resource relations |
| `abstract` | Get resource abstract |
| `overview` | Get resource overview |
| `read` | Read full resource |
| `export` | Export resource pack |
| `import` | Import resource pack |

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `operation` | enum | Yes | Operation to perform |
| `path` | string | Conditional | URL or local path. Required for: add |
| `target` | string | No | Target URI (viking://resources/...) |
| `uri` | string | Conditional | Resource URI. Required for: info, relations, abstract, overview, read, export |
| `from` | string | Conditional | Source URI. Required for: mv |
| `to` | string | Conditional | Destination URI. Required for: mv, export |
| `recursive` | boolean | No | Recursive flag for rm |
| `to_uri` | string | Conditional | Target URI. Required for: link, unlink |
| `reason` | string | No | Reason for adding/linking |
| `wait` | boolean | No | Wait for semantic processing (default: false) |
| `file_path` | string | Conditional | Local file path. Required for: import |
| `parent` | string | Conditional | Parent URI. Required for: import |
| `force` | boolean | No | Force overwrite for import |
| `vectorize` | boolean | No | Trigger vectorization after import (default: true) |

**Error Codes**:
- `MISSING_PATH`: path is required
- `MISSING_URI`: uri is required
- `MISSING_PARAMS`: required parameters missing

---

### context-hybrid

Hybrid context loading (CSV + OpenViking).

**Operations**: 10

| Operation | Description |
|-----------|-------------|
| `getFullContext` | Get complete hybrid context |
| `getUserPreferences` | Get user preferences |
| `getRelevantSessions` | Get relevant sessions via semantic search |
| `getLearningPatterns` | Get learning patterns |
| `getAgentId` | Get agent ID |
| `getSessionContext` | Get recent session context |
| `getWeekContext` | Get current week context |
| `getSRSPending` | Get pending SRS cards |
| `getProjectInfo` | Get project information |
| `getCurrentModule` | Get current active module |

**Parameters**:

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `operation` | enum | Yes | - | Context operation to perform |
| `query` | string | Conditional | - | Search query. Required for: getRelevantSessions |
| `limit` | number | No | 10 | Limit for search results (1-50) |
| `includeContent` | boolean | No | false | Include week file content |

**Returns** (varies by operation):

`getFullContext`:
```typescript
{
  sessions: Session[];
  sessionSkills: SessionSkill[];
  flashcards: Flashcard[];
  streak: number;
  totalSessions: number;
  preferences: any | null;
  patterns: any[];
  agentUri: string | null;
  openvikingAvailable: boolean;
  warnings: string[];
}
```

`getSessionContext`:
```typescript
{
  sessions: Session[];
  sessionSkills: SessionSkill[];
  currentModule: string | null;
  recentTopics: string[];
  streak: number;
  lastSessionDate: string | null;
}
```

`getSRSPending`:
```typescript
{
  count: number;
  cards: Array<{ id: string; front: string; nextReview: string }>;
}
```

`getCurrentModule`:
```typescript
{
  currentModule: {
    id: string;
    name: string;
    status: string;
    startedAt: string;
    totalHours: number;
  } | null;
}
```

---

## Planning & Retrospectives

### retro

Weekly retrospective management.

**Operations**: 3

| Operation | Description |
|-----------|-------------|
| `getWeeklyStats` | Get weekly statistics |
| `createRetro` | Create retrospective |
| `listRetros` | List retrospectives |

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `operation` | enum | Yes | Operation to perform |
| `moduleId` | string | No | Module ID |
| `weekNumber` | number | No | Week number |
| `worked` | string | Conditional | What worked. Required for: createRetro |
| `failed` | string | Conditional | What didn't work. Required for: createRetro |
| `nextFocus` | string | Conditional | Next week focus. Required for: createRetro |

**Returns** (varies by operation):

`getWeeklyStats`:
```typescript
{
  sessionsThisWeek: number;
  targetSessions: number;
  status: string;
  remainingToTarget: number;
  totalMinutes: number;
  avgFocus: string;
  weekStart: string;
  weekEnd: string;
}
```

`createRetro`:
```typescript
{
  retroFile: string;
  weekNumber: number;
  moduleId: string;
  stats: WeeklyStats;
}
```

`listRetros`:
```typescript
{
  retros: Array<{ filename: string; weekNumber: number }>;
  count: number;
  moduleId: string;
}
```

---

### setup

System setup and verification.

**Operations**: 3

| Operation | Description |
|-----------|-------------|
| `checkDependencies` | Check system dependencies |
| `initialize` | Initialize project structure |
| `verify` | Verify system integrity |

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `operation` | enum | Yes | Operation to perform |

**Returns** (varies by operation):

`checkDependencies`:
```typescript
{
  dependencies: Array<{
    name: string;
    status: string;
    installed: boolean;
    version?: string;
    install?: string;
  }>;
  allInstalled: boolean;
  ready: boolean;
}
```

`initialize`:
```typescript
{
  message: string;
  directories: string[];
  nextSteps: string[];
}
```

`verify`:
```typescript
{
  checks: Array<{ file?: string; directory?: string; component?: string; exists?: boolean; compiles?: boolean }>;
  healthy: boolean;
  issues: Array<any>;
}
```

---

## Quick Reference

### By Category

| Category | Tools |
|----------|-------|
| **Data** | data, data-session, data-module, data-insight, data-flashcard, data-core |
| **Display** | status, insights |
| **OpenViking** | resource, context-hybrid |
| **Planning** | retro, setup |

### Common Operations

```typescript
// Create session
await data({ operation: "createSession", moduleId: "M1", duration: 45, focusScore: 8 })

// Get status
await status({ operation: "getStatus" })

// Get formatted status
await status({ operation: "formatStatus", includeProgressBar: true })

// Load full context
await context-hybrid({ operation: "getFullContext" })

// Get current module
await context-hybrid({ operation: "getCurrentModule" })

// Get SRS pending
await context-hybrid({ operation: "getSRSPending" })

// Get weekly stats
await retro({ operation: "getWeeklyStats" })

// Create retrospective
await retro({
  operation: "createRetro",
  worked: "...",
  failed: "...",
  nextFocus: "..."
})

// Add resource
await resource({
  operation: "add",
  path: "https://example.com/doc.md",
  target: "viking://resources/ultralearning/doc"
})

// Get insights dashboard
await insights({ operation: "showDashboard", days: 30 })
```

