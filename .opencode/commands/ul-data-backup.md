---
description: Criar backup dos dados
agent: tutor
model: opencode/minimax-m2.5-free
subtask: true
---

## Descrição

Cria backup completo dos dados CSV via tool dedicada e exibe resultado.

## Processo

### 1. Contexto OpenViking (pré-execução)

```
context-hybrid.getCurrentModule
```

### 2. Execução Principal

1. **Verificar tamanho atual** — Mostrar `!`du -sh data/ 2>/dev/null`` para contexto antes do backup
2. **Criar backup CSV** — Invocar `data.createBackup` para gerar backup completo dos dados estruturados
3. **Criar backup OpenViking** — Invocar `resource.export` para exportar subtree do módulo atual:
   ```
   resource.export({
     uri: "viking://resources/ultralearning/projects/{id}/",
     to: "backup/ultralearning-ov-{timestamp}.zip",
     recursive: true
   })
   ```
4. **Apresentar resultado** — Caminho dos backups (CSV + OVPack), tamanhos, número de arquivos, data/hora
5. **Instruções de restauração** — Mostrar comandos de restauração para ambos os formatos:
   - CSV: via `data` tools
   - OVPack: via `resource.import`

## Handoff

- Restaurar → `/ul-data-manage` com operação de restauração
- Antes de reset → `/ul-data-manage reset` (sempre faça backup antes)