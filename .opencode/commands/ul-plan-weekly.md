---
description: Criar plano semanal detalhado
agent: meta
---

$1 (número da semana, opcional)

## Descrição

Cria plano semanal com objetivo SMART, cronograma diário e entregas mensuráveis. Analisa semana anterior para ajustar ritmo.

## Processo

1. **Carregar contexto** — Invocar `context-hybrid.getSessionContext`, `insights.generateReport`, `insights.getWeaknesses`. Se existe semana anterior: `context-hybrid.getRelevantSessions` (query: "semana passada"). Métricas: <60% → reduzir escopo; 80-100% → manter; >100% → aumentar desafio.
2. **Definir objetivo SMART** — Apresentar contexto (módulo, progresso, tópicos pendentes, semana anterior) e perguntar foco. Oferecer opções: continuar tópico, iniciar novo, revisar tópicos fracos, ou preparar benchmark.
3. **Distribuir entregas** — Perguntar disponibilidade de horas. Estrutura recomendada: Seg-Qua = conceitos + prática guiada; Qui-Sex = projeto prático; Sáb = benchmark + revisão.
4. **Balancear técnicas** — Verificar distribuição de Drill, Feynman, Quiz e Project. Alertar subutilizadas e sugerir ajustes.
5. **Gerar arquivo local** — Usar template @.opencode/templates/_template-week.md como base. Criar `week-[$1].md` com: revisão da semana anterior, objetivo SMART, tabela diária, checklist de entregas, métricas de sucesso, riscos/mitigações.

### 3. Persistência (pós-execução)

```
resource.mkdir({ uri: "viking://resources/ultralearning/projects/{id}/plans/" })
resource.write({
  uri: "viking://resources/ultralearning/projects/{id}/plans/week-[$1].md",
  content: "<conteúdo completo do plano>",
  mode: "replace"
})
resource.link({
  from: "viking://resources/ultralearning/projects/{id}/plans/week-[$1].md",
  to: "viking://resources/ultralearning/projects/{id}/",
  reason: "plano semanal do projeto"
})
memcommit({ wait: false })
```

6. **Apresentar resumo** — Entregas distribuídas, horas estimadas, balanceamento confirmado.

## Argumento

- `$1`: Número da semana (opcional — usa próxima semana se vazio)

## Handoff

- Plano criado → `/ul-study-start` para começar
- Precisa decompor primeiro → `/ul-plan-decompose`
- Ajustar durante a semana → `/ul-plan-adjust`
- Fim de semana → `/ul-plan-retro` antes do próximo plano