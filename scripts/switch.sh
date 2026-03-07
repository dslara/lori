#!/bin/bash

# switch.sh - Alternar módulo ativo

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

print_header "📋 Módulos disponíveis"
echo ""

# Listar módulos do CSV
if [ -f "$PROJECT_ROOT/data/modules.csv" ]; then
    while IFS=',' read -r id user_id name is_active status started_at completed_at total_hours; do
        if [ "$id" != "id" ] && [ -n "$id" ]; then
            current=""
            if [ "$is_active" = "true" ]; then
                current=" ${YELLOW}← atual${NC}"
            fi
            echo -e "  📦 $name ($status)$current"
        fi
    done < "$PROJECT_ROOT/data/modules.csv"
else
    print_warning "Nenhum módulo encontrado"
fi

echo ""
read -p "Ativar módulo (nome): " topic_name

if [ -z "$topic_name" ]; then
    print_error "Nome do módulo é obrigatório"
    exit 1
fi

# Encontrar ID do módulo
module_id=$(grep ",$topic_name," "$PROJECT_ROOT/data/modules.csv" 2>/dev/null | cut -d',' -f1)

if [ -z "$module_id" ]; then
    # Criar novo módulo
    module_id="M$(date +%m%d%H%M%S)"
    mkdir -p "projects/$module_id-$topic_name"/{meta,projects,logs/daily,knowledge}
    
    # Adicionar ao CSV
    init_data
    echo "$module_id,dani,$topic_name,true,active,$(date +%Y-%m-%d),," >> "$PROJECT_ROOT/data/modules.csv"
    print_success "Módulo criado e ativado: $module_id-$topic_name"
else
    # Atualizar is_active
    init_data
    # Remover antigo ativo
    sed -i 's/,true,/false,/g' "$PROJECT_ROOT/data/modules.csv"
    # Ativar novo
    sed -i "s/^$module_id,/&true,/" "$PROJECT_ROOT/data/modules.csv"
    print_success "Ativo: $module_id-$topic_name"
fi
