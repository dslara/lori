---
description: Gerenciar recursos OpenViking - ingest, filesystem, conteúdo, busca, relações, sync
agent: build
model: opencode-go/kimi-k2.5
---

$ARGUMENTS (operação e parâmetros, ex: `add path=./docs/guide.md target=viking://resources/ultralearning/`)

## Descrição

Gerencia recursos OpenViking para busca semântica: adicionar, organizar, publicar conteúdo, buscar, relacionar e sincronizar.

## Processo

1. **Parsear operação** — Extrair operação e parâmetros de `$ARGUMENTS`
2. **Validar parâmetros** — Verificar parâmetros obrigatórios para cada operação (coluna Req)
3. **Executar** — Invocar tool `resource` com operação e parâmetros
4. **Retornar resultado** — Formatar e apresentar resultado da operação

## Operações

### Ingest — Adicionar e sincronizar recursos

| Op | Parâmetros | Req | Descrição |
|----|-----------|-----|-----------|
| `add` | path, target?, reason?, wait?, instruction?, watch_interval? | path | Adicionar arquivo/URL como recurso |
| `sync` | target, path?, reason?, watch_interval? | target | Atualizar recurso existente (diff incremental) |

**`add`** — Ingest de caminho local ou URL remota. `instruction` melhora qualidade do resumo semântico. `watch_interval` habilita auto-refresh periódico.

**`sync`** — Re-add com mesmo `target` → OpenViking faz diff incremental. Arquivos inalterados mantêm índice. `watch_interval=0` desabilita auto-refresh.

### Filesystem — Navegar e organizar

| Op | Parâmetros | Req | Descrição |
|----|-----------|-----|-----------|
| `list` | uri? | — | Listar recursos em diretório |
| `info` | uri | uri | Obter metadata (stat) |
| `mv` | from, to | ambos | Mover/renomear |
| `rm` | uri, recursive? | uri | Deletar |
| `mkdir` | uri | uri | Criar diretório |
| `tree` | uri?, simple? | — | Visão hierárquica de diretórios |

### Content — Ler e escrever conteúdo

| Op | Parâmetros | Req | Descrição |
|----|-----------|-----|-----------|
| `abstract` | uri | uri | Resumo ~100 tokens |
| `overview` | uri | uri | Overview estruturado ~2k tokens |
| `read` | uri | uri | Conteúdo completo |
| `write` | uri, content, mode?, wait?, timeout? | uri, content | Escrever/atualizar arquivo existente |

**`write`** — Publica conteúdo local no viking://. Modos: `replace` (default) ou `append`. Auto re-indexa semântica + vectors. Arquivo deve existir; criar dir com `mkdir` antes se necessário.

**Fluxo para publicar conteúdo novo:**
1. `mkdir uri=viking://resources/ultralearning/notes/` — criar diretório
2. `add path=/tmp/notes.md target=viking://resources/ultralearning/notes/` — primeira vez
3. `write uri=viking://resources/ultralearning/notes/session.md content="..." mode=replace` — atualizações

### Search — Busca semântica e por padrão

| Op | Parâmetros | Req | Descrição |
|----|-----------|-----|-----------|
| `find` | query, target?, limit?, score_threshold?, search_mode? | query | Busca semântica simples |
| `search` | query, target?, session_id?, limit?, score_threshold? | query | Busca contextual com sessão |
| `grep` | pattern, uri?, limit? | pattern | Regex search em resources |
| `glob` | pattern, uri?, limit? | pattern | Pattern matching em filenames |

**`find`** — Busca semântica por similaridade. Modos: `fast` (rápido), `deep` (contextual), `auto` (default). `score_threshold` filtra relevância (0-1).

**`search`** — Busca contextual que usa estado da sessão. Mais precisa que `find` para consultas ambíguas.

### Relate — Links, relações, import/export

| Op | Parâmetros | Req | Descrição |
|----|-----------|-----|-----------|
| `link` | uri, to_uri, reason? | uri, to_uri | Criar relação entre recursos |
| `unlink` | uri, to_uri | ambos | Remover relação |
| `relations` | uri | uri | Ver recursos relacionados |
| `export` | uri, to | ambos | Exportar subtree como .ovpack |
| `import` | file_path, parent, force?, vectorize? | file_path, parent | Importar .ovpack |

## Exemplos

```
# Adicionar repo com auto-refresh
resource add path=https://github.com/org/repo target=viking://resources/repo/ watch_interval=60

# Sync manual (atualizar repo)
resource sync target=viking://resources/repo/

# Publicar conteúdo local
resource mkdir uri=viking://resources/ultralearning/notes/
resource write uri=viking://resources/ultralearning/notes/session-15.md content="# Sessão 15..." mode=replace

# Busca semântica
resource find query="typescript generics" target=viking://resources/ultralearning/ limit=5

# Busca por padrão
resource grep pattern="TODO.*urgent" uri=viking://resources/project/

# Linkar recursos
resource link uri=viking://resources/ultralearning/projects/typescript/ to_uri=viking://resources/ultralearning/projects/typescript/plans/week-3.md reason="plano semanal do projeto"
```

## Handoff

- Após execução → retorna JSON com resultado da operação
- Para `write` com `wait=true` → aguarda re-indexação semântica completar
- Para `sync` → verificar `watch_interval` no resultado para confirmar auto-refresh