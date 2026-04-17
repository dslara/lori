---
description: Introduzir conceito novo com analogias
agent: tutor
---

$ARGUMENTS (conceito a explicar, opcional)

## Descrição

Introduz conceito novo usando analogias do mundo real e exemplos mínimos. Diferente de `/ul-study-feynman` (onde usuário explica), aqui o sistema introduz.

## Processo

### 1. Contexto OpenViking (pré-execução)

```
context-hybrid.getCurrentModule
context-hybrid.getSRSPending
memsearch({ query: "conceitos relacionados [tema]", target_uri: "viking://user/", mode: "auto" })
memsearch({ query: "analogias explicação", target_uri: "viking://resources/ultralearning/", mode: "auto" })
```

### 2. Execução Principal

1. **Validar entrada** — Se não houver conceito no argumento, perguntar qual conceito deseja aprender.
2. **Verificar pré-requisitos** — Perguntar brevemente se o usuário já conhece os fundamentos necessários para calibrar a explicação.
3. **Explicar com analogia** — Usar analogia do mundo real (ex: closure = mochila com variáveis, recursão = bonecas russas).
4. **Exemplo de código mínimo** — Apresentar e explicar linha a linha.
5. **Casos de uso** — Mostrar 3-4 aplicações práticas do conceito.
6. **Testar compreensão** — Uma pergunta rápida para validar entendimento.
7. **Sugerir próximos passos** — Baseado na compreensão demonstrada.

### 3. Persistência (pós-execução)

```
resource.mkdir({ uri: "viking://resources/ultralearning/projects/{id}/knowledge/" })
resource.write({
  uri: "viking://resources/ultralearning/projects/{id}/knowledge/analogies.md",
  content: "## [Conceito] - [Data]\n\n[analogia criada]\n\n",
  mode: "append"
})
resource.link({ from: "viking://resources/ultralearning/projects/{id}/knowledge/analogies.md", to: "viking://resources/ultralearning/projects/{id}/", reason: "analogias do projeto" })
memcommit({ wait: false })
```

## Argumento

- `conceito`: Conceito a aprender (opcional — será perguntado se não fornecido)

## Handoff

- Analogia ficou clara → `/ul-study-feynman` para validar
- Quer praticar → `/ul-study-drill`
- Quer usar em projeto → `/ul-study-project`
- Terminou estudo → `/ul-study-end`