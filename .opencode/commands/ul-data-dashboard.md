---
description: Ver dashboard completo com métricas
agent: tutor
model: opencode/minimax-m2.5-free
subtask: true
---

$1 (semana|mês, opcional)

## Descrição

Exibe dashboard completo com métricas de aprendizado: streak, sessões, técnicas mais efetivas, padrões de estudo e pontos fracos.

## Processo

1. **Obter métricas** — Invocar `insights.showDashboard` para obter métricas consolidadas
2. **Apresentar métricas** — Organizadas por: streak, efetividade por técnica, padrões de estudo, pontos fracos
3. **Recomendações** — Baseadas nos dados: pontos fracos → `/ul-study-drill`, técnica subutilizada → sugerir alternativa
4. **Comparação** — Se usuário pedir, invocar `insights.comparePeriods` com período `week` ou `month`

## Argumento

- `$1`: Período — `semana` ou `mês` para comparar períodos (opcional — semana atual se vazio)

## Handoff

- Pontos fracos → `/ul-study-drill`
- Mais detalhes → `/ul-data-analytics`
- Ajustar plano → `/ul-plan-adjust`