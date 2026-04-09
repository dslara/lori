# 🔍 Revisão de Consistência - Ultralearning System

**Data**: 2026-03-20  
**Versão do Projeto**: v3.3.0  
**Tipo**: consistency  
**Agente**: @review  
**Revisor**: @review

---

## 📊 Estado Atual

### Commands (31 arquivos)
- **Categorias**: plan (6), data (5), practice (4), study (3), module (3), setup (2), productivity (2), memory (2), learn (2), review (1), retro (1)
- **Nomenclatura**: Todos seguem `ul-[categoria]-[ação]` ✅
- **Frontmatter**: Todos têm `description`, `agent`, `model` ✅

### Tools (15 arquivos)
- **Categorias**: data (6), context (2), insights (1), status (1), retro (1), setup (1), utils (1), model-types (1), openviking-utils (1)
- **Nomenclatura**: Todas em kebab-case ✅

### Skills (7 diretórios)
- **Skills ativas**: debug-socratic, decomposition, directness, openviking-context, session, srs-generator
- **Template**: _template-skill
- **Nomenclatura**: Todas em kebab-case ✅

### Agentes (4 arquivos)
- **Agentes**: @meta, @tutor, @review, @brainstorm
- **Keywords definidas**: 24 keywords

---

## 🔗 Matriz de Dependências

### Commands → Tools OpenViking

| Command | memread | memsearch | membrowse | memcommit | data |
|---------|---------|-----------|-----------|-----------|------|
| `/ul-study-start` | ✅ | ✅ | - | - | - |
| `/ul-study-end` | - | - | - | ✅ | ✅ |
| `/ul-study-plan` | ✅ | ✅ | - | - | - |
| `/ul-memory-create` | - | ✅ | - | ✅ | - |
| `/ul-memory-review` | - | ✅ | - | ✅ | - |
| `/ul-module-create` | - | - | ✅ | ✅ | - |
| `/ul-module-switch` | ✅ | - | ✅ | ✅ | - |
| `/ul-module-archive` | - | ✅ | ✅ | ✅ | - |
| `/ul-retro-weekly` | ✅ | ✅ | - | - | - |
| `/ul-data-status` | ✅ | ✅ | - | - | - |
| `/ul-data-analytics` | ✅ | ✅ | - | - | - |

### Commands → Skills

| Command | Skill Invocada | Via |
|---------|---------------|-----|
| `/ul-study-start` | session | skill tool |
| `/ul-study-end` | session | skill tool |
| `/ul-study-plan` | session | skill tool |
| `/ul-practice-project` | directness | skill tool |
| `/ul-learn-debug` | debug-socratic | skill tool |
| `/ul-plan-decompose` | decomposition | skill tool |
| `/ul-memory-create` | srs-generator | skill tool |
| `/ul-memory-review` | srs-generator | skill tool |

### Tools → Tools

| Tool | Depende de | Tipo |
|------|-----------|------|
| `context-hybrid.ts` | `openviking-utils.ts` | Importação |
| `data.ts` | `data-session.ts`, `data-module.ts`, etc. | Facade |
| `insights.ts` | `utils-csv.ts` | Importação |
| `status.ts` | `utils-csv.ts` | Importação |

### Análise de Acoplamento

**Tools Sobrecarregadas**:
- `utils-csv.ts`: Usada por 6+ tools (⚠️ alto acoplamento)
- `openviking-utils.ts`: Usada por `context-hybrid.ts` e potencialmente outros

**Tools Subutilizadas**:
- `context.ts`: Usada apenas por 4 commands (`getWeekContext`, `getProjectInfo`)
- `context-hybrid.ts`: Não usada diretamente por nenhum command

**Skills Mais Usadas**:
- `session`: 3 commands
- `srs-generator`: 2 commands
- `directness`, `debug-socratic`, `decomposition`: 1 command cada

**Skills Subutilizadas**:
- `openviking-context`: 0 commands (❓ skill sem command?)

---

## ✅ Coerência com Projeto

### Nomenclatura ✅
- Commands: `ul-[categoria]-[ação]` consistente
- Tools: kebab-case consistente
- Skills: kebab-case consistente
- Arquivos de dados: kebab-case consistente

### Frontmatter ✅
- Todos os commands têm `description`, `agent`, `model`
- Todas as skills têm `name`, `description` no SKILL.md

### Documentação ⚠️
- README.md atualizado com arquitetura híbrida ✅
- docs/tools.md atualizado ✅
- docs/agents.md atualizado ✅
- Alguns arquivos de migração históricos (não crítico)

---

## ⚠️ Problemas Identificados

### 1. **[Gravidade: Alto]** Commands Duplicados

**Descrição**: `ul-plan-weekly.md` e `ul-plan-weekly-create.md` têm a mesma descrição e propósito.

**Impacto**: Confusão para o usuário, manutenção duplicada.

**Evidência**:
```
ul-plan-weekly.md: description: Criar plano semanal detalhado (/ul-plan-weekly)
ul-plan-weekly-create.md: description: Criar plano semanal detalhado (/ul-plan-weekly-create)
```

**Sugestão imediata**: Consolidar em um único command com argumento opcional.

---

### 2. **[Gravidade: Médio]** Tools de Contexto Duplicadas

**Descrição**: `context.ts` e `context-hybrid.ts` coexistem com funcionalidades sobrepostas.

**Impacto**: Confusão sobre qual usar, código duplicado.

**Evidência**:
- `context.ts`: 345 linhas, tem `getWeekContext`, `getProjectInfo`
- `context-hybrid.ts`: 326 linhas, tem `getFullContext`, `getUserPreferences`, `getRelevantSessions`, `getLearningPatterns`, `getAgentId`, `getSessionContext`
- Nenhum command usa `context-hybrid.ts` diretamente

**Sugestão imediata**: Consolidar em uma única tool ou documentar quando usar cada uma.

---

### 3. **[Gravidade: Médio]** Keywords Órfãs

**Descrição**: Keywords definidas nos agentes mas não referenciadas em commands.

**Impacto**: Keywords que não funcionam quando invocadas.

**Evidência**:
| Keyword | Definida em | Referenciada? |
|---------|-------------|---------------|
| `#audit-quality` | meta.md, tutor.md | ❌ Não |
| `#brainstorm-*` (7) | brainstorm.md | ❌ Não |
| `#check-readiness` | review.md | ❌ Não |
| `#experiment` | tutor.md | ❌ Não |
| `#feedback` | tutor.md | ❌ Não |
| `#intuition` | tutor.md | ❌ Não |
| `#meta-review` | review.md | ❌ Não |
| `#srs-generator` | tutor.md | ❌ Não (mas há commands `/ul-memory-*`) |

**Sugestão imediata**: 
- Remover keywords não implementadas
- Ou criar commands para keywords úteis
- Documentar quais são invocáveis vs informativas

---

### 4. **[Gravidade: Baixo]** Skill sem Command

**Descrição**: `openviking-context` skill existe mas não há command que a invoque.

**Impacto**: Skill pode estar órfã.

**Evidência**:
- Skill existe em `.opencode/skills/openviking-context/`
- Nenhum command referencia essa skill

**Sugestão imediata**: Verificar se a skill é usada internamente ou criar command.

---

### 5. **[Gravidade: Baixo]** Modelos Diferentes para Mesmo Propósito

**Descrição**: Commands similares usam modelos diferentes.

**Impacto**: Inconsistência de comportamento.

**Evidência**:
| Command | Model |
|--------|-------|
| `/ul-plan-weekly` | minimax-m2.5 |
| `/ul-plan-weekly-create` | minimax-m2.5 |
| `/ul-plan-resources` | kimi-k2.5 |
| `/ul-plan-decompose` | glm-5 |
| `/ul-plan-adjust` | glm-5 |
| `/ul-plan-benchmark` | glm-5 |

**Sugestão imediata**: Padronizar modelo para commands de planejamento (sugestão: glm-5 para tasks simples, kimi-k2.5 para tasks complexas).

---

## 💡 Sugestões de Melhoria

### 🔵 Pequenas (Quick Wins)

1. **Consolidar commands duplicados**
   - **Problema**: `ul-plan-weekly` e `ul-plan-weekly-create` são idênticos
   - **Solução**: Manter apenas `ul-plan-weekly` com argumento `--create` opcional
   - **Esforço**: 30 minutos
   - **Benefício**: Menos confusão, menos manutenção

2. **Documentar keywords órfãs**
   - **Problema**: Keywords definidas mas não funcionais
   - **Solução**: Adicionar seção "Keywords Informativas" no Quick Reference de cada agente
   - **Esforço**: 1 hora
   - **Benefício**: Clareza para usuários

3. **Remover `#keyword-name` placeholder**
   - **Problema**: Placeholder no template de review.md
   - **Solução**: Remover linha 152 do review.md
   - **Esforço**: 2 minutos
   - **Benefício**: Limpeza

4. **Padronizar modelos de planejamento**
   - **Problema**: Commands de planejamento usam modelos diferentes
   - **Solução**: Usar glm-5 para tasks simples, kimi-k2.5 para tasks complexas
   - **Esforço**: 15 minutos
   - **Benefício**: Consistência

---

### 🟡 Médias (Próximo Sprint)

1. **Consolidar tools de contexto**
   - **Problema**: `context.ts` e `context-hybrid.ts` sobrepostos
   - **Solução**: Migrar operações de `context.ts` para `context-hybrid.ts` ou documentar uso de cada uma
   - **Esforço**: 2 dias
   - **Dependências**: Nenhuma
   - **Riscos**: Breaking changes em commands que usam `context.ts`

2. **Verificar skill `openviking-context`**
   - **Problema**: Skill sem command associado
   - **Solução**: Verificar se é usada internamente ou criar command
   - **Esforço**: 1 dia
   - **Dependências**: Análise de uso
   - **Riscos**: Baixo

3. **Criar command para `#intuition`**
   - **Problema**: Keyword útil mas sem command
   - **Solução**: Criar `/ul-learn-intuition [conceito]`
   - **Esforço**: 2 horas
   - **Dependências**: Nenhuma
   - **Risks**: Baixo

---

### 🔴 Grandes (Estratégicas)

#### 1. **PROPOSTA RADICAL - Consolidar Tools de Contexto**

**🎯 Problema que resolve**:
Duas tools de contexto (`context.ts` e `context-hybrid.ts`) com funcionalidades sobrepostas causam confusão e duplicação de código.

**💡 Solução proposta**:
Migrar todas as operações para `context-hybrid.ts` e descontinuar `context.ts`.

**🗺️ Plano de transição**:

- **Fase 1: Análise** (1 dia)
  - [ ] Mapear todas as operações de `context.ts`
  - [ ] Verificar quais são usadas por commands
  - [ ] Identificar gaps em `context-hybrid.ts`

- **Fase 2: Migração** (2 dias)
  - [ ] Adicionar operações faltantes a `context-hybrid.ts`
  - [ ] Atualizar commands para usar `context-hybrid.ts`
  - [ ] Testar cada command

- **Fase 3: Depreciação** (1 dia)
  - [ ] Marcar `context.ts` como deprecated
  - [ ] Atualizar documentação
  - [ ] Remover após 2 semanas

**⚖️ Análise de Impacto vs Benefício**:

| Aspecto | Atual | Proposto | Diferença |
|---------|-------|----------|-----------|
| Manutenibilidade | 2 tools para manter | 1 tool | Melhor |
| Performance | Similar | Similar | Neutro |
| Complexidade | Alta (2 arquivos) | Média (1 arquivo) | Melhor |
| Breaking changes | Nenhuma | Commands precisam atualizar | Risco |

**⏱️ Esforço estimado**: 4 dias

**💰 Custo de migração**: Baixo (commands já usam operações específicas)

**✨ Benefícios**:
- Menos código para manter
- Clareza sobre qual tool usar
- Consistência com arquitetura híbrida

**🎯 Recomendação**: 
[ ] **APROVAR** - Implementar no próximo sprint

---

## 📋 Resumo Executivo

### Estatísticas
- ✅ **31** commands verificados
- ✅ **15** tools verificadas
- ✅ **7** skills verificadas
- ✅ **4** agentes verificados
- ⚠️ **5** problemas identificados
- 💡 **7** sugestões de melhoria

### Veredito Geral
**Projeto saudável com melhorias sugeridas**

Justificativa: A arquitetura está bem organizada com nomenclatura consistente. Os problemas identificados são principalmente de duplicação (commands e tools) e keywords órfãs, que não afetam funcionalidade mas podem causar confusão.

---

## 🎯 Ações Recomendadas (Priorizadas)

### Imediatas (Esta semana)
1. [ ] Consolidar `ul-plan-weekly` e `ul-plan-weekly-create` em um único command
2. [ ] Remover `#keyword-name` placeholder do review.md
3. [ ] Documentar keywords informativas vs funcionais

### Curto prazo (Próximas 2-4 semanas)
1. [ ] Analisar e consolidar tools de contexto
2. [ ] Verificar uso da skill `openviking-context`
3. [ ] Padronizar modelos para commands de planejamento

### Médio prazo (Próximos 2-3 meses)
1. [ ] Criar command para `#intuition` se útil
2. [ ] Revisar todas as keywords órfãs e decidir destino

### Longo prazo (Considerar para futuro)
1. [ ] Avaliar se skills devem ter commands correspondentes

---

## 📚 Referências

- `planning/proposta-arquitetura-dados-hibrida-2026-03-19.md` - Arquitetura híbrida
- `CHANGELOG.md` - Histórico de mudanças
- `.opencode/agents/*.md` - Definições de keywords

---

## 📝 Notas Adicionais

A migração para arquitetura híbrida (CSV + OpenViking) foi completada com sucesso. A remoção de `tutor_interactions.csv` e `data-interaction.ts` deixou o código mais limpo. Os principais pontos de atenção são:

1. **Duplicação de commands**: `ul-plan-weekly` e `ul-plan-weekly-create` são idênticos
2. **Duplicação de tools**: `context.ts` e `context-hybrid.ts` precisam de consolidação
3. **Keywords órfãs**: Várias keywords definidas mas não implementadas

---

*Revisão gerada pelo agente @review*  
*Template: `reviews/_template-framework-review.md`*