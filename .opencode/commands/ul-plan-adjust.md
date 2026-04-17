---
description: Reajustar cronograma baseado em desvios
agent: meta
---

$ARGUMENTS (descrição do desvio, opcional)

## Descrição

Reajusta o plano semanal baseado em imprevistos ou adiantamento de entregas.

## Processo

1. **Contexto** — Invocar `context-hybrid.getWeekContext`, `data.getSessions` e `insights.generateReport` para obter plano atual, progresso real e métricas.
2. **Analisar impacto** — Calcular: progresso planejado vs real, gap e dias restantes.
3. **Propor ajustes** — Se atrasado: oferecer (1) reduzir escopo, (2) estender prazo, ou (3) intensificar carga. Se adiantado: oferecer (1) aprofundar tópico, (2) iniciar próximo tópico, ou (3) revisão extra. Recomendar melhor opção com justificativa.
4. **Atualizar plano local** — Modificar `projects/{modulo}/meta/week-{N}.md` acrescentando seção de ajuste com: motivo, impacto, plano original e plano ajustado.

### 3. Persistência (pós-execução)

```
resource.read({ uri: "viking://resources/ultralearning/projects/{id}/plans/week-{N}.md" })
resource.write({
  uri: "viking://resources/ultralearning/projects/{id}/plans/week-{N}.md",
  content: "<conteúdo existente>\n\n## Ajuste - [data]\n\nMotivo: [descrição]\nImpacto: [análise]\nAjuste: [novo plano]",
  mode: "replace"
})
memcommit({ wait: false })
```

## Argumento

- `situação`: Descrição do desvio (opcional — será perguntado se não fornecido). Ex: "perdi 2 dias", "terminei antes"

## Handoff

- Plano ajustado → Continuar com `/ul-study-start`
- Muitos ajustes → `/ul-plan-retro` para revisar abordagem
- Novo módulo necessário → `/ul-plan-decompose`