---
description: Iniciar sessão de estudo com contexto automático
agent: tutor
model: opencode-go/kimi-k2.5
---

## Descrição

Inicia sessão de estudo carregando contexto automático (módulo ativo, streak, SRS pendente, pontos fracos) via OpenViking e sugere atividades baseado nas prioridades.

## Processo

1. **Carregar contexto** — `memread("viking://user/memories/profile.md")` para perfil, `memsearch` para sessões recentes (query "sessões de estudo recentes"), flashcards pendentes (query "flashcards pendentes revisão") e padrões de erro (query "padrões de erro tópicos fracos"). Se OpenViking indisponível, perguntar módulo, última sessão e flashcards pendentes manualmente.
2. **Apresentar contexto** — Streak, semana/módulo atual, e sugestão de atividade com justificativa.
3. **Sugerir por prioridade** — SRS pendente → `/ul-study-recall`; weak topics → `/ul-study-drill`; continuidade de sessão anterior → mesma atividade; default → perguntar objetivo. Mapeamento: conceito novo → `/ul-study-learn`, validar → `/ul-study-feynman`, praticar → `/ul-study-drill`, projeto → `/ul-study-project`.
4. **Aguardar decisão** — Aceitar sugestão, escolher alternativa, ou definir próprio objetivo — redirecionar para command apropriado.

## Handoff

- Aceitou sugestão → redireciona para command apropriado
- Quer planejar → `/ul-plan-weekly`
- Está atrasado → `/ul-plan-retro`