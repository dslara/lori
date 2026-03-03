#!/bin/bash

# resources.sh - Mapear recursos para o módulo

source "$(dirname "$0")/common.sh"

check_module

if ! check_opencode; then
    exit 0
fi

print_header "📚 Mapeando recursos para: $CURRENT_TOPIC"
echo ""

read -p "Tópico específico (ou Enter para módulo): " topic
topic=${topic:-$CURRENT_TOPIC}

mkdir -p "$TOPIC_PATH/meta"

opencode run "@meta "#map-resources $topic" | tee "$TOPIC_PATH/meta/resources.md"

echo ""
print_success "Recursos salvos: $TOPIC_PATH/meta/resources.md"
