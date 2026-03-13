---
name: "session"
description: "Helpers de contexto e reflexão para sessões de estudo (usados pelos commands /ul-study-*)."
license: MIT
compatibility: opencode
metadata:
  principle: "orquestração"
  agent: "@tutor"
  commands: "/ul-study-start, /ul-study-end, /ul-study-plan"
---

## Helpers de Contexto

Funções auxiliares para carregar e interpretar contexto de sessão.

### processContext(fullContext)

Processa o retorno de `context.getFullContext` e retorna sugestões estruturadas:

```typescript
{
  currentModule: string,
  streak: number,
  hasSRSPending: boolean,
  srsCount: number,
  weakTopics: string[],  // error_rate > 0.3
  recentActivity: string,
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

Invoca sequência de tools para salvar sessão:
1. `data.createSession` - Cria registro
2. `data.updateStreak` - Atualiza streak
3. `analytics.generateReport` - Atualiza métricas

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

## Exemplo de Uso (por Commands)

### /ul-study-start

```
1. Invocar context.getFullContext
2. Chamar processContext()
3. Apresentar formatHeader() + sugestão
4. Aguardar escolha do usuário
```

### /ul-study-end

```
1. Apresentar reflectionQuestions()
2. Coletar respostas
3. Chamar analyzeGaps()
4. Invocar saveSession()
5. Se checkSunday() → Sugerir /ul-retro-weekly
```

### /ul-study-plan

```
1. Invocar analytics.generateReport
2. Invocar context.getWeekContext
3. Apresentar progresso formatado
4. Sugerir próximos passos baseado em weakTopics
```

## Integrações

**Tools utilizadas:**
- `context.getFullContext`
- `data.createSession`
- `data.updateStreak`
- `analytics.generateReport`
- `analytics.getErrorRateByTopic`

**Commands que usam esta skill:**
- `/ul-study-start`
- `/ul-study-end`
- `/ul-study-plan`

---

*Skill session v2.0 — Helpers para commands de estudo*
