#!/bin/bash
# streak.sh - Sistema simplificado de streak
# Apenas: streak, total de sessões, última sessão
#
# SCRIPT INTERNO — não tem target Makefile direto.
# Chamado por: end.sh (atualiza streak) e status.sh (exibe streak)

source "$(dirname "$0")/common.sh"

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

# Registrar sessão
register_session() {
    load_stats
    
    # Já estudou hoje?
    if [ "$last_session" = "$TODAY" ]; then
        echo -e "${YELLOW}Sessão já registrada hoje${NC}"
        show_status
        return
    fi
    
    # Calcular streak
    if [ -z "$last_session" ]; then
        # Primeira sessão
        streak=1
    else
        local diff=$(days_diff "$last_session" "$TODAY")
        
        if [ "$diff" -eq 1 ]; then
            # Dia consecutivo
            streak=$((streak + 1))
            echo -e "${GREEN}🔥 Streak +1!${NC}"
        elif [ "$diff" -eq 0 ]; then
            # Mesmo dia (não deveria chegar aqui)
            :
        else
            # Quebrou streak
            echo -e "${RED}💔 Streak perdido (${diff} dias sem estudar)${NC}"
            streak=1
        fi
    fi
    
    # Atualizar best streak
    if [ "$streak" -gt "$best_streak" ]; then
        best_streak=$streak
        echo -e "${GREEN}🏆 Novo recorde: ${best_streak} dias!${NC}"
    fi
    
    # Incrementar sessões
    total_sessions=$((total_sessions + 1))
    last_session="$TODAY"
    
    save_stats
    echo ""
    show_status
}

# Mostrar status
show_status() {
    load_stats
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}        🎮 STATUS${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Progress bar (meta: 7 dias para nível, 30 para mestre)
    local target=7
    local progress=$streak
    if [ "$streak" -ge 30 ]; then
        target=30
        local level="🌟 MESTRE"
    elif [ "$streak" -ge 7 ]; then
        target=30
        local level="🔥 Em chamas"
    else
        local level="⭐ Iniciando"
    fi
    
    # Calcular barra (10 blocos)
    local filled=$((progress * 10 / target))
    [ "$filled" -gt 10 ] && filled=10
    local empty=$((10 - filled))
    
    local bar=""
    for ((i=0; i<filled; i++)); do bar+="█"; done
    for ((i=0; i<empty; i++)); do bar+="░"; done
    
    # Streak com barra visual
    if [ "$streak" -ge 30 ]; then
        echo -e "Streak:      ${GREEN}🔥 ${streak} dias${NC}"
        echo -e "Progresso:   ${GREEN}${bar}${NC} $level"
    elif [ "$streak" -ge 7 ]; then
        echo -e "Streak:      ${GREEN}🔥 ${streak} dias${NC}"
        echo -e "Progresso:   ${YELLOW}${bar}${NC} ${streak}/${target} → $level"
    elif [ "$streak" -ge 1 ]; then
        echo -e "Streak:      ${YELLOW}🔥 ${streak} dias${NC}"
        echo -e "Progresso:   ${YELLOW}${bar}${NC} ${streak}/${target} → $level"
    else
        echo -e "Streak:      ${RED}💤 0 dias${NC}"
        echo -e "Progresso:   ${RED}${bar}${NC} 0/${target}"
    fi
    
    echo ""
    echo "Recorde:     🏆 ${best_streak} dias"
    echo "Sessões:     📚 ${total_sessions} total"
    
    if [ -n "$last_session" ]; then
        echo "Última:      📅 ${last_session}"
    fi
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
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
        echo "Stats resetados"
        ;;
    *)
        echo "Uso: $0 [session|status|reset]"
        ;;
esac
