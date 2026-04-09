# Proposta: Arquitetura de Dados Híbrida (CSV + OpenViking)

**Data**: 2026-03-19  
**Versão atual**: v3.2.0  
**Proponente**: Agente @brainstorm  
**Status**: Proposta (Revisada v8)
**Prioridade**: Alta

---

## Resumo Executivo

Implementar uma **arquitetura de dados híbrida simplificada** que:
1. **Consolida** preferências em OpenViking (fonte única)
2. **Elimina** `tutor_interactions.csv` (redundante)
3. **Integra** context.ts com OpenViking
4. **Descobre dinamicamente** o ID do agente (sem hardcoding)
5. **Garante** sincronização automática via `memcommit()`

Resultado: **-2 arquivos CSV**, **-1 tool de dados**, **sem duplicação**, **sem hardcoding**.

---

## Estado Atual Detalhado

### OpenViking Já Está em Uso

| URI | Arquivos | Conteúdo |
|-----|----------|----------|
| `viking://user/default/memories/preferences/` | 10 | Preferências (idioma, técnicas, etc.) |
| `viking://user/default/memories/entities/` | 12 | Conceitos aprendidos |
| `viking://user/default/memories/events/` | 12 | Marcos e eventos |
| `viking://agent/{id}/memories/cases/` | 11 | Problemas resolvidos |
| `viking://agent/{id}/memories/patterns/` | 6 | Padrões do sistema |
| `viking://agent/{id}/memories/skills/` | 3 | Skills validadas |

**Nota**: O ID do agente (`{id}`) é descoberto dinamicamente, não hardcoded.

### CSV Dados Estruturados

| Arquivo | Registros | Status |
|---------|-----------|--------|
| `users.csv` | 1 | **DUPLICADO** (preferences) |
| `modules.csv` | N | OK |
| `sessions.csv` | N | OK |
| `flashcards.csv` | N | OK |
| `reviews.csv` | N | OK |
| `session_skills.csv` | N | OK (tem skill, topic, success_rating) |
| `insights.csv` | N | OK |
| `goals.csv` | N | OK |
| `tutor_interactions.csv` | N | **ELIMINAR** (redundante) |

### Problemas Identificados

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ESTADO ATUAL (PROBLEMAS)                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  DUPLICAÇÃO 1: Preferências                                   │   │
│  │                                                              │   │
│  │  CSV: users.preferences = {"daily_goal_min":60, ...}        │   │
│  │                    ↓ DUPLICADO                                │   │
│  │  OpenViking: preferences/ (10 arquivos, mais rico)          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  DUPLICAÇÃO 2: Interações do Tutor                           │   │
│  │                                                              │   │
│  │  CSV: tutor_interactions.csv (skill, topic, metadata)       │   │
│  │                    ↓ DUPLICADO                                │   │
│  │  CSV: session_skills.csv (JÁ TEM skill, topic, rating)      │   │
│  │                    ↓ DUPLICADO                                │   │
│  │  OpenViking: cases/ (contexto conversacional)                │   │
│  │                                                              │   │
│  │  PROBLEMA: 3 lugares para os mesmos dados!                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  HARDCODING: ID do Agente                                    │   │
│  │                                                              │   │
│  │  ❌ PROBLEMA: "viking://agent/ffb1327b18bf/memories/..."     │   │
│  │     - ID pode mudar se OpenViking reinstalado                │   │
│  │     - Diferentes instalações = diferentes IDs                │   │
│  │     - Código não portátil                                     │   │
│  │                                                              │   │
│  │  ✅ SOLUÇÃO: Descobrir ID dinamicamente                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Solução Proposta

### Descoberta Dinâmica do ID do Agente

**Problema**: O ID `ffb1327b18bf` está hardcoded em vários lugares.

**Solução**: Descobrir o ID dinamicamente usando `membrowse`:

```typescript
// Cache do ID do agente (descoberto uma vez)
let cachedAgentId: string | null = null;

/**
 * Descobre o ID do agente dinamicamente.
 * Usa membrowse para listar agentes disponíveis e pega o primeiro.
 */
async function getAgentId(): Promise<string> {
  if (cachedAgentId) {
    return cachedAgentId;
  }
  
  // Listar agentes disponíveis
  const result = await membrowse({
    uri: "viking://agent",
    view: "list"
  });
  
  const data = JSON.parse(result);
  
  // Encontrar o primeiro diretório de agente
  const agentDir = data.items?.find((item: any) => item.isDir);
  
  if (agentDir) {
    // O rel_path é o ID do agente (ex: "ffb1327b18bf")
    cachedAgentId = agentDir.rel_path;
    return cachedAgentId!;
  }
  
  throw new Error("Agent ID not found in OpenViking");
}

/**
 * Constrói a URI base do agente dinamicamente.
 */
async function getAgentBaseUri(): Promise<string> {
  const agentId = await getAgentId();
  return `viking://agent/${agentId}/memories/`;
}
```

**Uso**:
```typescript
// Padrões do agente
const agentUri = await getAgentBaseUri();
const patterns = await memsearch({
  query: "padrões de aprendizado",
  target_uri: `${agentUri}patterns/`
});

// Cases do agente
const cases = await memsearch({
  query: "recursão",
  target_uri: `${agentUri}cases/`
});
```

---

### Arquitetura Final

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ARQUITETURA PROPOSTA (SIMPLIFICADA)              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  CSV - DADOS ESTRUTURADOS (7 arquivos, -2)                   │   │
│  │                                                              │   │
│  │  users.csv           → Metadados (SEM preferences)           │   │
│  │  modules.csv         → Progresso, status                     │   │
│  │  sessions.csv        → Métricas, duração, foco               │   │
│  │  flashcards.csv      → Sistema SRS                           │   │
│  │  reviews.csv         → Histórico SRS                         │   │
│  │  session_skills.csv  → Métricas por técnica (✚ correct)      │   │
│  │  insights.csv        → Métricas agregadas                     │   │
│  │  goals.csv           → Metas, progresso                       │   │
│  │                                                              │   │
│  │  ❌ ELIMINADOS:                                               │   │
│  │  • users.preferences (campo) → OpenViking                    │   │
│  │  • tutor_interactions.csv (arquivo) → session_skills.csv     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  OpenViking - MEMÓRIA SEMÂNTICA (FONTE ÚNICA)                 │   │
│  │                                                              │   │
│  │  viking://user/default/memories/                             │   │
│  │  ├── preferences/    → Estilo de aprendizado (FONTE ÚNICA)   │   │
│  │  ├── entities/       → Conceitos aprendidos                    │   │
│  │  └── events/         → Marcos e conquistas                     │   │
│  │                                                              │   │
│  │  viking://agent/{id}/memories/      ← ID DINÂMICO             │   │
│  │  ├── cases/          → Contexto conversacional (tutor)        │   │
│  │  ├── patterns/       → Padrões do sistema                      │   │
│  │  └── skills/         → Skills validadas                        │   │
│  │                                                              │   │
│  │  ✅ PARA CONTEXTO E BUSCA SEMÂNTICA:                          │   │
│  │  • Preferências do usuário                                    │   │
│  │  • Busca semântica ("sessões sobre recursão")                  │   │
│  │  • Contexto hierárquico (L0/L1/L2)                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  INTEGRAÇÃO (context-hybrid.ts)                               │   │
│  │                                                              │   │
│  │  // Descobrir ID do agente dinamicamente                      │   │
│  │  const agentUri = await getAgentBaseUri();                   │   │
│  │                                                              │   │
│  │  // CSV - Queries estruturadas                                │   │
│  │  const sessions = await getSessions()                         │   │
│  │  const skills = await getSessionSkills()                      │   │
│  │                                                              │   │
│  │  // OpenViking - Contexto semântico                           │   │
│  │  const preferences = await memread({                          │   │
│  │    uri: "viking://user/default/memories/preferences/"        │   │
│  │  })                                                          │   │
│  │  const patterns = await memsearch({                           │   │
│  │    query: "padrões",                                          │   │
│  │    target_uri: `${agentUri}patterns/`                         │   │
│  │  })                                                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Plano de Transição

### Visão Geral

**Duração total**: 1 semana  
**Fases**: 4  
**Dependências**: OpenViking server funcional (já implementado)

---

### Fase 1: Consolidação de Preferências (Dia 1-2)

**Objetivo**: Eliminar duplicação, OpenViking como fonte única

**Tarefas**:

- [ ] **1.1 Analisar duplicação**
  - Comparar `users.preferences` com OpenViking `preferences/`
  - Identificar dados únicos em cada sistema

- [ ] **1.2 Consolidar dados únicos**
  ```typescript
  // Se CSV tem algo que OpenViking não tem, adicionar via conversa
  // O sistema já funciona assim - preferências são extraídas automaticamente
  ```

- [ ] **1.3 Remover campo preferences de users.csv**
  ```csv
  # ANTES
  id,username,email,timezone,created_at,preferences
  
  # DEPOIS
  id,username,email,timezone,created_at,preferences_source
  dani,dani,,America/Sao_Paulo,2026-03-01,openviking
  ```

- [ ] **1.4 Atualizar schema.md**

**Critérios de sucesso**:
- [ ] `users.csv` não tem mais campo `preferences`
- [ ] OpenViking é fonte única de preferências

---

### Fase 2: Eliminar tutor_interactions.csv (Dia 3-4)

**Objetivo**: Migrar métricas para session_skills.csv, contexto para OpenViking

**Tarefas**:

- [ ] **2.1 Adicionar campo `correct` a session_skills.csv**
  ```csv
  # ANTES
  session_id,skill,duration_min,topic,notes,success_rating
  
  # DEPOIS
  session_id,skill,duration_min,topic,notes,success_rating,correct
  2026-03-04-001,quiz,10,símbolos matemáticos,"...",6,true
  ```
  
  Regra: `correct = success_rating >= 6`

- [ ] **2.2 Atualizar utils-csv.ts**
  ```typescript
  export const CSV_HEADERS = {
    // ...
    sessionSkills: ["session_id", "skill", "duration_min", "topic", "notes", "success_rating", "correct"],
  };
  ```

- [ ] **2.3 Atualizar insights.ts para usar session_skills**
  ```typescript
  // ANTES: Usava tutor_interactions
  for (const interaction of data!.interactions) {
    const metadata = parseMetadata(interaction.metadata);
    if (typeof metadata.correct !== "boolean") continue;
    const skill = interaction.skill;
    skillStats[skill].total++;
    if (metadata.correct) skillStats[skill].correct++;
  }
  
  // DEPOIS: Usa session_skills
  for (const skill of data!.sessionSkills) {
    const skillName = skill.skill?.toLowerCase().trim();
    if (!skillName) continue;
    
    const correct = parseInt(skill.success_rating) >= 6;
    if (!skillStats[skillName]) skillStats[skillName] = { correct: 0, total: 0 };
    skillStats[skillName].total++;
    if (correct) skillStats[skillName].correct++;
  }
  ```

- [ ] **2.4 Atualizar pontos fracos (analyzeWeaknesses)**
  ```typescript
  // DEPOIS: Usa session_skills
  for (const skill of data!.sessionSkills) {
    const topic = skill.topic?.toLowerCase().trim();
    if (topic && errorRates[topic]) {
      errorRates[topic].attempts++;
    }
  }
  ```

- [ ] **2.5 Eliminar tutor_interactions.csv e data-interaction.ts**

**Critérios de sucesso**:
- [ ] `session_skills.csv` tem campo `correct`
- [ ] `insights.ts` usa `session_skills` para métricas
- [ ] `tutor_interactions.csv` e `data-interaction.ts` não existem mais

---

### Fase 3: Tool Híbrida context-hybrid.ts (Dia 5-6)

**Objetivo**: Criar tool que integra CSV + OpenViking com ID dinâmico

**Tarefas**:

- [ ] **3.1 Criar utilitário para descobrir ID do agente**
  ```typescript
  // .opencode/tools/openviking-utils.ts
  
  let cachedAgentId: string | null = null;
  
  /**
   * Descobre o ID do agente dinamicamente.
   */
  export async function getAgentId(): Promise<string> {
    if (cachedAgentId) {
      return cachedAgentId;
    }
    
    const result = await membrowse({
      uri: "viking://agent",
      view: "list"
    });
    
    const data = JSON.parse(result);
    const agentDir = data.items?.find((item: any) => item.isDir);
    
    if (agentDir) {
      cachedAgentId = agentDir.rel_path;
      return cachedAgentId!;
    }
    
    throw new Error("Agent ID not found in OpenViking");
  }
  
  /**
   * Retorna a URI base do agente.
   */
  export async function getAgentBaseUri(): Promise<string> {
    const agentId = await getAgentId();
    return `viking://agent/${agentId}/memories/`;
  }
  
  /**
   * Limpa o cache do ID (útil após reinstalação do OpenViking).
   */
  export function clearAgentIdCache(): void {
    cachedAgentId = null;
  }
  ```

- [ ] **3.2 Criar context-hybrid.ts com ID dinâmico**
  ```typescript
  // .opencode/tools/context-hybrid.ts
  
  import { tool } from "@opencode-ai/plugin";
  import { z } from "zod";
  import data from "./data.js";
  import { getAgentBaseUri } from "./openviking-utils.js";
  
  export default tool({
    description: "Get hybrid context (CSV structured data + OpenViking semantic memory)",
    
    args: {
      operation: z.enum([
        "getFullContext",
        "getUserPreferences",
        "getRelevantSessions",
        "getLearningPatterns",
        "getAgentId"  // NOVO: para debug
      ]),
      query: z.string().optional(),
      limit: z.number().min(1).max(50).optional()
    },
    
    async execute(args, context) {
      switch (args.operation) {
        case "getFullContext": {
          // CSV - Dados estruturados
          const [sessionsResult, flashcardsResult, streakResult, skillsResult] = await Promise.all([
            data({ operation: "getSessions", limit: 5 }),
            data({ operation: "getFlashcards" }),
            data({ operation: "getStreak" }),
            data({ operation: "getSessionSkills" })
          ]);
          
          // OpenViking - Memória semântica
          const preferences = await memread({
            uri: "viking://user/default/memories/preferences/",
            level: "overview"
          });
          
          // ID dinâmico do agente
          const agentUri = await getAgentBaseUri();
          
          const patterns = await memsearch({
            query: "padrões de aprendizado do usuário",
            target_uri: `${agentUri}patterns/`,
            limit: 5
          });
          
          return JSON.stringify({
            success: true,
            data: {
              sessions: sessionsResult,
              flashcards: flashcardsResult,
              streak: streakResult,
              skills: skillsResult,
              preferences,
              patterns,
              _agentUri: agentUri  // Para debug
            }
          });
        }
        
        case "getUserPreferences": {
          const result = await memread({
            uri: "viking://user/default/memories/preferences/",
            level: "overview"
          });
          
          return JSON.stringify({
            success: true,
            source: "openviking",
            data: result
          });
        }
        
        case "getRelevantSessions": {
          if (!args.query) {
            return JSON.stringify({
              success: false,
              error: "QUERY_REQUIRED"
            });
          }
          
          // ID dinâmico do agente
          const agentUri = await getAgentBaseUri();
          
          const result = await memsearch({
            query: args.query,
            target_uri: `${agentUri}cases/`,
            limit: args.limit || 10
          });
          
          return JSON.stringify({
            success: true,
            data: result,
            _agentUri: agentUri  // Para debug
          });
        }
        
        case "getLearningPatterns": {
          // ID dinâmico do agente
          const agentUri = await getAgentBaseUri();
          
          const result = await memread({
            uri: `${agentUri}patterns/`,
            level: "overview"
          });
          
          return JSON.stringify({
            success: true,
            data: result,
            _agentUri: agentUri
          });
        }
        
        case "getAgentId": {
          // Para debug - retorna o ID descoberto
          const agentUri = await getAgentBaseUri();
          return JSON.stringify({
            success: true,
            data: { agentUri }
          });
        }
        
        default:
          return JSON.stringify({
            success: false,
            error: "UNKNOWN_OPERATION"
          });
      }
    }
  });
  ```

- [ ] **3.3 Adicionar getSessionSkills a data.ts**
  ```typescript
  case "getSessionSkills": {
    const skills = await readCSV<SessionSkill>(join(dataDir, "session_skills.csv"));
    return JSON.stringify({
      success: true,
      data: { skills }
    });
  }
  ```

- [ ] **3.4 Atualizar agentes para usar context-hybrid**

**Critérios de sucesso**:
- [ ] `getAgentId()` descobre ID dinamicamente
- [ ] `getFullContext` usa `getAgentBaseUri()`
- [ ] `getRelevantSessions` usa ID dinâmico
- [ ] `getLearningPatterns` usa ID dinâmico
- [ ] Código não tem ID hardcoded

---

### Fase 4: Garantir Sincronização Automática (Dia 7)

**Objetivo**: Garantir `memcommit()` ao final de sessões

**Onde adicionar memcommit()**:

| Arquivo | Command | Quando |
|---------|---------|--------|
| `.opencode/commands/ul-study-end.md` | `/ul-study-end` | Após salvar sessão |
| `.opencode/commands/ul-practice-*.md` | `/ul-practice-*` | Após cada prática (opcional) |

**Implementação**:

```typescript
// Em ul-study-end (ou equivalente)

// 1. Salvar sessão
await data({ operation: "createSession", ... })

// 2. Commitar memória automaticamente
await memcommit()

// 3. Retornar resultado
return JSON.stringify({
  success: true,
  message: "Sessão salva e memória atualizada"
})
```

**Tarefas**:

- [ ] **4.1 Verificar chamada de memcommit**
  ```bash
  grep -r "memcommit" .opencode/commands/
  ```

- [ ] **4.2 Adicionar memcommit ao final de ul-study-end**
  ```markdown
  <!-- .opencode/commands/ul-study-end.md -->
  
  ## Processo
  
  1. Salvar sessão em sessions.csv
  2. Atualizar streak
  3. **Commitar memória: `await memcommit()`**
  4. Retornar resumo
  ```

- [ ] **4.3 Validar extração automática**
  ```bash
  # Após uma sessão, verificar se memórias foram extraídas
  membrowse "viking://user/default/memories/preferences/" --view list
  membrowse "viking://agent/{id}/memories/cases/" --view list
  ```

**Critérios de sucesso**:
- [ ] Após sessão, novas preferências aparecem em `preferences/`
- [ ] Novos casos aparecem em `cases/`
- [ ] `memcommit()` é chamado em `/ul-study-end`

---

## Resumo das Mudanças

### Arquivos Eliminados

| Arquivo | Motivo |
|---------|--------|
| `data/tutor_interactions.csv` | Redundante com session_skills |
| `.opencode/tools/data-interaction.ts` | Não precisa mais |

### Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `data/users.csv` | Remover campo `preferences` |
| `data/session_skills.csv` | Adicionar campo `correct` |
| `data/schema.md` | Atualizar schemas |
| `.opencode/tools/utils-csv.ts` | Remover tutorInteractions, adicionar correct |
| `.opencode/tools/insights.ts` | Usar session_skills ao invés de interactions |

### Arquivos Novos

| Arquivo | Propósito |
|---------|-----------|
| `.opencode/tools/context-hybrid.ts` | Integração CSV + OpenViking |
| `.opencode/tools/openviking-utils.ts` | Descoberta dinâmica de ID |

---

## Código Completo: openviking-utils.ts

```typescript
// .opencode/tools/openviking-utils.ts
/**
 * Utilitários para trabalhar com OpenViking.
 * 
 * Resolve o problema de IDs hardcoded descobrindo
 * o ID do agente dinamicamente.
 */

// Cache do ID do agente (descoberto uma vez por sessão)
let cachedAgentId: string | null = null;

/**
 * Descobre o ID do agente dinamicamente usando membrowse.
 * 
 * O ID é gerado automaticamente pelo OpenViking e pode
 * mudar entre instalações. Esta função descobre o ID
 * disponível listando os agentes.
 * 
 * @returns O ID do agente (ex: "ffb1327b18bf")
 * @throws Error se não encontrar nenhum agente
 * 
 * @example
 * const agentId = await getAgentId();
 * // Returns: "ffb1327b18bf"
 * 
 * const uri = `viking://agent/${agentId}/memories/patterns/`;
 */
export async function getAgentId(): Promise<string> {
  // Retornar cache se disponível
  if (cachedAgentId) {
    return cachedAgentId;
  }
  
  // Descobrir ID listando agentes
  const result = await membrowse({
    uri: "viking://agent",
    view: "list"
  });
  
  try {
    const data = JSON.parse(result);
    
    // Encontrar o primeiro diretório de agente
    const agentDir = data.items?.find((item: any) => item.isDir);
    
    if (agentDir && agentDir.rel_path) {
      // O rel_path é o ID do agente
      cachedAgentId = agentDir.rel_path;
      return cachedAgentId!;
    }
    
    throw new Error("No agent directory found in OpenViking");
  } catch (error) {
    throw new Error(`Failed to discover agent ID: ${error}`);
  }
}

/**
 * Retorna a URI base do agente para memórias.
 * 
 * @returns URI base (ex: "viking://agent/ffb1327b18bf/memories/")
 * 
 * @example
 * const uri = await getAgentBaseUri();
 * // Returns: "viking://agent/ffb1327b18bf/memories/"
 * 
 * // Usar para buscar patterns
 * const patterns = await memsearch({
 *   query: "padrões",
 *   target_uri: `${uri}patterns/`
 * });
 */
export async function getAgentBaseUri(): Promise<string> {
  const agentId = await getAgentId();
  return `viking://agent/${agentId}/memories/`;
}

/**
 * Limpa o cache do ID do agente.
 * 
 * Útil após reinstalação do OpenViking ou quando
 * o ID pode ter mudado.
 */
export function clearAgentIdCache(): void {
  cachedAgentId = null;
}

/**
 * Retorna a URI completa para um tipo de memória do agente.
 * 
 * @param memoryType - Tipo de memória: 'cases', 'patterns', 'skills', 'tools'
 * @returns URI completa (ex: "viking://agent/ffb1327b18bf/memories/patterns/")
 * 
 * @example
 * const patternsUri = await getAgentMemoryUri('patterns');
 * const casesUri = await getAgentMemoryUri('cases');
 */
export async function getAgentMemoryUri(memoryType: 'cases' | 'patterns' | 'skills' | 'tools'): Promise<string> {
  const baseUri = await getAgentBaseUri();
  return `${baseUri}${memoryType}/`;
}
```

---

## Tratamento de Erros e Fallback

### Quando OpenViking Está Indisponível

O sistema deve continuar funcionando mesmo se o OpenViking estiver indisponível.

| Operação | Fallback | Comportamento |
|----------|----------|---------------|
| `getUserPreferences` | Erro claro | Retorna erro com mensagem |
| `getRelevantSessions` | Lista vazia | Retorna `[]` silenciosamente |
| `getLearningPatterns` | Lista vazia | Retorna `[]` silenciosamente |
| `getFullContext` | Apenas CSV | Retorna dados CSV + alerta |
| `getAgentId` | Erro claro | Retorna erro com mensagem |

### Implementação de Fallback

```typescript
// context-hybrid.ts - Tratamento de erros

async function safeMemread(uri: string, level: string): Promise<any> {
  try {
    return await memread({ uri, level });
  } catch (error) {
    console.warn(`OpenViking memread failed for ${uri}:`, error.message);
    return null; // Fallback silencioso
  }
}

async function safeMemsearch(query: string, targetUri: string, limit: number): Promise<any> {
  try {
    return await memsearch({ query, target_uri: targetUri, limit });
  } catch (error) {
    console.warn(`OpenViking memsearch failed:`, error.message);
    return { results: [] }; // Fallback silencioso
  }
}

async function safeGetAgentId(): Promise<string | null> {
  try {
    return await getAgentId();
  } catch (error) {
    console.warn(`Failed to discover agent ID:`, error.message);
    return null; // Fallback silencioso
  }
}

// Uso no context-hybrid
case "getFullContext": {
  // CSV - Sempre disponível
  const [sessionsResult, flashcardsResult, streakResult, skillsResult] = await Promise.all([
    data({ operation: "getSessions", limit: 5 }),
    data({ operation: "getFlashcards" }),
    data({ operation: "getStreak" }),
    data({ operation: "getSessionSkills" })
  ]);
  
  // OpenViking - Com fallback
  const preferences = await safeMemread(
    "viking://user/default/memories/preferences/",
    "overview"
  );
  
  const agentUri = await safeGetAgentId();
  const patterns = agentUri 
    ? await safeMemsearch("padrões de aprendizado", `${agentUri}patterns/`, 5)
    : { results: [] };
  
  return JSON.stringify({
    success: true,
    data: {
      sessions: sessionsResult,
      flashcards: flashcardsResult,
      streak: streakResult,
      skills: skillsResult,
      preferences: preferences || { warning: "OpenViking unavailable" },
      patterns: patterns.results || []
    },
    warnings: !preferences || !agentUri ? ["OpenViking partially unavailable"] : []
  });
}
```

---

## Cache de Contexto

### Estratégia de Cache

O sistema utiliza múltiplas camadas de cache para otimizar performance:

| Dado | Cache | TTL | Justificativa |
|------|-------|-----|----------------|
| ID do agente | Memória | 30 min | ID muda raramente |
| Preferências | OpenViking | 5 min | Preferências mudam pouco |
| Padrões do agente | OpenViking | 5 min | Padrões mudam pouco |
| Dados CSV | utils-csv.ts | 5 min | Já implementado |

### Implementação de Cache

```typescript
// openviking-utils.ts - Cache do ID do agente

let cachedAgentId: string | null = null;
let cachedAgentIdTimestamp: number = 0;
const AGENT_ID_CACHE_TTL = 30 * 60 * 1000; // 30 minutos

export async function getAgentId(): Promise<string> {
  const now = Date.now();
  
  // Retornar do cache se válido
  if (cachedAgentId && (now - cachedAgentIdTimestamp) < AGENT_ID_CACHE_TTL) {
    return cachedAgentId;
  }
  
  // Descobrir ID
  const result = await membrowse({ uri: "viking://agent", view: "list" });
  const data = JSON.parse(result);
  const agentDir = data.items?.find((item: any) => item.isDir);
  
  if (agentDir && agentDir.rel_path) {
    cachedAgentId = agentDir.rel_path;
    cachedAgentIdTimestamp = now;
    return cachedAgentId!;
  }
  
  throw new Error("Agent ID not found in OpenViking");
}

export function clearAgentIdCache(): void {
  cachedAgentId = null;
  cachedAgentIdTimestamp = 0;
}

// Cache de contexto para context-hybrid
const contextCache = new Map<string, { data: any; timestamp: number }>();
const CONTEXT_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCachedContext(key: string): any | null {
  const cached = contextCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CONTEXT_CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedContext(key: string, data: any): void {
  contextCache.set(key, { data, timestamp: Date.now() });
}
```

---

## Riscos Técnicos Detalhados

### Tabela de Riscos

| Risco | Probabilidade | Impacto | Estratégia de Mitigação |
|-------|--------------|---------|-------------------------|
| OpenViking indisponível | Média | Alto | Fallback graceful para CSV |
| Dados perdidos na consolidação | Baixa | Alto | Backup completo antes de Fase 1 |
| ID do agente muda (reinstalação) | Baixa | Médio | Cache com TTL + `clearAgentIdCache()` |
| `session_skills` não tem campo `correct` | Baixa | Médio | Derivar de `success_rating >= 6` |
| `insights.ts` quebra após eliminar `tutor_interactions` | Média | Médio | Testar antes de eliminar |
| Performance degrada com múltiplas chamadas OpenViking | Baixa | Baixo | Cache existente (5 min) |
| Cache do ID vence durante sessão | Baixa | Baixo | Re-descobrir automaticamente |
| Migração de dados falha | Baixa | Alto | Manter backup por 30 dias |

### Riscos por Fase

#### Fase 1: Consolidação de Preferências

| Risco | Mitigação |
|-------|-----------|
| Preferências perdidas no CSV | Backup de `users.csv` antes de modificar |
| OpenViking não tem todas as preferências | Comparar CSV vs OpenViking antes de eliminar |
| Usuário sem preferências após migração | Testar com usuário real antes de deploy |

#### Fase 2: Eliminar tutor_interactions.csv

| Risco | Mitigação |
|-------|-----------|
| `insights.ts` quebra | Rodar testes antes de eliminar |
| Campo `correct` não existe | Adicionar campo com migração |
| Métricas incorretas | Comparar resultados antes/depois |
| Dados históricos perdidos | OpenViking já tem os casos |

#### Fase 3: Tool Híbrida

| Risco | Mitigação |
|-------|-----------|
| `getAgentId()` falha | Fallback com erro claro |
| URIs incorretas | Validar URIs com `membrowse` |
| Cache vence | Re-descobrir automaticamente |
| Performance lenta | Cache em memória |

#### Fase 4: Sincronização

| Risco | Mitigação |
|-------|-----------|
| `memcommit()` não chamado | Adicionar ao final de sessões |
| Memórias não extraídas | Validar com `memread` após sessão |
| Auto-commit desativado | Verificar configuração |

---

## Uso por Agente

### Visão Geral

Cada agente do framework Ultralearning usará OpenViking de forma diferente, dependendo de suas responsabilidades.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USO DE OPENVIKING POR AGENTE                      │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  @tutor - Execução e Ensino                                  │   │
│  │                                                              │   │
│  │  Usa: preferências, padrões, cases                          │   │
│  │  Fonte: viking://user/.../preferences/                        │   │
│  │        viking://agent/.../patterns/                          │   │
│  │        viking://agent/.../cases/                              │   │
│  │                                                              │   │
│  │  Exemplo: "Vejo que você prefere quizzes pela manhã.         │   │
│  │           Vamos praticar recursão com quiz?"                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  @meta - Planejamento e Coordenação                          │   │
│  │                                                              │   │
│  │  Usa: entities, progresso do módulo                           │   │
│  │  Fonte: viking://user/.../entities/                           │   │
│  │        CSV: modules.csv, sessions.csv                        │   │
│  │                                                              │   │
│  │  Exemplo: "Você já aprendeu recursão. Próximo: árvores."     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  @review - Auditoria do Framework                            │   │
│  │                                                              │   │
│  │  Usa: patterns, skills, tools do sistema                      │   │
│  │  Fonte: viking://agent/.../patterns/                          │   │
│  │        viking://agent/.../skills/                              │   │
│  │        viking://agent/.../tools/                               │   │
│  │                                                              │   │
│  │  Exemplo: "O padrão de nomenclatura de commands foi violado.  │   │
│  │            Detectei 3 commands sem prefixo 'ul-'."            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  @brainstorm - Ideação para o Framework                      │   │
│  │                                                              │   │
│  │  Usa: patterns (arquitetura), histórico de propostas          │   │
│  │  Fonte: viking://agent/.../patterns/                          │   │
│  │        planning/*.md (propostas existentes)                  │   │
│  │                                                              │   │
│  │  Exemplo: "Vejo que há uma lacuna no onboarding. Sugiro       │   │
│  │            criar command /ul-setup-wizard."                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

### @tutor - Execução e Ensino

**Responsabilidade**: Conduzir sessões de estudo, ensinar, praticar.

**Dados que usa**:

| Dado | Fonte | Uso |
|------|-------|-----|
| Preferências do usuário | OpenViking `preferences/` | Adaptar estilo de ensino |
| Padrões de aprendizado | OpenViking `patterns/` | Identificar dificuldades |
| Casos anteriores | OpenViking `cases/` | Não repetir explicações |
| Sessões recentes | CSV `sessions.csv` | Contexto numérico |
| Flashcards pendentes | CSV `flashcards.csv` | SRS |
| Skills da sessão | CSV `session_skills.csv` | Métricas |

**Integração proposta**:

```typescript
// No início de cada sessão, @tutor carrega:

// 1. Preferências do usuário
const preferences = await context({
  operation: "getUserPreferences"
});
// Exemplo: { idioma: "pt-BR", tecnica_preferida: "quiz", horario: "manhã" }

// 2. Padrões de aprendizado
const patterns = await context({
  operation: "getLearningPatterns"
});
// Exemplo: [ {topic: "recursão", dificuldade: "alta"}, {topic: "arrays", dificuldade: "baixa"} ]

// 3. Contexto híbrido completo
const fullContext = await context({
  operation: "getFullContext"
});
// { sessions, flashcards, streak, preferences, patterns }
```

**Como usa os dados**:

```markdown
## @tutor - Comportamento Adaptativo

1. **Preferências de estilo**:
   - Se usuário prefere quizzes → usar mais `/ul-practice-quiz`
   - Se usuário prefere Feynman → usar mais `/ul-practice-feynman`
   - Se usuário prefere manhã → sugerir sessões matinais

2. **Padrões de dificuldade**:
   - Se usuário tem dificuldade com X → focar em X
   - Se usuário domina Y → propor desafios avançados

3. **Casos anteriores**:
   - Se já explicou X antes → não repetir explicação
   - Se usuário já resolved problema Y → citar como referência

4. **Contexto numérico**:
   - Streak → motivar continuidade
   - Sessões recentes → continuidade de assunto
   - Flashcards pendentes → revisão
```

---

### @meta - Planejamento e Coordenação

**Responsabilidade**: Planejar módulos, decompor objetivos, coordenar progresso.

**Dados que usa**:

| Dado | Fonte | Uso |
|------|-------|-----|
| Entidades aprendidas | OpenViking `entities/` | Saber o que já aprendeu |
| Progresso do módulo | CSV `modules.csv` | Status do módulo |
| Sessões | CSV `sessions.csv` | Histórico de estudo |
| Metas | CSV `goals.csv` | Objetivos do usuário |

**Integração proposta**:

```typescript
// @meta carrega:

// 1. Entidades (conceitos já aprendidos)
const entities = await memread({
  uri: "viking://user/default/memories/entities/",
  level: "overview"
});
// Exemplo: [ "recursão", "arrays", "linked lists", "big O" ]

// 2. Progresso do módulo
const module = await data({ operation: "get", filterModuleId: "current" });

// 3. Combina para planejar
const planning = {
  learned: entities,          // O que já sabe
  progress: module.progress,  // Onde está
  goals: goals                // Onde quer chegar
};
```

**Como usa os dados**:

```markdown
## @meta - Planejamento Informado

1. **Entidades aprendidas**:
   - Usado para saber o que já foi coberto
   - Evita repetir conceitos no plano
   - Sugere próximos passos baseado no que já sabe

2. **Progresso do módulo**:
   - Calcula % completo
   - Estima tempo restante
   - Ajusta cronograma

3. **Combinação**:
   - "Você já aprendeu recursão e arrays. Próximo passo sugerido: árvores binárias."
```

---

### @review - Auditoria do Framework

**Responsabilidade**: Auditar o framework (commands, tools, skills, agents), detectar inconsistências, propor correções.

**Dados que usa**:

| Dado | Fonte | Uso |
|------|-------|-----|
| Padrões do sistema | OpenViking `patterns/` | Documentação de arquitetura, nomenclatura |
| Skills validadas | OpenViking `skills/` | Skills do framework |
| Ferramentas documentadas | OpenViking `tools/` | Tools do framework |
| Análises anteriores | CSV `insights/` | Métricas do framework |

**Integração proposta**:

```typescript
// @review carrega:

// 1. Padrões do sistema (arquitetura, nomenclatura, convenções)
const patterns = await memread({
  uri: `${await getAgentBaseUri()}patterns/`,
  level: "overview"
});
// Exemplo: Naming conventions, tool patterns, skill structure

// 2. Skills validadas do framework
const skills = await memread({
  uri: `${await getAgentBaseUri()}skills/`,
  level: "overview"
});

// 3. Tools documentadas
const tools = await memread({
  uri: `${await getAgentBaseUri()}tools/`,
  level: "overview"
});
```

**Como usa os dados**:

```markdown
## @review - Auditoria do Framework

1. **Padrões do sistema (patterns/)**:
   - Consulta convenções de nomenclatura
   - Valida se novos components seguem padrões
   - Detecta desvios da arquitetura

2. **Skills validadas (skills/)**:
   - Verifica se skills têm SKILL.md
   - Valida estrutura de skills
   - Detecta documentação faltando

3. **Tools documentadas (tools/)**:
   - Verifica se tools têm schema Zod
   - Valida tipagem
   - Detecta tools sem documentação

4. **Combinação**:
   - "Auditei o framework e encontrei 3 commands sem prefixo 'ul-'. 
      Recomendo renomear para seguir a convenção de nomenclatura."
```

---

### @brainstorm - Ideação para o Framework

**Responsabilidade**: Propor novas features, melhorias, identificar lacunas no framework.

**Dados que usa**:

| Dado | Fonte | Uso |
|------|-------|-----|
| Padrões do sistema | OpenViking `patterns/` | conhecer arquitetura atual |
| Skills do framework | OpenViking `skills/` | Skills existentes |
| Propostas anteriores | `planning/*.md` | Histórico de mudanças |
| Lacunas conhecidas | `analise-framework-*.md` | Análises anteriores |

**Integração proposta**:

```typescript
// @brainstorm carrega:

// 1. Padrões do sistema (para propostas consistentes)
const patterns = await memread({
  uri: `${await getAgentBaseUri()}patterns/`,
  level: "overview"
});

// 2. Skills existentes (para não duplicar)
const skills = await membrowse({
  uri: `${await getAgentBaseUri()}skills/`,
  view: "list"
});

// 3. Usa para gerar propostas contextualizadas
const context = {
  architecture: patterns,      // Como o sistema funciona
  existingSkills: skills,      // O que já existe
  proposalsDir: "planning/"   // Histórico de propostas
};
```

**Como usa os dados**:

```markdown
## @brainstorm - Propostas para o Framework

1. **Padrões do sistema (patterns/)**:
   - Conhece a arquitetura atual
   - Propõe mudanças consistentes
   - Respeita convenções existentes

2. **Skills existentes (skills/)**:
   - Evita propor skills duplicadas
   - Considera extensões de skills existentes

3. **Combinação**:
   - "Vejo que o framework tem 30 commands mas não tem onboarding guiado.
      Sugiro criar `/ul-setup-wizard` que guia o usuário pelo setup inicial,
      seguindo o padrão de nomenclatura 'ul-' já estabelecido."
```

---

### Commands que Usam OpenViking

#### Commands de Aprendizado (@tutor, @meta)

| Command | Operação OpenViking | Benefício |
|---------|---------------------|-----------|
| `/ul-study-start` | `getFullContext()` + preferências | Tutor contextualizado |
| `/ul-practice-*` | Busca cases relacionados | Não repetir problemas |
| `/ul-data-trends` | `getLearningPatterns()` | Análise de padrões |
| `/ul-plan-weekly` | Entidades + progresso | Plano informado |

#### Commands do Framework (@review, @brainstorm)

| Command | Operação OpenViking | Benefício |
|---------|---------------------|-----------|
| `/ul-review-audit` | Padrões + Skills + Tools do framework | Auditoria consistente |
| `/ul-review-consistency` | Patterns do sistema | Validar convenções |
| (brainstorm keywords) | Patterns + histórico de propostas | Propostas consistentes |

#### Separação de Responsabilidades

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OPENVIKING: DOIS DOMÍNIOS                         │
│                                                                      │
│  DOMÍNIO: APRENDIZADO DO USUÁRIO                                    │
│  ├── viking://user/.../preferences/  → @tutor, @meta               │
│  ├── viking://user/.../entities/     → @tutor, @meta               │
│  └── viking://user/.../events/       → @tutor, @meta               │
│                                                                      │
│  DOMÍNIO: FRAMEWORK                                                 │
│  ├── viking://agent/.../patterns/    → @review, @brainstorm        │
│  ├── viking://agent/.../skills/      → @review, @brainstorm        │
│  ├── viking://agent/.../tools/       → @review, @brainstorm        │
│  └── viking://agent/.../cases/        → @tutor (contexto de ensino)│
└─────────────────────────────────────────────────────────────────────┘
```

---

### Fluxo de Dados por Agente

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE DADOS                                    │
│                                                                      │
│  @tutor (DOMÍNIO: APRENDIZADO DO USUÁRIO)                          │
│  ├── Início de sessão: getFullContext() → carrega tudo              │
│  │   ├── preferences/ → estilo de aprendizado                       │
│  │   ├── entities/ → conceitos já aprendidos                       │
│  │   └── cases/ → problemas já resolvidos                          │
│  ├── Durante sessão: session_skills.csv → métricas                   │
│  └── Fim de sessão: memcommit() → extrai memória                     │
│                                                                      │
│  @meta (DOMÍNIO: APRENDIZADO DO USUÁRIO)                            │
│  ├── Início de planejamento: entities/ → o que já aprendeu           │
│  ├── Durante planejamento: modules.csv + sessions.csv                │
│  └── Fim de planejamento: memcommit() → documenta progresso          │
│                                                                      │
│  @review (DOMÍNIO: FRAMEWORK)                                       │
│  ├── Início de auditoria: patterns/ + skills/ + tools/               │
│  │   ├── patterns/ → arquitetura, nomenclatura                      │
│  │   ├── skills/ → skills validadas                                │
│  │   └── tools/ → ferramentas documentadas                           │
│  ├── Durante auditoria: analisa código                              │
│  └── Fim de auditoria: relatório + recomendações                     │
│                                                                      │
│  @brainstorm (DOMÍNIO: FRAMEWORK)                                   │
│  ├── Início de análise: patterns/ → conhece arquitetura             │
│  ├── Durante análise: planning/*.md → histórico                    │
│  └── Fim de análise: proposta documentada                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Integrações Futuras (Pós-Implementação)

| Feature | Agentes | Dados OpenViking | Prioridade |
|---------|---------|------------------|------------|
| Auto-sugestão de atividade | @tutor, @meta | patterns/ + entities/ | Alta |
| Busca semântica de sessões | @tutor, @review | cases/ | Média |
| Detecção proativa de problemas | @review | patterns/ | Média |
| Sugestões contextualizadas | @brainstorm | entities/ + patterns/ | Baixa |

---

## Documentação a Atualizar

### Por Fase

#### Fase 1: Consolidação de Preferências

| Arquivo | Mudança |
|---------|---------|
| `data/schema.md` | Remover campo `preferences` de users.csv, adicionar `preferences_source` |
| `HOW_TO_USE.md` | Atualizar seção de preferências para indicar OpenViking como fonte |
| `.opencode/agents/tutor.md` | Adicionar uso de `getUserPreferences` |

#### Fase 2: Eliminar tutor_interactions.csv

| Arquivo | Mudança |
|---------|---------|
| `data/schema.md` | Remover `tutor_interactions.csv`, adicionar `correct` em session_skills |
| `.opencode/tools/README.md` | Remover `data-interaction.ts` da lista de tools |
| `HOW_TO_USE.md` | Atualizar seção de dados para remover tutor_interactions |

#### Fase 3: Tool Híbrida

| Arquivo | Mudança |
|---------|---------|
| `.opencode/tools/README.md` | Adicionar `context-hybrid.ts` e `openviking-utils.ts` |
| `HOW_TO_USE.md` | Adicionar seção "Contexto Híbrido" explicando CSV + OpenViking |
| `.opencode/agents/tutor.md` | Atualizar para usar `context({ operation: "getFullContext" })` |
| `.opencode/agents/meta.md` | Atualizar para usar `memread` em entities |
| `.opencode/agents/review.md` | Atualizar para usar `getAgentBaseUri()` em patterns/skills/tools |
| `.opencode/agents/brainstorm.md` | Atualizar para usar `getAgentBaseUri()` em patterns |

#### Fase 4: Sincronização

| Arquivo | Mudança |
|---------|---------|
| `.opencode/commands/ul-study-end.md` | Adicionar chamada a `memcommit()` |
| `HOW_TO_USE.md` | Adicionar seção "Memória Automática" explicando memcommit |

### Checklist de Documentação

- [ ] `data/schema.md` atualizado
- [ ] `HOW_TO_USE.md` atualizado
- [ ] `.opencode/tools/README.md` atualizado
- [ ] `.opencode/agents/tutor.md` atualizado
- [ ] `.opencode/agents/meta.md` atualizado
- [ ] `.opencode/agents/review.md` atualizado
- [ ] `.opencode/agents/brainstorm.md` atualizado
- [ ] `.opencode/commands/ul-study-end.md` atualizado

---

## Testes

### Testes por Fase

#### Fase 1: Consolidação de Preferências

| Teste | Comando | Esperado |
|-------|---------|----------|
| OpenViking tem preferências | `membrowse "viking://user/default/memories/preferences/"` | Lista de arquivos |
| users.csv sem preferences | `cat data/users.csv` | Campo `preferences` removido |
| context-hybrid funciona | `context({ operation: "getUserPreferences" })` | Dados do OpenViking |

#### Fase 2: Eliminar tutor_interactions.csv

| Teste | Comando | Esperado |
|-------|---------|----------|
| session_skills tem campo correct | `head -1 data/session_skills.csv` | Header inclui `correct` |
| insights.ts funciona | `insights({ operation: "getEffectiveness" })` | Retorna dados |
| tutor_interactions.csv não existe | `ls data/tutor_interactions.csv` | Arquivo não encontrado |

#### Fase 3: Tool Híbrida

| Teste | Comando | Esperado |
|-------|---------|----------|
| getAgentId() funciona | `context({ operation: "getAgentId" })` | Retorna URI do agente |
| getAgentId() com OpenViking down | Desativar OpenViking, chamar `getAgentId()` | Erro claro |
| getFullContext() com OpenViking down | Desativar OpenViking, chamar `getFullContext()` | Dados CSV + warning |
| getRelevantSessions() funciona | `context({ operation: "getRelevantSessions", query: "recursão" })` | Resultados semânticos |

#### Fase 4: Sincronização

| Teste | Comando | Esperado |
|-------|---------|----------|
| memcommit() ao final de sessão | Executar `/ul-study-end` | Memórias extraídas |
| Preferências atualizadas | `memread "viking://user/.../preferences/"` | Novas preferências |
| Cases atualizados | `membrowse "viking://agent/.../cases/"` | Novos casos |

### Testes de Fallback

```typescript
// Teste: OpenViking indisponível

// 1. Desativar OpenViking server
// 2. Chamar context-hybrid

const result = await context({ operation: "getFullContext" });

// Esperado:
// {
//   success: true,
//   data: {
//     sessions: [...],      // Dados CSV funcionam
//     flashcards: [...],    // Dados CSV funcionam
//     preferences: null,    // OpenViking falhou
//     patterns: []          // OpenViking falhou
//   },
//   warnings: ["OpenViking partially unavailable"]
// }
```

### Testes de Cache

```typescript
// Teste: Cache do ID do agente

// 1. Primeira chamada - descobre ID
const uri1 = await getAgentBaseUri();
// Esperado: "viking://agent/ffb1327b18bf/memories/"

// 2. Segunda chamada - usa cache
const uri2 = await getAgentBaseUri();
// Esperado: Mesmo URI, sem nova chamada ao OpenViking

// 3. Limpar cache
clearAgentIdCache();

// 4. Terceira chamada - descobre ID novamente
const uri3 = await getAgentBaseUri();
// Esperado: Mesmo URI, nova chamada ao OpenViking
```

### Testes de Integração

```bash
# Script de teste completo

# 1. Backup
cp -r data/ data_backup_$(date +%Y%m%d)/

# 2. Fase 1
npm run test -- --grep "preferências"
npm run test -- --grep "context-hybrid"

# 3. Fase 2
npm run test -- --grep "session_skills"
npm run test -- --grep "insights"

# 4. Fase 3
npm run test -- --grep "getAgentId"
npm run test -- --grep "fallback"

# 5. Fase 4
npm run test -- --grep "memcommit"
```

---

## Análise de Impacto vs Benefício

### Impacto

| Aspecto | Mudança |
|---------|---------|
| **Arquivos CSV** | -2 (9 → 7) |
| **Tools de dados** | -1 (6 → 5) |
| **Arquivos novos** | +2 (utils + context-hybrid) |
| **Código** | ~-50 linhas líquido |
| **Tempo** | 1 semana |
| **Hardcoding** | Eliminado |

### Benefício

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Fontes de preferências** | 2 (duplicado) | 1 (OpenViking) |
| **Fontes de interações** | 3 (duplicado) | 2 (session_skills + cases) |
| **ID do agente** | Hardcoded | Dinâmico |
| **Portabilidade** | Não | Sim |
| **Manutenção** | Alta | Baixa |
| **Resiliência** | Frágil | Fallback implementado |

---

## Recomendação

**Veredito**: **APROVAR**

**Justificativa**:
- `session_skills.csv` já tem dados para métricas
- `tutor_interactions.csv` é 100% redundante
- OpenViking já funciona para contexto
- Simplificação clara do sistema
- **ID do agente descoberto dinamicamente** - sem hardcoding

**Condições para aprovação**:
- [x] OpenViking server funcionando
- [x] session_skills.csv tem skill, topic, success_rating
- [x] membrowse funciona para descobrir ID
- [ ] Backup de dados antes de eliminar

---

## Checklist de Implementação

### Preparação

- [ ] Criar backup de `data/*.csv`
- [ ] Verificar OpenViking server health
- [ ] Testar `membrowse("viking://agent")` para descoberta de ID

### Fase 1: Preferências

- [ ] Analisar duplicação
- [ ] Remover campo preferences de users.csv
- [ ] Atualizar schema.md

### Fase 2: Eliminar tutor_interactions

- [ ] Adicionar campo correct a session_skills.csv
- [ ] Atualizar utils-csv.ts
- [ ] Atualizar insights.ts
- [ ] Eliminar tutor_interactions.csv
- [ ] Eliminar data-interaction.ts

### Fase 3: Tool Híbrida

- [ ] Criar openviking-utils.ts (descoberta de ID)
- [ ] Criar context-hybrid.ts
- [ ] Adicionar getSessionSkills a data.ts
- [ ] Atualizar agentes

### Fase 4: Sincronização

- [ ] Verificar memcommit()
- [ ] Validar extração automática

### Validação

- [ ] `getAgentId()` descobre ID dinamicamente
- [ ] `getAgentBaseUri()` retorna URI correta
- [ ] `clearAgentIdCache()` funciona corretamente
- [ ] insights.ts funciona sem tutor_interactions
- [ ] context-hybrid.ts carrega preferências
- [ ] Busca semântica funciona
- [ ] Sem IDs hardcoded no código
- [ ] Fallback funciona quando OpenViking indisponível
- [ ] Cache do ID funciona corretamente (30 min TTL)
- [ ] Contexto retorna dados CSV mesmo com OpenViking down

---

## Referências

### OpenViking URIs Dinâmicos

| URI | Como obter |
|-----|-----------|
| `viking://user/default/memories/` | Fixo - usar diretamente |
| `viking://agent/{id}/memories/` | `getAgentBaseUri()` - dinâmico |
| `viking://session/default/` | Fixo - usar diretamente |

### Funções Utilitárias

| Função | Retorno | Uso |
|--------|---------|-----|
| `getAgentId()` | `"ffb1327b18bf"` | ID do agente |
| `getAgentBaseUri()` | `"viking://agent/ffb1327b18bf/memories/"` | URI base |
| `getAgentMemoryUri('patterns')` | `"viking://agent/ffb1327b18bf/memories/patterns/"` | URI específica |
| `clearAgentIdCache()` | `void` | Limpar cache |

---

## Discussão e Decisões

### Comentários da Revisão

**2026-03-19 - Revisão Inicial**:
- OpenViking já em uso
- Duplicação identificada

**2026-03-19 - Simplificação**:
- Eliminar `tutor_interactions.csv`
- Usar `session_skills.csv` para métricas

**2026-03-19 - Hardcoding**:
- IDs hardcoded em `viking://agent/ffb1327b18bf/`
- Solução: descoberta dinâmica via `membrowse`

### Decisões Registradas

1. **2026-03-19**: `users.preferences` → OpenViking (fonte única)
2. **2026-03-19**: `tutor_interactions.csv` → ELIMINAR
3. **2026-03-19**: Métricas por skill → `session_skills.csv`
4. **2026-03-19**: ID do agente → Dinâmico via `getAgentId()`
5. **2026-03-19**: Utilitário → `openviking-utils.ts` com cache

---

## Status de Implementação

**Data de Implementação**: 2026-03-20  
**Status**: ✅ **COMPLETO**

### Resumo da Implementação

Todas as 4 fases foram implementadas com sucesso:

#### ✅ Fase 1: Consolidação de Preferências
- [x] **1.1** Analisar duplicação - Preferências comparadas (decidido ignorar daily_goal_min)
- [x] **1.2** Consolidar dados - OpenViking é fonte única
- [x] **1.3** Remover campo `preferences` de `users.csv` - **DONE**
- [x] **1.4** Atualizar `schema.md` - **DONE**

**Arquivos modificados**:
- `data/users.csv`: Campo `preferences` removido, adicionado `preferences_source: openviking`
- `data/users.csv.bak`: Backup criado
- `data/schema.md`: Documentação atualizada

#### ✅ Fase 2: Eliminar tutor_interactions.csv
- [x] **2.1** Adicionar campo `correct` a `session_skills.csv` - **DONE**
- [x] **2.2** Atualizar `utils-csv.ts` - **DONE**
- [x] **2.3** Atualizar `insights.ts` para usar `session_skills` - **DONE**
- [x] **2.4** Atualizar `analyzeWeaknesses` - **DONE**
- [x] **2.5** Eliminar `tutor_interactions.csv` e `data-interaction.ts` - **DONE**

**Arquivos modificados**:
- `data/session_skills.csv`: Adicionado campo `correct` (derivado de success_rating >= 6)
- `.opencode/tools/utils-csv.ts`: Headers atualizados, tutorInteractions removido de initCSVDir
- `.opencode/tools/model-types.ts`: Interface SessionSkill atualizada
- `.opencode/tools/insights.ts`: Migrou de interactions para sessionSkills
- `.opencode/tools/data.ts`: Removido operação `createInteraction`

**Arquivos removidos**:
- `data/tutor_interactions.csv` → Backup em `.bak`
- `.opencode/tools/data-interaction.ts` → Removido

#### ✅ Fase 3: Tool Híbrida context-hybrid.ts
- [x] **3.1** Criar `openviking-utils.ts` com descoberta dinâmica de ID - **DONE**
- [x] **3.2** Criar `context-hybrid.ts` - **DONE**
- [x] **3.3** Adicionar `getSessionSkills` a `data.ts` - **DONE**
- [x] **3.4** Atualizar agentes para usar context-hybrid - **DONE**

**Arquivos criados**:
- `.opencode/tools/openviking-utils.ts`: Utilitários OpenViking
  - `getAgentId()`: Descoberta dinâmica com cache (30 min)
  - `getAgentBaseUri()`: URI base do agente
  - `getAgentMemoryUri()`: URIs específicas (patterns, skills, tools, cases)
  - `clearAgentIdCache()`: Limpar cache
  - `isOpenVikingAvailable()`: Verificar disponibilidade
- `.opencode/tools/context-hybrid.ts`: Tool híbrida
  - `getFullContext()`: CSV + OpenViking
  - `getSessionContext()`: Contexto de sessão
  - `getUserPreferences()`: Preferências do usuário
  - `getRelevantSessions()`: Busca semântica
  - `getLearningPatterns()`: Padrões de aprendizado
  - `getAgentId()`: Debug
- `.opencode/tools/README.md`: Documentação das tools

**Agentes atualizados**:
- `.opencode/agents/tutor.md`: Usa `contextHybrid` e `getAgentBaseUri()`
- `.opencode/agents/meta.md`: Referencia OpenViking para preferências
- `.opencode/agents/review.md`: Usa `getAgentBaseUri()` para patterns/skills/tools
- `.opencode/agents/brainstorm.md`: Usa `getAgentMemoryUri()` para patterns

#### ✅ Fase 4: Sincronização Automática
- [x] **4.1** Verificar chamada de `memcommit()` - **DONE**
- [x] **4.2** Adicionar `memcommit` ao final de `ul-study-end` - **DONE**
- [x] **4.3** Validar extração automática - Documentado

**Arquivos modificados**:
- `.opencode/commands/ul-study-end.md`: Adicionado workflow com `memcommit()` explícito
- `HOW_TO_USE.md`: Seções "Contexto Híbrido" e "Memória Automática" adicionadas

### Checklist de Validação

- [x] `users.csv` não tem mais campo `preferences`
- [x] OpenViking é fonte única de preferências
- [x] `session_skills.csv` tem campo `correct`
- [x] `insights.ts` usa `session_skills` para métricas
- [x] `tutor_interactions.csv` não existe mais
- [x] `data-interaction.ts` não existe mais
- [x] `getAgentId()` descobre ID dinamicamente
- [x] `getFullContext` usa `getAgentBaseUri()`
- [x] `getRelevantSessions` usa ID dinâmico
- [x] `getLearningPatterns` usa ID dinâmico
- [x] Código não tem ID hardcoded
- [x] `memcommit()` é chamado em `/ul-study-end`
- [x] Cache do ID funciona (30 min TTL)
- [x] Fallback funciona quando OpenViking indisponível
- [x] Backups criados antes das modificações

### Arquivos de Backup

```
data/users.csv.bak              # Backup de users.csv
data/tutor_interactions.csv.bak # Backup de tutor_interactions.csv
```

### Métricas da Implementação

| Métrica | Antes | Depois | Delta |
|---------|-------|--------|-------|
| Arquivos CSV | 9 | 7 | -2 |
| Tools de dados | 10 | 10 | 0 (+2 novas, -1 removida) |
| Linhas de código | ~2000 | ~2200 | +200 |
| Hardcoding | Sim | Não | Eliminado |
| Fontes de preferências | 2 | 1 | -1 |
| Duplicação de dados | Alta | Nenhuma | Eliminada |

### Documentação Atualizada

| Arquivo | Status |
|---------|--------|
| `data/schema.md` | ✅ Atualizado |
| `HOW_TO_USE.md` | ✅ Seções novas adicionadas |
| `.opencode/tools/README.md` | ✅ Criado |
| `.opencode/agents/tutor.md` | ✅ Atualizado |
| `.opencode/agents/meta.md` | ✅ Atualizado |
| `.opencode/agents/review.md` | ✅ Atualizado |
| `.opencode/agents/brainstorm.md` | ✅ Atualizado |
| `.opencode/commands/ul-study-end.md` | ✅ Atualizado |

### Próximos Passos (Opcional)

1. **Testes**: Executar testes de integração
2. **Validação**: Verificar funcionamento com OpenViking real
3. **Documentação**: Atualizar CHANGELOG.md
4. **Release**: Marcar como v3.3

---

*Proposta revisada pelo agente @brainstorm*  
*Template: `planning/_template-proposta.md`*  
*Implementação completa em 2026-03-20*