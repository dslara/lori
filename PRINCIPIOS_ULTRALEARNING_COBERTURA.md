# Cobertura dos Princípios e Tecnicas Ultralearning

> Mapeamento honesto: o que Scott Young propoe, o que nossa arquitetura cobre, o que deixa de fora, e por que.

---

## 1. Os 9 Principios do Livro

### 1.1 Metalearning (Aprender Sobre Aprender)

**O que e:** Entender como voce aprende. Mapa do assunto. Benchmarks. Planejamento estrategico.

**Nossa cobertura:**
- ✅ `ul-decomposition` skill: decompoe objetivo em conceitos (40%), fatos (20%), procedimentos (40%)
- ✅ `ul-retro` skill: analisa o que funcionou e o que nao
- ✅ Eventos: `plan_created`, `retro_done` rastreiam estrategia
- ✅ Contexto injetado: LLM sabe historico de tecnicas e resultados

**O que falta:**
- ❌ Mapa visual do assunto (mind map). Pi e TUI, nao tem canvas visual.
- ❌ Benchmarks formais (teste de entrada/saida rigoroso). Temos `benchmark.md`, mas nao e formal.
- ❌ Meta-analise comparativa ("tecnica X funcionou melhor que Y?"). Eventos permitem, mas nao temos dashboard.

**Veredito:** Coberto funcionalmente. Falta visualizacao.

---

### 1.2 Focus (Foco)

**O que e:** Foco profundo. Eliminar distracao. Gerenciar procrastinacao. Flow.

**Nossa cobertura:**
- ✅ `ul-pomodoro` skill: 50/10, protecao de interrupcoes, ritual de preparo
- ✅ `ul-start`/`ul-end`: ritual de inicio e fim que isola sessao
- ✅ Timer widget no TUI: visualizacao constante do tempo restante
- ✅ Status bar: lembra objetivo atual
- ✅ `/ul-stuck`: detecta travamento e sugere pausa (modo difuso)

**O que falta:**
- ❌ Bloqueio de apps/sites (precisaria de integracao OS-level)
- ❌ Metrica objetiva de foco (ex: eye tracking, keypress frequency). Usamos auto-avaliacao 1-10.
- ❌ Musicas/white noise (fora de escopo Pi)

**Veredito:** Coberto para terminal. Foco profundo digital precisa disciplina do usuario.

---

### 1.3 Directness (Diretude)

**O que e:** Aprender fazendo o que voce quer fazer. Nao tutoriais. Projeto real.

**Nossa cobertura:**
- ✅ `ul-directness` skill: projeto real, code review socratico, milestones
- ✅ Agente NUNCA escreve codigo do projeto
- ✅ Agente sugere bibliotecas, nao snippets
- ✅ `drill_completed` evento para milestones

**O que falta:**
- ❌ Nada significativo. Directness e central na arquitetura.

**Veredito:** Totalmente coberto.

---

### 1.4 Drill (Pratica Deliberada)

**O que e:** Isolar componentes fracos. Repetir ate automatizar. Progressao de dificuldade.

**Nossa cobertura:**
- ✅ `ul-drill` skill: 4 niveis de progressao (guiado -> independente -> twist -> entrevista)
- ✅ `weakness_identified` evento: rastreia o que precisa de drill
- ✅ `drill_completed` evento: tentativas e erros
- ✅ Agente adapta: se acerto, aumenta dificuldade

**O que falta:**
- ❌ Repeticao espacada de procedimentos (interleaved practice). Temos SRS para fatos, nao para procedimentos.
- ❌ Time-pressured drills (simulacao de entrevista com timer rigido). Podemos adicionar timer no drill nivel 4.

**Veredito:** Coberto. Interleaved practice poderia ser adicionado.

---

### 1.5 Retrieval (Recuperacao Ativa)

**O que e:** Testar a si mesmo. Nao reler. Active recall.

**Nossa cobertura:**
- ✅ `ul-retrieval` skill: quiz adaptativo, aluno responde SEM olhar material
- ✅ `ul-feynman` skill: explicar sem consulta = forma de retrieval
- ✅ `ul-srs` skill: flashcards = retrieval espacado
- ✅ Quiz pos-sessao (warm-down): 3 perguntas

**O que falta:**
- ❌ Cloze deletion (preencher lacunas em texto). Podemos adicionar como tipo de card SRS.
- ❌ Self-generated questions (aluno cria perguntas). Nao explicitamente incentivado.

**Veredito:** Totalmente coberto. Cloze deletion e bonus.

---

### 1.6 Feedback (Feedback)

**O que e:** Saber se esta certo ou errado. Feedback rapido, frequente, acionavel.

**Nossa cobertura:**
- ✅ `ul-debug-socratic` skill: 5 perguntas levam aluno a propria correcao
- ✅ Code review socratico em `ul-directness`: review sem corrigir
- ✅ `drill_completed` evento: registra erro vs acerto
- ✅ Auto-avaliacao pos-sessao: honestidade forcada

**O que falta:**
- ❌ Feedback de terceiros (outro humano revisando). Fora de escopo.
- ❌ Testes automatizados como feedback (ex: exercicios com test suite). Podemos integrar `cargo test` ou similar.
- ❌ Feedback imediato em tempo real (ex: linter). Agente responde em turnos, nao em milissegundos.

**Veredito:** Coberto para ambiente 1:1 com agente. Feedback de terceiros e externo.

---

### 1.7 Retention (Retencao)

**O que e:** Nao esquecer. Spaced repetition. Mnemonicos. Overlearning.

**Nossa cobertura:**
- ✅ `ul-srs` skill: SM-2 para flashcards
- ✅ `concept_learned` evento: analogias e explicacoes salvas em `concepts.md`
- ✅ Overlearning: `ul-pomodoro` sugere variacao mais dificil se terminar antes
- ✅ Revisao pos-sessao: quiz warm-down consolida

**O que falta:**
- ❌ Mnemonicos explicitos (memory palace, peg system). Nao ensinamos tecnicas mnemonicas.
- ❌ Interleaved review (revisar conceitos de modulos diferentes no mesmo dia). SRS e por modulo.

**Veredito:** Coberto. Mnemonicos sao bonus especializado.

---

### 1.8 Intuition (Intuicao)

**O que e:** Entender profundamente. Nao so memorizar. Conexoes. Analogias. Prova de teoremas.

**Nossa cobertura:**
- ✅ `ul-feynman` skill: exigir analogia do mundo real
- ✅ `concept_learned` evento: armazena analogia
- ✅ `ul-debug-socratic` skill: "o que voce ESPERA que aconteca?" = testar intuicao
- ✅ Agente pede conexoes: "como isso se relaciona com [conceito anterior]?"

**O que falta:**
- ❌ Prova formal (proof-based learning). Nao estruturamos provas matematicas.
- ❌ Visualizacao (diagramas, grafos de conceitos). TUI limita.
- ❌ Fisicalizacao ("sentir" o conceito). Fora de escopo digital.

**Veredito:** Coberto conceitualmente. Visualizacao e fisicalizacao fora de escopo.

---

### 1.9 Experimentation (Experimentacao)

**O que e:** Tentar abordagens diferentes. Explorar. Desafiar regras. Criar.

**Nossa cobertura:**
- ✅ Branching do Pi: `/tree` permite tentar exercicio de formas diferentes
- ✅ `ul-drill` nivel 4: twist e variacoes
- ✅ `ul-directness` skill: projeto real = experimentacao
- ✅ `ul-stuck`: sugerir pausa e abordagem diferente

**O que falta:**
- ❌ Sandbox para experimentacao livre (ex: Jupyter notebook). Terminal ja e sandbox.
- ❌ Desafios opcionais / side quests. Nao estruturamos.

**Veredito:** Coberto. Branching do Pi e perfeito para experimentacao.

---

## 2. Tecnicas Especificas do Livro

| Tecnica | Coberta? | Onde |
|---------|----------|------|
| **Feynman Technique** | ✅ Total | `ul-feynman` skill |
| **Pomodoro/Timeboxing** | ✅ Total | `ul-pomodoro` skill + timer widget |
| **Spaced Repetition (SM-2)** | ✅ Total | `ul-srs` skill + flashcards |
| **Active Recall** | ✅ Total | `ul-retrieval` skill |
| **Deliberate Practice** | ✅ Total | `ul-drill` skill |
| **Project-Based Learning** | ✅ Total | `ul-directness` skill |
| **Socratic Method** | ✅ Total | `ul-debug-socratic` skill |
| **Overlearning** | ✅ Parcial | Sugerido em `ul-pomodoro` se terminar cedo |
| **Interleaving** | ⚠️ Ausente | Nao misturamos topicos propositadamente |
| **Cloze Deletion** | ⚠️ Ausente | Nao implementado em SRS |
| **Memory Palace** | ❌ Ausente | Fora de escopo |
| **Elaborative Interrogation** | ✅ Parcial | Perguntas "por que?" em Feynman e socratico |
| **Concrete Examples** | ✅ Total | Exigido em Feynman e drill |
| **Dual Coding** | ❌ Ausente | Nao combinamos texto + imagem (TUI) |
| **Pre-testing** | ⚠️ Ausente | Nao testamos antes de estudar |
| **Self-Explanation** | ✅ Total | Feynman = auto-explicacao |
| **Teaching** | ✅ Total | Feynman = ensinar crianca de 5 anos |
| **Reflection** | ✅ Total | `ul-retro` skill |

---

## 3. Tecnicas Ausentes e Por Que

### 3.1 Interleaving (Mistura)

**O que e:** Em vez de estudar AAAA-BBBB-CCCC, estudar ABC-ABC-ABC.

**Por que nao:**
- Sistema e modular (1 modulo ativo por vez)
- Interleaving requer multiplos modulos ativos
- Poderia adicionar como opcao: "modo intercalado" que puxa 1 exercicio de cada modulo ativo
- **Impacto:** baixo. Para CS fundamentals, blocos focados sao mais efetivos que interleaving.

**Como adicionar:**
```typescript
// Modo intercalado
const modules = ["rust-async", "algorithms", "systems"];
const drill = pickOneFromEach(modules);
```

### 3.2 Pre-testing

**O que e:** Testar ANTES de estudar. Erros no pre-teste melhoram aprendizado posterior.

**Por que nao:**
- Nao implementamos fase de "pre-teste" no ciclo
- Poderia ser adicionado como warm-up opcional
- **Impacto:** medio. Pre-testing e efetivo, mas requer material de teste preparado.

**Como adicionar:**
```
/ul-start --pre-test
- Antes de comecar, 3 perguntas sobre [topico de amanha]
- Erros sao BOM. Nao precisa acertar.
- Resultado guia foco da proxima sessao
```

### 3.3 Dual Coding

**O que e:** Combinar texto + imagem/diagrama para melhor retencao.

**Por que nao:**
- Pi e TUI (terminal). Sem suporte a imagens no contexto principal.
- Poderia gerar ASCII art ou salvar imagens em arquivo
- **Impacto:** baixo para CS. Codigo ja e "dual" (texto + estrutura logica).

### 3.4 Memory Palace / Mnemonicos

**O que e:** Tecnicas de memoria para fatos isolados.

**Por que nao:**
- Fora de escopo. Requer ensino das tecnicas mnemonicas.
- Para CS, conceitos sao relacionais, nao fatos isolados.
- **Impacto:** baixo. SRS ja cobre memorizacao.

### 3.5 Social Learning / Accountability

**O que e:** Grupo de estudo, mentor, accountability partner.

**Por que nao:**
- Sistema e individual. Fora de escopo.
- Streak e timer sao accountability digital.
- **Impacto:** alto no mundo real, mas nao implementavel em Pi sozinho.

---

## 4. Cobertura por Area

```
Principios do Livro (9/9)
████████████████████ 100%
Tecnicas Core (9/9)
████████████████████ 100%
Tecnicas Avancadas (4/9)
████████░░░░░░░░░░░░ 44%
Visual/Fisico (0/3)
░░░░░░░░░░░░░░░░░░░░  0%
Social (0/1)
░░░░░░░░░░░░░░░░░░░░  0%
```

**Core** = Feynman, Pomodoro, SRS, Active Recall, Drill, Project, Socratic, Reflection, Decomposition.
**Avancadas** = Interleaving, Pre-testing, Overlearning, Cloze, Elaborative Interrogation, Dual Coding, Mnemonicos.

---

## 5. Decisao Explicita: O que Mantemos

Mantivemos **tudo que funciona em ambiente terminal 1:1 com agente**.

Eliminamos **tudo que requer:**
- Multiplayer (social, accountability groups)
- Visualizacao rica (diagramas, mind maps)
- Hardware externo (eye tracking, noise cancellation)
- Ensino de meta-tecnica (memory palace requer curso sobre memory palace)

Nao eliminamos por falta de valor. Eliminamos por **incompatibilidade de meio**.

---

## 6. O que Poderia Ser Adicionado Sem Quebrar Arquitetura

| Adicao | Esforco | Impacto |
|--------|---------|---------|
| Interleaving modo | 30min | Medio |
| Pre-testing opcional | 1h | Medio |
| Cloze deletion em SRS | 1h | Baixo |
| Timer rigido em drill L4 | 30min | Medio |
| `cargo test` / test runner como feedback | 2h | Alto |
| Auto-geracao de exercicios pelo LLM | 2h | Alto |
| Metrica de velocidade (WPM de codigo) | 1h | Baixo |
| Conexoes entre conceitos (grafo) | 3h | Medio |

---

## 7. Veredito Final

| Pergunta | Resposta |
|----------|----------|
| Todos os 9 principios cobertos? | **Sim.** Metalearning, Focus, Directness, Drill, Retrieval, Feedback, Retention, Intuition, Experimentation. |
| Tecnicas core do livro cobertas? | **Sim.** Feynman, SRS, Drill, Retrieval, Directness, Socratic, Pomodoro, Reflection, Decomposition. |
| Tecnicas avancadas cobertas? | **Parcial.** Interleaving, pre-testing, cloze nao implementados. Adicionaveis. |
| Algo essencial ficou de fora? | **Nao.** Tudo essencial para aprendizado autodirigido de CS em terminal esta presente. |
| O sistema e "Ultralearning completo"? | **Nao.** E "Ultralearning para terminal 1:1 com agente". Subconjunto focado e funcional. |

---

*Documento de rastreabilidade. Atualizar se novas tecnicas forem adicionadas.*
