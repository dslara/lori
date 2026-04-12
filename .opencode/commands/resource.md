---
description: Gerenciar recursos OpenViking - adicionar, listar, mover, deletar, linking, ler conteúdo
agent: build
model: opencode/big-pickle
---

## Uso

```
/resource <operação> [parâmetros]
```

### Operações Disponíveis

| Operação | Parâmetro | Descrição |
|----------|-----------|-----------|
| `add` | `path` | Adicionar arquivo/URL como recurso |
| `list` | `uri` | Listar recursos em um diretório |
| `info` | `uri` | Obter metadata do recurso |
| `mv` | `from`, `to` | Mover/renomear recurso |
| `rm` | `uri` | Deletar recurso |
| `link` | `uri`, `to_uri` | Criar linking entre recursos |
| `unlink` | `uri`, `to_uri` | Remover linking |
| `relations` | `uri` | Ver recursos relacionados |
| `abstract` | `uri` | Ler resumo (~100 tokens) |
| `overview` | `uri` | Ler overview (~2k tokens) |
| `read` | `uri` | Ler conteúdo completo |
| `export` | `uri`, `to` | Exportar como .ovpack |
| `import` | `file_path`, `parent` | Importar .ovpack |

## Descrição

Este command expõe a tool `@.opencode/tools/resource.ts` para gerenciamento de recursos OpenViking. Permite adicionar, organizar, linking e recuperar recursos para busca semântica.

### Casos de Uso

1. **Adicionar documentação** - Importar PDFs, MDs, URLs para indexing
2. **Organizar recursos** - Mover entre pastas, renomear
3. **Criar linking** - Conectar recursos relacionados semanticamente
4. **Recuperar conteúdo** - Ler em diferentes níveis de detalhe
5. **Exportar/Importar** - Backup e transferência de recursos

## Processo

1. Parsear operação e parâmetros
2. Validar parâmetros obrigatórios
3. Executar via tool `resource`
4. Retornar resultado formatado

## Parâmetros

| Parâmetro | Obrigatório | Descrição |
|-----------|------------|-----------|
| `operation` | ✅ | Operação a executar |
| `path` | add | Arquivo/URL para adicionar |
| `target` | add | URI alvo para adicionar |
| `uri` | list/info/rm/relations/abstract/overview/read/export | URI do recurso |
| `from` | mv | URI de origem |
| `to` | mv/export | URI de destino / arquivo para export |
| `recursive` | rm | Deletar recursivamente |
| `to_uri` | link/unlink | URI para linking |
| `reason` | add/link | Razão para adicionar/linkar |
| `wait` | add | Esperar processamento semântico |
| `file_path` | import | Arquivo .ovpack para importar |
| `parent` | import | URI pai para import |
| `force` | import | Forçar overwrite |
| `vectorize` | import | Trigger vectorização (default: true) |

## Exemplos

```
/resource add path=./docs/guide.md target=viking://resources/ultralearning/

/resource list uri=viking://resources/ultralearning/

/resource read uri=viking://resources/ultralearning/README.md

/resource link uri=viking://resources/ultralearning/docs/ to_uri=viking://resources/openviking/docs/ reason=Referência OpenViking

/resource mv from=viking://resources/ultralearning OLD/ to=viking://resources/ultralearning/new/
```

## Erros Comuns

| Erro | Causa | Solução |
|------|-------|--------|
| `MISSING_PATH` | path não fornecido para add | Fornecer path do arquivo |
| `MISSING_URI` | uri não fornecida | Fornecer URI válida |
| `MISSING_PARAMS` | Parâmetros obrigatórios faltando | Verificar parâmetros |
| `INVALID_OPERATION` | Operação desconhecida | Usar operação válida |

## Integrações

- **Tool**: `@.opencode/tools/resource.ts`
- **Tool**: `@.opencode/tools/resource-core.ts`
- **Skills**: `openviking-context`

## Handoff

Após execução bem-sucedida, retorna JSON com resultado da operação.