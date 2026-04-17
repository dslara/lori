---
description: Encerrar sessão, salvar progresso e atualizar plano semanal
agent: tutor
model: opencode/minimax-m2.5-free
---

## Descrição

Finaliza sessão com reflexão estruturada, salva progresso via OpenViking e sugere próximos passos baseado no desempenho.

## Processo

1. **Reflexão** — Perguntar o que aprendeu (1 frase), maior desafio, o que está confuso, nota de foco /10, confiança no tópico /10.
2. **Análise** — Confiança <7 → sugerir `/ul-study-memorize`; desafio recorrente → sugerir `/ul-study-drill`; foco <5 → sugerir pausa ou pomodoro.
3. **Persistir dados** — Invocar `data.createSession` com `moduleId`, `duration`, `focusScore`, `notes`. Invocar `resource.write` para append no sessions-log. Invocar `memcommit` com `wait: true` para persistir. OpenViking extrai preferências, entidades e padrões automaticamente.
   ```
   resource.mkdir({ uri: "viking://resources/ultralearning/projects/{id}/notes/" })
   resource.write({
     uri: "viking://resources/ultralearning/projects/{id}/notes/sessions-log.md",
     content: "## Sessão [N] - [data]\n\nDuração: [X]min | Foco: [Y]/10 | Técnicas: [lista]\nAprendizado: [resumo]\n\n",
     mode: "append"
   })
   resource.link({
     from: "viking://resources/ultralearning/projects/{id}/notes/sessions-log.md",
     to: "viking://resources/ultralearning/projects/{id}/",
     reason: "log de sessões do projeto"
   })
   memcommit({ wait: true })
   ```
4. **Verificar entregas** — Perguntar se completou alguma entrega hoje. Se sim, buscar plano atual com `memread("viking://resources/ultralearning/projects/{id}/plans/week-{N}.md", level: "abstract")` e atualizar checkbox correspondente.
5. **Apresentar resumo** — Duração, foco, técnicas usadas, streak. Se for domingo → sugerir `/ul-plan-retro`.

## Handoff

- Quer criar flashcard → `/ul-study-memorize`
- Quer mais prática → `/ul-study-drill`
- Domingo → `/ul-plan-retro`
- Plano precisa de ajuste → `/ul-plan-adjust`