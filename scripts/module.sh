#!/bin/bash

# module.sh - Criar novo módulo

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

print_header "🆕 Criando novo módulo"
echo ""

read -p "Nome do módulo (ex: python-backend): " topic

# Validar nome do módulo
TOPIC_SLUG=$(echo "$topic" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

if ! validate_module_name "$TOPIC_SLUG"; then
    exit 1
fi

if [ -d "projects/*-$TOPIC_SLUG" ]; then
    print_warning "Módulo já existe!"
    exit 1
fi

# Gerar ID único
module_id="M$(date +%m%d%H%M%S)"

# Criar estrutura de diretórios
if ! mkdir -p "projects/$module_id-$TOPIC_SLUG"/{meta,projects,knowledge}; then
    print_error "Falha ao criar diretórios do módulo (sem permissão?)"
    exit 1
fi

# Criar README com safe_write
safe_write "# 📦 $topic" "projects/$module_id-$TOPIC_SLUG/README.md" "overwrite" || exit 1
safe_write "" "projects/$module_id-$TOPIC_SLUG/README.md" || exit 1
safe_write "**Status**: 🟢 Ativo" "projects/$module_id-$TOPIC_SLUG/README.md" || exit 1
safe_write "**Criado**: $TODAY" "projects/$module_id-$TOPIC_SLUG/README.md" || exit 1

# Atualizar modules.csv
init_data
# Desativar módulos anteriores
sed -i 's/,true,/,false,/g' "$PROJECT_ROOT/data/modules.csv" 2>/dev/null || true
# Adicionar novo módulo
echo "$module_id,$USER_ID,$TOPIC_SLUG,true,active,$TODAY,," >> "$PROJECT_ROOT/data/modules.csv"

print_success "Módulo criado: $module_id-$TOPIC_SLUG"
echo ""
print_info "Use @meta para planejar:"
echo "opencode run \"@meta \"#decompose-goal $topic\""
