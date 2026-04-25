---
description: Arquivar módulo finalizado (/ul-module-archive)
agent: meta
model: opencode-go/glm-5
---

Argumento recebido: $ARGUMENTS (nome ou ID do módulo)

## Uso
/ul-module-archive [nome]

## Descrição
Arquiva módulo completo, marca como finalizado e cria template de relatório.

## Processo

### Passo 1: Confirmar Arquivamento

- Verificar módulo existe
- Mostrar aviso sobre ação irreversível
- Pedir confirmação

### Passo 2: Copiar para Archived

```
archived/
  M03101430-python-backend/
    2026-03-10/          # Data do arquivamento
      meta/
      projects/
      knowledge/
      README.md
      relatorio-final.md  # Template criado
```

### Passo 3: Atualizar Status

- Marcar `status = completed` em `modules.csv`
- Definir `completed_at = hoje`
- Desativar módulo (`is_active = false`)

### Passo 4: Oferecer Próximos Passos

- Preencher relatório final
- Atualizar índice de arquivados
- Criar novo módulo

## Parâmetros

- `nome`: Nome ou ID do módulo a arquivar

## Output

```
📦 Arquivando python-backend...

⚠️ O projeto será arquivado e marcado como completed.
⚠️ Ação irreversível - projeto será movido para archived/

Continuar? [s/N]: s

✓ Projeto copiado para: archived/M03101430-python-backend/2026-03-10
✓ Status atualizado: completed
✓ Módulo desativado

📝 Ações necessárias:
  1. Preencha o relatório: archived/M03101430-python-backend/2026-03-10/relatorio-final.md
  2. Atualize o índice: archived/indice.md
  3. Crie próximo módulo: /ul-module-create [nome]
```

## Exemplos

### Exemplo 1: Arquivar módulo ativo

```
Usuário: /ul-module-archive python-backend

Sistema:
"📦 Arquivando python-backend...

📊 Resumo do módulo:
  • Data de início: 2026-03-10
  • Tempo total: 45 horas
  • Sessões: 32
  • Status: ativo

⚠️ Atenção: O projeto será arquivado e marcado como completed.
⚠️ Ação irreversível.

Continuar? [s/N]: s

✓ Projeto copiado para: archived/M03101430-python-backend/2026-03-10
✓ Template de relatório criado
✓ Status atualizado: completed

📝 Próximos passos:
  1. Preencha: archived/M03101430-python-backend/2026-03-10/relatorio-final.md
  2. Atualize: archived/indice.md
  3. Novo módulo: /ul-module-create rust-async"
```

### Exemplo 2: Módulo não encontrado

```
Usuário: /ul-module-archive go-web

Sistema:
"❌ Módulo não encontrado: go-web

Módulos disponíveis:
  • python-backend (ativo)
  • rust-async
  • algorithms

Use um dos nomes acima."
```

### Exemplo 3: Cancelar arquivamento

```
Usuário: /ul-module-archive python-backend

Sistema:
"📦 Arquivando python-backend...

⚠️ Atenção: Ação irreversível.

Continuar? [s/N]: n

✓ Arquivamento cancelado
✓ Módulo mantido como ativo"
```

## Template de Relatório Final

O arquivo `relatorio-final.md` criado automaticamente contém:

```markdown
# Relatório Final - python-backend

**Data de Conclusão**: 2026-03-10
**Módulo ID**: M03101430

## 📊 Resumo

- **Data de Início**: 2026-03-10
- **Tempo Total**: N/A horas
- **Status**: ✅ Completado

## ✅ Conquistas

_Liste as principais conquistas deste módulo_

## 📚 Aprendizados

_Quais foram os principais aprendizados?_

## 🔧 Melhorias

_O que poderia ser melhorado no próximo módulo?_

## 📎 Links e Recursos

- Adicione links relevantes

## 🎯 Próximos Passos

- [ ] Próximo módulo
- [ ] Revisar flashcards
```

## Validações

- Módulo deve existir
- Confirmação obrigatória
- Não pode arquivar módulo já arquivado

## Integração com Tools

Este command invoca:
- `data.archiveModule` - Copiar e atualizar status

## Ver Também

- `/ul-module-create` - Criar novo módulo
- `/ul-module-switch` - Alternar módulo
- `archived/indice.md` - Índice de projetos arquivados
