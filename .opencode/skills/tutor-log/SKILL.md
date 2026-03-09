# Tutor Log Skill - Registrar Interações Automaticamente

## Objetivo

Registrar automaticamente as interações do tutor em `data/tutor_interactions.csv` para memória e contexto futuro.

## Quando Registrar

**REGISTRE AUTOMATICAMENTE** quando:
- Usuário fizer uma pergunta conceitual
- Usuário responder a um quiz
- Usuário completar um exercício de drill
- Usuário explicar um conceito (#feynman)
- Usuário pedir ajuda com debug
- Usuário pedir feedback em código

**NÃO REGISTRE** quando:
- Interação é muito curta (< 10 palavras)
- Usuário só disse "ok", "obrigado", "entendi"
- Interação é puramente administrativa

## Como Registrar

### Opção 1: Tool TypeScript (Recomendado v2.0)

Use a **tool `tutor-log`** com operação `logInteraction`:

```typescript
tutorLog.logInteraction({
  sessionId: "2026-03-06-085708",
  skill: "quiz",
  topic: "símbolos matemáticos",
  userMessage: "O que significa ∀?",
  userResponse: "Para todo",
  tutorResponse: "Correto! ∀ é o quantificador universal",
  metadata: { "correct": true }
})
```

**Parâmetros**:
- `sessionId`: ID da sessão atual (formato: YYYY-MM-DD-HHMMSS)
- `skill`: Nome da skill usada (quiz, feynman, drill, etc.)
- `topic`: Tópico da interação (ex: "símbolos matemáticos", "recursão")
- `userMessage`: Mensagem/pergunta do usuário (máx 200 chars)
- `userResponse`: Resposta do usuário (máx 200 chars)
- `tutorResponse`: Sua resposta (máx 500 chars)
- `metadata`: Objeto JSON com dados extras

**Exemplo**:
```typescript
tutorLog.logInteraction({
  sessionId: SESSION_ID,
  skill: "quiz",
  topic: "símbolos matemáticos",
  userMessage: "O que significa ∀?",
  userResponse: "Para todo",
  tutorResponse: "Correto! ∀ é o quantificador universal",
  metadata: { "correct": true }
})
```

### Opção 2: Via data tool (alternativa)

Se precisar de mais controle, use a **tool `data`**:

```typescript
data.createInteraction({
  sessionId: "2026-03-06-085708",
  skill: "quiz",
  topic: "símbolos matemáticos",
  userMessage: "O que significa ∀?",
  userResponse: "Para todo",
  tutorResponse: "Correto! ∀ é o quantificador universal",
  metadata: { "correct": true }
})
```

⚠️ **Nota**: O script bash `tutor-interaction.sh` foi removido na v2.0. Use as tools TypeScript.

## Formato do CSV

```
id,session_id,skill,topic,user_message,user_response,tutor_response,timestamp,metadata
I20260306085731,2026-03-06-085708,quiz,símbolos matemáticos,"O que significa ∀?","Para todo","Correto! ∀ é o quantificador universal",2026-03-06T08:57:31+01:00,"{"correct":true}"
```

## Exemplos por Keyword

### #quiz
```typescript
tutorLog.logInteraction({
  sessionId: SESSION_ID,
  skill: "quiz",
  topic: "símbolos matemáticos",
  userMessage: "O que significa ∀?",
  userResponse: "Para todo",
  tutorResponse: "Correto! ∀ é o quantificador universal",
  metadata: { "correct": true }
})
```

### #feynman
```typescript
tutorLog.logInteraction({
  sessionId: SESSION_ID,
  skill: "feynman",
  topic: "recursão",
  userMessage: "Explique recursão como para uma criança",
  userResponse: "É quando uma função chama a si mesma",
  tutorResponse: "Boa! E quando ela para?",
  metadata: { "depth_score": 7 }
})
```

### #drill
```typescript
tutorLog.logInteraction({
  sessionId: SESSION_ID,
  skill: "drill",
  topic: "Big O",
  userMessage: "Qual a complexidade de n²?",
  userResponse: "Quadrática",
  tutorResponse: "Correto! Cresce muito rápido",
  metadata: { "correct": true }
})
```

### #debug
```typescript
tutorLog.logInteraction({
  sessionId: SESSION_ID,
  skill: "debug",
  topic: "null pointer",
  userMessage: "Por que recebo NullPointerException?",
  userResponse: "O objeto está null",
  tutorResponse: "Onde você inicializou?",
  metadata: { "found": false }
})
```

## Obter Session ID

O session_id pode ser obtido de:
1. **Variável de ambiente**: `$SESSION_ID` (se definida)
2. **Última sessão**: `tail -1 data/sessions.csv | cut -d',' -f1`
3. **Data atual**: `$(date +%Y-%m-%d-%H%M%S)`

**Recomendado**: Use a última sessão do CSV:
```bash
SESSION_ID=$(tail -1 data/sessions.csv | cut -d',' -f1)
```

## Metadata JSON

O campo `metadata` pode conter:
- `correct`: true/false (para quizzes)
- `time_sec`: tempo de resposta em segundos
- `depth_score`: 1-10 (para feynman)
- `found`: true/false (para debug)
- `attempts`: número de tentativas

**Exemplo**:
```json
{"correct":true,"time_sec":12,"attempts":1}
```

## Consultar Histórico

Para ver interações anteriores, use a **tool `tutor-log`**:

### Por tópico
```typescript
tutorLog.getInteractionsByTopic({
  filterTopic: "símbolos matemáticos",
  limit: 5
})
```

### Por sessão
```typescript
tutorLog.getInteractionsBySession({
  sessionId: "2026-03-06-085708"
})
```

### Últimas interações
```typescript
tutorLog.getRecentInteractions({
  limit: 10
})
```

⚠️ **Nota**: O script bash `tutor-log.sh` foi removido na v2.0. Use a tool TypeScript.

## Benefícios

1. **Memória do tutor**: Consultar interações anteriores
2. **Analytics**: Ver quais tópicos são mais difíceis
3. **Personalização**: Adaptar baseado no histórico
4. **Progresso**: Ver evolução ao longo do tempo

## Checklist

Antes de registrar, verifique:
- [ ] Session ID está correto?
- [ ] Skill está correta?
- [ ] Tópico está claro?
- [ ] Mensagens estão sanitizadas (sem vírgulas/quebras)?
- [ ] Metadata é JSON válido?

## Integração com Agentes

Este skill é chamado automaticamente pelo @tutor quando:
- Usa uma keyword (#quiz, #feynman, #drill, etc.)
- Interação é significativa (> 10 palavras)
- Não é puramente administrativa

O registro é **transparente** para o usuário — ele não precisa fazer nada.
