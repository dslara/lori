#!/bin/bash

# module.sh - Criar novo módulo

source "$(dirname "$0")/common.sh"

print_header "🆕 Criando novo módulo"
echo ""

read -p "Nome do módulo (ex: python-backend): " topic

# Validar nome do módulo
TOPIC_SLUG=$(echo "$topic" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

if ! validate_module_name "$TOPIC_SLUG"; then
    exit 1
fi

if [ -d "projects/$TOPIC_SLUG" ]; then
    print_warning "Módulo já existe!"
    exit 1
fi

# Criar estrutura de diretórios
if ! mkdir -p "projects/$TOPIC_SLUG"/{meta,projects,logs/daily,knowledge}; then
    print_error "Falha ao criar diretórios do módulo (sem permissão?)"
    exit 1
fi

# Criar README com safe_write
safe_write "# 📦 $topic" "projects/$TOPIC_SLUG/README.md" "overwrite" || exit 1
safe_write "" "projects/$TOPIC_SLUG/README.md" || exit 1
safe_write "**Status**: 🟢 Ativo" "projects/$TOPIC_SLUG/README.md" || exit 1
safe_write "**Criado**: $TODAY" "projects/$TOPIC_SLUG/README.md" || exit 1

# Atualizar módulo ativo
if ! echo "$TOPIC_SLUG" > .current-topic; then
    print_error "Falha ao atualizar módulo ativo"
    exit 1
fi

print_success "Módulo criado: projects/$TOPIC_SLUG/"
echo ""
print_info "Use @meta para planejar:"
echo "opencode run \"@meta \"#decompose-goal $topic\""
