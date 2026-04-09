---
description: Iniciar sessão de estudo com contexto automático (/ul-study-start)
agent: tutor
model: opencode-go/kimi-k2.5
---

## Uso
/ul-study-start

## Descrição

Inicia sessão de estudo carregando contexto automático (módulo ativo, streak, SRS pendente) via OpenViking e sugere atividades baseado nas prioridades atuais.

## Processo

### Passo 1: Carregar Contexto (automático)

Usar OpenViking tools para carregar contexto:

```typescript
// 1. Carregar perfil do usuário
const profile = await memread({
  uri: "viking://user/memories/profile.md",
  level: "read"
})

// 2. Buscar sessões recentes
const sessions = await memsearch({
  query: "sessões de estudo recentes",
  limit: 5
})

// 3. Buscar flashcards pendentes
const flashcards = await memsearch({
  query: "flashcards pendentes revisão",
  limit: 10
})

// 4. Buscar padrões de erro (pontos fracos)
const weaknesses = await memsearch({
  query: "padrões de erro tópicos fracos",
  limit: 5
})
```

### Passo 2: Processar e Apresentar

```
🔥 [N] dias de streak! (se ≥ 1)

📅 Semana [X] | Módulo: [nome]
[Contexto da semana]

👉 Sugestão: [atividade baseada em prioridades]
   Porque: [justificativa]

Ou prefere: [alternativa]
```

### Passo 3: Sugestão Inteligente

**Prioridades:**
1. Se SRS pendente → Sugerir `/ul-memory-review`
2. Se weakTopics > 0 (padrões de erro encontrados) → Sugerir `/ul-practice-drill`
3. Se continuidade (sessão anterior existe) → Sugerir mesma atividade
4. Default → Perguntar objetivo

**Mapeamento de atividades:**

| Situação | Command Sugerido |
|----------|-----------------|
| Conceito novo | `/ul-learn-explain [conceito]` |
| Validar compreensão | `/ul-practice-feynman [conceito]` |
| Praticar procedimento | `/ul-practice-drill [conceito]` |
| Construir projeto | `/ul-practice-project [desafio]` |
| Setup de projeto | `/ul-setup-scaffold [projeto]` |
| Revisar flashcards | `/ul-memory-review` |
| Procrastinando | `/ul-productivity-start` |

### Passo 4: Decisão do Usuário

Apresentar sugestão e aguardar escolha:
- Aceitar sugestão → Redirecionar para command sugerido
- Escolher alternativa → Redirecionar para command alternativo
- Definir próprio objetivo → Sugerir command baseado na descrição

## Exemplo de Interação

**Com plano:**
```
Usuário: /ul-study-start

Sistema:
"📅 Semana 3 — Quinta-feira | Módulo: go-os-cpu
Entrega pendente: Projeto API (Parte 2)
Ontem: completou a Parte 1 (routers + models)

👉 Sugestão: /ul-practice-project 'API parte 2 — repositories e autenticação'
Porque: é continuação direta do que ficou pendente.

Ou prefere aquecer primeiro? → /ul-practice-quiz 3 autenticação"
```

**Sem plano:**
```
Usuário: /ul-study-start

Sistema:
"Não tem contexto salvo? Sem problema.
O que planejou fazer hoje? (tópico + tipo de atividade)"

Usuário: "quero praticar recursão, tenho 45 minutos"

Sistema:
"👉 Para 45 minutos de prática focada em recursão:
→ /ul-practice-drill recursão

Se preferir entender antes de praticar:
→ /ul-learn-explain recursão → depois /ul-practice-feynman recursão"
```

## Estrutura OpenViking

O contexto é carregado de:

| Dado | Tool OpenViking |
|------|----------------|
| Perfil do usuário | `memread("viking://user/memories/profile.md")` |
| Sessões recentes | `memsearch({ query: "sessões recentes" })` |
| Flashcards pendentes | `memsearch({ query: "flashcards pendentes" })` |
| Padrões de erro | `memsearch({ query: "padrões de erro" })` |
| Plano da semana | `memread("viking://user/projects/[module]/meta/week-*.md")` |

Se o arquivo/plano não existir, perguntar ao usuário.

## Fallback se OpenViking Indisponível

Se `memread` ou `memsearch` falharem, usar fallback interativo:

```
"Não consegui carregar contexto do OpenViking.

Me conte:
1. Qual módulo está estudando?
2. O que fez na última sessão?
3. Tem flashcards pendentes?

Vou te ajudar a planejar a sessão."
```

## Integrações

**Tools OpenViking utilizadas:**
- `memread` — Carregar perfil e planos
- `memsearch` — Buscar sessões, flashcards, padrões
- `membrowse` — Navegar estrutura de projetos (opcional)

**Commands relacionados:**
- `/ul-study-end` — Encerrar sessão
- `/ul-study-plan` — Ver progresso
- `/ul-memory-review` — Revisar flashcards
- `/ul-practice-*` — Práticas sugeridas
- `/ul-learn-*` — Aprendizado sugerido

**Skills utilizadas:**
- `openviking-context` — Carregar contexto hierárquico
- `session` — Processar contexto

## Handoff

- Usuário aceita sugestão → Redireciona para command apropriado
- Usuário quer planejar → `/ul-plan-weekly`
- Usuário está atrasado → `/ul-retro-weekly` para ajustar

---

*Command: /ul-study-start — Início de sessão com contexto inteligente via OpenViking*