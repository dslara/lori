---
description: Gerenciar dados - inicializar, resetar
agent: tutor
model: opencode-go/kimi-k2.5
---

$1 (init|reset)

## Descrição

Comando de gerenciamento de dados para o Sistema Ultralearning. Inicializa estrutura ou reseta todos os dados.

## Processo

1. **Identificar operação** — Se `$1` vazio, perguntar qual operação deseja realizar
2. **Executar operação**:
   - `init` — Invocar `data.initDataDir` para criar estrutura de dados CSV
   - `reset` — ⚠️ Confirmar com usuário (irreversível). Opcionalmente criar backup via `data.createBackup`. Invocar `data.resetAllData`
3. **Reportar resultado** — Mostrar resultado da operação

## Argumento

- `$1`: Operação — "init" para inicializar, "reset" para resetar todos os dados (requer confirmação)

## Handoff

- Inicializado → `/ul-module-create` para criar primeiro módulo
- Resetado → `/ul-setup-check` para verificar dependências