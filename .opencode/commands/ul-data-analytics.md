---
description: Ver relatório analítico avançado
agent: tutor
model: opencode-go/minimax-m2.5
subtask: true
---

## Descrição

Gera relatório analítico com métricas de desempenho, padrões de estudo e recomendações personalizadas.

## Processo

1. **Insights agregados** — `memread` com URI `viking://user/memories/insights.md` nível `read`
2. **Padrões** — `memsearch` com query `"padrões de estudo"`, `limit: 10`
3. **Pontos fracos** — `memsearch` com query `"padrões de erro tópicos fracos"`, `limit: 5`
4. **Sessões** — `memsearch` com query `"sessões recentes desempenho"`, `limit: 20`
5. **Apresentar** — Por seção: métricas gerais, estatísticas do módulo atual, progresso SRS, habilidades e técnicas, desempenho por tópico, padrões de estudo. Sugerir próximos passos baseados nos dados.

## Handoff

- Status rápido → `/ul-data-status`
- Ver plano → `/ul-study-plan`