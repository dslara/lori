# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [3.4.0] - 2026-04-08

### 🔧 Revisão de Consistência — Ações Implementadas

#### Adicionado
- **Agente @brainstorm**: Configurado em `opencode.json` com `temperature: 0.7`
- **Operações migradas para `context-hybrid.ts`**: `getWeekContext`, `getSRSPending`, `getProjectInfo`, `getCurrentModule`
- **Documentação de model routing**: `docs/model-routing.md`
- **Frontmatter em skills**: `openviking-context` e `session` agora têm frontmatter completo
- **VERSION atualizado**: `3.2.0` → `3.3.0`

#### Modificado
- **`ul-plan-weekly`**: Consolidado com `ul-plan-weekly-create` (objetivo SMART + revisão semana anterior + tools context-hybrid)
- **`context-hybrid.ts`**: Adicionadas 4 operações (`getWeekContext`, `getSRSPending`, `getProjectInfo`, `getCurrentModule`)
- **Referências atualizadas**: Commands e agentes atualizados de `context.` para `context-hybrid.`
- **Referências atualizadas**: `ul-plan-weekly-create` → `ul-plan-weekly` em todos os agentes
- **`#audit-quality`**: Substituída por `/ul-review-audit` em @meta e @tutor

#### Removido
- **`ul-plan-weekly-create.md`**: Consolidado em `ul-plan-weekly.md`
- **`context.ts`**: Depreciado (renomeado para `context.ts.deprecated`)

---

## [3.3.0] - 2026-03-20

### 🔧 Arquitetura de Dados Híbrida — Consolidação

#### Adicionado
- **`openviking-utils.ts`**: Utilitários para descoberta dinâmica de ID do agente OpenViking
- **`context-hybrid.ts`**: Tool que integra CSV + OpenViking com descoberta dinâmica de ID
- **Campo `correct` em `session_skills.csv`**: Derivado de `success_rating >= 6`
- **Campo `preferences_source` em `users.csv`**: Indica fonte de preferências (`openviking`)

#### Removido
- **`tutor_interactions.csv`**: Dados migrados para `session_skills.csv` (métricas) e OpenViking `cases/` (contexto)
- **`data-interaction.ts`**: Funcionalidade removida (era redundante com `session_skills`)
- **Função `logTutorInteraction()`** em `utils-csv.ts`: Removida
- **Operação `createInteraction`** da tool `data`: Removida

#### Modificado
- **`utils-csv.ts`**: Removido `tutorInteractions` dos headers
- **`session_skills.csv`**: Adicionado campo `correct` (bool, derivado de success_rating >= 6)
- **`insights.ts`**: Usa `session_skills` para métricas (era `tutor_interactions`)
- **`users.csv`**: Campo `preferences` renomeado para `preferences_source`
- **Documentação atualizada**: README.md, docs/tools.md, docs/agents.md, docs/openviking-migration.md, guides/sistema-dados.md
- **Commands atualizados para usar `session_skills` ou `memcommit()`**:
  - `/ul-practice-quiz`
  - `/ul-practice-drill`
  - `/ul-practice-feynman`
  - `/ul-practice-project`
  - `/ul-learn-debug`
  - `/ul-plan-decompose`
- **Skills atualizadas**: `srs-generator/SKILL.md`

#### Migração
- Dados de `tutor_interactions.csv` foram migrados para:
  - **Métricas**: `session_skills.csv` (campo `correct`)
  - **Contexto conversacional**: OpenViking `cases/` (via `memcommit()`)
- Preferências de `users.preferences` movidas para OpenViking `preferences/`

---

## [3.2.1] - 2026-03-12

### 🔧 Refatoração — Consistência e Consolidação

#### Adicionado
- **Command `/ul-plan-weekly-create`**: Criar plano semanal (converte keyword `#create-weekly-plan`)
- **Guia `guides/habit-stacking.md`**: Documentação completa de empilhamento de hábitos (Atomic Habits)
- **Tool `insights.ts`**: Consolidação de 5 tools de análise em uma única tool unificada
  - Substitui: `analytics.ts`, `effectiveness.ts`, `patterns.ts`, `weakness.ts`, `dashboard.ts`
  - Cache inteligente: carrega dados uma única vez
  - Todas as operações mantidas com nomes compatíveis

#### Modificado
- **`/ul-study-end`**: Adicionada funcionalidade de atualização automática do plano semanal
  - Pergunta se completou entregas do plano
  - Atualiza `week-*.md` automaticamente (marca checkboxes e adiciona notas)
  - Elimina necessidade de `#update-plan` keyword
- **Commands atualizados para usar `insights.ts`**: 8 commands migrados das tools antigas
  - `/ul-study-start`: `analytics.getErrorRateByTopic` → `insights.getWeaknesses`
  - `/ul-study-plan`: `analytics.generateReport`, `analytics.getErrorRateByTopic`, `analytics.getMostUsedSkill` → `insights.*`
  - `/ul-study-end`: `analytics.generateReport` → `insights.generateReport`
  - `/ul-plan-weekly`, `/ul-plan-adjust`, `/ul-memory-create`, `/ul-practice-quiz`, `/ul-memory-review`: todas as referências atualizadas
- **Documentação de Skills no @tutor.md**:
  - Corrigida lista de skills (5 reais + 6 commands inline)
  - Removidas referências a skills inexistentes
- **Padronização de frontmatter**: Removido colchete de `agent` em `srs-generator`
- **Nomenclatura**: Atualizadas 50+ referências de `/ul-plan-retro` para `/ul-retro-weekly`
- **Contagem de técnicas**: Atualizado de 23 para 24 (adicionado habit-stacking)

#### Removido
- **Command `/ul-plan-retro`**: Duplicado com `/ul-retro-weekly`
- **Keywords @meta**: `#create-weekly-plan`, `#update-plan`, `#habit-stack` (convertidas ou removidas)

#### Removido
- **5 Tools legadas**: `analytics.ts`, `effectiveness.ts`, `patterns.ts`, `weakness.ts`, `dashboard.ts`
  - Todas as referências atualizadas para usar `insights.ts`
  - Redução de 1577 linhas → 500 linhas (-68%)

#### Contexto
Esta refatoração elimina duplicações e padroniza a documentação. Keywords órfãs foram convertidas em commands ou removidas. Skills inexistentes foram corretamente documentadas como commands inline. **Consolidação e limpeza das tools de análise**: 5 tools → 1 tool `insights.ts`, reduzindo complexidade e melhorando performance com cache unificado. Total de 35 arquivos modificados/criados/removidos.

---

## [3.2.0] - 2026-03-12

### 🔧 Refatoração — Modularização de data.ts

#### Adicionado
- **Command `/ul-plan-adjust`**: Reajustar cronograma baseado em desvios
- **Command `/ul-plan-resources`**: Mapear recursos de estudo em 3 tiers
- **Seção "Keywords Avançadas" no README**: Documenta keywords internas dos agentes

#### Modificado
- **`data.ts`**: Refatorado em 6 módulos para melhor manutenção
  - `data-session.ts`: Operações de sessão
  - `data-module.ts`: Operações de módulo
  - `data-flashcard.ts`: Operações de flashcard/SRS
  - `data-insight.ts`: Operações de insights/streak
  - `data-interaction.ts`: Operações de interação
  - `data-core.ts`: Operações core (init, backup, reset)
- **`tutor.md`**: Atualizado para usar `data.createInteraction` em vez de `tutorLog`
- **`review.md`**: Atualizado lista de tools (removido `tutor-log.ts`)
- **`HOW_TO_USE.md`**: Adicionado `/ul-plan-adjust` e `/ul-plan-resources` na tabela

#### Removido
- **`tutor-log.ts`**: Funcionalidade integrada em `data.ts`
- **Keywords `#map-resources` e `#adjust-plan`**: Removidas do agente @meta (redundantes com os commands)

#### Contexto
Esta refatoração modulariza o arquivo `data.ts` (741 → ~226 linhas como facade), facilitando manutenção e testes. Tool `tutor-log` foi consolidada em `data.ts` para simplificar a arquitetura. Dois novos commands expõem keywords internas do @meta.

**Total de arquivos modificados**: 12 arquivos

---

## [3.1.1] - 2026-03-11

### 🔧 Corrigido — Consistência de Documentação

#### Atualizado
- **@review.md**:
  - Contagem de commands corrigida: 22 → 29
  - Keyword `#review-scripts` marcada como DESCONTINUADA
  - Quick Reference atualizado
  - Exemplos de interação atualizados para usar `#review-tools`
- **@tutor.md**:
  - Referências a `./scripts/tutor-*.sh` substituídas por tools TypeScript
  - Exemplos de código atualizados para usar `tutorLog()` e `analytics.*`
- **@meta.md**:
  - Referências a `make start/study/end` atualizadas para commands `/ul-*`
- **ul-review-audit.md**:
  - Passo 5 (Revisão de Scripts) removido
  - Passos renumerados (6→5, 7→6, 8→7)
  - Contagem de commands atualizada: 22 → 29
- **README.md**:
  - Estrutura de diretórios atualizada (removido `scripts/`, `Makefile`)
  - Tabela de pastas atualizada com `.opencode/commands/` e `.opencode/tools/`
  - Seção "Agentes & Skills" reescrita para refletir arquitetura v3.0
  - Workflow diário atualizado para usar commands `/ul-*`
  - Referências a `make` removidas
- **HOW_TO_USE.md**:
  - Quick Start atualizado: `make setup` → `/ul-setup-check`
  - Tabela de keywords substituída por tabela de commands
  - Seção "Inline Keywords" removida
  - Contagem de commands corrigida: 22 → 29
  - Referências a `make` removidas
  - Exemplos de troubleshooting atualizados
- **reviews/README.md**:
  - Tabela de tipos de revisão atualizada
  - `#review-scripts` → `#review-tools` (scripts bash migrados)
  - `#review-makefile` → `#review-commands`
  - Comandos de geração atualizados para `/ul-review-audit`
- **projects/README.md**:
  - `make module` → `/ul-module-create`
  - `make switch` → `/ul-module-switch`
  - `make start` → `/ul-study-start`
  - `make status` → `/ul-data-status`
  - `#scaffold` → `/ul-setup-scaffold`
- **archived/README.md**:
  - `make archive` → `/ul-module-archive`
- **planning/README.md**:
  - Referência a Makefile removida da tabela de responsabilidades
  - Comandos atualizados para `/ul-*`
- **projects/M*/README.md** (8 arquivos):
  - `make start` → `/ul-study-start`
- **projects/M1-math-foundations/projects/symbols-essentials/**:
  - `#srs-generator` → `/ul-memory-create`
  - `make review` → `/ul-memory-review`
  - `make study` → `/ul-practice-feynman`
  - `#zombie` → `/ul-productivity-start`
  - `#intuition` → `/ul-learn-explain`
- **guides/sistema-dados.md**:
  - `make backup` → `/ul-data-backup`
- **guides/principios/*.md**:
  - Todas as referências a `make start/study/end/retro` atualizadas
- **guides/tecnicas/*.md**:
  - Todas as referências a `make start/study/end/review/retro` atualizadas
- **skills/*.md**:
  - Referências a `make start/study/end/review` atualizadas
- **data/schema.md**:
  - `make backup` → `/ul-data-backup`
- **MIGRATION.md**:
  - `@tutor #start/#end` → `/ul-study-start/-end`

#### Contexto
Esta atualização remove TODAS as referências obsoletas a scripts bash, Makefile e keywords que foram migrados para commands unificados `/ul-*` e tools TypeScript. A documentação agora reflete corretamente a arquitetura v3.0.

**Total de arquivos atualizados**: ~30 arquivos

---

## [3.1.0] - 2026-03-10

### 🚀 Breaking Changes — Migração Completa para TypeScript

**Zero scripts bash** — 100% da lógica migrada para tools TypeScript.

#### Removido
- **Todos os scripts bash** (7 arquivos):
  - `scripts/module.sh` → `/ul-module-create`
  - `scripts/switch.sh` → `/ul-module-switch`
  - `scripts/archive.sh` → `/ul-module-archive`
  - `scripts/backup.sh` → `/ul-data-backup`
  - `scripts/setup.sh` → `/ul-setup-check`
  - `scripts/retro.sh` → `/ul-retro-weekly`
  - `scripts/review.sh` → `/ul-memory-review`
- **Dependências de bash**: `common.sh`, `data.sh` (não existiam mas eram referenciados)

#### Adicionado — 4 Novas Tools TypeScript

**`data.ts` (estendida)**:
- `createModule` — Criar novo módulo com estrutura completa
- `switchModule` — Alternar módulo ativo
- `archiveModule` — Arquivar módulo finalizado
- `createBackup` — Criar backup dos dados CSV

**`setup.ts` (nova)**:
- `checkDependencies` — Verificar jq, bc, opencode, bun
- `initialize` — Criar estrutura de diretórios
- `verify` — Verificar integridade do sistema

**`retro.ts` (nova)**:
- `getWeeklyStats` — Estatísticas automáticas da semana
- `createRetro` — Criar retrospectiva com template
- `listRetros` — Listar retrospectivas anteriores

#### Adicionado — 6 Novos Commands

**Commands de Módulos (`/ul-module-*`)**:
- `/ul-module-create [nome]` — Criar novo módulo de estudo
- `/ul-module-switch [nome]` — Alternar módulo ativo
- `/ul-module-archive [nome]` — Arquivar módulo finalizado

**Commands de Setup e Backup**:
- `/ul-setup-check` — Verificar dependências do sistema
- `/ul-data-backup` — Criar backup dos dados
- `/ul-retro-weekly` — Criar retrospectiva semanal

#### Modificado
- **Makefile**: Atualizado para v3.0, todos targets redirecionam para commands
- **README.md**: Tabela de commands expandida (24 → 29 commands)
- **@tutor.md**: Tutoriais atualizados para usar tools TypeScript
- **@meta.md**: Referências de keywords atualizadas
- **Skills**: 20+ referências a keywords substituídas por commands

#### Benefícios
- ✅ **Zero dependência bash** — Portabilidade total
- ✅ **Tipagem forte** — Erros em tempo de compilação
- ✅ **Testes automatizados** — Confiabilidade (pendente)
- ✅ **Error handling consistente** — Try/catch padronizado
- ✅ **Interface unificada** — 100% via `/` no TUI

#### Migração de Dados
Não há migração de dados necessária. Todos os CSVs permanecem inalterados.

---

## [3.0.0] - 2026-03-09

### 🚀 Breaking Changes — Migração para Commands Unificados

A interface completa do sistema foi migrada de **keywords para commands unificados**.

#### Removido
- **Todas as keywords**: `@tutor #*`, `@meta #*`, `@review #*`
- **9 Skills eliminadas**: drill, feynman, quiz, explain-concept, zombie-mode, scaffold, retrospective, benchmarking, tutor-log
- **Interface dispersa**: Não há mais separação entre @tutor, @meta e commands

#### Adicionado — 22 Commands Unificados

**Commands de Sessão (`/ul-study-*`):**
- `/ul-study-start` — Iniciar sessão com contexto
- `/ul-study-end` — Encerrar e salvar progresso  
- `/ul-study-plan` — Ver progresso da semana

**Commands de Prática (`/ul-practice-*`):**
- `/ul-practice-drill` — Prática deliberada 5-10x
- `/ul-practice-feynman` — Técnica Feynman
- `/ul-practice-quiz` — Quiz adaptativo
- `/ul-practice-project` — Projetos reais (wrapper para skill directness)

**Commands de Aprendizado (`/ul-learn-*`):**
- `/ul-learn-explain` — Introduzir conceito novo
- `/ul-learn-debug` — Debug socrático (wrapper para skill debug-socratic)

**Commands de Produtividade (`/ul-productivity-*`):**
- `/ul-productivity-start` — Two-Minute Rule (antigo #zombie)
- `/ul-productivity-break` — Modo difuso (antigo #diffuse)

**Commands de Setup (`/ul-setup-*`):**
- `/ul-setup-scaffold` — Criar estrutura de projeto

**Commands de Memória (`/ul-memory-*`):**
- `/ul-memory-create` — Criar flashcard
- `/ul-memory-review` — Revisar flashcards (wrapper para skill srs-generator)

**Commands de Planejamento (`/ul-plan-*`):**
- `/ul-plan-decompose` — Decompor objetivo (wrapper para skill decomposition)
- `/ul-plan-retro` — Retrospectiva semanal
- `/ul-plan-benchmark` — Criar teste de proficiência
- `/ul-plan-weekly` — Criar plano semanal

#### Modificado
- **Skill `session`**: Reduzida de ~313 para ~152 linhas (helpers apenas)
- **Tutor-log**: Tornou-se função built-in nas tools (`logTutorInteraction`)
- **Arquitetura**: Commands inline para lógica simples, skills apenas para complexidade

#### Benefícios
- Interface **100% unificada** via `/` no TUI
- **64% menos skills** (14 → 5)
- **Zero keywords** — apenas commands
- **Mais intuitivo**: Nomes descritivos (`/ul-productivity-start` vs `#zombie`)
- **Escalável**: Fácil adicionar novos commands

---

## [Não Publicado]

### 🚀 Nova Arquitetura: Tools + Commands

#### Breaking Changes
- **Scripts bash removidos**: `data.sh`, `analytics.sh`, `status.sh`, `common.sh`
- **Comandos `make` deprecados**: `make status`, `make analytics` (usar `/commands` no TUI)
- **Nova interface**: Commands no TUI (`/ul-data-status`, `/ul-data-analytics`, `/ul-data-manage`)

#### ✨ Added
- **Tools TypeScript** (`.opencode/tools/`):
  - `data` — CRUD completo nos CSVs com parsing robusto
  - `context` — Contexto da sessão (módulo, sessões recentes, SRS)
  - `analytics` — Cálculos de métricas e relatórios
  - `status` — Resumo visual com progress bar
- **Commands** (`.opencode/commands/`):
  - `/ul-data-status` — Status geral (streak, sessões, módulo)
  - `/ul-data-analytics` — Analytics detalhados
  - `/ul-data-dashboard` — Dashboard consolidado
  - `/ul-data-manage` — Gerenciamento de dados
- **Integração automática**: `@tutor` invoca tools automaticamente
- **Dependencies**: `csv-parse`, `csv-stringify`, `date-fns` para manipulação robusta

#### 🔧 Improved
- Parsing de CSV com `csv-parse` (mais robusto que grep/awk)
- Manipulação de datas com `date-fns`
- Error handling padronizado em todas as tools
- Retornos tipados com Zod

#### 📚 Documentation
- `HOW_TO_USE.md` — Atualizado com novos commands
- `README.md` — Nova arquitetura documentada
- `guides/sistema-dados.md` — Reescrito para tools
- `MIGRATION.md` — Guia de migração v1.x → v2.0

### 🚀 Fase 2: Analytics Tools

#### Breaking Changes
- **Scripts bash removidos**: `weakness-analysis.sh`, `skill-effectiveness.sh`, `patterns.sh`, `dashboard.sh`
- **Comandos `make` removidos**: `make skill-effectiveness`, `make patterns`, `make dashboard`, `make weaknesses`

#### ✨ Added
- **Analytics Tools** (`.opencode/tools/`):
  - `weakness` — Identifica pontos fracos e sugere técnicas
  - `effectiveness` — Calcula efetividade de cada técnica
  - `patterns` — Analisa padrões (melhor horário, duração ideal, fadiga)
  - `dashboard` — Dashboard consolidado (chama outras tools)
- **Command** (`.opencode/commands/`):
  - `/ul-data-dashboard` — Visão geral completa
- **Cache**: Todas as tools implementam cache de 5 minutos para performance

#### 🔧 Improved
- Agente `@tutor` atualizado para usar tools em vez de scripts
- Análises mais rápidas com cache
- Integração nativa entre tools (dashboard chama weakness, effectiveness, patterns)

### 🚀 Fase 3: Tutor Log Tool

#### Breaking Changes
- **Script bash removido**: `tutor-log.sh` (substituído por tool)
- **Script atualizado**: `review.sh` corrigido para usar `data` tool ao invés de `spaced-repetition.sh`

#### ✨ Added
- **Tool** (`.opencode/tools/`):
  - `tutor-log` — Registrar e consultar interações do tutor
    - `logInteraction` — Registrar nova interação
    - `getInteractionsByTopic` — Buscar por tópico
    - `getInteractionsBySession` — Buscar por sessão
    - `getRecentInteractions` — Últimas N interações
  - Cache: 5 minutos

#### 📚 Documentation
- `.opencode/skills/tutor-log/SKILL.md` — Atualizado para usar tool TypeScript
- `.opencode/agents/tutor.md` — Referências atualizadas para tool

### 🚀 Fase 4: Limpeza Final de Scripts

#### Breaking Changes
- **Scripts bash removidos**: `break.sh`, `drill-extra.sh`, `plan.sh`, `resources.sh`
- **Comandos `make` removidos**: `make break`, `make drill-extra`, `make plan`, `make resources`

#### Motivação
Esses scripts eram apenas **wrappers** que chamavam agents. Agora o usuário deve usar agents diretamente:

| Antigo | Novo |
|--------|------|
| `make break` | `@tutor #diffuse` |
| `make drill-extra` | `@tutor "#drill [conceito] variações"` |
| `make plan` | `@meta #create-weekly-plan` |
| `make resources` | `@meta #map-resources` |

#### 📚 Documentation
- `HOW_TO_USE.md` — Atualizado com comandos novos
- `.opencode/agents/tutor.md` — Referências atualizadas
- `.opencode/skills/drill/SKILL.md` — Atualizado
- `.opencode/skills/zombie-mode/SKILL.md` — Atualizado
- `.opencode/skills/benchmarking/SKILL.md` — Atualizado
- `.opencode/skills/decomposition/SKILL.md` — Atualizado
- `guides/checklist.md` — Atualizado
- `guides/quickstart.md` — Atualizado
- `guides/tecnicas/decomposition.md` — Atualizado
- `guides/principios/1-metalearning.md` — Atualizado
- `.github/copilot-instructions.md` — Atualizado

### 🚀 Fase 5: Remoção de Script Não Utilizado

#### Breaking Changes
- **Script bash removido**: `sync-flashcards.sh` (funcionalidade de sincronização com Anki não utilizada)
- **Comando `make` removido**: `make sync-flashcards`

#### Motivação
O script `sync-flashcards.sh` criava um `master-deck.csv` agregando flashcards de todos os módulos para uso com Anki. Como a revisão de flashcards agora é feita diretamente via `@tutor #srs-generator review` usando os dados do `data/flashcards.csv`, esta funcionalidade tornou-se obsoleta.

### 🚀 Atualização do Agente @review

**Contexto**: O agente @review foi atualizado para refletir a nova arquitetura v2.0 (Tools TypeScript).

#### Mudanças no Agente

- **Contexto e Continuidade**: Atualizado para separar scripts de sistema vs tools
- **#review-scripts**: Foca apenas nos 7 scripts de sistema (não mais em scripts de dados)
- **#review-tools**: NOVA KEYWORD — Revisar as 9 Tools TypeScript
- **#review-makefile**: Atualizado com contexto dos comandos removidos na migração
- **#review-architecture**: Atualizado para refletir migração já concluída
- **Exemplos de Interação**: Atualizado para remover referências a scripts removidos
- **Quick Reference**: Adicionada `#review-tools`

## [3.1.0] - 2026-03-02

### Added
- **Agente `@run`** integrado ao `opencode.json` — executor de comandos make sem sair do chat
  * Keywords documentadas no README e no diagrama de arquitetura
- **`planning/archived/`** — proposta obsoleta `proposta-claude-code-2026-02-27.md` arquivada

### Changed
- **`VERSION`** atualizado de `2.7.1` → `3.1.0`
- **`@review`** marcado como `hidden: true` no `opencode.json`
- **`@session`** — Model Routing corrigido (Claude/Haiku → GLM-4.7); pronomes pt-PT → pt-BR
- **`@review`** — contagem de agentes corrigida ("3 agentes" → "5 agentes")
- **`README.md`** — `@run` adicionado em tabela de agentes, diagrama ASCII e seção de keywords
- **`scripts/study.sh:11`** — instrução de instalação corrigida (URL do binário em vez de `npm install -g opencode`)

### Removed
- **`.opencode/node_modules/`** — removido (6.2MB de dependências não utilizadas)
- **`.gitignore`** — linhas legadas removidas (estrutura `04-logs/`, `03-drills/`, `01-meta/`, `02-projects/`, `05-knowledge-base/`)

### Documentation
- `reviews/audit-complete-2026-03-02-v6.0.0.md` — auditoria completa: 13 problemas resolvidos

## [3.0.0] - 2026-02-26

### Added
- **Agente `@session`** — orquestrador de sessões de estudo
  * `#start` — lê `week-{N}.md` e sugere keyword do @tutor com base no plano
  * `#end` — consolida sessão com reflexão estruturada + texto para log
  * `#plan` — consulta progresso das entregas da semana
- **Keywords novas no @tutor**
  * `#explain [conceito]` — introdução a conceito novo (antes de `#feynman`)
  * `#wrap-up` — consolidação de sessão com 4 blocos + texto para `make end`
- **Keywords novas no @meta**
  * `#update-plan semana [N]` — registar progresso sem reescrever plano
- **Keyword nova no @review**
  * `#review-costs` — auditoria de otimização de tokens; incluída em `#audit-quality`
- **Template unificado** `_template-agent.md` com 8 seções obrigatórias
- **Otimizações de custo** nos agentes: nota de cache na Identidade, instrução de concisão no Checklist Final, exemplos compostos em vez de duplicados

### Changed
- **`start.sh`** — detecta `week-{N}.md` mais recente e invoca `@session #start` com contexto real; fallback para quiz genérico se sem plano
- **`end.sh`** — invoca `@session #end` antes do `read`; hint de fallback para resumo livre
- **`study.sh`** — opção `0` (default) para `@session`; 5 keywords novas no menu (`#explain`, `#intuition`, `#debug`, `#zombie`, `#diffuse`); total de 12 opções
- **`@tutor #scaffold`** — exemplo substituído por processo tecnologia-neutro (4 passos + 6 regras de geração)
- **`@review`** — keywords consolidadas, `#review-architecture` completa, contradição "cria/não cria" resolvida
- Todos os agentes migrados para formato unificado do template

### Documentation
- `README.md` actualizado — 4 agentes, 13 keywords @tutor, 7 keywords @meta, 11 keywords @review, 3 keywords @session, workflow com 12 opções
- `guides/quickstart.md` actualizado — contagem de agentes, diagrama e Quick Reference
- `reviews/agents-audit-2026-02-26-v3.1.0.md` — auditoria final: 0 críticos, 0 técnicos abertos

## [2.7.1] - 2026-02-20

### Added
- **Error handling robusto** em todos os scripts
  * `set -euo pipefail` em `common.sh` (herdado por todos os scripts)
  * Trap para mostrar linha de erro
  * Função `safe_write()` para escrita segura em arquivos
  * Função `validate_module_name()` para validar nomes de módulo
  * Função `sanitize_input()` para limpar input de usuário

### Changed
- **Validação de input** em scripts interativos
  * `module.sh`: validação rigorosa de nomes de módulo
  * `study.sh`: sanitização de inputs (challenge, concept, project)
  * Mensagens de erro claras e educativas

### Fixed
- **Operações de arquivo mais seguras**
  * `start.sh`: criação de log com safe_write + verificação mkdir
  * `end.sh`: verificação se log existe antes de escrever
  * `module.sh`: safe_write para README + verificação de permissões
- **Documentação atualizada**
  * Seção "Dependências" adicionada ao README (jq, bc, opencode)
  * Path `shared/scripts/` → `scripts/` corrigido
  * Quick Start atualizado com passo de instalação de deps
- **Privacidade protegida**
  * `.gitignore`: logs pessoais, stats e SRS não vão para git

### Security
- Prevenção de injection de comandos via sanitização de inputs
- Validação rigorosa de nomes de módulo

### Documentation
- Auditoria completa salva em `reviews/audit-complete-v2.7.0-2026-02-20.md`

## [2.7.0] - 2026-02-20

### Added
- 16 scripts bash em `scripts/` para comandos do Makefile
  * `common.sh` - Funções e variáveis compartilhadas (cores, check_module, etc.)
  * `start.sh` - Iniciar sessão + quiz
  * `study.sh` - Loop de estudo interativo
  * `end.sh` - Encerrar sessão
  * `module.sh` - Criar novo módulo
  * `switch.sh` - Alternar módulo ativo
  * `plan.sh` - Planejar semana
  * `resources.sh` - Mapear recursos
  * `review.sh` - Spaced repetition
  * `retro.sh` - Retrospectiva semanal
  * `break.sh` - Modo difuso
  * `drill-extra.sh` - Overlearning
  * `status.sh` - Ver status
  * `archive.sh` - Arquivar projeto
  * `backup.sh` - Backup de dados
  * `setup.sh` - Configuração inicial

### Changed
- **Makefile completamente refatorado:**
  * Reduzido de 463 para 74 linhas (-84%)
  * Apenas delega comandos para scripts
  * Comandos organizados em seções lógicas
  * Sistema de ajuda simplificado

### Technical
- Separação de responsabilidades: lógica nos scripts, orquestração no Makefile
- Scripts reutilizáveis independentemente do make
- Variáveis centralizadas em `common.sh`
- Facilita testes e manutenção

