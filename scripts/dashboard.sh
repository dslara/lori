#!/bin/bash

# dashboard.sh - Dashboard consolidado com todas as métricas
#
# Uso: ./scripts/dashboard.sh [show|compare]
#
# Mostra: streak, tempo, foco, técnica mais efetiva, padrões, pontos fracos

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

# Obter métricas básicas
get_basic_metrics() {
    init_data
    
    local streak=$(grep "streak" "$DATA_DIR/insights.csv" 2>/dev/null | tail -1 | cut -d',' -f4 || echo "0")
    local best_streak=$(grep "best_streak" "$DATA_DIR/insights.csv" 2>/dev/null | tail -1 | cut -d',' -f4 || echo "0")
    local total_sessions=$(grep "total_sessions" "$DATA_DIR/insights.csv" 2>/dev/null | tail -1 | cut -d',' -f4 || echo "0")
    local last_session=$(grep "last_session" "$DATA_DIR/insights.csv" 2>/dev/null | tail -1 | cut -d',' -f4 || echo "")
    
    echo "$streak,$best_streak,$total_sessions,$last_session"
}

# Calcular tempo total de estudo (últimos 7 dias)
calculate_weekly_time() {
    init_data
    
    python3 - <<'PYEOF'
import csv
import os
from datetime import datetime, timedelta

data_dir = os.environ.get('DATA_DIR', 'data')
sessions_file = os.path.join(data_dir, 'sessions.csv')

# Últimos 7 dias
today = datetime.now()
week_ago = today - timedelta(days=7)

total_minutes = 0

try:
    with open(sessions_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            date_str = row.get('date', '').strip()
            duration_str = row.get('duration_min', '').strip()
            
            if not date_str or not duration_str:
                continue
            
            try:
                session_date = datetime.strptime(date_str, '%Y-%m-%d')
                if session_date >= week_ago:
                    total_minutes += int(duration_str)
            except ValueError:
                continue

except FileNotFoundError:
    pass

# Converter para horas
hours = round(total_minutes / 60, 1)
print(f"{hours}")
PYEOF
}

# Calcular foco médio (últimos 7 dias)
calculate_weekly_focus() {
    init_data
    
    python3 - <<'PYEOF'
import csv
import os
from datetime import datetime, timedelta

data_dir = os.environ.get('DATA_DIR', 'data')
sessions_file = os.path.join(data_dir, 'sessions.csv')

# Últimos 7 dias
today = datetime.now()
week_ago = today - timedelta(days=7)

total_focus = 0
count = 0

try:
    with open(sessions_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            date_str = row.get('date', '').strip()
            focus_str = row.get('focus_score', '').strip()
            
            if not date_str or not focus_str:
                continue
            
            try:
                session_date = datetime.strptime(date_str, '%Y-%m-%d')
                if session_date >= week_ago:
                    total_focus += int(focus_str)
                    count += 1
            except ValueError:
                continue

except FileNotFoundError:
    pass

if count > 0:
    avg = round(total_focus / count, 1)
    print(f"{avg}")
else:
    print("0")
PYEOF
}

# Obter técnica mais efetiva
get_best_technique() {
    init_data
    
    python3 - <<'PYEOF'
import csv
import json
import os
import sys
from collections import defaultdict

data_dir = os.environ.get('DATA_DIR', 'data')
interactions_file = os.path.join(data_dir, 'tutor_interactions.csv')

# Calcular taxa de acerto por skill
skill_stats = defaultdict(lambda: {'correct': 0, 'total': 0})

try:
    with open(interactions_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            skill = (row.get('skill') or '').strip().lower()
            metadata_raw = (row.get('metadata') or '').strip()
            
            if not skill or not metadata_raw:
                continue
            
            try:
                meta = json.loads(metadata_raw)
            except (json.JSONDecodeError, ValueError):
                continue
            
            if 'correct' not in meta:
                continue
            
            skill_stats[skill]['total'] += 1
            if meta['correct']:
                skill_stats[skill]['correct'] += 1

except FileNotFoundError:
    pass

if not skill_stats:
    print("-")
    sys.exit(0)

# Encontrar melhor
best_skill = None
best_rate = 0

for skill, stats in skill_stats.items():
    if stats['total'] > 0:
        rate = stats['correct'] / stats['total']
        if rate > best_rate:
            best_rate = rate
            best_skill = skill

if best_skill:
    print(f"{best_skill},{round(best_rate * 100, 0)}%")
else:
    print("-")
PYEOF
}

# Obter pontos fracos (error_rate > 0.3)
get_weaknesses() {
    init_data
    
    grep "error_rate_" "$DATA_DIR/insights.csv" 2>/dev/null | \
        awk -F',' '$4 > 0.3 {print $3 "," $4}' | \
        sed 's/error_rate_//' | \
        sort -t',' -k2 -rn | \
        head -3
}

# Gerar dashboard
generate_dashboard() {
    init_data
    
    # Coletar todas as métricas
    local basic_metrics=$(get_basic_metrics)
    local weekly_time=$(calculate_weekly_time)
    local weekly_focus=$(calculate_weekly_focus)
    local best_technique=$(get_best_technique)
    local weaknesses=$(get_weaknesses)
    
    # Parse métricas básicas
    local streak=$(echo "$basic_metrics" | cut -d',' -f1)
    local best_streak=$(echo "$basic_metrics" | cut -d',' -f2)
    local total_sessions=$(echo "$basic_metrics" | cut -d',' -f3)
    
    # Obter número da semana
    local week_num=$(date +%V)
    
    echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
    echo -e "${GREEN}  📊 DASHBOARD - Semana $week_num${NC}"
    echo -e "${BLUE}╠══════════════════════════════════════╣${NC}"
    
    # Métricas básicas
    echo -e "${PURPLE}  Streak:${NC} $streak dias"
    echo -e "${PURPLE}  Tempo:${NC} ${weekly_time}h (últimos 7 dias)"
    echo -e "${PURPLE}  Foco médio:${NC} ${weekly_focus}/10"
    echo ""
    
    # Técnica mais efetiva
    if [ "$best_technique" != "-" ]; then
        local tech_name=$(echo "$best_technique" | cut -d',' -f1)
        local tech_rate=$(echo "$best_technique" | cut -d',' -f2)
        echo -e "${YELLOW}  🎯 Técnica mais efetiva:${NC}"
        echo -e "  ${tech_name} (${tech_rate} acerto)"
    else
        echo -e "${YELLOW}  🎯 Técnica mais efetiva:${NC}"
        echo -e "  Dados insuficientes"
    fi
    echo ""
    
    # Padrões (resumido)
    echo -e "${BLUE}  ⏰ Padrões:${NC}"
    local patterns_output=$("./scripts/patterns.sh" period 2>/dev/null | head -1)
    if [ -n "$patterns_output" ]; then
        local best_period=$(echo "$patterns_output" | cut -d',' -f1)
        local period_avg=$(echo "$patterns_output" | cut -d',' -f2)
        case "$best_period" in
            morning) echo -e "  Melhor horário: manhã (${period_avg}/10)" ;;
            afternoon) echo -e "  Melhor horário: tarde (${period_avg}/10)" ;;
            evening) echo -e "  Melhor horário: noite (${period_avg}/10)" ;;
        esac
    fi
    
    local fatigue=$("./scripts/patterns.sh" fatigue 2>/dev/null)
    if [ -n "$fatigue" ] && [ "$fatigue" != "Dados insuficientes" ]; then
        echo -e "  Fadiga: após ${fatigue} min"
    fi
    echo ""
    
    # Pontos fracos
    if [ -n "$weaknesses" ]; then
        echo -e "${RED}  ⚠️  Pontos fracos:${NC}"
        echo "$weaknesses" | while IFS=',' read -r topic rate; do
            if [ -n "$topic" ]; then
                local pct=$(echo "$rate" | awk '{printf "%.0f", $1 * 100}')
                echo -e "  ${topic} (${pct}% erro)"
            fi
        done
    else
        echo -e "${GREEN}  ✅ Nenhum ponto fraco identificado${NC}"
    fi
    
    echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
}

# Comparar com semana anterior
compare_with_last_week() {
    init_data
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  📈 Comparação Semanal${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # TODO: Implementar comparação quando houver mais dados
    echo "⚠️  Dados insuficientes para comparação"
    echo "   Necessário: mínimo 2 semanas de dados"
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Main
case "${1:-}" in
    show)
        generate_dashboard
        ;;
    compare)
        compare_with_last_week
        ;;
    *)
        echo "Uso: $0 [show|compare]"
        echo ""
        echo "  show     - Mostrar dashboard (padrão)"
        echo "  compare  - Comparar com semana anterior"
        ;;
esac
