---
description: Encerrar sessão e salvar progresso (/ul-study-end)
agent: tutor
subtask: false
---

## Uso
/ul-study-end

## Processo

### Passo 1: Reflexão Estruturada (3-5 min)

**Perguntas:**
1. O que você aprendeu/praticou hoje? (1 frase)
2. Qual foi o maior desafio?
3. O que ainda está confuso? (se aplicável)
4. Nota de foco: ___/10
5. Qual sua confiança no tópico? ___/10

### Passo 2: Análise de Gaps

Com base nas respostas:
- **Se confiança < 7** → Sugerir criar flashcard (`/ul-memory-create`)
- **Se desafio recorrente** → Sugerir mais prática (`/ul-practice-drill`)
- **Se foco < 5** → Sugerir técnica pomodoro ou pausa

### Passo 3: Persistência Automática

Invocar tools:
1. `data.createSession` — Cria registro da sessão
2. `data.updateStreak` — Atualiza streak
3. `analytics.generateReport` — Atualiza métricas
4. *(built-in)* `logTutorInteraction` — Registra interação

**Dados salvos:**
- moduleId
- duration (minutos)
- focusScore (1-10)
- notes (resumo do aprendizado)
- técnicas utilizadas

### Passo 4: Consolidação

Apresentar resumo:
```
✅ Sessão Salva!

📊 Resumo:
• Duração: [X] minutos
• Foco: [N]/10
• Técnicas: [lista]
• Streak: 🔥 [N] dias

💡 Recomendações:
• [Sugestão baseada nas respostas]
• Próxima sessão: [sugestão]
```

### Passo 5: Check de Domingo

Se for domingo:
```
📅 Hoje é domingo — fim de semana!
→ /ul-plan-retro para revisar a semana
```

## Exemplo de Interação

```
Usuário: /ul-study-end

Sistema:
"Vamos consolidar! O que você fez hoje?"

Usuário: "Foquei 8/10, aprendi recursão e memoization"

Sistema:
"Excelente! Algum desafio específico?"

Usuário: "Memoization ainda está confusa"

Sistema:
"Entendido. Vamos salvar:

✅ Sessão Salva!

📊 Resumo:
• Duração: 60 minutos
• Foco: 8/10
• Técnicas: drill, practice
• Streak: 🔥 15 dias

💡 Recomendações:
• Criar flashcard sobre memoization → /ul-memory-create
• Praticar mais casos de memoization → /ul-practice-drill memoization

📅 Próxima sessão: Quarta-feira (amanhã)
   Sugestão: Continuar memoization antes de avançar"
```

## Integrações

**Tools utilizadas:**
- `data.createSession` — Salva sessão
- `data.updateStreak` — Atualiza streak
- `analytics.generateReport` — Atualiza métricas
- `utils-csv.logTutorInteraction` — Registra automaticamente

**Commands relacionados:**
- `/ul-study-start` — Iniciar nova sessão
- `/ul-memory-create` — Criar flashcards para gaps
- `/ul-plan-retro` — Retrospectiva semanal (domingos)

## Handoff

- Usuário quer criar flashcard → `/ul-memory-create`
- Usuário quer mais prática → `/ul-practice-drill`
- Domingo → Sugerir `/ul-plan-retro`
- Usuário atrasado → Sugerir `/ul-plan-weekly` para ajustar

---

*Command: /ul-study-end — Consolidação e persistência de sessão*
