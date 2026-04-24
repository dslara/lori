# Lori — Proposta de Projeto

## Resumo Executivo

Lori é uma extensão para agentes de código (Pi) que transforma o aprendizado acelerado em jogo single-player no terminal.

Baseia-se em *Ultralearning*, de Scott Young. Aplica seus 9 princípios como filosofia de jogo e oferece técnicas de estudo como artefatos desbloqueáveis.

Personaliza a experiência com temas visuais (skins) e personalidades de IA (personas). Tudo local, sem backend.

---

## Problema

Autodidatas abandonam cursos, sentem falta de feedback imediato e sofrem com o isolamento.

Ferramentas fragmentadas espalham timers, flashcards e anotações em apps separados.

Técnicas ativas como recall e Feynman exigem disciplina. Estudo passivo não garante retenção.

Lori unifica método de aprendizado acelerado, gamificação e assistência de IA em um único ambiente: o terminal.

---

## Visão

Lori transforma aprender qualquer habilidade ou conceito — idiomas, matemática, música, design, programação — em RPG de progressão pessoal.

O jogador escolhe um domínio para conquistar. Técnicas científicas viram rituais e artefatos.

A IA assume personalidades temáticas que guiam, desafiam e ensinam de formas distintas.

Todo progresso é local, persistente e recompensado com desbloqueios visuais, narrativos e funcionais.

---

## Público-Alvo

| Segmento | Perfil |
|----------|--------|
| **Autodidata** | Aprende por livros, documentação e cursos. Precisa de estrutura para não dispersar. |
| **Transição de carreira** | Adquire nova habilidade (idioma, instrumento, design, código). Precisa de método eficiente. |
| **Estudante** | Quer complementar a faculdade com prática deliberada e retenção de longo prazo. |
| **Especialista aprofundando** | Estuda conceitos profundos. Precisa de isolamento e feedback rigoroso. |
| **Entusiasta de produtividade** | Gosta de streaks, métricas e gamificação com significado, não badges vazios. |

---

## Funcionalidades Principais

### 1. Dashboard de Jogador

Interface principal no terminal mostrando recursos, streak diário, quests ativas, árvore de habilidades e log de eventos com feedback imediato.

### 2. Sessões de Aprendizado Estruturadas

O jogador inicia uma sessão escolhendo domínio (ex: japonês, cálculo, violão, React), técnica e duração. Timer integrado monitora progresso e aplica bônus por técnica correta.

### 3. Sistema de Técnicas (Rituais e Passivas)

27 técnicas de ultralearning organizadas em 9 princípios. Cada skin traduz os princípios para nomes e lore próprios.

O core não conhece nomes temáticos. Conhece apenas princípios genéricos. A skin faz a tradução.

Cada técnica começa como ritual consumível. Ganha XP, sobe de nível e vira passiva permanente ao atingir domínio.

Combos entre técnicas geram bônus multiplicativos de XP.

| Princípio Core | Exemplos de Técnicas | Nome em Skin RPG | Nome em Skin Horror | Nome em Skin Sci-Fi |
|----------------|---------------------|------------------|---------------------|---------------------|
| **Metalearning** | Benchmarking, Emphasize/Exclude | Cartógrafo | Proscrito | NavCom |
| **Focus** | Pomodoro, Timeboxing, Digital Detox | Fervedor | Chama Negra | FOCUS-7 |
| **Directness** | Build From Scratch, Immersive Project, Copycat | Ponte | Vazio | Teleport |
| **Drill** | Time Slicer, Rate Limiter, Cognitive Load Limiter | Ferreiro | Cirurgião | Training-Unit |
| **Retrieval** | Active Recall, Closed Book, Blindfold | Inquisidor | Confessor | Diagnostic-AI |
| **Feedback** | Feynman Technique, Self-Explanation, Rubber Duck | Espelho | Distorcido | Analytics-Core |
| **Retention** | SRS, Interleaving, Overlearning | Carcereiro | Carcereiro | Archive-Sys |
| **Intuition** | Elaborative Interrogation, Dual Coding, Analogy Creation | Perfurador | Perfurador | Deep-Learn |
| **Experimentation** | Anti-Expert, Constraint Removal, Teach to Learn | Alquimista | Herege | R&D-Module |

### 4. Repetição Espaçada (SRS)

Sistema de flashcards com intervalos adaptativos. Cards nascem automaticamente de sessões.

Revisões diárias têm penalidade progressiva para atrasos. Streak de reviews gera bônus acumulativo.

### 5. Identificação e Forja de Fraquezas

Erros e hesitações viram fraquezas registradas no domínio. Ignoradas, reduzem eficiência.

O sistema sugere drills direcionados. Fraquezas resolvidas viram conquistas e desbloqueiam avanços.

### 6. Árvore de Habilidades

Mapa visual de progresso por domínio. Nós representam conceitos, técnicas ou domínios completos.

Pré-requisitos entre nós forçam ordem lógica. Desbloqueio libera novas técnicas, quests e áreas.

### 7. Quests e Conquistas

Quests diárias geradas automaticamente. Semanais exigem desafios maiores. Narrativas acompanham a progressão na árvore.

Conquistas marcam primeiros passos: primeira fraqueza forjada, 7 dias de streak, técnica ao nível 10.

### 8. Sistema de Skins (Temas Visuais)

O jogador escolhe a lente do sistema. Cada skin traduz eventos core em mensagens, cores, ASCII art e atmosfera.

O progresso não muda. Muda apenas a mitologia. Usuários criam skins próprias sem programar.

| Skin | Tom | Experiência |
|------|-----|-------------|
| Minimal | Neutro, limpo | Planilha de produtividade. Sem fantasia. |
| RPG | Aventura, heroísmo | Guardiões, acólitos, mapas, grimórios. |
| Horror | Survival, tensão | Entidades, sanidade, chamas negras, cicatrizes. |
| Sci-Fi | Cyberpunk, tech | Sistemas, degradação neural, IAs de bordo. |
| Zen | Calmo, natureza | Respiração, raízes, fluxo, sem pressão. |

### 9. Sistema de Personas (Vozes da IA)

Cada um dos 9 princípios possui persona com voz, tom e regras distintas. A IA assume essa persona durante conversas.

A persona ativa muda automaticamente por contexto ou manualmente. A mesma pergunta recebe respostas distintas.

### 10. Leaderboard Pessoal e Ghost Runs

Histórico completo de sessões com métricas de foco, honestidade e XP. Comparação com sessões anteriores.

Estatísticas de longo prazo mostram domínios conquistados, fraquezas resolvidas e tempo total investido.

---

## Modelo de Dados e Persistência (Conceitual)

Todo estado do jogador fica localmente no projeto de estudo: progresso, eventos, árvore, flashcards e configurações.

Não há servidor, login ou nuvem. O jogador é dono absoluto dos dados.

---

## Diferenciais Competitivos

| Diferencial | Como se Manifesta |
|-------------|-------------------|
| **Terminal-native** | Não sai do ambiente de trabalho. Zero context switching. |
| **Base teórica sólida** | Fundamentado em *Ultralearning* (Scott Young). Cada mecânica mapeia para método validado. |
| **Skin + Persona** | Mitologia completa que muda voz da IA, ASCII art e atmosfera. Rejogabilidade infinita. |
| **Gamificação com stakes** | Streak quebrada tem consequência. Fraqueza ignorada reduz eficiência. |
| **Passivas que automatizam** | Técnicas dominadas viram automações que reduzem micro-gerenciamento. |
| **Extensível pela comunidade** | Skins customizáveis sem código. Personas definidas em arquivos de texto. |

---

## Restrições do Projeto (Não Negociáveis)

| Restrição | Implicação para o Produto |
|-----------|--------------------------|
| Extensão Pi | Integra-se ao ecossistema Pi. Não é app standalone. |
| Terminal-only | TUI nativo. Sem browser, Electron ou mobile. |
| Single-player | Sem multiplayer, ranking global ou competição social. |
| Local persistence | SQLite ou arquivos flat no diretório do projeto. |
| Pequeno footprint | Abaixo de 50MB. Roda em qualquer máquina com terminal. |

---

## Sucesso Esperado

Para o jogador, sucesso é estudar 30+ minutos por dia com consistência. Dominar técnicas antes não usadas.

Ter visibilidade clara do que sabe, do que não sabe e do que precisa reforçar. Manter retenção via SRS.

Transformar estudo passivo em prática deliberada com recompensa imediata.

Para o projeto, sucesso é ser extensão Pi padrão para aprendizado acelerado gamificado. Comunidade criando skins e domínios.

Provar que gamificação no terminal pode ser tão imersiva quanto em apps gráficos.

---

## Considerações Finais

Lori não é app de produtividade com pontos e badges. É sistema de aprendizado que usa linguagem dos jogos.

Torna métodos científicos de estudo naturais, viciantes e profundamente pessoais. O terminal é a arena. O conhecimento é o território. A jornada é sua.
