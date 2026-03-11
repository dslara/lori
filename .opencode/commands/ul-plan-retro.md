---
description: Retrospectiva semanal - revisar e ajustar (/ul-plan-retro)
agent: meta
model: opencode-go/minimax-m2.5
---

## Uso
/ul-plan-retro

## Descrição

Executa retrospectiva semanal analisando o que funcionou, o que não funcionou e sugerindo ajustes para a próxima semana.

## Processo

### Passo 1: Coletar Contexto

Invocar tools:
- `analytics.generateReport` — Métricas da semana
- `context.getRecentSessions` — Sessões recentes
- `data.getAllInsights` — Insights e streaks

### Passo 2: Perguntas da Retrospectiva

**1. O que funcionou bem?**
```
"🟢 SUCESSOS

O que deu certo esta semana?
• Técnicas que funcionaram
• Horários produtivos
• Conquistas

Liste 2-3 itens:"
```

**2. O que não funcionou?**
```
"🔴 DESAFIOS

O que não deu certo?
• Obstáculos encontrados
• Distrações
• Frustrações

Liste 2-3 itens:"
```

**3. O que aprendeu?**
```
"💡 APRENDIZADOS

Quais insights teve?
• Sobre o conteúdo estudado
• Sobre seus métodos
• Sobre você mesmo

Liste 1-2 itens:"
```

**4. Ajustes para próxima semana**
```
"🎯 AJUSTES

Baseado na análise:
• O que manter?
• O que mudar?
• O que experimentar?

Defina 1-3 ajustes concretos:"
```

### Passo 3: Análise de Dados

Apresentar análise automática:
```
📊 DADOS DA SEMANA:

⏱️ Tempo de estudo:
• Total: [X] horas
• Média diária: [Y] min
• Meta: [Z] horas
• Resultado: [✅/⚠️/❌]

📈 Streak:
• Atual: [N] dias
• Melhor: [M] dias
• Quebras: [Q]

🎯 Técnicas usadas:
1. [técnica] - [N]x
2. [técnica] - [N]x
3. [técnica] - [N]x

⚠️ Tópicos fracos (error_rate > 30%):
• [tópico 1]: [X]%
• [tópico 2]: [Y]%

📅 Progresso no plano:
• [X]% das entregas concluídas
• [Y] tópicos atrasados
• Ritmo: [adequado/lento/rápido]
```

### Passo 4: Gerar Relatório

Criar arquivo `retro-week-[N].md`:

```markdown
# Retrospectiva - Semana [N]

## 📅 Período
[Data início] - [Data fim]

## 🟢 O que Funcionou
1. [Item 1]
2. [Item 2]
3. [Item 3]

## 🔴 O que Não Funcionou
1. [Item 1]
2. [Item 2]

## 💡 Aprendizados
1. [Insight 1]
2. [Insight 2]

## 📊 Métricas
- Tempo total: [X]h
- Sessões: [N]
- Foco médio: [X]/10
- Técnicas: [lista]

## 🎯 Ajustes para Próxima Semana
1. [Ajuste 1]
2. [Ajuste 2]
3. [Ajuste 3]

## 🚀 Próxima Semana
Foco principal: [tema]
Entregas prioritárias:
- [ ] [Entrega 1]
- [ ] [Entrega 2]
```

### Passo 5: Sugerir Plano da Semana

```
✅ Retrospectiva Completa!

📄 Relatório salvo em:
projects/[modulo]/meta/retro-week-[N].md

🎯 Baseado na análise:

Recomendações:
• [Recomendação 1 baseada nos dados]
• [Recomendação 2]

Próximos passos:
a) Criar plano da próxima semana
   → /ul-plan-weekly [N+1]

b) Ajustar cronograma geral
   → [Editar learning-map.md]

c) Começar próxima semana
   → /ul-study-start
```

## Exemplo

```
Usuário: /ul-plan-retro

Sistema:
"📅 Retrospectiva Semanal

📊 Dados da semana:
• Tempo total: 8.5h (meta: 10h) ⚠️
• Sessões: 5
• Foco médio: 7.5/10
• Streak: 12 dias ✅
• Técnicas: drill(3x), feynman(2x), quiz(5x)

⚠️ Tópicos fracos:
• Recursão: 45% error_rate
• Ponteiros: 38% error_rate

---

🟢 O que funcionou bem?
[Lista do usuário]

🔴 O que não funcionou?
[Lista do usuário]

💡 Aprendizados?
[Lista do usuário]

🎯 Ajustes para próxima semana?
[Lista do usuário]

---

✅ Retrospectiva Completa!

📄 Salvo em: retro-week-12.md

💡 Análise:
• Ritmo bom mas abaixo da meta
• Quiz sendo usado efetivamente
• Recursão precisa de mais atenção

🎯 Recomendações:
• Aumentar 30min/dia para bater meta
• Focar drill em recursão
• Manter ritmo de quizzes

Próximo passo:
→ /ul-plan-weekly 13"
```

## Quando Usar

✅ **USE:**
- Todo domingo (fim de semana)
- Ao final de cada semana
- Quando sentir que precisa ajustar
- Antes de planejar próxima semana

❌ **NÃO USE:**
- No meio da semana
- Quando não tem dados suficientes (< 3 sessões)

## Integrações

**Tools:**
- `analytics.generateReport`
- `context.getRecentSessions`
- `data.getAllInsights`

**Commands:**
- `/ul-plan-weekly` — Criar plano da próxima semana
- `/ul-study-plan` — Ver progresso atual
- `/ul-study-start` — Começar próxima semana

---

*Command: /ul-plan-retro — Retrospectiva semanal*
