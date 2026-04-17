---
name: "openviking"
description: "Consultor OpenViking — APIs, URIs, Skills, Sessions, Config, Erros, TypeScript. Responde dúvidas e escreve código."
license: MIT
compatibility: opencode
metadata:
  principle: "openviking-consulting"
  agent: "@meta @tutor @review @brainstorm @docs @build @plan"
  keywords: "openviking, viking, api, uri, skill, session, config, error, typescript, client, endpoint, ov.conf, ovcli.conf"
---

# OpenViking Skill — Consultor

Responder dúvidas sobre OpenViking. Explica APIs, URIs, parâmetros, erros. Ajuda a construir queries, skills, sessions. Escreve código TypeScript.

## Quando Usar

| Trigger | Ação |
|---------|------|
| Dúvida sobre API OpenViking | Carregar esta skill |
| Erro da API | Consultar seção Errors |
| Formato de URI | Consultar seção URI Schema |
| Criar/consultar skill | Consultar seção Skills |
| Config OpenViking | Consultar seção Config |
| Código TypeScript | Consultar seção Client |

---

## URI Schema

Formato: `viking://{scope}/{path}`

| Scope | Descrição | Ciclo | Exemplo |
|-------|-----------|-------|---------|
| `resources` | Recursos independentes | Longo prazo | `viking://resources/openviking/docs/en/` |
| `user` | Dados do usuário | Longo prazo | `viking://user/memories/preferences.md` |
| `agent` | Dados do agente | Longo prazo | `viking://agent/memories/tutor/` |
| `session` | Dados da sessão | Sessão | `viking://session/context/` |

**Regras**:
- Diretórios terminam com `/`
- Arquivos sem `/` no final
- Use `abstract`/`overview` antes de `read` para economizar tokens

---

## Keywords de Consulta

### `#find [QUERY]` — Busca Semântica Simples

Busca vetorial sem contexto de sessão.

```typescript
import { makeRequest, loadConfig } from "./shared/openviking-client.js";

const config = loadConfig();
const response = await makeRequest(config, {
  method: "POST",
  endpoint: "/api/v1/search/find",
  body: {
    query: "autenticação",
    target_uri: "viking://resources/",
    limit: 10,
    score_threshold: 0.5
  }
});
```

**Parâmetros**: `query`, `target_uri`, `limit`, `score_threshold`

**Scopes**: `resources` (projetos), `user` (memórias), `agent` (skills), `session` (sessão)

### `#search [QUERY]` — Busca com Contexto

Busca com intent analysis e query expansion. Usa contexto de sessão.

**Diferença de find**: search analisa intenção e expande query. find é busca simples por similaridade vetorial.

### `#uri [PATH]` — Viking URI

Consultar formato ou escopo de URIs. Ver tabela acima.

### `#session [AÇÃO]` — Sessions

Criar, commitar, obter contexto de sessão.

| Ação | Descrição |
|------|-----------|
| `create` | Criar nova sessão |
| `commit` | Forçar extração de memórias |
| `get_context` | Obter contexto da sessão |

### `#config` — Configuração

Dúvidas sobre `ov.conf` e `ovcli.conf`.

**Seções**: `embedding`, `vlm`, `storage`

### `#error [CÓDIGO]` — Erros

Consultar tabela de erros → Explicar código → Sugerir solução.

### `#skill [NOME]` — Skills

Dúvida sobre skills existentes ou criar nova.

---

## Error Codes

| Código | HTTP | Causa Comum | Solução |
|--------|------|-------------|---------|
| `NOT_FOUND` | 404 | URI incorreta, recurso não existe, scope errado | Verifique URI com `membrowse`. Confirme scope. Use trailing slash para diretórios |
| `UNAUTHORIZED` | 401 | Token ausente ou inválido | Verifique config e credentials |
| `FORBIDDEN` | 403 | Sem permissão para o scope | Verifique permissões do agente |
| `BAD_REQUEST` | 400 | Parâmetros inválidos | Verifique body da request |
| `CONFLICT` | 409 | Recurso já existe | Use `write` com `mode: "replace"` em vez de `add` |
| `RATE_LIMITED` | 429 | Muitas requests | Reduza frequência, implemente retry com backoff |
| `INTERNAL` | 500 | Erro interno do servidor | Verifique logs com `docker-compose logs openviking` |

**Troubleshooting geral**:

```bash
# Verificar se containers estão rodando
docker-compose ps

# Verificar saúde
curl http://localhost:1933/health

# Ver logs
docker-compose logs openviking
```

---

## Session API

### Criar Sessão

```typescript
const session = await makeRequest(config, {
  method: "POST",
  endpoint: "/api/v1/sessions",
  body: {
    agent_id: "tutor",
    metadata: { module: "typescript" }
  }
});
```

### Commit de Sessão

```typescript
// Forçar extração de memórias
await memcommit({ wait: true });
```

### Obter Contexto de Sessão

```typescript
// Via context-hybrid tool
const context = await contextHybrid({
  operation: "getSessionContext",
  query: "últimas sessões de estudo"
});
```

---

## Config — ov.conf

```yaml
# ov.conf — Configuração do OpenViking Server
embedding:
  provider: "ollama"          # ou "openai"
  model: "nomic-embed-text"   # modelo de embedding
  dimensions: 768              # dimensões do vetor

vlm:
  provider: "ollama"          # VLM para resumo
  model: "llama3.2-vision"    # modelo multimodal

storage:
  provider: "local"           # ou "s3"
  base_path: "./data"         # caminho local

server:
  host: "0.0.0.0"
  port: 1933

logging:
  level: "info"               # debug, info, warn, error
```

### ovcli.conf — Configuração do CLI

```yaml
# ovcli.conf — Configuração do cliente
server:
  url: "http://localhost:1933"
  timeout: 30000

auth:
  token: "${OPENVIKING_TOKEN}"   # env var

defaults:
  scope: "resources"
  limit: 10
```

---

## Skills — Formato SKILL.md

```markdown
---
name: skill-name
description: Descrição clara do que a skill faz
license: MIT
compatibility: opencode
metadata:
  principle: "princípio-guia"
  agent: "@meta @tutor @review"
  keywords: "palavras-chave relevantes"
---

# Skill Name

O que faz. Quando usar.

## Regras
- Regra 1
- Regra 2

## Exemplos
(exemplos práticos)

## Referência Rápida
(tabela de commands/parâmetros)
```

---

## TypeScript Client — makeRequest

```typescript
// .opencode/shared/openviking-client.ts
import { makeRequest, loadConfig } from "./shared/openviking-client.js";

const config = loadConfig();

// GET request
const result = await makeRequest(config, {
  method: "GET",
  endpoint: "/api/v1/resources/viking://resources/openviking/"
});

// POST request
const searchResult = await makeRequest(config, {
  method: "POST",
  endpoint: "/api/v1/search/find",
  body: {
    query: "typescript generics",
    target_uri: "viking://resources/",
    limit: 10
  }
});
```

**Erros comuns no client**:
- `ECONNREFUSED` → OpenViking server não está rodando. `docker-compose up -d`
- `Timeout` → Aumente `timeout` no ovcli.conf
- `401 Unauthorized` → Token inválido. Verifique `OPENVIKING_TOKEN`

---

## Checklist de Resposta

Antes de responder:
- [ ] Referencia documentação em `viking://resources/openviking/docs/en/`?
- [ ] Tem exemplo TypeScript prático?
- [ ] Explica parâmetros obrigatórios vs opcionais?
- [ ] Menciona erro comum e solução?

**FALHA quando**: Sem referência | Código sem exemplo | Confunde scopes | Não explica parâmetros

---

## Relação com Skills Irmãs

| Skill | Cobertura | Quando usar |
|-------|-----------|-------------|
| **openviking** (esta) | API, URI, errors, session, config, TS client | Dúvida sobre endpoint, erro, config |
| **openviking-context** | memsearch, memread, membrowse, memcommit | Precisa buscar/ler memórias ou contexto |
| **resource-workflow** | resource tool (add, sync, write, find, etc.) | Precisa gerenciar recursos no viking:// |

Carregar esta skill **não** substitui as irmãs. Para operações de resource, use `resource-workflow`. Para busca de memórias, use `openviking-context`.

---

## Documentação de Referência

| Fonte | URI |
|-------|-----|
| API Reference | `viking://resources/openviking/docs/en/api/` |
| Conceitos | `viking://resources/openviking/docs/en/concepts/` |
| Getting Started | `viking://resources/openviking/docs/en/getting-started/` |
| Guias | `viking://resources/openviking/docs/en/guides/` |
| Exemplos | `viking://resources/openviking/examples/` |
| Cliente TS | `.opencode/shared/openviking-client.ts` |
| Plugin exemplo | `.opencode/plugins/openviking-memory.ts` |
| Utils | `.opencode/shared/openviking-utils.ts` |

---

*Skill OpenViking — Consultor de API, URI, Errors, Session, Config e TypeScript*