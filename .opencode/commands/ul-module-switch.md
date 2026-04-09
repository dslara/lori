---
description: Alternar módulo ativo (/ul-module-switch)
agent: meta
model: opencode-go/minimax-m2.5
---

Argumento recebido: $ARGUMENTS (nome ou ID do módulo, opcional)

## Uso
/ul-module-switch [nome]

## Descrição

Lista módulos disponíveis ou ativa um módulo específico como atual via OpenViking.

## Processo

### Sem Parâmetro: Listar Módulos

1. Buscar projetos via OpenViking:
```typescript
const projects = await membrowse({
  uri: "viking://user/projects/",
  view: "list"
})

const profile = await memread({
  uri: "viking://user/memories/profile.md",
  level: "read"
})
```

2. Mostrar todos os módulos com status
3. Indicar qual está ativo

### Com Parâmetro: Ativar Módulo

1. Buscar módulo pelo nome ou ID
2. Atualizar perfil:
```typescript
// Atualizar perfil com novo módulo ativo
// (presume que isso será feito via memcommit automático)
await memcommit({ wait: true })
```

3. Confirmar mudança

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

## Estrutura OpenViking

Os módulos são armazenados como projetos:

```
viking://user/projects/
├── M1-math-foundations/
│   ├── meta/
│   │   └── week-01.md
│   └── projects/
├── M2-python-backend/
└── profile.md → current_module: M1
```

## Integração com OpenViking

Este command usa:
- `membrowse` — Listar projetos disponíveis
- `memread` — Ler perfil atual
- `memcommit` — Atualizar perfil (opcional, automático)

## Ver Também

- `/ul-module-create` - Criar novo módulo
- `/ul-module-archive` - Arquivar módulo finalizado
- `/ul-data-status` - Ver status do módulo atual

---

*Command: /ul-module-switch — Alternar módulo ativo via OpenViking*