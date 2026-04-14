---
description: Revisar flashcards pendentes (/ul-study-recall)
agent: tutor
model: opencode-go/glm-5
---

## Uso
/ul-study-recall

## Descrição

Este command é um **wrapper** que invoca a skill `srs-generator` para revisão de flashcards usando o algoritmo SM-2 (SuperMemo-2). A skill gerencia os cards, aplica o algoritmo de espaçamento e agenda próximas revisões automaticamente.

## Processo

### Passo 1: Buscar Cards Pendentes

Buscar flashcards via OpenViking:

```typescript
const flashcards = await memsearch({
  query: "flashcards pendentes revisão",
  limit: 20
})
```

Se não houver cards pendentes:
```
"🎉 Nenhum flashcard para revisar hoje!

Próximas revisões:
• Amanhã: [N] cards
• Em 3 dias: [N] cards

Quer criar novos flashcards? → /ul-study-memorize"
```

### Passo 2: Invocar Skill `srs-generator`

Delegar para a skill com os cards pendentes.

A skill `srs-generator` fará:
- **Apresentar card**: Frente primeiro
- **Aguardar resposta**: Usuário pensa/responde
- **Mostrar verso**: Comparação
- **Auto-avaliação**: Usuário classifica (0-5)
  - 5: Perfeito
  - 4: Correto com hesitação
  - 3: Correto com dificuldade
  - 2: Incorreto mas lembrou depois
  - 1: Incorreto, resposta fácil
  - 0: Completamente errado
- **Aplicar SM-2**: Calcular próxima revisão
- **Próximo card**: Continuar até acabar

### Passo 3: Atualizar Flashcard

Após cada revisão, atualizar via OpenViking:

```typescript
// Atualizar metadados do flashcard
await memcommit({ wait: true })
```

### Passo 4: Consolidação

Apresentar resumo:
```
✅ Revisão Concluída!

📊 Estatísticas:
• Cards revisados: [N]
• Média de qualidade: [X]/5
• Próxima revisão: [data]

🧠 Retenção estimada: [X]%

💡 Sugestão: revisar novamente em [N] dias
```

## Exemplo de Interação

```
Usuário: /ul-study-recall

Sistema:
"📚 Revisão SRS - 5 cards pendentes

[Skill srs-generator assume]

--- Card 1/5 ---
📝 Frente:
O que é memoization?

[Aguarda resposta do usuário...]

👤 Usuário: "Técnica de cachear resultados"

✅ Verso:
Memoization é uma técnica de otimização onde 
armazenamos resultados de funções custosas e 
retornamos o cache quando os mesmos inputs 
ocorrem novamente.

🎯 Qualidade (0-5)?
5 = Perfeito | 0 = Errei tudo

👤 Usuário: 4

✅ Registrado! Próxima revisão em 6 dias.

--- Card 2/5 ---
📝 Frente:
[Próximo card...]

[Após todos os cards]

✅ Revisão Concluída!

📊 Estatísticas:
• Cards revisados: 5
• Média de qualidade: 4.2/5
• Próxima revisão: 15/03/2026

🧠 Retenção estimada: 85%

💡 Sugestão: criar mais flashcards sobre 
   complexidade de algoritmos?"
```

## Algoritmo SM-2

A skill implementa o algoritmo SM-2 padrão:

**Fórmulas:**
- `easiness = max(1.3, easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))`
- Se quality < 3: `interval = 1` (repetir amanhã)
- Se quality ≥ 3: `interval = reviews === 0 ? 1 : reviews === 1 ? 6 : round(interval * easiness)`

**Resultado:** Cards difíceis aparecem mais frequentemente.

## Estrutura OpenViking

Os flashcards são armazenados como resources:

```
viking://user/memories/flashcards/
├── index.json          # Lista de cards + metadados
└── cards/
    └── [id].json       # Cards individuais (JSON estruturado)
```

## Quando Usar

✅ **USE para:**
- Revisão diária de conceitos
- Memorização de sintaxe
- Retenção de algoritmos
- Preparação para entrevistas

❌ **NÃO USE para:**
- Criar novos cards → `/ul-study-memorize`
- Praticar procedimentos → `/ul-study-drill`
- Validar compreensão → `/ul-study-feynman`

**Ideal:** Revisar SRS 3-5x por semana, 10-15 minutos.

## Integrações

**Skill invocada:**
- `srs-generator` — Algoritmo SM-2 e gerenciamento de cards

**Tools OpenViking utilizadas:**
- `memsearch` — Busca cards pendentes
- `memcommit` — Atualiza cards após revisão

**Commands relacionados:**
- `/ul-study-memorize` — Criar novos flashcards
- `/ul-study-start` — Sugere SRS se pendente

## Handoff

- Cards acabaram → `/ul-study-start` para continuar estudo
- Quer criar mais cards → `/ul-study-memorize`
- Dificuldade em conceito → `/ul-study-feynman`

---

*Command: /ul-study-recall — Wrapper para skill srs-generator (SM-2) via OpenViking*