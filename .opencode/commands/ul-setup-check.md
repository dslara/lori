---
description: Verificar dependências do sistema
agent: tutor
model: opencode-go/minimax-m2.5
subtask: true
---

## Descrição

Verifica se todas as dependências do Ultralearning System estão instaladas e funcionando.

## Processo

1. **Verificar versões atuais** — Checar output de `!`bun --version`` e `!`opencode --version`` para confirmar versões instaladas
2. **Verificar dependências obrigatórias** — opencode (0.5.0+), bun (1.0.0+)
3. **Verificar dependências opcionais** — jq (processamento JSON), bc (cálculos SRS)
4. **Para cada uma** — Checar instalação, obter versão, testar execução básica
5. **Gerar relatório** — ✓ instalado, ⚠ com problemas, ✗ não instalado. Para cada problema, sugerir comando de instalação
6. **Usar tool** — Invocar `setup.checkDependencies`

## Handoff

- Tudo OK → `/ul-module-create` para criar primeiro módulo
- Problemas encontrados → instalar dependências faltantes e reexecutar