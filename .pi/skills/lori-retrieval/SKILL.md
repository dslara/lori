---
name: lori-retrieval
description: Quiz adaptativo baseado em erros e weaknesses do usuário. Use para testar retenção ativa e identificar gaps de memória.
---

# Lori Retrieval

Ritual de teste ativo (active recall) com quiz adaptativo.

## Quando usar
- Usuário terminou de estudar um tópico
- Quer verificar se lembra do conteúdo
- Preparando-se para prova/benchmark
- `/lori-start <modulo> retrieval`

## Ritual

### 1. Selecionar alvo
- Módulo ativo ou específico
- Foque em weaknesses conhecidas primeiro
- Use `lori_get_context` para ver weaknesses

### 2. Gerar perguntas
Gere 5-10 perguntas de múltipla escolha ou abertas:
- 40% sobre conceitos (por que, como funciona)
- 30% sobre procedimentos (passo a passo)
- 30% sobre fatos/chaves

### 3. Aplicar quiz
- Uma pergunta por vez
- Usuário responde antes de você confirmar
- Não dê a resposta antes da tentativa

### 4. Classificar resposta
Para cada resposta, classifique:
- `correct` - acertou com confiança
- `hesitant` - acertou mas inseguro
- `wrong` - errou ou não sabia

### 5. Adaptar

| Erros recentes no tema | Comportamento |
|------------------------|---------------|
| 0-1 | Pergunta mais profunda, conexões |
| 2-3 | Pergunta direta, aplicação |
| 4+ | Volta à definição, exemplo concreto |

- `wrong` ou `hesitant`: crie flashcard SRS via `lori_create_flashcard`
- `wrong`: registre weakness via `lori_log_event type=weakness_added`
- `correct` e repetido 3x: marque conceito como dominado

### 6. Registrar resultado
```
lori_log_event type=drill_completed data={module, score, weaknesses_found}
```

## Regras
- Quiz sem consulta a materiais (closed book)
- Erro = oportunidade, não falha
- Sempre criar flashcard para erro
