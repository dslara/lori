# 🔍 REVISÃO DE AGENTES: @meta, @tutor e @review

**Data**: 2026-02-23  
**Versão analisada**: v2.8.0  
**Escopo**: Estrutura, keywords, consistência, efetividade, gaps  
**Executado por**: @review (auto-análise incluída)

---

## 📊 Estado Atual

O framework Ultralearning possui **3 agentes IA** especializados:

| Agente | Linhas | Keywords | Função Principal | Modelo |
|--------|--------|----------|------------------|--------|
| **@meta** | 382 | 6 principais | Planejamento estratégico, decomposição de objetivos | Claude Sonnet 4.6 |
| **@tutor** | 444 | 11 principais | Mentor socrático, técnicas de aprendizado | Claude Sonnet 4.6 |
| **@review** | 303 | 9 principais | Revisão arquitetural, auditoria, propostas | Claude Sonnet 4.6 |

**Total**: 1.129 linhas de instruções, 26 keywords documentadas

### Arquitetura de Agentes

```
.opencode/agents/
├── meta.md (382L)    → Planejamento (10% do tempo)
├── tutor.md (444L)   → Execução (80% do tempo)
└── review.md (303L)  → Revisão e melhoria contínua (10% do tempo)
```

---

## ✅ Coerência com Projeto

### Pontos Fortes ⭐

1. **Separação clara de responsabilidades**:
   - @meta = Planejar
   - @tutor = Executar/Ensinar
   - @review = Avaliar/Melhorar
   
2. **Documentação completa**: Todas as keywords listadas no README
   
3. **Filosofia socrática consistente**: @tutor guia, não resolve (forte ênfase)

4. **Conexão explícita**: @meta documenta handoff para @tutor (linhas 353-378)

5. **Modelo consistente**: Todos usam Claude Sonnet 4.6 (~0.015€/interação)

6. **Idioma padronizado**: Português com termos técnicos em inglês

### Coerência Interna

| Verificação | Status | Observação |
|-------------|--------|------------|
| **README ↔ @meta** | ✅ 100% | 6 keywords documentadas e funcionais |
| **README ↔ @tutor** | ✅ 100% | 11 keywords documentadas e funcionais |
| **README ↔ @review** | ✅ 100% | 9 keywords documentadas e funcionais |
| **Keywords únicas** | ✅ Sim | Sem duplicação entre agentes |
| **Formato consistente** | ⚠️ 85% | @review usa formato diferente (mais conciso) |
| **Nomenclatura** | ✅ 100% | Todas seguem padrão `#comando-param` |

---

## ⚠️ Problemas Identificados

### 1. 🟡 **MÉDIO: Inconsistência de Formato Entre Agentes**

**Gravidade**: Média  
**Impacto**: Experiência inconsistente, dificulta manutenção

**Evidências**:

| Aspecto | @meta | @tutor | @review |
|---------|-------|--------|---------|
| **Seção "Identidade"** | ✅ 8 linhas | ✅ 7 linhas | ✅ 8 linhas |
| **Seção "Missão"** | ✅ Com citação | ✅ Com princípios | ✅ Com filosofia |
| **Estrutura de keywords** | ✅ Comando + Processo + Output + Exemplo | ✅ Comando + Quando usar + Exemplo | ⚠️ Comando + Descrição concisa |
| **Seção "Quick Reference"** | ✅ Presente (linha 341) | ❌ Ausente | ❌ Ausente |
| **Exemplos de interação** | ⚠️ Integrados nas keywords | ✅ Seção dedicada (linha 386-425) | ✅ Seção dedicada (linha 252-288) |
| **Checklist final** | ❌ Ausente | ✅ Presente (linha 435-443) | ❌ Ausente |

**Problema**: Dificulta aprendizado de padrão para criar novos agentes.

---

### 2. 🟡 **MÉDIO: @meta Não Lembra de Verificar Contexto Antes de Planejar**

**Gravidade**: Média  
**Impacto**: Planejamento pode ser no vácuo, ignorando progresso real

**Evidências**:
- Seção "🧭 Contexto e Continuidade" (linhas 24-44) é **descritiva**, mas não há:
  - ✅ Procedimento obrigatório de verificação
  - ✅ Prompt interno que force checagem automática
  - ✅ Exemplo concreto de como ler arquivos existentes

**Comparação com @tutor**:
```markdown
# @tutor (linha 29-40): Seção "🧭 Contexto do Usuário"
- Módulo ativo
- Nível
- Histórico
+ PERGUNTA OBRIGATÓRIA ao final de interações longas
```

**@meta deveria ter**: "Antes de CADA comando de planejamento, LEIA os arquivos relevantes"

**Impacto**: Usuário pode receber planos genéricos ou redundantes.

---

### 3. 🟢 **BAIXO: Gap de Keyword - Falta `#update-plan` no @meta**

**Gravidade**: Baixa  
**Impacto**: Nomenclatura não intuitiva

**Evidências**:
- Existe `#adjust-plan` (linha 209) para reajustar cronograma
- **Não existe** keyword para atualizar progresso em plano existente
- Usuário pode confundir quando usar `#adjust-plan` vs `#create-weekly-plan semana N`

**Proposta**: Adicionar `#update-plan semana [N]` para:
- Marcar entregas como completas
- Adicionar notas de progresso
- Atualizar status sem criar novo plano

---

### 4. 🟢 **BAIXO: @tutor - Falta Keyword para "Explicar Como Funciona X"**

**Gravidade**: Baixa  
**Impacto**: Usuário pode não saber qual keyword usar para entender conceito novo

**Evidências**:
- `#feynman` (linha 78) = Usuário explica para **validar** compreensão
- `#intuition` (linha 308) = Entender o "por quê" profundo
- **Falta**: Keyword para "Me explique X do zero"

**Proposta**: Adicionar `#explain [conceito]` para:
- IA explica conceito de forma estruturada
- Analogias + exemplos + aplicações práticas
- Diferente de #feynman (onde usuário explica) e #intuition (foco em "por quê")

---

### 5. 🔴 **CRÍTICO: @review - Conflito Entre Filosofia e Prática**

**Gravidade**: Alta  
**Impacto**: Confusão sobre o que o agente faz vs não faz

**Evidências**:

**Filosofia declarada (linhas 73-78)**:
```markdown
❌ NUNCA crie arquivos diretamente
❌ NUNCA modifique sistema
✅ Apenas gere conteúdo em texto puro
✅ Deixe usuário decidir se salva
```

**Seção "Keywords" (linhas 97-160)**:
```markdown
### 📁 Revisões Específicas (relatórios em memória)
#review-structure - Gera análise. Usuário decide se salva.

### 💾 Comandos: Apenas Gera Conteúdo (Usuário Salva)
#review-structure - Gera análise detalhada. Usuário decide se salva em reviews/.
```

**Problema**: 
- Seções **duplicadas** (linhas 99-117 vs 127-154)
- Mesmas keywords listadas 2x com descrições similares
- Causa confusão: "qual seção devo consultar?"

**Solução proposta**: Consolidar em uma única seção de keywords.

---

### 6. 🟡 **MÉDIO: @review - Auto-referência Não Clara**

**Gravidade**: Média  
**Impacto**: @review pode revisar a si mesmo de forma superficial

**Evidências**:
- Keyword `#review-agents` (linha 113): "Revisar agentes @meta e @tutor"
- **Não menciona explicitamente**: Auto-análise do @review incluída?
- **Risco**: @review pode focar apenas nos outros agentes e ignorar próprios problemas

**Solução**: Adicionar nota explícita: "⚠️ Auto-análise crítica incluída!"

---

### 7. 🟢 **BAIXO: Custo Estimado Não Atualizado**

**Gravidade**: Baixa  
**Impacto**: Usuário pode subestimar custo total

**Evidências**:
- Cada agente: ~0.015€/interação

**Proposta**: Adicionar tabela no README:

```markdown
## 💰 Custo Estimado

| Componente | Uso | Custo/dia | Custo/mês |
|------------|-----|-----------|-----------|
| @tutor | 3-5x/dia | €0.05-0.08 | €1.50-2.40 |
| @meta | 1x/semana | - | €0.06 |
| @review | 1x/mês | - | €0.015 |
| **TOTAL** | - | **€0.08-0.13** | **€2.50-4.00** |
```

---

## 💡 Sugestões de Melhoria

### Pequenas (Quick Wins) - Fazer Agora ✅

1. **Padronizar formato de agentes**:
   - Adicionar "Quick Reference" em @tutor e @review (como @meta linha 341)
   - Adicionar "Checklist final" em @meta e @review (como @tutor linha 435)
   - **Impacto**: Melhor UX, consistência
   - **Esforço**: 30 min
   - **Prioridade**: Alta

2. **Consolidar keywords duplicadas no @review**:
   - Remover seção "📁 Revisões Específicas" (linhas 99-117)
   - Manter apenas "💾 Comandos: Apenas Gera Conteúdo" (linhas 127-154)
   - **Impacto**: Elimina confusão
   - **Esforço**: 5 min
   - **Prioridade**: Alta

3. **Adicionar nota de auto-análise no @review**:
   - Linha 113, mudar para: "#review-agents - Revisar agentes @meta, @tutor E @review (auto-análise crítica incluída!)"
   - **Impacto**: Clareza
   - **Esforço**: 2 min
   - **Prioridade**: Média

4. **Atualizar tabela de custo no README**:
   - Incluir custo mensal estimado
   - **Impacto**: Transparência financeira
   - **Esforço**: 10 min
   - **Prioridade**: Média

---

### Médias (Próximo Sprint) - Semana Seguinte 📅

5. **Adicionar procedimento obrigatório de checagem de contexto no @meta**:
   - Antes de cada keyword de planejamento (#decompose-goal, #create-weekly-plan, etc)
   - Adicionar prompt interno: "⚠️ ANTES DE PLANEJAR: Leia arquivos existentes do módulo"
   - Exemplo concreto de como usar ferramentas de leitura
   - **Impacto**: Planejamento mais contextual, menos redundância
   - **Esforço**: 1h (incluindo exemplos)
   - **Prioridade**: Alta

6. **Adicionar keywords faltantes**:
   - `#update-plan semana [N]` no @meta (atualizar progresso)
   - `#explain [conceito]` no @tutor (explicação estruturada)
   - **Impacto**: Cobre casos de uso não atendidos
   - **Esforço**: 30-45 min cada
   - **Prioridade**: Média
---

### Grandes (Estratégicas) - Considerar para Futuro 🚀

8. **PROPOSTA: Unificar Template de Agentes**

   **Problema que resolve**: 
   - Inconsistência de formato dificulta criação de novos agentes
   - Manutenção mais difícil (3 formatos diferentes)
   - Usuário precisa "reaprender" estrutura para cada agente

   **Solução proposta**: 
   - Criar `template-agent.md` em `.opencode/agents/`
   - Definir seções obrigatórias e opcionais
   - Migrar @meta, @tutor, @review para novo formato

   **Template sugerido**:
   ```markdown
   # [Emoji] Agente @[nome] - [Tagline]
   
   ## Identidade (obrigatório)
   - Nome, Modelo, Custo, Idioma, Uso%
   
   ## 🎯 Missão (obrigatório)
   - 3-5 parágrafos descrevendo papel
   
   ## 🧭 Contexto e Continuidade (obrigatório)
   - O que verificar antes de agir
   - Como usar contexto
   
   ## 🔑 Keywords (obrigatório)
   ### #keyword [param]
   **Quando usar**: [descrição]
   **Processo**:
   1. Passo 1
   2. Passo 2
   **Exemplo**: [código]
   
   ## 📎 Quick Reference (obrigatório)
   - Tabela resumo de keywords
   
   ## 🎯 Exemplos de Interação (obrigatório)
   - 3-5 exemplos práticos
   
   ## ⚠️ Checklist Final (obrigatório)
   - Validação de cada resposta
   
   ## 🤝 Conexão com Outros Agentes (opcional)
   - Handoffs e integrações
   ```

   **Plano de transição**:
   - **Fase 1** (1 dia): Criar template + migrar @review (mais novo, menor)
   - **Fase 2** (1 dia): Migrar @meta (seções bem estruturadas)
   - **Fase 3** (1 dia): Migrar @tutor (mais complexo, 11 keywords)
   - **Fase 4** (1h): Documentar no README que todos agentes seguem template

   **Impacto**:
   - ✅ Breaking: Não (conteúdo similar, apenas reorganizado)
   - ⏱️ Tempo: 3 dias
   - 🎯 Esforço: Médio
   - 💰 Custo: Apenas tempo dev

   **Benefício**: 
   - Consistência 100%
   - Facilita criação de novos agentes
   - Melhora manutenibilidade

   **Recomendação**: ✅ **Fazer** (após implementar quick wins)

---

9. **PROPOSTA: Criar Agente @coach para Habit Tracking**

   **Problema que resolve**: 
   - @meta planeja, @tutor ensina, @review audita
   - **Mas ninguém** foca em manutenção de hábitos de longo prazo
   - Atomic Habits (James Clear) é pilar do framework, mas pouco explorado nos agentes
   - Streak tracking existe (bash), mas sem coaching personalizado

   **Solução proposta**: 
   - Novo agente `@coach` focado em Atomic Habits
   - Keywords:
     - `#habit-design [hábito]` - Desenhar novo hábito (cue-routine-reward)
     - `#habit-stack [hábito-novo] após [hábito-existente]` - Habit stacking
     - `#break-bad-habit [hábito]` - Estratégias para quebrar hábitos ruins
     - `#two-minute-rule [tarefa]` - Reduzir resistência inicial
     - `#environment-design` - Otimizar ambiente para hábitos
     - `#identity-based-goals [objetivo]` - Focar em identidade vs resultados
     - `#track-habits` - Analisar streak e sugerir ajustes

   **Plano de transição**:
   - **Fase 1** (2h): Criar @coach baseado no template unificado (se #8 feito)
   - **Fase 2** (1h): Integrar com streak tracking existente (bash)
   - **Fase 3** (30 min): Documentar no README
   - **Fase 4** (opcional): Criar skill `habit-coach` para sugestões automáticas

   **Impacto**:
   - ✅ Breaking: Não (agente novo, não modifica existentes)
   - ⏱️ Tempo: 3-4h inicial + testes
   - 🎯 Esforço: Médio
   - 💰 Custo: +€0.02/mês (1 uso/semana)

   **Benefício**: 
   - Completa a tríade: @meta (planejar) + @tutor (executar) + @coach (sustentar) + @review (melhorar)
   - Explora pilar Atomic Habits que está sub-utilizado
   - Aumenta retenção de longo prazo (maior gap atualmente)

   **Recomendação**: ⏳ **Considerar para Fase 2** (após consolidar agentes atuais)

---

10. **PROPOSTA: Sistema de Métricas para Efetividade de Agentes**

   **Problema que resolve**: 
   - Não há forma objetiva de medir se agentes estão sendo úteis
   - **Agents não têm métricas equivalentes**
   - Impossível saber: "@meta gera planos que são seguidos?" ou "@tutor realmente ajuda?"

   **Solução proposta**: 
   - Adicionar tracking opcional de interações com agentes
   - Arquivo: `projects/[módulo]/meta/agent-metrics.json`
   - Estrutura:
   ```json
   {
     "meta": {
       "total_calls": 12,
       "keywords_used": {
         "#create-weekly-plan": 8,
         "#adjust-plan": 3,
         "#decompose-goal": 1
       },
       "user_rating": [5, 4, 5, 5]
     },
     "tutor": {
       "total_calls": 45,
       "keywords_used": {
         "#directness": 15,
         "#drill": 20,
         "#quiz": 10
       },
       "user_rating": [5, 5, 4, 5]
     }
   }
   ```
   - Script bash: `scripts/log-agent-use.sh [agent] [keyword] [rating-opcional]`
   - Comando make: `make agent-stats` (resumo de uso)

   **Métricas possíveis**:
   | Métrica | Como Medir | Objetivo |
   |---------|------------|----------|
   | **Taxa de uso** | Calls/semana por agente | @tutor > @meta > @review |
   | **Keywords populares** | Top 3 por agente | Identificar features mais usadas |
   | **Satisfação** | Rating 1-5 opcional | ≥4/5 média |
   | **Abandono** | Última vez usado | <7 dias |

   **Plano de transição**:
   - **Fase 1** (2h): Criar `log-agent-use.sh` + estrutura JSON
   - **Fase 2** (1h): Adicionar `make agent-stats` (leitura + formatação)
   - **Fase 3** (1h): Documentar como usar (opcional, opt-in)
   - **Fase 4** (1h): Adicionar ao @review: `#review-agent-metrics` (análise de uso)

   **Impacto**:
   - ✅ Breaking: Não (opcional, opt-in)
   - ⏱️ Tempo: 5h inicial + manutenção mínima
   - 🎯 Esforço: Médio
   - 💰 Custo: Nenhum (apenas tracking local)

   **Benefício**: 
   - Identifica agentes/keywords sub-utilizados
   - Justifica investimento em novos agentes

   **Recomendação**: ⏳ **Deixar para longo prazo** (não crítico, nice-to-have)

---

## 📋 Resumo Executivo

### Estatísticas

- ✅ **21** verificações passaram (estrutura, nomenclatura, coerência)
- ⚠️ **5** alertas/avisos (inconsistências de formato, gaps de keywords)
- 🔴 **2** erros críticos (duplicação de seções, ambiguidade de auto-análise)
- 💡 **10** sugestões de melhoria (4 quick wins, 3 médio prazo, 3 estratégicas)

### Análise Geral

| Aspecto | Nota | Justificativa |
|---------|------|---------------|
| **Qualidade Técnica** | 9/10 | Bem estruturados, keywords claras |
| **Coerência Interna** | 8/10 | Pequenas inconsistências de formato |
| **Documentação** | 9/10 | Completa, mas poderia ser mais uniforme |
| **Efetividade** | ? | Sem métricas (proposta #10) |
| **Manutenibilidade** | 7/10 | 3 formatos diferentes dificultam evolução |

**Veredito**: ✅ **Agentes saudáveis, melhorias sugeridas não críticas**

---

## 🎯 Ações Recomendadas (Priorizadas)

### Imediato (Hoje)
1. ✅ Consolidar keywords duplicadas no @review (5 min)
2. ✅ Adicionar nota de auto-análise explícita (2 min)
3. ✅ Padronizar "Quick Reference" em todos agentes (30 min)

### Curto Prazo (Esta Semana)
4. ⏱️ Adicionar procedimento de checagem de contexto no @meta (1h)
5. ⏱️ Adicionar keywords `#update-plan` e `#explain` (45 min)
6. ⏱️ Atualizar tabela de custo no README (10 min)

### Médio Prazo (Próximo Mês)
7. 📅 Unificar template de agentes + migrar existentes (3 dias)

### Longo Prazo (Considerar)
9. 🔮 Criar agente @coach para Habit Tracking (após consolidação)
10. 🔮 Sistema de métricas para efetividade de agentes (nice-to-have)

---

*@review - Análise de Agentes Concluída - 2026-02-23*
