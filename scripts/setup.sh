#!/bin/bash

# setup.sh - Configuração inicial

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

print_header "⚙️ Configurando Ultralearning"
echo ""

echo "Verificando dependências..."

if command -v jq &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} jq"
else
    echo -e "  ${RED}✗${NC} jq"
    echo -e "  ${YELLOW}  Instale:${NC}"
    if command -v brew &> /dev/null; then
        echo -e "    macOS: brew install jq"
    elif command -v apt &> /dev/null; then
        echo -e "    Linux (Debian/Ubuntu): sudo apt install jq"
    elif command -v dnf &> /dev/null; then
        echo -e "    Linux (Fedora): sudo dnf install jq"
    fi
fi

if command -v bc &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} bc"
else
    echo -e "  ${YELLOW}⚠️${NC} bc (opcional, para SRS)"
fi

if command -v opencode &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} opencode"
else
    echo -e "  ${YELLOW}⚠️${NC} opencode"
    echo -e "  ${YELLOW}  Instale:${NC}"
    echo -e "    Baixe o binário: https://github.com/opencode-ai/opencode/releases"
    echo -e "    Ou: npm install -g opencode (se tiver Node.js)"
fi

echo ""

mkdir -p scripts .opencode/agents data backups
chmod +x scripts/*.sh 2>/dev/null || true

# Inicializar dados CSV
init_data

print_success "Setup completo!"
echo ""
echo "Próximos passos:"
echo "  1. make module  → Criar módulo"
echo "  2. make start   → Começar estudo"
