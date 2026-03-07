#!/bin/bash

# retro.sh - Retrospectiva semanal

source "$(dirname "$0")/common.sh"

check_module

print_header "📝 Retrospectiva Semanal"
echo ""

# Resumo semanal automático
echo -e "${YELLOW}📊 Resumo da Semana:${NC}"

# Contar sessões do CSV nos últimos 7 dias
WEEK_START=$(date -d '7 days ago' +%Y-%m-%d 2>/dev/null || date -v-7d +%Y-%m-%d)
module_id=$(echo "$CURRENT_TOPIC" | grep -oE '^[A-Z][0-9]+' || echo "M1")
SESSIONS_THIS_WEEK=$(awk -F, -v start="$WEEK_START" -v today="$TODAY" -v mid="$module_id" '
    $3 == mid && $4 >= start && $4 <= today {count++}
    END {print count+0}
' "$PROJECT_ROOT/data/sessions.csv")

echo "   📅 Sessões esta semana: $SESSIONS_THIS_WEEK"

if [ "$SESSIONS_THIS_WEEK" -ge 6 ]; then
    echo -e "   ${GREEN}✅ Excelente! Meta de 6 sessões atingida!${NC}"
elif [ "$SESSIONS_THIS_WEEK" -ge 4 ]; then
    echo -e "   ${YELLOW}⚠️  Bom! $(( 6 - SESSIONS_THIS_WEEK )) sessões para meta${NC}"
else
    echo -e "   ${RED}❌ Faltaram $(( 6 - SESSIONS_THIS_WEEK )) sessões${NC}"
fi

echo ""

# Usar numeração sequencial baseada nos arquivos week-*.md existentes
# (não date +%U que usa semana ISO do ano)
LAST_WEEK_NUM=$(find "$TOPIC_PATH/meta" -maxdepth 1 -name "week-*.md" 2>/dev/null | sed -E 's/.*week-([0-9]+)\.md/\1/' | sort -n | tail -1)
if [ -z "$LAST_WEEK_NUM" ]; then
    WEEK=1
else
    WEEK=$LAST_WEEK_NUM
fi
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
