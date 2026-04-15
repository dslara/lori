---
description: Revisar flashcards pendentes (/ul-study-recall)
agent: tutor
model: opencode-go/glm-5
---

## Uso
/ul-study-recall

## Descrição

Revisa flashcards pendentes usando o algoritmo SM-2. Delega para a skill `srs-generator` que gerencia o fluxo completo de revisão: apresenta pergunta, aguarda resposta, coleta auto-avaliação (0-5) e calcula próxima revisão.

## Processo

1. Invocar `data.getFlashcards` para buscar cards com `next_review <= hoje`
2. Se nenhum card pendente:
   ```
   "🎉 Nenhum flashcard para revisar hoje!

   Próximas revisões:
   • Amanhã: [N] cards
   • Em 3 dias: [N] cards

   Quer criar novos flashcards? → /ul-study-memorize"
   ```
3. Carregar skill `srs-generator` e seguir processo de revisão definido nela
4. Para cada card: apresentar frente, aguardar resposta, mostrar verso, coletar nota 0-5
5. Invocar `data.createReview` com `flashcardId` e `quality` para atualizar intervalo SM-2
6. Após todos, usar `memcommit` com `wait: true` para persistir e apresentar resumo:
   ```
   ✅ Revisão Concluída!
   • Cards revisados: [N]
   • Média de qualidade: [X]/5
   • Próxima revisão: [data]
   ```

## Quando Usar

- Revisão diária de conceitos (ideal: 3-5x/semana, 10-15 min)
- Memorização de sintaxe
- Retenção de algoritmos

## Integrações

- Skill: `srs-generator` — algoritmo SM-2 e gerenciamento de cards
- Tools: `data.getFlashcards`, `data.createReview`
- `/ul-study-memorize` — criar novos flashcards
- `/ul-study-start` — sugere SRS se pendente