---
description: Arquivar módulo finalizado
agent: meta
model: opencode-go/glm-5
---

$1 (nome ou ID do módulo)

## Descrição

Arquiva módulo completo, marca como finalizado e cria template de relatório. Ação irreversível.

## Processo

1. **Validar entrada** — Se `$1` vazio, pedir nome ou ID do módulo.
2. **Confirmar arquivamento** — Mostrar resumo do módulo (nome, ID, data de início, horas) e avisar que é irreversível. Pedir confirmação explícita.
3. **Executar arquivamento** — Invocar `data.archiveModule` com `moduleName: $1`. A tool copia projeto para `archived/`, cria `relatorio-final.md`, marca status como `completed` no CSV.
4. **Preencher relatório** — Usar template @.opencode/templates/_template-relatorio.md como referência para o relatório final.
5. **Apresentar resultado** — Caminho do archive, módulo ID, template de relatório criado. Sugerir preencher relatório.

## Argumento

- `$1`: Nome ou ID do módulo a arquivar (obrigatório)

## Handoff

- Preencher relatório → editar `relatorio-final.md` no projeto arquivado
- Criar novo módulo → `/ul-module-create`
- Alternar módulo → `/ul-module-switch`