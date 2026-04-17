---
description: Ver progresso da semana e plano atual
agent: tutor
model: opencode/minimax-m2.5-free
---

## Descrição

Visualiza progresso da semana atual: tópicos concluídos, em andamento e pendentes, análise de técnicas e sugestões de ajuste.

## Processo

### 1. Contexto OpenViking (pré-execução)

```
context-hybrid.getCurrentModule
context-hybrid.getWeekContext
resource.glob({ pattern: "**/week-*.md", path: "viking://resources/ultralearning/projects/{id}/plans/" })
```

### 2. Execução Principal

1. **Carregar dados** — Invocar `memread` com URI `viking://user/projects/[module]/meta/week-*.md` nível `abstract` (plano), `memsearch` com query `"sessões recentes semana atual"`, `target_uri: "viking://user/"`, `mode: "auto"` (sessions), `memread` com URI `viking://user/memories/insights.md` nível `abstract` (métricas), `memsearch` com query `"padrões de erro tópicos fracos"`, `target_uri: "viking://user/"`, `mode: "auto"` (weak spots)
2. **Apresentar progresso** — Listar tópicos com status (✅ concluído / 🔄 em andamento / ⏳ pendente / ❌ não iniciado) mais tempo total, streak, foco médio
3. **Analisar técnicas** — Contar uso de cada técnica (drill, feynman, quiz, project) e sugerir alternância se desequilibrado
4. **Calcular ritmo** — % de entregas concluídas vs dias passados; informar se no tempo, adiantado ou atrasado
5. **Identificar pontos fracos** — Tópicos com alto error_rate; sugerir drill antes de avançar
6. **Sugerir próximos passos** — Baseado no estado atual

### 3. Persistência

```
memcommit({ wait: false })
```

## Handoff

- Atrasado → `/ul-plan-retro` ou `/ul-plan-weekly`
- Tópicos fracos → `/ul-study-drill`
- SRS pendente → `/ul-study-recall`
- No ritmo → `/ul-study-start`