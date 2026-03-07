#!/bin/bash

# patterns.sh - Analisar padrões de sessão de estudo
#
# Uso: ./scripts/patterns.sh [analyze|report]
#
# Métricas calculadas:
# - Melhor horário (manhã/tarde/noite)
# - Duração ideal (quando foco cai)
# - Ponto de fadiga
# - Melhor dia da semana

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

# Analisar foco por período do dia
analyze_focus_by_period() {
    init_data
    
    python3 - <<'PYEOF'
import csv
import os
from datetime import datetime
from collections import defaultdict

data_dir = os.environ.get('DATA_DIR', 'data')
sessions_file = os.path.join(data_dir, 'sessions.csv')

# Períodos: manhã (6-12), tarde (12-18), noite (18-24)
period_stats = defaultdict(lambda: {'sum': 0, 'count': 0})
period_names = {
    'morning': 'Manhã (6-12h)',
    'afternoon': 'Tarde (12-18h)',
    'evening': 'Noite (18-24h)'
}

try:
    with open(sessions_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            date_str = row.get('date', '').strip()
            focus_str = row.get('focus_score', '').strip()
            
            if not date_str or not focus_str:
                continue
            
            try:
                focus = int(focus_str)
                # Assumir sessão de manhã por padrão (não temos hora exata)
                # Usar heurística: se duration > 60 min, provavelmente foi à tarde
                duration_str = row.get('duration_min', '60').strip()
                duration = int(duration_str) if duration_str else 60
                
                # Heurística simples: sessões longas (>90min) = tarde
                # Sessões curtas (<45min) = noite
                # Sessões médias = manhã
                if duration > 90:
                    period = 'afternoon'
                elif duration < 45:
                    period = 'evening'
                else:
                    period = 'morning'
                
                period_stats[period]['sum'] += focus
                period_stats[period]['count'] += 1
            except ValueError:
                continue

except FileNotFoundError:
    pass

# Output: period,avg_focus,count
for period in ['morning', 'afternoon', 'evening']:
    stats = period_stats[period]
    if stats['count'] > 0:
        avg = round(stats['sum'] / stats['count'], 1)
        print(f"{period},{avg},{stats['count']}")
    else:
        print(f"{period},0,0")
PYEOF
}

# Analisar foco por duração
analyze_focus_by_duration() {
    init_data
    
    python3 - <<'PYEOF'
import csv
import os
from collections import defaultdict

data_dir = os.environ.get('DATA_DIR', 'data')
sessions_file = os.path.join(data_dir, 'sessions.csv')

# Buckets de duração: 15-30, 30-45, 45-60, 60+
duration_stats = defaultdict(lambda: {'sum': 0, 'count': 0})
bucket_names = {
    '15-30': '15-30 min',
    '30-45': '30-45 min',
    '45-60': '45-60 min',
    '60+': '60+ min'
}

try:
    with open(sessions_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            duration_str = row.get('duration_min', '').strip()
            focus_str = row.get('focus_score', '').strip()
            
            if not duration_str or not focus_str:
                continue
            
            try:
                duration = int(duration_str)
                focus = int(focus_str)
                
                if duration < 30:
                    bucket = '15-30'
                elif duration < 45:
                    bucket = '30-45'
                elif duration < 60:
                    bucket = '45-60'
                else:
                    bucket = '60+'
                
                duration_stats[bucket]['sum'] += focus
                duration_stats[bucket]['count'] += 1
            except ValueError:
                continue

except FileNotFoundError:
    pass

# Output: bucket,avg_focus,count
for bucket in ['15-30', '30-45', '45-60', '60+']:
    stats = duration_stats[bucket]
    if stats['count'] > 0:
        avg = round(stats['sum'] / stats['count'], 1)
        print(f"{bucket},{avg},{stats['count']}")
    else:
        print(f"{bucket},0,0")
PYEOF
}

# Detectar ponto de fadiga (quando foco cai)
detect_fatigue_point() {
    init_data
    
    python3 - <<'PYEOF'
import csv
import os
import sys

data_dir = os.environ.get('DATA_DIR', 'data')
sessions_file = os.path.join(data_dir, 'sessions.csv')

# Coletar durações e focos
data_points = []

try:
    with open(sessions_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            duration_str = row.get('duration_min', '').strip()
            focus_str = row.get('focus_score', '').strip()
            
            if not duration_str or not focus_str:
                continue
            
            try:
                duration = int(duration_str)
                focus = int(focus_str)
                data_points.append((duration, focus))
            except ValueError:
                continue

except FileNotFoundError:
    pass

if len(data_points) < 3:
    print("Dados insuficientes")
    sys.exit(0)

# Ordenar por duração
data_points.sort(key=lambda x: x[0])

# Detectar queda de foco > 2 pontos
prev_focus = None
fatigue_point = None

for duration, focus in data_points:
    if prev_focus is not None:
        if prev_focus - focus > 2:
            fatigue_point = duration
            break
    prev_focus = focus

if fatigue_point:
    print(f"{fatigue_point}")
else:
    # Se não detectou queda, usar média + desvio padrão
    avg_duration = sum(d for d, f in data_points) / len(data_points)
    print(f"{int(avg_duration)}")
PYEOF
}

# Analisar foco por dia da semana
analyze_focus_by_weekday() {
    init_data
    
    python3 - <<'PYEOF'
import csv
import os
from datetime import datetime
from collections import defaultdict

data_dir = os.environ.get('DATA_DIR', 'data')
sessions_file = os.path.join(data_dir, 'sessions.csv')

day_names = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
weekday_stats = defaultdict(lambda: {'sum': 0, 'count': 0})

try:
    with open(sessions_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            date_str = row.get('date', '').strip()
            focus_str = row.get('focus_score', '').strip()
            
            if not date_str or not focus_str:
                continue
            
            try:
                focus = int(focus_str)
                dt = datetime.strptime(date_str, '%Y-%m-%d')
                weekday = dt.weekday()  # 0=Seg, 6=Dom
                
                weekday_stats[weekday]['sum'] += focus
                weekday_stats[weekday]['count'] += 1
            except ValueError:
                continue

except FileNotFoundError:
    pass

# Output: weekday,avg_focus,count
for i, day_name in enumerate(day_names):
    stats = weekday_stats[i]
    if stats['count'] > 0:
        avg = round(stats['sum'] / stats['count'], 1)
        print(f"{day_name},{avg},{stats['count']}")
    else:
        print(f"{day_name},0,0")
PYEOF
}

# Gerar relatório consolidado
generate_patterns_report() {
    init_data
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ⏰ PADRÕES DE SESSÃO${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Coletar dados
    local period_data=$(analyze_focus_by_period)
    local duration_data=$(analyze_focus_by_duration)
    local fatigue_point=$(detect_fatigue_point)
    local weekday_data=$(analyze_focus_by_weekday)
    
    # Analisar melhor período
    python3 - "$period_data" <<'PYEOF'
import sys

period_data = sys.argv[1] if len(sys.argv) > 1 else ""

periods = {}
period_names = {
    'morning': 'Manhã (6-12h)',
    'afternoon': 'Tarde (12-18h)',
    'evening': 'Noite (18-24h)'
}

for line in period_data.strip().split('\n'):
    if line and ',' in line:
        parts = line.split(',')
        if len(parts) >= 3:
            period = parts[0]
            avg = parts[1]
            count = parts[2]
            periods[period] = {'avg': float(avg) if avg != '0' else 0, 'count': int(count)}

if not periods or all(p['count'] == 0 for p in periods.values()):
    print("⚠️  Dados insuficientes (mínimo: 3 sessões)")
    sys.exit(0)

# Encontrar melhor período
best_period = max(periods.items(), key=lambda x: x[1]['avg'])
best_name = period_names.get(best_period[0], best_period[0])
best_avg = best_period[1]['avg']

print(f"Melhor horário: {best_name}")
print(f"  → Foco médio: {best_avg}/10")

# Comparar com outros
if len(periods) > 1:
    other_avg = sum(p['avg'] for p in periods.values()) / len(periods)
    if other_avg > 0:
        diff = round((best_avg - other_avg) / other_avg * 100, 0)
        if diff > 0:
            print(f"  → {diff}% melhor que média")
PYEOF
    
    echo ""
    
    # Analisar duração ideal
    python3 - "$duration_data" <<'PYEOF'
import sys

duration_data = sys.argv[1] if len(sys.argv) > 1 else ""

buckets = {}
bucket_names = {
    '15-30': '15-30 min',
    '30-45': '30-45 min',
    '45-60': '45-60 min',
    '60+': '60+ min'
}

for line in duration_data.strip().split('\n'):
    if line and ',' in line:
        parts = line.split(',')
        if len(parts) >= 3:
            bucket = parts[0]
            avg = parts[1]
            count = parts[2]
            buckets[bucket] = {'avg': float(avg) if avg != '0' else 0, 'count': int(count)}

if not buckets or all(b['count'] == 0 for b in buckets.values()):
    print("⚠️  Dados insuficientes")
    sys.exit(0)

# Encontrar melhor duração
best_bucket = max(buckets.items(), key=lambda x: x[1]['avg'])
best_name = bucket_names.get(best_bucket[0], best_bucket[0])
best_avg = best_bucket[1]['avg']

print(f"Duração ideal: {best_name}")
print(f"  → Foco médio: {best_avg}/10")
PYEOF
    
    echo ""
    
    # Mostrar ponto de fadiga
    if [ -n "$fatigue_point" ] && [ "$fatigue_point" != "Dados insuficientes" ]; then
        echo "Ponto de fadiga: após $fatigue_point min"
        echo "  → Sugestão: faça pausas a cada $((fatigue_point - 5)) min"
    fi
    
    echo ""
    
    # Analisar melhor dia da semana
    python3 - "$weekday_data" <<'PYEOF'
import sys

weekday_data = sys.argv[1] if len(sys.argv) > 1 else ""

weekdays = {}

for line in weekday_data.strip().split('\n'):
    if line and ',' in line:
        parts = line.split(',')
        if len(parts) >= 3:
            day = parts[0]
            avg = parts[1]
            count = parts[2]
            weekdays[day] = {'avg': float(avg) if avg != '0' else 0, 'count': int(count)}

if not weekdays or all(w['count'] == 0 for w in weekdays.values()):
    print("⚠️  Dados insuficientes")
    sys.exit(0)

# Encontrar melhor dia
best_day = max(weekdays.items(), key=lambda x: x[1]['avg'])
best_avg = best_day[1]['avg']

# Encontrar pior dia
worst_day = min(weekdays.items(), key=lambda x: x[1]['avg'] if x[1]['count'] > 0 else 10)
worst_avg = worst_day[1]['avg']

print(f"Melhor dia: {best_day[0]}")
print(f"  → Foco: {best_avg}/10")

if worst_day[1]['count'] > 0:
    print(f"Pior dia: {worst_day[0]}")
    print(f"  → Foco: {worst_avg}/10")
PYEOF
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Main
case "${1:-}" in
    analyze|report)
        generate_patterns_report
        ;;
    period)
        analyze_focus_by_period
        ;;
    duration)
        analyze_focus_by_duration
        ;;
    fatigue)
        detect_fatigue_point
        ;;
    weekday)
        analyze_focus_by_weekday
        ;;
    *)
        echo "Uso: $0 [analyze|period|duration|fatigue|weekday]"
        echo ""
        echo "  analyze    - Relatório consolidado (padrão)"
        echo "  period     - Foco por período do dia"
        echo "  duration   - Foco por duração"
        echo "  fatigue    - Ponto de fadiga"
        echo "  weekday    - Foco por dia da semana"
        ;;
esac
