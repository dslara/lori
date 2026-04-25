---
description: Encerrar sessão, salvar progresso e atualizar plano semanal (/ul-study-end)
agent: tutor
model: opencode-go/minimax-m2.5
---

## Uso
/ul-study-end

## Descrição

Finaliza sessão de estudo com reflexão estruturada, salva progresso, atualiza streak e sugere próximos passos baseado no desempenho.

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
3. `insights.generateReport` — Atualiza métricas consolidadas
4. *(built-in)* `logTutorInteraction` — Registra interação

**Dados salvos:**
- moduleId
- duration (minutos)
- focusScore (1-10)
- notes (resumo do aprendizado)
- técnicas utilizadas

### Passo 4: Atualização do Plano Semanal (Opcional)

**Perguntar ao usuário:**
```
"📋 Atualizar Plano da Semana?

Você completou alguma entrega hoje?

1. Sim — Projeto: [nome]
2. Sim — Drill/Exercícios
3. Sim — SRS/Flashcards
4. Não — Só estudo de conteúdo
5. Pular atualização"
```

**Se usuário completou entrega:**
1. Determinar semana atual (baseado em `week-*.md` existente)
2. Atualizar arquivo `week-{N}.md`:
   - Marcar checkbox correspondente: `[x]`
   - Adicionar nota de progresso com data
   - Registrar tempo gasto

**Exemplo de atualização:**
```markdown
## ✅ Entregas da Semana
- [x] Projeto: API REST        ← completado em 2026-03-12
- [x] Drill: 10 exercícios     ← 8/10 (60 min)
- [ ] SRS: 20 cards novos      ← em andamento
- [ ] Benchmark: 80% sucesso   ← ainda não feito

## 📝 Notas de Progresso
- 2026-03-12: Finalizado autenticação JWT no projeto. 
  Tempo: 45 min de codificação + 15 min de testes.
```

**Se não completou entrega:**
- Pular etapa sem salvar nada no plano
- Continuar para consolidação

### Passo 5: Consolidação

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

### Passo 6: Check de Domingo

Se for domingo:
```
📅 Hoje é domingo — fim de semana!
→ /ul-retro-weekly para revisar a semana
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

📋 Atualizar Plano da Semana?
Você completou alguma entrega hoje?"

Usuário: "Sim — finalizei o projeto de recursão"

Sistema:
"✅ Sessão Salva!
✅ Plano atualizado — Projeto: Recursão marcado como completo

📊 Resumo:
• Duração: 60 minutos
• Foco: 8/10
• Técnicas: drill, practice
• Streak: 🔥 15 dias
• Entrega: Projeto de recursão ✓

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
- `insights.generateReport` — Atualiza métricas consolidadas
- `context.getWeekContext` — Obtém plano da semana atual
- `utils-csv.logTutorInteraction` — Registra automaticamente

**Commands relacionados:**
- `/ul-study-start` — Iniciar nova sessão
- `/ul-memory-create` — Criar flashcards para gaps
- `/ul-retro-weekly` — Retrospectiva semanal (domingos)
- `/ul-plan-adjust` — Ajustar cronograma se necessário

## Handoff

- Usuário quer criar flashcard → `/ul-memory-create`
- Usuário quer mais prática → `/ul-practice-drill`
- Domingo → Sugerir `/ul-retro-weekly`
- Plano precisa de ajustes maiores → `/ul-plan-adjust`

---

*Command: /ul-study-end — Consolidação, persistência e atualização de plano*
