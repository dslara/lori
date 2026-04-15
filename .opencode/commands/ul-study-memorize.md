---
description: Criar flashcards SRS (/ul-study-memorize)
agent: tutor
model: opencode-go/kimi-k2.5
---

Argumentos recebidos: $ARGUMENTS

## Uso
/ul-study-memorize [frente] [verso]
/ul-study-memorize batch
/ul-study-memorize review

## Descrição

Cria flashcards para o sistema de repetição espaçada (SRS). Delega para a skill `srs-generator` que gerencia validação, criação e revisão de cards.

## Processo

### Modo Criação (padrão ou batch)

1. Carregar contexto: `memsearch` com query `"tópicos em estudo"`, `limit: 5` para sugerir conceitos
2. Carregar skill `srs-generator` e seguir processo de criação definido nela
3. Invocar `data.createFlashcard` com `front`, `back`, `category`, `tags` para persistir card
4. Oferecer próximo passo: criar outro card, revisar pendentes, ou sair

### Modo Revisão (review)

1. Invocar `data.getFlashcards` para buscar cards com `next_review <= hoje`
2. Seguir processo de revisão da skill `srs-generator`
3. Para cada card, coletar nota 0-5 e invocar `data.createReview` com `flashcardId` e `quality`
4. Apresentar resumo ao final

## Argumento

- `$ARGUMENTS` vazio → modo criação interativo
- `$ARGUMENTS` contém "batch" ou "bulk" → modo lote
- `$ARGUMENTS` contém "review" → modo revisão
- `$ARGUMENTS` contém frente e verso → criação direta

## Quando Usar

- Memorizar conceitos, sintaxe, algoritmos
- Após `/ul-study-feynman` (analogias boas)
- Após `/ul-study-learn` (conceitos novos)

## Integrações

- Skill: `srs-generator` — processo completo de criação e revisão
- Tools: `data.createFlashcard`, `data.getFlashcards`, `data.createReview`
- `/ul-study-recall` — alias para modo review
- `/ul-study-start` — pode sugerir SRS se pendente