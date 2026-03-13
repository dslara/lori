---
description: Ver relatório analítico avançado (/ul-data-analytics)
agent: tutor
model: opencode-go/kimi-k2.5
---

## Descrição

Gera relatório analítico avançado com métricas de desempenho, padrões de estudo e recomendações personalizadas baseadas nos dados históricos.

## Uso
/ul-data-analytics

## Integrações

**Tools utilizadas:**
- `insights.generateReport` — Gera relatório completo consolidado
- `insights.getSummary` — Resumo geral (streak, tempo, foco)
- `insights.getEffectiveness` — Efetividade por técnica
- `insights.getPatterns` — Padrões de estudo
- `insights.getWeaknesses` — Pontos fracos

**Processo:**
1. Invocar `insights.generateReport` para obter relatório completo
2. Se usuário pedir módulo específico, passar `moduleId` como parâmetro
3. Apresentar todas as seções do relatório de forma organizada

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

Se o usuário pedir dados de um módulo específico, use o parâmetro moduleId.
