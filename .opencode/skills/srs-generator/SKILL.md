---
name: "srs-generator"
description: "Gerar flashcards SRS dinamicamente a partir do contexto de estudo"
license: MIT
compatibility: opencode
metadata:
  principle: "retrieval-practice"
  agent: "[@tutor]"
  keywords: "flashcard, srs, spaced repetition, memorização, card, batch, bulk, múltiplos"
---

## ⚠️ REGRA DE OURO: NUNCA MOSTRE RESPOSTAS ANTES DO TEMPO

**Quando criar cards ou fazer preview**:
- ✅ Mostre PERGUNTAS
- ❌ NUNCA mostre RESPOSTAS no preview
- ❌ O usuário só vê a resposta quando escrever "mostrar"

**Isso é um erro crítico que compromete a aprendizagem por retrieval!**

---

## Modos

| Modo | Keyword | Uso |
|------|---------|-----|
| **Individual** | `#srs-generator` | Criar 1 card por vez |
| **Batch** | `#srs-generator batch` | Criar múltiplos cards de uma vez |

## O que é srs-generator

Gerar flashcards de spaced repetition automaticamente baseados:
- No contexto atual de estudo (módulo/semana)
- Ou conceito específico fornecido pelo usuário

**Diferença do import-cards.sh**:
- `import-cards.sh`: Importa cards pré-definidos em bulk
- `srs-generator`: Cria cards dinamicamente, um a um, otimizados para SRS

## Quando Usar

✅ **USE** para:
- Criar cards enquanto estuda um conceito
- Gerar flashcards a partir de anotações
- Adicionar cards de erros/acertos durante prática
- Criar múltiplos cards de uma vez (modo batch)

❌ **NÃO USE** para:
- Importar bulk de cards pré-definidos → use `import-cards.sh`
- Revisar cards → use `make review` ou `#srs-generator review`
- Validar compreensão → use `#feynman`

---

## Modos de Uso

### Modo Individual (padrão)
Cria um card por vez, com interação completa.

### Modo Batch (lote)
Cria múltiplos cards de uma vez. Use:
- `#srs-generator batch`
- `#srs-generator bulk`
- `#srs-generator múltiplos`

---

## Processo: Modo Individual

### Passo 1: Identificar Contexto (1 min)

Determine o que o usuário está estudando:

```
1. Leia .current-topic → módulo atual
2. Leia último log em logs/daily/ → tema atual
3. Verifique meta/week-*.md → semana atual
```

**Se contexto disponível**:
-Identifique 3-5 conceitos-chave do tema atual

**Se SEM contexto**:
- Peça ao usuário para indicar o módulo/tema

### Passo 2: Apresentar Sugestões (1 min)

Apresente as sugestões formatadas:

```
📚 Conceitos sugeridos para [TEMA ATUAL]:

  1. [Conceito 1] - [breve descrição]
  2. [Conceito 2] - [breve descrição]
  3. [Conceito 3] - [breve descrição]
  4. [Outro] - Escrever conceito próprio
```

**Exemplo para M1-math-foundations (Semana 5)**:
```
📚 Conceitos sugeridos para Combinatória & Probabilidade:

  1. ∀ (para todo) - quantificador universal
  2. ∃ (existe) - quantificador existencial
  3. Σ (somatório) - soma de elementos
  4. C(n,k) - combinações
  5. P(n,k) - permutações
  6. Escrever outro conceito...
```

### Passo 3: Obter Conceito (30 seg)

- Se usuário escolhe número → use sugestão
- Se usuário digita conceito → use o que escreveu
- Valide que não está vazio

### Passo 4: Gerar Card (2 min)

Crie o par Q/A otimizado para SRS:

**Princípios de um bom card SRS**:
- **Q**: Uma pergunta clara, específica
- **A**: Resposta concisa (máx 1-2 frases)
- ** atomicidade**: Um conceito por card
- **Linguagem**: Própria, não copiada

**Formatos aceitos**:
| Tipo | Exemplo Q | Exemplo A |
|------|-----------|-----------|
| Definição | "O que significa ∀?" | "Para todo / cada elemento sem exceção" |
| Fórmula | "Quanto é Σ(i=1→n) i?" | "n(n+1)/2" |
| Relação | "Lei de De Morgan: ¬(A ∧ B) = ?" | "¬A ∨ ¬B" |
| Conversão | "Como traduzir ∀x ∈ arr : x > 0?" | "Todo elemento do array é positivo" |

### Passo 5: Adicionar ao SRS (30 seg)

Adicione usando o script existente:

```bash
cd [MODULE_PATH]
../../scripts/spaced-repetition.sh add "PERGUNTA" "RESPOSTA" "CATEGORIA"
```

**Parâmetros**:
- `PERGUNTA`: O campo Q gerado
- `RESPOSTA`: O campo A gerado
- `CATEGORIA`: (opcional) padrão "geral" — use nome do tema

### Passo 6: Feedback (30 seg)

Informe o usuário:

```
✅ Card adicionado!
📅 Próxima revisão: hoje
📊 Use 'make review' para revisar
```

Ofereça opções:
- Criar outro card (mesmo tema)
- Revisar cards pendentes
- Sair

---

## Processo: Modo Batch (Lote)

Use quando quiser criar múltiplos cards de uma vez.

### Passo 1: Detectar Modo Batch

Se o usuário escrever:
- `#srs-generator batch`
- `#srs-generator bulk`
- `#srs-generator múltiplos`
- `#srs-generator 5` (número indica quantidade)

→ Use o modo batch.

### Passo 2: Identificar Tema e Listar Conceitos (1 min)

Baseado no contexto atual, apresente 5-10 conceitos:

```
📚 Modo Batch: Símbolos Matemáticos

Conceitos disponíveis:
  1. ∀ (para todo)
  2. ∃ (existe)
  3. Σ (somatório)
  4. ∈ (pertence)
  5. ⊂ (subconjunto)
  6. ∩ (interseção)
  7. ∪ (união)

Escolha (ex: 1,3,5-7 ou "todos"):
```

### Passo 3: Parsear Seleção (30 seg)

O usuário pode usar formatos:
- `1,3,5` → cards 1, 3, 5
- `1-5` → cards 1, 2, 3, 4, 5
- `1,3,5-7` → cards 1, 3, 5, 6, 7
- `todos` ou `all` → todos
- `3` → exatamente 3 cards (escolha aleatória ou primeiros 3)

### Passo 4: Gerar Cards (2 min)

Para cada conceito selecionado:
1. Gere pergunta automática (padrão: "O que significa [símbolo]?")
2. Gere resposta automática (padrão: definição curta)
3. Armazene em memória temporária

### Passo 5: Mostrar Preview (1 min)

⚠️ **IMPORTANTE**: Mostre APENAS as PERGUNTAS, nunca as respostas!

```
📝 Preview (3 cards):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#1 Q: O que significa o símbolo ∀?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#2 Q: O que significa o símbolo ∃?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#3 Q: O que significa o símbolo Σ?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Confirmar? (s/n/q=editar)
```

### Passo 6: Editar Opcional (se usar 'e')

Se usuário escolher 'e' ou 'editar':
- Permita editar card específico
- Pergunta: "Qual card editar (número)?"
- Depois: mostrar preview novamente

### Passo 7: Adicionar Todos ao SRS (1 min)

Para cada card, adicione ao JSONL:

```bash
cd [MODULE_PATH]
../../scripts/spaced-repetition.sh add "PERGUNTA" "RESPOSTA" "CATEGORIA"
```

### Passo 8: Feedback Final

```
✅ 7 cards adicionados ao SRS!

📅 Todos disponíveis para revisão hoje
📊 Use 'make review' para revisar
```

### Exemplo de Interação: Modo Batch

```
Usuário: "#srs-generator batch"

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
📊 Use 'make review' para revisar
"
```

---

## Exemplo de Interação: Modo Batch

```
Usuário: "#srs-generator"

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
"

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

[Adiciona ao SRS via script]

Você: "
✅ Card adicionado!
📅 Próxima revisão: hoje
📊 Categoria: srs-generator

Quer criar outro card? (s/n)
"
```

## Métricas de Sucesso

| Métrica | Verde ✅ | Vermelho 🔴 |
|---------|----------|-------------|
| Contexto identificado | Módulo + semana identificados | Sem contexto, não perguntou |
| Sugestões relevantes | 3+ conceitos do tema atual | Sugestões aleatórias |
| Card qualidade | Q atomic, A conciso | Q complexo, A longo |
| Adição confirmad | Script retornou sucesso | Erro no script |
| Feedback claro | Próximos passos claros | Usuário confuso |

## Handoff

- **Revisar agora?** → Execute a revisão manualmente (veja abaixo)
- **Criar mais cards?** → `#srs-generator` novamente
- **Validar compreensão?** → `#feynman [conceito]`
- **Praticar conceito?** → `#drill [conceito]`

---

## 🚀 Modo Revisão Socrática (`#srs-generator review`)

Este modo é invocado quando o usuário executa `make review`.

### Fluxo

1. **O sistema já listou os cards pendentes** — você já tem a lista
2. **Comece pelo primeiro card** — mostre a PERGUNTA (nunca a resposta)
3. **Aguarde o usuário tentar responder** — no chat
4. **Compare com a resposta correta** — sem mostrar ainda
5. **Dê feedback socrático** — "correto" ou "tente de novo"
6. **Mostre a resposta oficial** — depois do feedback
7. **Coleete nota 0-5** — para calcular próxima revisão
8. **Atualize o card** — via script
9. **Próximo card** — repita até acabarem

### Exemplo de interação

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

### Após coletar a nota

1. **Atualize o card no JSONL** usando jq:

```bash
cd projects/M1-math-foundations/knowledge

# Parâmetros
card_id="[ID_DO_CARD]"
quality="[NOTA_0_5]"
interval="[INTERVALO_ATUAL]"
easiness="[EASINESS_ATUAL]"
reviews="[REVIEWS_ATUAL]"

# Calcular novos valores
new_easiness=$(echo "$easiness + 0.1 - (5 - $quality) * (0.08 + (5 - $quality) * 0.02)" | bc -l)
new_easiness=$(echo "if ($new_easiness < 1.3) 1.3 else if ($new_easiness > 2.5) 2.5 else $new_easiness" | bc -l)

if [ "$quality" -lt 3 ]; then
    new_interval=1
elif [ "$interval" -eq 0 ]; then
    new_interval=1
elif [ "$interval" -eq 1 ]; then
    new_interval=3
else
    new_interval=$(echo "$interval * $new_easiness" | bc -l | cut -d. -f1)
fi

new_next_review=$(date -d "+${new_interval} days" +%Y-%m-%d)
new_reviews=$((reviews + 1))

# Atualizar JSONL
jq --arg next "$new_next_review" --arg interval "$new_interval" --arg easiness "$new_easiness" --arg reviews "$new_reviews" --arg id "$card_id" \
   'if .id == $id then .next_review = $next | .interval = ($interval | tonumber) | .easiness = ($easiness | tonumber) | .reviews = ($reviews | tonumber) else . end' \
   spaced-repetition.jsonl > spaced-repetition.tmp && mv spaced-repetition.tmp spaced-repetition.jsonl

echo "✅ Card atualizado! Próxima revisão: $new_next_review (em ${new_interval} dias)"
```

2. **Passe para o próximo card** — repita até acabarem

### Atualizar card existente

Para atualizar um card já existente (não criar novo), você precisa:
1. Ler o JSONL
2. Modificar os campos: `next_review`, `interval`, `easiness`, `reviews`
3. Reescrever o JSONL

---

## 🔄 Como Fazer Revisão Manual na Skill

Quando o usuário escolher "revisar" ou "fazer review":

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

Use o algoritmo SM-2 (mesma lógica do script):

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

### Passo 8: Atualizar Card

Atualize o JSONL com os novos valores:
- `next_review`: data calculada
- `interval`: new_interval
- `easiness`: new_easiness
- `reviews`: reviews + 1

### Passo 9: Feedback Final

```
✅ Card atualizado!
📅 Próxima revisão: [data] (em [new_interval] dias)
```

## 📋 Integração com Sistema

**Script usado**: `scripts/spaced-repetition.sh`

**Comando**: `spaced-repetition.sh add "Q" "A" [categoria]`

**Database**: `[MODULE_PATH]/knowledge/spaced-repetition.jsonl`

**Makefile**: `make review` — para revisar os cards gerados

## 📂 Arquivos de Referência

- **Master deck CSV** (formato参考): `projects/shared/flashcards/master-deck.csv`
- **Script SRS**: `scripts/spaced-repetition.sh`
- **Review script**: `scripts/review.sh`
