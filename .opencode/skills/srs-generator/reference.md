# srs-generator — Referência Detalhada

Este arquivo contém exemplos detalhados e fluxos completos de interação. Para o processo essencial, consulte `SKILL.md`.

## Exemplo de Interação: Modo Individual

```
Usuário: "/ul-study-memorize"

Você: "
📚 Contexto detectado: M1-math-foundations (Semana 5)

Conceitos sugeridos para Combinatória & Probabilidade:

  1. ∀ (para todo) - quantificador universal
  2. ∃ (existe) - quantificador existencial  
  3. Σ (somatório) - soma de elementos
  4. C(n,k) - combinações (escolher k de n)
  5. P(n,k) - permutações (ordem importa)
  6. Escrever outro conceito

Escolha (1-6) ou digite um conceito: "

Usuário: "2"

Você: "
📝 Gerando card para: ∃ (existe)

Qual é a pergunta? (ou ENTER para padrão)
- Padrão: 'O que significa o símbolo ∃?'
"

Usuário: (ENTER)

Você: "
Card gerado:
  Q: O que significa o símbolo ∃?
  A: Existe / Pelo menos um elemento

Categoria [srs-generator]: "

Usuário: (ENTER)

[Adiciona ao SRS via tool]

Você: "
✅ Card adicionado!
📅 Próxima revisão: hoje
📊 Categoria: srs-generator

Quer criar outro card? (s/n)
"
```

## Exemplo de Interação: Modo Batch

```
Usuário: "/ul-study-memorize batch"

Você: "
📚 Modo Batch: Símbolos Matemáticos

Conceitos disponíveis:
  1. ∀ (para todo)
  2. ∃ (existe)
  3. Σ (somatório)
  4. ∈ (pertence)
  5. ⊂ (subconjunto)
  6. ∩ (interseção)
  7. ∪ (união)

Escolha (ex: 1,3,5-7 ou 'todos'):
"

Usuário: "1-7"

Você: "
📝 Preview (7 cards) - PERGUNTAS APENAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#1 Q: O que significa o símbolo ∀?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#2 Q: O que significa o símbolo ∃?
#3 Q: O que significa o símbolo Σ?
#4 Q: O que significa o símbolo ∈?
#5 Q: O que significa o símbolo ⊂?
#6 Q: O que significa o símbolo ∩?
#7 Q: O que significa o símbolo ∪?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ As respostas NÃO são mostradas no preview!

Confirmar? (s/n/e=editar)
"

Usuário: "s"

Você: "
✅ 7 cards adicionados ao SRS!
📅 Todos disponíveis para revisão hoje
📊 Use '/ul-study-recall' para revisar
"
```

## Exemplo de Interação: Modo Revisão Socrática

```
Você: "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 Card 1/3 — [symbols]

❓ PERGUNTA:
O que significa o símbolo ∀?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Tente responder! Quando pronto, escreva 'mostrar'.
"

[Usuário escreve: "Para todos"]

Você: "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Não exatamente.

Dica: É sobre cada elemento sem exceção...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tente de novo ou escreva 'mostrar' para ver a resposta.
"

[Usuário escreve: "mostrar"]

Você: "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ RESPOSTA OFICIAL:
Para todo / Cada elemento sem exceção

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sua tentativa: 'Para todos'

📊 Como você se saiu?
  0 - Não lembrei nada
  1 - Lembrei pouco
  2 - Lembrei com esforço
  3 - Lembrei com alguma dificuldade
  4 - Lembrei facilmente
  5 - Perfeito, muito fácil
"
```

## Fluxo Completo: Revisão Manual na Skill

### Passo 1: Listar Cards Pendentes

Leia o JSONL e mostre apenas as PERGUNTAS:

```
📅 Cards para revisar HOJE:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#17725133055432 [symbols]
  Q: O que significa o símbolo ∀?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 1 card

⚠️ NÃO mostre as respostas!
```

### Passo 2: Aguardar o Usuário Escolher

- Usuário escolhe um card número → Mostre a PERGUNTA

### Passo 3: Mostrar Pergunta (SEM Resposta)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ Card #[ID] [categoria]

PERGUNTA:
[texto da pergunta]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Tente responder! Quando pronto, escreva "mostrar" para ver a resposta.
```

### Passo 4: Aguardar "mostrar"

- NÃO mostre a resposta até usuário escrever "mostrar", "resposta", "ver", etc.

### Passo 5: Mostrar Resposta

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ RESPOSTA:
[resposta correta do card]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sua tentativa: [o que o usuário escreveu]
```

### Passo 6: Coletar Nota SM-2

```
📊 Como você se saiu?
  0 - Não lembrei nada
  1 - Lembrei pouco
  2 - Lembrei com esforço
  3 - Lembrei com alguma dificuldade
  4 - Lembrei facilmente
  5 - Perfeito, muito fácil

Nota (0-5):
```

### Passo 7: Calcular Próxima Revisão

Algoritmo SM-2:

```
quality = [nota dada]
interval = [intervalo atual, 0 se novo]
easiness = [easiness atual, 2.5 se novo]

# Atualizar easiness
new_easiness = easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
new_easiness = max(1.3, min(2.5, new_easiness))

# Calcular próximo intervalo
if quality < 3:
    new_interval = 1
else if interval == 0:
    new_interval = 1
else if interval == 1:
    new_interval = 3
else:
    new_interval = interval * new_easiness

# Próxima data = hoje + new_interval dias
```

### Passo 8: Atualizar Card (via tool)

A tool `data.createReview` aplica o SM-2 automaticamente:
- Calcula `new_easiness`, `new_interval`
- Atualiza `next_review`, `interval`, `easiness`, `reviews`
- Salva no `data/flashcards.csv`

### Passo 9: Feedback Final

```
✅ Card atualizado!
📅 Próxima revisão: [data] (em [new_interval] dias)
```