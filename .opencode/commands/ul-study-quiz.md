---
description: Warm-up com quiz adaptativo
agent: tutor
---

$1 (número de perguntas, 3-5)
$ARGUMENTS (tópico, opcional)

## Descrição

Quiz de 3-5 perguntas para retrieval practice. Dificuldade adaptativa baseada no histórico de erros.

## Processo

1. **Validar entrada** — Se `$1` vazio, perguntar número de perguntas (3-5). Se `$ARGUMENTS` vazio, perguntar tópico (último estudado, específico, ou mix geral).
2. **Calcular dificuldade** — Invocar `insights.getDifficultyLevel` — Easy (error_rate <20%), Medium (20-40%), Hard (>40%). Ajustar: fácil → perguntas mais desafiadoras, difícil → perguntas mais simples com mais contexto.
3. **Gerar perguntas** — Nível adequado (múltipla escolha ou abertas), variando tipo: conceito, comparação, aplicação.
4. **Apresentar uma por vez** — Aguardar resposta antes de mostrar a próxima.
5. **Feedback imediato** — Acertou → explicação rápida; errou → resposta correta + explicação + dica mnemônica.
6. **Resultado final** — Acertos/total, análise por tópico, recomendações.

### Persistência

```
memcommit({ wait: true })
```

## Argumento

- `$1`: Número de perguntas (3-5, padrão 3 se vazio)
- `$ARGUMENTS`: Tópico do quiz (opcional — último estudado se vazio)

## Handoff

- Acertou tudo → `/ul-study-start` ou novo desafio
- Errou conceitos → `/ul-study-feynman` ou `/ul-study-learn`
- Errou procedimentos → `/ul-study-drill`
- Padrão de erro → `/ul-study-memorize`