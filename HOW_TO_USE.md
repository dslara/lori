─# Como Usar o Ultralearning System

> Guia completo para estudar com o framework. Do primeiro `make setup` ao dominio de CS Fundamentals.

**Última atualização**: 2026-03-07

---

## Índice

- [1. Quick Start (Primeira Vez)](#1-quick-start-primeira-vez)
- [2. Checklist Pré-Sessão](#2-checklist-pré-sessão)
- [3. Rotina Diaria (1 hora)](#3-rotina-diaria-1-hora)
- [4. Rotina Semanal](#4-rotina-semanal)
- [5. Validação Pós-Sessão](#5-validação-pós-sessão)
- [6. Referencia de Keywords](#6-referencia-de-keywords)
- [7. Comandos de Terminal (Atalhos)](#7-comandos-de-terminal-atalhos)
- [8. Armadilhas Comuns e Dicas](#8-armadilhas-comuns-e-dicas)
- [9. Troubleshooting](#9-troubleshooting)
- [10. Checklist Imprimivel](#10-checklist-imprimivel)

---

## 1. Quick Start (Primeira Vez)

3 passos para comecar. 5 minutos de setup, 1 hora de estudo.

```bash
# 1. Configuração inicial (1x só)
make setup

# 2. Criar seu primeiro modulo
make module
# Digite o tema: ex "python-basics"

# 3. (Opcional) Planejar com @meta
@meta #decompose-goal "Python basico"
```

Apos o setup, a rotina diaria e:

```bash
@tutor #start   # Inicia sessao com contexto (5 min)
@tutor #drill recursão  # Escolha técnica (50 min)
@tutor #end     # Encerra e salva progresso (5 min)
```

**Tempo total**: ~1 hora | **Custo estimado**: ~0.01EUR por sessao

---

## 2. Checklist Pré-Sessão

> 2 minutos de preparação = sessão 3x mais produtiva.

### Verificação de Ambiente

Confirme antes de comecar:

- [ ] **OpenCode instalado**
  ```bash
  opencode --version
  # Deve retornar versao (ex: 0.5.1)
  ```

- [ ] **Make disponivel** (opcional)
  ```bash
  make help
  # Deve listar atalhos de terminal
  ```

- [ ] **Modulo ativo definido**
  ```bash
  make status
  # Deve mostrar: M1-math-foundations, M2-zig-foundations, etc.
  ```

### Checklist Mental

Responda mentalmente antes de `@tutor #start`:

- [ ] **Objetivo claro**: O que vou aprender/praticar hoje? (1 frase)
- [ ] **Duração definida**: Quanto tempo vou estudar? (recomendado: 1h)
- [ ] **Distracoes eliminadas**:
  - [ ] Celular no modo Nao Perturbe
  - [ ] Notificacoes desligadas
  - [ ] Abas irrelevantes fechadas
- [ ] **Materiais prontos**:
  - [ ] Cafe/agua a mao
  - [ ] Caderno/digital para anotacoes rapidas

### Auto-Avaliação de Readiness

**Readiness de 1 a 10:** ___/10

| Score | Acao Recomendada |
|-------|------------------|
| **8-10** | Va para `@tutor #start` |
| **5-7** | Use `@tutor #zombie` (Two-Minute Rule) |
| **1-4** | Considere descansar e remarcar |

Se score < 7:
```bash
@tutor #zombie
# O agente vai te guiar para comecar ridiculamente pequeno
```

---

## 3. Rotina Diaria (1 hora)

### Visao Geral

```
┌───────────────────────────────────────────────────────────────┐
│                    SESSAO DE ULTRALEARNING                    │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  START (5 min)              STUDY (50 min)            END     │
│  ┌──────────┐              ┌──────────────┐        ┌───────┐  │
│  │ @tutor   │──────────────│  #feynman    │────────│@tutor │  │
│  │  #start  │  Contexto    │  #drill      │        │ #end  │  │
│  └──────────┘              │  #directness │        └───────┘  │
│       |                    │  #quiz       │        5 min      │
│       |                    └──────────────┘                   │
│       └──────────────────────────────────────────────────->   │
│                                                               │
│  KEYWORDS DISPONIVEIS:                                        │
│  #drill -> Repeticao de procedimentos                         │
│  #feynman -> Explicar conceito                                │
│  #quiz -> Warm-up rapido                                      │
│  #directness -> Projeto pratico                               │
│  #explain -> Introducao a conceito novo                       │
│  #debug -> Debug socratico                                    │
│  #zombie -> Superar procrastinação                            │
│  #scaffold -> Estrutura base                                  │
│  #srs-generator -> Criar flashcards                           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 3.1 Start (5 min)

```bash
@tutor #start
```

O que acontece:
- Script `start.sh` salva timestamp e carrega contexto
- `@tutor` com skill `session` sugere atividade baseada no plano
- Quiz automatico testa o que voce estudou ontem (3 perguntas)
- Ativa memoria antes de aprender conteudo novo

### 3.2 Study (50 min)

Escolha uma keyword baseado no que precisa:

| Situação | Keyword | Skill | Por quê |
|----------|---------|-------|---------|
| Conceito completamente novo | `#explain [conceito]` | `explain-concept` | Analogia primeiro |
| Aprender fazendo | `#directness [desafio]` | `directness` | Projeto real |
| Praticar sintaxe/procedimento | `#drill [conceito]` | `drill` | Repetição = automatização |
| Revisar conceito | `#feynman [conceito]` | `feynman` | Se nao explica, nao entendeu |
| Warm-up rapido | `#quiz N [tópico]` | `quiz` | Retrieval practice |
| Comecar projeto novo | `#scaffold [projeto]` | `scaffold` | Estrutura pronta |
| Bug dificil | `#debug` | `debug-socratic` | Guia socratico |
| Sem vontade de estudar | `#zombie` | `zombie-mode` | Two-Minute Rule |
| Criar flashcard | `#srs-generator` | `srs-generator` | Memorização |

**Exemplos**:
```bash
@tutor #drill recursão
@tutor #feynman closures
@tutor #directness "API REST com autenticação"
@tutor #quiz 3 Big O
```

**Dica**: Se nao sabe o que fazer, use `@tutor #start` — ele vai ler seu plano e sugerir a melhor atividade.

### 3.3 End (5 min)

```bash
@tutor #end
```

O que acontece:
- Skill `session` consolida a sessao com reflexao estruturada
- Script `end.sh` salva no CSV automaticamente
- Streak e atualizado automaticamente

---

## 4. Rotina Semanal

### Domingo (30 min)

```bash
@meta #retro    # Retrospectiva: o que funcionou? O que nao?
@meta #create-weekly-plan semana N  # Planejar proxima semana
```

### Qualquer Dia

```bash
@tutor #srs-generator review   # Revisar flashcards (SRS) — ideal 3x/semana
make status                    # Ver streak e progresso (atalho)
```

### Checklist Semanal

- [ ] **Retrospectiva feita** (`@meta #retro`)
- [ ] **Plano da semana criado** (`@meta #create-weekly-plan`)
- [ ] **Streak mantido** — 7 dias seguidos? (`make status`)
- [ ] **SRS revisado** — minimo 3x na semana (`@tutor #srs-generator review`)
- [ ] **Projetos avancando** — algum projeto pratico em andamento?

---

## 5. Validação Pós-Sessão

Confirme antes de sair:

- [ ] **Sessão salva no CSV**
  ```bash
  tail -3 data/sessions.csv
  # Deve conter sua sessão de hoje
  ```

- [ ] **Streak atualizado**
  ```bash
  make status
  # Confirme que o streak incrementou
  ```

- [ ] **Proxima sessao agendada**
  - Data/hora definida no calendario
  - Objetivo pre-definido (anotado)

- [ ] **Conceitos dificeis marcados**
  ```bash
  @tutor #srs-generator
  # Adicione ao SRS o que nao dominou 100%
  ```

---

## 6. Referencia de Keywords

### @tutor — Sessão de Estudo

| Keyword | Quando Usar | Skill |
|---------|-------------|-------|
| `#start` | Iniciar sessão com contexto | `session` |
| `#end` | Encerrar e salvar progresso | `session` |
| `#plan` | Ver progresso da semana | `session` |
| `#drill [conceito]` | Praticar procedimento 5-10x | `drill` |
| `#feynman [conceito]` | Testar compreensão explicando | `feynman` |
| `#quiz N [tópico]` | Warm-up / retrieval | `quiz` |
| `#directness [desafio]` | Projeto real | `directness` |
| `#explain [conceito]` | Conceito novo | `explain-concept` |
| `#debug` | Bug difícil | `debug-socratic` |
| `#zombie` | Procrastinação | `zombie-mode` |
| `#scaffold [projeto]` | Criar estrutura | `scaffold` |
| `#srs-generator` | Criar flashcard | `srs-generator` |
| `#srs-generator review` | Revisar flashcards | `srs-generator` |
| `#intuition [conceito]` | Entender o "por quê" | — (inline) |
| `#feedback` | Revisar código | — (inline) |
| `#experiment` | Comparar abordagens | — (inline) |
| `#diffuse` | Travado no problema | — (inline) |

### @meta — Planejamento

| Keyword | Quando Usar | Skill |
|---------|-------------|-------|
| `#decompose-goal [objetivo]` | Decompor objetivo | `decomposition` |
| `#retro` | Retrospectiva semanal | `retrospective` |
| `#benchmark-test` | Criar teste de proficiência | `benchmarking` |
| `#map-resources [tópico]` | Curar recursos | — (inline) |
| `#create-weekly-plan semana N` | Criar plano semanal | — (inline) |
| `#update-plan semana [N]` | Registrar progresso | — (inline) |
| `#adjust-plan [situação]` | Reajustar cronograma | — (inline) |
| `#habit-stack` | Criar cadeia de hábitos | — (inline) |

### @review — Auditoria do Framework

| Keyword | Quando Usar |
|---------|-------------|
| `#review-structure` | Analisa organização de pastas |
| `#review-scripts` | Avalia qualidade dos scripts bash |
| `#review-docs` | Verifica coerência da documentação |
| `#review-makefile` | Revisa orquestração de comandos |
| `#review-agents` | Analisa efetividade dos agentes |
| `#review-consistency` | Verifica consistencia geral |
| `#review-architecture` | Analise arquitetural profunda |
| `#review-costs` | Auditoria de otimização de tokens |
| `#audit-quality` | Auditoria completa (executa todas acima) |
| `#check-readiness [versao]` | Prontidao para release |
| `#meta-review [arquivo]` | Revisa documento gerado pelo @review |

---

## 7.1. Dificuldade Adaptativa

O sistema ajusta automaticamente a complexidade das perguntas baseado no seu histórico de acertos/erros.

### Como Funciona

| Nível | Critério | Comportamento |
|-------|----------|---------------|
| **Easy** | error_rate < 20% | Perguntas mais desafiadoras |
| **Medium** | error_rate 20-40% | Perguntas balanceadas |
| **Hard** | error_rate > 40% | Perguntas mais simples |

### Skills com Dificuldade Adaptativa

- **`#quiz`**: Ajusta complexidade das perguntas
- **`#srs-generator review`**: Ajusta feedback e dicas

### Ver Níveis de Dificuldade

```bash
./scripts/tutor-difficulty.sh report
```

---

## 7. Comandos de Terminal (Atalhos)

**Interface principal**: Keywords no OpenCode  
**Interface secundária**: Atalhos de terminal (opcional)

### Sessão Diária

| Comando | Descrição | Equivalente |
|---------|-----------|-------------|
| `make start` | Iniciar sessão | `@tutor #start` |
| `make end` | Encerrar sessão | `@tutor #end` |

### Módulos

| Comando | Descrição |
|---------|-----------|
| `make module` | Criar novo módulo |
| `make switch` | Alternar módulo ativo |
| `make plan` | Planejar semana |
| `make resources` | Mapear recursos |

### Revisão

| Comando | Descrição |
|---------|-----------|
| `make review` | Revisar flashcards (SRS) |
| `make retro` | Retrospectiva semanal |
| `make break` | Pausa de 15 min |
| `make drill-extra` | Overlearning |

### Utilitários

| Comando | Descrição |
|---------|-----------|
| `make status` | Ver streak e progresso |
| `make analytics` | Ver analytics avançados |
| `make skill-effectiveness` | Efetividade por técnica |
| `make patterns` | Padrões de sessão |
| `make dashboard` | Dashboard consolidado |
| `make weaknesses` | Pontos fracos |
| `make help` | Lista comandos |
| `make setup` | Configuração inicial |
| `make backup` | Backup dos dados |
| `make archive` | Arquivar projeto |

---

## 8. Armadilhas Comuns e Dicas

### NAO COMECE SE:

```
┌──────────────────────────────────────────────────────────────┐
│ x NAO TENHO OBJETIVO ESPECIFICO                              │
│   "Vou estudar Python" -> VAGO                               │
│   "Vou implementar binary search em Python" -> BOM           │
├──────────────────────────────────────────────────────────────┤
│ x VOU PULAR O WARM-UP                                        │
│   O quiz ativa memoria do dia anterior                       │
│   Sem warm-up = perde 20% de eficiencia                      │
├──────────────────────────────────────────────────────────────┤
│ x PLANEJO ESTUDAR +2 HORAS SEM PAUSA                         │
│   Use pomodoro: 50 min foco + 10 min break                   │
│   Ou: make break (15 min modo difuso - Oakley)               │
├──────────────────────────────────────────────────────────────┤
│ x VOU ENCERRAR SEM SALVAR                                    │
│   @tutor #end = streak + memoria consolidada                 │
│   Nao salvar = esquece 40% em 24h                            │
└──────────────────────────────────────────────────────────────┘
```

### 5 Dicas de Ouro

1. **Consistencia > Intensidade**: 1h/dia todo dia > 5h no fim de semana
2. **Nao releia, recupere**: Quiz diario forca memoria ativa (retrieval practice)
3. **Projetos reais**: Nao fique so em tutoriais — use `#directness`
4. **Seja honesto**: Se nao entendeu, use `#feynman` para testar
5. **Mantenha o streak**: A gamificação funciona — `make status` para acompanhar

---

## 9. Troubleshooting

### Setup e Ambiente

**Modulo nao encontrado?**
```bash
make switch  # Lista modulos disponiveis
```

**Quiz nao funciona?**
```bash
# Verifique se opencode esta instalado
opencode --version

# Verifique o modelo selecionado
# No TUI: /models -> deve mostrar opencode/glm-5
```

**Skills nao carregam?**
```bash
# Verifique se as skills existem
ls .opencode/skills/*/SKILL.md

# Teste manual
opencode run --agent @tutor "#drill binary search"
```

**Streak nao atualiza?**
```bash
./scripts/data.sh init  # Reinicializar dados
```

### Durante o Estudo

**Travou no meio do estudo?**
```bash
make break  # 15 min modo difuso (Oakley)
```

**Nao consegue focar?**
```bash
opencode run --agent @tutor "#diffuse"
# Ou consulte: guides/tecnicas/pomodoro.md
```

**Erros recorrentes no drill?**
```bash
make drill-extra  # Overlearning: 5 variacoes de dificuldade
```

**Procrastinando?**
```bash
opencode run --agent @tutor "#zombie"
# Ou consulte: guides/tecnicas/procrastination-zombie.md
```

---

## 10. Checklist Imprimivel

Copia curta para deixar na mesa:

```
PRE-SESSAO:
[ ] OpenCode ok | [ ] Objetivo definido | [ ] Distracoes off
[ ] Materiais prontos | [ ] 1h disponivel

ROTINA:
@tutor #start -> @tutor #drill (ou #feynman, #directness) -> @tutor #end

POS-SESSAO:
[ ] Sessao salva no CSV | [ ] Streak ok | [ ] Proxima marcada
[ ] Dificeis no SRS

SE TRAVAR: make break
SE NAO CONSEGUIR COMECAR: @tutor #zombie
SE NAO SABE O QUE FAZER: @tutor #start

SEMANAL (domingo):
@meta #retro + @meta #create-weekly-plan
```

---

## 11. Sistema de Dados

O sistema salva automaticamente seus dados em arquivos CSV para acompanhamento e analytics.

### Onde os Dados São Salvos

```
data/
├── sessions.csv              # Suas sessões diárias
├── insights.csv             # Métricas (streak, tempo, foco)
├── tutor_interactions.csv   # Histórico de interações com o tutor
├── modules.csv              # Módulos de estudo
└── schema.md               # Documentação completa
```

### Verificando Seus Dados

```bash
# Ver status geral (streak, sessões)
make status

# Ver analytics avançados
make analytics

# Ver detalhes de uma tabela
cat data/sessions.csv
cat data/insights.csv
```

### O que é Salvo Automaticamente

| Dado | Arquivo | Como |
|------|---------|------|
| Sessão diária | `sessions.csv` | `make end` |
| Streak | `insights.csv` | `make end` |
| Tempo de estudo | `sessions.csv` | `make end` |
| Foco (1-10) | `sessions.csv` | `make end` |
| Interações do tutor | `tutor_interactions.csv` | Automaticamente |

### Analytics Disponíveis

```bash
make analytics
```

Mostra:
- Streak atual e melhor
- Total de sessões
- Tempo total de estudo
- Técnica mais usada
- Sessões desta semana

### Backup

```bash
make backup
```

Cria backup de todos os dados em `backups/`.

### Mais Informações

Consulte [`data/schema.md`](data/schema.md) para documentação completa do schema.

---

## Proximos Passos

Apos dominar a rotina basica:

1. **Aprofunde nos principios**: Explore os [9 principios](guides/principios/) do Ultralearning
2. **Domine as tecnicas**: Consulte o [indice de tecnicas](guides/indice.md) (23 tecnicas)
3. **Planeje com estrategia**: Use `@meta` com `#decompose-goal` para quebrar objetivos grandes
4. **Acompanhe o progresso**: Use [`make analytics`](guides/sistema-dados.md) para ver métricas
5. **Entenda os dados**: Leia [Sistema de Dados](guides/sistema-dados.md) para entender como os dados são salvos

---

*Feito para aprender melhor. Comece agora com `make setup`.*
