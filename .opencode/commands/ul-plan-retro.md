---
description: Criar retrospectiva semanal
agent: meta
---

## Descrição

Cria retrospectiva semanal com estatísticas automáticas do módulo ativo. Coleta reflexão guiada e salva arquivo via OpenViking.

## Processo

### 1. Contexto OpenViking (pré-execução)

```
context-hybrid.getCurrentModule
context-hybrid.getWeekContext
retro.getWeeklyStats
```

### 2. Execução Principal

1. **Coletar estatísticas** — Invocar `memsearch` (query: "sessões últimos 7 dias", `target_uri: "viking://user/"`, `mode: "auto"`, limit: 50) para buscar sessões da semana. Invocar `memread` (uri: `viking://user/memories/profile.md`, level: "overview") para perfil. Invocar `memsearch` (query: "métricas foco streak", `target_uri: "viking://user/"`, `mode: "auto"`, limit: 5) para insights. Coletar: sessões da semana, tempo total, foco médio, comparação com meta.
2. **Perguntas guiadas** — (1) O que funcionou? (2) O que não funcionou? (3) Foco da próxima semana?
3. **Criar arquivo de retro** — Determinar número da semana via `resource.tree` em `viking://resources/ultralearning/projects/{id}/retros/`. Incluir: estatísticas automáticas + respostas do usuário.

### 3. Persistência (pós-execução)

```
resource.mkdir({ uri: "viking://resources/ultralearning/projects/{id}/retros/" })
resource.write({
  uri: "viking://resources/ultralearning/projects/{id}/retros/retro-week-{n}.md",
  content: "<conteúdo completo da retrospectiva>",
  mode: "replace"
})
resource.link({
  from: "viking://resources/ultralearning/projects/{id}/retros/retro-week-{n}.md",
  to: "viking://resources/ultralearning/projects/{id}/",
  reason: "retrospectiva do projeto"
})
retro.createRetro
memcommit({ wait: false })
```

4. **Oferecer próximos passos** — Sugerir `/ul-plan-weekly`, `/ul-study-recall`, ou `/ul-study-start`.

## Handoff

- Retro concluída → `/ul-plan-weekly` para planejar próxima semana
- Muito abaixo da meta → Considerar `/ul-plan-decompose` para reestruturar
- Revisar flashcards → `/ul-study-recall`