#!/bin/bash

# review.sh - Spaced repetition (SRS)
# Atualizado v2.0: Usa tools TypeScript ao invés de spaced-repetition.sh

source "$(dirname "$0")/common.sh"

# Função para verificar se tem terminal interativo
has_interactive_terminal() {
    [ -t 0 ] || [ "${FORCE_INTERACTIVE:-}" = "1" ]
}

# Função para contar cards pendentes via data tool
count_pending_cards() {
    # Verificar se há cards pendentes contando linhas em flashcards.csv
    # onde next_review <= hoje
    local today=$(date +%Y-%m-%d)
    local count=0
    
    if [ -f "$PROJECT_ROOT/data/flashcards.csv" ]; then
        # Pular header e contar cards com next_review <= hoje
        count=$(awk -F, -v today="$today" 'NR>1 && $9 <= today {count++} END {print count+0}' "$PROJECT_ROOT/data/flashcards.csv" 2>/dev/null || echo "0")
    fi
    
    echo "${count:-0}"
}

# Função para listar cards pendentes (formato simples)
list_pending_cards() {
    local today=$(date +%Y-%m-%d)
    
    if [ -f "$PROJECT_ROOT/data/flashcards.csv" ]; then
        echo "📅 Cards para revisar hoje:"
        echo ""
        
        # Listar front dos cards pendentes
        awk -F, -v today="$today" 'NR>1 && $9 <= today {print "• " $4}' "$PROJECT_ROOT/data/flashcards.csv" 2>/dev/null | head -20
        
        local total=$(count_pending_cards)
        if [ "$total" -gt 20 ]; then
            echo ""
            echo "... e mais $((total - 20)) cards"
        fi
    else
        echo "❌ Arquivo flashcards.csv não encontrado"
    fi
}

# Função para invocar tutor para revisão socrática
invoke_tutor_review() {
    print_header "📚 Spaced Repetition - Modo Tutor"
    
    if check_opencode; then
        echo -e "${PURPLE}💭 Preparando revisão socrática com @tutor...${NC}"
        echo ""
        
        # Contar cards pendentes
        local card_count=$(count_pending_cards)
        
        if [ "$card_count" -eq 0 ]; then
            echo "Nenhum card para revisar hoje! 🎉"
            exit 0
        fi
        
        echo "📅 $card_count cards pendentes para revisão."
        echo ""
        echo "O @tutor vai conduzir a revisão socrática."
        echo "Responda as perguntas aqui no chat."
        echo ""
        
        # Só pausa se tem terminal
        if has_interactive_terminal; then
            echo "Pressione ENTER para continuar..."
            read
        fi
        
        # Invocar tutor com os cards
        opencode run --thinking=false '@tutor "#srs-generator review"' || {
            print_warning "Falha ao invocar tutor."
            list_pending_cards
        }
    else
        print_warning "OpenCode não instalado. Mostrando cards pendentes:"
        list_pending_cards
    fi
}

# Função para adicionar card (via data tool)
add_card() {
    local front="$1"
    local back="$2"
    local category="${3:-geral}"
    
    if [ -z "$front" ] || [ -z "$back" ]; then
        print_error "Pergunta e resposta são obrigatórias"
        return 1
    fi
    
    # Usar data tool para criar flashcard
    if check_opencode; then
        echo "Criando flashcard via data tool..."
        # O @tutor vai lidar com a criação quando usamos #srs-generator
        opencode run "@tutor #srs-generator"
    else
        print_warning "OpenCode não instalado. Adicione manualmente via @tutor #srs-generator"
    fi
}

# Verificar se deve usar modo tutor (via make sem terminal)
if ! has_interactive_terminal; then
    invoke_tutor_review
    exit $?
fi

# Modo interativo (terminal disponível)
print_header "📚 Spaced Repetition"
echo ""

echo "  1. 📅 Ver cards para hoje"
echo "  2. 🎯 Sessão de revisão (tutor socrático)"
echo "  3. ➕ Adicionar card"
echo "  4. 📊 Estatísticas"
echo ""

read -p "Opção [2]: " opt
opt=${opt:-2}

case $opt in
    1)
        list_pending_cards
        ;;
    2)
        invoke_tutor_review
        ;;
    3)
        read -p "Pergunta: " q
        read -p "Resposta: " a
        add_card "$q" "$a" "geral"
        ;;
    4)
        local count=$(count_pending_cards)
        echo ""
        echo "📊 Estatísticas SRS"
        echo "=================="
        echo "Cards pendentes hoje: $count"
        echo ""
        echo "Para estatísticas detalhadas, use: /analytics no TUI"
        ;;
    *)
        print_warning "Opção inválida"
        ;;
esac
