---
description: Debug socrático - guia para encontrar bugs
agent: tutor
model: opencode-go/kimi-k2.5
---

$ARGUMENTS (descrição do bug, opcional)

## Descrição

Guia socrático para encontrar bugs através de perguntas, não respostas. Delega para a skill `debug-socratic` que implementa o processo de 4 etapas.

## Processo

1. **Carregar contexto** — Invocar `context-hybrid.getFullContext` para obter módulo atual e sessões recentes
2. **Carregar skill** — Carregar skill `debug-socratic` e seguir processo definido nela
3. **Investigar socraticamente** — A skill conduzirá a investigação — nunca revele a solução diretamente
4. **Persistir** — Ao finalizar, usar `memcommit` com `wait: true` para persistir aprendizado do debug

## Argumento

- `descrição`: Descrição do bug (opcional — será perguntado se não fornecido)

## Handoff

- Bug resolvido → `/ul-study-feynman` para consolidar entendimento
- Precisa praticar padrão → `/ul-study-drill`
- Sessão completa → `/ul-study-end`