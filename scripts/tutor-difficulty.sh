#!/bin/bash

# tutor-difficulty.sh - Calcular nível de dificuldade adaptativo
#
# Uso: ./scripts/tutor-difficulty.sh [get|report] <topic>
#
# Baseado em error_rate do tópico, calcula difficulty_level:
# - error_rate < 0.2 → easy
# - error_rate 0.2-0.4 → medium
# - error_rate > 0.4 → hard

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

# Obter dificuldade de um tópico
get_difficulty() {
    local topic="$1"
    
    init_data
    
    # Buscar error_rate do tópico
    local error_rate=$(grep "error_rate_${topic}" "$DATA_DIR/insights.csv" 2>/dev/null | \
        tail -1 | cut -d',' -f4 || echo "")
    
    # Contar tentativas no tópico
    local attempts=$(grep ",${topic}," "$DATA_DIR/tutor_interactions.csv" 2>/dev/null | wc -l || echo "0")
    
    # Determinar nível de dificuldade
    local level="medium"
    if [ -n "$error_rate" ]; then
        if (( $(echo "$error_rate < 0.2" | bc -l) )); then
            level="easy"
        elif (( $(echo "$error_rate > 0.4" | bc -l) )); then
            level="hard"
        fi
    fi
    
    # Output JSON
    echo "{\"level\":\"$level\",\"error_rate\":${error_rate:-0},\"attempts\":$attempts}"
}

# Gerar relatório de dificuldades
generate_difficulty_report() {
    init_data
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  🎯 NÍVEIS DE DIFICULDADE${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Listar todos os tópicos com error_rate
    grep "error_rate_" "$DATA_DIR/insights.csv" 2>/dev/null | \
        sed 's/.*error_rate_//' | \
        cut -d',' -f1,2 | \
        while IFS=',' read -r topic rate; do
            if [ -n "$topic" ]; then
                local difficulty=$(get_difficulty "$topic")
                local level=$(echo "$difficulty" | grep -o '"level":"[^"]*"' | cut -d'"' -f4)
                local attempts=$(echo "$difficulty" | grep -o '"attempts":[0-9]*' | cut -d':' -f2)
                
                # Cor por nível
                local color="$YELLOW"
                case "$level" in
                    easy) color="$GREEN" ;;
                    hard) color="$RED" ;;
                esac
                
                echo -e "${color}$level${NC} - $topic (${attempts} tentativas, error_rate: $rate)"
            fi
        done
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Main
case "${1:-}" in
    get)
        if [ -z "${2:-}" ]; then
            echo "Uso: $0 get <topic>"
            exit 1
        fi
        get_difficulty "$2"
        ;;
    report)
        generate_difficulty_report
        ;;
    *)
        echo "Uso: $0 [get|report] [topic]"
        echo ""
        echo "  get <topic>  - Obter dificuldade de um tópico"
        echo "  report       - Relatório de todos os tópicos"
        ;;
esac
