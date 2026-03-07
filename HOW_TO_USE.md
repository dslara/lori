# Como Usar o Ultralearning System

> Guia completo para estudar com o framework. Do primeiro `make setup` ao dominio de CS Fundamentals.

**Última atualização**: 2026-03-06

---

## Índice

- [1. Quick Start (Primeira Vez)](#1-quick-start-primeira-vez)
- [2. Checklist Pré-Sessão](#2-checklist-pré-sessão)
- [3. Rotina Diaria (1 hora)](#3-rotina-diaria-1-hora)
- [4. Rotina Semanal](#4-rotina-semanal)
- [5. Validação Pós-Sessão](#5-validação-pós-sessão)
- [6. Referencia de Comandos (17)](#6-referencia-de-comandos-17)
- [7. Keywords e Agentes](#7-keywords-e-agentes)
- [8. Armadilhas Comuns e Dicas](#8-armadilhas-comuns-e-dicas)
- [9. Troubleshooting](#9-troubleshooting)
- [10. Checklist Imprimivel](#10-checklist-imprimivel)

---

## 1. Quick Start (Primeira Vez)

3 comandos para comecar. 5 minutos de setup, 1 hora de estudo.

```bash
# 1. Configuração inicial (1x só)
make setup

# 2. Criar seu primeiro modulo
make module
# Digite o tema: ex "python-basics"

# 3. (Opcional) Planejar com @meta
make plan
# Ou direto: opencode run --agent @meta "#decompose-goal Python basico"
```

Apos o setup, a rotina diaria e:

```bash
make start   # Inicia sessao + quiz automatico (5 min)
make study   # Loop interativo — escolha tecnica (50 min)
make end     # Encerra, salva log, atualiza streak (5 min)
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

- [ ] **Make disponivel**
  ```bash
  make help
  # Deve listar 17 comandos
  ```

- [ ] **Modulo ativo definido**
  ```bash
  cat .current-topic
  # Deve mostrar: M1-math-foundations, M2-zig-foundations, etc.
  ```

### Checklist Mental

Responda mentalmente antes de `make start`:

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
| **8-10** | Va para `make start` |
| **5-7** | Use `#zombie` mode (Two-Minute Rule) |
| **1-4** | Considere descansar e remarcar |

Se score < 7:
```bash
opencode run --agent @tutor "#zombie"
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
│  ┌──────────┐              ┌──────────────┐          ┌─────┐  │
│  │  make    │──────────────│  #feynman    │──────────│make │  │
│  │  start   │  Quiz auto   │  #drill      │          │end  │  │
│  └──────────┘              │  #directness │          └─────┘  │
│       |                    │  #quiz       │        5 min      │
│       |                    └──────────────┘                   │
│       └──────────────────────────────────────────────────->   │
│                                                               │
│  OPCOES DO make study:                                        │
│  0. Session (#start) -> Sugestao baseada no plano             │
│  1. Code (#directness) -> Projeto pratico                     │
│  2. Drill (#drill) -> Repeticao de procedimentos              │
│  3. Feynman (#feynman) -> Explicar conceito                   │
│  4. Scaffold (#scaffold) -> Estrutura base                    │
│  5. Experiment (#experiment) -> Comparar abordagens           │
│  6. Feedback (#feedback) -> Revisar codigo                    │
│  7. Explain (#explain) -> Introducao a conceito novo          │
│  8. Intuition (#intuition) -> Entender o "por que"            │
│  9. Debug (#debug) -> Debug socratico                         │
│  z. Zombie (#zombie) -> Superar procrastinação                │
│  d. Diffuse (#diffuse) -> Modo difuso (travado)               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 3.1 Start (5 min)

```bash
make start
```

O que acontece:
- `@tutor` com skill `session` carrega o plano semanal e sugere atividade
- Quiz automatico testa o que voce estudou ontem (3 perguntas)
- Ativa memoria antes de aprender conteudo novo

### 3.2 Study (50 min)

```bash
make study
```

Escolha baseado no que precisa. Skills sao carregadas automaticamente:

| Situação | Opção | Skill | Por quê |
|----------|-------|-------|---------|
| Nao sabe o que fazer hoje | 0. Session | `session` | #start le o plano e sugere |
| Conceito completamente novo | 7. Explain | `explain-concept` | Analogia primeiro |
| Aprender fazendo | 1. Code | `directness` | Projeto real |
| Praticar sintaxe/procedimento | 2. Drill | `drill` | Repetição = automatização |
| Revisar conceito | 3. Feynman | `feynman` | Se nao explica, nao entendeu |
| Comecar projeto novo | 4. Scaffold | `scaffold` | Estrutura pronta |
| Comparar abordagens | 5. Experiment | — (inline) | Testar 3 solucoes |
| Revisar codigo | 6. Feedback | — (inline) | Code review |
| Entender o "por que" | 8. Intuition | — (inline) | Profundidade |
| Bug dificil | 9. Debug | `debug-socratic` | Guia socratico |
| Sem vontade de estudar | z. Zombie | `zombie-mode` | Two-Minute Rule |
| Travado ha >30min | d. Diffuse | — (inline) | Deixar cerebro processar |

**Dica**: Se e sua primeira sessao no modulo, comece pela opcao **0 (Session)** — o `#start` vai ler seu plano semanal e sugerir a melhor atividade.

### 3.3 End (5 min)

```bash
make end
```

O que acontece:
- `@tutor #end` (skill session) consolida a sessao com reflexao estruturada
- Voce anota o que aprendeu
- Streak e atualizado automaticamente

---

## 4. Rotina Semanal

### Domingo (30 min)

```bash
make retro    # O que funcionou? O que nao? (3 perguntas)
make plan     # Planejar proxima semana com @meta
```

### Qualquer Dia

```bash
make review   # Revisar flashcards (SRS) — ideal 3x/semana
make status   # Ver streak e progresso
```

### Checklist Semanal

- [ ] **Retrospectiva feita** (`make retro`)
- [ ] **Plano da semana criado** (`make plan`)
- [ ] **Streak mantido** — 7 dias seguidos? (`make status`)
- [ ] **SRS revisado** — minimo 3x na semana (`make review`)
- [ ] **Projetos avancando** — algum projeto pratico em andamento?

---

## 5. Validação Pós-Sessão

Confirme antes de sair:

- [ ] **Log preenchido**
  ```bash
  # Verifique: projects/[modulo]/logs/daily/YYYY-MM-DD.md
  # Deve conter: Objetivo, Notas, Aprendizados
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
  make review
  # Adicione ao SRS o que nao dominou 100%
  ```

---

## 6. Referencia de Comandos (18)

### Sessão Diária

| Comando | Descricao |
|---------|-----------|
| `make start` | Inicia sessao + quiz automatico |
| `make study` | Loop interativo (code/drill/feynman/scaffold + 8 opcoes) |
| `make end` | Encerra, salva log, atualiza streak |

### Modulos

| Comando | Descricao |
|---------|-----------|
| `make module` | Criar novo modulo |
| `make switch` | Alternar modulo ativo |
| `make plan` | Planejar semana com @meta |
| `make resources` | Mapear recursos para o modulo |

### Revisao

| Comando | Descricao |
|---------|-----------|
| `make review` | Spaced repetition (SRS) |
| `make retro` | Retrospectiva semanal (3 perguntas) |
| `make break` | Pausa de 15 min para modo difuso (Oakley) |
| `make drill-extra` | Overlearning: 5 variacoes de drill (Oakley) |

### Utilitarios

| Comando | Descricao |
|---------|-----------|
| `make status` | Ver streak e info do modulo |
| `make analytics` | Ver analytics avancados (tempo, foco, tecnicas) |
| `make help` | Lista todos os comandos |
| `make setup` | Configuração inicial |
| `make backup` | Backup dos dados |
| `make archive` | Arquivar projeto finalizado |

---

## 7. Keywords e Agentes

O sistema tem 4 agentes AI que respondem a keywords especificas.

### @tutor — Mentor de Estudo

O agente principal durante `make study`. Carrega skills on-demand — incluindo a skill `session` para orquestração de início/fim de sessão.

| Keyword                 | Quando Usar                                            |
| ----------------------- | ------------------------------------------------------ |
| `#start`                | Inicia sessão com contexto do plano — sugere keyword   |
| `#end`                  | Consolida sessão — gera reflexão + texto para `make end` |
| `#plan`                 | Consulta progresso das entregas da semana              |
| `#explain [conceito]`   | Conceito completamente novo — introducao com analogias |
| `#feynman [conceito]`   | Voce acha que entendeu — teste explicando              |
| `#drill [skill]`        | Praticar procedimento 5-10x ate automatizar            |
| `#quiz N [topico]`      | Retrieval practice rapido — 3-5 perguntas              |
| `#srs-generator`        | Criar flashcards dinamicamente (individual ou batch)   |
| `#directness [desafio]` | Construir projeto pratico real                         |
| `#scaffold [projeto]`   | Gerar estrutura/boilerplate de projeto                 |
| `#intuition [conceito]` | Entender o "por que" profundo                          |
| `#debug`                | Bug dificil — guia socratico (nunca da a resposta)     |
| `#feedback`             | Revisar e avaliar codigo escrito                       |
| `#experiment`           | Comparar 3 solucoes diferentes                         |
| `#zombie`               | Nao consegue comecar — Two-Minute Rule                 |
| `#diffuse`              | Travou no problema — modo difuso                       |

### @meta — Planejamento Estrategico

Usado em `make plan` e para decomposicao de objetivos.

| Keyword | Quando Usar |
|---------|-------------|
| `#decompose-goal [objetivo]` | Decompor objetivo em plano acionavel |
| `#benchmark-test` | Criar teste de proficiencia mensuravel |
| `#map-resources [topico]` | Curar recursos em 3 tiers |
| `#create-weekly-plan semana N` | Gerar plano semanal |
| `#update-plan semana [N]` | Registrar progresso |
| `#adjust-plan [situação]` | Reajustar cronograma |
| `#habit-stack` | Criar cadeia de habitos |

### @review — Consultor Estrategico

Analisa o framework e sugere melhorias. Uso esporadico.

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
│ x VOU ENCERRAR SEM LOGAR O QUE APRENDI                       │
│   make end = streak + memoria consolidada                    │
│   Nao logar = esquece 40% em 24h                             │
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
./scripts/streak.sh reset  # Resetar stats
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
make start -> make study -> make end

POS-SESSAO:
[ ] Log salvo | [ ] Streak ok | [ ] Proxima marcada
[ ] Dificeis no SRS

SE TRAVAR: make break
SE NAO CONSEGUIR COMECAR: #zombie
SE NAO SABE O QUE FAZER: opcao 0 (Session)

SEMANAL (domingo):
make retro + make plan
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
