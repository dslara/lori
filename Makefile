# Makefile para Sistema Ultralearning
# Comandos delegados para scripts em scripts/
#
# Scripts internos (sem target):
#   - common.sh, data.sh → bibliotecas
#   - spaced-repetition.sh → chamado por review.sh
#   - tutor-*.sh → chamados por agentes ou outros scripts

SHELL := /bin/bash
.DEFAULT_GOAL := help
.PHONY: help start end module switch plan resources review retro break drill-extra status archive backup setup sync-flashcards analytics skill-effectiveness patterns dashboard weaknesses

##@ 📋 Sessão Diária (2 comandos)

start: ## 🚀 Iniciar sessão (atalho para #start)
	@./scripts/start.sh

end: ## 🏁 Encerrar sessão (atalho para #end)
	@./scripts/end.sh

##@ 🗺️ Módulos (4 comandos)

module: ## 🆕 Criar novo módulo
	@./scripts/module.sh

switch: ## 🔄 Alternar módulo ativo
	@./scripts/switch.sh

plan: ## 📅 Planejar semana com @meta
	@./scripts/plan.sh

resources: ## 📚 Mapear recursos para o módulo
	@./scripts/resources.sh

##@ 🧠 Revisão (2 comandos)

review: ## 📚 Spaced repetition (SRS)
	@./scripts/review.sh

retro: ## 📝 Retrospectiva semanal
	@./scripts/retro.sh

##@ 📊 Status e Analytics (8 comandos)

break: ## 🧠 Pausa de 15 min para modo difuso
	@./scripts/break.sh

drill-extra: ## 🎯 Overlearning: 5 variações de drill
	@./scripts/drill-extra.sh

status: ## 📊 Ver status geral
	@./scripts/status.sh

analytics: ## 📈 Ver analytics avançados
	@./scripts/analytics.sh report

skill-effectiveness: ## 🎯 Ver efetividade por técnica
	@./scripts/skill-effectiveness.sh report

patterns: ## ⏰ Ver padrões de sessão
	@./scripts/patterns.sh analyze

dashboard: ## 📊 Ver dashboard consolidado
	@./scripts/dashboard.sh show

weaknesses: ## ⚠️ Ver pontos fracos
	@./scripts/weakness-analysis.sh report

##@ 📦 Arquivamento (2 comandos)

archive: ## 📦 Arquivar projeto finalizado
	@./scripts/archive.sh

sync-flashcards: ## 🔄 Sincronizar flashcards (Anki)
	@./scripts/sync-flashcards.sh

##@ 🛠️ Setup e Backup (2 comandos)

backup: ## 💾 Backup dos dados
	@./scripts/backup.sh

setup: ## ⚙️ Configuração inicial
	@./scripts/setup.sh

##@ 📖 Ajuda

help: ## 📖 Mostra esta ajuda
	@echo ""
	@echo "🚀 Ultralearning System - Atalhos de Terminal"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[0;33m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Interface principal: use keywords no OpenCode"
	@echo "  @tutor #start → @tutor #drill → @tutor #end"
	@echo ""
