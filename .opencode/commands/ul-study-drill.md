---
description: Prática deliberada - repetir procedimento 5-10x
agent: tutor
---

$ARGUMENTS (conceito e variações a praticar, opcional)

## Descrição

Repetir procedimento específico 5-10 vezes até automatizar. Foca em velocidade, precisão e execução de memória.

## Processo

### 1. Contexto OpenViking (pré-execução)

```
context-hybrid.getCurrentModule
context-hybrid.getSRSPending
memsearch({ query: "drills anteriores padrões erro", target_uri: "viking://user/", mode: "auto", limit: 5 })
```

### 2. Execução Principal

1. **Identificar skill** — Perguntar que procedimento foi lento ou que vai usar muitas vezes. Critérios: usa 10+ vezes no futuro, tem "jeito certo", <10 min/repetição, output verificável.
2. **Definir variações** — 5-10 variações do mesmo procedimento (ex: para recursão — fibonacci, factorial, soma de array, busca binária, merge, palíndromo, etc.).
3. **Executar cronometrando** — Sem consultar anotações, anotar erros por tentativa, repetir até acertar. Máximo 10 min por variação.
4. **Analisar padrões** — Erro mais comum, tempo médio (diminuiu?), confiança (consegue fazer sem pensar?).
5. **Consolidar** — Se ainda erra frequentemente → invocar `data.createFlashcard` para criar flashcard do padrão de erro, sugerir `/ul-study-feynman`. Se automatizou → parabenizar, documentar tempo final, sugerir próximo drill.

### 3. Persistência (pós-execução)

```
resource.mkdir({ uri: "viking://resources/ultralearning/projects/{id}/knowledge/" })
resource.write({
  uri: "viking://resources/ultralearning/projects/{id}/knowledge/patterns.md",
  content: "## Drill: [skill] - [data]\n\nPadrão de erro detectado: [descrição]\nTempo final: [tempo]\n\n",
  mode: "append"
})
resource.link({
  from: "viking://resources/ultralearning/projects/{id}/knowledge/patterns.md",
  to: "viking://resources/ultralearning/projects/{id}/",
  reason: "padrões de erro do projeto"
})
memcommit({ wait: false })
```

## Argumento

- `conceito`: Procedimento ou conceito a praticar (opcional — será perguntado se não fornecido)

## Handoff

- Ainda errando → `/ul-study-memorize` ou `/ul-study-feynman`
- Conseguiu automatizar → `/ul-study-end` ou novo drill
- Travou em conceito → `/ul-study-learn`