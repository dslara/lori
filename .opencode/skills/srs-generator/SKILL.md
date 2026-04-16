---
name: "srs-generator"
description: "Gerar flashcards SRS dinamicamente a partir do contexto de estudo"
license: MIT
compatibility: opencode
metadata:
  principle: "retrieval-practice"
  agent: "@tutor"
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
| **Individual** | `/ul-study-memorize` | Criar 1 card por vez |
| **Batch** | `/ul-study-memorize batch` | Criar múltiplos cards de uma vez |
| **Revisão** | `/ul-study-memorize review` | Revisar cards pendentes |

## Quando Usar

✅ **USE** para:
- Criar cards enquanto estuda um conceito
- Gerar flashcards a partir de anotações
- Adicionar cards de erros/acertos durante prática
- Criar múltiplos cards de uma vez (modo batch)

❌ **NÃO USE** para:
- Importar bulk de cards pré-definidos → use `import-cards.sh`
- Revisar cards → use `/ul-study-recall`
- Validar compreensão → use `/ul-study-feynman`

---

## Processo: Modo Individual

### Passo 1: Identificar Contexto (1 min)

Determine o que o usuário está estudando:
1. Use `memsearch` com query `"tópicos em estudo"` para buscar contexto
2. Se contexto disponível → identifique 3-5 conceitos-chave
3. Se sem contexto → peça ao usuário para indicar módulo/tema

### Passo 2: Apresentar Sugestões (1 min)

```
📚 Conceitos sugeridos para [TEMA ATUAL]:

  1. [Conceito 1] - [breve descrição]
  2. [Conceito 2] - [breve descrição]
  3. [Conceito 3] - [breve descrição]
  4. [Outro] - Escrever conceito próprio
```

### Passo 3: Obter Conceito (30 seg)

- Se usuário escolhe número → use sugestão
- Se usuário digita conceito → use o que escreveu

### Passo 4: Gerar Card (2 min)

| Tipo | Exemplo Q | Exemplo A |
|------|-----------|-----------|
| Definição | "O que significa ∀?" | "Para todo / cada elemento sem exceção" |
| Fórmula | "Quanto é Σ(i=1→n) i?" | "n(n+1)/2" |
| Relação | "Lei de De Morgan: ¬(A ∧ B) = ?" | "¬A ∨ ¬B" |
| Conversão | "Como traduzir ∀x ∈ arr : x > 0?" | "Todo elemento do array é positivo" |

**Princípios de um bom card SRS**:
- **Q**: Uma pergunta clara, específica
- **A**: Resposta concisa (máx 1-2 frases)
- **Atomicidade**: Um conceito por card
- **Linguagem**: Própria, não copiada

### Passo 5: Adicionar ao SRS (via tool)

Invoque `data.createFlashcard` com:
- `front`: O campo Q gerado (pergunta)
- `back`: O campo A gerado (resposta)
- `category`: (opcional) nome do tema/módulo
- `tags`: (opcional) array de tags

### Passo 6: Feedback (30 seg)

```
✅ Card adicionado!
📅 Próxima revisão: hoje
📊 Use /ul-study-recall para revisar cards pendentes
```

---

## Processo: Modo Batch (Lote)

### Passo 1: Detectar Modo Batch

Se o usuário escrever: `batch`, `bulk`, `múltiplos`, ou um número → use modo batch.

### Passo 2: Identificar Tema e Listar Conceitos (1 min)

Baseado no contexto, apresente 5-10 conceitos. Formatos de seleção aceitos:
- `1,3,5` → cards 1, 3, 5
- `1-5` → cards 1, 2, 3, 4, 5
- `1,3,5-7` → cards 1, 3, 5, 6, 7
- `todos` ou `all` → todos

### Passo 3-4: Gerar Cards e Mostrar Preview

⚠️ **IMPORTANTE**: Mostre APENAS as PERGUNTAS, nunca as respostas!

```
📝 Preview (3 cards):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#1 Q: O que significa o símbolo ∀?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#2 Q: O que significa o símbolo ∃?
#3 Q: O que significa o símbolo Σ?

Confirmar? (s/n/q=editar)
```

### Passo 5-6: Adicionar ao SRS e Feedback

Para cada card, invoque `data.createFlashcard`. Ao final:

```
✅ 7 cards adicionados ao SRS!
📅 Todos disponíveis para revisão hoje
📊 Use '/ul-study-recall' para revisar
```

---

## Modo Revisão (`/ul-study-memorize review` e `/ul-study-recall`)

### Passo 0: Carregar Cards Pendentes

Invoque `data.getFlashcards` — retorna cards com `next_review <= hoje`.

### Passo 0.5: Consultar Dificuldade

Antes de cada card, use `insights.getWeaknesses` com o `category` do card para ajustar feedback:

| Error Rate | Nível | Feedback |
|------------|-------|----------|
| < 20% | Easy | Minimal ("Correto!") |
| 20-40% | Medium | Balanceado ("Correto! X significa Y") |
| > 40% | Hard | Detalhado ("Correto! X significa Y. Dica: [explicação]") |

### Fluxo

1. Mostre a PERGUNTA (nunca a resposta)
2. Aguarde o usuário tentar responder
3. Compare com a resposta correta (sem mostrar ainda)
4. Dê feedback socrático ("correto" ou "tente de novo")
5. Mostre a resposta oficial depois do feedback
6. Colete nota 0-5
7. Invoque `data.createReview` com `flashcardId` e `quality` para atualizar SM-2
8. Próximo card

### Após coletar a nota

A tool `data.createReview` implementa o algoritmo SM-2 completo e atualiza automaticamente. Ver `reference.md` para detalhes do cálculo SM-2.

---

## Métricas de Sucesso

| Métrica | Verde ✅ | Vermelho 🔴 |
|---------|----------|-------------|
| Contexto identificado | Módulo + semana identificados | Sem contexto, não perguntou |
| Sugestões relevantes | 3+ conceitos do tema atual | Sugestões aleatórias |
| Card qualidade | Q atomic, A conciso | Q complexo, A longo |
| Feedback claro | Próximos passos claros | Usuário confuso |

## Handoff

- **Revisar agora?** → `/ul-study-recall`
- **Criar mais cards?** → `/ul-study-memorize`
- **Validar compreensão?** → `/ul-study-feynman [conceito]`
- **Praticar conceito?** → `/ul-study-drill [conceito]`

## 📋 Integração com Sistema

**Tools usadas**:
- `data.createFlashcard` — criar cards
- `data.getFlashcards` — listar cards pendentes
- `data.createReview` — revisar cards (aplica SM-2)

**Database**: `data/flashcards.csv` (CSV global, RFC 4180)

**Commands**: `/ul-study-memorize review` e `/ul-study-recall` — para revisar os cards gerados

**Referência detalhada**: Exemplos de interação completos e fluxo manual detalhado em `reference.md`