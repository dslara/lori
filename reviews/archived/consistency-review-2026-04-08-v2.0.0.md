# 🔍 Revisão de Consistência — Ultralearning System v3.3.0

**Data**: 2026-04-08  
**Versão do Projeto**: v3.3.0 (CHANGELOG) / v3.2.0 (VERSION file) ⚠️  
**Tipo**: consistency  
**Agente**: @review  
**Base**: Revisão anterior `consistency-review-2026-03-20-v1.0.0.md`

---

## 📊 Estado Atual

### Commands (31 arquivos)
| Categoria | Count | Commands |
|----------|-------|----------|
| plan | 6 | `ul-plan-weekly`, `ul-plan-weekly-create`, `ul-plan-decompose`, `ul-plan-resources`, `ul-plan-adjust`, `ul-plan-benchmark` |
| data | 5 | `ul-data-status`, `ul-data-analytics`, `ul-data-dashboard`, `ul-data-manage`, `ul-data-backup` |
| practice | 4 | `ul-practice-project`, `ul-practice-feynman`, `ul-practice-drill`, `ul-practice-quiz` |
| study | 3 | `ul-study-start`, `ul-study-end`, `ul-study-plan` |
| module | 3 | `ul-module-create`, `ul-module-switch`, `ul-module-archive` |
| learn | 2 | `ul-learn-explain`, `ul-learn-debug` |
| productivity | 2 | `ul-productivity-start`, `ul-productivity-break` |
| setup | 2 | `ul-setup-check`, `ul-setup-scaffold` |
| memory | 2 | `ul-memory-create`, `ul-memory-review` |
| review | 1 | `ul-review-audit` |
| retro | 1 | `ul-retro-weekly` |

### Tools (16 arquivos)
| Categoria | Count | Tools |
|----------|-------|-------|
| data-* | 5 | `data.ts` (facade), `data-session.ts`, `data-module.ts`, `data-flashcard.ts`, `data-insight.ts` |
| data-core | 1 | `data-core.ts` |
| context | 2 | `context.ts`, `context-hybrid.ts` |
| openviking | 2 | `openviking-client.ts`, `openviking-utils.ts` |
| analytics | 1 | `insights.ts` (unificada) |
| outros | 3 | `status.ts`, `retro.ts`, `setup.ts` |
| utils | 1 | `utils-csv.ts` |
| types | 1 | `model-types.ts` |

### Skills (7 diretórios, 6 ativas)
| Skill | Command Associado | Status |
|-------|-------------------|--------|
| `session` | `/ul-study-start`, `/ul-study-end`, `/ul-study-plan` | ✅ Ativa |
| `directness` | `/ul-practice-project` | ✅ Ativa |
| `debug-socratic` | `/ul-learn-debug` | ✅ Ativa |
| `decomposition` | `/ul-plan-decompose` | ✅ Ativa |
| `srs-generator` | `/ul-memory-create`, `/ul-memory-review` | ✅ Ativa |
| `openviking-context` | Nenhum | ⚠️ Órfã |
| `_template-skill` | N/A (template) | 📄 Template |

### Agentes (4 arquivos, 3 configurados)
| Agente | Arquivo | Configurado em opencode.json | Temperatura |
|--------|---------|-------------------------------|-------------|
| @meta | ✅ | ✅ | 0.2 |
| @tutor | ✅ | ✅ | 0.5 |
| @review | ✅ | ✅ | 0.1 |
| @brainstorm | ✅ | ❌ **NÃO CONFIGURADO** | 0.7 (declarado) |

---

## 🔴 Problemas Críticos

### 1. **[Gravidade: CRÍTICO]** @brainstorm não configurado em opencode.json

**Descrição**: O agente `@brainstorm` existe em `.opencode/agents/brainstorm.md` (670 linhas, 8 keywords) mas **não está registrado em `opencode.json`**. Isso significa que o agente **não pode ser invocado**.

**Evidência**:
```json
// opencode.json — apenas 3 agentes configurados:
"agent": {
  "meta": { ... },
  "tutor": { ... },
  "review": { ... }
  // brainstorm: AUSENTE
}
```

**Impacto**: Todas as 8 keywords do @brainstorm (`#brainstorm-gaps`, `#brainstorm-features`, etc.) são **inacessíveis**.

**Sugestão imediata**: Adicionar configuração do @brainstorm em `opencode.json`:
```json
"brainstorm": {
  "description": "Arquiteto de ideias. Propõe melhorias inovadoras e identifica lacunas.",
  "mode": "primary",
  "temperature": 0.7,
  "tools": { "write": true, "edit": true, "bash": true, "skill": true },
  "permission": { "edit": "ask", "write": "ask", "bash": "allow", "webfetch": "allow" }
}
```

---

### 2. **[Gravidade: ALTO]** VERSION file desatualizado

**Descrição**: `VERSION` contém `3.2.0` mas `CHANGELOG.md` registra versão `3.3.0`.

**Evidência**:
- `VERSION`: `3.2.0`
- `CHANGELOG.md`: `## [3.3.0] - 2026-03-20`

**Impacto**: A tool `context.ts` lê o VERSION file para `getProjectInfo`. Informação de versão incorreta é retornada aos commands.

**Sugestão imediata**: Atualizar `VERSION` para `3.3.0`.

---

### 3. **[Gravidade: ALTO]** Commands duplicados: `ul-plan-weekly` e `ul-plan-weekly-create`

**Descrição**: **Problema NÃO RESOLVIDO** desde a revisão anterior (2026-03-20). Ambos os commands criam plano semanal com propósito idêntico.

**Evidência**:
| Aspecto | `ul-plan-weekly` | `ul-plan-weekly-create` |
|---------|-------------------|--------------------------|
| Descrição | "Criar plano semanal detalhado" | "Criar plano semanal detalhado" |
| Agent | meta | meta |
| Model | minimax-m2.5 | minimax-m2.5 |
| Argumento | `$ARGUMENTS` (semana) | `$1` (semana) |
| Tools | `context.getWeekContext`, `insights.generateReport`, `context.getFullContext` | Nenhuma referência explícita |
| Processo | 6 passos com contexto automático | 4 passos com leitura manual |

**Diferenças**:
- `ul-plan-weekly` é mais completo (6 passos, usa tools, gera arquivo detalhado)
- `ul-plan-weekly-create` é mais simples (4 passos, lê arquivos manualmente, formato SMART)
- `ul-plan-weekly-create` tem seção "Revisão Semana Anterior" integrada
- `ul-plan-weekly` tem balanceamento de técnicas integrado

**Sugestão imediata**: Consolidar em um único command `ul-plan-weekly` que combina o melhor dos dois:
- Usar tools de contexto do `ul-plan-weekly`
- Adicionar objetivo SMART do `ul-plan-weekly-create`
- Adicionar revisão da semana anterior do `ul-plan-weekly-create`
- Remover `ul-plan-weekly-create`

---

### 4. **[Gravidade: ALTO]** Tools de contexto sobrepostas: `context.ts` e `context-hybrid.ts`

**Descrição**: **Problema NÃO RESOLVIDO** desde a revisão anterior. Duas tools com funcionalidades sobrepostas coexistem.

**Evidência**:
| Operação | `context.ts` | `context-hybrid.ts` |
|----------|-------------|---------------------|
| `getFullContext` | ✅ (CSV-only) | ✅ (CSV + OpenViking) |
| `getCurrentModule` | ✅ | ❌ |
| `getRecentSessions` | ✅ | ❌ |
| `getWeekContext` | ✅ | ❌ |
| `getSRSPending` | ✅ | ❌ |
| `getProjectInfo` | ✅ | ❌ |
| `getUserPreferences` | ❌ | ✅ |
| `getRelevantSessions` | ❌ | ✅ |
| `getLearningPatterns` | ❌ | ✅ |
| `getAgentId` | ❌ | ✅ |
| `getSessionContext` | ❌ | ✅ |

**Sobreposição**: `getFullContext` existe em ambas com implementações diferentes (CSV-only vs híbrido).

**Commands que usam cada tool**:
- `context.ts`: `ul-plan-weekly` (via `context.getWeekContext`, `context.getFullContext`)
- `context-hybrid.ts`: `ul-study-start` (via `context-hybrid.getFullContext`)

**Sugestão**: Migrar as operações únicas de `context.ts` para `context-hybrid.ts` e descontinuar `context.ts`. Operações a migrar:
1. `getWeekContext` — ler arquivo `week-*.md`
2. `getSRSPending` — flashcards pendentes
3. `getProjectInfo` — versão, root, userId

---

## ⚠️ Problemas Médios

### 5. **[Gravidade: MÉDIO]** Keywords órfãs — sem command correspondente

**Descrição**: Keywords definidas nos agentes mas sem command `/ul-*` funcional.

| Keyword | Definida em | Command? | Status |
|---------|-------------|----------|--------|
| `#feedback` | @tutor | ❌ | Inline no agente — funciona ao digitar |
| `#intuition` | @tutor | ❌ | Inline no agente — funciona ao digitar |
| `#experiment` | @tutor | ❌ | Inline no agente — funciona ao digitar |
| `#audit-quality` | @meta, @tutor | ❌ | Referenciada na tabela de handoffs |
| `#srs-generator` | @tutor | ❌ | Mas há `/ul-memory-create` e `/ul-memory-review` |
| `#brainstorm-*` (8) | @brainstorm | ❌ | **Agente não configurado** — inacessíveis |
| `#review-*` (9) | @review | `/ul-review-audit` existe | Funcionam ao invocar @review |
| `#check-readiness` | @review | ❌ | Funciona ao invocar @review |
| `#meta-review` | @review | ❌ | Funciona ao invocar @review |

**Classificação**:
- **Funcionais** (funcionam ao digitar no chat): `#feedback`, `#intuition`, `#experiment`, `#review-*`, `#check-readiness`, `#meta-review`
- **Inacessíveis** (agente não configurado): `#brainstorm-*` (8 keywords)
- **Ambíguas**: `#audit-quality` (referenciada mas sem fluxo claro), `#srs-generator` (tem commands equivalentes)

**Sugestão**:
1. ✅ Manter keywords funcionais inline (`#feedback`, `#intuition`, `#experiment`) — são ativações diretas no @tutor
2. 🔧 Configurar @brainstorm em `opencode.json` para ativar as 8 keywords
3. 📝 Documentar `#srs-generator` como alias para `/ul-memory-create`
4. 🗑️ Remover `#audit-quality` ou criar command `/ul-review-quality`

---

### 6. **[Gravidade: MÉDIO]** Skill `openviking-context` sem command associado

**Descrição**: A skill `openviking-context` existe mas nenhum command a referencia diretamente. Apenas `/ul-study-start` a menciona como "skill: openviking-context" no texto do @tutor.

**Evidência**: A skill documenta as ferramentas OpenViking (`memsearch`, `memread`, `membrowse`, `memcommit`) mas não é invocada via `skill({ name: "openviking-context" })` em nenhum command.

**Análise**: A skill serve como **documentação de referência** para os agentes, não como skill executável. Isso é um uso legítimo, mas deveria ser documentado como tal.

**Sugestão**: Adicionar nota no SKILL.md: `> Esta skill é de referência documental, não executável via command.`

---

### 7. **[Gravidade: MÉDIO]** Modelos inconsistentes para commands de planejamento

**Descrição**: Commands da mesma categoria (plan) usam modelos diferentes sem critério claro.

| Command | Model |
|---------|-------|
| `/ul-plan-weekly` | minimax-m2.5 |
| `/ul-plan-weekly-create` | minimax-m2.5 |
| `/ul-plan-resources` | kimi-k2.5 |
| `/ul-plan-decompose` | glm-5 |
| `/ul-plan-adjust` | glm-5 |
| `/ul-plan-benchmark` | glm-5 |

**Análise**: A distribuição parece seguir a lógica:
- `minimax-m2.5` para criação de planos (mais criativo)
- `glm-5` para ajustes e benchmarks (mais determinístico)
- `kimi-k2.5` para pesquisa de recursos (mais capaz)

**Sugestão**: Documentar o critério de model routing no README ou em um guia de configuração.

---

### 8. **[Gravidade: MÉDIO]** `ul-module-switch` usa agent `tutor` mas é operação de gestão

**Descrição**: `/ul-module-switch` tem `agent: tutor` mas trocar módulo é uma operação de gestão/planejamento, não de sessão de estudo.

**Evidência**:
- `/ul-module-create`: agent `meta` ✅ (gestão)
- `/ul-module-switch`: agent `tutor` ❌ (deveria ser `meta`)
- `/ul-module-archive`: agent `meta` ✅ (gestão)

**Sugestão**: Alterar `agent: tutor` para `agent: meta` em `ul-module-switch.md`.

---

## 🟡 Problemas Menores

### 9. **[Gravidade: BAIXO]** `_template-skill` contado como skill ativa

**Descrição**: O diretório `_template-skill` é um template para criar novas skills, não uma skill funcional. Mas aparece na listagem de skills.

**Sugestão**: Renomear para `_template-skill.SKIP` ou adicionar ao `.gitignore` para não ser carregado como skill.

---

### 10. **[Gravidade: BAIXO]** Frontmatter inconsistente em skills

**Descrição**: Nem todas as skills têm frontmatter completo.

| Skill | `name` | `description` | `agent` | `keywords` |
|-------|--------|---------------|---------|------------|
| `session` | ✅ | ✅ | ✅ | ❌ |
| `directness` | ✅ | ✅ | ✅ | ✅ |
| `debug-socratic` | ✅ | ✅ | ✅ | ✅ |
| `decomposition` | ✅ | ✅ | ✅ | ✅ |
| `srs-generator` | ✅ | ✅ | ✅ | ✅ |
| `openviking-context` | ❌ | ❌ | ❌ | ❌ |

**Sugestão**: Adicionar frontmatter completo à skill `openviking-context` e `keywords` à skill `session`.

---

### 11. **[Gravidade: BAIXO]** Referência a `#audit-quality` inconsistente

**Descrição**: A keyword `#audit-quality` é referenciada nas tabelas de handoff de @meta e @tutor como destino para "fim de módulo", mas não existe command correspondente e não está definida como keyword em nenhum agente.

**Evidência**:
- `@meta.md` linha 343: `| Fim de módulo | ... | ... | #audit-quality |`
- `@tutor.md` linha 595: `| Fim de módulo | ... | ... | #audit-quality |`

**Sugestão**: Substituir `#audit-quality` por `/ul-review-audit` ou criar a keyword em @review.

---

## 🔗 Matriz de Dependências

### Commands → Tools

| Command | data | context | context-hybrid | insights | status | retro | setup | memread | memsearch | membrowse | memcommit |
|---------|------|---------|-----------------|----------|--------|-------|-------|---------|-----------|-----------|-----------|
| `/ul-study-start` | | | ✅ | | | | | | | | |
| `/ul-study-end` | | | | | | | | ✅ | | ✅ | ✅ |
| `/ul-study-plan` | | | | | | | | ✅ | ✅ | ✅ | |
| `/ul-practice-quiz` | | | | ✅ | | | | | | | |
| `/ul-practice-feynman` | ✅ | | | | | | | | | | |
| `/ul-practice-drill` | ✅ | | | | | | | | | | |
| `/ul-practice-project` | | ✅ | | | | | | | | | |
| `/ul-learn-debug` | | ✅ | | | | | | | | | |
| `/ul-plan-weekly` | | ✅ | | ✅ | | | | | | | |
| `/ul-plan-decompose` | | ✅ | | | | | | | | | |
| `/ul-data-status` | | | | | | | | ✅ | ✅ | | |
| `/ul-data-analytics` | | | | | | | | ✅ | ✅ | | |
| `/ul-data-dashboard` | | | | ✅ | | | | | | | |
| `/ul-data-manage` | ✅ | | | | | | ✅ | | | | |
| `/ul-data-backup` | ✅ | | | | | | | | | | |
| `/ul-module-create` | | | | | | | | | | ✅ | ✅ |
| `/ul-module-switch` | | | | | | | | ✅ | | ✅ | ✅ |
| `/ul-module-archive` | | | | | | | | | ✅ | ✅ | ✅ |
| `/ul-memory-create` | | | | | | | | | | | ✅ |
| `/ul-memory-review` | | | | | | | | | ✅ | | ✅ |
| `/ul-retro-weekly` | | | | | | | | ✅ | ✅ | | ✅ |

### Commands → Skills

| Command | Skill | Via |
|---------|-------|-----|
| `/ul-study-start` | `session`, `openviking-context` | skill tool |
| `/ul-study-end` | `session` | skill tool |
| `/ul-study-plan` | `session` | skill tool |
| `/ul-practice-project` | `directness` | skill tool |
| `/ul-learn-debug` | `debug-socratic` | skill tool |
| `/ul-plan-decompose` | `decomposition` | skill tool |
| `/ul-memory-create` | `srs-generator` | skill tool |
| `/ul-memory-review` | `srs-generator` | skill tool |

### Tools → Tools (Dependências Internas)

```
model-types.ts (standalone)
  ← data-session.ts, data-flashcard.ts, data-insight.ts, data-module.ts
  ← insights.ts, context.ts, context-hybrid.ts, status.ts

utils-csv.ts (standalone)
  ← data-session.ts, data-flashcard.ts, data-insight.ts, data-module.ts, data-core.ts
  ← insights.ts, context.ts, context-hybrid.ts, status.ts, retro.ts

openviking-client.ts (standalone)
  ← openviking-utils.ts
  ← context-hybrid.ts

openviking-utils.ts
  ← context-hybrid.ts

data-core.ts ← utils-csv.ts
data-session.ts ← utils-csv.ts
data-flashcard.ts ← utils-csv.ts
data-insight.ts ← utils-csv.ts
data-module.ts ← utils-csv.ts

data.ts (facade) ← data-session.ts, data-flashcard.ts, data-insight.ts, data-module.ts, data-core.ts
```

### Análise de Acoplamento

**Tools Sobrecarregadas**:
- `utils-csv.ts`: Usada por 11+ módulos (⚠️ alto acoplamento, mas esperado para utilitário base)
- `memread`/`memsearch`: Usados por 8 commands (⚠️ dependência forte de OpenViking)

**Tools Subutilizadas**:
- `context.ts`: Usado apenas por 2 commands (`ul-plan-weekly`, `ul-practice-project`)
- `status.ts`: Não referenciado por nenhum command diretamente (usado via `/ul-data-status` que usa memread/memsearch)
- `setup.ts`: Usado apenas por `/ul-setup-check`
- `retro.ts`: Usado apenas por `/ul-retro-weekly`

**Skills Mais Usadas**:
- `session`: 3 commands
- `srs-generator`: 2 commands
- `directness`, `debug-socratic`, `decomposition`: 1 command cada

**Skills Subutilizadas**:
- `openviking-context`: 0 commands (⚠️ skill sem command)

---

## ✅ Coerência com Projeto (Resolvido desde v3.3.0)

| Aspecto | Status | Nota |
|---------|--------|------|
| Nomenclatura commands | ✅ | `ul-[categoria]-[ação]` consistente |
| Nomenclatura tools | ✅ | kebab-case consistente |
| Nomenclatura skills | ✅ | kebab-case consistente |
| Frontmatter commands | ✅ | `description`, `agent`, `model` presentes |
| Frontmatter skills | ⚠️ | `openviking-context` sem frontmatter |
| Arquitetura híbrida | ✅ | CSV + OpenViking funcionando |
| Consolidação insights.ts | ✅ | 5 tools → 1 tool unificada |
| Migração session_skills | ✅ | `tutor_interactions.csv` removido |

---

## 📋 Resumo Executivo

### Estatísticas
- ✅ **31** commands verificados
- ✅ **16** tools verificadas
- ✅ **7** skills verificadas (6 ativas + 1 template)
- ✅ **4** agentes verificados (3 configurados + 1 órfão)
- 🔴 **4** problemas críticos/alto
- ⚠️ **4** problemas médios
- 🟡 **3** problemas menores

### Veredito Geral
**Projeto funcional com problemas de configuração e duplicação**

O framework está operacional, mas tem 2 problemas críticos não resolvidos desde a revisão anterior (commands duplicados e tools sobrepostas) e 1 novo problema crítico (agente @brainstorm não configurado). A consistência cosmética está boa, mas a consistência funcional precisa de atenção.

### Comparação com Revisão Anterior (2026-03-20)

| Problema | Status |
|----------|--------|
| Commands duplicados (`ul-plan-weekly` / `ul-plan-weekly-create`) | ❌ **NÃO RESOLVIDO** |
| Tools de contexto sobrepostas (`context.ts` / `context-hybrid.ts`) | ❌ **NÃO RESOLVIDO** |
| Keywords órfãs | ⚠️ Parcialmente resolvido (documentação melhor) |
| Skill sem command (`openviking-context`) | ⚠️ Identificado como documentação |
| Modelos inconsistentes | ⚠️ Permanece |
| **NOVO**: @brainstorm não configurado | 🔴 **NOVO** |
| **NOVO**: VERSION desatualizado | 🔴 **NOVO** |
| **NOVO**: `ul-module-switch` com agent errado | ⚠️ **NOVO** |

---

## 🎯 Ações Recomendadas (Priorizadas)

### 🔴 Imediatas (Esta semana)

1. **[CRÍTICO]** Configurar @brainstorm em `opencode.json`
   - Adicionar entrada do agente com `temperature: 0.7`
   - **Esforço**: 5 minutos
   - **Impacto**: Ativa 8 keywords inacessíveis

2. **[CRÍTICO]** Atualizar `VERSION` para `3.3.0`
   - **Esforço**: 1 minuto
   - **Impacto**: Informação de versão correta

3. **[ALTO]** Consolidar `ul-plan-weekly` e `ul-plan-weekly-create`
   - Manter `ul-plan-weekly` com o melhor dos dois
   - Remover `ul-plan-weekly-create`
   - **Esforço**: 30 minutos
   - **Impacto**: Elimina confusão de commands duplicados

4. **[MÉDIO]** Corrigir `agent: tutor` → `agent: meta` em `ul-module-switch`
   - **Esforço**: 1 minuto
   - **Impacto**: Consistência de roteamento

### 🟡 Curto Prazo (Próximas 2-4 semanas)

5. **[ALTO]** Consolidar tools de contexto
   - Migrar `getWeekContext`, `getSRSPending`, `getProjectInfo` de `context.ts` para `context-hybrid.ts`
   - Atualizar commands que usam `context.ts`
   - Descontinuar `context.ts`
   - **Esforço**: 2 dias
   - **Riscos**: Breaking changes em commands

6. **[MÉDIO]** Documentar model routing
   - Criar guia explicando critério de escolha de modelo
   - **Esforço**: 1 hora

7. **[MÉDIO]** Adicionar frontmatter à skill `openviking-context`
   - **Esforço**: 15 minutos

### 🔵 Médio Prazo (Próximos 2-3 meses)

8. **[MÉDIO]** Resolver keywords órfãs
   - Configurar @brainstorm (ação #1 resolve 8 keywords)
   - Substituir `#audit-quality` por `/ul-review-audit`
   - Documentar `#srs-generator` como alias

9. **[BAIXO]** Limpar `_template-skill`
   - Adicionar ao `.gitignore` ou renomear

---

## 📚 Referências

- Revisão anterior: `reviews/consistency-review-2026-03-20-v1.0.0.md`
- CHANGELOG: `CHANGELOG.md` (v3.3.0)
- Configuração: `.opencode/opencode.json`
- VERSION: `VERSION` (v3.2.0 — desatualizado)

---

*Revisão gerada pelo agente @review*  
*Template: `reviews/_template-framework-review.md`*