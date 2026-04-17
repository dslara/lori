---
name: lori-srs
description: Flashcards espaçados com algoritmo SM-2. Use para retenção de longo prazo de conceitos, fatos e procedimentos.
---

# Lori SRS

Ritual de revisão espaçada (Spaced Repetition System) com SM-2.

## Quando usar
- Revisar conteúdo estudado anteriormente
- Manter conhecimento a longo prazo
- `/lori-review-srs` ou `/lori-start <modulo> srs`

## Ritual

### 1. Ver cards devidos
```
lori_review_srs action=list_due module=<opcional>
```

### 2. Revisar cada card
Para cada card devido:
1. Mostre apenas o `front`
2. Usuário tenta responder mentalmente
3. Revela `back`
4. Usuário auto-avalia com quality 0-5:
   - 5: resposta perfeita e instantânea
   - 4: resposta correta com hesitação
   - 3: resposta correta com dificuldade
   - 2: quase correta / lembrou parte
   - 1: errou mas lembrou ao ver resposta
   - 0: blackout completo

5. Atualize:
```
lori_review_srs action=review cardId=<id> quality=<0-5>
```

### 3. Regras de criação de cards
Crie cards quando:
- Conceito aprendido via Feynman
- Erro em retrieval/drill
- Fato importante isolado

Use `lori_create_flashcard`:
```
module: string
front: pergunta direta (1 pergunta = 1 card)
back: resposta concisa
```

### 4. Boas práticas de cards
- Front: pergunta específica, contexto mínimo
- Back: uma resposta clara
- Evite listas longas (quebre em múltiplos cards)
- Inclua exemplo quando possível

### 5. Registrar sessão
```
lori_log_event type=session_end data={technique: "srs", cards_reviewed: N}
```

## Regras
- Nunca reveja cards não devidos (quebra algoritmo)
- Honestidade forçada na auto-avaliação
- Quality <3 sempre gera revisão no dia seguinte
- Cards novos: máximo 20 por dia
