---
description: Encerrar sessão, salvar progresso e atualizar plano semanal
agent: tutor
model: opencode-go/kimi-k2.5
---

## Descrição

Finaliza sessão com reflexão estruturada, salva progresso via OpenViking e sugere próximos passos baseado no desempenho.

## Processo

1. **Reflexão** — Perguntar o que aprendeu (1 frase), maior desafio, o que está confuso, nota de foco /10, confiança no tópico /10.
2. **Análise** — Confiança <7 → sugerir `/ul-study-memorize`; desafio recorrente → sugerir `/ul-study-drill`; foco <5 → sugerir pausa ou pomodoro.
3. **Persistir dados** — Invocar `data.createSession` com `moduleId`, `duration`, `focusScore`, `notes`. Invocar `memcommit` com `wait: true` para persistir. OpenViking extrai preferências, entidades e padrões automaticamente.
4. **Verificar entregas** — Perguntar se completou alguma entrega hoje. Se sim, buscar plano atual com `memread` e atualizar checkbox correspondente.
5. **Apresentar resumo** — Duração, foco, técnicas usadas, streak. Se for domingo → sugerir `/ul-plan-retro`.

## Handoff

- Quer criar flashcard → `/ul-study-memorize`
- Quer mais prática → `/ul-study-drill`
- Domingo → `/ul-plan-retro`
- Plano precisa de ajuste → `/ul-plan-adjust`