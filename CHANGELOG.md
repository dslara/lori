# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.1.1]

### Adicionado

- **`/lori-resources` ativo.** Comando lista e visualiza documentos do módulo ativo: `plan.md`, `concepts.md`, `resources.md`, semanasis e retros.

## [0.1.0]

### Mudado

- **`/lori-plan` sempre wizard.** Não aceita mais argumentos. Sempre inicia wizard interativo que coleta tópico, objetivo, tempo, nível e pré-requisitos. Legacy mode removido.
- **`/lori-decomposition` removido como comando.** Decomposition 3D agora é automática no wizard do `/lori-plan`. Skill `lori-decomposition` continua disponível como referência do ritual.
- **`resources.md` obrigatório.** Todo módulo novo ganha `resources.md` com template de curadoria. Recursos organizados por 3D (Conceitos, Fatos, Procedimentos), cada um com tag de semana, tipo e nota de uso (ler/codar/consultar/decorar/analisar).
- **Prompt do wizard com semanas exatas.** Extrai número de semanas de `timeCommitment` (ex: "8 semanas" → 8). Agente gera exatamente N arquivos `week-*.md`.
- **`week-*.md` com Recursos da semana.** Cada semana inclui seção linkando para `resources.md`.
- **Skill `lori-decomposition` atualizada.** Passo 3.5 novo: curar recursos iniciais. Regra: recurso sem nota de uso é inútil.

## [0.0.1]

### Adicionado

- **Pi Package nativo**. Distribuição via `pi install git:github.com/dslara/lori`. Extension, skills, prompts e tema em um único pacote.
- **Event sourcing em `state.jsonl`**. Tudo que acontece é um evento append-only. Estado reconstruído a partir do log. Snapshot periódico (`state-snapshot.json`) para performance.
- **Persistência dupla**. Eventos vão para `.lori/state.jsonl` (arquivo local) e `pi.appendEntry("lori-event", ...)` (contexto da conversa, sobrevive compactação).
- **Extension TypeScript** em `.pi/extensions/lori/`. Registra commands, tools, listeners de eventos Pi e timer periódico.
- **Injeção automática de contexto** via `before_agent_start`. Detecta palavras-chave de estudo e frustração, injeta `lori-context` ou protocolo de bloqueio sem tool call.
- **Máquina de estados do ciclo de aprendizado**. `idle → pre-session → in-session → post-session`, reconstruível apenas dos eventos.
- **9 skills** como rituais completos (`SKILL.md`):
  - `lori-pomodoro` — timer 50/10 com proteção de interrupções
  - `lori-decomposition` — quebra objetivo em conceitos, fatos, procedimentos
  - `lori-retrieval` — quiz adaptativo baseado em erros
  - `lori-feynman` — validar compreensão explicando sem jargão
  - `lori-drill` — repetição deliberada com progressão de nível
  - `lori-directness` — projeto real com review socrático
  - `lori-srs` — flashcards com algoritmo SM-2
  - `lori-stuck` — 5 perguntas para quando travar
  - `lori-retro` — retrospectiva semanal com ajustes
- **Commands `/lori-*`**:
  - `/lori-start`, `/lori-end`, `/lori-timer`, `/lori-plan`, `/lori-decomposition`
  - `/lori-retro`, `/lori-review-srs`, `/lori-weak`, `/lori-resources`, `/lori-stats`
- **Custom tools**: `lori_log_event`, `lori_review_srs`, `lori_get_context`, `lori_add_resource`.
- **Timer integrado no TUI**. Widget de status, notificações quando expira ou faltam 5 minutos, atualização a cada 30 segundos.
- **SRS com SM-2**. Flashcards por módulo em `.lori/flashcards/{modulo}.jsonl`. Revisão diária com qualidade 0-5.
- **Estrutura de módulos**. Cada módulo tem `plan.md`, `week-*.md`, `retro-*.md`, `concepts.md`, `resources.md`.
- **Compactação de contexto customizada**. Intercepta `session_before_compact` e preserva weaknesses, recursos e decisões no resumo.
- **Status bar e notificações**. Streak, módulo ativo, SRS pendente, weaknesses, tempo de hoje.
