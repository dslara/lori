# Audit Completo — Ultralearning System v3.4.0

**Data**: 2026-04-09  
**Versao do Projeto**: v3.4.0  
**Tipo**: complete  
**Agente**: @review  
**Revisao**: v2 (atualizada pos-migracao de shared modules)

---

## Estado Atual

| Componente | Quantidade | Status |
|-----------|-----------|--------|
| **Commands** | 30 | Todos com frontmatter completo |
| **Tools** | 12 (1 facade + 6 data + 5 sistema) | ✅ Migracao para shared/ concluida |
| **Shared** | 4 modulos compartilhados | ✅ Novo diretorio `.opencode/shared/` |
| **Skills** | 6 ativas + 1 template | 1 skill referenciada nao existe |
| **Agents** | 4 ativos + 1 template | ✅ Regras de Ouro adicionadas |
| **Docs** | README + HOW_TO_USE + guides | 3 pontos desatualizados |
| **Reviews** | 2 ativas + 27 arquivadas | Organizadas |
| **Planning** | 1 ativa + 22 arquivadas | Organizadas |

### Mudancas desde a ultima revisao (v1)

As seguintes mudancas foram aplicadas entre a v1 e v2 desta auditoria:

1. **✅ Migracao para `.opencode/shared/`**: `utils-csv.ts`, `model-types.ts`, `openviking-utils.ts`, `openviking-client.ts` foram movidos de `.opencode/tools/` para `.opencode/shared/`. Todos os imports foram atualizados de `./utils-csv.js` para `../shared/utils-csv.js`.

2. **✅ Regras de Ouro adicionadas**: Todos os 4 agentes (`@tutor`, `@meta`, `@review`, `@brainstorm`) agora tem secao `## Regras de Ouro` apos a missao, conforme proposta `proposta-melhorias-agentes-agency-2026-04-09.md`.

3. **✅ Agentes otimizados**: Todos os agentes foram significativamente reduzidos (ex: `@tutor` de ~608 para 336 linhas, `@brainstorm` de ~400 para 382 linhas). Secoes de codigo TypeScript repetidas foram substituidas por referencias concisas.

4. **✅ Template de agente atualizado**: `_template-agent.md` agora inclui secao `## Regras de Ouro` e `### Voce FALHA quando`.

5. **✅ Diretorio `.opencode/templates/`**: Novo diretorio com `_template-proposta-melhoria.md`.

6. **✅ Tools README**: `.opencode/tools/README.md` adicionado.

---

## Matriz de Dependencias

### Commands - Tools

| Command | Tools Usadas | Frequencia |
|---------|-------------|------------|
| `/ul-study-start` | `context-hybrid`, `memread`, `memsearch`, `membrowse` | Alta |
| `/ul-study-end` | `data.createSession`, `data.updateStreak`, `memcommit` | Alta |
| `/ul-study-plan` | `memread`, `memsearch`, `membrowse` | Media |
| `/ul-data-status` | `memread`, `memsearch` | Media |
| `/ul-data-analytics` | `memread`, `memsearch` | Media |
| `/ul-data-dashboard` | `insights.showDashboard`, `insights.comparePeriods` | Media |
| `/ul-data-manage` | `data-core.initDataDir`, `data-core.resetAllData` | Baixa |
| `/ul-data-backup` | `data.createBackup` | Baixa |
| `/ul-practice-drill` | `data.createFlashcard` | Alta |
| `/ul-practice-feynman` | `data.createFlashcard` | Alta |
| `/ul-practice-quiz` | `insights.getDifficultyLevel`, `insights.getWeaknesses` | Alta |
| `/ul-practice-project` | `context-hybrid.getProjectInfo` | Media |
| `/ul-learn-debug` | `context-hybrid.getFullContext` | Media |
| `/ul-plan-weekly` | `context-hybrid`, `insights` | Media |
| `/ul-plan-adjust` | `context-hybrid`, `data.getSessions`, `insights` | Media |
| `/ul-plan-resources` | `context-hybrid` | Baixa |
| `/ul-module-switch` | `membrowse`, `memread`, `memcommit` | Media |
| `/ul-module-archive` | `memsearch`, `membrowse`, `memcommit` | Media |
| `/ul-module-create` | `membrowse`, `memcommit` | Baixa |
| `/ul-retro-weekly` | `memsearch`, `memread`, `memcommit` | Alta |

### Commands - Skills

| Command | Skill Invocada | Via |
|---------|---------------|-----|
| `/ul-study-start` | `session`, `openviking-context` | skill tool |
| `/ul-study-end` | `session` | skill tool |
| `/ul-practice-project` | `directness` | skill tool |
| `/ul-learn-debug` | `debug-socratic` | skill tool |
| `/ul-plan-decompose` | `decomposition` | skill tool |
| `/ul-memory-create` | `srs-generator` | skill tool |
| `/ul-memory-review` | `srs-generator` | skill tool |

### Tools - Shared (NOVO)

| Tool | Depende de (shared) | Tipo |
|------|---------------------|------|
| `data.ts` | `utils-csv`, `model-types` | Importacao |
| `data-session` | `utils-csv`, `model-types` | Importacao |
| `data-module` | `utils-csv`, `model-types` | Importacao |
| `data-flashcard` | `utils-csv`, `model-types` | Importacao |
| `data-insight` | `utils-csv`, `model-types` | Importacao |
| `data-core` | `utils-csv` | Importacao |
| `context-hybrid` | `utils-csv`, `openviking-utils`, `openviking-client`, `model-types` | Importacao |
| `insights` | `utils-csv`, `model-types` | Importacao |
| `status` | `utils-csv`, `model-types` | Importacao |
| `retro` | `utils-csv` (dynamic import) | Importacao |

### Analise de Acoplamento

**Shared Modules (novo diretorio)**:
- `utils-csv.ts`: Usado por 10+ tools (alto acoplamento — esperado como utilitario central)
- `model-types.ts`: Usado por 8 tools (tipos compartilhados)
- `openviking-utils.ts`: Usado por `context-hybrid.ts` (baixo acoplamento)
- `openviking-client.ts`: Usado por `openviking-utils.ts` e plugin (baixo acoplamento)

**Tools Sobrecarregadas**:
- `data.ts` (facade): Usada por 6+ commands (ponto central de falha)

**Tools Subutilizadas**:
- `setup.ts`: Usada por 1 command (`/ul-setup-check`)
- `retro.ts`: Usada por 1 command (`/ul-retro-weekly`)
- `status.ts`: Usada por 1 command (`/ul-data-status`)

**Skills Mais Usadas**:
- `session`: 2 commands (`/ul-study-start`, `/ul-study-end`)
- `srs-generator`: 2 commands (`/ul-memory-create`, `/ul-memory-review`)

**Skills Subutilizadas**:
- `openviking-context`: Referenciada por 1 command (`/ul-study-start`) mas listada para 4 agentes
- `decomposition`: 1 command (`/ul-plan-decompose`)
- `directness`: 1 command (`/ul-practice-project`)
- `debug-socratic`: 1 command (`/ul-learn-debug`)

---

## Coerencia com Projeto

- ✅ Commands seguem padra `ul-[categoria]-[acao]` (com 8 excecoes documentadas)
- ✅ Tools usam tipagem Zod e cache de 5 minutos
- ✅ Skills seguem estrutura `SKILL.md` com frontmatter
- ✅ Agentes tem Identidade, Missao, **Regras de Ouro** (NOVO), Keywords, Quick Reference, Checklist
- ✅ Nomenclatura kebab-case consistente em arquivos e diretorios
- ✅ `opencode.json` tem `setCacheKey: true` para prompt caching
- ✅ Separacao clara de responsabilidades (Commands -> Tools -> Skills -> Agents)
- ✅ **Modulos compartilhados migrados para `.opencode/shared/`** (NOVO)
- ✅ **Agentes otimizados com Regras de Ouro** (NOVO)
- ⚠️ Tres arquiteturas de dados coexistem (CSV, OpenViking, hibrida)
- ⚠️ Placeholders inconsistentes nos commands
- ❌ Skill `benchmarking` referenciada mas nao existe
- ~~❌ `context.ts` documentado mas nao existe~~ → ✅ RESOLVIDO (removido das tools, `context-hybrid.ts` e o unico)

---

## Problemas Identificados

### RESOLVIDOS desde a v1

| # | Problema | Status | Resolucao |
|---|----------|--------|-----------|
| 2 | `context.ts` nao existe — importacoes quebradas | ✅ RESOLVIDO | Arquivo removido das tools; `context-hybrid.ts` e o unico |
| 3 | `retro.ts` usa `this.execute()` — bug de runtime | ⚠️ PARCIAL | Import atualizado para `../shared/utils-csv.js`, mas `this.execute()` ainda presente na linha 140 |
| 11 | `sanitize()` e `parseMetadata()` nao usados | ⚠️ PARCIAL | Movidos para `shared/utils-csv.ts` mas ainda nao usados por nenhuma tool |
| 16 | Template de agente sem Regras de Ouro | ✅ RESOLVIDO | Template atualizado com `## Regras de Ouro` e `### Voce FALHA quando` |
| - | Agentes sem Regras de Ouro | ✅ RESOLVIDO | Todos os 4 agentes agora tem `## Regras de Ouro` apos a missao |
| - | Modulos compartilhados em tools/ | ✅ RESOLVIDO | `utils-csv.ts`, `model-types.ts`, `openviking-utils.ts`, `openviking-client.ts` migrados para `.opencode/shared/` |
| - | Agentes muito verbosos | ✅ RESOLVIDO | Secoes de codigo TypeScript repetidas substituidas por referencias concisas |

---

### 1. [CRITICO] Conflito arquitetural de persistencia de dados

**Descricao**: Tres arquiteturas de dados coexistem nos commands sem transicao clara.

**Evidencia**:
- `ul-study-end` (linhas 38-48): Referencia AMBOS `data({ operation: "createSession" })` (CSV) E `memcommit()` (OpenViking)
- `ul-data-manage`: Usa `data-core.*` (CSV direto)
- `ul-data-status`, `ul-data-analytics`: Usam `memread`/`memsearch` (OpenViking)
- `ul-data-dashboard`: Usa `insights.*` (TypeScript tools)
- `ul-practice-drill`, `ul-practice-feynman`: Usam `data.createFlashcard` (CSV)

**Impacto**: Dados podem ser salvos em CSV mas nao no OpenViking, ou vice-versa. Risco de inconsistencia de dados.

**Sugestao imediata**: Documentar claramente qual arquitetura cada command usa e criar guia de migracao. A medio prazo, consolidar em uma unica abordagem (hibrida com fallback).

---

### 2. [CRITICO] retro.ts ainda usa this.execute() — bug de runtime

**Descricao**: A funcao `createRetro` na linha 140 chama `await this.execute(...)` dentro de uma arrow function. O import foi atualizado para `../shared/utils-csv.js`, mas o bug de `this.execute()` permanece.

**Evidencia**: `retro.ts:140` — `const statsResult = await this.execute({ operation: "getWeeklyStats", moduleId }, context);`

**Impacto**: Runtime error ao executar `/ul-retro-weekly` com operacao `createRetro`.

**Sugestao imediata**: Refatorar para chamar a logica de `getWeeklyStats` diretamente como funcao helper, sem usar `this.execute()`.

---

### 3. [ALTO] Skill benchmarking referenciada mas nao existe

**Descricao**: O agente @meta referencia a skill `benchmarking` na sua tabela de Skills Disponiveis, mas nao existe diretorio `.opencode/skills/benchmarking/`.

**Evidencia**: `meta.md` lista `benchmarking` como skill, mas `.opencode/skills/` nao contem `benchmarking/SKILL.md`

**Impacto**: Quando `/ul-plan-benchmark` e invocado, a skill nao sera encontrada. O command funciona sem ela (gera markdown diretamente), mas a referencia e incorreta.

**Sugestao imediata**: Criar a skill `benchmarking` ou remover a referencia da tabela de skills do @meta.

---

### 4. [ALTO] Inconsistencia de placeholders nos commands

**Descricao**: Tres estilos diferentes de placeholders sao usados nos commands.

**Evidencia**:
- `$ARGUMENTS` (correto): 14 commands
- `$1`/`$2` (posicional): `ul-practice-drill`, `ul-practice-quiz`, `ul-memory-create`
- `<param>` (angle brackets): `ul-plan-adjust`, `ul-plan-resources`

**Impacto**: Commands com `$1`/`$2` podem nao receber argumentos corretamente dependendo da versao do OpenCode.

**Sugestao imediata**: Padronizar todos para `$ARGUMENTS` conforme documentacao do OpenCode.

---

### 5. [ALTO] updateStreak escreve insights.csv 4 vezes sequencialmente

**Descricao**: A funcao `updateStreak` em `data-insight.ts` faz 4 leituras e 4 escritas sequenciais no mesmo arquivo CSV.

**Evidencia**: `data-insight.ts` — `updateStreak` le e escreve `insights.csv` 4 vezes (streak, total_sessions, study_time_min, flashcards_reviewed)

**Impacto**: Ineficiencia e risco de race condition em operacoes concorrentes.

**Sugestao imediata**: Refatorar para batch: ler uma vez, modificar todos os registros, escrever uma vez.

---

### 6. [ALTO] Nomenclatura de commands viola padrao ul-[categoria]-[acao]

**Descricao**: 8 de 30 commands usam substantivos/adjetivos em vez de verbos na posicao `[acao]`.

**Evidencia**:
| Command | Acao Atual | Deveria Ser |
|---------|-----------|-------------|
| `ul-data dashboard` | dashboard (substantivo) | `show` ou `view` |
| `ul-data-status` | status (substantivo) | `check` ou `view` |
| `ul-data-analytics` | analytics (substantivo) | `analyze` ou `report` |
| `ul-practice-project` | project (substantivo) | `build` ou `create` |
| `ul-practice-feynman` | feynman (nome proprio) | `explain` ou `validate` |
| `ul-plan-weekly` | weekly (adjetivo) | `schedule` ou `create` |
| `ul-plan-resources` | resources (substantivo) | `map` ou `find` |
| `ul-retro-weekly` | weekly (adjetivo) | `reflect` ou `review` |

**Impacto**: Baixo (funcional), mas inconsistente com a convencao declarada.

**Sugestao imediata**: Aceitar como estao (sao mnemonicos estabelecidos) e documentar a excecao.

---

### 7. [ALTO] getUserId() inconsistente entre utils-csv e openviking-utils

**Descricao**: `utils-csv.ts` retorna `process.env.USER || "dani"` enquanto `openviking-utils.ts` retorna `"default"` como fallback.

**Evidencia**:
- `shared/utils-csv.ts:93` — `process.env.USER || "dani"`
- `shared/openviking-utils.ts:36,67` — fallback `"default"`

**Impacto**: Dados em CSV usam user "dani" enquanto dados em OpenViking usam "default". Se o sistema tentar cruzar dados, havera incompatibilidade.

**Sugestao imediata**: Unificar `getUserId()` para usar uma unica fonte de verdade (preferencialmente OpenViking com fallback para env var).

---

### 8. [MEDIO] setup.ts usa APIs especificas do Bun

**Descricao**: `Bun.spawn` e `Bun.file` sao APIs exclusivas do runtime Bun, nao disponives em Node.js.

**Evidencia**: `setup.ts` — `Bun.spawn` para verificar dependencias, `Bun.file` para verificar diretorios

**Impacto**: Tool nao funciona em Node.js. Se o projeto migrar de Bun, a tool quebra.

**Sugestao imediata**: Documentar dependencia do Bun ou abstrair com `child_process.exec`.

---

### 9. [MEDIO] status.ts tem argumento includeProgressBar nao utilizado

**Descricao**: O schema Zod define `includeProgressBar` como argumento opcional, mas a funcao execute nunca o usa.

**Evidencia**: `status.ts` — schema define `includeProgressBar: z.boolean().default(true)` mas a logica sempre inclui a barra de progresso.

**Sugestao imediata**: Implementar a logica condicional ou remover o argumento do schema.

---

### 10. [MEDIO] sanitize() e parseMetadata() em shared/utils-csv.ts nao sao usados

**Descricao**: As funcoes `sanitize()` e `parseMetadata()` foram movidas para `shared/utils-csv.ts` mas continuam sem consumidores.

**Evidencia**: `shared/utils-csv.ts:97-115` — funcoes exportadas mas sem importadores

**Sugestao imediata**: Remover ou marcar como deprecated se planejado para uso futuro.

---

### 11. [MEDIO] Goal type definido mas nunca usado

**Descricao**: O tipo `Goal` e definido em `shared/model-types.ts` mas nao e importado por nenhuma tool. O arquivo `data/goals.csv` existe mas nenhuma tool le ou escreve nele.

**Sugestao imediata**: Implementar CRUD para goals ou remover o tipo e o CSV.

---

### 12. [MEDIO] HOW_TO_USE.md desatualizado em 3 pontos

**Descricao**: Documentacao de uso tem referencias desatualizadas.

**Evidencia**:
1. Referencia `/ul-setup-verify` e `/ul-setup-init` que nao existem
2. Link para `proposta-openviking-integration-2026-03-13.md` (arquivado)
3. Secao "Sistema de Dados": Referencia `analytics.generateReport` (agora e `insights.generateReport`)

**Sugestao imediata**: Atualizar referencias e corrigir nomes de tools.

---

### 13. [MEDIO] ul-review-audit diz "29 commands" mas existem 30

**Evidencia**: `ul-review-audit.md` linha 50: "Analisar **29 commands** em `.opencode/commands/`"

**Sugestao imediata**: Atualizar para 30.

---

### 14. [MEDIO] Template de agente vs realidade — YAML frontmatter

**Descricao**: O template `_template-agent.md` inclui YAML frontmatter com configuracao, mas os agentes reais usam `opencode.json`. O template foi atualizado com Regras de Ouro, mas ainda sugere frontmatter YAML.

**Sugestao imediata**: Atualizar template para documentar que a configuracao vai em `opencode.json`, nao no arquivo `.md`.

---

### 15. [BAIXO] readCSV mascara erros retornando []

**Descricao**: `shared/utils-csv.ts` retorna array vazio para qualquer erro (arquivo nao encontrado, CSV malformado, permissao negada).

**Sugestao imediata**: Adicionar logging ou diferenciar entre "arquivo nao existe" (OK) e "CSV malformado" (erro).

---

### 16. [BAIXO] createBackup em data-core.ts tem risco de shell injection

**Descricao**: `createBackup` usa `child_process.exec` com `tar -czf` e caminho de backup.

**Sugestao imediata**: Sanitizar `backupDir` ou usar `execFile` com argumentos separados.

---

### 17. [BAIXO] getPeriodFromDuration em insights.ts usa duracao como proxy para horario

**Descricao**: A funcao mapeia duracao da sessao para periodo do dia, o que nao faz sentido semantico.

**Sugestao imediata**: Usar campo `date` (que contem timestamp) para determinar horario real, ou remover esta metrica.

---

### 18. [BAIXO] srs-generator skill e desproporcionalmente longa

**Descricao**: A skill `srs-generator` tem 634 linhas, enquanto a media das outras e ~225 linhas.

**Sugestao imediata**: Considerar dividir em `srs-generator` (criacao) e `srs-review` (revisao socratica).

---

## Sugestoes de Melhoria

### Pequenas (Quick Wins)

1. **Atualizar contagem de commands** — Corrigir "29" para 30 em `ul-review-audit.md` e README
2. **Corrigir referencias a commands inexistentes** — Remover `/ul-setup-verify` e `/ul-setup-init` do HOW_TO_USE
3. **Remover `context.ts` do README** — Ja nao existe (RESOLVIDO na migracao)
4. **Remover codigo morto em `shared/utils-csv.ts`** — `sanitize()` e `parseMetadata()` sem consumidores
5. **Implementar ou remover `includeProgressBar` em `status.ts`** — Argumento definido mas nao utilizado

### Medias (Proximo Sprint)

6. **Corrigir bug em `retro.ts` — `this.execute()`** — Refatorar para chamar logica diretamente ou usar helper
7. **Otimizar `updateStreak` — batch writes** — Ler uma vez, modificar todos, escrever uma vez
8. **Unificar `getUserId()`** — Criar funcao centralizada que consulta OpenViking primeiro, com fallback para env var
9. **Padronizar placeholders nos commands** — Migrar todos para `$ARGUMENTS`
10. **Criar skill `benchmarking` ou remover referencia** — @meta referencia skill inexistente
11. **Atualizar HOW_TO_USE.md** — Corrigir nomes de tools, links e commands inexistentes

### Grandes (Estrategicas)

12. **Consolidar arquitetura de dados** — Migrar commands para `context-hybrid.ts` como ponto unico de entrada
13. **Decidir sobre nomenclatura de commands** — Aceitar substantivos ou renomear
14. **Avaliar divisao de `srs-generator`** — Dividir em criacao e revisao socratica
15. **Adicionar logging diferenciado em `readCSV`** — Diferenciar "arquivo nao existe" de "CSV malformado"

---

## Resumo Executivo

### Estatisticas
- ✅ **27** verificacoes passaram (4 resolvidas desde v1)
- ⚠️ **8** alertas/avisos (nao criticos, 4 reduzidos desde v1)
- ❌ **2** erros criticos (1 resolvido, 1 parcial)
- 💡 **15** sugestoes de melhoria (5 reduzidas desde v1)

### Veredito Geral
**Projeto saudavel com melhorias em andamento** — A migracao para `.opencode/shared/` e a adicao de Regras de Ouro nos agentes sao melhorias significativas. Os 2 problemas criticos restantes (conflito arquitetural de dados e bug em `retro.ts`) sao solveis em 1 sprint. A consistencia dos agentes melhorou substancialmente com as Regras de Ouro.

### Progresso desde v1
| Problema | v1 | v2 |
|----------|----|----|
| `context.ts` fantasma | CRITICO | ✅ RESOLVIDO |
| `retro.ts` this.execute() | CRITICO | ⚠️ PARCIAL (imports corrigidos, bug permanece) |
| Codigo morto (sanitize/parseMetadata) | MEDIO | ⚠️ PARCIAL (movido para shared/, ainda sem uso) |
| Template de agente sem Regras de Ouro | MEDIO | ✅ RESOLVIDO |
| Agentes sem Regras de Ouro | ALTO | ✅ RESOLVIDO |
| Modulos compartilhados em tools/ | MEDIO | ✅ RESOLVIDO (migrado para shared/) |
| Agentes muito verbosos | MEDIO | ✅ RESOLVIDO (reduzidos ~40%) |

---

## Acoes Recomendadas (Priorizadas)

### Imediatas (Esta semana)
1. [ ] Corrigir bug em `retro.ts` — substituir `this.execute()` por funcao helper
2. [ ] Atualizar contagem de commands (29 → 30) em `ul-review-audit.md` e README
3. [ ] Corrigir referencias a `/ul-setup-verify` e `/ul-setup-init` no HOW_TO_USE
4. [ ] Criar skill `benchmarking` ou remover referencia do @meta
5. [ ] Remover codigo morto (`sanitize`, `parseMetadata`) de `shared/utils-csv.ts`

### Curto prazo (Proximas 2-4 semanas)
6. [ ] Padronizar placeholders nos commands (`$ARGUMENTS` para todos)
7. [ ] Unificar `getUserId()` entre `shared/utils-csv.ts` e `shared/openviking-utils.ts`
8. [ ] Otimizar `updateStreak` para batch writes
9. [ ] Implementar ou remover `includeProgressBar` em `status.ts`
10. [ ] Atualizar HOW_TO_USE.md (nomes de tools, links, commands)
11. [ ] Documentar qual arquitetura de dados cada command usa

### Medio prazo (Proximos 2-3 meses)
12. [ ] Consolidar arquitetura de dados (migrar commands para `context-hybrid`)
13. [ ] Decidir sobre nomenclatura de commands (aceitar substantivos ou renomear)
14. [ ] Avaliar divisao de `srs-generator` em duas skills
15. [ ] Adicionar logging diferenciado em `readCSV`

### Longo prazo (Considerar para futuro)
16. [ ] Migrar `Review` type para incluir `id` e `user_id`
17. [ ] Remover `Goal` type ou implementar funcionalidade de goals
18. [ ] Considerar internacionalizacao (strings em PT-BR hardcoded)
19. [ ] Avaliar migracao de CSV para SQLite para queries mais complexas

---

## Referencias

- [Documentacao OpenCode - Commands](https://opencode.ai/docs/commands/)
- [Documentacao OpenCode - Custom Tools](https://opencode.ai/docs/custom-tools/)
- [Documentacao OpenCode - Agents](https://opencode.ai/docs/agents/)
- [Documentacao OpenCode - Skills](https://opencode.ai/docs/skills/)
- `reviews/agents-meta-tutor-audit-2026-04-09-v1.0.0.md` — Auditoria anterior de agentes
- `planning/proposta-melhorias-agentes-agency-2026-04-09.md` — Proposta de melhorias ativa
- `reviews/_template-framework-review.md` — Template usado para este relatorio

---

## Notas Adicionais

### Mudancas aplicadas desde a v1

A migracao para `.opencode/shared/` e a adicao de Regras de Ouro nos agentes sao melhorias significativas que abordam problemas identificados na auditoria v1 e na proposta `proposta-melhorias-agentes-agency-2026-04-09.md`. Especificamente:

1. **Modulos compartilhados**: `utils-csv.ts`, `model-types.ts`, `openviking-utils.ts`, `openviking-client.ts` agora estao em `.opencode/shared/`, separando claramente codigo de infraestrutura de codigo de tools.
2. **Regras de Ouro**: Todos os 4 agentes agora tem `## Regras de Ouro` logo apos a missao, abordando o problema #1 da auditoria de agentes.
3. **Agentes otimizados**: Secoes de codigo TypeScript repetidas foram substituidas por referencias concisas, reduzindo o tamanho dos agentes em ~40%.
4. **Template atualizado**: `_template-agent.md` agora inclui `## Regras de Ouro` e `### Voce FALHA quando`.

### Sobre a Versao

O arquivo `VERSION` indica `3.4.0`. O README e HOW_TO_USE ainda referenciam funcionalidades da v3.2/v3.3 em alguns pontos. Recomenda-se sincronizar a documentacao com a versao atual.

### Sobre o @brainstorm

O agente @brainstorm nao foi incluido na auditoria de agentes anterior (focada em @meta e @tutor). Uma auditoria dedicada do @brainstorm seria valiosa, especialmente considerando que ele nao tem secao "Skills Disponiveis" e referencia apenas @review como handoff.

---

*Revisao gerada pelo agente @review (v2 — atualizada pos-migracao)*
*Template: `reviews/_template-framework-review.md`*