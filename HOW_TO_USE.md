# Como Usar o Ultralearning System

> Guia completo e autocontido. Do primeiro `/ul-setup-check` ao domínio de CS Fundamentals.

**Última atualização**: 2026-04-13

---

## Índice

- [1. Quick Start (Primeira Vez)](#1-quick-start-primeira-vez)
- [2. Checklist Pré-Sessão](#2-checklist-pré-sessão)
- [3. Rotina Diária (1 hora)](#3-rotina-diária-1-hora)
- [4. Rotina Semanal](#4-rotina-semanal)
- [5. Referência de Commands](#5-referência-de-commands)
- [6. Arquitetura de Dados](#6-arquitetura-de-dados)
- [7. Validação Pós-Sessão](#7-validação-pós-sessão)
- [8. Armadilhas e Dicas](#8-armadilhas-e-dicas)
- [9. Troubleshooting](#9-troubleshooting)
- [10. Checklist Imprimível](#10-checklist-imprimível)

---

## 1. Quick Start (Primeira Vez)

3 passos para começar. 5 minutos de setup, 1 hora de estudo.

```bash
# 1. Verificar dependências (1x só)
/ul-setup-check

# 2. Criar seu primeiro módulo
/ul-module-create
# Digite o tema: ex "python-basics"

# 3. (Opcional) Planejar com @meta
/ul-plan-decompose "Python básico"
```

Após o setup, a rotina diária é:

```bash
/ul-study-start              # Inicia sessão com contexto (5 min)
/ul-study-drill recursão  # Escolha técnica (50 min)
/ul-study-end                # Encerra e salva progresso (5 min)
```

**Tempo total**: ~1 hora | **Custo estimado**: ~0.01EUR por sessão

---

## 2. Checklist Pré-Sessão

> 2 minutos de preparação = sessão 3x mais produtiva.

### Verificação de Ambiente

- [ ] **OpenCode instalado** — `opencode --version`
- [ ] **Módulo ativo definido** — `/ul-data-status`

### Checklist Mental

- [ ] **Objetivo claro**: O que vou aprender/praticar hoje? (1 frase)
- [ ] **Duração definida**: Quanto tempo? (recomendado: 1h)
- [ ] **Distracções eliminadas**: Celular Nao Perturbe, notificacoes off

### Auto-Avaliação de Readiness

**Readiness de 1 a 10:** ___/10

| Score | Ação |
|-------|------|
| **8-10** | `/ul-study-start` |
| **5-7** | `/ul-study-start` (Two-Minute Rule) |
| **1-4** | Considere descansar |

---

## 3. Rotina Diária (1 hora)

### Visão Geral

```
START (5 min)           STUDY (50 min)            END (5 min)
/ul-study-start    →    /ul-study-drill    →    /ul-study-end
                        /ul-study-feynman
                        /ul-study-project
                        /ul-study-quiz
```

### 3.1 Start (5 min)

```bash
/ul-study-start
```

O que acontece:
- Tool `context-hybrid` carrega contexto automático (módulo, sessões, SRS, plano)
- `@tutor` com skill `session` sugere atividade baseada no contexto
- Quiz automático testa o que estudou ontem

### 3.2 Study (50 min)

| Situação | Command | Por quê |
|----------|---------|---------|
| Conceito completamente novo | `/ul-study-learn [conceito]` | Analogia primeiro |
| Aprender fazendo | `/ul-study-project [desafio]` | Projeto real |
| Praticar sintaxe/procedimento | `/ul-study-drill [conceito]` | Repetição = automatização |
| Revisar conceito | `/ul-study-feynman [conceito]` | Se nao explica, nao entendeu |
| Warm-up rápido | `/ul-study-quiz N [tópico]` | Retrieval practice |
| Começar projeto novo | `/ul-setup-scaffold [projeto]` | Estrutura pronta |
| Bug difícil | `/ul-study-debug` | Guia socrático |
| Sem vontade de estudar | `/ul-study-start` | Two-Minute Rule |
| Travado mentalmente | `pausa de 15 min (modo difuso)` | Modo difuso |
| Criar flashcard | `/ul-study-memorize` | Memorização |

**Dica**: Se nao sabe o que fazer, use `/ul-study-start` — ele sugere a melhor atividade.

### 3.3 End (5 min)

```bash
/ul-study-end
```

O que acontece:
- Tool `data.createSession` salva no CSV
- Tool `data.updateStreak` atualiza streak
- `memcommit()` sincroniza memória OpenViking

---

## 4. Rotina Semanal

### Domingo (30 min)

```bash
/ul-plan-retro  # Retrospectiva: o que funcionou? O que nao?
/ul-plan-weekly N  # Planejar próxima semana
```

### Qualquer Dia

```bash
/ul-study-recall   # Revisar flashcards (SRS) — ideal 3x/semana
/ul-data-status     # Ver streak e progresso
```

### Checklist Semanal

- [ ] Retrospectiva feita (`/ul-plan-retro`)
- [ ] Plano da semana criado (`/ul-plan-weekly`)
- [ ] Streak mantido — 7 dias? (`/ul-data-status`)
- [ ] SRS revisado — mínimo 3x na semana (`/ul-study-recall`)
- [ ] Projetos avançando — algum projeto prático em andamento?

### 💡 Dica: Habit Stacking

```
"Após [HÁBITO EXISTENTE], eu vou [ESTUDAR]"

☕ Após café da manhã → /ul-study-start (25 min)
🍽️  Após almoço → /ul-study-recall (10 min)
🌙 Após jantar → /ul-study-quiz 5 [tópico]
```

---

## 5. Referência de Commands

### Sessão (/ul-study-*)

| Command | Descrição |
|---------|-----------|
| `/ul-study-start` | Iniciar sessão com contexto automático |
| `/ul-study-end` | Encerrar sessão e salvar progresso |
| `/ul-study-plan` | Ver progresso da semana e plano atual |

### Prática e Aprendizado (/ul-study-*)

| Command | Descrição |
|---------|-----------|
| `/ul-study-learn [conceito]` | Introduzir conceito novo com analogias |
| `/ul-study-debug` | Debug socrático - guia para encontrar bugs |
| `/ul-study-drill [conceito]` | Prática deliberada 5-10x |
| `/ul-study-feynman [conceito]` | Validar compreensão explicando |
| `/ul-study-quiz N [tópico]` | Warm-up com quiz adaptativo |
| `/ul-study-project [desafio]` | Aprender fazendo projetos reais |
| `/ul-study-memorize` | Criar flashcards SRS |
| `/ul-study-recall` | Revisar flashcards pendentes |

### Setup (/ul-setup-*)

| Command | Descrição |
|---------|-----------|
| `/ul-setup-check` | Verificar dependências do sistema |
| `/ul-setup-scaffold [projeto]` | Criar estrutura/boilerplate de projeto |

### Planejamento (/ul-plan-*)

| Command | Descrição |
|---------|-----------|
| `/ul-plan-decompose [objetivo]` | Decompor objetivo complexo |
| `/ul-plan-weekly [semana]` | Criar plano semanal detalhado |
| `/ul-plan-benchmark [skill]` | Criar teste de proficiência mensurável |
| `/ul-plan-adjust [situação]` | Reajustar cronograma |
| `/ul-plan-resources [tópico]` | Mapear recursos em 3 tiers |
| `/ul-plan-retro` | Retrospectiva semanal |

### Módulos (/ul-module-*)

| Command | Descrição |
|---------|-----------|
| `/ul-module-create [nome]` | Criar novo módulo de estudo |
| `/ul-module-switch [nome]` | Alternar módulo ativo |
| `/ul-module-archive [nome]` | Arquivar módulo finalizado |

### Dados (/ul-data-*)

| Command | Descrição |
|---------|-----------|
| `/ul-data-status` | Ver streak, sessões, módulo atual |
| `/ul-data-analytics` | Relatório analítico avançado |
| `/ul-data-dashboard` | Dashboard completo com métricas |
| `/ul-data-manage [op]` | Gerenciar dados (init, reset) |
| `/ul-data-backup` | Criar backup dos dados |

### Review (/ul-review-*)

| Command | Descrição |
|---------|-----------|
| `/fw-review-audit` | Auditoria completa do framework |

### Como Escolher o Command Certo

1. **Começando a estudar?** → `/ul-study-start`
2. **Não consegue começar?** → `/ul-study-start`
3. **Conceito novo?** → `/ul-study-learn`
4. **Já estudou e quer validar?** → `/ul-study-feynman`
5. **Quer praticar?** → `/ul-study-drill`
6. **Projeto prático?** → `/ul-study-project`
7. **Bug difícil?** → `/ul-study-debug`
8. **Terminando?** → `/ul-study-end`

### Dificuldade Adaptativa

| Nível | Critério | Comportamento |
|-------|----------|---------------|
| **Easy** | error_rate < 20% | Perguntas mais desafiadoras |
| **Medium** | error_rate 20-40% | Perguntas balanceadas |
| **Hard** | error_rate > 40% | Perguntas mais simples |

---

## 6. Arquitetura de Dados

O sistema usa **duas camadas complementares**, cada uma otimizada para um propósito.

### Fontes de Dados

| Camada | Tecnologia | Propósito | Exemplos |
|--------|------------|-----------|----------|
| **Dados Estruturados** | CSV | Dados quantitativos, queries | sessões, streaks, flashcards, módulos |
| **Memória Contextual** | OpenViking | Dados qualitativos, semântica | preferências, padrões, casos conversacionais |

### CSV — Dados Quantitativos

**Localização**: `data/*.csv`

| Arquivo | Propósito |
|---------|-----------|
| `sessions.csv` | Sessões de estudo |
| `session_skills.csv` | Técnicas por sessão |
| `insights.csv` | Métricas (streak, tempo, foco) |
| `flashcards.csv` | Flashcards SRS |
| `reviews.csv` | Histórico SRS |
| `modules.csv` | Módulos de estudo |

### OpenViking — Memória Contextual

**Localização**: `~/.openviking/` (global)

| URI | Propósito |
|-----|-----------|
| `viking://user/memories/preferences/` | Preferências de aprendizado |
| `viking://user/memories/entities/` | Conceitos aprendidos |
| `viking://user/memories/events/` | Marcos e decisões |
| `viking://agent/{id}/memories/cases/` | Casos e problemas resolvidos |
| `viking://agent/{id}/memories/patterns/` | Padrões identificados |

### Contexto Híbrido — `context-hybrid.ts`

Abstração que combina CSV + OpenViking com fallback automático.

```typescript
// Contexto completo (CSV + OpenViking)
const context = await contextHybrid({ operation: "getFullContext" });

// Contexto de sessão (mais leve)
const session = await contextHybrid({ operation: "getSessionContext" });

// Preferências do usuário
const prefs = await contextHybrid({ operation: "getUserPreferences" });
```

Se OpenViking indisponível, retorna dados CSV com `warnings`. Sistema continua funcionando.

### Hierarquia de Contexto (L0/L1/L2)

| Nível | Tokens | Uso |
|-------|--------|-----|
| **L0 (abstract)** | ~100 | Quick check — ver se é relevante |
| **L1 (overview)** | ~2k | Planning — visão geral |
| **L2 (read)** | Completo | Deep dive — detalhes |

**Economia**: -70% a -90% de tokens comparado a carregar tudo.

### Regras de Ouro

**1. CSV é obrigatório. OpenViking é opcional.**

Sempre escreva em CSV primeiro. OpenViking é acréscimo, não fonte primária.

**2. Não duplicar dados.**

| Tipo | Onde armazenar |
|------|----------------|
| "Usuário estudou 45 min hoje" | CSV (quantitativo) |
| "Usuário tem dificuldade com recursão" | OpenViking (qualitativo) |
| "Streak atual é 7" | CSV (quantitativo) |
| "Usuário prefere estudar pela manhã" | OpenViking (preferência) |

**3. Fallback é automático.**

`context-hybrid.ts` já implementa fallback. Não reinvente.

### Fluxo de Dados

```
INÍCIO DA SESSÃO
/ul-study-start
└── context-hybrid.getFullContext()
    ├── Lê CSV (sessions, flashcards, insights)
    └── Lê OpenViking (preferences, patterns) ─── fallback OK

DURANTE A SESSÃO
/ul-study-drill, /ul-study-feynman, etc.
└── CSV apenas (flashcards, sessões)
    └── Operações síncronas, offline-first

FIM DA SESSÃO
/ul-study-end
├── 1. CSV: data.createSession() → sessions.csv
├── 2. CSV: data.updateStreak() → insights.csv
└── 3. OpenViking: memcommit() ─── opcional, não-bloqueante
```

### Commands por Arquitetura

| Command | Arquitetura | Ferramentas |
|---------|-------------|-------------|
| `/ul-study-start` | Híbrida | `context-hybrid`, `memread`, `memsearch`, `membrowse` |
| `/ul-study-end` | CSV + memcommit | `data.createSession`, `data.updateStreak`, `memcommit` |
| `/ul-study-drill` | CSV | `data.createFlashcard` |
| `/ul-study-feynman` | CSV | `data.createFlashcard` |
| `/ul-study-quiz` | CSV | `insights.getDifficultyLevel`, `insights.getWeaknesses` |
| `/ul-study-project` | Híbrida | `context-hybrid.getProjectInfo` |
| `/ul-data-status` | CSV | `status.getStatus` |
| `/ul-data-analytics` | CSV | `insights.getSummary`, `insights.getPatterns` |
| `/ul-data-dashboard` | CSV | `insights.showDashboard` |
| `/ul-study-memorize` | OpenViking | `memcommit` |
| `/ul-study-recall` | OpenViking | `memsearch`, `memread` |
| `/ul-plan-retro` | CSV + memcommit | `retro.getWeeklyStats`, `memcommit` |

### Configuração OpenViking

```bash
# Verificar se está rodando
docker-compose ps

# Deve mostrar:
# ultralearning-ollama       (healthy)
# ultralearning-openviking   (healthy)
```

| Comando | Descrição |
|---------|-----------|
| `docker-compose ps` | Verificar status |
| `docker-compose logs -f openviking` | Ver logs |
| `docker-compose restart` | Reiniciar servidos |
| `curl http://localhost:1933/health` | Health check |

### O que é Salvo Automaticamente

| Dado | Onde | Como |
|------|------|------|
| Sessão diária | `sessions.csv` | `/ul-study-end` |
| Streak | `insights.csv` | `/ul-study-end` |
| Técnicas usadas | `session_skills.csv` | Tool data.ts |
| Acertos/Erros | `session_skills.correct` | Derivado de `success_rating >= 6` |
| Flashcards revisados | `reviews.csv` | Tool data.ts (SM-2) |
| Preferências | OpenViking `preferences/` | `memcommit()` |
| Conceitos | OpenViking `entities/` | `memcommit()` |
| Casos | OpenViking `cases/` | `memcommit()` |

### Verificar Memória

```bash
# Ver preferências
membrowse "viking://user/default/memories/preferences/"

# Ver conceitos aprendidos
membrowse "viking://user/default/memories/entities/"

# Ver casos do tutor
membrowse "viking://agent/{id}/memories/cases/"
```

### Analytics Disponíveis

```bash
/ul-data-analytics       # Analytics detalhados
/ul-data-dashboard       # Dashboard consolidado visual
```

**`/ul-data-analytics` mostra**: streak, total sessões, tempo total, foco médio, técnica mais usada, taxa de erro, recomendações

**`/ul-data-dashboard` mostra**: resumo geral, efetividade das técnicas, padrões de estudo, pontos fracos

### Backup

```bash
/ul-data-backup
```

Cria backup de todos os dados em `backups/`.

---

## 7. Validação Pós-Sessão

Confirme antes de sair:

- [ ] **Sessão salva no CSV** — `tail -3 data/sessions.csv`
- [ ] **Streak atualizado** — `/ul-data-status`
- [ ] **Próxima sessão agendada** — Data/hora definida
- [ ] **Conceitos difíceis marcados** — `/ul-study-memorize`

---

## 8. Armadilhas e Dicas

### NAO COMECE SE:

- ❌ **Não tem objetivo específico** — "Vou estudar Python" = vago. "Vou implementar binary search em Python" = bom
- ❌ **Vai pular o warm-up** — O quiz ativa memória do dia anterior. Sem warm-up = perde 20% de eficiência
- ❌ **Vai estudar +2h sem pausa** — Use pomodoro: 50 min foco + 10 min break
- ❌ **Vai encerrar sem salvar** — `/ul-study-end` = streak + memória consolidada

### 5 Dicas de Ouro

1. **Consistência > Intensidade**: 1h/dia todo dia > 5h no fim de semana
2. **Não releia, recupere**: Quiz diário força memória ativa (retrieval practice)
3. **Projetos reais**: Não fique só em tutoriais — use `/ul-study-project`
4. **Seja honesto**: Se não entendeu, use `/ul-study-feynman` para testar
5. **Mantenha o streak**: A gamificação funciona — `/ul-data-status` para acompanhar

---

## 9. Troubleshooting

### Setup e Ambiente

**Módulo não encontrado?**
```bash
/ul-module-switch  # Lista módulos disponíveis
```

**Quiz não funciona?**
```bash
opencode --version
# No TUI: /models -> deve mostrar opencode/glm-5
```

**Skills não carregam?**
```bash
ls .opencode/skills/*/SKILL.md
```

**Streak não atualiza?**
```bash
/ul-data-manage init  # Reinicializar dados
```

### Durante o Estudo

**Travou no meio?** → `pausa de 15 min (modo difuso)` (15 min modo difuso)

**Não consegue focar?** → `/ul-study-start` ou consulte `guides/tecnicas/pomodoro.md`

**Erros recorrentes no drill?** → `/ul-study-drill [conceito]` (overlearning)

**Procrastinando?** → `/ul-study-start` ou consulte `guides/tecnicas/procrastination-zombie.md`

### OpenViking indisponível

Sistema continua funcionando com dados CSV apenas. Dados OpenViking ficam vazios (não crítico).

```bash
docker-compose ps              # Verificar status
docker-compose restart openviking  # Reiniciar
curl http://localhost:1933/health   # Health check
```

### Dados divergentes

CSV é a fonte de verdade para dados quantitativos. Se divergem, reconstrua preferências OpenViking a partir do CSV:
```bash
/ul-study-start
→ context-hybrid carrega CSV
→ memcommit() sincroniza estado atual
```

---

## 10. Checklist Imprimível

```
PRE-SESSAO:
[ ] OpenCode ok | [ ] Objetivo definido | [ ] Distracoes off
[ ] Materiais prontos | [ ] 1h disponivel

ROTINA:
/ul-study-start -> /ul-study-drill (ou feynman, project) -> /ul-study-end

POS-SESSAO:
[ ] Sessao salva no CSV | [ ] Streak ok | [ ] Proxima marcada
[ ] Dificeis no SRS

SE TRAVAR: pausa de 15 min (modo difuso)
SE NAO CONSEGUIR COMECAR: /ul-study-start
SE NAO SABE O QUE FAZER: /ul-study-start

SEMANAL (domingo):
/ul-plan-retro + /ul-plan-weekly
```

---

*Feito para aprender melhor. Comece agora com `/ul-setup-check`.*