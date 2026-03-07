#!/bin/bash

# end.sh - Encerrar sessão (salva + streak + CSV)

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

check_module

print_header "🏁 Encerrando Sessão"

# Calcular duração automaticamente se start_time foi salvo
duration=""
if [ -f "$DATA_DIR/.session_start_time" ]; then
    start_ts=$(cat "$DATA_DIR/.session_start_time")
    end_ts=$(date +%s)
    duration=$(( (end_ts - start_ts) / 60 ))
    rm -f "$DATA_DIR/.session_start_time"
    print_info "⏱️  Duração calculada: ${duration} min"
fi

# Verificar se há terminal interativo
if [ -t 0 ]; then
    read -p "O que você aprendeu hoje? (breve): " learning
    if [ -z "$duration" ]; then
        read -p "Duração da sessão (min): " duration
    fi
    read -p "Score de foco (1-10): " focus_score
    read -p "Técnicas usadas (separar por vírgula, ex: drill,quiz,feynman): " techniques_input
else
    print_info "📝 Para salvar resumo, execute: make end LEARNING='seu resumo' FOCUS=7 TECHNIQUES='drill,quiz'"
    learning="${LEARNING:-}"
    if [ -z "$duration" ]; then
        duration="${DURATION:-60}"
    fi
    focus_score="${FOCUS:-7}"
    techniques_input="${TECHNIQUES:-}"
fi

if [ -n "$learning" ]; then
    # Registrar sessão no CSV
    module_id=$(echo "$CURRENT_TOPIC" | grep -oE '^[A-Z][0-9]+' || echo "M1")

    session_id=$(create_session "$module_id" "$duration" "$focus_score" "$learning")
    print_success "Sessão registrada em data/sessions.csv"

    # Registrar técnicas usadas em session_skills.csv
    if [ -n "$techniques_input" ]; then
        IFS=',' read -ra techs <<< "$techniques_input"
        for tech in "${techs[@]}"; do
            tech=$(echo "$tech" | tr -d ' ' | tr '[:upper:]' '[:lower:]')
            if [ -n "$tech" ]; then
                echo "$session_id,$tech,,,\"$learning\"," >> "$DATA_DIR/session_skills.csv"
            fi
        done
        print_success "Técnicas registradas em data/session_skills.csv: $(echo "$techniques_input" | tr -d ' ')"
    fi
fi

echo ""

# Atualizar streak
"$(dirname "$0")/data.sh" streak

echo ""

# Gerar analytics (inclui error_rate e flashcards_reviewed)
"$(dirname "$0")/analytics.sh" update "${module_id:-M1}" > /dev/null 2>&1 || true

echo -e "${GREEN}📊 Dados: data/sessions.csv${NC}"
echo -e "${GREEN}📈 Analytics: data/insights.csv${NC}"
print_success "Sessão encerrada! Bom trabalho! 🎉"
