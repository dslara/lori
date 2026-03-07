#!/bin/bash

# common.sh - Funções e variáveis compartilhadas entre scripts

# Error handling: Sair em caso de erro, variável não definida ou erro em pipe
set -euo pipefail

# Trap para mostrar linha de erro (usar BASH_SOURCE para obter nome correto)
trap 'script_name="${BASH_SOURCE[0]:-$0}"; echo -e "\033[0;31m❌ Erro na linha $LINENO do script $(basename "$script_name"). Abortando.\033[0m" >&2' ERR

# Cores
export BLUE='\033[0;34m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export RED='\033[0;31m'
export PURPLE='\033[0;35m'
export NC='\033[0m'

# Variáveis
export TODAY=$(date +%Y-%m-%d)

# Determinar PROJECT_ROOT automaticamente
# Tentar determinar a partir do caminho do script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/common.sh" ]; then
    export PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"
fi

# Se PROJECT_ROOT ainda não estiver definido, usar diretório padrão
: ${PROJECT_ROOT:=/home/dani/Work/dslara/ultralearning}

# Ler módulo ativo de modules.csv (is_active=true, independente do status)
if [ -f "$PROJECT_ROOT/data/modules.csv" ]; then
    active_line=$(grep ",true," "$PROJECT_ROOT/data/modules.csv" 2>/dev/null | grep -v "^id," | head -1)
    if [ -n "$active_line" ]; then
        module_id=$(echo "$active_line" | cut -d',' -f1)
        module_name=$(echo "$active_line" | cut -d',' -f3)
        export CURRENT_TOPIC="$module_id-$module_name"
    else
        export CURRENT_TOPIC="nenhum"
    fi
else
    export CURRENT_TOPIC="nenhum"
fi
export TOPIC_PATH="$PROJECT_ROOT/projects/$CURRENT_TOPIC"

# Carregar .env se existir
[ -f .env ] && source .env

# Função: Verificar se há módulo ativo
check_module() {
    if [ "$CURRENT_TOPIC" = "nenhum" ]; then
        echo -e "${RED}❌ Nenhum módulo ativo. Use: make switch${NC}"
        exit 1
    fi
}

# Função: Verificar se OpenCode está instalado
check_opencode() {
    if ! command -v opencode &> /dev/null; then
        echo -e "${YELLOW}⚠️  OpenCode não instalado${NC}"
        return 1
    fi
    return 0
}

# Função: Verificar dependências básicas
check_deps() {
    local deps_ok=true
    
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}✗ jq não instalado${NC}"
        if command -v brew &> /dev/null; then
            echo -e "${YELLOW}  → macOS: brew install jq${NC}"
        elif command -v apt &> /dev/null; then
            echo -e "${YELLOW}  → Linux: sudo apt install jq${NC}"
        elif command -v dnf &> /dev/null; then
            echo -e "${YELLOW}  → Fedora: sudo dnf install jq${NC}"
        fi
        deps_ok=false
    fi
    
    if ! command -v opencode &> /dev/null; then
        echo -e "${YELLOW}⚠️  opencode não instalado${NC}"
        echo -e "${YELLOW}  → Baixe o binário em: https://github.com/opencode-ai/opencode/releases${NC}"
    fi
    
    $deps_ok
}

# Função: Header padrão
print_header() {
    local title="$1"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$title${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Função: Sucesso
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função: Erro
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Função: Aviso
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Função: Info
print_info() {
    echo -e "${YELLOW}$1${NC}"
}

# Função: Write seguro (evita perda de dados)
safe_write() {
    local content="$1"
    local file="$2"
    local mode="${3:-append}"  # append (default) ou overwrite
    
    if [ "$mode" = "overwrite" ]; then
        if ! echo "$content" > "$file" 2>/dev/null; then
            print_error "Falha ao escrever em $file (sem espaço em disco ou sem permissão)"
            return 1
        fi
    else
        if ! echo "$content" >> "$file" 2>/dev/null; then
            print_error "Falha ao adicionar conteúdo em $file"
            return 1
        fi
    fi
    return 0
}

# Função: Validar nome de módulo
validate_module_name() {
    local name="$1"
    
    # Apenas letras minúsculas, números e hífens
    if [[ ! "$name" =~ ^[a-z0-9-]+$ ]]; then
        print_error "Nome de módulo inválido: '$name'"
        print_info "Use apenas letras minúsculas (a-z), números (0-9) e hífens (-)"
        print_info "Exemplos válidos: python-basics, cs-fundamentals, web-dev-2024"
        return 1
    fi
    
    # Não pode começar ou terminar com hífen
    if [[ "$name" =~ ^- ]] || [[ "$name" =~ -$ ]]; then
        print_error "Nome não pode começar ou terminar com hífen"
        return 1
    fi
    
    # Não pode ter hífens consecutivos
    if [[ "$name" =~ -- ]]; then
        print_error "Nome não pode ter hífens consecutivos"
        return 1
    fi
    
    # Mínimo 3 caracteres
    if [ ${#name} -lt 3 ]; then
        print_error "Nome muito curto (mínimo 3 caracteres)"
        return 1
    fi
    
    return 0
}

# Função: Sanitizar input de usuário
sanitize_input() {
    local input="$1"
    # Remove caracteres perigosos mantendo apenas alfanuméricos, espaços, hífens e underscores
    echo "$input" | tr -cd '[:alnum:][:space:]-_'
}

# Função: Obter contexto da semana atual (primeira semana se não há progresso salvo)
get_week_context() {
    local week_file=$(find "$TOPIC_PATH/meta" -maxdepth 1 -name "week-*.md" 2>/dev/null | sort -V | head -1)
    if [ -n "$week_file" ]; then
        echo "$week_file"
    fi
}

# Função: Obter últimos N logs diários (default: 3)
get_recent_logs() {
    local n="${1:-3}"
    local logs_dir="$TOPIC_PATH/logs/daily"

    if [ ! -d "$logs_dir" ]; then
        echo ""
        return
    fi

    ls -t "$logs_dir"/*.md 2>/dev/null | head -n "$n" | while read -r file; do
        echo "=== $(basename "$file") ==="
        head -n 50 "$file"
        echo ""
    done
}

# Função: Obter cards SRS pendentes de revisão
get_srs_pending() {
    local srs_file="$TOPIC_PATH/knowledge/spaced-repetition.jsonl"
    local today
    today=$(date +%Y-%m-%d)

    if [ ! -f "$srs_file" ]; then
        echo "Nenhum card cadastrado."
        return
    fi

    if ! command -v jq &> /dev/null; then
        echo "jq não instalado — SRS não carregado."
        return
    fi

    local count=0
    local pending=""

    while IFS= read -r line; do
        [ -z "$line" ] && continue
        local next_review
        next_review=$(echo "$line" | jq -r '.next_review' 2>/dev/null)
        if [[ "$next_review" < "$today" ]] || [[ "$next_review" == "$today" ]]; then
            count=$((count + 1))
            local front
            front=$(echo "$line" | jq -r '.front' 2>/dev/null)
            pending="${pending}- ${front}\n"
        fi
    done < "$srs_file"

    if [ "$count" -eq 0 ]; then
        echo "Nenhum card para revisar hoje."
    else
        echo "$count cards pendentes:"
        printf "%b" "$pending"
    fi
}
