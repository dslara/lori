#!/bin/bash

# drill-extra.sh - Overlearning: 5 variações extra de drill

source "$(dirname "$0")/common.sh"

check_module

if ! check_opencode; then
    echo "Modo offline: não é possível gerar drills extras"
    exit 0
fi

print_header "🎯 Overlearning - Variações Extra"
echo ""

read -p "Conceito já dominado: " concept

if [ -n "$concept" ]; then
    echo -e "${PURPLE}🎯 Gerando 5 variações de dificuldade...${NC}"
    echo ""
    opencode run "@tutor "#drill $concept com 5 variações: fácil → médio → difícil → edge case → transferência"
else
    print_warning "Conceito não informado"
fi
