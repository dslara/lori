---
description: Criar flashcards SRS
agent: tutor
model: opencode-go/kimi-k2.5
---

$1 (criar|review|batch|direto)
$ARGUMENTS (conteúdo para modo direto, ex: "frente::verso")

## Descrição

Cria flashcards para o sistema de repetição espaçada (SRS). Delega para a skill `srs-generator` que gerencia validação, criação e revisão de cards.

## Processo

### Modo Criação (criar, padrão)

1. **Carregar contexto** — Invocar `memsearch` com query `"tópicos em estudo"`, `limit: 5` para sugerir conceitos
2. **Carregar skill** — Carregar skill `srs-generator` e seguir processo de criação definido nela
3. **Persistir** — Invocar `data.createFlashcard` com `front`, `back`, `category`, `tags`
4. **Oferecer próximo passo** — Criar outro card, revisar pendentes, ou sair

### Modo Revisão (review)

1. **Buscar pendentes** — Invocar `data.getFlashcards` para buscar cards com `next_review <= hoje`
2. **Seguir skill** — Carregar skill `srs-generator` e seguir processo de revisão
3. **Atualizar intervalo** — Para cada card, coletar nota 0-5 e invocar `data.createReview` com `flashcardId` e `quality`
4. **Apresentar resumo** — Cards revisados, média de qualidade

### Modo Lote (batch)

1. **Carregar skill** — Carregar skill `srs-generator` e seguir processo de criação em lote
2. **Persistir** — Invocar `data.createFlashcard` para cada card do lote

### Modo Direto (direto)

1. **Parsear conteúdo** — Separar `$ARGUMENTS` em frente e verso pelo separador `::`
2. **Persistir** — Invocar `data.createFlashcard` com `front`, `back`

## Argumento

- `$1`: Modo de operação — `criar` (padrão interativo), `review` (revisar pendentes), `batch` (criação em lote), `direto` (criação rápida). Se vazio, modo criar.
- `$ARGUMENTS`: Conteúdo para modo direto (ex: "O que é closure?::Função que captura variáveis do escopo externo")

## Handoff

- Criou cards → `/ul-study-recall` para revisar depois
- Sessão completa → `/ul-study-end`
- Precisa praticar → `/ul-study-drill`