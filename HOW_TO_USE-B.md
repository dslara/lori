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

Referencia completa dos 5 agentes AI com exemplos de invocacao para cada keyword.

---

### @tutor — Mentor de Estudo

O agente principal durante `make study`. Carrega skills on-demand baseado na keyword usada.

**Como invocar**: via `make study` (menu interativo) ou diretamente:

```bash
opencode run --agent @tutor "#keyword argumento"
```

#### `#explain [conceito]`

Introduz conceito completamente novo com analogias e exemplos minimos.

```bash
opencode run --agent @tutor "#explain binary search trees"
```

> Resultado: Explicacao progressiva com analogia do mundo real, seguida de exemplo minimo em codigo. O agente pergunta se voce entendeu antes de avancar.

#### `#feynman [conceito]`

Valida compreensao profunda — voce explica, o agente avalia.

```bash
opencode run --agent @tutor "#feynman recursion"
```

> Resultado: O agente pede que voce explique o conceito como para uma crianca de 12 anos. Identifica gaps e pede que voce re-explique as partes fracas.

#### `#drill [skill]`

Pratica deliberada — repete procedimento 5-10x com variacoes crescentes.

```bash
opencode run --agent @tutor "#drill linked list reversal"
```

> Resultado: Gera 5-10 exercicios do mesmo tipo com dificuldade incremental. Avalia cada tentativa e da feedback imediato.

#### `#quiz N [topico]`

Retrieval practice rapido — 3-5 perguntas para recuperar da memoria sem consultar.

```bash
opencode run --agent @tutor "#quiz 5 sorting algorithms"
```

> Resultado: 5 perguntas de recall ativo. Nao mostra respostas ate voce tentar. Pontua e indica o que precisa revisar.

#### `#directness [desafio]`

Aprender fazendo — construir projeto pratico real, nao tutorial isolado.

```bash
opencode run --agent @tutor "#directness implement a HTTP server from scratch"
```

> Resultado: Guia socratico que orienta a construcao passo-a-passo, fazendo perguntas em vez de dar respostas prontas. Voce escreve o codigo.

#### `#scaffold [projeto]`

Cria estrutura/boilerplate de projeto para voce focar no conceito, nao na infraestrutura.

```bash
opencode run --agent @tutor "#scaffold CLI tool in Go with cobra"
```

> Resultado: Gera estrutura de pastas, arquivos base e boilerplate. Voce foca na logica do negocio.

#### `#intuition [conceito]`

Entender o "por que" profundo de um conceito — construir intuicao.

```bash
opencode run --agent @tutor "#intuition why hash tables are O(1)"
```

> Resultado: Exploracoes progressivas que constroem entendimento intuitivo, nao apenas mecanico.

#### `#debug`

Bug dificil — guia socratico. NUNCA da a solucao diretamente, faz perguntas que levam a resposta.

```bash
opencode run --agent @tutor "#debug"
```

> Resultado: Serie de perguntas diagnosticas: "O que voce esperava?", "O que aconteceu?", "Onde funciona e onde quebra?". Voce encontra o bug.

#### `#feedback`

Code review do seu codigo — avalia qualidade e sugere melhorias.

```bash
opencode run --agent @tutor "#feedback"
```

> Resultado: Analise do codigo atual com sugestoes de melhoria em legibilidade, performance e boas praticas.

#### `#experiment`

Comparar 3 abordagens diferentes para o mesmo problema.

```bash
opencode run --agent @tutor "#experiment"
```

> Resultado: Propoe 3 solucoes alternativas, analisa tradeoffs de cada uma, e voce escolhe qual implementar.

#### `#zombie`

Nao consegue comecar — ativa Two-Minute Rule para superar procrastinacao.

```bash
opencode run --agent @tutor "#zombie"
```

> Resultado: Identifica o menor passo possivel (2 min max) para comecar. Ex: "Abra o arquivo X e leia a primeira funcao". Uma vez iniciado, o momentum leva voce adiante.

#### `#diffuse`

Travou no problema ha mais de 30 min — ativa modo difuso (Oakley).

```bash
opencode run --agent @tutor "#diffuse"
```

> Resultado: Sugere pausa estruturada (caminhar, alongar, musica) e recontextualiza o problema de outro angulo quando voce voltar.

#### `#wrap-up`

Consolida sessao antes de `make end` — resume o que foi aprendido.

```bash
opencode run --agent @tutor "#wrap-up"
```

> Resultado: Gera resumo estruturado da sessao: conceitos aprendidos, dificuldades encontradas, proximos passos.

---

### @meta — Planejamento Estrategico

Usado em `make plan` e para decomposicao de objetivos de longo prazo.

**Como invocar**:

```bash
opencode run --agent @meta "#keyword argumento"
```

#### `#decompose-goal [objetivo]`

Decompoe objetivo complexo em plano acionavel com entregas semanais.

```bash
opencode run --agent @meta "#decompose-goal Dominar Go concurrency em 6 semanas"
```

> Resultado: Plano semanal detalhado com entregas especificas, recursos tier 1-3, e criterios de avaliacao por semana.

#### `#benchmark-test`

Cria teste de proficiencia mensuravel para avaliar dominio de um skill.

```bash
opencode run --agent @meta "#benchmark-test"
```

> Resultado: 5-10 desafios praticos que testam proficiencia real, com rubrica de avaliacao (novice/intermediate/advanced).

#### `#map-resources [topico]`

Curar recursos em 3 tiers: essencial, complementar e avancado.

```bash
opencode run --agent @meta "#map-resources Zig memory management"
```

> Resultado: Lista categorizada de recursos (docs, videos, repos) organizados por prioridade.

#### `#create-weekly-plan semana N`

Gera plano semanal baseado no objetivo decomposto.

```bash
opencode run --agent @meta "#create-weekly-plan semana 3"
```

> Resultado: Plano com 5-7 sessoes detalhadas, cada uma com objetivo, tecnica sugerida e entrega esperada.

#### `#update-plan semana [N]`

Registra progresso real vs planejado na semana.

```bash
opencode run --agent @meta "#update-plan semana 3"
```

> Resultado: Comparacao do planejado vs executado, calculo de velocity, e ajustes sugeridos.

#### `#adjust-plan [situacao]`

Reajusta cronograma quando algo muda (doenca, viagem, dificuldade extra).

```bash
opencode run --agent @meta "#adjust-plan perdi 3 dias por doenca"
```

> Resultado: Plano redistribuido com prioridades reordenadas para compensar o tempo perdido.

#### `#habit-stack`

Cria cadeia de habitos conectando estudo a habitos existentes.

```bash
opencode run --agent @meta "#habit-stack"
```

> Resultado: Sequencia de habitos ancorados em rotinas existentes (ex: "Depois do cafe, abro o terminal e rodo make start").

---

### @session — Orquestrador de Sessoes

Invocado automaticamente por `make start` e `make end`. Orquestra o fluxo da sessao.

**Invocacao**: automatica via `make start`/`make end`, ou manual:

```bash
opencode run --agent @session "#keyword"
```

#### `#start`

Inicia sessao com contexto do plano semanal — sugere keyword do @tutor.

```bash
# Invocado automaticamente por: make start
opencode run "@session "#start"
```

> Resultado: Le o plano semanal, verifica onde voce parou, sugere a proxima atividade com a keyword ideal (ex: "Sugiro #drill binary search — voce precisa praticar mais antes de avancar").

#### `#end`

Consolida sessao — gera reflexao estruturada.

```bash
# Invocado automaticamente por: make end
opencode run "@session "#end"
```

> Resultado: Perguntas de reflexao ("O que aprendeu?", "O que foi dificil?"), gera texto de log e atualiza contexto para proxima sessao.

#### `#plan`

Consulta progresso das entregas da semana.

```bash
opencode run "@session "#plan"
```

> Resultado: Status de cada entrega semanal (done/in-progress/blocked) e sugestao do que priorizar hoje.

---

### @review — Consultor Estrategico

Analisa o framework e sugere melhorias. Uso esporadico — para manutencao do sistema, nao estudo diario.

**Como invocar**:

```bash
opencode run --agent @review "#keyword"
```

#### `#review-structure`

Analisa organizacao de pastas e arquivos.

```bash
opencode run --agent @review "#review-structure"
```

> Resultado: Relatorio de consistencia da arvore de diretorios, arquivos orfaos, e sugestoes de reorganizacao.

#### `#review-scripts`

Avalia qualidade dos scripts bash.

```bash
opencode run --agent @review "#review-scripts"
```

> Resultado: Analise de cada script: error handling, portabilidade, documentacao, e sugestoes de melhoria.

#### `#review-docs`

Verifica coerencia da documentacao.

```bash
opencode run --agent @review "#review-docs"
```

> Resultado: Links quebrados, informacoes desatualizadas, duplicacoes, e inconsistencias encontradas.

#### `#review-makefile`

Revisa orquestracao de comandos no Makefile.

```bash
opencode run --agent @review "#review-makefile"
```

> Resultado: Analise de targets, dependencias, e sugestoes de otimizacao.

#### `#review-agents`

Analisa efetividade dos agentes AI.

```bash
opencode run --agent @review "#review-agents"
```

> Resultado: Avaliacao de cada agente: clareza dos prompts, cobertura de skills, e gaps identificados.

#### `#review-consistency`

Verifica consistencia geral do sistema.

```bash
opencode run --agent @review "#review-consistency"
```

> Resultado: Cross-check entre README, scripts, agents e docs — identifica divergencias.

#### `#review-architecture`

Analise arquitetural profunda do framework.

```bash
opencode run --agent @review "#review-architecture"
```

> Resultado: Avaliacao de design decisions, acoplamento, e sugestoes de evolucao.

#### `#review-costs`

Auditoria de otimizacao de tokens e custos.

```bash
opencode run --agent @review "#review-costs"
```

> Resultado: Mapa de consumo de tokens por agente/skill, e sugestoes para reduzir custo.

#### `#audit-quality`

Auditoria completa — executa todas as reviews acima.

```bash
opencode run --agent @review "#audit-quality"
```

> Resultado: Relatorio unificado com todas as analises, score geral do sistema, e lista priorizada de melhorias.

#### `#check-readiness [versao]`

Avalia prontidao para release de uma versao.

```bash
opencode run --agent @review "#check-readiness v3.2.0"
```

> Resultado: Checklist de release (docs atualizados, CHANGELOG, testes, consistencia) com status go/no-go.

#### `#meta-review [arquivo]`

Revisa documento gerado pelo proprio @review (meta-analise).

```bash
opencode run --agent @review "#meta-review reviews/audit-quality-2026-03-02-v3.1.0.md"
```

> Resultado: Avaliacao da qualidade da auditoria: profundidade, cobertura, e pontos cegos.

---

### @run — Executor de Comandos

Roda scripts do Makefile sem sair do chat. Util para executar comandos durante uma conversa.

**Como invocar**:

```bash
opencode run --agent @run "#run comando"
```

#### `#run [comando]`

Executa `make [comando]` no terminal e retorna o resultado.

```bash
opencode run --agent @run "#run status"
# Equivale a: make status
```

> Resultado: Output do comando executado. Util para verificar streak, trocar modulo, ou rodar review sem sair da conversa.

Exemplos comuns:

```bash
opencode run --agent @run "#run status"       # Ver streak
opencode run --agent @run "#run review"       # Rodar SRS
opencode run --agent @run "#run switch"       # Trocar modulo
opencode run --agent @run "#run backup"       # Fazer backup
```

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
