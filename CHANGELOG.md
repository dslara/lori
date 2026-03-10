# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

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

