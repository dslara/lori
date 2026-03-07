#!/bin/bash
# Sistema de Spaced Repetition (Algoritmo SM-2 simplificado)
# Baseado em: SuperMemo, Anki
#
# SCRIPT INTERNO — não tem target Makefile direto.
# Chamado por: review.sh (make review) para listar, revisar e adicionar flashcards
#
# Storage: data/flashcards.csv (CSV global, RFC 4180)
# Colunas: id,user_id,module_id,front,back,category,created_at,tags,next_review,interval,easiness,reviews

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/data.sh"

check_module

# Verificar dependências
if ! command -v bc &> /dev/null; then
    print_error "'bc' não instalado. Execute: brew install bc"
    exit 1
fi

CARDS_DB="$DATA_DIR/flashcards.csv"
init_data

# ---------------------------------------------------------------------------
# Helpers CSV RFC 4180
# ---------------------------------------------------------------------------

# Escapar campo para CSV: envolve em aspas duplas e escapa aspas internas
csv_escape() {
    local value="$1"
    # Substituir " por "" e envolver em aspas
    printf '"%s"' "${value//\"/\"\"}"
}

# Ler campo N (1-indexed) de uma linha CSV respeitando aspas duplas
# Uso: csv_field "$line" N
csv_field() {
    local line="$1"
    local field_num="$2"
    # Usa python3 para parsing robusto de CSV
    python3 -c "
import csv, sys
reader = csv.reader([sys.argv[1]])
row = next(reader)
idx = int(sys.argv[2]) - 1
print(row[idx] if idx < len(row) else '')
" "$line" "$field_num" 2>/dev/null
}

# ---------------------------------------------------------------------------
# SM-2: calcular próxima revisão
# ---------------------------------------------------------------------------
calculate_next_review() {
    local quality=$1   # 0-5
    local interval=$2  # dias
    local easiness=$3  # 1.3-2.5

    local new_easiness
    new_easiness=$(echo "$easiness + 0.1 - (5 - $quality) * (0.08 + (5 - $quality) * 0.02)" | bc -l)
    new_easiness=$(echo "if ($new_easiness < 1.3) 1.3 else if ($new_easiness > 2.5) 2.5 else $new_easiness" | bc -l)

    local new_interval
    if [ "$quality" -lt 3 ]; then
        new_interval=1
    elif [ "$interval" -eq 0 ]; then
        new_interval=1
    elif [ "$interval" -eq 1 ]; then
        new_interval=3
    else
        new_interval=$(echo "$interval * $new_easiness" | bc -l | cut -d. -f1)
    fi

    echo "$new_interval|$new_easiness"
}

# ---------------------------------------------------------------------------
# Adicionar card
# ---------------------------------------------------------------------------
add_card() {
    local front="$1"
    local back="$2"
    local category="${3:-geral}"
    local tags="${4:-}"

    local random_suffix=$(( RANDOM % 10000 ))
    local card_id="$(date +%s)${random_suffix}"
    local today=$(date +%Y-%m-%d)
    local module_id
    module_id=$(grep ",active," "$DATA_DIR/modules.csv" 2>/dev/null | tail -1 | cut -d',' -f1 || echo "M1")

    # Montar linha CSV com escaping correto
    local f_front f_back f_category f_tags
    f_front=$(csv_escape "$front")
    f_back=$(csv_escape "$back")
    f_category=$(csv_escape "$category")
    f_tags=$(csv_escape "$tags")

    echo "$card_id,$USER_ID,$module_id,$f_front,$f_back,$f_category,$today,$f_tags,$today,0,2.5,0" >> "$CARDS_DB"

    echo -e "${GREEN}✅ Card adicionado: #$card_id${NC}"
    echo "$card_id"
}

# ---------------------------------------------------------------------------
# Listar cards que vencem hoje
# ---------------------------------------------------------------------------
list_due_cards() {
    local today=$(date +%Y-%m-%d)
    local count=0

    echo -e "${BLUE}📅 Cards para revisar hoje ($today):${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Pular header
    tail -n +2 "$CARDS_DB" | while IFS= read -r line; do
        [ -z "$line" ] && continue

        local next_review
        next_review=$(csv_field "$line" 9)

        if [[ "$next_review" < "$today" ]] || [[ "$next_review" == "$today" ]]; then
            count=$((count + 1))
            local id category front reviews interval
            id=$(csv_field "$line" 1)
            category=$(csv_field "$line" 6)
            front=$(csv_field "$line" 4)
            reviews=$(csv_field "$line" 12)
            interval=$(csv_field "$line" 10)

            echo -e "${YELLOW}#$id${NC} [$category] (revisão $reviews, intervalo: ${interval}d)"
            echo "  Q: $front"
            echo ""
        fi
    done

    # Contar separadamente (subshell não preserva variável)
    count=$(tail -n +2 "$CARDS_DB" | while IFS= read -r line; do
        [ -z "$line" ] && continue
        next_review=$(csv_field "$line" 9)
        [[ "$next_review" < "$today" ]] || [[ "$next_review" == "$today" ]] && echo "1"
    done | wc -l | tr -d ' ')

    if [ "${count:-0}" -eq 0 ]; then
        echo -e "${GREEN}🎉 Nenhum card para revisar hoje!${NC}"
    else
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "${YELLOW}Total: $count cards${NC}"
    fi
}

# ---------------------------------------------------------------------------
# Revisão interativa
# ---------------------------------------------------------------------------
review_cards() {
    local today=$(date +%Y-%m-%d)
    local reviewed=0
    local temp_file
    temp_file=$(mktemp)

    # Copiar header
    head -1 "$CARDS_DB" > "$temp_file"

    echo -e "${BLUE}🧠 Iniciando sessão de revisão${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    tail -n +2 "$CARDS_DB" | while IFS= read -r line; do
        [ -z "$line" ] && continue

        local next_review
        next_review=$(csv_field "$line" 9)

        if [[ "$next_review" < "$today" ]] || [[ "$next_review" == "$today" ]]; then
            local id front back category interval easiness reviews
            id=$(csv_field "$line" 1)
            front=$(csv_field "$line" 4)
            back=$(csv_field "$line" 5)
            category=$(csv_field "$line" 6)
            interval=$(csv_field "$line" 10)
            easiness=$(csv_field "$line" 11)
            reviews=$(csv_field "$line" 12)

            echo -e "${YELLOW}Card #$id${NC} [$category]"
            echo ""
            echo -e "${BLUE}❓ Pergunta:${NC}"
            echo "$front"
            echo ""
            read -p "Pressione ENTER para ver resposta..."
            echo ""
            echo -e "${GREEN}✅ Resposta:${NC}"
            echo "$back"
            echo ""
            echo "Como você se saiu?"
            echo "  0 - Não lembro nada"
            echo "  1 - Lembrei pouco"
            echo "  2 - Lembrei com esforço"
            echo "  3 - Lembrei com alguma dificuldade"
            echo "  4 - Lembrei facilmente"
            echo "  5 - Perfeito, muito fácil"
            echo ""
            read -p "Nota (0-5): " quality

            if [[ ! "$quality" =~ ^[0-5]$ ]]; then
                echo -e "${RED}Nota inválida. Usando 2 (padrão)${NC}"
                quality=2
            fi

            local result new_interval new_easiness new_next_review new_reviews
            result=$(calculate_next_review "$quality" "$interval" "$easiness")
            new_interval=$(echo "$result" | cut -d'|' -f1)
            new_easiness=$(echo "$result" | cut -d'|' -f2)
            new_next_review=$(date -v+${new_interval}d +%Y-%m-%d 2>/dev/null || date -d "+${new_interval} days" +%Y-%m-%d)
            new_reviews=$((reviews + 1))

            # Reconstruir linha com valores atualizados
            local f1 f2 f3 f4 f5 f6 f7 f8
            f1=$(csv_field "$line" 1)   # id
            f2=$(csv_field "$line" 2)   # user_id
            f3=$(csv_field "$line" 3)   # module_id
            f4=$(csv_escape "$(csv_field "$line" 4)")  # front
            f5=$(csv_escape "$(csv_field "$line" 5)")  # back
            f6=$(csv_escape "$(csv_field "$line" 6)")  # category
            f7=$(csv_field "$line" 7)   # created_at
            f8=$(csv_escape "$(csv_field "$line" 8)")  # tags

            echo "$f1,$f2,$f3,$f4,$f5,$f6,$f7,$f8,$new_next_review,$new_interval,$new_easiness,$new_reviews" >> "$temp_file"

            echo ""
            echo -e "${GREEN}✅ Próxima revisão: $new_next_review (em ${new_interval} dias)${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""

            # Persistir revisão em reviews.csv (histórico completo)
            echo "$id,$(date +%Y-%m-%d),$quality,$new_next_review" >> "$DATA_DIR/reviews.csv"

            reviewed=$((reviewed + 1))
        else
            echo "$line" >> "$temp_file"
        fi
    done

    mv "$temp_file" "$CARDS_DB"

    echo ""
    echo -e "${GREEN}🎉 Sessão concluída! $reviewed cards revisados.${NC}"
}

# ---------------------------------------------------------------------------
# Importar de knowledge/concepts/
# ---------------------------------------------------------------------------
import_from_knowledge() {
    local concepts_dir="$TOPIC_PATH/knowledge/concepts"

    if [ ! -d "$concepts_dir" ]; then
        echo -e "${RED}❌ Diretório concepts/ não encontrado${NC}"
        return
    fi

    echo -e "${BLUE}📚 Procurando conceitos em knowledge/concepts/${NC}"

    local count=0
    for file in "$concepts_dir"/*.md; do
        if [ -f "$file" ]; then
            local concept_name
            concept_name=$(basename "$file" .md)

            local back
            back=$(head -n 20 "$file" | grep -v "^#" | grep -v "^$" | head -n 3 | tr '\n' ' ')

            if [ -n "$back" ]; then
                add_card "Explique: $concept_name" "$back" "conceito" > /dev/null
                count=$((count + 1))
            fi
        fi
    done

    echo -e "${GREEN}✅ $count conceitos importados${NC}"
}

# ---------------------------------------------------------------------------
# Estatísticas
# ---------------------------------------------------------------------------
show_stats() {
    echo -e "${BLUE}📊 Estatísticas de Spaced Repetition${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    local today=$(date +%Y-%m-%d)
    local total=0 due=0 mastered=0

    tail -n +2 "$CARDS_DB" | while IFS= read -r line; do
        [ -z "$line" ] && continue
        total=$((total + 1))

        local next_review interval
        next_review=$(csv_field "$line" 9)
        interval=$(csv_field "$line" 10)

        [[ "$next_review" < "$today" ]] || [[ "$next_review" == "$today" ]] && due=$((due + 1))
        [ "${interval:-0}" -ge 30 ] && mastered=$((mastered + 1))
    done

    # Contar via subshell separado (devido ao pipe)
    total=$(tail -n +2 "$CARDS_DB" | grep -c "." || echo 0)
    due=$(tail -n +2 "$CARDS_DB" | while IFS= read -r line; do
        [ -z "$line" ] && continue
        next_review=$(csv_field "$line" 9)
        [[ "$next_review" < "$today" ]] || [[ "$next_review" == "$today" ]] && echo "1"
    done | wc -l | tr -d ' ')
    mastered=$(tail -n +2 "$CARDS_DB" | while IFS= read -r line; do
        [ -z "$line" ] && continue
        interval=$(csv_field "$line" 10)
        [ "${interval:-0}" -ge 30 ] && echo "1"
    done | wc -l | tr -d ' ')

    echo "Total de cards:      ${total:-0}"
    echo "Para revisar hoje:   ${due:-0}"
    echo "Masterizados (30d+): ${mastered:-0}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
case "${1:-list}" in
    add)
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "Uso: $0 add \"pergunta\" \"resposta\" [categoria] [tags]"
            exit 1
        fi
        add_card "$2" "$3" "${4:-geral}" "${5:-}"
        ;;
    list)
        list_due_cards
        ;;
    review)
        review_cards
        ;;
    import)
        import_from_knowledge
        ;;
    stats)
        show_stats
        ;;
    *)
        echo "Uso: $0 {add|list|review|import|stats}"
        echo ""
        echo "Comandos:"
        echo "  add \"Q\" \"A\" [cat] [tags]  - Adicionar card"
        echo "  list                       - Listar cards para hoje"
        echo "  review                     - Fazer revisão interativa"
        echo "  import                     - Importar de knowledge/concepts/"
        echo "  stats                      - Ver estatísticas"
        exit 1
        ;;
esac
