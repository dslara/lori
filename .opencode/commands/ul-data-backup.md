---
description: Criar backup dos dados
agent: tutor
model: opencode-go/minimax-m2.5
subtask: true
---

## Descrição

Cria backup completo dos dados CSV via tool dedicada e exibe resultado.

## Processo

1. **Verificar tamanho atual** — Mostrar `!`du -sh data/ 2>/dev/null`` para contexto antes do backup
2. **Criar backup** — Invocar `data.createBackup` para gerar backup completo
3. **Apresentar resultado** — Caminho do backup, tamanho, número de arquivos, data/hora
4. **Instruções de restauração** — Mostrar comando de restauração se necessário

## Handoff

- Restaurar → `/ul-data-manage` com operação de restauração
- Antes de reset → `/ul-data-manage reset` (sempre faça backup antes)