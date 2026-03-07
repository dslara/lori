#!/bin/bash

# start.sh - Iniciar sessão + quiz automático

source "$(dirname "$0")/common.sh"

check_module

print_header "🚀 Iniciando Sessão de Ultralearning"

print_info "📦 Módulo: $CURRENT_TOPIC"
print_info "📅 Data: $TODAY"
echo ""

# Salvar timestamp de início para calcular duração no make end
source "$(dirname "$0")/data.sh"
init_data
echo "$(date +%s)" > "$DATA_DIR/.session_start_time"

echo ""

echo -e "${PURPLE}🧠 Warm-up: iniciando sessão com contexto...${NC}"
echo ""

if check_opencode; then
    WEEK_FILE=$(get_week_context)
    RECENT_SESSIONS=$(get_recent_sessions 3)
    SRS_PENDING=$(get_srs_pending)

    # Construir contexto estruturado
    CONTEXT="Contexto do módulo: $CURRENT_TOPIC
Data: $TODAY

"

    if [ -n "$WEEK_FILE" ]; then
        print_info "📅 Plano encontrado: $(basename "$WEEK_FILE")"
        WEEK_CONTENT=$(cat "$WEEK_FILE")
        CONTEXT="${CONTEXT}## Plano da Semana
$WEEK_CONTENT

"
    else
        print_warning "Nenhum plano de semana encontrado"
        print_info "Crie um com: @meta #create-weekly-plan"
        CONTEXT="${CONTEXT}## Plano da Semana
Nenhum plano disponível. Crie com: @meta #create-weekly-plan

"
    fi

    if [ -n "$RECENT_SESSIONS" ]; then
        print_info "📝 Últimas sessões carregadas do DB"
        CONTEXT="${CONTEXT}## Últimas Sessões
$RECENT_SESSIONS

"
    else
        CONTEXT="${CONTEXT}## Últimas Sessões
Nenhuma sessão anterior registrada.

"
    fi

    CONTEXT="${CONTEXT}## SRS Pendente
$SRS_PENDING"

    opencode run "@tutor #start
$CONTEXT"
else
    print_warning "OpenCode não instalado. Quiz pulado."
    print_info "Instale o opencode (binário nativo)"
fi

echo ""
print_success "Pronto! Use 'make study' para imersão"
