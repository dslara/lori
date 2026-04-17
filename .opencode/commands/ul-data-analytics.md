---
description: Ver relatório analítico avançado
agent: tutor
model: opencode/minimax-m2.5-free
subtask: true
---

## Descrição

Gera relatório analítico com métricas de desempenho, padrões de estudo e recomendações personalizadas.

## Processo

### 1. Contexto OpenViking (pré-execução)

```
context-hybrid.getCurrentModule
context-hybrid.getFullContext
insights.generateReport
```

### 2. Execução Principal

1. **Insights agregados** — `memread` com URI `viking://user/memories/insights.md` nível `abstract` (escalar se necessário)
2. **Padrões** — Preferir `insights.getPatterns`. Fallback: `memsearch` com query `"padrões de estudo"`, `target_uri: "viking://user/"`, `mode: "auto"`, `limit: 10`
3. **Pontos fracos** — Preferir `insights.getWeaknesses`. Fallback: `memsearch` com query `"padrões de erro tópicos fracos"`, `target_uri: "viking://user/"`, `mode: "auto"`, `limit: 5`
4. **Sessões** — `memsearch` com query `"sessões recentes desempenho"`, `target_uri: "viking://user/"`, `mode: "auto"`, `limit: 20`
5. **Apresentar** — Por seção: métricas gerais, estatísticas do módulo atual, progresso SRS, habilidades e técnicas, desempenho por tópico, padrões de estudo. Sugerir próximos passos baseados nos dados.

## Handoff

- Status rápido → `/ul-data-status`
- Ver plano → `/ul-study-plan`