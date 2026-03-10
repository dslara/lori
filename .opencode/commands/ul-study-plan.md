---
description: Ver progresso da semana e plano atual (/ul-study-plan)
agent: tutor
subtask: false
---

## Uso
/ul-study-plan

## Processo

### Passo 1: Carregar Dados

Invocar tools:
1. `context.getWeekContext` — Plano da semana
2. `context.getRecentSessions` — Sessões recentes
3. `analytics.generateReport` — Métricas gerais
4. `analytics.getErrorRateByTopic` — Tópicos fracos

### Passo 2: Apresentar Progresso

```
📅 Semana [N] — [Módulo Ativo]

Progresso:
✅ [Tópico 1] — Concluído (2h)
🔄 [Tópico 2] — Em andamento (1h)
⏳ [Tópico 3] — Pendente
❌ [Tópico 4] — Não iniciado

⏱️ Tempo total: [X]h
🔥 Streak: [N] dias
📊 Foco médio: [N]/10
```

### Passo 3: Análise de Técnicas

```
📊 Técnicas esta semana:
• drill: 4x
• feynman: 1x
• quiz: 2x
⚠️ Sem uso: /ul-learn-explain, /ul-practice-project

💡 Sugestão: você preferiu drill — tente alternar com 
   feynman para validar compreensão.
```

### Passo 4: Ritmo e Projeção

Calcular:
- **% de entregas concluídas** vs dias passados
- **Se está no tempo**, adiantado ou atrasado
- **Projeção** de conclusão se manter ritmo atual

### Passo 5: Tópicos Fracos

Se error_rate > 0.3 em algum tópico:
```
⚠️ Pontos de atenção:
• [Tópico A]: error_rate 45%
• [Tópico B]: error_rate 38%

💡 Sugestão: usar /ul-practice-drill em [Tópico A]
   antes de avançar para conteúdo novo.
```

### Passo 6: Próximos Passos

Sugerir baseado no estado atual:
- Se atrasado → `/ul-plan-retro` ou `/ul-plan-weekly`
- Se tópicos fracos → `/ul-practice-drill`
- Se SRS pendente → `/ul-memory-review`
- Se no ritmo → Continuar com `/ul-study-start`

## Exemplo de Interação

```
Usuário: /ul-study-plan

Sistema:
"📅 Semana 3 — Progresso (Quinta-feira)
Módulo: go-os-cpu

✅ Conceito: async/await (2h)
✅ Drill: 10 exercícios (1.5h)
🔄 Projeto API: Parte 1 ✅ / Parte 2 em curso (2h)
❌ Benchmark: ainda não feito

⏱️ Tempo total: 5.5h
🔥 Streak: 12 dias
📊 Foco médio: 8/10

📊 Técnicas esta semana:
• drill: 5x | feynman: 1x | quiz: 2x | project: 1x
⚠️ Sem uso: /ul-learn-explain

📈 Ritmo: 60% das entregas em 4/5 dias ✅
Você está no tempo! Sábado é ideal para o benchmark.

⚠️ Pontos de atenção:
• Error handling: error_rate 42%

💡 Sugestões:
1. Praticar error handling → /ul-practice-drill
2. Validar com feynman antes do benchmark → /ul-practice-feynman
3. Criar flashcards para padrões de erro → /ul-memory-create"
```

## Integrações

**Tools utilizadas:**
- `context.getWeekContext` — Plano da semana
- `context.getRecentSessions` — Histórico
- `analytics.generateReport` — Métricas gerais
- `analytics.getErrorRateByTopic` — Tópicos fracos
- `analytics.getMostUsedSkill` — Distribuição de técnicas

**Commands relacionados:**
- `/ul-study-start` — Iniciar sessão
- `/ul-practice-drill` — Praticar tópicos fracos
- `/ul-memory-review` — Revisar SRS pendente
- `/ul-plan-retro` — Ajustar se atrasado
- `/ul-plan-weekly` — Replanejar semana

## Handoff

- Usuário atrasado → `/ul-plan-retro` ou `/ul-plan-weekly`
- Tópicos fracos identificados → `/ul-practice-drill`
- Quer mudar ritmo → `/ul-plan-weekly`
- Tudo certo → `/ul-study-start`

---

*Command: /ul-study-plan — Visão geral do progresso semanal*
