#!/bin/bash

# backup.sh - Backup dos dados

source "$(dirname "$0")/common.sh"

print_header "💾 Criando backup"

BACKUP_DIR="backups/$(date +%Y-%m-%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

cp -r .ultralearning-stats "$BACKUP_DIR/" 2>/dev/null || true
cp -r .current-topic "$BACKUP_DIR/" 2>/dev/null || true

for dir in projects/*/knowledge projects/*/meta projects/*/logs; do
    if [ -d "$dir" ]; then
        mkdir -p "$BACKUP_DIR/$(dirname "$dir")"
        cp -r "$dir" "$BACKUP_DIR/$(dirname "$dir")/" 2>/dev/null
    fi
done

print_success "Backup salvo em: $BACKUP_DIR"
