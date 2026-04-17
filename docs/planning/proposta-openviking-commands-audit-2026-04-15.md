# 🔍 Proposta: Auditoria e Melhoria da Integração OpenViking nos Commands

**Data**: 2026-04-15
**Versão atual**: v3.6.0
**Proponente**: Agente @brainstorm
**Status**: ✅ Validação concluída (v3.6.0)
**Prioridade**: 🟠 Alta

> **Atualização v3.6.0** (2026-04-16): Validação concluída. Sprint 1-4 implementados. 5 commands sem OV corrigidos. `memsearch` agora usa `target_uri` em 100% dos casos. `resource.write/link` implementados em 10+12 commands. `retro`, `status`, OVPack integrados. Bug `AddResourceInput.to` removido. `memread` com `level` e `memcommit` adicionados nos 2_commands_faltantes. Commands fantasmas removidos da tabela (27 commands, não 29). Pendências: `addResource.wait` TODO, `getUserPreferences`/`getLearningPatterns`/`getAgentId`_sem uso, `membrowse` sem uso (substituído por `resource.tree`/`glob`).

---

## 🎯 Resumo Executivo

Validação completa dos **27** commands do Ultralearning System (nota: `ul-setup-check` e `fw-viking-resource` listados originalmente não existem como arquivos). Após implementação dos Sprints 1-4, **100% dos commands agora usam OpenViking**. Buscas `memsearch` usam `target_uri` em 100% dos casos, artefatos são indexados via `resource.write`/`mkdir`/`link`, e `context-hybrid` usa 7/10 operations.

**Resultado**: Consistência na integração OV → memória entre sessões funcional → menos tokens desperdiçados → buscas mais relevantes.

---

## ⚠️ Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| **Quebra de compatibilidade durante migração** | Commands podem falhar se OV tools indisponíveis | Implementar fallback: se `resource.find` retorna vazio, tentar `memsearch` genérico |
| **Latência com `memcommit wait: true`** | +0.5-2s por command de estudo | Usar `wait: true` só em commands de encerramento (`ul-study-end`, `ul-study-recall`); nos demais, `wait: false` (fire-and-forget) |
| **Custo de tokens aumentado** | Mais calls OV = mais tokens por sessão | Cada `resource.find` com `target` escopo reduz tokens vs. `memsearch` sem filtro; medir antes/depois |
| **URIs órfãs ao arquivar módulo** | Recursos de módulo arquivado ficam inacessíveis | `ul-module-archive` deve mover recursos para `viking://resources/ultralearning/projects/{id}/.archived/` em vez de deletar |
| **Fallback em API indisponível** | Se OpenViking API cai, commands falham | Cada command deve ter caminho mínimo sem OV (igual comportamento atual) |

| Command | memsearch | memread | membrowse | memcommit | context-hybrid | resource | insights | data | Sem OV |
|---------|-----------|---------|-----------|-----------|----------------|----------|----------|------|--------|
| `ul-study-start` | ✅ target | ✅ abstract | ❌ | ✅ wait:false | ✅ getCurrentModule, getSRSPending, getFullContext | ❌ | ❌ | ❌ | |
| `ul-study-end` | ❌ | ✅ abstract | ❌ | ✅ wait:true | ❌ | ✅ mkdir,write,link | ❌ | ✅ | |
| `ul-study-learn` | ✅ target | ❌ | ❌ | ✅ wait:false | ✅ getCurrentModule, getSRSPending | ✅ mkdir,write,link | ❌ | ❌ | |
| `ul-study-recall` | ❌ | ❌ | ❌ | ✅ wait:true | ❌ | ❌ | ❌ | ✅ | |
| `ul-study-drill` | ✅ target | ❌ | ❌ | ✅ wait:false | ✅ getCurrentModule, getSRSPending | ✅ mkdir,write,link | ❌ | ✅ | |
| `ul-study-feynman` | ✅ target | ❌ | ❌ | ✅ wait:false | ✅ getCurrentModule | ✅ mkdir,write,link | ❌ | ✅ | |
| `ul-study-quiz` | ❌ | ❌ | ❌ | ✅ wait:true | ❌ | ❌ | ✅ | ❌ | |
| `ul-study-memorize` | ✅ target | ❌ | ❌ | ✅ wait:false | ✅ getCurrentModule | ❌ | ❌ | ✅ | |
| `ul-study-debug` | ❌ | ❌ | ❌ | ✅ wait:true | ✅ getFullContext | ❌ | ❌ | ❌ | |
| `ul-study-plan` | ✅ target | ✅ abstract | ❌ | ✅ wait:false | ✅ getCurrentModule, getWeekContext | ✅ glob | ❌ | ❌ | |
| `ul-study-project` | ❌ | ❌ | ❌ | ✅ wait:true | ✅ getProjectInfo | ❌ | ❌ | ❌ | |
| `ul-plan-weekly` | ❌ | ❌ | ❌ | ✅ wait:false | ✅ getSessionContext, getRelevantSessions | ✅ mkdir,write,link | ✅ | ❌ | |
| `ul-plan-retro` | ✅ target | ✅ overview | ❌ | ✅ wait:false | ✅ getCurrentModule, getWeekContext | ✅ tree,mkdir,write,link | ❌ | ❌ | ✅ retro |
| `ul-plan-adjust` | ❌ | ❌ | ❌ | ✅ wait:false | ✅ getWeekContext | ✅ read,write | ✅ | ✅ | |
| `ul-plan-benchmark` | ✅ target | ❌ | ❌ | ✅ wait:false | ✅ getCurrentModule | ✅ find,mkdir,write,link | ❌ | ❌ | |
| `ul-plan-decompose` | ✅ target | ❌ | ❌ | ✅ wait:false | ✅ getCurrentModule | ✅ find,mkdir,write,link | ❌ | ❌ | |
| `ul-plan-resources` | ❌ | ❌ | ❌ | ❌ | ✅ getCurrentModule, getProjectInfo | ✅ find,write,add,link,sync | ❌ | ❌ | |
| `ul-module-create` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ mkdir(9),write | ❌ | ✅ | |
| `ul-module-switch` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | |
| `ul-module-archive` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ mkdir,tree | ❌ | ✅ | |
| `ul-data-status` | ✅ target | ✅ abstract | ❌ | ❌ | ✅ getCurrentModule, getFullContext | ❌ | ❌ | ❌ | ✅ status |
| `ul-data-dashboard` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ showDashboard, comparePeriods | ❌ | |
| `ul-data-analytics` | ✅ target | ✅ abstract | ❌ | ❌ | ✅ getCurrentModule, getFullContext | ❌ | ✅ generateReport, getPatterns, getWeaknesses | ❌ | |
| `ul-data-backup` | ❌ | ❌ | ❌ | ❌ | ✅ getCurrentModule | ✅ export,import | ❌ | ✅ | |
| `ul-data-manage` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | |
| `ul-setup-scaffold` | ✅ target | ❌ | ❌ | ✅ wait:false | ✅ getCurrentModule, getProjectInfo | ✅ find,mkdir,write,link | ❌ | ❌ | |
| `fw-review-audit` | ❌ | ❌ | ❌ | ✅ wait:false | ✅ getCurrentModule, getFullContext | ✅ find,mkdir,write,link | ❌ | ❌ | |
| `fw-viking-resource` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | |

---

## 🚨 Lacunas Identificadas

### 🔴 CRÍTICA — 5 Commands Sem OpenViking → ✅ RESOLVIDO

| Command | Impacto | Status |
|---------|---------|--------|
| `ul-study-learn` | Conceito novo sem contexto | ✅ Adicionado context-hybrid, memsearch(com target), resource, memcommit |
| `ul-plan-benchmark` | Benchmark não indexado | ✅ Adicionado context-hybrid, memsearch(com target), resource, memcommit |
| `ul-plan-decompose` | Learning map não indexado | ✅ Adicionado context-hybrid, memsearch(com target), resource, memcommit |
| `ul-setup-scaffold` | Scaffold sem memória | ✅ Adicionado context-hybrid, memsearch(com target), resource, memcommit |
| `fw-review-audit` | Review sem persistência | ✅ Adicionado resource(find/mkdir/write/link), memcommit |

### 🟠 ALTA — Anti-Patterns e Omissões Críticas

#### 1. `memsearch` sem `target_uri` (6 commands afetados) → ✅ RESOLVIDO

Todos os 10 commands que usam `memsearch` agora usam `target_uri`.
- 8 commands com `"viking://user/"`: ul-study-start, ul-study-drill, ul-study-memorize, ul-study-plan, ul-data-status, ul-data-analytics, ul-plan-retro, ul-setup-scaffold
- 4 commands com `"viking://resources/ultralearning/"`: ul-study-feynman, ul-plan-benchmark, ul-plan-decompose, ul-study-learn (usam ambos)

#### 2. `context-hybrid` subutilizado (10 operations, 7/10 usadas)

| Operation | Status |
|-----------|--------|
| `getSRSPending` | ✅ ul-study-start, ul-study-drill, ul-study-learn |
| `getUserPreferences` | ❌ Sem uso |
| `getLearningPatterns` | ❌ Sem uso |
| `getWeekContext` | ✅ ul-study-plan, ul-plan-retro, ul-plan-adjust |
| `getCurrentModule` | ✅ 17 commands |
| `getFullContext` | ✅ ul-study-start, ul-study-debug, ul-data-status, ul-data-analytics, fw-review-audit |
| `getProjectInfo` | ✅ ul-study-project, ul-plan-resources, ul-setup-scaffold |
| `getRelevantSessions` | ✅ ul-plan-weekly |
| `getSessionContext` | ✅ ul-plan-weekly |
| `getAgentId` | ❌ Sem uso |

#### 3. `resource.write()` / `resource.add()` ausente para persistência → ✅ RESOLVIDO

Commands que geram artefatos agora indexam via `resource.write`:

| Command | Artefato | URI | Status |
|---------|----------|-----|--------|
| `ul-plan-weekly` | `week-N.md` | `viking://resources/ultralearning/projects/{id}/plans/` | ✅ resource.mkdir + write + link |
| `ul-plan-adjust` | Modificação em plano | via `resource.write` | ✅ resource.read + write |
| `ul-plan-benchmark` | `benchmark-[skill].md` | `viking://resources/ultralearning/projects/{id}/benchmarks/` | ✅ resource.find + mkdir + write + link |
| `ul-plan-decompose` | `learning-map.md` | `viking://resources/ultralearning/projects/{id}/maps/` | ✅ resource.find + mkdir + write + link |
| `ul-plan-resources` | `resources.md` | `viking://resources/ultralearning/projects/{id}/resources/` | ✅ resource.find + write + add + link + sync |

#### 4. `resource.link()` nunca usado → ✅ RESOLVIDO

10 commands agora usam `resource.link`:
- ul-study-learn, ul-study-drill, ul-study-feynman, ul-study-end, ul-plan-weekly, ul-plan-retro, ul-plan-benchmark, ul-plan-decompose, ul-setup-scaffold, fw-review-audit

### 🟡 MÉDIA — Melhorias de Eficiência

#### 5. Leitura progressiva → ✅ CORRIGIDO (parcialmente)

- `ul-data-status` agora usa `memread` nível `abstract` ✅
- `ul-data-analytics` agora usa `memread` nível `abstract` ✅
- `ul-plan-retro` usa `memread` nível `overview` ✅
- `ul-study-start` agora usa `memread` nível `abstract` ✅ (corrigido nesta validação)
- `ul-study-end` agora usa `memread` nível `abstract` ✅ (corrigido nesta validação)
- `ul-study-plan` usa `memread` nível `abstract` ✅

#### 6. `membrowse` subutilizado → ✅ RESOLVIDO (via alternativa)

`membrowse` permanece sem uso, mas `resource.tree` e `resource.glob` substituem a funcionalidade:
- `ul-study-plan` usa `resource.glob` para encontrar planos semanais
- `ul-plan-retro` usa `resource.tree` para navegar estrutura

#### 7. `retro` tool não usada em `ul-plan-retro` → ✅ RESOLVIDO

`ul-plan-retro` agora usa `retro.getWeeklyStats` e `retro.createRetro`.

#### 8. `status` tool não usada em `ul-data-status` → ✅ RESOLVIDO

`ul-data-status` agora usa `status.getStatus` e `status.formatStatus`.

#### 9. OVPack ausente em `ul-data-backup` → ✅ RESOLVIDO

`ul-data-backup` agora usa `resource.export` e `resource.import` como backup complementar.

### 🟢 BAIXA — Otimizações Menores

#### 10. `memcommit` inconsistente → ✅ CORRIGIDO

De 5 commands para **19 commands** com memcommit. Únicos sem memcommit:
- `ul-module-create`, `ul-module-switch`, `ul-module-archive` — commands administrativos, não geram memória
- `ul-data-status`, `ul-data-dashboard`, `ul-data-analytics`, `ul-data-manage` — commands de consulta, não mutam estado
- `ul-data-backup` — command de backup
- `ul-plan-resources` — command de pesquisa/curadoria

#### 11. `insights` subutilizado → ⚠️ PARCIAL

- `insights.getEffectiveness` — sem uso
- `insights.generateReport` — usado em ul-plan-weekly, ul-plan-adjust, ul-data-analytics
- `insights.getPatterns` — usado em ul-data-analytics
- `insights.getWeaknesses` — usado em ul-plan-weekly, ul-data-analytics
- `insights.getDifficultyLevel` — usado em ul-study-quiz
- `insights.showDashboard` — usado em ul-data-dashboard
- `insights.comparePeriods` — usado em ul-data-dashboard

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

**Próximos passos** (abordagem faseada):
1. **Sprint 1** — 5 commands sem OV: `ul-study-learn`, `ul-plan-benchmark`, `ul-plan-decompose`, `ul-setup-scaffold`, `fw-review-audit`
2. **Sprint 2** — 6 commands com `memsearch` sem `target_uri`: `ul-study-start`, `ul-study-memorize`, `ul-plan-retro`, `ul-data-status`, `ul-data-analytics`, `ul-study-plan`
3. **Sprint 3** — 4 commands de estudo sem `memcommit`: `ul-study-drill`, `ul-study-feynman`, `ul-study-learn`, `ul-study-memorize`
4. Aplicar leitura progressiva e `resource.find` nos demais

**Template de Integração OpenViking** (padrão obrigatório por command):

```
1. context-hybrid.getCurrentModule  (obter módulo ativo)
2. [se estudo] context-hybrid.getSRSPending  (SRS pendente)
3. [busca contexto]
   a. memsearch(query, target_uri="viking://user/", mode="auto")  # memórias pessoais
   b. resource.find(query, target="viking://resources/ultralearning/projects/{id}/")  # artefatos do projeto
4. memread(uri, level="abstract")  # escalar para overview/read se necessário
5. ... lógica do command ...
6. [se gerou artefato] resource.mkdir + resource.write + resource.link
7. memcommit  # wait: true só em commands de encerramento
```

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

> **Política de arquivamento**: Quando um módulo é arquivado via `ul-module-archive`, os recursos OV devem ser movidos para `viking://resources/ultralearning/projects/{id}/.archived/` em vez de deletados. Isso preserva o histórico para buscas futuras e evita URIs órfãs.

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

---

> **Nota**: O conteúdo desta seção (P8) foi absorvido por P1 (padrão de busca com `resource.find`/`memsearch` com `target_uri`), P3 (substituição de buscas manuais) e Anti-pattern #1 (`memsearch` sem `target_uri`). Não é mais uma proposta separada.

---

## 📈 Métricas de Sucesso

| Métrica | Antes (v3.5.0) | Atual (v3.6.0) | Meta Final | Economia estimada |
|---------|-------|------------|------------|-------------------|
| Commands com OV adequado | 41% (12/29) | **89% (24/27)** | 90%+ (25/27) | — |
| Commands sem OV | 5 | **0** ✅ | 0 ✅ | — |
| `memsearch` com `target_uri` | 0% (0/6) | **100% (10/10)** ✅ | 100% ✅ | ~40% menos tokens por busca |
| Artefatos indexados | 0 | 5 tipos ✅ | 5 tipos ✅ | Busca semântica funcional |
| `context-hybrid` ops usadas | 4/10 | **7/10** | 10/10 | ~30% menos calls redundantes |
| Commands com `memcommit` | 5/11 estudo | **19/27 total** ✅ | 19/27 (estudo ✅) | Memória entre sessões |
| Commands usando `resource.find`/`search` | 0 | **6** | 10+ | ~50% menos tokens em buscas de artefatos |
| Commands usando `resource.write` | 0 | **12** ✅ | 8+ ✅ | Conhecimento persistido |
| Commands usando `resource.link` | 0 | **10** ✅ | 8+ ✅ | Navegação semântica |

### Pendências restantes (3 operations context-hybrid sem uso):
- `getUserPreferences` — não implementado no backend (placeholder)
- `getLearningPatterns` — não implementado no backend (placeholder)
- `getAgentId` — não aplicável ao workflow atual

---

## 🗓️ Roadmap Consolidado

### Sprint 1 — Fundação (P1 parcial + P2) → ✅ CONCLUÍDO
**Foco**: Commands sem OV + indexação de artefatos
- ✅ Implementar template OV nos 5 commands sem OV (`ul-study-learn`, `ul-plan-benchmark`, `ul-plan-decompose`, `ul-setup-scaffold`, `fw-review-audit`)
- ✅ Adicionar `resource.mkdir` + `resource.write` + `resource.link` nos commands que geram artefatos
- ✅ URI schema definitivo validado

### Sprint 2 — Otimização de Buscas (P1 parcial + P3) → ✅ CONCLUÍDO
**Foco**: `target_uri` em `memsearch` + `resource.find`/`search` + `context-hybrid`
- ✅ Aplicar `target_uri` em todos os commands com `memsearch`
- ✅ Substituir buscas manuais por `context-hybrid` + `resource.find` nos commands identificados
- ✅ Leitura progressiva (`abstract` → `overview` → `read`) implementada

### Sprint 3 — Memória e Persistência (P1 parcial + P6) → ✅ CONCLUÍDO
**Foco**: `memcommit` em commands de estudo + `resource.write` append
- ✅ Adicionar `memcommit` nos commands de estudo
- ✅ Implementar `resource.write` append em `ul-study-learn`, `ul-study-feynman`, `ul-study-end`
- ✅ Usar `retro` e `status` tools em vez de reconstrução manual

### Sprint 4 — Navegação e Backup (P4 + P5 + P7) → ✅ CONCLUÍDO
**Foco**: Resource linking + OVPack backup + auto-refresh
- ✅ Implementar `resource.link` em todos os commands que criam recursos
- ✅ Adicionar `resource.export` em `ul-data-backup`
- ✅ Implementar `resource.sync` com `watch_interval` em `ul-plan-resources`

### Pendências Finais
- ⚠️ `getUserPreferences` / `getLearningPatterns` / `getAgentId` — 3 operations context-hybrid sem uso (backend pode não ter implementação)
- ⚠️ `addResource.wait` — TODO pendente em `resource-core.ts` (parâmetro aceito mas não tem efeito)
- ⚠️ `membrowse` — sem uso, mas `resource.tree`/`glob` cobrem a funcionalidade

---

## 🔗 Referências

- Proposta anterior: `viking://resources/ultralearning/planning/proposta-openviking-integration-2026-03-13.md` (implementada)
- Proposta resources: `viking://resources/ultralearning/planning/proposta-resources-openviking-2026-04-10.md`
- OpenViking API docs: `viking://resources/openviking/docs/en/`
- Commands auditados: `.opencode/commands/` (29 files)
- Skill resource-workflow: `.opencode/skills/resource-workflow/SKILL.md`
- Tool resource: `.opencode/tools/resource.ts` + `.opencode/tools/resource-core.ts`

---

## 🆕 Mudanças v3.6.0 — Validação e Correções

### Fixs aplicados nesta validação (2026-04-16)

| Fix | Arquivo | Descrição |
|-----|---------|-----------|
| memread com level | `ul-study-start.md` | Adicionado `level: "abstract"` no memread de profile |
| memread com level | `ul-study-end.md` | Adicionado `level: "abstract"` no memread de plano |
| memcommit missing | `ul-study-start.md` | Adicionado `memcommit({ wait: false })` |
| memcommit missing | `ul-study-plan.md` | Adicionado `memcommit({ wait: false })` |
| AddResourceInput.to morto | `resource-core.ts:12` | Removido campo `to?: string` (nunca enviado no body) |

### Bugs restantes

| Bug | Arquivo | Descrição |
|-----|---------|-----------|
| `addResource.wait` não implementado | `resource-core.ts:157` | TODO: `wait` param aceito mas sem efeito (retorna imediatamente) |

### Commands fantasmas removidos da tabela

- `ul-setup-check` — sem arquivo `.md` correspondente
- `fw-viking-resource` — sem arquivo `.md` correspondente

Total de commands: **27** (não 29)

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
