# Por que Sem `@meta` e `@tutor`

> Analise do que esses agentes faziam, por que Pi nativo absorve tudo, e o que muda na dinamica.

---

## 1. O que `@meta` fazia

Leitura do agente antigo:

- **Perfil de aprendizado:** estilo visual, periodo produtivo, recursos ja tentados
- **Metacognicao:** perguntas sobre "o que voce acha que nao entendeu?"
- **Estrategia:** sugere tecnicas de estudo baseado em contexto
- **Avaliacao:** "qual nivel de confianca?", "como voce se sentiu?"
- **Planejamento:** decompoe objetivos, sugere cronograma
- **Recursos:** gerencia lista de recursos curados
- **Reflexao:** guia retrospectivas

**Funcao central:** Era um **orquestrador** que *olhava* para o sistema e *decidia* o que o aluno deveria fazer.

## 2. O que `@tutor` fazia

Leitura do agente antigo:

- **Apoio conceitual:** explica quando aluno erra
- **Socratico:** 5 perguntas para guiar descoberta
- **Feynman:** pede para explicar em termos simples
- **Testar compreensao:** quiz, verificacao
- **Recomendar exercicios:** baseado em gaps
- **Diagnostico de erros:** identifica conceito subjacente
- **Recursos:** sugere material especifico para gap

**Funcao central:** Era um **especialista pedagogico** que *interagia* com o aluno durante o aprendizado.

## 3. Por que Pi nativo substitui ambos

### 3.1 Contexto Automatico elimina necessidade de orquestrador

**Antes:** `@meta` precisava existir porque o sistema nao "sabia" nada. O LLM que rodava como `@meta` tinha que **ler** CSVs e **decidir** o que fazer.

```
Usuario: "estudar"
@meta: "Deixa eu ver... qual modulo? Qual tecnica? Streak? Pontos fracos?"
        *le CSVs* *analisa* *sugere*
```

**Agora:** `before_agent_start` **injeta** estado automaticamente. O LLM principal ja sabe:

```
[ul-context injetado]
Modulo ativo: rust-async
Streak: 12
Pontos fracos: closure, async pinning
Proximo foco: lifetime elision
```

O proprio LLM principal (que o usuario ja esta conversando) **já tem contexto suficiente** para orquestrar. Nao precisa de agente separado para isso.

### 3.2 Skills substituem especialista pedagogico

**Antes:** `@tutor` tinha que saber Feynman, Socratico, Drill, Quiz, etc. Era um agente "sabe-tudo" pedagogico.

**Agora:** Cada tecnica e uma **skill separada**:

| Tecnica | Era `@tutor` | Agora |
|---------|-------------|-------|
| Explicar conceito | Agente inteiro responde | LLM principal + contexto |
| Perguntas socraticas | Regra do tutor | `ul-debug-socratic` skill |
| Feynman | Pedido do tutor | `ul-feynman` skill |
| Quiz adaptativo | Tutor decide perguntas | `ul-retrieval` skill |
| Recomendar exercicio | Tutor analisa gaps | `ul-drill` skill + eventos |
| Diagnostico de erro | Tutor investiga | `ul-debug-socratic` + events |

**Diferenca chave:** Skills sao **rituais explicitos**, nao comportamento implicito de agente.

- Antes: usuario nao sabia quando tutor ia usar Feynman ou socratico
- Agora: usuario **escolhe** `/skill:ul-feynman` ou e **guiado** pelo ciclo

### 3.3 Event sourcing substitui memoria de agente

**Antes:** `@meta` e `@tutor` precisavam de OpenViking (`memcommit`, `memread`) para "lembrar" entre sessoes.

**Agora:** Eventos em `state.jsonl` + sessionManager entries. Qualquer sessao Pi reconstrói estado completo em `session_start`. Nao existe "memoria de agente" — existe **estado do sistema**.

### 3.4 Compaction customizado substitui sumario de agente

**Antes:** `@meta` gerava sumario de sessao e salvava em OpenViking.

**Agora:** `session_before_compact` gera resumo UL-aware automaticamente. O proprio Pi mantem contexto de estudo entre turnos.

---

## 4. O que mudou na dinamica

### 4.1 De "conversar com agente" para "usar sistema"

**Antes:**
```
Usuario: @meta, o que faco hoje?
@meta: Sugiro drill em lifetime elision.
Usuario: @tutor, explique lifetime elision.
@tutor: [explicacao]
Usuario: @tutor, me teste.
@tutor: [quiz]
```

Conversas com **personas diferentes**. Usuario precisa saber quem chamar para quê.

**Agora:**
```
Usuario: /ul-start
Pi: [injetou contexto] Boa! Streak 12. Foco de hoje: lifetime elision.
    Tecnica sugerida: drill. Timer 50min. Ready?
Usuario: sim
[skill:ul-pomodoro inicia]
[skill:ul-drill apresenta exercicio]
Usuario: nao consigo
Pi: [detecta stuck] Pausa de 15min. Depois /skill:ul-debug-socratic.
```

Um **único interlocutor** (o LLM principal do Pi) guiado pelo sistema. Nao precisa saber que existe "tutor" ou "meta". O sistema é transparente.

### 4.2 De implicito para explicito

**Antes:**
- Quando `@tutor` usa Feynman? Quando agente decide.
- Quando `@meta` faz retrospectiva? Quando usuario lembra de chamar.
- Qual tecnica usar? Tutor decide baseado em heuristica opaca.

**Agora:**
- Rituais são **explicitos** e **escolhidos** pelo usuario ou pelo ciclo.
- `/skill:ul-feynman` = "agora vou validar compreensao"
- `/ul-start` → ciclo sugere → usuario confirma ou muda.
- **Transparencia:** usuario sabe o que está acontecendo e por que.

### 4.3 De "memoria de agente" para "estado do sistema"

**Antes:**
- `@meta` lembrava preferencias porque tinha acesso a OpenViking.
- `@tutor` lembrava ultimo exercicio porque tinha memoria de curto prazo.
- Se agente reiniciasse, perdia contexto.

**Agora:**
- Estado vive em `state.jsonl` e sessionManager entries.
- LLM principal reconstrói contexto a cada `session_start`.
- Nao depende de "memoria" do agente. Depende de **dados**.

### 4.4 De especialista monolitico para composicao de skills

**Antes:** `@tutor` era um agente que tinha que saber **tudo**: Feynman, socratico, quiz, recomendacao, diagnostico. Prompt gigante. Comportamento inconsistente.

**Agora:**
- `ul-feynman` so sabe Feynman. Faz isso perfeitamente.
- `ul-debug-socratic` so sabe debugar com perguntas. Foca nisso.
- `ul-drill` so sabe progressao de exercicios.
- LLM principal **compoe** skills conforme necessidade.

**Vantagem:** cada skill é pequena, testavel, melhoravel independente. Nao existe "tutor geral" que faz tudo medianamente.

---

## 5. O que se perde sem agentes

| Aspecto | Com agentes | Sem agentes (Pi nativo) |
|---------|-------------|------------------------|
| **Personalidade** | `@tutor` tinha tom (encorajador, socratico) | LLM principal usa tom default. Pode ser menos "caloroso". |
| **Isolamento** | Erro em `@tutor` nao afetava `@meta` | Erro na extension afeta tudo. Mas extension é codigo, nao prompt. |
| **Prompt especializado** | Cada agente tinha prompt proprio longo | Skills tem prompts curtos e focados. Contexto vem de injecao. |
| **Descoberta** | Usuario podia "conversar" com tutor livremente | Usuario precisa usar comandos/skills explicitos. Menos "magico". |

### 5.1 Personalidade: ganho ou perda?

**Argumento contra agentes:** personalidade de `@tutor` era artificial. O LLM por tras era o mesmo modelo. O "tom encorajador" era so instrucao no prompt. Nao era genuino.

**Argumento a favor:** instrucao no prompt funciona. Um sistema sem persona pode parecer frio.

**Solucao na nova arquitetura:** prompt templates (`pre-session.md`, `post-session.md`) **podem** incluir tom encorajador. A diferenca: tom é **contexto injetado**, nao "persona de agente".

```markdown
# pre-session.md
Voce é um guia de aprendizado. Tom: encorajador, direto, sem fluff.
Nunca diga "voce consegue!" vazio. Diga "Ontem voce resolveu X, hoje é Y."
```

Nao é `@tutor`. É **instrucao de contexto** para o LLM principal.

### 5.2 Descoberta: ganho ou perda?

**Com `@tutor`:** usuario podia perguntar qualquer coixa e tutor improvisava.

**Sem:** usuario precisa saber `/skill:ul-feynman` ou `/ul-start`.

**Contra-argumento:** "descoberta livre" com `@tutor` era ilusao. Tutor seguia regras do prompt. Se usuario perguntasse algo fora do escopo, tutor alucinava ou recusava. Skills explicitas são **honestas** sobre o que o sistema faz.

Além disso: `before_agent_start` **sugere** automaticamente. Usuario nao precisa lembrar comandos.

```
Usuario: "quero estudar"
Pi: "Módulo ativo: rust-async. Sugestão: drill em lifetime elision.
    Comandos: /ul-start, /skill:ul-feynman, /skill:ul-drill"
```

---

## 6. Analogia tecnica

**Arquitetura antiga:** Microservicos com banco compartilhado.
- `@meta` = servico de orquestracao
- `@tutor` = servico de dominio
- OpenViking = banco de dados
- CSVs = logs

**Arquitetura nova:** Monolito stateful com event sourcing.
- Extension = nucleo orquestrador
- Skills = use cases
- state.jsonl = event store
- sessionManager = cache de contexto

Microservicos faziam sentido quando Pi nao tinha eventos nem contexto injetado. Agora Pi **é** a plataforma. Adicionar agentes em cima é indirecao desnecessaria.

---

## 7. Quando agentes ainda fariam sentido

| Cenario | Solucao |
|---------|---------|
| Multi-modelo (LLM barato para orquestracao, caro para ensino) | `@meta` com modelo leve, LLM principal como tutor. Mas Pi nao suporta multi-modelo por sessao. |
| Tutor especializado por dominio (Rust vs ML vs Sistemas Distribuidos) | Skills ja resolvem. `ul-rust-expert` vs `ul-ml-expert` como skills separadas. |
| Agente autonomo que inicia sessoes sozinho | Extension com timer pode notificar. Mas iniciar sessao requer usuario. |
| Escalabilidade: milhares de alunos | Fora de escopo. Sistema é individual. |

**Conclusao:** para caso de uso individual de ultralearning dentro do Pi, agentes sao **indirecao sem valor**.

---

## 8. Resumo

| Pergunta | Resposta |
|----------|----------|
| `@meta` sumiu para onde? | Funcao absorvida por `before_agent_start` (contexto automatico) + commands (`/ul-plan`, `/ul-retro`) + event sourcing |
| `@tutor` sumiu para onde? | Funcao absorvida por skills (`ul-feynman`, `ul-drill`, `ul-debug-socratic`, `ul-retrieval`) + LLM principal com contexto injetado |
| Pi fica sobrecarregado? | Nao. Contexto injetado é filtrado (só quando keywords detectadas). Skills são invocadas explicitamente. |
| E se eu quiser conversar "livremente" sobre aprendizado? | Pode. LLM principal tem contexto. Pergunte "por que meu streak quebrou?" e ele responde baseado em eventos. |
| E a personalidade do tutor? | Vai para prompt templates de contexto, nao para persona de agente. |

**Decisao arquitetural:** agentes eram workaround para plataforma que nao tinha estado nativo. Pi agora tem. Workaround eliminado.
