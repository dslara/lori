---
description: Alternar módulo ativo
agent: meta
model: opencode-go/glm-5
---

$1 (nome ou ID do módulo, opcional)

## Descrição

Lista módulos disponíveis ou ativa um módulo específico como atual.

## Processo

1. **Sem argumento** — Invocar `data.switchModule` sem moduleName para listar módulos com status. Apresentar módulos disponíveis e qual está ativo.
2. **Com argumento** — Invocar `data.switchModule` com `moduleName: $1`. Apresentar confirmação: módulo anterior → novo ativo.
3. **Se erro MODULE_NOT_FOUND** — Mostrar módulos disponíveis e pedir nome válido.

## Argumento

- `$1`: Nome ou ID do módulo a ativar (opcional — lista módulos se vazio)

## Handoff

- Módulo ativado → `/ul-study-start` para iniciar sessão
- Ver plano → `/ul-study-plan`
- Criar novo módulo → `/ul-module-create`