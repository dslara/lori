---
description: Reajustar cronograma baseado em desvios (/ul-plan-adjust)
agent: meta
model: opencode-go/glm-5
---

Argumento recebido: $ARGUMENTS (descrição do desvio)

## Uso
/ul-plan-adjust [situação]

## Descrição

Reajusta o plano semanal baseado em imprevistos ou adiantamento de entregas.

## Argumentos

- `situação`: Descrição do desvio
  - Exemplos: "perdi 2 dias", "terminei antes", "doente", "projeto atrasou"

## Processo

### Passo 1: Contexto

Invocar tools:
- `context-hybrid.getWeekContext` — Plano atual
- `data.getSessions` — Progresso real da semana
- `insights.generateReport` — Métricas recentes

### Passo 2: Analisar Impacto

Calcular:
```
Progresso planejado: [X]% da semana
Progresso real: [Y]% completado
Gap: [diferença]
Dias restantes: [N]
```

### Passo 3: Propor Ajustes

**Se atrasado**:
```
⚠️ Você está [X] dias atrasado.

Opções de ajuste:
1. Reduzir escopo (remover entregas menos críticas)
2. Estender prazo (mover entregas para próxima semana)
3. Intensificar (aumentar carga diária)

Recomendação: [opção] — [justificativa]

Ajustes propostos:
• [Entrega X]: mover para semana seguinte
• [Entrega Y]: reduzir para versão minimal
• [Entrega Z]: manter (prioridade alta)

Aceita? (s/n/editar)
```

**Se adiantado**:
```
✅ Você está [X] dias adiantado!

Opções:
1. Aprofundar tópico atual (ir além do planejado)
2. Iniciar próximo tópico antes
3. Fazer revisão extra (flashcards, drills)

Recomendação: [opção]

Novas entregas propostas:
• [Entrega adicional 1]
• [Entrega adicional 2]

Aceita? (s/n/editar)
```

### Passo 4: Atualizar Plano

Se aceito, modificar `projects/{modulo}/meta/week-{N}.md`:

```markdown
## 🔄 Ajuste em [DATA]

**Motivo**: [situação]
**Impacto**: [descrição]

### Plano Original
- [ ] Entrega X
- [ ] Entrega Y

### Plano Ajustado
- [ ] Entrega X (mantida)
- [x] Entrega Y (movida para semana seguinte)
- [ ] Entrega Z (nova - adicionada)
```

## Exemplos

```
Usuário: /ul-plan-adjust perdi 2 dias essa semana

Você: "
📊 Analisando impacto...

Progresso planejado: 60% da semana
Progresso real: 30% completado
Gap: -30% (equivalente a 2 dias)

⚠️ Você está 2 dias atrasado.

Opções:
1. Reduzir escopo — Remover [Feature Y]
2. Estender prazo — Mover [Feature Y] para semana seguinte
3. Intensificar — Estudar 2h/dia a mais

Recomendação: Opção 2 (extender prazo)
Motivo: Feature Y é importante mas não urgente

Ajustes:
• Feature X: manter (core)
• Feature Y: mover para próxima semana
• Revisão SRS: manter (rápido)

Aceita? (s/n/editar)
"
```

```
Usuário: /ul-plan-adjust terminei tudo antes

Você: "
📊 Analisando...

Progresso planejado: 60% da semana
Progresso real: 100% completado 🎉

✅ Você está 2 dias adiantado!

Opções:
1. Aprofundar: Implementar feature bônus
2. Próximo tópico: Começar [Tópico B] antes
3. Revisão: Fazer drill intensivo de [tópico fraco]

Recomendação: Opção 3 (revisão)
Motivo: Error rate de [tópico] está em 45%

Novas entregas:
• Drill: 10 exercícios de [tópico fraco]
• Flashcards: revisar 20 cards

Aceita? (s/n/editar)
"
```

## Integrações

**Tools utilizadas:**
- `context-hybrid.getWeekContext` — Carregar plano atual
- `data.getSessions` — Ver progresso real
- `insights.generateReport` — Métricas da semana

## Handoff

- Plano ajustado → Continuar com `/ul-study-start`
- Muitos ajustes? → `/ul-plan-retro` para revisar abordagem
- Novo módulo necessário? → `/ul-module-create`
