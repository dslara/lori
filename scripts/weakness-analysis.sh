#!/bin/bash

# weakness-analysis.sh - Identificar pontos fracos e sugerir técnicas
#
# Uso: ./scripts/weakness-analysis.sh [report|suggest]
#
# Identifica tópicos com error_rate > 0.3 e sugere técnica mais efetiva

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

# Identificar pontos fracos
identify_weaknesses() {
    init_data
    
    python3 - <<'PYEOF'
import csv
import os
from datetime import datetime, timedelta

data_dir = os.environ.get('DATA_DIR', 'data')
insights_file = os.path.join(data_dir, 'insights.csv')
interactions_file = os.path.join(data_dir, 'tutor_interactions.csv')

# Últimos 7 dias
today = datetime.now()
week_ago = today - timedelta(days=7)

# Coletar error_rates
error_rates = {}

try:
    with open(insights_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            metric = row.get('metric', '').strip()
            if metric.startswith('error_rate_'):
                topic = metric.replace('error_rate_', '')
                value_str = row.get('value', '').strip()
                try:
                    value = float(value_str)
                    if value > 0.3:  # Threshold de ponto fraco
                        error_rates[topic] = value
                except ValueError:
                    continue

except FileNotFoundError:
    pass

# Contar tentativas por tópico
topic_attempts = {}

try:
    with open(interactions_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            topic = row.get('topic', '').strip().lower()
            if topic:
                topic_attempts[topic] = topic_attempts.get(topic, 0) + 1

except FileNotFoundError:
    pass

# Output: topic,error_rate,attempts
for topic, error_rate in sorted(error_rates.items(), key=lambda x: x[1], reverse=True):
    attempts = topic_attempts.get(topic, 0)
    print(f"{topic},{error_rate},{attempts}")
PYEOF
}

# Obter técnica mais efetiva para um tópico
get_best_technique_for_topic() {
    local topic="$1"
    
    init_data
    
    # Buscar interações com esse tópico
    python3 - "$topic" <<'PYEOF'
import csv
import json
import os
import sys
from collections import defaultdict

data_dir = os.environ.get('DATA_DIR', 'data')
interactions_file = os.path.join(data_dir, 'tutor_interactions.csv')
topic = sys.argv[1] if len(sys.argv) > 1 else ""

if not topic:
    print("quiz")
    sys.exit(0)

# Calcular taxa de acerto por skill para esse tópico
skill_stats = defaultdict(lambda: {'correct': 0, 'total': 0})

try:
    with open(interactions_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            row_topic = row.get('topic', '').strip().lower()
            skill = row.get('skill', '').strip().lower()
            metadata_raw = row.get('metadata', '').strip()
            
            if row_topic != topic or not skill or not metadata_raw:
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
    # Fallback: usar técnica mais efetiva geral
    print("feynman")
    sys.exit(0)

# Encontrar melhor skill para esse tópico
best_skill = None
best_rate = 0

for skill, stats in skill_stats.items():
    if stats['total'] > 0:
        rate = stats['correct'] / stats['total']
        if rate > best_rate:
            best_rate = rate
            best_skill = skill

if best_skill:
    print(best_skill)
else:
    print("feynman")
PYEOF
}

# Gerar relatório de pontos fracos
generate_weakness_report() {
    init_data
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ⚠️  PONTOS FRACOS (últimos 7 dias)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    local weaknesses=$(identify_weaknesses)
    
    if [ -z "$weaknesses" ]; then
        echo -e "${GREEN}✅ Nenhum ponto fraco identificado${NC}"
        echo "   Todos os tópicos têm error_rate < 30%"
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        return
    fi
    
    # Mostrar cada ponto fraco com sugestão
    echo "$weaknesses" | while IFS=',' read -r topic error_rate attempts; do
        if [ -n "$topic" ]; then
            local pct=$(echo "$error_rate" | awk '{printf "%.0f", $1 * 100}')
            local best_tech=$(get_best_technique_for_topic "$topic")
            
            echo -e "${RED}$topic${NC}"
            echo "   Error rate: ${pct}% ($attempts tentativas)"
            echo "   → Sugestão: #${best_tech} $topic"
            echo ""
        fi
    done
    
    echo -e "${YELLOW}💡 Dica: Comece pelo tópico com maior error_rate${NC}"
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Main
case "${1:-}" in
    report)
        generate_weakness_report
        ;;
    suggest)
        if [ -z "${2:-}" ]; then
            echo "Uso: $0 suggest <topic>"
            exit 1
        fi
        get_best_technique_for_topic "$2"
        ;;
    list)
        identify_weaknesses
        ;;
    *)
        echo "Uso: $0 [report|suggest|list] [topic]"
        echo ""
        echo "  report         - Relatório de pontos fracos"
        echo "  suggest <topic> - Técnica mais efetiva para tópico"
        echo "  list           - Listar pontos fracos (raw)"
        ;;
esac
