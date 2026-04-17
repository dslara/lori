---
name: lori-stuck
description: 5 perguntas sistemáticas para quando usuário travar no estudo ou no código. Use em qualquer momento de bloqueio.
---

# Lori Stuck

Ritual de desbloqueio sistemático para momentos de travamento.

## Quando usar
- Usuário diz "travei", "não consigo", "não entendo"
- Timer ativo mas sem progresso
- Erro repetido no mesmo ponto
- Qualquer comando pode chamar este ritual

## Ritual

### 1. Pausa modo difuso (15 min)
- Pare o timer se estiver rodando
- Instrua usuário a: caminhar, tomar água, não olhar tela
- Objetivo: ativar modo difuso do cérebro

### 2. 5 perguntas sistemáticas
Faça UMA por vez, na ordem. Pare na primeira que desbloquear.

**P1 - Expectativa:**
"O que você espera que aconteça? Descreva em português."

**P2 - Realidade:**
"O que REALMENTE acontece? (Observe, não interprete)"

**P3 - Divergência:**
"Qual o primeiro ponto onde expectativa ≠ realidade?"

**P4 - Verdade conhecida:**
"O que você SABE que é verdade sobre [elemento chave] neste ponto?"

**P5 - Teste mínimo:**
"Qual a menor mudança que testaria sua hipótese?"

### 3. Se ainda travado
- Volte 1 nível de abstração (ex: se problema é função, olhe módulo)
- Use `/skill:lori-feynman` no conceito base
- Ou crie flashcard para gap identificado

### 4. Registrar weakness
Se o travamento revelou gap de conhecimento:
```
lori_log_event type=weakness_added data={concept, context: "stuck"}
```

### 5. Retomar
```
/lori-timer start
```

## Regras
- Nunca pule pausa modo difuso
- Não dê a resposta antes das 5 perguntas
- Se usuário responder P1 e a solução for óbvia para você, ainda assim faça P2
- Stuck é evento de aprendizado, não falha
