# Makefile para Sistema Ultralearning
# 
# ⚠️ MIGRAÇÃO v2.0: A maioria dos comandos agora são /commands no TUI do OpenCode
# 
# Commands disponíveis (digite / no TUI):
#   /status      - Ver streak e progresso
#   /analytics   - Ver analytics avançados
#   /data        - Gerenciar dados
#
# Comandos mantidos no Makefile (operações de sistema):
#   make setup   - Configuração inicial
#   make backup  - Backup dos dados
#   make module  - Criar novo módulo
#   make switch  - Alternar módulo ativo
#
# Para migração completa, veja: MIGRATION.md

SHELL := /bin/bash
.DEFAULT_GOAL := help
.PHONY: help module switch review retro archive backup setup skill-effectiveness patterns dashboard weaknesses

##@ 🚀 Nova Interface (Commands no TUI)

help: ## 📖 Mostra esta ajuda
	@echo ""
	@echo "🚀 Ultralearning System v2.0"
	@echo ""
	@echo "Interface Principal: Commands no TUI do OpenCode"
	@echo "  Digite / para ver commands disponíveis:"
	@echo ""
	@echo "  /status      - Ver streak e progresso"
	@echo "  /analytics   - Ver analytics avançados"
	@echo "  /data init   - Inicializar dados"
	@echo ""
	@echo "Agents:"
	@echo "  @tutor #start → @tutor #drill → @tutor #end"
	@echo "  @meta #retro  → @meta #create-weekly-plan"
	@echo ""
	@echo "Comandos Makefile (operações de sistema):"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[0;33m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Para detalhes da migração v2.0: cat MIGRATION.md"
	@echo ""

##@ 📋 Sessão Diária (via @tutor)

start: ## 🚀 Use: @tutor #start (no TUI do OpenCode)
	@echo "⚠️  Comando removido na v2.0"
	@echo ""
	@echo "Use diretamente no TUI do OpenCode:"
	@echo "  @tutor #start"
	@echo ""
	@echo "A tool context.getFullContext carrega automaticamente:"
	@echo "  ✓ Módulo ativo"
	@echo "  ✓ Sessões recentes"
	@echo "  ✓ SRS pendente"
	@echo "  ✓ Plano da semana"

end: ## 🏁 Use: @tutor #end (no TUI do OpenCode)
	@echo "⚠️  Comando removido na v2.0"
	@echo ""
	@echo "Use diretamente no TUI do OpenCode:"
	@echo "  @tutor #end"
	@echo ""
	@echo "As tools salvam automaticamente:"
	@echo "  ✓ Sessão (data.createSession)"
	@echo "  ✓ Streak (data.updateStreak)"
	@echo "  ✓ Analytics (analytics.generateReport)"

##@ 🗺️ Módulos

module: ## 🆕 Criar novo módulo
	@./scripts/module.sh

switch: ## 🔄 Alternar módulo ativo
	@./scripts/switch.sh

##@ 🧠 Revisão

review: ## 📚 Spaced repetition (SRS) - use @tutor #srs-generator review
	@echo "⚠️  Recomendado: use @tutor #srs-generator review"
	@echo "    (revisão com tools TypeScript)"
	@./scripts/review.sh 2>/dev/null || echo "Script legado"

retro: ## 📝 Retrospectiva semanal
	@./scripts/retro.sh

##@ 📊 Status e Analytics (USE /commands no TUI)

status: ## 📊 DEPRECATED: use /status no TUI
	@echo "⚠️  DEPRECATED: use /status no TUI do OpenCode"
	@echo "    (Tool status.ts - mais robusto)"

analytics: ## 📈 DEPRECATED: use /analytics no TUI
	@echo "⚠️  DEPRECATED: use /analytics no TUI do OpenCode"
	@echo "    (Tool analytics.ts - mais robusto)"

skill-effectiveness: ## 🎯 REMOVIDO: use effectiveness tool
	@echo "⚠️  REMOVIDO na v2.0 - use a tool 'effectiveness'"
	@echo "    A tool é invocada automaticamente pelo @tutor"
	@echo "    Para relatório completo: /dashboard"

patterns: ## ⏰ REMOVIDO: use patterns tool
	@echo "⚠️  REMOVIDO na v2.0 - use a tool 'patterns'"
	@echo "    A tool é invocada automaticamente pelo @tutor"
	@echo "    Para relatório completo: /dashboard"

dashboard: ## 📊 REMOVIDO: use /dashboard no TUI
	@echo "⚠️  REMOVIDO na v2.0 - use /dashboard no TUI do OpenCode"
	@echo "    (Tool dashboard.ts - mais robusto)"

weaknesses: ## ⚠️ REMOVIDO: use weakness tool
	@echo "⚠️  REMOVIDO na v2.0 - use a tool 'weakness'"
	@echo "    A tool é invocada automaticamente pelo @tutor"
	@echo "    Para relatório completo: /dashboard"

##@ 📦 Arquivamento

archive: ## 📦 Arquivar projeto finalizado
	@./scripts/archive.sh

##@ 🛠️ Setup e Backup

backup: ## 💾 Backup dos dados
	@./scripts/backup.sh

setup: ## ⚙️ Configuração inicial
	@./scripts/setup.sh
