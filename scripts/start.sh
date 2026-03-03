#!/bin/bash

# start.sh - Iniciar sessão + quiz automático

source "$(dirname "$0")/common.sh"

check_module

print_header "🚀 Iniciando Sessão de Ultralearning"

print_info "📦 Módulo: $CURRENT_TOPIC"
print_info "📅 Data: $TODAY"
echo ""

# Criar diretório de logs
if ! mkdir -p "$TOPIC_PATH/logs/daily"; then
    print_error "Falha ao criar diretório de logs"
    exit 1
fi

# Criar log diário se não existir
if [ ! -f "$TOPIC_PATH/logs/daily/$TODAY.md" ]; then
    safe_write "# 📅 $TODAY - $CURRENT_TOPIC" "$TOPIC_PATH/logs/daily/$TODAY.md" "overwrite" || exit 1
    safe_write "" "$TOPIC_PATH/logs/daily/$TODAY.md" || exit 1
    safe_write "## 🎯 Objetivo" "$TOPIC_PATH/logs/daily/$TODAY.md" || exit 1
    safe_write "" "$TOPIC_PATH/logs/daily/$TODAY.md" || exit 1
    safe_write "## 📝 Notas" "$TOPIC_PATH/logs/daily/$TODAY.md" || exit 1
    safe_write "" "$TOPIC_PATH/logs/daily/$TODAY.md" || exit 1
    safe_write "## ✅ Aprendizados" "$TOPIC_PATH/logs/daily/$TODAY.md" || exit 1
    print_success "📝 Log criado: $TOPIC_PATH/logs/daily/$TODAY.md"
fi

echo ""

echo -e "${PURPLE}🧠 Warm-up: iniciando sessão com contexto...${NC}"
echo ""

if check_opencode; then
    WEEK_FILE=$(get_week_context)
    RECENT_LOGS=$(get_recent_logs 3)
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

    if [ -n "$RECENT_LOGS" ]; then
        print_info "📝 Últimas sessões carregadas"
        CONTEXT="${CONTEXT}## Últimas Sessões
$RECENT_LOGS

"
    else
        CONTEXT="${CONTEXT}## Últimas Sessões
Nenhuma sessão anterior registrada.

"
    fi

    CONTEXT="${CONTEXT}## SRS Pendente
$SRS_PENDING"

    opencode run "@session #start
$CONTEXT"
else
    print_warning "OpenCode não instalado. Quiz pulado."
    print_info "Instale o opencode (binário nativo)"
fi

echo ""
print_success "Pronto! Use 'make study' para imersão"
