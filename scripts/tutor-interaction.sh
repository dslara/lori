#!/bin/bash

# tutor-interaction.sh - Helper para registrar interações do tutor
# 
# Uso simples: ./scripts/tutor-interaction.sh <skill> <topic> <user_msg> <tutor_response> [metadata]
#
# Este script obtém automaticamente o session_id da última sessão.

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

# Obter session_id automaticamente
get_current_session_id() {
    init_data
    
    # Tentar obter da última sessão
    local last_session=$(tail -1 "$DATA_DIR/sessions.csv" 2>/dev/null | cut -d',' -f1)
    
    if [ -n "$last_session" ] && [ "$last_session" != "id" ]; then
        echo "$last_session"
    else
        # Se não houver sessão, criar ID baseado na data
        echo "$(date +%Y-%m-%d-%H%M%S)"
    fi
}

# Registrar interação (interface simplificada)
log_tutor_interaction() {
    local skill="$1"
    local topic="$2"
    local user_message="$3"
    local user_response="${4:-}"
    local tutor_response="$5"
    local metadata="${6:-}"
    
    # Obter session_id automaticamente
    local session_id=$(get_current_session_id)
    
    # Chamar tutor-log.sh
    "$(dirname "$0")/tutor-log.sh" log "$session_id" "$skill" "$topic" "$user_message" "$user_response" "$tutor_response" "$metadata"
}

# Main
if [ $# -lt 5 ]; then
    echo "Uso: $0 <skill> <topic> <user_message> <user_response> <tutor_response> [metadata]"
    echo ""
    echo "Exemplos:"
    echo "  $0 quiz 'símbolos matemáticos' 'O que significa ∀?' 'Para todo' 'Correto! ∀ é o quantificador universal' '{\"correct\":true}'"
    echo "  $0 feynman 'recursão' 'Explique recursão' 'É quando uma função chama a si mesma' 'Boa! E quando para?' '{\"depth_score\":7}'"
    echo "  $0 drill 'Big O' 'Qual a complexidade de n²?' 'Quadrática' 'Correto!'"
    exit 1
fi

log_tutor_interaction "$@"
