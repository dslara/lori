# 🔍 Auditoria Completa de Qualidade — 2026-02-26 v4.0.0

**Gerado por**: @review  
**Data**: 2026-02-26  
**Versão**: v4.0.0  
**Nota Geral**: 8.2/10 🟢

---

## Resumo Executivo

O framework está **maduro e bem estruturado**. Os scripts têm boas práticas (error handling, `common.sh`, `safe_write`). Os agentes têm estrutura padronizada, cache configurado e exemplos claros. O principal problema é **documentação desalinhada com a implementação real** — READMEs descrevem keywords que não existem no @review.

**Distribuição de problemas**:
- 🔴 Críticos: 3
- ⚠️ Médios: 9
- 🟡 Baixos: 7

---

## 1. `#review-structure` — Estrutura do Projeto

### Estado Atual

```
ultralearning/
├── .opencode/agents/        ✅ 4 agentes + template
├── .opencode/skills/        ⚠️  3 skills sem referência nos scripts/agentes
├── scripts/                 ✅ 20 scripts organizados
├── projects/foundations...  ✅ módulo real em uso
├── projects/shared/         ✅ flashcards e retros compartilhados
├── guides/                  ✅ bem estruturado (principios/ + tecnicas/)
├── reviews/                 ✅ histórico bem mantido
├── planning/                ⚠️  plano de migração Rust→Zig não aplicado e sem decisão clara
├── archived/                ✅ estrutura presente mas sem projetos arquivados reais
└── .current-topic           ✅
```

### Problemas Identificados

| # | Problema | Severidade |
|---|----------|-----------|
| S1 | `.opencode/skills/` (feedback-loop, quiz-generator, retrospective) não são referenciados nos scripts nem documentados no README | ⚠️ Médio |
| S2 | `planning/plano-migracao-rust-zig-v1.0-archive.md` e v2.0 marcados como "Não Aplicado" há semanas sem decisão de descarte | 🟡 Baixo |
| S3 | `README.md` raiz tem **duas seções "Estrutura"** — `## 📁 Estrutura` (linha 185) e `## 📁 Estrutura do Projeto` (linha 203) — conteúdo redundante | ⚠️ Médio |
| S4 | `projects/shared/flashcards/sync-script.sh` existe mas não é referenciado no Makefile nem nos scripts | 🟡 Baixo |
| S5 | `backups/` não existe no repo (o `backup.sh` cria na raiz) e não está no `.gitignore` | ⚠️ Médio |

---

## 2. `#review-scripts` — Qualidade dos Scripts Bash

### Avaliação Geral: **Boa** — Arquitetura sólida com `common.sh`, mas alguns scripts têm gaps.

| Script | Usa common.sh | Trata erros | Problemas |
|--------|:---:|:---:|-----------|
| `start.sh` | ✅ | ✅ | `cat "$WEEK_FILE"` sem aspas pode quebrar em paths com espaços; captura `tail -1` do week mais recente por ordem alfabética (problemático se semana 9 vem antes de 10) |
| `study.sh` | ✅ | ✅ | `#feedback` faz `cat` do stdin (correto), mas não há timeout nem limite de tamanho |
| `end.sh` | ✅ | ✅ | Chama `streak.sh` com caminho absoluto — correto |
| `retro.sh` | ✅ | ✅ | `date -v-7d` é sintaxe macOS; tem fallback Linux — OK. `date +%U` usa semana ISO pode diferir entre plataformas |
| `spaced-repetition.sh` | ✅ | ✅ | Script maior (280 LOC) mas bem estruturado. `bc` usado sem verificar se instalado (verificado em `setup.sh` só) |
| `streak.sh` | ❌ | Parcial | **Não usa `common.sh`** — define próprias variáveis de cor duplicadas. Tem `source "$STATS_FILE"` sem sanitização — risco de injeção se arquivo for editado manualmente |
| `module.sh` | ✅ | ✅ | Bem feito |
| `archive.sh` | ✅ | Parcial | `cp archived/_template-relatorio.md ...` falha silenciosamente se template não existir (tem `\|\| true` mas sem aviso) |
| `backup.sh` | ✅ | Parcial | `cp -r .ultralearning-stats ...` sem verificar existência do arquivo origem |
| `plan.sh` | ✅ | ✅ | `date +%U` — mesmo problema de consistência com `retro.sh` |
| `switch.sh` | ✅ | ✅ | OK |
| `review.sh` | ✅ | ✅ | OK |
| `break.sh` | ✅ | N/A | OK |
| `drill-extra.sh` | ✅ | ✅ | OK |
| `status.sh` | ✅ | N/A | OK |
| `resources.sh` | ✅ | ✅ | OK |
| `setup.sh` | ✅ | N/A | Instruções de instalação hard-coded `brew install jq` — só funciona macOS |

### Problemas por Severidade

| # | Script | Problema | Severidade |
|---|--------|----------|-----------|
| B1 | `streak.sh` | Não usa `common.sh`, redefine cores — duplicação | ⚠️ Médio |
| B2 | `streak.sh` | `source "$STATS_FILE"` pode executar código se arquivo corrompido/editado | 🔴 Crítico |
| B3 | `start.sh` | `sort \| tail -1` para encontrar semana atual ordena lexicograficamente — `week-9.md` vem depois de `week-10.md` incorretamente | ⚠️ Médio |
| B4 | `retro.sh` + `plan.sh` | `date +%U` retorna semana do ano (01-53), não é consistente com `week-{N}.md` dos planos (que usa numeração sequencial do módulo) | ⚠️ Médio |
| B5 | `setup.sh` | `brew install jq` — instrução só válida para macOS, sistema roda em Linux | 🟡 Baixo |
| B6 | `spaced-repetition.sh` | `bc` assumido instalado sem verificação inline | 🟡 Baixo |

---

## 3. `#review-docs` — Documentação

### Estado Geral: **Boa** — Docs ricos, mas com redundâncias e alguns links/referências desatualizados.

| # | Problema | Localização | Severidade |
|---|----------|-------------|-----------|
| D1 | README.md tem duas seções de estrutura (`## 📁 Estrutura` l.185 e `## 📁 Estrutura do Projeto` l.203) | `README.md` | ⚠️ Médio |
| D2 | `guides/README.md` não existe — só `guides/quickstart.md` e `guides/checklist.md` | `guides/` | ⚠️ Médio |
| D3 | `reviews/README.md` menciona `#save-review` e `#review-and-save` como keywords do @review — essas keywords **não existem** no agente atual | `reviews/README.md:92-95` | 🔴 Crítico |
| D4 | `planning/README.md` menciona `#create-proposal`, `#create-plan`, `#suggest-improvements`, `#propose-roadmap` — keywords que também **não existem** no @review | `planning/README.md:93-103` | 🔴 Crítico |
| D5 | `guides/quickstart.md` menciona "15 Comandos" mas Makefile tem 14 | `quickstart.md:14` | 🟡 Baixo |
| D6 | Skills em `.opencode/skills/` (feedback-loop, quiz-generator, retrospective) não documentadas em nenhum lugar | — | ⚠️ Médio |
| D7 | `overlearning.md` referenciado em README.md (l.177) mas não existe em `guides/tecnicas/` | `README.md:177` | ⚠️ Médio |

---

## 4. `#review-makefile` — Orquestração

### Estado Geral: **Excelente** — Makefile limpo, todos os targets referenciados existem.

| Target | Script existe? | Funciona? | Observação |
|--------|:-:|:-:|------------|
| `start` | ✅ | ✅ | — |
| `study` | ✅ | ✅ | — |
| `end` | ✅ | ✅ | — |
| `module` | ✅ | ✅ | — |
| `switch` | ✅ | ✅ | — |
| `plan` | ✅ | ✅ | — |
| `resources` | ✅ | ✅ | — |
| `review` | ✅ | ✅ | — |
| `retro` | ✅ | ✅ | — |
| `break` | ✅ | ✅ | — |
| `drill-extra` | ✅ | ✅ | — |
| `status` | ✅ | ✅ | — |
| `archive` | ✅ | ✅ | — |
| `backup` | ✅ | ✅ | `backups/` criado na raiz, fora de controle de versão |
| `setup` | ✅ | ✅ | — |
| `help` | N/A | ✅ | — |

### Ausências Notáveis

| # | Problema | Severidade |
|---|----------|-----------|
| M1 | Sem target `spaced-repetition` diretamente — só via `make review`. Usuário não sabe que pode fazer `add`, `stats`, `import` | 🟡 Baixo |
| M2 | Sem target `streak` standalone (só via `make end` ou `make status`) | 🟡 Baixo |

**Veredito**: Makefile está OK. Nenhum target quebrado.

---

## 5. `#review-agents` — Agentes

### Estado Geral: **Muito Bom** — Quatro agentes bem definidos, com gaps pontuais.

#### @meta (459 linhas)

| # | Problema | Severidade |
|---|----------|-----------|
| A1 | `#habit-stack` tem nota "Para acompanhamento de longo prazo, use `@coach` (quando disponível)" — @coach não existe e cria expectativa de um agente fantasma | 🟡 Baixo |
| A2 | Seção `## 📁 Arquivos que Você Gera` não inclui `retro-week-{N}.md` — quem o gera é o `retro.sh`, não o @meta, mas pode confundir | 🟡 Baixo |

#### @tutor (566 linhas)

| # | Problema | Severidade |
|---|----------|-----------|
| A3 | `#wrap-up` e `#session-end` do @session são equivalentes — a distinção está documentada no @session mas **não no @tutor**. Usuário pode usar os dois sem saber qual é adequado | ⚠️ Médio |
| A4 | `study.sh` invoca `@tutor #zombie` e `@tutor #diffuse` separados do loop principal, mas `#diffuse` no @tutor só dá orientação textual — o `make break` já faz isso melhor. Duplicação de propósito | 🟡 Baixo |

#### @session (299 linhas)

| # | Problema | Severidade |
|---|----------|-----------|
| A5 | `start.sh` invoca `@session #session-start` automaticamente, mas **também invoca `@tutor` diretamente** como fallback (linha 56: `opencode run --agent @tutor "#quiz 3 perguntas..."`). O fallback bypassa o @session — inconsistência de design | ⚠️ Médio |
| A6 | @session não aparece na tabela de agentes de `start.sh` — o usuário vê output do @session sem saber que agente está rodando | 🟡 Baixo |

#### @review (auto-análise)

| # | Problema | Severidade |
|---|----------|-----------|
| A7 | Keywords `#save-review` e `#review-and-save` documentadas no `reviews/README.md` **não existem** no agente | 🔴 Crítico |
| A8 | Keywords `#create-proposal`, `#create-plan`, `#suggest-improvements`, `#propose-roadmap` documentadas no `planning/README.md` também **não existem** | 🔴 Crítico |
| A9 | `#review-costs` checklist menciona verificar `opencode.json` para `setCacheKey` e `small_model` — ambos estão configurados ✅, mas o @review não inclui esses campos na análise quando verifica | 🟡 Baixo |

---

## 6. `#review-consistency` — Consistência Geral

| # | Problema | Exemplos | Severidade |
|---|----------|----------|-----------|
| C1 | **Contagem de comandos inconsistente**: README.md diz "14 comandos", `quickstart.md` diz "15 Comandos", Makefile tem 16 targets (incluindo `help`) | README.md:28, quickstart.md:14 | ⚠️ Médio |
| C2 | **Nomenclatura de semana inconsistente**: `plan.sh` e `retro.sh` usam `date +%U` (semana do ano ISO 01-53), mas os arquivos existentes são `week-01.md`, `week-07.md` etc. com numeração sequencial manual — podem não coincidir | — | ⚠️ Médio |
| C3 | **Português vs português europeu**: @session usa "actividade", "utilizador", "arquivo", "directamente" (pt-PT) enquanto outros agentes usam "atividade", "usuário", "diretamente" (pt-BR) misturado | — | 🟡 Baixo |
| C4 | **Instrução de instalação contraditória**: `common.sh` e `setup.sh` dizem `npm install -g opencode` — mas o sistema atual usa `opencode` como binário nativo, não npm | — | ⚠️ Médio |
| C5 | **`setup.sh` instructions macOS-only**: `brew install jq` não funciona no Linux (plataforma atual) | `setup.sh:15` | 🟡 Baixo |

---

## 7. `#review-costs` — Custos e Otimização

| Agente | Linhas | Tokens Est. | Estado |
|--------|--------|-------------|--------|
| @meta | 459 | ~3.200 | Bem otimizado |
| @tutor | 566 | ~3.800 | Bem otimizado |
| @session | 299 | ~2.100 | Bem otimizado |
| @review | ~450 | ~3.100 | Bem otimizado |

### Checklist de Boas Práticas

| Prática | @meta | @tutor | @session | @review |
|---------|:---:|:---:|:---:|:---:|
| Sem duplicação keywords/exemplos | ✅ | ✅ | ✅ | ✅ |
| Instrução de concisão no Checklist Final | ✅ | ✅ | ✅ | ✅ |
| Cache documentado na Identidade | ✅ | ✅ | ✅ | ✅ |
| `setCacheKey` em opencode.json | ✅ | ✅ | ✅ | ✅ |
| `small_model` configurado | ✅ | ✅ | ✅ | ✅ |
| Contexto seletivo | ✅ | ✅ | ✅ | ✅ |

**Veredito custos**: Configuração excelente. Não há desperdício estrutural óbvio.

### Oportunidades de Model Routing

| # | Oportunidade | Impacto |
|---|--------------|---------|
| CO1 | Keywords `#zombie` e `#diffuse` do @tutor — baixa complexidade cognitiva, candidatas a `small_model` | Baixo custo, baixo risco |
| CO2 | `#session-start` e `#session-end` são orquestração simples sem raciocínio profundo — candidatos a `small_model` | Médio |

---

## 8. Technical Debt Consolidado

### 🔴 Críticos (resolver antes do próximo ciclo)

| ID | Problema | Localização | Esforço |
|----|----------|-------------|---------|
| B2 | `streak.sh` faz `source` do arquivo de stats — execução de código arbitrário | `streak.sh:36` | 30min |
| D3 | `reviews/README.md` documenta keywords inexistentes do @review (`#save-review`, `#review-and-save`) | `reviews/README.md:92-95` | 15min |
| D4 | `planning/README.md` documenta keywords inexistentes do @review (`#create-proposal` etc.) | `planning/README.md:93-103` | 15min |

### ⚠️ Médios (próximas 2 semanas)

| ID | Problema | Esforço |
|----|----------|---------|
| B3 | `sort \| tail -1` para week files ordena errado (week-9 > week-10) | 20min |
| B4 | `date +%U` inconsistente com numeração manual de weeks | 1h (decisão + fix) |
| B1 | `streak.sh` não usa `common.sh` — duplicação de cores | 30min |
| D1/S3 | README.md com duas seções de estrutura duplicadas | 15min |
| D7 | Link para `overlearning.md` que não existe no README | 10min |
| A5 | `start.sh` fallback usa `@tutor` bypassing `@session` — inconsistente | 20min |
| C4 | Instruções de instalação do opencode desatualizadas | 15min |
| S5 | `backups/` não está no `.gitignore` | 5min |

### 🟡 Baixos (backlog)

| ID | Problema |
|----|----------|
| A1 | Referência a `@coach` que não existe |
| A3 | Distinção `#wrap-up` vs `#session-end` não documentada no @tutor |
| B5 | `brew install jq` em `setup.sh` para sistema Linux |
| C3 | Mistura pt-PT / pt-BR entre agentes |
| D6 | Skills em `.opencode/skills/` sem documentação |
| S4 | `sync-script.sh` de flashcards não referenciado no Makefile |

---

## 9. Roadmap de Melhorias

### 🔴 Imediato (hoje — ~1h)

1. **Corrigir `streak.sh`**: substituir `source "$STATS_FILE"` por parsing seguro com `grep`/`cut`
2. **Limpar `reviews/README.md`**: remover keywords falsas (`#save-review`, `#review-and-save`)
3. **Limpar `planning/README.md`**: remover keywords inexistentes do @review
4. **Adicionar `backups/` ao `.gitignore`**

### ⚠️ Curto Prazo (esta semana — ~3h)

5. **Corrigir ordenação de week files**: usar `sort -V` (versão natural) em `start.sh`
6. **Unificar numeração de semanas**: decidir entre `date +%U` ou número sequencial manual e enforçar
7. **Fundir seção duplicada de estrutura no README.md**
8. **Corrigir link `overlearning.md`** — criar o arquivo ou remover a referência
9. **Migrar `streak.sh` para usar `common.sh`**
10. **Atualizar instruções de instalação** do opencode e do jq para Linux

### 🟡 Médio Prazo (próximas 2 semanas)

11. **Documentar skills** em `.opencode/skills/` ou remover se não usadas
12. **Expor `sync-script.sh`** de flashcards via Makefile (`make sync-flashcards`)
13. **Corrigir `setup.sh`** para ser cross-platform (Linux + macOS)
14. **Clarificar `#wrap-up` vs `#session-end`** no @tutor com nota cruzada explícita
15. **Remover referência a `@coach`** do @meta

### 📈 Longo Prazo (próximo mês)

16. **Model routing explícito**: documentar quais keywords são candidatas a `small_model` — reduzir custo estimado em ~20%
17. **Criar `guides/README.md`** — a pasta guides não tem índice
18. **Decidir destino dos planos de migração Rust→Zig** — arquivar como decisão histórica ou remover

---

*@review — Auditoria completa. Framework saudável, débito técnico controlável.*
