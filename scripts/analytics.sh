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
            local duration
            duration=$(echo "$line" | cut -d',' -f5)
            total=$((total + ${duration:-0}))
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
            local focus
            focus=$(echo "$line" | cut -d',' -f6)
            if [[ "$focus" =~ ^[0-9]+$ ]]; then
                sum=$((sum + focus))
                count=$((count + 1))
            fi
        fi
    done < "$DATA_DIR/sessions.csv"

    if [ "$count" -gt 0 ]; then
        echo $((sum * 10 / count))
    else
        echo "0"
    fi
}

# Calcular sessões por dia da semana
# Compatível com macOS (BSD date) e Linux (GNU date)
calculate_sessions_by_weekday() {
    init_data

    echo "Sessões por dia da semana:"

    # Extrair dias da semana diretamente das datas em sessions.csv via python3
    # Evita dependência de 'date -d' (GNU-only) com nomes de dias em português
    python3 - "$DATA_DIR/sessions.csv" "$USER_ID" <<'PYEOF'
import csv
import sys
from datetime import datetime

sessions_file = sys.argv[1]
user_id = sys.argv[2]

day_names = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"]
counts = [0] * 7

try:
    with open(sessions_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('user_id', '').strip() != user_id:
                continue
            date_str = row.get('date', '').strip()
            if not date_str:
                continue
            try:
                dt = datetime.strptime(date_str, '%Y-%m-%d')
                counts[dt.weekday()] += 1
            except ValueError:
                continue
except FileNotFoundError:
    pass

for i, name in enumerate(day_names):
    print(f"  {name}: {counts[i]}")
PYEOF
}

# Calcular técnica mais usada
calculate_most_used_skill() {
    init_data

    local skills
    skills=$(cut -d',' -f2 "$DATA_DIR/session_skills.csv" 2>/dev/null | tail -n +2 | sort | uniq -c | sort -rn | head -1)
    echo "$skills"
}

# Calcular flashcards revisados hoje
calculate_flashcards_reviewed() {
    local target_date="${1:-$TODAY}"

    init_data

    local count
    count=$(tail -n +2 "$DATA_DIR/reviews.csv" 2>/dev/null | grep -c ",$target_date," || echo "0")
    echo "${count:-0}"
}

# Calcular taxa de erro por tópico (baseado em tutor_interactions.csv)
# Lê o campo metadata e detecta {"correct":false} ou {"correct":true}
# Escreve em insights.csv: error_rate_<topic>
calculate_error_rate_by_topic() {
    local module_id="${1:-}"

    init_data

    # Usar python3 para parsing robusto do CSV e JSON no campo metadata
    python3 - <<'PYEOF'
import csv
import json
import os
import sys

data_dir = os.environ.get('DATA_DIR', 'data')
interactions_file = os.path.join(data_dir, 'tutor_interactions.csv')
insights_file = os.path.join(data_dir, 'insights.csv')
user_id = os.environ.get('USER_ID', 'dani')
today = os.environ.get('TODAY', '')

if not today:
    from datetime import date
    today = date.today().isoformat()

# Acumular acertos/erros por tópico
topic_stats = {}  # topic -> {"correct": N, "total": N}

try:
    with open(interactions_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            topic = row.get('topic', '').strip()
            metadata_raw = row.get('metadata', '').strip()
            if not topic or not metadata_raw:
                continue

            try:
                meta = json.loads(metadata_raw)
            except (json.JSONDecodeError, ValueError):
                continue

            if 'correct' not in meta:
                continue  # só registrar interações com campo "correct"

            if topic not in topic_stats:
                topic_stats[topic] = {'correct': 0, 'total': 0}

            topic_stats[topic]['total'] += 1
            if meta['correct']:
                topic_stats[topic]['correct'] += 1

except FileNotFoundError:
    sys.exit(0)

if not topic_stats:
    sys.exit(0)

# Calcular error_rate e acumular novos registros
new_insights = []
for topic, stats in topic_stats.items():
    total = stats['total']
    correct = stats['correct']
    if total == 0:
        continue
    error_rate = round((total - correct) / total, 2)
    # Normalizar nome da métrica (espaços -> underscore, lowercase)
    metric_key = 'error_rate_' + topic.lower().replace(' ', '_')
    new_insights.append((today, user_id, metric_key, error_rate, ''))

# Ler insights existentes e remover entradas antigas para os mesmos metrics/hoje
existing = []
try:
    with open(insights_file, newline='', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader, None)
        for row in reader:
            existing.append(row)
except FileNotFoundError:
    header = ['date', 'user_id', 'metric', 'value', 'module_id']

metric_keys_today = {(r[0], r[1], r[2]) for r in [list(ni) for ni in new_insights]}
filtered = [r for r in existing if (r[0], r[1], r[2]) not in metric_keys_today]

# Reescrever insights.csv
with open(insights_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    if header:
        writer.writerow(header)
    for row in filtered:
        writer.writerow(row)
    for ni in new_insights:
        writer.writerow(list(ni))

print(f"error_rate calculado para {len(new_insights)} tópicos")
PYEOF
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
    local streak best_streak total_sessions
    streak=$(get_streak)
    best_streak=$(get_best_streak)
    total_sessions=$(get_total_sessions)

    echo "📈 Métricas Gerais:"
    echo "   Streak atual: $streak dias"
    echo "   Melhor streak: $best_streak dias"
    echo "   Total de sessões: $total_sessions"
    echo ""

    # Tempo de estudo
    if [ -n "$module_id" ]; then
        local total_time avg_focus
        total_time=$(calculate_total_time "$module_id")
        avg_focus=$(calculate_avg_focus "$module_id")

        echo "📚 Módulo $module_id:"
        echo "   Tempo total: $total_time minutos"
        echo "   Foco médio: $((avg_focus / 10)).$((avg_focus % 10))/10"
        echo ""
    fi

    # Flashcards revisados hoje
    local reviewed_today
    reviewed_today=$(calculate_flashcards_reviewed "$TODAY")
    echo "🃏 SRS hoje: $reviewed_today cards revisados"
    echo ""

    # Técnica mais usada
    local top_skill
    top_skill=$(calculate_most_used_skill)
    if [ -n "$top_skill" ]; then
        echo "🎯 Técnica mais usada:"
        echo "   $top_skill"
        echo ""
    fi

    # Taxa de erro por tópico
    local error_lines
    error_lines=$(grep ",error_rate_" "$DATA_DIR/insights.csv" 2>/dev/null | tail -5 || true)
    if [ -n "$error_lines" ]; then
        echo "⚠️  Taxa de erro por tópico:"
        while IFS= read -r line; do
            local topic val
            topic=$(echo "$line" | cut -d',' -f3 | sed 's/error_rate_//')
            val=$(echo "$line" | cut -d',' -f4)
            echo "   $topic: ${val}"
        done <<< "$error_lines"
        echo ""
    fi

    # Progresso semanal
    local sessions_this_week
    sessions_this_week=$(grep ",$USER_ID," "$DATA_DIR/sessions.csv" 2>/dev/null | grep "$(date +%Y-%m)" | wc -l | tr -d ' ')

    echo "📅 Este mês:"
    echo "   Sessões: $sessions_this_week"
    echo ""

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Atualizar insights.csv com métricas calculadas
update_insights() {
    local module_id="${1:-}"

    init_data

    # Tempo total e foco médio
    local total_time avg_focus
    total_time=$(calculate_total_time "$module_id")
    avg_focus=$(calculate_avg_focus "$module_id")
    set_insight "total_time_min" "$total_time" "$module_id"
    set_insight "avg_focus" "$avg_focus" "$module_id"

    # Flashcards revisados hoje
    local reviewed
    reviewed=$(calculate_flashcards_reviewed "$TODAY")
    set_insight "flashcards_reviewed" "$reviewed" "$module_id"

    # Taxa de erro por tópico (via python3)
    calculate_error_rate_by_topic "$module_id" > /dev/null 2>&1 || true

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
    error-rate)
        calculate_error_rate_by_topic "${2:-}"
        ;;
    flashcards)
        calculate_flashcards_reviewed "${2:-}"
        ;;
    *)
        echo "Uso: $0 [report|update|time|focus|error-rate|flashcards] [module_id]"
        ;;
esac
