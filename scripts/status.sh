#!/bin/bash

# status.sh - Ver status geral (streak + módulo + CSV)

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

print_header "📊 Status Ultralearning"
echo ""

# Mostrar status do streak (agora via data.sh)
"$(dirname "$0")/data.sh" status

echo ""

if [ "$CURRENT_TOPIC" != "nenhum" ]; then
    print_info "📦 Módulo atual: $CURRENT_TOPIC"
    if [ -d "$TOPIC_PATH/logs/daily" ]; then
        logs=$(find "$TOPIC_PATH/logs/daily" -maxdepth 1 -name "*.md" 2>/dev/null | wc -l | xargs)
        echo "   Dias de estudo: $logs"
    else
        echo "   Dias de estudo: 0"
    fi
    
    # Mostrar sessões do CSV
    if [ -f "$PROJECT_ROOT/data/sessions.csv" ]; then
        # Extrair ID do módulo (M1, M2, etc.)
        module_id=$(echo "$CURRENT_TOPIC" | grep -oE '^[A-Z][0-9]' || echo "M1")
        sessions=$(grep ",$module_id," "$PROJECT_ROOT/data/sessions.csv" 2>/dev/null | wc -l | xargs) || true
        echo "   Sessões CSV: $sessions"
    fi
else
    print_warning "Nenhum módulo ativo"
fi

echo ""
