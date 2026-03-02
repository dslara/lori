#!/bin/bash

# sync-flashcards.sh - Agregar flashcards de todos os módulos ao master-deck.csv

source "$(dirname "$0")/common.sh"

FLASHCARDS_DIR="projects/shared/flashcards"
MASTER_DECK="$FLASHCARDS_DIR/master-deck.csv"
BY_MODULE_DIR="$FLASHCARDS_DIR/by-module"

print_header "🔄 Sincronizando Flashcards"

# Criar backup do master-deck
if [ -f "$MASTER_DECK" ]; then
    cp "$MASTER_DECK" "$MASTER_DECK.backup"
    print_success "Backup criado: master-deck.csv.backup"
fi

# Criar header se master-deck não existe
# Sempre recriar master-deck para evitar duplicatas acumuladas
echo "front,back,module,difficulty,last_reviewed,next_review,interval_days" > "$MASTER_DECK"
print_success "Master-deck criado com header"

# Agregar cards de cada módulo
MODULES_FOUND=0
CARDS_ADDED=0

if [ -d "$BY_MODULE_DIR" ]; then
    for module_file in "$BY_MODULE_DIR"/*.csv; do
        if [ -f "$module_file" ]; then
            MODULE_NAME=$(basename "$module_file" .csv)
            print_info "📚 Processando: $MODULE_NAME"
            
            # Pular header e adicionar cards ao master
            tail -n +2 "$module_file" >> "$MASTER_DECK"
            
            CARDS_COUNT=$(tail -n +2 "$module_file" | wc -l)
            CARDS_ADDED=$((CARDS_ADDED + CARDS_COUNT))
            MODULES_FOUND=$((MODULES_FOUND + 1))
            
            echo "   ✅ $CARDS_COUNT cards adicionados"
        fi
    done
fi

# Remover duplicatas (chave composta: front+back+module)
if [ -f "$MASTER_DECK" ]; then
    awk -F',' 'NR==1{print; next} !seen[$1","$2","$3]++' "$MASTER_DECK" > "$MASTER_DECK.tmp"
    mv "$MASTER_DECK.tmp" "$MASTER_DECK"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_success "Sincronização completa!"
echo "📊 Módulos processados: $MODULES_FOUND"
echo "📇 Total de cards no master-deck: $(tail -n +2 "$MASTER_DECK" | wc -l)"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
