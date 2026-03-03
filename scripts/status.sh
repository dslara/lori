#!/bin/bash

# status.sh - Ver status geral (streak + módulo)

source "$(dirname "$0")/common.sh"

print_header "📊 Status Ultralearning"
echo ""

"$(dirname "$0")/streak.sh"

echo ""

if [ "$CURRENT_TOPIC" != "nenhum" ]; then
    print_info "📦 Módulo atual: $CURRENT_TOPIC"
    if [ -d "$TOPIC_PATH/logs/daily" ]; then
        logs=$(find "$TOPIC_PATH/logs/daily" -maxdepth 1 -name "*.md" 2>/dev/null | wc -l | xargs)
        echo "   Dias de estudo: $logs"
    else
        echo "   Dias de estudo: 0"
    fi
else
    print_warning "Nenhum módulo ativo"
fi

echo ""
