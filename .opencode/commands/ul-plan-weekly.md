---
description: Criar plano semanal detalhado (/ul-plan-weekly)
agent: meta
subtask: false
---

## Uso
/ul-plan-weekly [semana]

## Descrição

Cria plano detalhado para a semana, distribuindo entregas e definindo foco diário.

## Processo

### Passo 1: Contexto

Invocar tools:
- `context.getWeekContext` — Contexto atual
- `analytics.generateReport` — Ritmo recente
- `context.getFullContext` — Módulo e metas

### Passo 2: Definir Foco da Semana

Perguntar:
```
"📅 Plano Semanal - Semana [N]

Qual o foco principal desta semana?

Contexto:
• Módulo atual: [nome]
• Progresso: [X]%
• Tópicos pendentes: [lista]

Opções:
a) Continuar tópico atual: [tópico]
b) Iniciar novo tópico: [tópico]
c) Revisar tópicos fracos
   ([lista de tópicos com error_rate > 30%])
d) Preparar para benchmark

Escolha: __________"
```

### Passo 3: Distribuir Entregas

Baseado no foco e ritmo do usuário:

```
"⏱️ Seu ritmo médio: [X] horas/semana
Disponibilidade esta semana: __h

Distribuindo entregas:

📅 CRONOGRAMA:

Segunda:
• [Entrega 1]
• Técnica sugerida: [drill/feynman/etc]
• Tempo: [X]h

Terça:
• [Entrega 2]
• Técnica sugerida: [...]
• Tempo: [X]h

Quarta:
• [Entrega 3]
...

Quinta:
...

Sexta:
...

Sábado:
• Buffer/revisão

Domingo:
• /ul-plan-retro
```

### Passo 4: Balancear Técnicas

Verificar distribuição de técnicas:
```
📊 Técnicas esta semana:
• Drill: [N]x
• Feynman: [N]x
• Quiz: [N]x
• Project: [N]x

⚠️ Técnicas subutilizadas: [lista]
💡 Sugestão: incluir [técnica] na quinta
```

### Passo 5: Gerar Arquivo week-[N].md

```markdown
# Semana [N] - [Foco]

## 📋 Overview
- **Período:** [data] a [data]
- **Foco:** [tema principal]
- **Meta de tempo:** [X] horas
- **Entregas:** [N] tarefas

## 🎯 Objetivos
1. [Objetivo 1]
2. [Objetivo 2]
3. [Objetivo 3]

## 📅 Cronograma

### Segunda-feira
- [ ] [Entrega 1]
  - Técnica: [drill/feynman/etc]
  - Tempo estimado: [X]h
  - Recursos: [links]

### Terça-feira
- [ ] [Entrega 2]
  - Técnica: [...]
  - Tempo estimado: [X]h

### Quarta-feira
- [ ] [Entrega 3]
  ...

### Quinta-feira
- [ ] [Entrega 4]
  ...

### Sexta-feira
- [ ] [Entrega 5]
  ...

### Sábado
- [ ] Buffer/Revisão
  - Revisar o que ficou pendente
  - Praticar tópicos fracos
  - SRS review

### Domingo
- [ ] Retrospectiva
  - /ul-plan-retro
  - Ajustar próxima semana

## 📊 Métricas de Sucesso
- [ ] 80%+ das entregas concluídas
- [ ] Foco médio ≥ 7/10
- [ ] Pelo menos 5 dias de estudo
- [ ] Revisar SRS 3x

## 🚨 Riscos e Mitigações
- **Risco:** [possível problema]
  - **Mitigação:** [solução]

## 📝 Notas
[ espaço para anotações durante a semana ]
```

### Passo 6: Apresentar e Iniciar

```
✅ Plano Semanal Criado!

📄 Arquivo: week-[N].md

📊 Resumo:
• [N] entregas distribuídas
• [X] horas estimadas
• Balanceamento de técnicas
• Buffer no sábado

🎯 Foco: [tema]

🚀 Próximo passo:
→ /ul-study-start para começar
   segunda-feira!
```

## Exemplo

```
Usuário: /ul-plan-weekly 5

Sistema:
"📅 Criando Plano - Semana 5

Contexto:
• Módulo: M1-math-foundations
• Progresso: 45%
• Ritmo: 8h/semana

Qual foco desta semana?

a) Continuar: Recursão
b) Novo: Programação Dinâmica
c) Revisar: Ponteiros (error_rate 40%)
d) Preparar: Benchmark de algoritmos"

Usuário: "a) Continuar recursão"

Sistema:
"⏱️ Disponibilidade esta semana?"

Usuário: "10 horas"

Sistema:
"Distribuindo entregas:

📅 SEMANA 5 - Recursão

Segunda (2h):
• Drill: 10 problemas de recursão básica
• Técnica: /ul-practice-drill

Terça (2h):
• Feynman: Explicar recursão
• Técnica: /ul-practice-feynman

Quarta (2h):
• Projeto: Implementar busca binária
• Técnica: /ul-practice-project

Quinta (2h):
• Quiz: Testar compreensão
• SRS review
• Técnica: /ul-practice-quiz + /ul-memory-review

Sexta (2h):
• Debug: Resolver problemas de recursão
• Técnica: /ul-learn-debug

Sábado:
• Buffer para o que atrasar
• Revisão extra

Domingo:
• /ul-plan-retro

✅ Plano Criado!

📄 week-05.md gerado

🚀 Começar segunda?
→ /ul-study-start"
```

## Quando Usar

✅ **USE:**
- Domingo (próxima semana)
- Após retrospectiva
- Início de nova fase
- Quando mudar de direção

❌ **NÃO USE:**
- No meio da semana (ajuste manual)
- Sem contexto do módulo

## Integrações

**Tools:**
- `context.getWeekContext`
- `analytics.generateReport`
- `analytics.getErrorRateByTopic`

**Commands:**
- `/ul-plan-retro` — Antes de criar novo plano
- `/ul-study-start` — Começar a executar
- `/ul-plan-decompose` — Se não tem learning-map

---

*Command: /ul-plan-weekly — Criar plano semanal detalhado*
