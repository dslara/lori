# Makefile para Sistema Ultralearning
# Comandos delegados para scripts em scripts/

SHELL := /bin/bash
.DEFAULT_GOAL := help
.PHONY: help start study end module switch plan resources review retro break drill-extra status archive backup setup sync-flashcards analytics

##@ 📋 Sessão Diária (3 comandos)

start: ## 🚀 Iniciar sessão + quiz automático
	@./scripts/start.sh

study: ## 💻 Loop de estudo interativo
	@./scripts/study.sh

end: ## 🏁 Encerrar sessão (salva + streak)
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

##@ 📊 Status e Overlearning (3 comandos)

break: ## 🧠 Pausa de 15 min para modo difuso
	@./scripts/break.sh

drill-extra: ## 🎯 Overlearning: 5 variações de drill
	@./scripts/drill-extra.sh

status: ## 📊 Ver status geral
	@./scripts/status.sh

analytics: ## 📈 Ver analytics avançados
	@./scripts/analytics.sh report

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
	@echo "🚀 Ultralearning System - Comandos Disponíveis"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[0;33m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Workflow diário: make start → make study → make end"
	@echo ""
