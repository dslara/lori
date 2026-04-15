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
1. `memread` com URI `viking://user/memories/profile.md` nível `read` — perfil do usuário
2. `memsearch` com query `"sessões de estudo recentes"`, `limit: 5` — sessões recentes
3. `memsearch` com query `"flashcards pendentes revisão"`, `limit: 10` — flashcards pendentes
4. `memsearch` com query `"padrões de erro tópicos fracos"`, `limit: 5` — pontos fracos

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
1. Se SRS pendente → Sugerir `/ul-study-recall`
2. Se weakTopics > 0 (padrões de erro encontrados) → Sugerir `/ul-study-drill`
3. Se continuidade (sessão anterior existe) → Sugerir mesma atividade
4. Default → Perguntar objetivo

**Mapeamento de atividades:**

| Situação | Command Sugerido |
|----------|-----------------|
| Conceito novo | `/ul-study-learn [conceito]` |
| Validar compreensão | `/ul-study-feynman [conceito]` |
| Praticar procedimento | `/ul-study-drill [conceito]` |
| Construir projeto | `/ul-study-project [desafio]` |
| Setup de projeto | `/ul-setup-scaffold [projeto]` |
| Revisar flashcards | `/ul-study-recall` |
| Procrastinando | `/ul-study-start` |

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

👉 Sugestão: /ul-study-project 'API parte 2 — repositories e autenticação'
Porque: é continuação direta do que ficou pendente.

Ou prefere aquecer primeiro? → /ul-study-quiz 3 autenticação"
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
→ /ul-study-drill recursão

Se preferir entender antes de praticar:
→ /ul-study-learn recursão → depois /ul-study-feynman recursão"
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
- `/ul-study-recall` — Revisar flashcards
- `/ul-study-drill` — Prática sugerida
- `/ul-study-learn` — Aprendizado sugerido

**Skills utilizadas:**
- `openviking-context` — Carregar contexto hierárquico
- `session` — Processar contexto

## Handoff

- Usuário aceita sugestão → Redireciona para command apropriado
- Usuário quer planejar → `/ul-plan-weekly`
- Usuário está atrasado → `/ul-plan-retro` para ajustar

---

*Command: /ul-study-start — Início de sessão com contexto inteligente via OpenViking*