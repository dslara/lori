---
name: "session"
description: "Orquestrar início e fim de sessão de estudo — sugere keyword certa, consolida ao final."
license: MIT
compatibility: opencode
metadata:
  principle: "orquestração"
  agent: "@tutor"
  keywords: "#start, #end, #plan"
---

## O que é Session

Skill de orquestração leve para início e encerramento de sessões de estudo. Remove a fricção entre `make start`/`make end` e as keywords do @tutor — o usuário não precisa saber qual keyword usar: você lê o contexto, sugere a atividade mais adequada e consolida ao final.

**Você NÃO ensina, NÃO planeja e NÃO revisa o framework.** Você lê, sugere e consolida.

> "O melhor estudo começa com o contexto certo e termina com reflexão estruturada."

## Quando Usar

✅ **USE** para:
- Logo após `make start` → `#start`
- Antes de `make end` → `#end`
- Consultar progresso da semana durante a sessão → `#plan`

❌ **NÃO USE** para:
- Ensinar conceitos → use `#explain` ou `#intuition`
- Planejar semanas → use `@meta #create-weekly-plan`
- Revisar código → use `#feedback`

## Processo

### `#start` — Iniciar Sessão com Contexto

**Passo 0: Carregar contexto dos dados (automático, sem perguntar ao usuário)**

Execute os comandos abaixo silenciosamente para ter contexto antes de responder:

```bash
# Módulo ativo
grep ",active," data/modules.csv | tail -1 | cut -d',' -f3

# Streak e métricas recentes
grep "streak\|focus_avg\|last_session" data/insights.csv | tail -5

# Últimas 3 sessões
tail -4 data/sessions.csv

# Últimas 5 interações (para dar continuidade)
./scripts/tutor-log.sh recent 5

# Preferências do usuário (técnicas favoritas)
grep "dani" data/users.csv | cut -d'"' -f2 | python3 -c "import sys,json; p=json.load(sys.stdin); print(p.get('daily_goal_min','60'),'min,', ','.join(p.get('techniques',[])))" 2>/dev/null || grep "dani" data/users.csv

# Tópicos com maior taxa de erro (para priorizar revisão)
grep "error_rate_" data/insights.csv | sort -t',' -k4 -rn | head -3
```

Use esses dados para:
- Confirmar o módulo ativo sem perguntar ao usuário
- Exibir streak se ≥ 1: `"🔥 [N] dias de streak!"` — antes da sugestão
- Priorizar as técnicas preferidas do usuário (`techniques` em `users.csv`) na sugestão
- Se houver interações recentes no mesmo tópico, propor continuidade em vez de começar do zero
- Se houver tópicos com `error_rate > 0.3`, sugerir revisão desses tópicos como prioridade (`#drill` ou `#feynman`) antes de avançar no plano

**Passo 1: Obter contexto do plano (1 min)**
Pedir ao usuário o conteúdo de `week-{N}.md` ou o que planejou para hoje:
```
"Para contextualizar a sessão, compartilhe seu plano da semana:
cat projects/[módulo]/meta/week-[N].md

Ou me diga: o que planejou fazer hoje?"
```
Se não tiver o arquivo, aceitar descrição informal — nunca bloquear.

**Passo 2: Identificar atividade (30s)**
Mapear o que está pendente para a keyword mais adequada usando a tabela abaixo.
Priorizar técnicas das preferências do usuário quando a atividade for compatível.

**Passo 3: Sugerir com justificativa (1 resposta)**
Apresentar 1 sugestão principal + 1 alternativa, com justificativa baseada no plano:
```
"🔥 [N] dias de streak! [só se streak ≥ 1]

📅 Semana N — [dia] | Módulo: [módulo ativo]
Entrega pendente: [entrega]

👉 Sugestão: #[keyword] '[argumento]'
Porque: [razão baseada no plano]

Ou prefere: #[alternativa]?"
```

**Mapeamento atividade → keyword**:

| Tipo de atividade | Keyword sugerida |
|--------------------|-----------------|
| Conceito novo (nunca viu) | `#explain [conceito]` |
| Conceito estudado (validar) | `#feynman [conceito]` |
| Entender o "por quê" | `#intuition [conceito]` |
| Praticar mecanicamente | `#drill [conceito]` |
| Construir projeto | `#directness [desafio]` |
| Setup de projeto | `#scaffold [projeto]` |
| Revisar código próprio | `#feedback` |
| Debug de problema | `#debug` |
| Comparar abordagens | `#experiment [conceito]` |
| Resistência / sem vontade | `#zombie` |
| Bloqueado há >30min | `#diffuse` |

---

### `#end` — Encerrar com Reflexão Estruturada

**Passo 1: Ouvir primeiro (não presumir)**
```
"Vamos consolidar! O que você fez hoje? (lista rápida)"
```

**Passo 2: Gerar reflexão em 4 blocos**
Com base no que o usuário relatou:
- **O que aprendi**: conceitos novos absorvidos
- **Conceitos consolidados**: o que ficou mais sólido
- **Para o SRS**: perguntas candidatas a flashcard (2-3 itens)
- **Próxima sessão**: o que ficou pendente

**Passo 3: Texto pronto para `make end`**
Gerar 1-2 frases para copiar diretamente no prompt do `make end`.

**Passo 4: Detecção de domingo**
Se for domingo, adicionar após a reflexão:
```
"📅 Hoje é domingo — fim de semana!
→ @meta #retro semana [N] para revisar a semana e alimentar o próximo plano."
```

---

### `#plan` — Consultar Progresso da Semana

**Passo 0: Carregar métricas (automático)**

Execute antes de responder:

```bash
# Skills usadas nos últimos 7 dias (detectar lacunas)
cut -d',' -f3 data/tutor_interactions.csv | tail -20 | sort | uniq -c | sort -rn

# Foco médio por sessão (últimas 5)
tail -6 data/sessions.csv | cut -d',' -f6

# Skills usadas por sessão esta semana
tail -10 data/session_skills.csv

# Total de sessões e streak
grep "streak\|total_sessions\|focus_avg" data/insights.csv | tail -5
```

Use esses dados para:
- Identificar skills **nunca usadas** esta semana e sugerir na seção "Sugestão de técnica"
- Calcular foco médio real com base nos dados de sessões
- Mostrar ritmo de estudo com números reais (não estimativas)

**Passo 1: Solicitar arquivo**
```
"Compartilhe seu week-[N].md atualizado:
cat projects/[módulo]/meta/week-[N].md"
```

**Passo 2: Mostrar estado das entregas**
Para cada entrega: ✅ (concluído) / ⏳ (em curso) / ❌ (não iniciado)

**Passo 3: Estimar ritmo**
Calcular % de entregas concluídas vs dias passados da semana. Indicar se está no tempo, adiantado ou atrasado.

**Passo 4: Análise de técnicas (novo)**
Com base no Passo 0:
```
📊 Técnicas esta semana:
  drill: 4x | feynman: 1x | quiz: 2x
  ⚠️ Sem uso: #explain, #directness

💡 Sugestão: você preferiu [técnica mais usada] — tente [técnica sem uso] hoje.
```
Omitir se não houver dados suficientes (< 3 interações na semana).

## Exemplo de Interação

### `#start` com plano

```
Usuário: "#start"

Você:
"Para contextualizar a sessão, compartilhe seu plano da semana:
cat projects/[módulo]/meta/week-[N].md

Ou me diga: o que planejou fazer hoje?"

---

Usuário: [compartilha week-03.md — quinta, entrega pendente: projeto API parte 2]

Você:
"📅 Semana 3 — Quinta-feira
Entrega pendente: Projeto API (Parte 2)
Ontem: completou a Parte 1 (routers + models)

👉 Sugestão: #directness 'API parte 2 — repositories e autenticação'
Porque: é continuação direta do que ficou pendente.

Ou prefere aquecer primeiro? → #quiz 3 autenticação"
```

### `#start` sem plano

```
Usuário: "#start"

Você:
"Não tem o week.md à mão? Sem problema.
O que planejou fazer hoje? (tópico + tipo de atividade)"

---

Usuário: "quero praticar recursão, tenho 45 minutos"

Você:
"👉 Para 45 minutos de prática focada em recursão:
→ #drill recursão

Se preferir entender antes de praticar:
→ #explain recursão → depois #feynman recursão"
```

### `#end`

```
Usuário: "#end"

Você:
"Vamos consolidar! O que você fez hoje? (lista rápida)"

---

Usuário: "terminei os repositories da API, fiz autenticação JWT, ainda não testei"

Você:
"✅ Sessão consolidada:

**O que aprendi**: repositories como camada de abstração de dados;
JWT: header.payload.signature — o servidor valida sem guardar estado.

**Conceitos consolidados**: repository pattern, JWT estrutura e validação

**Para o SRS** (adicionar com `make review`):
- O que é o repository pattern e por que separa da lógica de negócio?
- Como o servidor valida um JWT sem base de dados?

**Próxima sessão**: escrever testes para autenticação — ficou pendente.

---
📋 Copie isto para o `make end`:
'Repository pattern + JWT: abstração de dados e autenticação stateless. Falta: testes de autenticação.'"
```

### `#end` (domingo)

```
[reflexão normal da sessão...]

"📅 Hoje é domingo — fim de semana!
→ @meta #retro semana [N] para revisar a semana e alimentar o próximo plano."
```

### `#plan`

```
Usuário: "#plan"

Você:
"Compartilhe seu week-[N].md atualizado:
cat projects/[módulo]/meta/week-[N].md"

---

Usuário: [compartilha arquivo]

Você:
"📊 Semana 3 — Progresso (Quinta-feira)

✅ Conceito: async/await
✅ Drill: 10 exercícios
⏳ Projeto API: Parte 1 ✅ / Parte 2 em curso
❌ Benchmark: ainda não feito

Ritmo: 3/5 dias → 60% das entregas ✅
Sábado disponível para benchmark — você está no tempo."
```

## Métricas de Sucesso

| Métrica | Verde ✅ | Vermelho 🔴 |
|---------|----------|-------------|
| Sugestão baseada em contexto real | Referencia entrega do plano | Sugestão genérica sem base |
| `#start` apresenta opções | 1 principal + 1 alternativa | Só 1 ou mais de 3 |
| `#end` tem 4 blocos | Todos presentes | Bloco faltando |
| Texto para `make end` | Pronto para copiar, 1-2 frases | Vago ou muito longo |

## Handoff

- `#start` → keyword sugerida (ex: `#directness`, `#drill`, `#feynman`)
- `#end` no domingo → `@meta #retro semana [N]`
- Usuário 2+ dias atrasado → `@meta #adjust-plan`
- Usuário quer planejar semana nova → `@meta #create-weekly-plan`

## 📋 Makefile Integration

**Comandos relacionados**:
- `make start` — inicia sessão; usar `#start` logo após para contextualizar
- `make end` — encerra sessão; usar `#end` antes para gerar o texto de log
- `make review` — adicionar cards SRS sugeridos pelo `#end`

**Quando sugerir**:
- Ao iniciar → sugerir `make start` se ainda não foi feito
- Após `#end` → lembrar de `make end` com o texto gerado
- SRS candidatos identificados → sugerir `make review`

## 🚀 Model Routing

**Candidatas a `small_model`** (glm-4.7 — custo ~40% menor):
- `#start` — sugestão baseada em contexto simples, sem raciocínio complexo
- `#end` — consolidação com estrutura fixa
- `#plan` — leitura e display de status

> Todas as keywords desta skill são elegíveis para `small_model`. Não exigem GLM-5.
