#!/bin/bash

# skill-effectiveness.sh - Calcular efetividade de cada técnica de aprendizado
#
# Uso: ./scripts/skill-effectiveness.sh [report|update] [module_id]
#
# Métricas calculadas:
# - Taxa de acerto por skill (tutor_interactions.csv)
# - Retenção por técnica (flashcards.csv → avg easiness por category)
# - Foco médio por técnica (session_skills.csv)
# - Velocidade (sessões até 3 acertos consecutivos)

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

# Calcular taxa de acerto por skill (de tutor_interactions.csv)
calculate_success_rate_by_skill() {
    init_data
    
    python3 - <<'PYEOF'
import csv
import json
import os
from collections import defaultdict

data_dir = os.environ.get('DATA_DIR', 'data')
interactions_file = os.path.join(data_dir, 'tutor_interactions.csv')

# Acumular acertos/total por skill
skill_stats = defaultdict(lambda: {'correct': 0, 'total': 0})

try:
    with open(interactions_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            skill = row.get('skill', '').strip().lower()
            metadata_raw = row.get('metadata', '').strip()
            
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

# Output: skill,success_rate,total
for skill, stats in sorted(skill_stats.items()):
    if stats['total'] > 0:
        rate = round(stats['correct'] / stats['total'] * 100, 1)
        print(f"{skill},{rate},{stats['total']}")
PYEOF
}

# Calcular retenção por técnica (de flashcards.csv → avg easiness por category)
calculate_retention_by_technique() {
    init_data
    
    python3 - <<'PYEOF'
import csv
import os
from collections import defaultdict

data_dir = os.environ.get('DATA_DIR', 'data')
flashcards_file = os.path.join(data_dir, 'flashcards.csv')

# Acumular easiness por category (técnica)
category_stats = defaultdict(lambda: {'sum': 0.0, 'count': 0})

try:
    with open(flashcards_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            category = row.get('category', '').strip().lower()
            easiness_str = row.get('easiness', '').strip()
            
            if not category or not easiness_str:
                continue
            
            try:
                easiness = float(easiness_str)
                category_stats[category]['sum'] += easiness
                category_stats[category]['count'] += 1
            except ValueError:
                continue

except FileNotFoundError:
    pass

# Output: category,avg_easiness,count
for category, stats in sorted(category_stats.items()):
    if stats['count'] > 0:
        avg = round(stats['sum'] / stats['count'], 2)
        print(f"{category},{avg},{stats['count']}")
PYEOF
}

# Calcular foco médio por técnica (de session_skills.csv)
calculate_focus_by_skill() {
    init_data
    
    python3 - <<'PYEOF'
import csv
import os
from collections import defaultdict

data_dir = os.environ.get('DATA_DIR', 'data')
skills_file = os.path.join(data_dir, 'session_skills.csv')

# Acumular success_rating por skill
skill_stats = defaultdict(lambda: {'sum': 0, 'count': 0})

try:
    with open(skills_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            skill = row.get('skill', '').strip().lower()
            rating_str = row.get('success_rating', '').strip()
            
            if not skill or not rating_str:
                continue
            
            try:
                rating = int(rating_str)
                skill_stats[skill]['sum'] += rating
                skill_stats[skill]['count'] += 1
            except ValueError:
                continue

except FileNotFoundError:
    pass

# Output: skill,avg_rating,count
for skill, stats in sorted(skill_stats.items()):
    if stats['count'] > 0:
        avg = round(stats['sum'] / stats['count'], 1)
        print(f"{skill},{avg},{stats['count']}")
PYEOF
}

# Calcular velocidade (sessões até 3 acertos consecutivos por tópico)
calculate_velocity_by_topic() {
    init_data
    
    python3 - <<'PYEOF'
import csv
import json
import os
from collections import defaultdict

data_dir = os.environ.get('DATA_DIR', 'data')
interactions_file = os.path.join(data_dir, 'tutor_interactions.csv')

# Rastrear sequência de acertos por tópico
topic_progress = defaultdict(lambda: {'consecutive': 0, 'sessions': set(), 'mastered': False})

try:
    with open(interactions_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            topic = row.get('topic', '').strip().lower()
            session_id = row.get('session_id', '').strip()
            metadata_raw = row.get('metadata', '').strip()
            
            if not topic or not metadata_raw:
                continue
            
            try:
                meta = json.loads(metadata_raw)
            except (json.JSONDecodeError, ValueError):
                continue
            
            if 'correct' not in meta:
                continue
            
            if topic_progress[topic]['mastered']:
                continue
            
            topic_progress[topic]['sessions'].add(session_id)
            
            if meta['correct']:
                topic_progress[topic]['consecutive'] += 1
                if topic_progress[topic]['consecutive'] >= 3:
                    topic_progress[topic]['mastered'] = True
            else:
                topic_progress[topic]['consecutive'] = 0

except FileNotFoundError:
    pass

# Output: topic,sessions_to_master,mastered
for topic, progress in sorted(topic_progress.items()):
    sessions_count = len(progress['sessions'])
    mastered = 'yes' if progress['mastered'] else 'no'
    print(f"{topic},{sessions_count},{mastered}")
PYEOF
}

# Gerar relatório consolidado
generate_effectiveness_report() {
    local days="${1:-30}"
    
    init_data
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  🎯 EFETIVIDADE DAS TÉCNICAS${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Coletar dados
    local success_data=$(calculate_success_rate_by_skill)
    local retention_data=$(calculate_retention_by_technique)
    local focus_data=$(calculate_focus_by_skill)
    local velocity_data=$(calculate_velocity_by_topic)
    
    # Criar tabelas associativas em Python para consolidar
    python3 - "$success_data" "$retention_data" "$focus_data" "$velocity_data" <<'PYEOF'
import sys
from collections import defaultdict

success_data = sys.argv[1] if len(sys.argv) > 1 else ""
retention_data = sys.argv[2] if len(sys.argv) > 2 else ""
focus_data = sys.argv[3] if len(sys.argv) > 3 else ""
velocity_data = sys.argv[4] if len(sys.argv) > 4 else ""

# Parse success rate
success_rates = {}
for line in success_data.strip().split('\n'):
    if line and ',' in line:
        parts = line.split(',')
        if len(parts) >= 3:
            skill = parts[0]
            rate = parts[1]
            total = parts[2]
            success_rates[skill] = {'rate': rate, 'total': total}

# Parse retention
retention = {}
for line in retention_data.strip().split('\n'):
    if line and ',' in line:
        parts = line.split(',')
        if len(parts) >= 3:
            category = parts[0]
            easiness = parts[1]
            count = parts[2]
            retention[category] = {'easiness': easiness, 'count': count}

# Parse focus
focus = {}
for line in focus_data.strip().split('\n'):
    if line and ',' in line:
        parts = line.split(',')
        if len(parts) >= 3:
            skill = parts[0]
            avg = parts[1]
            count = parts[2]
            focus[skill] = {'avg': avg, 'count': count}

# Parse velocity
velocity = {}
for line in velocity_data.strip().split('\n'):
    if line and ',' in line:
        parts = line.split(',')
        if len(parts) >= 3:
            topic = parts[0]
            sessions = parts[1]
            mastered = parts[2]
            velocity[topic] = {'sessions': sessions, 'mastered': mastered}

# Consolidar todas as técnicas
all_skills = set(success_rates.keys()) | set(retention.keys()) | set(focus.keys())

if not all_skills:
    print("⚠️  Dados insuficientes (mínimo: 5 interações por técnica)")
    sys.exit(0)

# Cabeçalho
print(f"{'Técnica':<12} | {'Acerto':>6} | {'Retenção':>8} | {'Foco':>4} | {'Velocidade':>12}")
print("-" * 60)

# Linhas
for skill in sorted(all_skills):
    rate = success_rates.get(skill, {}).get('rate', '-')
    easiness = retention.get(skill, {}).get('easiness', '-')
    focus_avg = focus.get(skill, {}).get('avg', '-')
    
    # Velocidade: média de sessões para tópicos com essa técnica
    velocity_avg = '-'
    if skill in velocity:
        velocity_avg = f"{velocity[skill]['sessions']} sessões"
    
    print(f"{skill:<12} | {rate:>6}% | {easiness:>8} | {focus_avg:>4} | {velocity_avg:>12}")

print()

# Insights
if success_rates:
    best_skill = max(success_rates.items(), key=lambda x: float(x[1]['rate']))
    print(f"💡 Insight: {best_skill[0]} tem melhor taxa de acerto ({best_skill[1]['rate']}%)")

if retention:
    best_retention = max(retention.items(), key=lambda x: float(x[1]['easiness']))
    print(f"💡 Insight: {best_retention[0]} tem melhor retenção (easiness {best_retention[1]['easiness']})")

if focus:
    best_focus = max(focus.items(), key=lambda x: float(x[1]['avg']))
    print(f"💡 Insight: {best_focus[0]} tem melhor foco ({best_focus[1]['avg']}/10)")
PYEOF
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Main
case "${1:-}" in
    report)
        generate_effectiveness_report "${2:-30}"
        ;;
    success-rate)
        calculate_success_rate_by_skill
        ;;
    retention)
        calculate_retention_by_technique
        ;;
    focus)
        calculate_focus_by_skill
        ;;
    velocity)
        calculate_velocity_by_topic
        ;;
    *)
        echo "Uso: $0 [report|success-rate|retention|focus|velocity] [days]"
        echo ""
        echo "  report         - Relatório consolidado (padrão)"
        echo "  success-rate   - Taxa de acerto por skill"
        echo "  retention      - Retenção por técnica"
        echo "  focus          - Foco médio por técnica"
        echo "  velocity       - Velocidade por tópico"
        ;;
esac
