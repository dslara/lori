#!/bin/bash

# tutor-log.sh - Registrar interações do tutor em tutor_interactions.csv
#
# SCRIPT INTERNO — chamado pelos agentes ou manualmente

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

# Registrar interação
log_interaction() {
    local session_id="$1"
    local skill="$2"
    local topic="$3"
    local user_message="$4"
    local user_response="${5:-}"
    local tutor_response="$6"
    local metadata="${7:-}"
    
    init_data
    
    local timestamp=$(date -Iseconds)
    local interaction_id="I$(date +%Y%m%d%H%M%S)"
    
    # Sanitizar mensagens (remover quebras de linha e vírgulas)
    user_message=$(echo "$user_message" | tr '\n' ' ' | tr ',' ';' | head -c 200)
    user_response=$(echo "$user_response" | tr '\n' ' ' | tr ',' ';' | head -c 200)
    tutor_response=$(echo "$tutor_response" | tr '\n' ' ' | tr ',' ';' | head -c 500)
    
    # Registrar
    echo "$interaction_id,$session_id,$skill,$topic,\"$user_message\",\"$user_response\",\"$tutor_response\",$timestamp,$metadata" >> "$DATA_DIR/tutor_interactions.csv"
    
    echo "$interaction_id"
}

# Buscar interações por tópico
get_interactions_by_topic() {
    local topic="$1"
    local limit="${2:-10}"
    
    init_data
    
    grep ",$topic," "$DATA_DIR/tutor_interactions.csv" 2>/dev/null | tail -"$limit"
}

# Buscar interações por sessão
get_interactions_by_session() {
    local session_id="$1"
    
    init_data
    
    grep ",$session_id," "$DATA_DIR/tutor_interactions.csv" 2>/dev/null
}

# Buscar últimas interações
get_recent_interactions() {
    local limit="${1:-10}"
    
    init_data
    
    tail -"$limit" "$DATA_DIR/tutor_interactions.csv" 2>/dev/null
}

# Main
case "${1:-}" in
    log)
        log_interaction "${2:-}" "${3:-}" "${4:-}" "${5:-}" "${6:-}" "${7:-}" "${8:-}"
        ;;
    topic)
        get_interactions_by_topic "${2:-}" "${3:-10}"
        ;;
    session)
        get_interactions_by_session "${2:-}"
        ;;
    recent)
        get_recent_interactions "${2:-10}"
        ;;
    *)
        echo "Uso: $0 [log|topic|session|recent] [args...]"
        echo ""
        echo "  log <session_id> <skill> <topic> <user_msg> <user_response> <tutor_response> [metadata]"
        echo "  topic <topic> [limit]"
        echo "  session <session_id>"
        echo "  recent [limit]"
        ;;
esac
