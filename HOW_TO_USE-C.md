# Como Usar o Ultralearning System

> Guia completo para estudar com o framework. Do primeiro `make setup` ao dominio de CS Fundamentals.

**Ultima atualizacao**: 2026-03-02

---

## Indice

- [1. Quick Start (Primeira Vez)](#1-quick-start-primeira-vez)
- [2. Checklist Pre-Sessao](#2-checklist-pre-sessao)
- [3. Rotina Diaria (1 hora)](#3-rotina-diaria-1-hora)
- [4. Rotina Semanal](#4-rotina-semanal)
- [5. Validacao Pos-Sessao](#5-validacao-pos-sessao)
- [6. Referencia de Comandos (17)](#6-referencia-de-comandos-17)
- [7. Keywords e Agentes](#7-keywords-e-agentes)
- [8. Armadilhas Comuns e Dicas](#8-armadilhas-comuns-e-dicas)
- [9. Troubleshooting](#9-troubleshooting)
- [10. Checklist Imprimivel](#10-checklist-imprimivel)

---

## 1. Quick Start (Primeira Vez)

3 comandos para comecar. 5 minutos de setup, 1 hora de estudo.

```bash
# 1. Configuracao inicial (1x so)
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

## 2. Checklist Pre-Sessao

> 2 minutos de preparacao = sessao 3x mais produtiva.

### Verificacao de Ambiente

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
- [ ] **Duracao definida**: Quanto tempo vou estudar? (recomendado: 1h)
- [ ] **Distracoes eliminadas**:
  - [ ] Celular no modo Nao Perturbe
  - [ ] Notificacoes desligadas
  - [ ] Abas irrelevantes fechadas
- [ ] **Materiais prontos**:
  - [ ] Cafe/agua a mao
  - [ ] Caderno/digital para anotacoes rapidas

### Auto-Avaliacao de Readiness

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
│  0. Session (@session) -> Sugestao baseada no plano           │
│  1. Code (#directness) -> Projeto pratico                     │
│  2. Drill (#drill) -> Repeticao de procedimentos              │
│  3. Feynman (#feynman) -> Explicar conceito                   │
│  4. Scaffold (#scaffold) -> Estrutura base                    │
│  5. Experiment (#experiment) -> Comparar abordagens           │
│  6. Feedback (#feedback) -> Revisar codigo                    │
│  7. Explain (#explain) -> Introducao a conceito novo          │
│  8. Intuition (#intuition) -> Entender o "por que"            │
│  9. Debug (#debug) -> Debug socratico                         │
│  z. Zombie (#zombie) -> Superar procrastinacao                │
│  d. Diffuse (#diffuse) -> Modo difuso (travado)               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 3.1 Start (5 min)

```bash
make start
```

O que acontece:
- `@session` carrega o plano semanal e sugere atividade
- Quiz automatico testa o que voce estudou ontem (3 perguntas)
- Ativa memoria antes de aprender conteudo novo

### 3.2 Study (50 min)

```bash
make study
```

Escolha baseado no que precisa. Skills sao carregadas automaticamente:

| Situacao | Opcao | Skill | Por que |
|----------|-------|-------|---------|
| Nao sabe o que fazer hoje | 0. Session | — | @session le o plano e sugere |
| Conceito completamente novo | 7. Explain | `explain-concept` | Analogia primeiro |
| Aprender fazendo | 1. Code | `directness` | Projeto real |
| Praticar sintaxe/procedimento | 2. Drill | `drill` | Repeticao = automatizacao |
| Revisar conceito | 3. Feynman | `feynman` | Se nao explica, nao entendeu |
| Comecar projeto novo | 4. Scaffold | `scaffold` | Estrutura pronta |
| Comparar abordagens | 5. Experiment | — (inline) | Testar 3 solucoes |
| Revisar codigo | 6. Feedback | — (inline) | Code review |
| Entender o "por que" | 8. Intuition | — (inline) | Profundidade |
| Bug dificil | 9. Debug | `debug-socratic` | Guia socratico |
| Sem vontade de estudar | z. Zombie | `zombie-mode` | Two-Minute Rule |
| Travado ha >30min | d. Diffuse | — (inline) | Deixar cerebro processar |

**Dica**: Se e sua primeira sessao no modulo, comece pela opcao **0 (Session)** — o @session vai ler seu plano semanal e sugerir a melhor atividade.

### 3.3 End (5 min)

```bash
make end
```

O que acontece:
- `@session` consolida a sessao com reflexao estruturada
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

## 5. Validacao Pos-Sessao

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

## 6. Referencia de Comandos (17)

### Sessao Diaria

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
| `make help` | Lista todos os comandos |
| `make setup` | Configuracao inicial |
| `make backup` | Backup dos dados |
| `make archive` | Arquivar projeto finalizado |

---

## 7. Keywords e Agentes

Aprenda os agentes e keywords progressivamente — nao tente decorar tudo de uma vez. Esta secao conta a historia de como voce vai usar o sistema, do primeiro dia ao dominio completo.

---

### Seu Primeiro Dia

Voce acabou de rodar `make setup` e `make module`. Nao conhece o sistema, nao sabe quais keywords usar. Normal. Comece com estas 2:

**Cenario**: Voce quer aprender sobre linked lists. Nunca viu o assunto.

```bash
make start
# @session roda automaticamente, faz 3 perguntas de quiz
# Como e dia 1, provavelmente nao sabe responder — tudo bem

make study
# Escolha opcao 7 (Explain)
```

O `#explain` introduz o conceito com analogia ("imagine uma corrente de elos...") e exemplos minimos. Voce so escuta e pergunta. Quando achar que entendeu:

```bash
make study
# Escolha opcao 2 (Drill)
```

O `#drill` gera 5-10 exercicios de linked list com dificuldade crescente. Voce pratica ate automatizar as operacoes basicas (insert, delete, traverse).

```bash
make end
# @session consolida: "O que aprendeu?", "O que foi dificil?"
```

**Keywords usadas no Dia 1**: `#explain`, `#drill`
**Agentes envolvidos**: `@session` (automatico), `@tutor` (via make study)

---

### Criando Flashcards

Apos cada sessao, voce pode criar flashcards para revisao futura (SRS). O sistema tem duas formas:

**Modo Individual** — crie um card por vez:

```bash
#srs-generator
```

O agente detecta o contexto atual e sugere conceitos. Voce escolhe, o card e gerado e adicionado ao SRS.

**Modo Batch** — crie multiplos cards de uma vez:

```bash
#srs-generator batch
```

O agente lista 5-10 conceitos do tema atual. Voce escolhe (ex: "1-7" ou "todos") e todos sao criados de uma vez.

**Quando usar**:
- Apos identificar gaps com `#feynman`
- Durante pratica com `#drill` (erros recorrentes)
- Ao final de uma sessao de estudo

**Keywords adicionadas**: `#srs-generator`

---

### Sua Primeira Semana

Apos 3-4 sessoes, voce ja tem conceitos acumulados. E hora de testar se realmente entendeu.

**Cenario**: Quarta-feira, dia 4. Voce estudou linked lists, stacks e queues. Sera que entendeu de verdade?

```bash
make start
# Quiz automatico testa o que estudou ontem — tenta responder de cabeca

make study
# Escolha opcao 3 (Feynman)
```

O `#feynman` pede que voce explique stacks como para uma crianca de 12 anos. Voce fala, o agente identifica gaps: "Voce disse que 'empilha', mas nao explicou *por que* LIFO e util — tente de novo com um exemplo pratico."

Depois, teste com quiz rapido:

```bash
make study
# Escolha opcao 2 (Drill) ou use quiz diretamente:
# opencode run --agent @tutor "#quiz 5 data structures"
```

**No domingo**, faca a retrospectiva:

```bash
make retro    # "O que funcionou? O que nao? O que mudar?"
make plan     # @meta cria plano para semana 2
```

**Keywords adicionadas na Semana 1**: `#feynman`, `#quiz`
**Agente novo**: `@meta` (via make plan/retro)

---

### Quando Voce Trava

Vai acontecer. Pode ser no dia 5 ou no dia 50. Existem 3 tipos de "travado" e cada um tem solucao diferente:

#### Tipo 1: "Nao consigo comecar"

Voce senta na frente do computador e... nada. Procrastinacao pura.

```bash
opencode run --agent @tutor "#zombie"
```

O `#zombie` usa a Two-Minute Rule: identifica a menor acao possivel. "Abra o arquivo main.go e leia a primeira funcao." So isso. O momentum cuida do resto — em 5 min voce ja esta codando.

#### Tipo 2: "Travei num bug ha 40 min"

Voce esta tentando resolver algo e nao sai do lugar.

```bash
make study
# Escolha opcao 9 (Debug)
```

O `#debug` socratico NUNCA da a resposta. Ele pergunta: "O que voce esperava que acontecesse?", "Em qual linha o comportamento muda?", "Se remover essa parte, funciona?". Voce encontra o bug sozinho — e aprende o *processo* de debug.

#### Tipo 3: "Travei no conceito ha 30+ min"

Nao e bug, e bloqueiro mental. Voce nao consegue entender a ideia.

```bash
make break    # 15 min de pausa estruturada
```

Ou diretamente:

```bash
opencode run --agent @tutor "#diffuse"
```

O modo difuso (Oakley) sugere pausa real: caminhar, alongar, ouvir musica. O cerebro continua processando inconscientemente. Quando voce voltar, o agente recontextualiza o problema de outro angulo.

**Keywords adicionadas**: `#zombie`, `#debug`, `#diffuse`

---

### Planejamento e Estrategia

Apos 2-3 semanas, voce quer pensar maior. Nao sessao por sessao, mas *objetivo por objetivo*.

**Cenario**: Voce quer dominar Go concurrency em 6 semanas.

```bash
opencode run --agent @meta "#decompose-goal Dominar Go concurrency em 6 semanas"
```

O `@meta` com `#decompose-goal` gera um plano completo:
- Semana 1: Goroutines basics
- Semana 2: Channels e select
- Semana 3: Sync primitives (Mutex, WaitGroup)
- Semana 4: Patterns (fan-in, fan-out, pipeline)
- Semana 5: Projeto pratico integrador
- Semana 6: Benchmark test + revisao

Cada semana vira um plano detalhado:

```bash
opencode run --agent @meta "#create-weekly-plan semana 1"
```

Quando algo muda (ficou doente, viajou):

```bash
opencode run --agent @meta "#adjust-plan perdi 3 dias por doenca"
```

O plano se reajusta sem voce perder o fio da meada.

**Keywords adicionadas**: `#decompose-goal`, `#create-weekly-plan`, `#adjust-plan`
**Agente principal**: `@meta`

---

### Construindo Projetos Reais

Voce ja sabe a teoria. Agora precisa *aplicar*. Nao tutoriais — projetos de verdade.

**Cenario**: Voce quer implementar um HTTP server do zero em Go.

```bash
make study
# Escolha opcao 4 (Scaffold)
```

O `#scaffold` cria a estrutura do projeto: pastas, arquivos base, boilerplate. Voce nao perde tempo com infraestrutura.

Depois:

```bash
make study
# Escolha opcao 1 (Code / Directness)
```

O `#directness` guia a construcao real. Ele faz perguntas, nao da respostas: "Qual struct voce precisa para representar um request?", "Como voce parsearia os headers?". Voce escreve cada linha.

Quando quiser comparar abordagens:

```bash
make study
# Escolha opcao 5 (Experiment)
```

O `#experiment` propoe 3 solucoes diferentes para o mesmo problema e analisa tradeoffs.

**Keywords adicionadas**: `#scaffold`, `#directness`, `#experiment`

---

### Referencia Rapida — Todos os Agentes

Para consulta quando precisar. Nao tente decorar — use quando a situacao pedir.

| Agente | Papel | Keywords Principais |
|--------|-------|--------------------|
| **@tutor** | Mentor de estudo (via `make study`) | `#explain`, `#feynman`, `#drill`, `#quiz`, `#srs-generator`, `#directness`, `#scaffold`, `#intuition`, `#debug`, `#feedback`, `#experiment`, `#zombie`, `#diffuse`, `#wrap-up` |
| **@meta** | Planejamento estrategico (via `make plan`) | `#decompose-goal`, `#benchmark-test`, `#map-resources`, `#create-weekly-plan`, `#update-plan`, `#adjust-plan`, `#habit-stack` |
| **@session** | Orquestrador de sessoes (automatico) | `#start`, `#end`, `#plan` |
| **@review** | Consultor do framework (manutencao) | `#review-structure`, `#review-scripts`, `#review-docs`, `#review-makefile`, `#review-agents`, `#review-consistency`, `#review-architecture`, `#review-costs`, `#audit-quality`, `#check-readiness`, `#meta-review` |
| **@run** | Executor de comandos (atalho) | `#run [comando]` |

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
5. **Mantenha o streak**: A gamificacao funciona — `make status` para acompanhar

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

## Proximos Passos

Apos dominar a rotina basica:

1. **Aprofunde nos principios**: Explore os [9 principios](guides/principios/) do Ultralearning
2. **Domine as tecnicas**: Consulte o [indice de tecnicas](guides/indice.md) (23 tecnicas)
3. **Planeje com estrategia**: Use `@meta` com `#decompose-goal` para quebrar objetivos grandes
4. **Acompanhe o progresso**: Consulte o [master learning map](projects/shared/master-learning-map.md)

---

*Feito para aprender melhor. Comece agora com `make setup`.*
