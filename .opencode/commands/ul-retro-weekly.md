---
description: Criar retrospectiva semanal (/ul-retro-weekly)
agent: meta
model: opencode-go/minimax-m2.5
---

## Uso
/ul-retro-weekly

## Descrição
Cria retrospectiva semanal com estatísticas automáticas do módulo ativo.

## Processo

### Passo 1: Coletar Estatísticas

- Sessões da semana (últimos 7 dias)
- Tempo total estudado
- Foco médio
- Comparação com meta (6 sessões/semana)

### Passo 2: Fazer Perguntas Guiadas

1. **O que funcionou?**
   - Técnicas que ajudaram
   - Horários produtivos
   - Recursos úteis

2. **O que não funcionou?**
   - Dificuldades encontradas
   - Interrupções
   - Obstáculos

3. **Foco da próxima semana?**
   - Melhorias a implementar
   - Novos objetivos
   - Ajustes de plano

### Passo 3: Criar Arquivo de Retro

- Determinar número da semana
- Criar `meta/retro-week-N.md`
- Incluir estatísticas automáticas
- Adicionar respostas do usuário

### Passo 4: Oferecer Próximos Passos

- Criar plano da próxima semana
- Ajustar objetivos
- Revisar flashcards

## Output

```
📝 Retrospectiva Semanal

📊 Estatísticas da Semana:
   Sessões: 5/6
   Tempo total: 280 minutos
   Foco médio: 7.8/10
   ⚠️ 1 sessão para meta

✅ O que funcionou bem esta semana?

Usuário: [digita resposta]

❌ O que não funcionou ou poderia melhorar?

Usuário: [digita resposta]

🎯 Qual o foco da próxima semana?

Usuário: [digita resposta]

✓ Retrospectiva salva: projects/M1-python/meta/retro-week-3.md

📈 Próximos passos:
  /ul-plan-weekly 4    → Criar plano da semana 4
  /ul-memory-review    → Revisar flashcards
  /ul-study-start      → Continuar estudando
```

## Exemplos

### Exemplo 1: Semana produtiva

```
Usuário: /ul-retro-weekly

Sistema:
"📝 Retrospectiva Semanal - M1-python

📊 Estatísticas da Semana (14/07 a 20/07):
   ✓ Sessões: 7/6 (meta ultrapassada!)
   ✓ Tempo total: 420 minutos (7h)
   ✓ Foco médio: 8.5/10
   ✅ Excelente semana!

✅ O que funcionou bem esta semana?"

Usuário: "Pomodoro de 25 min focado + pausas de 5 min. Manhã cedo foi muito produtivo."

Sistema: "❌ O que não funcionou ou poderia melhorar?"

Usuário: "Terças à tarde foi difícil concentrar. Muitas interrupções."

Sistema: "🎯 Qual o foco da próxima semana?"

Usuário: "Manter horário da manhã. Adicionar 1 sessão à noite. Focar em recursão."

Sistema:
"✓ Retrospectiva salva: projects/M1-python/meta/retro-week-3.md

📈 Análise:
  • Você está acima da meta!
  • Manutenção: continuar técnica Pomodoro
  • Melhoria: evitar terças à tarde
  
Próximos passos:
  /ul-plan-weekly 4  → Criar plano para semana 4"
```

### Exemplo 2: Semana difícil

```
Usuário: /ul-retro-weekly

Sistema:
"📝 Retrospectiva Semanal - M2-zig

📊 Estatísticas da Semana:
   ⚠️ Sessões: 2/6
   Tempo total: 90 minutos
   Foco médio: 6.0/10
   ❌ Abaixo da meta (faltam 4 sessões)

✅ O que funcionou bem esta semana?"

Usuário: "Pelo menos consegui manter a consistência, mesmo que pouco tempo."

Sistema: "❌ O que não funcionou?"

Usuário: "Semana muito corrida no trabalho. Chegava cansado em casa. Não consegui focar."

Sistema: "🎯 Foco da próxima semana?"

Usuário: "Reduzir meta para 4 sessões. Aproveitar fim de semana. Focar em exercícios simples."

Sistema:
"✓ Retrospectiva salva: projects/M2-zig/meta/retro-week-5.md

📈 Análise:
  • Semana desafiadora identificada
  • Ajuste de meta: 6 → 4 sessões
  • Estratégia: aproveitar fim de semana
  
💡 Recomendações:
  • /ul-productivity-start  → Técnicas contra procrastinação
  • /ul-plan-weekly 6      → Plano realista para próxima semana
  • Seja gentil consigo - consistência > intensidade"
```

### Exemplo 3: Semana média

```
Usuário: /ul-retro-weekly

Sistema:
"📝 Retrospectiva Semanal - M3-algorithms

📊 Estatísticas da Semana:
   Sessões: 5/6
   Tempo total: 300 minutos
   Foco médio: 7.2/10
   ⚠️ 1 sessão para meta

[continua interação...]"
```

## Estrutura do Arquivo de Retro

```markdown
# Retro Semana 3 - M1-python

**Data**: 2026-03-10
**Módulo**: M1-python

## 📊 Estatísticas da Semana

- **Sessões**: 5/6
- **Tempo Total**: 280 minutos
- **Foco Médio**: 7.8/10
- **Período**: 2026-03-03 a 2026-03-10

## ✅ O que funcionou

Pomodoro de 25 min focado + pausas de 5 min. Manhã cedo foi muito produtivo.

## ❌ O que não funcionou

Terças à tarde foi difícil concentrar. Muitas interrupções.

## 🎯 Foco próxima semana

Manter horário da manhã. Adicionar 1 sessão à noite. Focar em recursão.

## 📝 Notas Adicionais

_Adicione observações extras aqui_

---
*Gerado automaticamente em 2026-03-10T14:30:00Z*
```

## Perguntas Guiadas

O command faz perguntas para facilitar a reflexão:

### O que funcionou?
- Quais técnicas foram mais efetivas?
- Em que horários você foi mais produtivo?
- Quais recursos foram mais úteis?

### O que não funcionou?
- Quais obstáculos você encontrou?
- Houve interrupções frequentes?
- Algo atrapalhou o foco?

### Foco da próxima semana?
- O que você quer melhorar?
- Quais são os novos objetivos?
- Que ajustes fazer no plano?

## Métricas Automáticas

O command calcula automaticamente:

| Métrica | Cálculo | Meta |
|---------|---------|------|
| **Sessões** | Contagem dos últimos 7 dias | ≥ 6 |
| **Tempo total** | Soma de `duration_min` | - |
| **Foco médio** | Média de `focus_score` | ≥ 7 |
| **Status** | Baseado em sessões | excellent/good/needs_improvement |

## Numeração de Semanas

- Automática baseada em arquivos existentes
- `retro-week-1.md`, `retro-week-2.md`, etc.
- Não usa semana ISO do ano (usa sequencial do módulo)

## Validações

- Módulo ativo deve existir
- Dados da semana disponíveis (ou mostra zeros)
- Respostas não podem ser vazias

## Integração com Tools

Este command invoca:
- `retro.getWeeklyStats` - Obter estatísticas
- `retro.createRetro` - Criar arquivo

## Ver Também

- `/ul-plan-weekly` - Criar plano semanal
- `/ul-study-plan` - Ver progresso da semana
- `projects/*/meta/retro-week-*.md` - Arquivos de retro
