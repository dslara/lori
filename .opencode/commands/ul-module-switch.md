---
description: Alternar módulo ativo (/ul-module-switch)
agent: meta
model: opencode-go/glm-5
---

## Uso
/ul-module-switch [nome]

## Descrição
Lista módulos disponíveis ou ativa um módulo específico como atual.

## Processo

### Sem Parâmetro: Listar Módulos

1. Ler `modules.csv`
2. Mostrar todos os módulos com status
3. Indicar qual está ativo

### Com Parâmetro: Ativar Módulo

1. Buscar módulo pelo nome ou ID
2. Desativar módulo atual
3. Ativar módulo especificado
4. Confirmar mudança

## Parâmetros

- `nome`: (opcional) Nome ou ID do módulo a ativar

## Output

### Listar módulos

```
📋 Módulos disponíveis:

  ✓ python-backend (ativo)
  ○ rust-async
  ○ algorithms
  ○ machine-learning

Use: /ul-module-switch [nome] para ativar
```

### Ativar módulo

```
✓ Módulo ativo: rust-async (M03101545)
✓ Módulo anterior desativado

Próximos passos:
  /ul-study-start  → Iniciar sessão
  /ul-study-plan   → Ver plano da semana
```

## Exemplos

### Exemplo 1: Listar módulos

```
Usuário: /ul-module-switch

Sistema:
"📋 Módulos disponíveis:

  ✓ M03101430-python-backend (ativo, desde 2026-03-10)
  ○ M03101200-rust-async (active, desde 2026-03-08)
  ○ M03011500-algorithms (active, desde 2026-02-28)
  ○ M02281030-machine-learning (completed)

Ativo: python-backend

Para alternar: /ul-module-switch rust-async"
```

### Exemplo 2: Ativar por nome

```
Usuário: /ul-module-switch rust-async

Sistema:
"🔄 Alternando módulo...

✓ Módulo encontrado: rust-async
✓ Módulo anterior desativado: python-backend
✓ Módulo ativo: rust-async (M03101200)

📦 Módulo: rust-async

Próximos passos:
  /ul-study-start  → Continuar de onde parou
  /ul-study-plan   → Ver plano da semana"
```

### Exemplo 3: Ativar por ID

```
Usuário: /ul-module-switch M03011500

Sistema:
"🔄 Alternando módulo...

✓ Módulo encontrado: M03011500 (algorithms)
✓ Módulo ativo: algorithms (M03011500)"
```

### Exemplo 4: Módulo não encontrado

```
Usuário: /ul-module-switch go-web

Sistema:
"❌ Módulo não encontrado: go-web

Módulos disponíveis:
  • python-backend
  • rust-async
  • algorithms

Use um dos nomes acima ou crie novo: /ul-module-create go-web"
```

## Validações

- Nome deve corresponder a módulo existente
- Pode usar nome completo ou ID
- Case-insensitive para busca

## Integração com Tools

Este command invoca:
- `data.switchModule` - Listar ou ativar módulo

## Ver Também

- `/ul-module-create` - Criar novo módulo
- `/ul-module-archive` - Arquivar módulo finalizado
- `/ul-data-status` - Ver status do módulo atual
