---
description: Ver dashboard completo com métricas (/ul-data-dashboard)
agent: tutor
model: opencode-go/minimax-m2.5
---

## Uso
/ul-data-dashboard [semana|mes]

## Descrição

Exibe dashboard completo com todas as métricas de aprendizado: streak, sessões, técnicas mais efetivas, padrões de estudo e pontos fracos identificados.

## Argumento

- `$ARGUMENTS` vazio → dashboard da semana atual
- `$ARGUMENTS` contém "semana" → dashboard semanal
- `$ARGUMENTS` contém "mes" ou "mês" → dashboard mensal

## Processo

### Passo 1: Carregar Dashboard

Invocar `insights.showDashboard` para obter métricas consolidadas.

### Passo 2: Apresentar Métricas

Organizar em seções visuais:

```
📊 Dashboard de Aprendizado

🔥 Streak: [N] dias (recorde: [M] dias)
 totalTime: [X]h [Y]min
 totalSessions: [N]

📈 Efetividade por Técnica
• drill: [X]% efetivo ([N] sessões)
• feynman: [X]% efetivo ([N] sessões)
• project: [X]% efetivo ([N] sessões)
⚠️ Técnica menos usada: [técnica]

🧠 Padrões de Estudo
• Melhor período: [horário]
• Duração ideal: [X] minutos
• Dia mais produtivo: [dia]

🎯 Pontos Fracos
• [Tópico A]: error_rate [X]%
• [Tópico B]: error_rate [X]%
```

### Passo 3: Recomendações

Baseado nos dados, sugerir:
- Se pontos fracos → atacar primeiro com `/ul-study-drill`
- Se melhor período identificado → agendar sessões difíceis nesse horário
- Se duração ideal encontrada → otimizar tamanho da sessão
- Se técnica subutilizada → tentar essa técnica

### Passo 4: Comparação (se solicitado)

Se usuário pedir comparação, invocar `insights.comparePeriods` com período `week` ou `month`.

```
📊 Comparação semanal:

Semana passada → Esta semana
• Streak: 5 dias → 8 dias (+3)
• Foco médio: 6.5 → 8.0 (+1.5)
• Sessões: 4 → 6 (+2)

📈 Tendência: Melhorando ✅
```

## Quando Usar

✅ **USE para:**
- Ver visão geral do progresso
- Identificar padrões de estudo
- Descobrir pontos fracos
- Comparar períodos

❌ **NÃO USE para:**
- Status rápido → `/ul-data-status`
- Analytics detalhado → `/ul-data-analytics`
- Iniciar sessão → `/ul-study-start`

## Integrações

**Tools utilizadas:**
- `insights.showDashboard` — Gera dashboard visual consolidado
- `insights.comparePeriods` — Compara com período anterior (se solicitado)

**Commands relacionados:**
- `/ul-data-status` — Status rápido
- `/ul-data-analytics` — Relatório detalhado
- `/ul-study-start` — Iniciar sessão baseado em sugestões
- `/ul-plan-retro` — Retrospectiva semanal

## Handoff

- Pontos fracos identificados → `/ul-study-drill`
- Quer ver mais detalhes → `/ul-data-analytics`
- Precisa ajustar plano → `/ul-plan-adjust`
- Tudo certo → `/ul-study-start`