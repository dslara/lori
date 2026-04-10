# 📋 Proposta: Melhorias nos Agentes baseadas em Agency-Agents

**Data**: 2026-04-09  
**Tipo**: Melhoria de agentes  
**Prioridade**: Alta  
**Agente**: @brainstorm  
**Fonte**: Análise do projeto [agency-agents](https://github.com/msitarzewski/agency-agents)

---

## 🎯 Resumo Executivo

Esta proposta busca adaptar padrões bem-sucedidos do projeto `agency-agents` (76k stars) para melhorar os agentes do framework Ultralearning. As melhorias focam em **clareza**, **mensurabilidade** e **padronização** de outputs.

### Estatísticas
- ✅ **4** melhorias de alta prioridade
- ✅ **2** melhorias de média prioridade
- ⚠️ **2** templates já existem
- 💡 **6** arquivos a criar/modificar

### Veredito Geral
**Implementação recomendada** - Melhorias de alta prioridade com baixo esforço e alto impacto na qualidade dos agentes.

---

## 📊 Estado Atual

### Agentes Existentes

| Agente | Arquivo | Linhas | Templates |
|--------|---------|--------|-----------|
| @meta | `.opencode/agents/meta.md` | 362 | Inline (learning-map, week, retro) |
| @tutor | `.opencode/agents/tutor.md` | 608 | ❌ Nenhum |
| @review | `.opencode/agents/review.md` | 644 | ✅ `_template-framework-review.md` |
| @brainstorm | `.opencode/agents/brainstorm.md` | ~400 | ❌ Nenhum |

### Padrões do Agency-Agents Identificados

| Padrão | Agency-Agents | Ultralearning Atual | Gap |
|--------|---------------|---------------------|-----|
| Regras Críticas | Seção destacada no topo | Checklist no final | ⚠️ Falta |
| Métricas de Sucesso | Métricas quantificadas | Não tem | ⚠️ Falta |
| Destaques de Personalidade | Citações marcantes | Tagline apenas | ⚠️ Falta |
| Processo de Trabalho | Pipeline sequencial | Keywords com processos | ✅ Similar |
| Templates de Entrega | Código de exemplo | Parcial (só @review) | ⚠️ Falta |
| Grade de Agentes | Tabela de referência | Quick Reference | ✅ Similar |

---

## 💡 Melhorias Propostas

### 1. Adicionar Seção "Regras Críticas" (★★★★★ Crítico)

**Problema**: Regras importantes estão no final (checklist) e não são enfatizadas.

**Solução**: Adicionar seção `## 🚨 Regras Críticas que Você Deve Seguir` no início de cada agente, logo após a missão.

**Impacto**: Alto (melhora qualidade e consistência)  
**Custo**: Baixo (reorganização de conteúdo existente)  
**ROI**: ★★★★★

**Arquivos a modificar**:
- `.opencode/agents/meta.md`
- `.opencode/agents/tutor.md`
- `.opencode/agents/review.md`
- `.opencode/agents/brainstorm.md`

**Estrutura proposta**:
```markdown
## 🚨 Regras Críticas que Você Deve Seguir

### @meta
1. **Nunca planeje no vácuo**: Sempre leia arquivos existentes do módulo primeiro
2. **Objetivos SMART**: Todo objetivo deve ser Específico, Mensurável, Atingível, Relevante, Temporal
3. **Consciência de recursos**: Considere tempo disponível antes de planejar
4. **Qualidade do ajuste**: Ajustes reduzem escopo, não aumentam
5. **Clareza no handoff**: Referencie @tutor para execução com expectativas claras

### @tutor
1. **Nunca dê soluções**: Sempre guie com perguntas
2. **Dificuldade adaptativa**: Verifique error_rate antes de fazer perguntas
3. **Registro de sessão**: Sempre chame `/ul-study-end` antes de sair
4. **Carregamento de contexto**: Nunca pule carregar contexto (CSV + OpenViking)
5. **Persistência de memória**: Sempre chame `memcommit()` ao final da sessão

### @review
1. **Baseado em evidências**: Nunca audite sem dados
2. **Classificação de severidade**: Crítica/Alta/Média/Baixa para cada issue
3. **Recomendações acionáveis**: Todo issue deve ter sugestão de correção
4. **Sem opiniões**: Use métricas e padrões, não julgamentos subjetivos
5. **Verifique antes de propor**: Sempre verifique `reviews/` e `planning/` primeiro

### @brainstorm
1. **Verificação de originalidade**: Nunca proponha sem verificar `planning/` e OpenViking
2. **Acionabilidade**: 100% das ideias devem ter próximos passos
3. **Estimativa de ROI**: Toda ideia deve ter estimativa de custo/benefício
4. **Contexto primeiro**: Sempre carregue estado atual antes de propor
5. **Sem fantasia**: Propostas devem ser tecnicamente viáveis
```

---

### 2. Adicionar "Métricas de Sucesso" Baseadas em Dados (★★★★★ Crítico)

**Problema**: Não temos métricas de sucesso definidas para os agentes.

**Solução**: Adicionar seção `## 🎯 Métricas de Sucesso (Baseadas em Dados)` com métricas extraídas dos dados existentes (`data/` + OpenViking).

**Impacto**: Alto (permite medir eficácia dos agentes)  
**Custo**: Médio (define métricas e instrumentação)  
**ROI**: ★★★★★

**Fontes de dados**:
- `data/sessions.csv` → Sessões, duração, focus_score
- `data/insights.csv` → Streak, métricas agregadas
- `data/modules.csv` → Módulos ativos/arquivados
- `data/flashcards.csv` → Flashcards, reviews, SRS
- `reviews/*.md` → Auditorias do framework (para @review)
- `planning/*.md` → Propostas de melhoria (para @brainstorm)
- OpenViking → Preferências, padrões, histórico

> **Nota**: @review e @brainstorm são agentes globais do framework.
> - @review usa `reviews/*.md` para métricas de auditoria
> - @brainstorm usa `planning/*.md` para métricas de ideação
> - Ambos não usam dados de aprendizado do usuário

**Estrutura proposta para @meta**:
```markdown
## 🎯 Métricas de Sucesso (Baseadas em Dados)

### Métricas Extraídas de `data/`

| Métrica | Fonte | Fórmula | Meta |
|---------|-------|---------|------|
| **Taxa de Conclusão do Plano** | `sessions.csv` | `completadas / planejadas` | >80% |
| **Impacto no Streak** | `insights.csv` | `streak_com_plano / streak_sem_plano` | >1.2x |
| **Progresso do Módulo** | `modules.csv` | `% semanas completadas` | Linear |
| **Eficiência de Ajustes** | `sessions.csv` | `dias_ajustados / dias_totais` | <20% |

### Como Verificar

```typescript
const context = await contextHybrid({ operation: "getFullContext" });
const sessions = await data.getSessions({ limit: 30 });
const streak = await data.getStreak();
```

### Você é bem-sucedido quando:
- ✅ Usuários completam >80% das sessões planejadas
- ✅ Streak aumenta durante uso do plano
- ✅ Progresso do módulo é linear, não estagnado
- ✅ Ajustes reduzem escopo, não aumentam
```

**Estrutura proposta para @tutor**:
```markdown
## 🎯 Métricas de Sucesso (Baseadas em Dados)

| Métrica | Fonte | Fórmula | Meta |
|---------|-------|---------|------|
| **Conclusão de Sessão** | `sessions.csv` | `com_ended / started` | >90% |
| **Focus Score Médio** | `sessions.csv` | `AVG(focus_score)` | >7/10 |
| **Qualidade Feynman** | `sessions.csv` | `AVG(feynman_score)` | >7/10 |
| **Retenção SRS** | `flashcards.csv` | `on_time / total` | >80% |
| **Progressão de Skills** | `sessions.csv` | `novas / praticadas` | >0.3 |

### Você é bem-sucedido quando:
- ✅ >90% das sessões são finalizadas
- ✅ Focus score médio >7/10
- ✅ >80% dos flashcards revisados no prazo
- ✅ Progressão de skills consistente
```

**Estrutura proposta para @review**:
```markdown
## 🎯 Métricas de Sucesso (Baseadas em Qualidade)

> **Nota**: @review é um agente de auditoria do framework, não dos estudos.
> Métricas são baseadas em qualidade das auditorias, não em dados de aprendizado.

### Métricas de Auditoria

| Métrica | Fonte | Fórmula | Meta |
|---------|-------|---------|------|
| **Detecção de Problemas** | `reviews/*.md` | `issues_críticos + issues_altos` | >3 por audit |
| **Cobertura de Auditoria** | `reviews/` | `componentes_auditados / componentes_totais` | >80% |
| **Qualidade das Recomendações** | `planning/` | `implementadas / sugeridas` | >50% |
| **Clareza dos Relatórios** | Feedback | `relatórios_acionáveis / relatórios_totais` | >90% |

### Métricas de Processo

| Métrica | Fonte | Fórmula | Meta |
|---------|-------|---------|------|
| **Documentação de Evidência** | `reviews/*.md` | `issues_com_evidência / issues_totais` | 100% |
| **Profundidade de Análise** | `reviews/*.md` | `seções_preenchidas / seções_totais` | 100% |
| **Template Conformidade** | `reviews/*.md` | `relatórios_completo / relatórios_totais` | 100% |

### Como Verificar

```bash
# Contar issues por auditoria
grep -r "## ⚠️ Problemas Identificados" reviews/*.md

# Verificar cobertura
ls reviews/*.md | wc -l
```

### Você é bem-sucedido quando:
- ✅ Cada auditoria encontra >3 issues acionáveis
- ✅ >80% dos componentes do framework são auditados
- ✅ >50% das recomendações são implementadas
- ✅ Relatórios são claros e acionáveis (sem ambiguidade)
- ✅ Toda issue tem evidência (arquivo:linha)
```

**Estrutura proposta para @brainstorm**:
```markdown
## 🎯 Métricas de Sucesso (Baseadas em Qualidade)

> **Nota**: @brainstorm é um agente de ideação criativa para o framework.
> Métricas são baseadas em qualidade das propostas, não em dados de aprendizado.

### Métricas de Ideação

| Métrica | Fonte | Fórmula | Meta |
|---------|-------|---------|------|
| **Originalidade de Ideias** | `planning/*.md` + OpenViking | `ideias_novas / ideias_total` | >80% |
| **Acionabilidade de Ideias** | `planning/*.md` | `ideias_com_next_steps / ideias_total` | 100% |
| **Estimativa de ROI** | `planning/*.md` | `ideias_com_roi / ideias_total` | 100% |
| **Taxa de Implementação** | `planning/*.md` + código | `ideias_implementadas / ideias_propostas` | >30% |

### Métricas de Processo

| Métrica | Fonte | Fórmula | Meta |
|---------|-------|---------|------|
| **Diversidade de Ideias** | `planning/*.md` | `categorias_cobertas / categorias_totais` | >50% |
| **Profundidade de Análise** | `planning/*.md` | `propostas_com_análise / propostas_total` | 100% |
| **Clareza das Propostas** | Feedback | `propostas_acionáveis / propostas_total` | >90% |

### Como Verificar

```bash
# Contar propostas originais
grep -r "## 💡 Proposta" planning/*.md

# Verificar implementação
grep -r "Status: Aprovada" planning/*.md
```

### Você é bem-sucedido quando:
- ✅ >80% das ideias são originais (não estão em `planning/` ou OpenViking)
- ✅ 100% das ideias têm próximos passos acionáveis
- ✅ 100% das ideias têm estimativa de ROI (custo/benefício)
- ✅ >30% das ideias são implementadas
- ✅ Propostas cobrem diferentes categorias (features, gaps, performance, etc.)
```

---

### 3. Adicionar "Destaques de Personalidade" (★★★★☆ Alto)

**Problema**: Personalidade é funcional, sem citações marcantes.

**Solução**: Adicionar seção `## 🎭 Destaques de Personalidade` com citações que capturam a essência de cada agente.

**Impacto**: Médio (melhora identidade e memorabilidade)  
**Custo**: Baixo (adicionar seção)  
**ROI**: ★★★★☆

**Estrutura proposta**:
```markdown
## 🎭 Destaques de Personalidade

### @meta
> "Planejar bem 10% do tempo economiza 50% do esforço."
> -- @meta

> "O roadmap não é uma promessa. É uma aposta priorizada sobre onde o impacto é mais provável."
> -- @meta

> "Planejar é adivinhar. Mas adivinhar com educação supera adivinhar no escuro."
> -- @meta

### @tutor
> "Não me diga a resposta. Me faça as perguntas certas."
> -- @tutor

> "Todo erro é uma oportunidade de aprendizado. Vamos explorar juntos."
> -- @tutor

> "Meu trabalho não é ensinar. É ajudar você a descobrir."
> -- @tutor

### @review
> "Eu não apenas reviso seu código — eu encontro 3-5 issues e exijo evidência para tudo."
> -- @review

> "Meu trabalho não é ter todas as respostas. É garantir que estamos todos fazendo as mesmas perguntas."
> -- @review

> "Features são hipóteses. Features entregues são experimentos. Features bem-sucedidas mudam comportamento do usuário."
> -- @review

### @brainstorm
> "Não revise o que existe — imagine o que poderia existir."
> -- @brainstorm

> "As melhores ideias vêm de questionar pressupostos, não de otimizar soluções existentes."
> -- @brainstorm

> "Meu trabalho não é encontrar problemas. É encontrar oportunidades que ninguém mais viu."
> -- @brainstorm
```

---

### 4. Criar Templates de Output para @tutor e @brainstorm (★★★★☆ Alto)

**Problema**: @tutor e @brainstorm não têm templates de output padronizados.

**Solução**: Criar templates em `.opencode/templates/`.

**Impacto**: Médio (padroniza outputs)  
**Custo**: Médio (criar templates)  
**ROI**: ★★★★☆

#### Template para @tutor: `session-output.md`

```markdown
# 📝 Sessão de Estudo: {DATA}

## 🎯 Objetivo
- {Objetivo da sessão}

## 📚 Conteúdo Estudado
- {Conceitos principais}

## 🧪 Prática Realizada
- {Exercícios feitos}

## 💡 Insights
- {Aprendizados}

## 📊 Próximos Passos
- [ ] Revisar {X} em {Y} dias
- [ ] Praticar {Z}

## 📈 Métricas (preenchido automaticamente)
- **Duração**: {X} min
- **Focus Score**: {Y}/10
- **Técnica**: {feynman|drill|quiz|project}
- **Success Rating**: {Z}/10
```

#### Template para @brainstorm: `proposal-output.md`

```markdown
# 💡 Proposta: {TÍTULO}

**Data**: {DATA}  
**Tipo**: {feature|gap|integração|performance|evolução-agentes|competitivo}  
**Prioridade**: {Crítica|Alta|Média|Baixa}

## 🔍 Problema Identificado
{Descrição do problema/lacuna}

## 💡 Solução Proposta
{Descrição da solução}

## 📊 Análise de Impacto

| Métrica | Antes | Depois | Ganho |
|---------|-------|--------|-------|
| {métrica} | {valor} | {valor} | {ganho} |

## ⚖️ Custo vs Benefício
- **Custo**: {estimativa}
- **Benefício**: {estimativa}
- **ROI**: {cálculo}

## 🎯 Próximos Passos
1. [ ] Passo 1
2. [ ] Passo 2

## 📚 Referências
- {Links para documentação}
- {Projetos similares}

## 🔗 Handoff
Para validar viabilidade técnica:
→ @review #review-consistency

Quer detalhar mais algum ponto?
```

---

### 5. Estruturar Processo de Trabalho por Keyword (★★★☆☆ Médio)

**Problema**: Keywords têm processos, mas não são estruturados em fases claras.

**Solução**: Adicionar seção `## 🔄 Seu Processo de Trabalho` para cada keyword principal.

**Impacto**: Médio (melhora clareza e execução)  
**Custo**: Médio (reestruturar keywords existentes)  
**ROI**: ★★★☆☆

**Estrutura proposta para @meta - #meta-plan-decompose**:
```markdown
## 🔄 Seu Processo de Trabalho

### #meta-plan-decompose

#### Fase 1: Descoberta (Antes de Planejar)
1. Leia arquivos existentes do módulo:
   - `{modulo}/meta/learning-map.md`
   - `{modulo}/meta/week-*.md`
   - `{modulo}/meta/retro-*.md`

#### Fase 2: Carregamento de Contexto
```typescript
const context = await contextHybrid({ operation: "getFullContext" });
const sessions = await data.getSessions({ limit: 30 });
const streak = await data.getStreak();
```

#### Fase 3: Criação do Plano
- Gere objetivos SMART
- Distribua entre dias
- Defina entregáveis

#### Fase 4: Handoff
- Referencie @tutor para execução
- Defina expectativas claras
- Salve em `{modulo}/meta/learning-map.md`

#### Fase 5: Validação
- Usuário confirma plano
- Ajustes se necessário
- Pronto para execução
```

**Aplicar estrutura similar para**:
- `@meta`: `/ul-plan-weekly`, `/ul-retro-weekly`, `/ul-plan-adjust`
- `@tutor`: `/ul-study-start`, `/ul-study-end`, `/ul-practice-*`
- `@review`: `#review-commands`, `#review-tools`, `#review-consistency`
- `@brainstorm`: `#brainstorm-gaps`, `#brainstorm-features`, `#brainstorm-random`

---

### 6. Adicionar Grade de Agentes Consolidada (★★★☆☆ Médio)

**Problema**: Não temos uma tabela de referência rápida consolidada.

**Solução**: Adicionar seção `## 📎 Grade de Agentes` no README principal ou criar arquivo separado.

**Impacto**: Baixo (melhoria de UX)  
**Custo**: Baixo (adicionar tabela)  
**ROI**: ★★★☆☆

**Estrutura proposta**:
```markdown
## 📎 Grade de Agentes

| Agente | Especialidade | Quando Usar | Keywords Principais |
|--------|---------------|-------------|---------------------|
| 🗺️ @meta | Planejamento | Início de semana/novo módulo | `#meta-plan-decompose`, `#meta-adjust` |
| 🎓 @tutor | Execução | Sessões de estudo diárias | `/ul-study-start`, `/ul-practice-*` |
| 🔍 @review | Auditoria | Fim de módulo ou problemas | `#review-consistency`, `#review-tools` |
| 💡 @brainstorm | Ideação | Lacunas detectadas | `#brainstorm-gaps`, `#brainstorm-features` |

**Ciclo**: @meta planeja → @tutor executa → @review audita → @brainstorm propõe

**Handoffs**:
- @meta → @tutor: "Plano criado! Para executar, use `/ul-study-start`"
- @tutor → @meta: "Fim de semana → `/ul-retro-weekly`"
- @review → @brainstorm: "Lacuna detectada → `#brainstorm-gaps`"
- @brainstorm → @review: "Proposta criada → `#review-consistency`"
```

---

## 🗓️ Plano de Implementação

### Fase 1: Regras Críticas + Métricas de Sucesso + Correções (Semana 1)

**Duração**: 2-3 dias  
**Prioridade**: Crítica  
**Dependências**: Nenhuma

**Tarefas**:
- [ ] Adicionar seção `## 🚨 Regras Críticas que Você Deve Seguir` em todos os agentes
- [ ] Adicionar seção `## 🎯 Métricas de Sucesso (Baseadas em Dados)` em @meta e @tutor
- [ ] Adicionar seção `## 🎯 Métricas de Sucesso (Baseadas em Qualidade)` em @review e @brainstorm
- [ ] Verificar se `logs/daily/` ainda é usado (atualizar referência em @meta se necessário)
- [ ] Clarificar registro automático em @tutor (adicionar nota explicativa sobre `session_skills.csv`)
- [ ] Atualizar Quick Reference de cada agente

**Arquivos**:
- `.opencode/agents/meta.md` (modificar)
- `.opencode/agents/tutor.md` (modificar)
- `.opencode/agents/review.md` (modificar)
- `.opencode/agents/brainstorm.md` (modificar)

**Critério de Sucesso**:
- ✅ Todos os agentes têm seção de Regras Críticas no início
- ✅ @meta e @tutor têm métricas baseadas em dados de aprendizado
- ✅ @review e @brainstorm têm métricas baseadas em qualidade do framework
- ✅ Referências desatualizadas corrigidas

---

### Fase 2: Destaques de Personalidade (Semana 1-2)

**Duração**: 1 dia  
**Prioridade**: Alta  
**Dependências**: Nenhuma

**Tarefas**:
- [ ] Adicionar seção `## 🎭 Destaques de Personalidade` em todos os agentes
- [ ] Criar 2-3 citações marcantes para cada agente
- [ ] Verificar consistência com missão de cada agente

**Arquivos**:
- `.opencode/agents/meta.md` (modificar)
- `.opencode/agents/tutor.md` (modificar)
- `.opencode/agents/review.md` (modificar)
- `.opencode/agents/brainstorm.md` (modificar)

**Critério de Sucesso**:
- ✅ Cada agente tem 2-3 citações marcantes
- ✅ Citações refletem a essência do agente
- ✅ Citações são memoráveis e distinguem agentes

---

### Fase 3: Templates de Output (Semana 2)

**Duração**: 1-2 dias  
**Prioridade**: Alta  
**Dependências**: Nenhuma

**Tarefas**:
- [ ] Criar diretório `.opencode/templates/`
- [ ] Criar `session-output.md` para @tutor
- [ ] Criar `proposal-output.md` para @brainstorm
- [ ] Atualizar agentes para referenciar templates
- [ ] Adicionar exemplos de uso nos agentes

**Arquivos**:
- `.opencode/templates/session-output.md` (criar)
- `.opencode/templates/proposal-output.md` (criar)
- `.opencode/agents/tutor.md` (modificar)
- `.opencode/agents/brainstorm.md` (modificar)

**Critério de Sucesso**:
- ✅ Templates criados e funcionais
- ✅ Agentes referenciam templates corretamente
- ✅ Exemplos de uso claros

---

### Fase 4: Processo de Trabalho (Semana 2-3)

**Duração**: 2-3 dias  
**Prioridade**: Média  
**Dependências**: Fase 1, Fase 2

**Tarefas**:
- [ ] Identificar keywords principais de cada agente
- [ ] Estruturar Processo de Trabalho para cada keyword
- [ ] Adicionar código de exemplo para contexto
- [ ] Verificar consistência entre agentes

**Arquivos**:
- `.opencode/agents/meta.md` (modificar)
- `.opencode/agents/tutor.md` (modificar)
- `.opencode/agents/review.md` (modificar)
- `.opencode/agents/brainstorm.md` (modificar)

**Critério de Sucesso**:
- ✅ Cada keyword principal tem Processo de Trabalho estruturado
- ✅ Fases são claras e sequenciais
- ✅ Código de exemplo para contexto está presente

---

### Fase 5: Grade de Agentes (Semana 3)

**Duração**: 1 dia  
**Prioridade**: Baixa  
**Dependências**: Nenhuma

**Tarefas**:
- [ ] Criar seção `## 📎 Grade de Agentes` no README
- [ ] Adicionar tabela consolidada
- [ ] Adicionar handoffs entre agentes
- [ ] Atualizar documentação principal

**Arquivos**:
- `README.md` (modificar)
- `HOW_TO_USE.md` (modificar)

**Critério de Sucesso**:
- ✅ Grade de Agentes está no README
- ✅ Handoffs estão claros
- ✅ Usuário consegue identificar rapidamente qual agente usar

---

## 📊 Resumo de Arquivos

| Arquivo | Ação | Fase |
|---------|------|------|
| `.opencode/agents/meta.md` | Modificar | 1, 2, 4 |
| `.opencode/agents/tutor.md` | Modificar | 1, 2, 3, 4 |
| `.opencode/agents/review.md` | Modificar | 1, 2, 4 |
| `.opencode/agents/brainstorm.md` | Modificar | 1, 2, 3, 4 |
| `.opencode/templates/session-output.md` | Criar | 3 |
| `.opencode/templates/proposal-output.md` | Criar | 3 |
| `README.md` | Modificar | 5 |
| `HOW_TO_USE.md` | Modificar | 5 |

---

## ⚖️ Análise de Impacto vs Benefício

| Aspecto | Atual | Proposto | Diferença |
|---------|-------|----------|-----------|
| Clareza | Média | Alta | +Melhoria |
| Mensurabilidade | Baixa | Alta | +Melhoria |
| Padronização | Parcial | Completa | +Melhoria |
| Onboarding | Médio | Alto | +Melhoria |
| Manutenibilidade | Média | Alta | +Melhoria |

**Esforço estimado**: 1-2 semanas, 1 pessoa  
**Custo de migração**: Baixo (sem breaking changes)  
**Riscos**: Baixos (melhorias incrementais)

---

## ✨ Benefícios

1. **Clareza**: Regras críticas no início → usuários leem primeiro
2. **Mensurabilidade**: Métricas baseadas em dados → melhoria contínua
3. **Identidade**: Citações marcantes → agentes mais memoráveis
4. **Padronização**: Templates de output → consistência
5. **Onboarding**: Grade de Agentes → novos usuários encontram agentes rapidamente
6. **Qualidade**: Processo de Trabalho → execução mais consistente

---

## 🎯 Critério de Sucesso Global

### Métricas de Validação

| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| Agentes com Regras Críticas | 0/4 | 4/4 | 100% |
| Agentes com Métricas de Sucesso | 0/4 | 4/4 | 100% |
| Agentes com Destaques de Personalidade | 0/4 | 4/4 | 100% |
| Templates de Output | 1/4 | 3/4 | 75% |
| Keywords com Processo de Trabalho | ~0% | ~80% | 80% |

### Validação Qualitativa

- [ ] Novo usuário consegue identificar qual agente usar em <30s
- [ ] Regras críticas são visíveis no início de cada agente
- [ ] Métricas são extraídas de dados reais
- [ ] Templates são usados consistentemente
- [ ] Processo de Trabalho é claro e acionável

---

## 📚 Referências

- [agency-agents](https://github.com/msitarzewski/agency-agents) - Projeto fonte de inspiração
- `reviews/_template-framework-review.md` - Template existente de revisão
- `.opencode/agents/*.md` - Agentes atuais
- `data/*.csv` - Dados para métricas

---

## 📝 Notas Adicionais

### Por que não criar todos os templates?

O template de revisão (`_template-framework-review.md`) já existe e é bem estruturado. Os templates de plano do @meta já estão inline nos arquivos. Faltam apenas templates para @tutor e @brainstorm.

### Por que Processo de Trabalho é média prioridade?

As keywords já têm processos documentados. A melhoria é estruturar em fases claras, o que é útil mas não crítico.

### Por que Grade de Agentes é baixa prioridade?

O Quick Reference já existe em cada agente. A Grade de Agentes consolidada é conveniência, mas não essencial.

---

## 🔗 Auditoria Relacionada

Esta proposta foi complementada pela auditoria dos agentes @meta e @tutor:

**Documento**: `reviews/agents-meta-tutor-audit-2026-04-09-v1.0.0.md`

**Resumo**:
- ✅ 12 verificações passaram
- ⚠️ 8 alertas/avisos (não críticos)
- ❌ 4 problemas identificados

**Problemas Integrados na Fase 1**:
1. Regras Críticas no Final → Adicionado na Fase 1
2. Sem Métricas de Sucesso → Adicionado na Fase 1
3. Referência `logs/daily/` → Adicionado na Fase 1 (verificar/atualizar)
4. Referência `session_skills.csv` → Adicionado na Fase 1 (clarificar)

**Ver auditoria completa para detalhes técnicos e análise de coerência com princípios de ultralearning.**

---

*Proposta gerada pelo agente @brainstorm*  
*Baseado em análise do projeto agency-agents (76k stars)*  
*Auditoria complementar: `reviews/agents-meta-tutor-audit-2026-04-09-v1.0.0.md`*