---
description: Introduzir conceito novo com analogias
agent: tutor
model: opencode-go/kimi-k2.5
---

$ARGUMENTS (conceito a explicar, opcional)

## Descrição

Introduz conceito novo usando analogias do mundo real e exemplos mínimos. Diferente de `/ul-study-feynman` (onde usuário explica), aqui o sistema introduz.

## Processo

1. **Validar entrada** — Se não houver conceito no argumento, perguntar qual conceito deseja aprender.
2. **Verificar pré-requisitos** — Perguntar brevemente se o usuário já conhece os fundamentos necessários para calibrar a explicação.
3. **Explicar com analogia** — Usar analogia do mundo real (ex: closure = mochila com variáveis, recursão = bonecas russas).
4. **Exemplo de código mínimo** — Apresentar e explicar linha a linha.
5. **Casos de uso** — Mostrar 3-4 aplicações práticas do conceito.
6. **Testar compreensão** — Uma pergunta rápida para validar entendimento.
7. **Sugerir próximos passos** — Baseado na compreensão demonstrada.

## Argumento

- `conceito`: Conceito a aprender (opcional — será perguntado se não fornecido)

## Handoff

- Analogia ficou clara → `/ul-study-feynman` para validar
- Quer praticar → `/ul-study-drill`
- Quer usar em projeto → `/ul-study-project`
- Terminou estudo → `/ul-study-end`