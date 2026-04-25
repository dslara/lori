---
description: Iniciar sessão de estudo com contexto automático (/ul-study-start)
agent: tutor
model: opencode-go/minimax-m2.5
---

## Uso
/ul-study-start

## Descrição

Inicia sessão de estudo carregando contexto automático (módulo ativo, streak, SRS pendente) e sugere atividades baseado nas prioridades atuais.

## Processo

### Passo 1: Carregar Contexto (automático)
Invocar tool `context.getFullContext`:
- Módulo ativo
- Streak atual  
- SRS pendente
- Sessões recentes
- Error rates por tópico

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
2. Se error_rate > 0.3 → Sugerir `/ul-practice-drill`
3. Se continuidade → Sugerir mesma atividade anterior
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
"Não tem o week.md à mão? Sem problema.
O que planejou fazer hoje? (tópico + tipo de atividade)"

Usuário: "quero praticar recursão, tenho 45 minutos"

Sistema:
"👉 Para 45 minutos de prática focada em recursão:
→ /ul-practice-drill recursão

Se preferir entender antes de praticar:
→ /ul-learn-explain recursão → depois /ul-practice-feynman recursão"
```

## Integrações

**Tools utilizadas:**
- `context.getFullContext` — Carrega contexto completo
- `insights.getWeaknesses` — Identifica tópicos fracos
- `data.getFlashcards` — Verifica SRS pendente

**Commands relacionados:**
- `/ul-study-end` — Encerrar sessão
- `/ul-study-plan` — Ver progresso
- `/ul-memory-review` — Revisar flashcards
- `/ul-practice-*` — Práticas sugeridas
- `/ul-learn-*` — Aprendizado sugerido

## Handoff

- Usuário aceita sugestão → Redireciona para command apropriado
- Usuário quer planejar → `/ul-plan-weekly`
- Usuário está atrasado → `/ul-retro-weekly` para ajustar

---

*Command: /ul-study-start — Início de sessão com contexto inteligente*
