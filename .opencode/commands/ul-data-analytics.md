---
description: Ver relatório analítico avançado (/ul-data-analytics)
agent: tutor
model: opencode-go/glm-5
---

## Descrição

Gera relatório analítico avançado com métricas de desempenho, padrões de estudo e recomendações personalizadas via OpenViking.

## Uso
/ul-data-analytics

## Processo

Carregar dados via OpenViking:

```typescript
// 1. Carregar insights agregados
const insights = await memread({
  uri: "viking://user/memories/insights.md",
  level: "read"
})

// 2. Buscar padrões de estudo
const patterns = await memsearch({
  query: "padrões de estudo",
  limit: 10
})

// 3. Buscar pontos fracos
const weaknesses = await memsearch({
  query: "padrões de erro tópicos fracos",
  limit: 5
})

// 4. Buscar sessões recentes
const sessions = await memsearch({
  query: "sessões recentes desempenho",
  limit: 20
})
```

---

Apresente as seguintes informações de forma organizada:

## 📊 Relatório de Analytics

### Métricas Gerais
- Streak atual e melhor streak
- Total de sessões completadas

### Estatísticas do Módulo Atual (se aplicável)
- Tempo total de estudo
- Pontuação média de foco
- Número de sessões

### Progresso SRS
- Flashcards revisados hoje
- Cards pendentes de revisão

### Habilidades e Técnicas
- Técnica mais usada
- Distribuição de técnicas utilizadas

### Desempenho por Tópico
- Taxas de erro por tópico (se disponível)
- Recomendações de melhoria

### Padrões de Estudo
- Distribuição por dia da semana (quais dias estuda mais)
- Nível de dificuldade recomendado para o próximo quiz

### Recomendações
Baseado nos dados, sugira:
1. Próximo tipo de atividade (drill, quiz, feynman, etc.)
2. Nível de dificuldade (fácil, médio, difícil)
3. Áreas para focar

Se o usuário pedir dados de um módulo específico, busque especificamente.

## Estrutura OpenViking

Os dados são buscados de:

| Dado | URI OpenViking |
|------|---------------|
| Insights agregados | `viking://user/memories/insights.md` |
| Padrões | `memsearch({ query: "padrões" })` |
| Pontos fracos | `memsearch({ query: "erros" })` |
| Sessões | `memsearch({ query: "sessões" })` |

## Integrações

**Tools OpenViking utilizadas:**
- `memread` — Carregar insights
- `memsearch` — Buscar padrões, erros, sessões

**Commands relacionados:**
- `/ul-data-status` — Status rápido
- `/ul-study-plan` — Ver plano

---

*Command: /ul-data-analytics — Relatório detalhado via OpenViking*