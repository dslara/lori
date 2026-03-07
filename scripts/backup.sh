#!/bin/bash

# backup.sh - Backup dos dados

source "$(dirname "$0")/common.sh"

print_header "💾 Criando backup"

BACKUP_DIR="backups/$(date +%Y-%m-%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup de dados CSV (principal)
if [ -d "data" ]; then
    cp -r data "$BACKUP_DIR/" 2>/dev/null || true
    print_success "Dados CSV incluídos no backup"
fi

# Backup de projetos
for dir in projects/*/knowledge projects/*/meta projects/*/logs; do
    if [ -d "$dir" ]; then
        mkdir -p "$BACKUP_DIR/$(dirname "$dir")"
        cp -r "$dir" "$BACKUP_DIR/$(dirname "$dir")/" 2>/dev/null
    fi
done

# Criar tarball
tar -czf "$BACKUP_DIR.tar.gz" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")" 2>/dev/null || true

print_success "Backup salvo em: $BACKUP_DIR"
[ -f "$BACKUP_DIR.tar.gz" ] && print_success "Tarball: $BACKUP_DIR.tar.gz"
