---
description: Ver progresso da semana e plano atual (/ul-study-plan)
agent: tutor
model: opencode-go/minimax-m2.5
---

## Uso
/ul-study-plan

## Descrição

Visualiza progresso da semana atual: tópicos concluídos, em andamento e pendentes, análise de técnicas usadas e sugestões de ajuste. Dados carregados via OpenViking.

## Processo

### Passo 1: Carregar Dados

Usar OpenViking tools:

```typescript
// 1. Carregar plano da semana
const weekPlan = await memread({
  uri: "viking://user/projects/[module]/meta/week-*.md",
  level: "read"
})

// 2. Buscar sessões recentes
const sessions = await memsearch({
  query: "sessões recentes semana atual",
  limit: 20
})

// 3. Buscar métricas gerais
const insights = await memread({
  uri: "viking://user/memories/insights.md",
  level: "read"
})

// 4. Buscar pontos fracos
const weaknesses = await memsearch({
  query: "padrões de erro tópicos fracos",
  limit: 5
})
```

### Passo 2: Apresentar Progresso

```
📅 Semana [N] — [Módulo Ativo]

Progresso:
✅ [Tópico 1] — Concluído (2h)
🔄 [Tópico 2] — Em andamento (1h)
⏳ [Tópico 3] — Pendente
❌ [Tópico 4] — Não iniciado

⏱️ Tempo total: [X]h
🔥 Streak: [N] dias
📊 Foco médio: [N]/10
```

### Passo 3: Análise de Técnicas

```
📊 Técnicas esta semana:
• drill: 4x
• feynman: 1x
• quiz: 2x
⚠️ Sem uso: /ul-study-learn, /ul-study-project

💡 Sugestão: você preferiu drill — tente alternar com 
   feynman para validar compreensão.
```

### Passo 4: Ritmo e Projeção

Calcular:
- **% de entregas concluídas** vs dias passados
- **Se está no tempo**, adiantado ou atrasado
- **Projeção** de conclusão se manter ritmo atual

### Passo 5: Tópicos Fracos

Se encontrar padrões de erro:
```
⚠️ Pontos de atenção:
• [Tópico A]: error_rate 45%
• [Tópico B]: error_rate 38%

💡 Sugestão: usar /ul-study-drill em [Tópico A]
   antes de avançar para conteúdo novo.
```

### Passo 6: Próximos Passos

Sugerir baseado no estado atual:
- Se atrasado → `/ul-plan-retro` ou `/ul-plan-weekly`
- Se tópicos fracos → `/ul-study-drill`
- Se SRS pendente → `/ul-study-recall`
- Se no ritmo → Continuar com `/ul-study-start`

## Exemplo de Interação

```
Usuário: /ul-study-plan

Sistema:
"📅 Semana 3 — Progresso (Quinta-feira)
Módulo: go-os-cpu

✅ Conceito: async/await (2h)
✅ Drill: 10 exercícios (1.5h)
🔄 Projeto API: Parte 1 ✅ / Parte 2 em curso (2h)
❌ Benchmark: ainda não feito

⏱️ Tempo total: 5.5h
🔥 Streak: 12 dias
📊 Foco médio: 8/10

📊 Técnicas esta semana:
• drill: 5x | feynman: 1x | quiz: 2x | project: 1x
⚠️ Sem uso: /ul-study-learn

📈 Ritmo: 60% das entregas em 4/5 dias ✅
Você está no tempo! Sábado é ideal para o benchmark.

⚠️ Pontos de atenção:
• Error handling: error_rate 42%

💡 Sugestões:
1. Praticar error handling → /ul-study-drill
2. Validar com feynman antes do benchmark → /ul-study-feynman
3. Criar flashcards para padrões de erro → /ul-study-memorize"
```

## Estrutura OpenViking

Os dados são buscados de:

| Dado | URI OpenViking |
|------|---------------|
| Plano da semana | `viking://user/projects/[module]/meta/week-*.md` |
| Sessões recentes | `memsearch({ query: "sessões recentes" })` |
| Insights | `viking://user/memories/insights.md` |
| Pontos fracos | `memsearch({ query: "padrões de erro" })` |

## Integrações

**Tools OpenViking utilizadas:**
- `memread` — Carregar plano e insights
- `memsearch` — Buscar sessões e padrões de erro
- `membrowse` — Navegar estrutura (opcional)

**Commands relacionados:**
- `/ul-study-start` — Iniciar sessão
- `/ul-study-drill` — Praticar tópicos fracos
- `/ul-study-recall` — Revisar SRS pendente
- `/ul-plan-retro` — Ajustar se atrasado
- `/ul-plan-weekly` — Replanejar semana

## Handoff

- Usuário atrasado → `/ul-plan-retro` ou `/ul-plan-weekly`
- Tópicos fracos identificados → `/ul-study-drill`
- Quer mudar ritmo → `/ul-plan-weekly`
- Tudo certo → `/ul-study-start`

---

*Command: /ul-study-plan — Visão geral do progresso semanal via OpenViking*