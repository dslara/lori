#!/bin/bash

# retro.sh - Retrospectiva semanal

source "$(dirname "$0")/common.sh"

check_module

print_header "📝 Retrospectiva Semanal"
echo ""

# Resumo semanal automático
echo -e "${YELLOW}📊 Resumo da Semana:${NC}"

WEEK_START=$(date -v-7d +%Y-%m-%d 2>/dev/null || date -d '7 days ago' +%Y-%m-%d)
LOGS_THIS_WEEK=$(find "$TOPIC_PATH/logs/daily" -maxdepth 1 -name "*.md" 2>/dev/null | while read f; do
    FDATE=$(basename "$f" .md)
    if [[ "$FDATE" > "$WEEK_START" ]] || [[ "$FDATE" == "$WEEK_START" ]]; then
        echo "$f"
    fi
done | wc -l | xargs)

echo "   📅 Dias estudados esta semana: $LOGS_THIS_WEEK"

if [ "$LOGS_THIS_WEEK" -ge 6 ]; then
    echo -e "   ${GREEN}✅ Excelente! Meta de 6 dias atingida!${NC}"
elif [ "$LOGS_THIS_WEEK" -ge 4 ]; then
    echo -e "   ${YELLOW}⚠️  Bom! $(( 6 - $LOGS_THIS_WEEK )) dias para meta${NC}"
else
    echo -e "   ${RED}❌ Faltaram $(( 6 - $LOGS_THIS_WEEK )) dias${NC}"
fi

echo ""

# Usar numeração sequencial baseada nos arquivos week-*.md existentes
# (não date +%U que usa semana ISO do ano)
EXISTING_WEEKS=$(find "$TOPIC_PATH/meta" -maxdepth 1 -name "week-*.md" 2>/dev/null | wc -l)
WEEK=$((EXISTING_WEEKS))
RETRO_FILE="$TOPIC_PATH/meta/retro-week-$WEEK.md"

safe_write "# Retro Semana $WEEK - $CURRENT_TOPIC" "$RETRO_FILE" "overwrite" || exit 1
safe_write "" "$RETRO_FILE" || exit 1
safe_write "**Data**: $TODAY" "$RETRO_FILE" || exit 1
safe_write "" "$RETRO_FILE" || exit 1

read -p "✅ O que funcionou? " worked
safe_write "## ✅ O que funcionou" "$RETRO_FILE" || exit 1
safe_write "$worked" "$RETRO_FILE" || exit 1
safe_write "" "$RETRO_FILE" || exit 1

read -p "❌ O que não funcionou? " failed
safe_write "## ❌ O que não funcionou" "$RETRO_FILE" || exit 1
safe_write "$failed" "$RETRO_FILE" || exit 1
safe_write "" "$RETRO_FILE" || exit 1

read -p "🎯 Foco próxima semana? " next
safe_write "## 🎯 Próxima semana" "$RETRO_FILE" || exit 1
safe_write "$next" "$RETRO_FILE" || exit 1
safe_write "" "$RETRO_FILE" || exit 1

print_success "Salvo: $RETRO_FILE"
