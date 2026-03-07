#!/bin/bash
# streak.sh - Sistema de streak (agora via data.sh)
#
# SCRIPT INTERNO — não tem target Makefile direto.
# Chamado por: end.sh (atualiza streak) e status.sh (exibe streak)
#
# MANTIDO PARA COMPATIBILIDADE — redireciona para data.sh

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

STATS_FILE="${STATS_FILE:-.ultralearning-stats}"
TODAY=$(date +%Y-%m-%d)

# Inicializar arquivo se não existir
init_stats() {
    if [ ! -f "$STATS_FILE" ]; then
        cat > "$STATS_FILE" << EOF
streak=0
best_streak=0
total_sessions=0
last_session=
EOF
    fi
}

# Carregar estatísticas com parsing seguro (sem source)
load_stats() {
    init_stats
    
    # Parse seguro sem executar código arbitrário
    streak=$(grep "^streak=" "$STATS_FILE" 2>/dev/null | cut -d= -f2)
    best_streak=$(grep "^best_streak=" "$STATS_FILE" 2>/dev/null | cut -d= -f2)
    total_sessions=$(grep "^total_sessions=" "$STATS_FILE" 2>/dev/null | cut -d= -f2)
    last_session=$(grep "^last_session=" "$STATS_FILE" 2>/dev/null | cut -d= -f2)
    
    # Validar valores lidos (números inteiros)
    if ! [[ "$streak" =~ ^[0-9]+$ ]]; then streak=0; fi
    if ! [[ "$best_streak" =~ ^[0-9]+$ ]]; then best_streak=0; fi
    if ! [[ "$total_sessions" =~ ^[0-9]+$ ]]; then total_sessions=0; fi
}

# Salvar estatísticas com sanitização
save_stats() {
    # Garantir valores inteiros
    streak=${streak:-0}
    best_streak=${best_streak:-0}
    total_sessions=${total_sessions:-0}
    
    [[ "$streak" =~ ^[0-9]+$ ]] || streak=0
    [[ "$best_streak" =~ ^[0-9]+$ ]] || best_streak=0
    [[ "$total_sessions" =~ ^[0-9]+$ ]] || total_sessions=0
    
    cat > "$STATS_FILE" << EOF
streak=$streak
best_streak=$best_streak
total_sessions=$total_sessions
last_session=$last_session
EOF
}

# Calcular diferença de dias
days_diff() {
    local d1="$1"
    local d2="$2"
    
    if [ -z "$d1" ] || [ -z "$d2" ]; then
        echo "999"
        return
    fi
    
    # macOS
    if date -j &>/dev/null; then
        local s1=$(date -j -f "%Y-%m-%d" "$d1" +%s 2>/dev/null || echo "0")
        local s2=$(date -j -f "%Y-%m-%d" "$d2" +%s 2>/dev/null || echo "0")
    else
        # Linux
        local s1=$(date -d "$d1" +%s 2>/dev/null || echo "0")
        local s2=$(date -d "$d2" +%s 2>/dev/null || echo "0")
    fi
    
    echo $(( (s2 - s1) / 86400 ))
}

# Registrar sessão (agora via data.sh)
register_session() {
    # Usar data.sh para atualizar CSV
    "$(dirname "$0")/data.sh" streak
    
    # Sincronizar com .ultralearning-stats para compatibilidade
    local csv_streak=$(get_streak)
    local csv_best=$(get_best_streak)
    local csv_total=$(get_total_sessions)
    local csv_last=$(get_insight "last_session" "" "")
    
    streak=$csv_streak
    best_streak=$csv_best
    total_sessions=$csv_total
    last_session=$csv_last
    
    save_stats
}

# Mostrar status (agora via data.sh)
show_status() {
    "$(dirname "$0")/data.sh" status
}

# Main
case "${1:-status}" in
    session|s)
        register_session
        ;;
    status|"")
        show_status
        ;;
    reset)
        rm -f "$STATS_FILE"
        "$(dirname "$0")/data.sh" init
        echo "Stats resetados"
        ;;
    *)
        echo "Uso: $0 [session|status|reset]"
        ;;
esac
