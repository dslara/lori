#!/bin/bash

# plan.sh - Planejar semana com @meta

source "$(dirname "$0")/common.sh"

check_module

if ! check_opencode; then
    echo "Crie o plano manualmente em: $TOPIC_PATH/meta/"
    exit 0
fi

print_header "📅 Planejando semana para: $CURRENT_TOPIC"
echo ""

# Usar numeração sequencial baseada nos arquivos existentes (não date +%U)
mkdir -p "$TOPIC_PATH/meta"
EXISTING_WEEKS=$(find "$TOPIC_PATH/meta" -maxdepth 1 -name "week-*.md" 2>/dev/null | wc -l)
LAST_WEEK_NUM=$(find "$TOPIC_PATH/meta" -maxdepth 1 -name "week-*.md" 2>/dev/null | sed -E 's/.*week-([0-9]+)\.md/\1/' | sort -n | tail -1)
if [ -z "$LAST_WEEK_NUM" ]; then
    WEEK=1
else
    WEEK=$((LAST_WEEK_NUM + 1))
fi

opencode run "@meta "#create-weekly-plan semana $WEEK" | tee "$TOPIC_PATH/meta/week-$WEEK.md"

echo ""
print_success "Plano salvo: $TOPIC_PATH/meta/week-$WEEK.md"
