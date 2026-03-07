#!/bin/bash

# archive.sh - Arquivar projeto finalizado

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

check_module

print_header "📦 Arquivando Projeto"

print_warning "Atenção: O projeto será arquivado"
echo ""

read -p "Nome do projeto (ex: cli-tool): " proj_name

if [ -z "$proj_name" ]; then
    print_error "Nome não pode ser vazio"
    exit 1
fi

DATE=$(date +%Y-%m-%d)
ARCHIVE_DIR="archived/$CURRENT_TOPIC/$DATE-$proj_name"

if [ -d "$ARCHIVE_DIR" ]; then
    print_error "Projeto já existe: $ARCHIVE_DIR"
    exit 1
fi

mkdir -p "$ARCHIVE_DIR"
cp -r "$TOPIC_PATH/"* "$ARCHIVE_DIR/" 2>/dev/null || true
cp archived/_template-relatorio.md "$ARCHIVE_DIR/relatorio-final.md" 2>/dev/null || true

print_success "Projeto copiado para: $ARCHIVE_DIR"
echo ""
print_info "📝 Ações necessárias:"
echo "  1. Preencha o relatório: $ARCHIVE_DIR/relatorio-final.md"
echo "  2. Edite o índice: archived/indice.md"
echo ""

read -p "Marcar módulo como 'completed'? [s/N]: " confirm

if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
    # Atualizar status em modules.csv
    module_id=$(echo "$CURRENT_TOPIC" | grep -oE '^[A-Z][0-9]+' || echo "M1")
    
    # Usar Python para atualização robusta do CSV
    python3 - "$module_id" "$TODAY" "$PROJECT_ROOT/data/modules.csv" <<'PYEOF'
import csv
import sys

module_id = sys.argv[1]
completed_at = sys.argv[2]
csv_file = sys.argv[3]

rows = []
with open(csv_file, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        if row['id'] == module_id:
            row['is_active'] = 'false'
            row['status'] = 'completed'
            row['completed_at'] = completed_at
        rows.append(row)

with open(csv_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
PYEOF
    
    # Atualizar CURRENT_TOPIC
    export CURRENT_TOPIC="nenhum"
    print_success "Módulo marcado como completed"
else
    print_warning "Módulo mantido como active"
fi

echo ""
print_success "🎉 Projeto arquivado com sucesso!"
