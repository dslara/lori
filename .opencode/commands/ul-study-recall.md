---
description: Revisar flashcards pendentes
agent: tutor
---

## Descrição

Revisa flashcards pendentes usando o algoritmo SM-2. Delega para a skill `srs-generator` que gerencia o fluxo completo de revisão.

## Processo

1. **Buscar cards pendentes** — Invocar `data.getFlashcards` para buscar cards com `next_review <= hoje`
2. **Se nenhum card pendente** — Apresentar mensagem "Nenhum flashcard para revisar hoje" com próximos agendados e sugerir `/ul-study-memorize`
3. **Carregar skill** — Carregar skill `srs-generator` e seguir processo de revisão definido nela
4. **Revisar cada card** — Apresentar frente, aguardar resposta, mostrar verso, coletar nota 0-5
5. **Atualizar intervalo** — Invocar `data.createReview` com `flashcardId` e `quality` para atualizar intervalo SM-2
6. **Persistir e resumir** — Apresentar resumo: cards revisados, média de qualidade, próxima revisão

### Persistência

```
memcommit({ wait: true })
```

## Handoff

- Quer criar novos cards → `/ul-study-memorize`
- Sessão completa → `/ul-study-end`
- Precisa de mais prática → `/ul-study-drill`