# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não Publicado]

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

