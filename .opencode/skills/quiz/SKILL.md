---
name: "quiz"
description: "Retrieval practice rápido — 3-5 perguntas para recuperar da memória sem consultar. Use para warm-up e revisão."
license: MIT
compatibility: opencode
metadata:
  principle: "5-retrieval"
  agent: "@tutor"
  keywords: "quiz, retrieval, practice, recall, warm-up"
---

## O que é Quiz

**Retrieval practice** — recuperar informação da memória sem consultar material.

**Regra de ouro**: Pensar ANTES de responder, sem consultar.

**Benefícios**:
- ✅ Ativa memória mais que releitura
- ✅ Identifica gaps rapidamente
- ✅ Warm-up para sessão de estudo
- ✅ Baixo custo cognitivo (3-5 min)

## Quando Usar

✅ **USE** para:
- Warm-up de sessão (`make start` invoca automaticamente)
- Revisar conteúdo estudado ontem
- Testar retenção antes de continuar
- Aquecer memória antes de `#drill` ou `#feynman`

❌ **NÃO USE** para:
- Ensinar conceito novo → use `#explain`
- Validar compreensão profunda → use `#feynman`
- Memorizar permanentemente → use `make review` (flashcards SRS)

## Processo

### Passo 1: Identificar Tópico (1 min)

Pergunte ao usuário:
- "Sobre qual tópico quer fazer quiz?"
- "Quer N perguntas?" (default: 3-5)

Ou use contexto da sessão:
- "Vi que você estudou [conceito] ontem. Quiz sobre isso?"

### Passo 1.5: Consultar dificuldade (automático, silencioso)

Execute antes de gerar perguntas:

```bash
./scripts/tutor-difficulty.sh get "[tópico]" > /dev/null 2>&1
```

Isso retorna o nível de dificuldade:
- **Easy** (error_rate < 20%): Perguntas mais desafiadoras
- **Medium** (error_rate 20-40%): Perguntas balanceadas  
- **Hard** (error_rate > 40%): Perguntas mais simples

### Passo 2: Gerar Perguntas (ajustado por dificuldade)

**Regras das perguntas**:
- **Curtas** — respondíveis em 10-30 segundos mentais
- **Específicas** — não vagas ("O que é X?" → melhor: "Qual a complexidade de binary search?")
- **Variadas** — fatos, definições, trade-offs, "por quês"
- **Nível adequado** — ajustar por dificuldade

**Tipos de perguntas**:
```markdown
Tipo 1 - Fato: "Binary search é O(?)"
Tipo 2 - Definição: "O que é ownership em 1 frase?"
Tipo 3 - Comparação: "Qual a diferença de & e &mut?"
Tipo 4 - Trade-off: "Por que Rust não tem GC?"
Tipo 5 - Aplicação: "Quando usar HashMap vs BTreeMap?"
```

**Complexidade por nível**:

| Nível | Complexidade | Exemplo |
|-------|--------------|---------|
| **Easy** | Múltiplas partes, conexões | "Por que X? Como se relaciona com Y?" |
| **Medium** | 2 partes, aplicações | "O que é X? Qual a diferença de Y?" |
| **Hard** | 1 parte, definição | "O que significa X?" |

**Exemplos por nível**:
```markdown
Easy:
  - "Por que Big O ignora constantes? Como isso afeta n=1000 vs n=1M?"
  - "Compare HashMap vs BTreeMap. Quando usar cada um?"

Medium:
  - "Qual a complexidade de binary search? Por que?"
  - "O que é ownership? Qual a diferença de borrowing?"

Hard:
  - "O que significa ∀?"
  - "Qual a complexidade de n²?"
```

### Passo 3: Apresentar e Aguardar Resposta (2-3 min/pergunta)

**Formato**:
```
Pergunta 1/N: [pergunta]

[Usuário responde por texto ou mentalmente]

Você: [Feedback imediato]
```

**Regra dos 3 segundos**:
- "Pense por 3 segundos antes de responder"
- Evita resposta impulsiva errada
- Força retrieval ativo

### Passo 3.5: Registrar interação (automático, silencioso)

Após cada pergunta respondida, registre:

```bash
./scripts/tutor-interaction.sh quiz "[tópico]" "[pergunta]" "[resposta do usuário]" "[seu feedback]" '{"correct":true/false}'
```

**Exemplo**:
```bash
./scripts/tutor-interaction.sh quiz "símbolos matemáticos" "O que significa ∀?" "Para todo" "Correto! ∀ é o quantificador universal" '{"correct":true}'
```

Isso popula `tutor_interactions.csv` para cálculo de `error_rate`.

### Passo 4: Contabilizar e Dar Feedback (1 min)

```markdown
📊 Resultado: 4/5 acertos (80%)

✅ Acertos:
1. Binary search é O(log n) ✅
2. Ownership = regras de memória ✅

❌ Erros:
1. "Rust usa RAII" → mais específico: "Rust usa ownership + borrow checker"
```

### Passo 5: Handoff (1 min)

```markdown
💡 Acertos < 70%? → Revise o material antes de continuar
💡 Acertos ≥ 80%? → Pronto para `#drill` ou `#feynman`
💡 Errou mesmo conceito 2x? → `make review` para criar flashcard
```

## Exemplo de Interação

```
Usuário: "#quiz 3 perguntas sobre Big O"

Você: "Quiz: Big O Notation (3 perguntas)
Pense 3 segundos antes de responder.

Pergunta 1/3: Qual a complexidade de buscar em array ordenado?"

Usuário: "O(log n)"

Você: "✅ Correto! Binary search é O(log n).

Pergunta 2/3: Por que Big O ignora constantes?"

Usuário: "Porque quando n é grande, constantes são irrelevantes"

Você: "✅ Perfeito! n=1.000.000 → constantes <1% do total.

Pergunta 3/3: O(n²) é melhor ou pior que O(n log n)?"

Usuário: "Pior"

Você: "✅ Correto! n² cresce mais rápido.

📊 Resultado: 3/3 (100%) 🎉
Você está pronto para continuar!"
```

## Métricas de Sucesso

| Métrica | Verde ✅ | Vermelho 🔴 |
|---------|----------|-------------|
| Acertos | ≥80% | <60% |
| Tempo por pergunta | 10-30s | >60s |
| Perguntas variadas | 3+ tipos | 1 tipo só |
| Feedback dado | Imediato e útil | Genérico |

## Handoff

- Acertos ≥80%? → Pronto para continuar (`#drill`, `#feynman`, `#directness`)
- Acertos <70%? → Revise material, depois tente novamente
- Mesmo erro 2+ vezes? → `make review` para criar flashcard permanente

## 📋 Makefile Integration

**Comandos relacionados**:
- `make start` — Inicia sessão COM quiz automático
- `make review` — Adicionar flashcards de pontos fracos
- `make study` — Continuar com técnica específica

**Quando sugerir**:
- Erros identificados → sugerir `make review` para flashcards
- Quiz bem-sucedido → continuar com técnica escolhida
