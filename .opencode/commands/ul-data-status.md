---
description: Ver status atual - streak, sessões, módulo
agent: tutor
model: opencode-go/minimax-m2.5
subtask: true
---

## Descrição

Mostra status atual de estudo: streak, recorde, total de sessões, módulo ativo e data da última sessão.

## Processo

1. **Verificar dados existentes** — Checar `!`ls data/*.csv 2>/dev/null | wc -l`` para confirmar que dados existem. Se 0, sugerir `/ul-data-manage init`
2. **Perfil** — `memread` com URI `viking://user/memories/profile.md` nível `read`
3. **Sessões recentes** — `memsearch` com query `"sessões de estudo recentes"`, `limit: 5`
4. **Métricas** — `memsearch` com query `"streak métricas estudo"`, `limit: 3`
5. **Apresentar** — Streak atual, recorde, total de sessões, módulo ativo, data da última sessão. Celebrar streaks bons, encorajar se inativo.

## Handoff

- Iniciar sessão → `/ul-study-start`
- Ver relatório detalhado → `/ul-data-analytics`