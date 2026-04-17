---
description: Validar compreensão explicando para criança de 12 anos
agent: tutor
---

$ARGUMENTS (conceito a validar, opcional)

## Descrição

Técnica de Feynman: explicar conceito em linguagem simples, como se ensinasse uma criança de 12 anos. Se não consegue simplificar, não entendeu de verdade.

## Processo

### 1. Contexto OpenViking (pré-execução)

```
context-hybrid.getCurrentModule
memsearch({ query: "analogias explicações", target_uri: "viking://resources/ultralearning/", mode: "auto", limit: 5 })
```

### 2. Execução Principal

1. **Validar entrada** — Se não houver conceito no argumento, perguntar qual conceito deseja validar.
2. **Pedir explicação** — Usuário explica o conceito sem jargões, usando analogias do dia a dia, em no máximo 3 parágrafos.
3. **Analisar explicação** — Procurar: jargões não explicados, saltos lógicos, vagueza, circularidade. Usar perguntas socráticas: "o que quis dizer com X?", "por que funciona assim?", "pode dar um exemplo real?".
4. **Guiar simplificação** — Ajudar a substituir jargões por analogias concretas (recursão = bonecas russas, callback = deixar recado, promise = pedido em restaurante).
5. **Validar** — Pedir ao usuário que explique novamente usando a analogia. Critérios: sem jargões, exemplo concreto, explica o porquê, criança entenderia. Se não atende → repetir passo 4.
6. **Salvar** — Se validado, invocar `data.createFlashcard` para criar flashcard da analogia.

### 3. Persistência (pós-execução)

```
resource.mkdir({ uri: "viking://resources/ultralearning/projects/{id}/knowledge/" })
resource.write({
  uri: "viking://resources/ultralearning/projects/{id}/knowledge/analogies.md",
  content: "## Feynman: [conceito] - [data]\n\nAnalogia criada: [analogia]\nExplicação: [explicação simplificada]\n\n",
  mode: "append"
})
resource.link({
  from: "viking://resources/ultralearning/projects/{id}/knowledge/analogies.md",
  to: "viking://resources/ultralearning/projects/{id}/",
  reason: "analogias do projeto"
})
memcommit({ wait: false })
```

## Argumento

- `conceito`: Conceito a validar (opcional — será perguntado se não fornecido)

## Handoff

- Não consegue simplificar → `/ul-study-learn` para aprender melhor
- Explicação boa → `/ul-study-drill` para automatizar
- Analogia perfeita → `/ul-study-memorize` para salvar
- Validado → `/ul-study-end` ou novo conceito