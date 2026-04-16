---
name: "resource-workflow"
description: "Workflows para gerenciar recursos OpenViking — publicar conteúdo, sync de repos, busca semântica, organização. Guia de referência para agentes."
license: MIT
compatibility: opencode
metadata:
  principle: "resource-management"
  agent: "@tutor @meta @review @brainstorm @opencodex"
  keywords: "resource, openviking, publish, sync, write, mkdir, find, search, grep, glob, workflow, viking, ingest, content, uri, ovpack, link, unlink, tree, abstract, overview"
---

# Resource Workflow Skill

Workflows e padrões para gerenciar recursos OpenViking usando a tool `resource`.

## URI Schema do Projeto

```
viking://resources/
├── agents/                          ← GENÉRICO (reutilizável entre projetos)
│   ├── academic/
│   ├── engineering/
│   ├── marketing/
│   └── ... (19 categorias)
│
├── opencode/                        ← GENÉRICO (reutilizável entre projetos)
│   ├── commands/
│   ├── skills/
│   ├── plugins/
│   ├── custom-tools/
│   └── ...
│
├── openviking/                      ← GENÉRICO (docs + examples)
│   ├── README.md
│   ├── docs/
│   │   └── en/
│   │       ├── api/
│   │       ├── concepts/
│   │       ├── getting-started/
│   │       └── guides/
│   └── examples/
│
└── ultralearning/                   ← ESPECÍFICO DO PROJETO
    ├── planning/                    ← Propostas e planos
    ├── reviews/                     ← Auditorias e reviews
    ├── projects/                    ← Recursos por projeto/módulo
    │   └── {project-id}/
    │       ├── meta/                # Descrição, objetivos
    │       ├── plans/               # Planos semanais
    │       ├── benchmarks/          # Benchmarks de proficiência
    │       ├── maps/                # Learning maps
    │       ├── notes/               # Notas de sessão
    │       └── resources/           # Recursos de estudo externos
    └── resources/                   ← Web research e refs genéricas
        └── {topic}/
            ├── source.md            # Metadata + conteúdo
            └── ...
```

**Regra**: Conteúdo genérico e reutilizável → root (`agents/`, `opencode/`, `openviking/`). Conteúdo específico do projeto → `ultralearning/`.

## Tool Disponível

Todas as operações usam a tool `resource` com parâmetro `operation`:

```
resource({ operation: "...", ...params })
```

## Workflows

### 1. Publicar Conteúdo Local

Publicar um arquivo markdown no viking:// para que fique indexado e buscável.

```
# Passo 1: Criar diretório (se não existir)
resource({ operation: "mkdir", uri: "viking://resources/ultralearning/projects/typescript/notes/" })

# Passo 2a: Primeira publicação (via add com arquivo local)
resource({ operation: "add", path: "/tmp/session-15.md", target: "viking://resources/ultralearning/projects/typescript/notes/" })

# Passo 2b: Atualizações subsequentes (via write — mais eficiente)
resource({ operation: "write", uri: "viking://resources/ultralearning/projects/typescript/notes/session-15.md", content: "...", mode: "replace" })

# Passo 3: Linkar ao projeto (opcional mas recomendado)
resource({ operation: "link", uri: "viking://resources/ultralearning/projects/typescript/notes/session-15.md", to_uri: "viking://resources/ultralearning/projects/typescript/", reason: "nota de sessão do projeto" })
```

**Quando usar `add` vs `write`:**
- `add` — primeira vez, arquivo local ou URL. Cria + indexa + gera abstract/overview
- `write` — atualizações. Re-indexa automaticamente. Mais eficiente que delete+re-add

**Modos de `write`:**
- `replace` (default) — substitui conteúdo inteiro
- `append` — adiciona ao final do arquivo existente

**`wait=true`** em `write`: aguarda re-indexação semântica completar antes de retornar. Use quando precisa buscar o conteúdo imediatamente após escrever.

### 2. Sync de Repos Externos

Manter recursos de repositórios GitHub atualizados.

```
# Primeira vez: adicionar repo
resource({ operation: "add", path: "https://github.com/org/repo", target: "viking://resources/openviking/", reason: "documentação do OpenViking" })

# Sync manual (atualização incremental)
resource({ operation: "sync", target: "viking://resources/openviking/" })

# Auto-refresh: sync automático a cada 60 minutos
resource({ operation: "sync", target: "viking://resources/openviking/", watch_interval: 60 })

# Desabilitar auto-refresh
resource({ operation: "sync", target: "viking://resources/openviking/", watch_interval: 0 })
```

**Como funciona o sync incremental:**
- Re-add com mesmo `target` → OpenViking faz diff
- Arquivos inalterados → reutiliza índice existente (skip vectorização)
- Arquivos novos/modificados → re-processa (abstract + overview + vectors)
- Diretórios L0/L1 → recompute apenas se child set mudou

**`instruction`** no add: melhora qualidade do resumo semântico.

```
resource({ operation: "add", path: "https://github.com/org/api-docs", target: "viking://resources/api/", instruction: "Focar em endpoints REST e exemplos de request/response" })
```

### 3. Busca Semântica

Encontrar recursos por significado, não por palavras-chave.

```
# Busca semântica simples
resource({ operation: "find", query: "typescript generics", target: "viking://resources/ultralearning/", limit: 5 })

# Busca contextual (usando sessão para contexto)
resource({ operation: "search", query: "como melhorar retenção", target: "viking://resources/ultralearning/", session_id: "..." })

# Busca por regex
resource({ operation: "grep", pattern: "TODO.*urgent", uri: "viking://resources/project/" })

# Busca por padrão de filename
resource({ operation: "glob", pattern: "**/*benchmark*", uri: "viking://resources/ultralearning/" })
```

**Quando usar cada tipo:**
- `find` — busca por significado. Modos: `fast`, `deep`, `auto`
- `search` — busca contextual com estado de sessão. Mais precisa para consultas ambíguas
- `grep` — busca por regex no conteúdo dos arquivos
- `glob` — busca por padrão de filename (ex: `**/*.md`, `*session*`)

**`score_threshold`**: filtra por relevância (0-1). Default 0.3. Aumentar para resultados mais precisos.

### 4. Organização e Navegação

```
# Listar conteúdo de um diretório
resource({ operation: "list", uri: "viking://resources/ultralearning/projects/" })

# Visão hierárquica (árvore)
resource({ operation: "tree", uri: "viking://resources/ultralearning/", simple: true })

# Metadata de um recurso
resource({ operation: "info", uri: "viking://resources/ultralearning/projects/typescript/meta/project.md" })

# Leitura progressiva
resource({ operation: "abstract", uri: "viking://resources/ultralearning/projects/typescript/" })   # ~100 tokens
resource({ operation: "overview", uri: "viking://resources/ultralearning/projects/typescript/" })   # ~2k tokens
resource({ operation: "read", uri: "viking://resources/ultralearning/projects/typescript/meta/project.md" })  # completo
```

**Sempre comece com `abstract`**. Escalone para `overview` ou `read` apenas se necessário. Economiza tokens.

### 5. Relações e Navegação Semântica

```
# Criar link entre recursos
resource({ operation: "link", uri: "viking://resources/ultralearning/projects/typescript/benchmarks/types-generics.md", to_uri: "viking://resources/ultralearning/projects/typescript/", reason: "benchmark de proficiência do projeto" })

# Ver recursos relacionados
resource({ operation: "relations", uri: "viking://resources/ultralearning/projects/typescript/" })

# Remover link
resource({ operation: "unlink", uri: "viking://resources/ultralearning/projects/typescript/benchmarks/types-generics.md", to_uri: "viking://resources/ultralearning/projects/typescript/" })
```

**Links úteis para o framework:**
- `benchmark-{skill}` → `project-{id}` — benchmark pertence ao projeto
- `retro-week-N` → `week-N` — retro revisa plano semanal
- `learning-map` → `project-{id}` — mapa pertence ao projeto
- `resources.md` → `project-{id}` — recursos do projeto

### 6. Backup e Restore

```
# Exportar subtree como .ovpack
resource({ operation: "export", uri: "viking://resources/ultralearning/", to: "/tmp/ultralearning-backup.ovpack" })

# Importar .ovpack
resource({ operation: "import", file_path: "/tmp/ultralearning-backup.ovpack", parent: "viking://resources/ultralearning/", force: true })
```

### 7. Web Research → Resource

Pesquisar conteúdo na web e publicar como recurso indexado no OpenViking.

**Não existe scraping automático.** O agente faz o papel de crawler inteligente: decide o que é relevante, filtra ruído, organiza o conteúdo.

```
# Passo 1: Pesquisar tema na web
# Use webfetch para baixar páginas relevantes
const content = await webfetch({ url: "https://...", format: "markdown" })

# Passo 2: Filtrar e organizar
# O agente decide quais seções são relevantes, remove ads/nav/footer, estrutura o conteúdo

# Passo 3: Criar estrutura no viking://
resource({ operation: "mkdir", uri: "viking://resources/ultralearning/resources/rust-ownership/" })

# Passo 4: Publicar conteúdo filtrado
resource({ operation: "write", uri: "viking://resources/ultralearning/resources/rust-ownership/move-semantics.md", content: "<conteúdo filtrado e organizado>", mode: "replace" })

# Passo 5: Linkar ao projeto relevante
resource({ operation: "link", uri: "viking://resources/ultralearning/resources/rust-ownership/", to_uri: "viking://resources/ultralearning/projects/rust/", reason: "referência externa sobre ownership" })

# Passo 6: Verificar indexação
resource({ operation: "abstract", uri: "viking://resources/ultralearning/resources/rust-ownership/move-semantics.md" })
```

**Workflow completo para research:**

1. **Definir escopo** — Qual tema? Qual módulo? Quantas fontes?
2. **Buscar fontes** — `webfetch` em 3-5 URLs relevantes
3. **Filtrar** — Remover ads, nav, footer. Extrair apenas conteúdo útil
4. **Estruturar** — Organizar em markdown com headers claros, código exemplos
5. **Publicar** — `mkdir` + `write` no viking://
6. **Conectar** — `link` ao módulo ou recurso relacionado
7. **Validar** — `abstract` para confirmar que indexou corretamente

**Dicas:**
- Use `instruction` no `add` para guiar a qualidade do resumo: `instruction: "Focar em exemplos práticos e APIs"`
- Para múltiplas fontes, crie um arquivo por URL com `write`
- Adicione metadata no topo do markdown: fonte, data, autor
- Se a fonte já é um repo GitHub, use `add` com URL diretamente (mais eficiente que webfetch + write)

**Exemplo de metadata:**
```markdown
---
source: https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html
date: 2026-04-15
author: Rust Team
topic: ownership, move semantics
---

# What is Ownership?
...
```

### 8. Ingest de URL Direta

Para URLs que apontam para arquivos específicos (não precisa de webfetch):

```
# PDF, markdown, HTML direto
resource({ operation: "add", path: "https://example.com/api-docs.md", target: "viking://resources/ultralearning/resources/api/" })

# GitHub repo (clona automaticamente)
resource({ operation: "add", path: "https://github.com/org/repo", target: "viking://resources/ultralearning/resources/repo/", instruction: "Focar em exemplos de uso" })
```

**Quando usar cada abordagem:**

| Situação | Método | Por quê |
|----------|--------|---------|
| Repo GitHub | `add` com URL | Clona, indexa tudo, suporta `sync` |
| URL de arquivo direto | `add` com URL | Baixa e indexa automaticamente |
| Página web com ruído | `webfetch` + `write` | Filtra nav/ads/footer |
| Pesquisa multi-fonte | `webfetch` + `write` múltiplos | Agente seleciona e organiza |
| Conteúdo gerado pelo agente | `write` direto | Já tem o conteúdo, só publica |

## Anti-Patterns

❌ **Não faça:**
- `read` sem `abstract` primeiro (desperdício de tokens)
- `add` toda vez que precisa atualizar conteúdo (use `write` para updates)
- Busca sem `target` (retorna lixo de outros projetos)
- `rm` sem `recursive=true` em diretórios (falha silenciosamente)
- `add` com URL de página web genérica (usa webfetch + write para filtrar ruído)
- Publicar conteúdo sem metadata (fonte, data, tópico)

✅ **Faça:**
- `abstract` → `overview` → `read` (leitura progressiva)
- `write` para atualizações de conteúdo existente
- `find`/`search` com `target_uri` para escopo
- `link` após `add`/`write` para conectar recursos
- `mkdir` antes de `add` se a estrutura de dirs não existe
- `webfetch` + `write` para páginas web (filtra ruído)
- Metadata no topo de conteúdo publicado (fonte, data, tópico)

## Referência Rápida

| Operação | Parâmetros Obrigatórios | Use Para |
|----------|------------------------|----------|
| `add` | path | Ingerir arquivo/URL |
| `sync` | target | Atualizar repo existente |
| `write` | uri, content | Publicar/atualizar conteúdo |
| `mkdir` | uri | Criar diretório |
| `list` | — | Listar diretório |
| `tree` | — | Visão hierárquica |
| `info` | uri | Metadata |
| `abstract` | uri | Resumo ~100 tokens |
| `overview` | uri | Overview ~2k tokens |
| `read` | uri | Conteúdo completo |
| `find` | query | Busca semântica |
| `search` | query | Busca contextual |
| `grep` | pattern | Regex search |
| `glob` | pattern | Pattern matching |
| `link` | uri, to_uri | Criar relação |
| `unlink` | uri, to_uri | Remover relação |
| `relations` | uri | Ver relacionados |
| `mv` | from, to | Mover/renomear |
| `rm` | uri | Deletar |
| `export` | uri, to | Exportar .ovpack |
| `import` | file_path, parent | Importar .ovpack |

---

*Skill carregada pelos agentes para workflows de resource management.*