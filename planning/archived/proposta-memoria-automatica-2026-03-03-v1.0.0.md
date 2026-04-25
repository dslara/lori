# 💡 Proposta: Memória Automática para Sessões

**Data**: 2026-02-28  
**Versão atual**: v1.0.0  
**Proponente**: Agente @review (via discussão com usuário)  
**Status**: 🟡 Proposta  
**Prioridade**: 🟡 Média

---

## 🎯 Resumo Executivo

Implementar carregamento automático de contexto no `make start`, eliminando a necessidade do usuário digitar comandos para compartilhar histórico. O sistema passará automaticamente para @session: plano da semana, últimos 3 logs diários e cards SRS pendentes.

---

## 🚨 Problema Atual

### Descrição

LLMs não têm memória entre sessões. Atualmente, o @tutor e @session pedem ao usuário para compartilhar contexto manualmente (`cat projects/[modulo]/logs/daily/...`), criando fricção e dependência de disciplina do usuário.

### Impacto

- **Quem é afetado**: Usuário do framework em toda sessão
- **Quando ocorre**: Em 100% das sessões que precisam de contexto
- **Custo do problema**: 
  - Fricção cognitiva (lembrar de digitar comandos)
  - Perda de contexto se usuário esquece
  - Sessões menos efetivas sem histórico

### Evidências

- [x] `start.sh` carrega apenas `week-{N}.md` (não carrega logs nem SRS)
- [x] `session.md` instrui agente a pedir contexto ao usuário
- [x] `tutor.md` explicita: "LLMs não têm memória entre sessões"
- [x] Discussão com usuário confirmou: "dependência de disciplina do usuário" é problema real

---

## 💡 Solução Proposta

### Visão Geral

Modificar `start.sh` para carregar automaticamente:
1. **Plano da semana** (`week-{N}.md`) — já implementado parcialmente
2. **Últimos 3 logs diários** (`logs/daily/*.md`) — novo
3. **Cards SRS pendentes** (`knowledge/spaced-repetition.jsonl`) — novo

Passar tudo para @session via contexto estruturado.

### Benefícios Principais

1. **Zero fricção**: Usuário roda `make start` e contexto está lá
2. **Continuidade real**: @session sabe o que foi estudado ontem
3. **SRS integrado**: Lembretes automáticos de revisão

### Alternativas Consideradas

| Alternativa | Prós | Contras | Decisão |
|-------------|------|---------|---------|
| Manter como está (manual) | Zero mudança | Fricção, dependência de disciplina | ❌ Rejeitada |
| Arquivo de estado (`current.md`) | Simples | Duplicação, sincronização manual | ❌ Rejeitada |
| **Carregar logs automaticamente** | Zero fricção, dados reais | Leitura de arquivos a cada start | ✅ Recomendada |
| Banco de dados (SQLite) | Estruturado | Complexidade excessiva | ❌ Rejeitada |

---

## 🗺️ Plano de Transição

### Visão Geral

**Duração**: 1-2 horas  
**Fases**: 2  
**Dependências**: Nenhuma

### Fase 1: Adicionar Funções em `common.sh` (30 min)

**Objetivo**: Criar funções reutilizáveis para carregar contexto.

**Tarefas**:
- [ ] Adicionar `get_recent_logs(n)` — retorna últimos N logs
- [ ] Adicionar `get_srs_pending()` — retorna cards pendentes de revisão
- [ ] Testar funções isoladamente

**Entregáveis**:
- `scripts/common.sh` atualizado com 2 novas funções

**Critérios de sucesso**:
- `get_recent_logs 3` retorna conteúdo dos últimos 3 logs
- `get_srs_pending` retorna cards com `next_review <= today`

**Riscos**:
| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Logs muito grandes | Baixa | Médio | Limitar a 50 linhas por log |
| SRS vazio | Alta | Baixo | Retornar mensagem amigável |

### Fase 2: Modificar `start.sh` (30 min)

**Objetivo**: Integrar funções no fluxo de início de sessão.

**Tarefas**:
- [ ] Substituir seção de contexto (linhas 38-61)
- [ ] Construir contexto estruturado para @session
- [ ] Testar fluxo completo

**Entregáveis**:
- `scripts/start.sh` atualizado

**Critérios de sucesso**:
- `make start` carrega contexto completo automaticamente
- @session recebe plano + logs + SRS sem intervenção do usuário

---

## ⚖️ Análise de Impacto vs Benefício

### Impacto (Custos e Riscos)

#### Esforço de Implementação
- **Tempo estimado**: 1-2 horas
- **Pessoas necessárias**: 1
- **Complexidade técnica**: Baixa
- **Esforço de aprendizado**: Nenhum (bash padrão)

#### Breaking Changes
- [ ] **Não** - Backward compatible
  - Se logs/SRS não existem, funciona normalmente com mensagem

#### Riscos Técnicos
| Risco | Probabilidade | Impacto | Estratégia |
|-------|--------------|---------|------------|
| Performance (ler muitos arquivos) | Baixa | Baixo | Limitar a 3 logs, 50 linhas cada |
| jq não instalado (SRS) | Média | Baixo | Graceful degradation |

### Benefícios (Valor Agregado)

#### UX (Experiência do Usuário)
- **Antes**: Usuário precisa digitar `cat logs/...` manualmente
- **Depois**: Contexto carregado automaticamente
- **Ganho**: Eliminação de fricção em 100% das sessões

#### Continuidade
- **Antes**: @tutor/@session "esquecem" tudo entre sessões
- **Depois**: Histórico de 3 dias carregado automaticamente
- **Ganho**: Sessões conectadas, progresso visível

#### ROI (Retorno sobre Investimento)
- **Investimento**: 1-2 horas
- **Retorno esperado**: Economia de ~2 min/sessão × 365 sessões/ano = 12h/ano
- **Payback**: Imediato

---

## 📊 Recomendação

**Veredito**: ✅ **APROVAR**

**Justificativa**: 
- Baixo esforço de implementação
- Alto impacto na UX
- Zero breaking changes
- Resolve problema real identificado pelo usuário

---

## ✅ Checklist de Implementação

### Preparação
- [x] Problema identificado e validado com usuário
- [x] Solução desenhada
- [ ] Proposta aprovada pelo usuário

### Implementação
- [ ] Fase 1: Funções em `common.sh`
- [ ] Fase 2: Integração em `start.sh`
- [ ] Testes manuais realizados

### Validação
- [ ] `make start` funciona com módulo sem logs
- [ ] `make start` funciona com módulo com logs
- [ ] `make start` funciona com SRS vazio
- [ ] `make start` funciona com SRS populado

---

## 🔗 Referências

### Documentação Relacionada
- `scripts/start.sh` — fluxo atual de início de sessão
- `scripts/common.sh` — funções compartilhadas
- `.opencode/agents/session.md` — agente que recebe contexto

### Contexto Histórico
- Discussão em 2026-02-28 sobre problemas do framework
- Análise do @tutor: "dependência de disciplina do usuário"
- Análise do @tutor: "LLMs não têm memória"

---

## 💬 Discussão e Decisões

### Comentários da Revisão

**2026-02-28 - Usuário**:
> "o gatilho ao review eu nao concordo. a retro e sobre o topico estudado nao a qualidade do framework."

**Resposta**: Proposta ajustada — removido gatilho automático para @review. Foco mantido em memória automática.

---

## 📝 Notas e Observações

### Implementação Técnica

#### Função `get_recent_logs(n)` em `common.sh`:

```bash
get_recent_logs() {
    local n="${1:-3}"
    local logs_dir="$TOPIC_PATH/logs/daily"
    
    if [ ! -d "$logs_dir" ]; then
        echo ""
        return
    fi
    
    ls -t "$logs_dir"/*.md 2>/dev/null | head -n "$n" | while read -r file; do
        echo "=== $(basename "$file") ==="
        cat "$file"
        echo ""
    done
}
```

#### Função `get_srs_pending()` em `common.sh`:

```bash
get_srs_pending() {
    local srs_file="$TOPIC_PATH/knowledge/spaced-repetition.jsonl"
    local today=$(date +%Y-%m-%d)
    
    if [ ! -f "$srs_file" ]; then
        echo "Nenhum card cadastrado."
        return
    fi
    
    local count=0
    local pending=""
    
    while IFS= read -r line; do
        if [ -z "$line" ]; then continue; fi
        
        local next_review=$(echo "$line" | jq -r '.next_review' 2>/dev/null)
        
        if [[ "$next_review" < "$today" ]] || [[ "$next_review" == "$today" ]]; then
            count=$((count + 1))
            local front=$(echo "$line" | jq -r '.front' 2>/dev/null)
            pending="${pending}- $front\n"
        fi
    done < "$srs_file"
    
    if [ $count -eq 0 ]; then
        echo "Nenhum card para revisar hoje."
    else
        echo "$count cards pendentes:"
        echo -e "$pending"
    fi
}
```

#### Modificação em `start.sh`:

Substituir seção de contexto (linhas 38-61) por:

```bash
if check_opencode; then
    # Carregar contexto completo
    WEEK_FILE=$(get_week_context)
    RECENT_LOGS=$(get_recent_logs 3)
    SRS_PENDING=$(get_srs_pending)
    
    # Construir contexto para @session
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
    
    opencode run --agent @session "#session-start
$CONTEXT"
else
    print_warning "OpenCode não instalado. Contexto automático pulado."
fi
```

---

*Proposta gerada pelo agente @review*  
*Template: `planning/_template-proposta.md`*
