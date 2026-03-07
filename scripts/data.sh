#!/bin/bash

# data.sh - Funções para gerenciar dados CSV
# 
# SCRIPT INTERNO — não tem target Makefile direto.
# Chamado por: end.sh, status.sh, etc.

# Só carregar common.sh se ainda não foi carregado
if [ -z "${PROJECT_ROOT:-}" ]; then
    source "$(dirname "$0")/common.sh"
fi

# Garantir que DATA_DIR aponte para o diretório correto
DATA_DIR="$PROJECT_ROOT/data"
USER_ID="${USER_ID:-dani}"

# Inicializar arquivos CSV se não existirem
init_data() {
    mkdir -p "$DATA_DIR" || return 1
    
    [ ! -f "$DATA_DIR/users.csv" ] && echo "id,username,email,timezone,created_at,preferences" > "$DATA_DIR/users.csv"
    [ ! -f "$DATA_DIR/modules.csv" ] && echo "id,user_id,name,is_active,status,started_at,completed_at,total_hours" > "$DATA_DIR/modules.csv"
    [ ! -f "$DATA_DIR/sessions.csv" ] && echo "id,user_id,module_id,date,duration_min,focus_score,notes" > "$DATA_DIR/sessions.csv"
    [ ! -f "$DATA_DIR/session_skills.csv" ] && echo "session_id,skill,duration_min,topic,notes,success_rating" > "$DATA_DIR/session_skills.csv"
    [ ! -f "$DATA_DIR/flashcards.csv" ] && echo "id,user_id,module_id,front,back,category,created_at,tags,next_review,interval,easiness,reviews" > "$DATA_DIR/flashcards.csv"
    [ ! -f "$DATA_DIR/reviews.csv" ] && echo "flashcard_id,reviewed_at,quality,next_review" > "$DATA_DIR/reviews.csv"
    [ ! -f "$DATA_DIR/insights.csv" ] && echo "date,user_id,metric,value,module_id" > "$DATA_DIR/insights.csv"
    [ ! -f "$DATA_DIR/goals.csv" ] && echo "id,user_id,module_id,description,target_date,status,progress" > "$DATA_DIR/goals.csv"
    [ ! -f "$DATA_DIR/tutor_interactions.csv" ] && echo "id,session_id,skill,topic,user_message,user_response,tutor_response,timestamp,metadata" > "$DATA_DIR/tutor_interactions.csv"
    
    return 0
}

# Ler métrica de insights.csv
get_insight() {
    local metric="$1"
    local module_id="${2:-}"
    local date="${3:-}"
    
    init_data
    
    local result=""
    
    if [ -n "$date" ]; then
        # Buscar por data específica
        result=$(grep "^$date,$USER_ID,$metric," "$DATA_DIR/insights.csv" 2>/dev/null | tail -1) || true
    elif [ -n "$module_id" ]; then
        # Buscar por módulo
        result=$(grep ",$USER_ID,$metric,.*,$module_id$" "$DATA_DIR/insights.csv" 2>/dev/null | tail -1) || true
    else
        # Buscar qualquer ocorrência
        result=$(grep ",$USER_ID,$metric," "$DATA_DIR/insights.csv" 2>/dev/null | tail -1) || true
    fi
    
    if [ -n "$result" ]; then
        echo "$result" | cut -d',' -f4
    fi
}

# Escrever métrica em insights.csv
set_insight() {
    local metric="$1"
    local value="$2"
    local module_id="${3:-}"
    local date="${4:-$TODAY}"
    
    init_data
    
    # Remover métrica existente para este dia
    local tmp_file=$(mktemp)
    grep -v "^$date,$USER_ID,$metric," "$DATA_DIR/insights.csv" > "$tmp_file" 2>/dev/null || true
    mv "$tmp_file" "$DATA_DIR/insights.csv"
    
    # Adicionar nova métrica
    echo "$date,$USER_ID,$metric,$value,$module_id" >> "$DATA_DIR/insights.csv"
}

# Truncar notas para 200 chars
truncate_notes() {
    local notes="$1"
    local max_len=200
    
    if [ ${#notes} -gt $max_len ]; then
        echo "${notes:0:$max_len}..."
    else
        echo "$notes"
    fi
}

# Criar sessão
create_session() {
    local module_id="$1"
    local duration="${2:-0}"
    local focus_score="${3:-0}"
    local notes="${4:-}"
    
    init_data
    
    # Truncar notas se necessário
    notes=$(truncate_notes "$notes")
    
    local session_id="$TODAY-$(date +%H%M%S)"
    echo "$session_id,$USER_ID,$module_id,$TODAY,$duration,$focus_score,\"$notes\"" >> "$DATA_DIR/sessions.csv"
    echo "$session_id"
}

# Atualizar sessão
update_session() {
    local session_id="$1"
    local duration="$2"
    local focus_score="$3"
    local notes="$4"
    
    init_data
    
    local tmp_file=$(mktemp)
    while IFS= read -r line; do
        if [[ "$line" == "$session_id,"* ]]; then
            echo "$session_id,$USER_ID,$CURRENT_TOPIC,$TODAY,$duration,$focus_score,\"$notes\"" >> "$tmp_file"
        else
            echo "$line" >> "$tmp_file"
        fi
    done < "$DATA_DIR/sessions.csv"
    mv "$tmp_file" "$DATA_DIR/sessions.csv"
}

# Obter última sessão
get_last_session() {
    init_data
    grep ",$USER_ID," "$DATA_DIR/sessions.csv" 2>/dev/null | tail -1
}

# Obter streak
get_streak() {
    local streak=$(get_insight "streak" "" "")
    echo "${streak:-0}"
}

# Obter best streak
get_best_streak() {
    local best=$(get_insight "best_streak" "" "")
    echo "${best:-0}"
}

# Obter total de sessões
get_total_sessions() {
    local total=$(get_insight "total_sessions" "" "")
    echo "${total:-0}"
}

# Atualizar streak
update_streak() {
    init_data
    
    local last_session=$(get_insight "last_session" "" "")
    local streak=$(get_streak)
    local best_streak=$(get_best_streak)
    local total_sessions=$(get_total_sessions)
    
    # Já estudou hoje?
    if [ "$last_session" = "$TODAY" ]; then
        echo -e "${YELLOW}Sessão já registrada hoje${NC}"
        return
    fi
    
    # Calcular streak
    if [ -z "$last_session" ]; then
        streak=1
    else
        local diff=$(( ($(date -d "$TODAY" +%s) - $(date -d "$last_session" +%s)) / 86400 ))
        
        if [ "$diff" -eq 1 ]; then
            streak=$((streak + 1))
            echo -e "${GREEN}🔥 Streak +1!${NC}"
        elif [ "$diff" -gt 1 ]; then
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
    
    # Salvar métricas
    set_insight "streak" "$streak"
    set_insight "best_streak" "$best_streak"
    set_insight "total_sessions" "$total_sessions"
    set_insight "last_session" "$TODAY"
}

# Mostrar status
show_data_status() {
    init_data || return 1
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}        🎮 STATUS${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    local streak=$(get_streak)
    local best_streak=$(get_best_streak)
    local total_sessions=$(get_total_sessions)
    local last_session=$(get_insight "last_session" "" "")
    
    # Garantir valores numéricos
    streak=${streak:-0}
    best_streak=${best_streak:-0}
    total_sessions=${total_sessions:-0}
    
    # Progress bar
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
    
    local filled=$((progress * 10 / target))
    [ "$filled" -gt 10 ] && filled=10
    local empty=$((10 - filled))
    
    local bar=""
    for ((i=0; i<filled; i++)); do bar+="█"; done
    for ((i=0; i<empty; i++)); do bar+="░"; done
    
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

# Main - só executar se chamado diretamente (não com source)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-}" in
        init)
            init_data
            print_success "Dados inicializados em $DATA_DIR"
            ;;
        status)
            show_data_status
            ;;
        streak)
            update_streak
            ;;
        *)
            echo "Uso: $0 [init|status|streak]"
            ;;
    esac
fi
