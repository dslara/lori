#!/bin/bash

# review.sh - Spaced repetition (SRS)
# Se executado via make (sem terminal), invoca @tutor para revisão socrática

source "$(dirname "$0")/common.sh"

# Função para verificar se tem terminal interativo
has_interactive_terminal() {
    [ -t 0 ] || [ "${FORCE_INTERACTIVE:-}" = "1" ]
}

# Função para invocar tutor para revisão socrática
invoke_tutor_review() {
    print_header "📚 Spaced Repetition - Modo Tutor"
    
    if check_opencode; then
        echo -e "${PURPLE}💭 Preparando revisão socrática com @tutor...${NC}"
        echo ""
        
        # Listar cards pendentes primeiro
        local cards_file=$(mktemp)
        "$(dirname "$0")/spaced-repetition.sh" list > "$cards_file" 2>&1
        
        # Contar cards (procurando por ID no formato #número)
        # Remove códigos de cor ANSI antes de contar
        local clean_output=$(sed 's/\x1b\[[0-9;]*m//g' "$cards_file")
        local card_count=$(grep -cE "^#[[:digit:]]+" <<< "$clean_output" 2>/dev/null || echo "0")
        card_count=${card_count:-0}
        
        if [ "$card_count" -eq 0 ]; then
            echo "Nenhum card para revisar hoje! 🎉"
            rm "$cards_file"
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
        
        # Invocar tutor com os cards (sem thinking blocks)
        opencode run --thinking=false '@tutor "#srs-generator review"' || {
            print_warning "Falha ao invocar tutor. Mostrando cards..."
            cat "$cards_file"
        }
        rm "$cards_file"
    else
        print_warning "OpenCode não instalado. Mostrando modo direto."
        "$(dirname "$0")/spaced-repetition.sh" list
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
        "$(dirname "$0")/spaced-repetition.sh" list
        ;;
    2)
        invoke_tutor_review
        ;;
    3)
        read -p "Pergunta: " q
        read -p "Resposta: " a
        "$(dirname "$0")/spaced-repetition.sh" add "$q" "$a" "geral"
        ;;
    4)
        "$(dirname "$0")/spaced-repetition.sh" stats
        ;;
    *)
        print_warning "Opção inválida"
        ;;
esac
