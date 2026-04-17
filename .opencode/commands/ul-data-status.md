---
description: Ver status atual - streak, sessões, módulo
agent: tutor
model: opencode/minimax-m2.5-free
subtask: true
---

## Descrição

Mostra status atual de estudo: streak, recorde, total de sessões, módulo ativo e data da última sessão.

## Processo

### 1. Contexto OpenViking (pré-execução)

```
context-hybrid.getCurrentModule
context-hybrid.getFullContext
status.getStatus
```

### 2. Execução Principal

1. **Verificar dados existentes** — Checar `!`ls data/*.csv 2>/dev/null | wc -l`` para confirmar que dados existem. Se 0, sugerir `/ul-data-manage init`
2. **Perfil** — `memread` com URI `viking://user/memories/profile.md` nível `abstract` (escalar para `overview` ou `read` se necessário)
3. **Sessões recentes** — `memsearch` com query `"sessões de estudo recentes"`, `target_uri: "viking://user/"`, `mode: "auto"`, `limit: 5`
4. **Métricas** — `memsearch` com query `"streak métricas estudo"`, `target_uri: "viking://user/"`, `mode: "auto"`, `limit: 3`
5. **Apresentar via status.formatStatus** — Streak atual, recorde, total de sessões, módulo ativo, data da última sessão. Celebrar streaks bons, encorajar se inativo.

## Handoff

- Iniciar sessão → `/ul-study-start`
- Ver relatório detalhado → `/ul-data-analytics`