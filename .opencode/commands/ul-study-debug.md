---
description: Debug socrático - guia para encontrar bugs (/ul-study-debug)
agent: tutor
model: opencode-go/kimi-k2.5
---

Argumentos recebidos: $ARGUMENTS (descrição do bug)

## Uso
/ul-study-debug [descrição do bug]

## Descrição

Guia socrático para encontrar bugs através de perguntas, não respostas. Delega para a skill `debug-socratic` que implementa o processo de 4 etapas.

## Processo

1. Carregar contexto: `context-hybrid.getFullContext` para obter módulo atual e sessões recentes
2. Carregar skill `debug-socratic` e seguir processo definido nela
3. A skill conduzirá a investigação socraticamente — nunca revele a solução diretamente
4. Ao finalizar, usar `memcommit` com `wait: true` para persistir aprendizado do debug

## Argumento

- `$ARGUMENTS` vazio → perguntar qual é o bug
- `$ARGUMENTS` preenchido → usar como descrição inicial do problema

## Quando Usar

- Bug que não encontra
- Erro de compilação/run-time
- Comportamento inesperado
- Teste falhando sem motivo aparente

## Integrações

- Skill: `debug-socratic` — processo socrático de 4 etapas
- Tool: `context-hybrid.getFullContext` — contexto do módulo
- `/ul-study-feynman` — consolidar entendimento após resolver bug
- `/ul-study-drill` — praticar padrão identificado