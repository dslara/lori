# 🔍 Proposta: Auditoria e Melhoria da Integração OpenViking nos Commands

**Data**: 2026-04-15
**Versão atual**: v3.5.0
**Proponente**: Agente @brainstorm
**Status**: 🟡 Proposta (atualizada v3.5.0)
**Prioridade**: 🟠 Alta

> **Atualização v3.5.0** (2026-04-15): Tool `resource` expandida com 9 operations novas (`write`, `mkdir`, `tree`, `sync`, `find`, `search`, `grep`, `glob`) + `add` expandido (`reason`, `instruction`, `watch_interval`). Skill `resource-workflow` criada. URI schema atualizado (`modules/` → `projects/`, `external/` → `resources/`). OpenViking resources limpos (source code removido).

---

## 🎯 Resumo Executivo

Auditoria completa dos 29 commands do Ultralearning System revelou que apenas **41% (12/29)** usam OpenViking adequadamente. Cinco commands não usam OpenViking de forma alguma, buscas `memsearch` são feitas sem `target_uri` (resultados irrelevantes), artefatos gerados não são indexados (perdidos para busca futura), e `context-hybrid` é subutilizado (10 operations disponíveis, só 4 usadas).

**Benefício principal**: Consistência na integração OV → memória entre sessões funcional → menos tokens desperdiçados → buscas mais relevantes.

---

## 📊 Mapeamento de Uso Atual

| Command | memsearch | memread | membrowse | memcommit | context-hybrid | resource | insights | data | Sem OV |
|---------|-----------|---------|-----------|-----------|----------------|----------|----------|------|--------|
| `ul-study-start` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| `ul-study-end` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | |
| `ul-study-learn` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **🔴** |
| `ul-study-recall` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | |
| `ul-study-drill` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | |
| `ul-study-feynman` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | |
| `ul-study-quiz` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | |
| `ul-study-memorize` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | |
| `ul-study-debug` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | |
| `ul-study-plan` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| `ul-study-project` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | |
| `ul-plan-weekly` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | |
| `ul-plan-retro` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| `ul-plan-adjust` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | |
| `ul-plan-benchmark` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **🔴** |
| `ul-plan-decompose` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **🔴** |
| `ul-plan-resources` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | |
| `ul-module-create` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | |
| `ul-module-switch` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | |
| `ul-module-archive` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | |
| `ul-data-status` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| `ul-data-dashboard` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | |
| `ul-data-analytics` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | |
| `ul-data-backup` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | |
| `ul-data-manage` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | |
| `ul-setup-check` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | |
| `ul-setup-scaffold` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **🔴** |
| `fw-review-audit` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | |
| `fw-viking-resource` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | |

---

## 🚨 Lacunas Identificadas

### 🔴 CRÍTICA — 5 Commands Sem OpenViking

| Command | Impacto | Sugestão |
|---------|---------|----------|
| `ul-study-learn` | Conceito novo sem contexto de pré-requisitos ou analogias anteriores | Adicionar `memsearch` (conceitos relacionados), `context-hybrid.getCurrentModule` |
| `ul-plan-benchmark` | Benchmark gerado mas não indexado → perdido para busca futura | Adicionar `resource.add` (indexar), `memsearch` (benchmarks anteriores) |
| `ul-plan-decompose` | Learning map gerado mas não indexado → não encontrado por outros commands | Adicionar `resource.add`, `memsearch` (decomposições similares) |
| `ul-setup-scaffold` | Scaffold sem memória de projetos anteriores | Adicionar `memsearch` (scaffolds anteriores), `context-hybrid.getProjectInfo` |
| `fw-review-audit` | Review sem acesso a reviews anteriores no OpenViking | Adicionar `resource.find` (reviews anteriores), `resource.write` (salvar resultado) |

### 🟠 ALTA — Anti-Patterns e Omissões Críticas

#### 1. `memsearch` sem `target_uri` (6 commands afetados)

Commands: `ul-study-start`, `ul-study-memorize`, `ul-plan-retro`, `ul-data-status`, `ul-data-analytics`, `ul-study-plan`

**Problema**: Buscas amplas → resultados irrelevantes → desperdício de tokens
**Fix**: Adicionar `target_uri: "viking://user/"` ou `"viking://resources/ultralearning/"` conforme escopo. Para buscas dentro de artefatos do projeto, usar `resource.find` com `target: "viking://resources/ultralearning/projects/{id}/"` — mais preciso que `memsearch` genérico.

#### 2. `context-hybrid` subutilizado (10 operations, só 4 usadas)

| Operation | Usada em | Deveria ser usada em |
|-----------|----------|---------------------|
| `getSRSPending` | — | `ul-study-start`, `ul-study-recall` |
| `getUserPreferences` | — | Qualquer command de estudo |
| `getLearningPatterns` | — | `ul-data-analytics`, `ul-plan-weekly` |
| `getWeekContext` | `ul-plan-adjust` | `ul-study-plan` também |
| `getCurrentModule` | `ul-plan-resources` | `ul-study-start`, `ul-study-learn`, `ul-study-drill` |
| `getFullContext` | — | `ul-data-status`, `ul-data-analytics` |
| `getProjectInfo` | `ul-study-project` | `ul-setup-scaffold` |
| `getRelevantSessions` | `ul-plan-weekly` | `ul-plan-retro` |

#### 3. `resource.write()` / `resource.add()` ausente para persistência

Commands que geram artefatos mas não indexam no OpenViking:

| Command | Artefato | URI proposta |
|---------|----------|-------------|
| `ul-plan-weekly` | `week-N.md` | `viking://resources/ultralearning/projects/{id}/plans/` |
| `ul-plan-adjust` | Modificação em plano | (atualizar existente via `resource.write`) |
| `ul-plan-benchmark` | `benchmark-[skill].md` | `viking://resources/ultralearning/projects/{id}/benchmarks/` |
| `ul-plan-decompose` | `learning-map.md` | `viking://resources/ultralearning/projects/{id}/maps/` |
| `ul-plan-resources` | `resources.md` | `viking://resources/ultralearning/projects/{id}/resources/` |

**Fix**: Usar `resource.mkdir` + `resource.write` para criar/atualizar artefatos, ou `resource.add` com `path` para arquivos locais. Skill `resource-workflow` documenta os padrões.

#### 4. `resource.link()` nunca usado

Nenhum command cria relações entre recursos. Links propostos:

- `benchmark-[skill]` → `project-[id]` (benchmark pertence ao projeto)
- `retro-week-N` → `week-N` (retro revisa plano semanal)
- `learning-map` → `project-[id]` (mapa pertence ao projeto)
- `resources.md` → `project-[id]` (recursos do projeto)

### 🟡 MÉDIA — Melhorias de Eficiência

#### 5. Leitura progressiva ignorada

- `ul-data-status` usa `memread` nível `read` direto (poderia usar `abstract` primeiro)
- `ul-plan-retro` usa `memread` nível `read` para profile (`overview` basta)
- **Fix**: Começar com `abstract`, escalar para `overview` ou `read` se necessário

#### 6. `membrowse` subutilizado (só 1 command usa)

- `ul-study-plan` hardcodifica URI `viking://user/projects/[module]/meta/week-*.md`
- Deveria usar `membrowse` para descobrir estrutura primeiro
- **Fix ampliado**: Usar `resource.tree` para descobrir estrutura do projeto, `resource.glob` para encontrar artefatos por padrão (ex: `**/*benchmark*`), e `membrowse` apenas para escopo `viking://user/`

#### 7. `retro` tool não usada em `ul-plan-retro`

- Command invoca `memsearch` + `memread` manualmente quando `retro.getWeeklyStats` existe
- **Fix**: Usar `retro.getWeeklyStats` e `retro.createRetro`

#### 8. `status` tool não usada em `ul-data-status`

- Command constrói status manualmente quando `status.getStatus` e `status.formatStatus` existem
- **Fix**: Usar `status.getStatus` + `status.formatStatus`

#### 9. OVPack ausente em `ul-data-backup`

- Só faz backup CSV, não inclui dados OpenViking
- **Fix**: Adicionar `resource.export` como backup complementar

### 🟢 BAIXA — Otimizações Menores

#### 10. `memcommit` inconsistente

Só 5 commands usam `memcommit`: `ul-study-end`, `ul-study-recall`, `ul-study-quiz`, `ul-study-debug`, `ul-study-project`

Commands de estudo que deveriam commitar ao final:
- `ul-study-drill` — padrões de erro detectados
- `ul-study-feynman` — analogias criadas
- `ul-study-learn` — conceitos estudados
- `ul-study-memorize` — flashcards criados

#### 11. `insights` subutilizado

- `insights.getEffectiveness`, `insights.getPatterns`, `insights.getWeaknesses` pouco usados
- `ul-data-analytics` faz `memsearch` manual quando `insights` oferece dados estruturados
- **Fix**: Preferir `insights` tools sobre `memsearch` genérico para métricas

---

## 📋 Propostas Priorizadas

### ★★★★★ P1 — Padronizar OpenViking em Todos Commands

**O quê**: Cada command segue padrão obrigatório:
1. **Início**: `context-hybrid.getCurrentModule` + `context-hybrid.getSRSPending` (se estudo)
2a. **Busca memórias**: `memsearch` com `target_uri` + `mode: "auto"`
2b. **Busca recursos**: `resource.find` com `target` (escopo do projeto)
3. **Leitura**: Progressiva (abstract → overview → read)
4a. **Persistência de arquivos locais**: `resource.add` + `resource.link`
4b. **Persistência de conteúdo gerado**: `resource.mkdir` + `resource.write` + `resource.link`
5. **Fim**: `memcommit` com `wait: true`

**Commands afetados**: 29 (todos)
**Custo**: Médio (editar 29 commands)
**Impacto**: Alto (consistência + memória entre sessões)

**Próximos passos**:
1. Criar template de integração OpenViking para commands
2. Implementar nos 5 commands sem OV primeiro (`ul-study-learn`, `ul-plan-benchmark`, `ul-plan-decompose`, `ul-setup-scaffold`, `fw-review-audit`)
3. Aplicar `target_uri` e leitura progressiva nos demais
4. Adicionar `memcommit` nos commands de estudo que não têm

---

### ★★★★ P2 — Indexar Artefatos no OpenViking

**O quê**: Toda vez que um command gera arquivo (plano, benchmark, retro, learning-map), indexar via `resource.add` e linkar ao módulo via `resource.link`.

**URI schema proposto**:
```
viking://resources/ultralearning/projects/{project-id}/
├── meta/                    # Descrição, objetivos
├── plans/week-{N}.md
├── benchmarks/benchmark-{skill}.md
├── maps/learning-map.md
├── notes/                   # Notas de sessão (append mode)
│   ├── sessions-log.md
│   └── session-{N}.md
├── knowledge/               # Conhecimento acumulado
│   ├── analogies.md
│   └── patterns.md
├── resources/resources.md
└── retros/retro-week-{N}.md
```

> **Nota**: O termo `projects` nas URIs (`viking://resources/ultralearning/projects/{id}/`) corresponde ao conceito de `modules` na camada de dados (`data/modules.csv`, `data.createModule`). O `{project-id}` na URI é o `id` do módulo (ex: `M1`).

**Commands afetados**: `ul-plan-weekly`, `ul-plan-benchmark`, `ul-plan-decompose`, `ul-plan-resources`, `ul-plan-retro`

**Custo**: Baixo (3-4 linhas por command)
**Impacto**: Alto (busca semântica funciona sobre artefatos)

**Próximos passos**:
1. Definir URI schema definitivo ✅ (ver acima)
2. Adicionar `resource.mkdir` + `resource.write` nos commands que geram conteúdo
3. Adicionar `resource.add` + `resource.link` nos commands que indexam arquivos locais
4. Validar com `resource.find` após indexação

---

### ★★★★ P3 — Substituir Buscas Manuais por `context-hybrid`

**O quê**: Commands que fazem múltiplos `memsearch` para montar contexto devem usar `context-hybrid.getFullContext` ou operações específicas.

**Mapeamento de substituição**:

| Command | Atual | Proposto |
|---------|-------|----------|
| `ul-study-start` | 3x `memsearch` | `context-hybrid.getFullContext` + `getSRSPending` + `resource.find` (artefatos do projeto) |
| `ul-data-status` | `memread` + 2x `memsearch` | `context-hybrid.getFullContext` + `status.formatStatus` |
| `ul-data-analytics` | `memread` + 3x `memsearch` | `insights.generateReport` + `context-hybrid.getFullContext` |
| `ul-plan-retro` | 3x `memsearch` + `memread` | `retro.getWeeklyStats` + `context-hybrid.getWeekContext` |
| `ul-plan-resources` | `context-hybrid` | `resource.find` + `resource.search` (recursos indexados) |

**Custo**: Baixo
**Impacto**: Alto (menos tokens, dados mais estruturados, menos latência)

**Próximos passos**:
1. Implementar substituição nos 4 commands acima
2. Testar que dados retornados são equivalentes ou superiores
3. Remover `memsearch` redundantes

---

### ★★★ P4 — Resource Linking para Navegação Semântica

**O quê**: Criar links entre recursos relacionados para que `memsearch` encontre contexto conectado.

**Links propostos**:

| Recurso | Link para | Reason |
|---------|-----------|--------|
| `benchmark-[skill]` | `project-[id]` | "benchmark de proficiência do projeto" |
| `retro-week-N` | `week-N` | "retrospectiva do plano semanal" |
| `learning-map` | `project-[id]` | "mapa de aprendizado do projeto" |
| `resources.md` | `project-[id]` | "recursos de estudo do projeto" |

**Custo**: Baixo
**Impacto**: Médio (melhora relevância de buscas)

**Próximos passos**:
1. Implementar `resource.link` após `resource.add` nos commands de P2
2. Validar que `resource.relations` retorna links corretos
3. Verificar impacto em `memsearch` relevance

---

### ★★★ P5 — OVPack como Backup Complementar

**O quê**: `ul-data-backup` faz backup CSV + `resource.export` do subtree do módulo atual.

**Implementação**:
```
1. Backup CSV existente (data.createBackup)
2. resource.export(uri: "viking://resources/ultralearning/projects/{id}/", to: backup_path)
3. Apresentar ambos os backups
```

**Custo**: Baixo
**Impacto**: Médio (backup completo incluindo índice semântico)

**Próximos passos**:
1. Adicionar `resource.export` em `ul-data-backup`
2. Testar restore com `resource.import`

---

### ★★ P6 — Aprendizado Progressivo com `resource.write` Append

**O quê**: Commands de estudo que geram conhecimento incremental devem usar `resource.write` com `mode: "append"` para acumular insights sem sobrescrever.

| Command | Uso | URI |
|---------|-----|-----|
| `ul-study-learn` | Append notas de conceito | `projects/{id}/notes/session-{N}.md` |
| `ul-study-feynman` | Append analogias criadas | `projects/{id}/knowledge/analogies.md` |
| `ul-study-end` | Append resumo da sessão | `projects/{id}/notes/sessions-log.md` |

**Custo**: Baixo (2-3 linhas por command)
**Impacto**: Médio (conhecimento acumulado entre sessões, buscável via `resource.find`)

**Próximos passos**:
1. Adicionar `resource.mkdir` no início de cada sessão (se dir não existe)
2. Append conteúdo com `resource.write` mode=`append`
3. Linkar ao projeto com `resource.link`

---

### ★★ P7 — Auto-refresh de Recursos Externos com `resource.sync`

**O quê**: `ul-plan-resources` curador recursos de estudo mas não mantém atualizados. Usar `resource.sync` com `watch_interval` para auto-refresh de documentação externa.

**Implementação**:
```
# Na criação de recursos externos
resource sync target=viking://resources/ultralearning/projects/{id}/resources/ watch_interval=60

# Ao consultar recursos
resource find query="typescript generics" target=viking://resources/ultralearning/projects/{id}/resources/
```

**Custo**: Baixo (1-2 linhas)
**Impacto**: Médio (documentação sempre atualizada sem intervenção manual)

---

### ★ P8 — `resource.find`/`resource.search` como Alternativa ao `memsearch` para Recursos

**O quê**: Commands que buscam artefatos do projeto devem usar `resource.find`/`resource.search` em vez de `memsearch` genérico. `resource.find` escopo limitado ao `target` do projeto, resultados mais relevantes.

| Command | Atual | Proposto |
|---------|-------|----------|
| `ul-study-start` | `memsearch` sem target | `resource.find` com target do projeto |
| `ul-study-memorize` | `memsearch` sem target | `resource.find` com target do projeto |
| `ul-plan-retro` | `memsearch` sem target | `resource.search` com target + session |
| `ul-plan-benchmark` | sem busca | `resource.find` (benchmarks anteriores) |
| `ul-plan-decompose` | sem busca | `resource.find` (learning maps similares) |

**Custo**: Baixo
**Impacto**: Alto (buscas mais relevantes, menos tokens desperdiçados)

---

## 📈 Métricas de Sucesso

| Métrica | Atual | Meta P1+P2 | Meta Final |
|---------|-------|------------|------------|
| Commands com OV adequado | 41% (12/29) | 70% (20/29) | 90%+ (26/29) |
| Commands sem OV | 5 | 0 | 0 |
| `memsearch` com `target_uri` | 0% (0/6) | 100% | 100% |
| Artefatos indexados | 0 | 5 tipos | 5 tipos |
| `context-hybrid` ops usadas | 4/10 | 8/10 | 10/10 |
| Commands com `memcommit` | 5/11 estudo | 9/11 | 11/11 |
| Commands usando `resource.find`/`search` | 0 | 6 | 10+ |
| Commands usando `resource.write` | 0 | 5 | 8+ |
| Commands usando `resource.link` | 0 | 5 | 8+ |

---

## 🔗 Referências

- Proposta anterior: `viking://resources/ultralearning/planning/proposta-openviking-integration-2026-03-13.md` (implementada)
- Proposta resources: `viking://resources/ultralearning/planning/proposta-resources-openviking-2026-04-10.md`
- OpenViking API docs: `viking://resources/openviking/docs/en/`
- Commands auditados: `.opencode/commands/` (29 files)
- Skill resource-workflow: `.opencode/skills/resource-workflow/SKILL.md`
- Tool resource: `.opencode/tools/resource.ts` + `.opencode/tools/resource-core.ts`

---

## 🆕 Mudanças v3.5.0 — Tool Expandida e Skill Criada

### Tool `resource` — 8 Operations Novas + Expansão de `add`

| Operation | Endpoint | Status |
|-----------|----------|--------|
| `write` | `POST /api/v1/content/write` | ✅ Implementado |
| `mkdir` | `POST /api/v1/fs/mkdir` | ✅ Implementado |
| `tree` | `GET /api/v1/fs/tree` | ✅ Implementado |
| `sync` | `POST /api/v1/resources` (re-add) | ✅ Implementado |
| `find` | `POST /api/v1/search/find` | ✅ Implementado |
| `search` | `POST /api/v1/search/search` | ✅ Implementado |
| `grep` | `POST /api/v1/search/grep` | ✅ Implementado |
| `glob` | `POST /api/v1/search/glob` | ✅ Implementado |

### `addResource` Expandido

- `reason` agora enviado no body (bug fix)
- `instruction` — instruções de processamento para melhorar resumo semântico
- `watch_interval` — auto-refresh periódico para repos externos

### Skill `resource-workflow` Criada

`.opencode/skills/resource-workflow/SKILL.md` — Documenta:
1. Publicar conteúdo local (`mkdir` → `add`/`write` → `link`)
2. Sync de repos externos (`sync` com `watch_interval`)
3. Busca semântica (`find`, `search`, `grep`, `glob`)
4. Organização e navegação (`list`, `tree`, `info`, leitura progressiva)
5. Relações e navegação semântica (`link`, `unlink`, `relations`)
6. Backup e restore (`export`, `import`)
7. Web research → resource (`webfetch` + `write`)
8. Ingest de URL direta (`add` com URL)

### URI Schema Atualizado

```
viking://resources/
├── agents/                  ← GENÉRICO (reutilizável)
├── opencode/                ← GENÉRICO (reutilizável)
├── openviking/              ← GENÉRICO (docs + examples, limpo)
└── ultralearning/           ← ESPECÍFICO DO PROJETO
    ├── planning/
    ├── reviews/
    ├── projects/            ← (era modules/)
    │   └── {project-id}/
    └── resources/           ← (era external/)
        └── {topic}/
```

### OpenViking Resources Limpos

Removidos de `openviking/`: source code (`src/`, `crates/`, `tests/`, `bot/`, etc.), build files (`Cargo.lock`, `uv.lock`, `Dockerfile`, etc.). Mantidos apenas `README.md`, `docs/`, `examples/`.

### Commands Atualizados

| Command | Antes | Depois |
|---------|-------|--------|
| `ul-module-create` | Só `data.createModule` (CSV local) | + `resource.mkdir` × 9 (estrutura OV) + `resource.write` (project.md) |
| `ul-plan-resources` | Só `context-hybrid` | + `resource.find` (recursos existentes) + `resource.write`/`resource.add` (indexar) + `resource.link` (conectar ao projeto) |
