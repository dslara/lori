#!/bin/bash

# analytics.sh - Gerar analytics avançados a partir dos dados CSV
#
# SCRIPT INTERNO — não tem target Makefile direto.
# Chamado por: end.sh, ou manualmente

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

# Calcular tempo total de estudo por módulo
calculate_total_time() {
    local module_id="$1"
    
    init_data
    
    local total=0
    while IFS= read -r line; do
        if [[ "$line" == *",$module_id,"* ]]; then
            local duration=$(echo "$line" | cut -d',' -f5)
            total=$((total + duration))
        fi
    done < "$DATA_DIR/sessions.csv"
    
    echo "$total"
}

# Calcular média de foco por módulo
calculate_avg_focus() {
    local module_id="$1"
    
    init_data
    
    local sum=0
    local count=0
    while IFS= read -r line; do
        if [[ "$line" == *",$module_id,"* ]]; then
            local focus=$(echo "$line" | cut -d',' -f6)
            sum=$((sum + focus))
            count=$((count + 1))
        fi
    done < "$DATA_DIR/sessions.csv"
    
    if [ "$count" -gt 0 ]; then
        echo $((sum * 10 / count))
    else
        echo "0"
    fi
}

# Calcular sessões por dia da semana
calculate_sessions_by_weekday() {
    init_data
    
    echo "Sessões por dia da semana:"
    for day in Seg Ter Qua Qui Sex Sab Dom; do
        local count=$(grep ",$USER_ID," "$DATA_DIR/sessions.csv" 2>/dev/null | grep -c "$(date -d "$day" +%Y-%m-%d 2>/dev/null || echo "")" || echo "0")
        echo "  $day: $count"
    done
}

# Calcular técnica mais usada
calculate_most_used_skill() {
    init_data
    
    local skills=$(cut -d',' -f2 "$DATA_DIR/session_skills.csv" 2>/dev/null | tail -n +2 | sort | uniq -c | sort -rn | head -1)
    echo "$skills"
}

# Gerar relatório de analytics
generate_analytics_report() {
    local module_id="${1:-}"
    
    init_data
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}        📊 ANALYTICS${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Métricas gerais
    local streak=$(get_streak)
    local best_streak=$(get_best_streak)
    local total_sessions=$(get_total_sessions)
    
    echo "📈 Métricas Gerais:"
    echo "   Streak atual: $streak dias"
    echo "   Melhor streak: $best_streak dias"
    echo "   Total de sessões: $total_sessions"
    echo ""
    
    # Tempo de estudo
    if [ -n "$module_id" ]; then
        local total_time=$(calculate_total_time "$module_id")
        local avg_focus=$(calculate_avg_focus "$module_id")
        
        echo "📚 Módulo $module_id:"
        echo "   Tempo total: $total_time minutos"
        echo "   Foco médio: $((avg_focus / 10)).$((avg_focus % 10))/10"
        echo ""
    fi
    
    # Técnica mais usada
    local top_skill=$(calculate_most_used_skill)
    if [ -n "$top_skill" ]; then
        echo "🎯 Técnica mais usada:"
        echo "   $top_skill"
        echo ""
    fi
    
    # Progresso semanal
    local this_week=$(date +%V)
    local sessions_this_week=$(grep ",$USER_ID," "$DATA_DIR/sessions.csv" 2>/dev/null | grep "$(date +%Y-%m)" | wc -l)
    
    echo "📅 Esta semana:"
    echo "   Sessões: $sessions_this_week"
    echo ""
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Atualizar insights.csv com métricas calculadas
update_insights() {
    local module_id="${1:-}"
    
    init_data
    
    # Calcular métricas
    local total_time=$(calculate_total_time "$module_id")
    local avg_focus=$(calculate_avg_focus "$module_id")
    
    # Salvar em insights.csv
    set_insight "total_time_min" "$total_time" "$module_id"
    set_insight "avg_focus" "$avg_focus" "$module_id"
    
    print_success "Insights atualizados"
}

# Main
case "${1:-}" in
    report)
        generate_analytics_report "${2:-}"
        ;;
    update)
        update_insights "${2:-}"
        ;;
    time)
        calculate_total_time "${2:-}"
        ;;
    focus)
        calculate_avg_focus "${2:-}"
        ;;
    *)
        echo "Uso: $0 [report|update|time|focus] [module_id]"
        ;;
esac
