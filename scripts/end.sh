#!/bin/bash

# end.sh - Encerrar sessão (salva + streak + CSV)

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

check_module

print_header "🏁 Encerrando Sessão"

# Reflexão estruturada com @session antes de salvar o log
if check_opencode; then
    echo -e "${PURPLE}💭 Consolidando sessão com @session...${NC}"
    echo -e "${YELLOW}  (pressiona Ctrl+C para saltar e escrever diretamente)${NC}"
    echo ""
    opencode run '@session "#end"' || true
    echo ""
    print_info "📋 Copia o texto gerado acima para o resumo abaixo."
    echo -e "${YELLOW}  ou escreve um resumo livre se não usaste @session${NC}"
    echo ""
fi

# Verificar se há terminal interativo
if [ -t 0 ]; then
    read -p "O que você aprendeu hoje? (breve): " learning
    read -p "Duração da sessão (min): " duration
    read -p "Score de foco (1-10): " focus_score
else
    print_info "📝 Para salvar resumo, execute: make end LEARNING='seu resumo' DURATION=60 FOCUS=7"
    learning="${LEARNING:-}"
    duration="${DURATION:-60}"
    focus_score="${FOCUS:-7}"
fi

if [ -n "$learning" ]; then
    # Verificar se o arquivo de log existe antes de escrever
    if [ ! -f "$TOPIC_PATH/logs/daily/$TODAY.md" ]; then
        print_error "Arquivo de log não encontrado. Execute 'make start' primeiro."
        exit 1
    fi
    
    safe_write "" "$TOPIC_PATH/logs/daily/$TODAY.md" || exit 1
    safe_write "## 📊 Resumo da Sessão" "$TOPIC_PATH/logs/daily/$TODAY.md" || exit 1
    safe_write "" "$TOPIC_PATH/logs/daily/$TODAY.md" || exit 1
    safe_write "$learning" "$TOPIC_PATH/logs/daily/$TODAY.md" || exit 1
    safe_write "" "$TOPIC_PATH/logs/daily/$TODAY.md" || exit 1
    print_success "Resumo salvo"
    
    # Registrar sessão no CSV
    module_id=$(echo "$CURRENT_TOPIC" | grep -oE '^[A-Z][0-9]' || echo "M1")
    
    create_session "$module_id" "$duration" "$focus_score" "$learning" > /dev/null
    print_success "Sessão registrada em data/sessions.csv"
fi

echo ""

# Atualizar streak (agora via data.sh)
"$(dirname "$0")/data.sh" streak

echo ""

# Gerar analytics
"$(dirname "$0")/analytics.sh" update "$module_id" > /dev/null 2>&1 || true

echo -e "${GREEN}📝 Log: $TOPIC_PATH/logs/daily/$TODAY.md${NC}"
echo -e "${GREEN}📊 Dados: data/sessions.csv${NC}"
echo -e "${GREEN}📈 Analytics: data/insights.csv${NC}"
print_success "Sessão encerrada! Bom trabalho! 🎉"
