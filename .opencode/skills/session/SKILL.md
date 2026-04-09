---
name: "session"
description: "Helpers de contexto e reflexão para sessões de estudo (usados pelos commands /ul-study-*)."
license: MIT
compatibility: opencode
metadata:
  principle: "orquestração"
  agent: "@tutor"
  commands: "/ul-study-start, /ul-study-end, /ul-study-plan"
  keywords: "session, estudo, contexto, streak, foco, reflexão"
---

## Helpers de Contexto

Funções auxiliares para carregar e interpretar contexto de sessão via OpenViking.

### loadContext()

Carrega contexto completo usando OpenViking tools:

```typescript
// 1. Carregar perfil do usuário
const profile = await memread({
  uri: "viking://user/memories/profile.md",
  level: "read"
})

// 2. Buscar sessões recentes
const sessions = await memsearch({
  query: "sessões de estudo recentes",
  limit: 5
})

// 3. Buscar flashcards pendentes
const flashcards = await memsearch({
  query: "flashcards pendentes revisão",
  limit: 10
})

// 4. Buscar padrões de erro (pontos fracos)
const weaknesses = await memsearch({
  query: "padrões de erro tópicos fracos",
  limit: 5
})
```

Retorna:

```typescript
{
  profile: {
    currentModule: string,
    streak: number,
    preferences: object
  },
  recentSessions: Session[],
  srsPending: { count: number, cards: Flashcard[] },
  weakTopics: string[],
  suggestion: {
    primary: string,
    reason: string,
    alternative: string
  }
}
```

**Lógica de prioridade:**
1. Se SRS pendente → Sugerir revisão primeiro
2. Se weakTopics > 0 → Sugerir drill/feynman
3. Se continuidade → Sugerir mesma atividade
4. Default → Perguntar objetivo

### processContext(context)

Processa o contexto carregado e retorna sugestões estruturadas:

```typescript
{
  currentModule: string,
  streak: number,
  hasSRSPending: boolean,
  srsCount: number,
  weakTopics: string[],
  recentActivity: string,
  suggestion: {
    primary: string,
    reason: string,
    alternative: string
  }
}
```

### formatHeader(context)

Formata o cabeçalho da sessão:

```
🔥 [N] dias de streak! (se ≥ 1)
📅 Semana [X] | Módulo: [nome]
```

## Helpers de Reflexão

Templates para consolidar sessão no final.

### reflectionQuestions()

Retorna array de perguntas padrão:
1. "O que você aprendeu/praticou hoje? (1 frase)"
2. "Qual foi o maior desafio?"
3. "O que ainda está confuso? (se aplicável)"
4. "Nota de foco: ___/10"
5. "Qual sua confiança no tópico? ___/10"

### analyzeGaps(responses)

Analisa respostas e retorna ações sugeridas:
- Se confiança < 7 → Sugerir criar flashcard
- Se desafio recorrente → Sugerir mais drill
- Se foco < 5 → Sugerir pausa ou técnica pomodoro

## Helpers de Persistência

### saveSession(metadata)

O OpenViking sincroniza automaticamente as mensagens. Para criar estruturas específicas:

**Persistir sessão estruturada:**
```typescript
// O memcommit pode ser chamado explicitamente para forçar persistência
await memcommit({ wait: true })

// Para criar estruturas específicas, usar padrões de URI:
// viking://user/memories/sessions/2026-03-13-*.json
// viking://user/memories/insights.md
// viking://user/memories/flashcards/index.json
```

**Parâmetros:**
- moduleId: string
- duration: number (minutos)
- focusScore: number (1-10)
- notes: string
- techniques: string[]

### checkSunday()

Retorna true se hoje é domingo (para sugerir retrospectiva).

## Mapeamento de Atividades

Tabela de atividades para sugestões:

| Situação | Command Sugerido |
|----------|-----------------|
| Conceito novo | `/ul-learn-explain` |
| Validar compreensão | `/ul-practice-feynman` |
| Praticar procedimento | `/ul-practice-drill` |
| Construir projeto | `/ul-practice-project` |
| Setup de projeto | `/ul-setup-scaffold` |
| Revisar flashcards | `/ul-memory-review` |
| Procrastinando | `/ul-productivity-start` |
| Travado >30min | `/ul-productivity-break` |

## Estrutura OpenViking

O sistema usa a seguinte estrutura de memórias:

```
viking://user/memories/
├── profile.md              # Perfil, módulo ativo, streak, preferências
├── insights.md            # Métricas agregadas
├── patterns.md            # Padrões de erro
├── sessions/              # Sessões de estudo (auto-sync)
│   └── 2026-03-13-*.json  # Metadados estruturados
└── flashcards/            # Flashcards/SRS
    └── index.json         # Lista + metadados

viking://user/projects/
└── M1-math-foundations/
    └── meta/
        └── week-01.md
```

## Exemplo de Uso (por Commands)

### /ul-study-start

```
1. Chamar loadContext() para carregar contexto
2. Usar memread("viking://user/memories/profile.md")
3. Usar memsearch({ query: "sessões recentes" })
4. Usar memsearch({ query: "flashcards pendentes" })
5. Processar com processContext()
6. Apresentar formatHeader() + sugestão
7. Aguardar escolha do usuário
```

### /ul-study-end

```
1. Apresentar reflectionQuestions()
2. Coletar respostas
3. Chamar analyzeGaps()
4. Chamar memcommit({ wait: true }) para persistir
5. Se checkSunday() → Sugerir /ul-retro-weekly
```

### /ul-study-plan

```
1. Usar memsearch({ query: "progresso semanal" })
2. Usar memread("viking://user/memories/insights.md")
3. Apresentar progresso formatado
4. Sugerir próximos passos baseado em weakTopics
```

## Integrações

**Tools OpenViking utilizadas:**
- `memread` — Carregar memórias específicas
- `memsearch` — Buscar contexto relevante
- `membrowse` — Navegar estrutura
- `memcommit` — Persistir sessão

**Commands que usam esta skill:**
- `/ul-study-start`
- `/ul-study-end`
- `/ul-study-plan`

---

*Skill session v3.0 — Helpers para commands de estudo usando OpenViking*