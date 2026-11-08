# Ciclo de vida da extensão Pi (research)

Pergunta do ticket: como é o ciclo de vida de uma extensão Pi na prática.

## Fatos

- Extensão é módulo TypeScript com factory default que recebe `ExtensionAPI`. Carrega via jiti, sem compilação. Factory async é aguardada antes de `session_start`.
- `session_start` dispara em `startup`, `reload`, `new`, `resume` e `fork`, com `previousSessionFile` nos três últimos. (Pi 1.5.0, inalterado desde 0.85.1)
- Troca de sessão, fork, clone e `/reload` derrubam a instância antiga (`session_shutdown`), recarregam e religam as extensões e emitem `session_start` na nova. Estado em memória sempre se reconstrói em `session_start` mais `session_tree` (`/tree` muda o branch); limpeza vai em `session_shutdown` idempotente.
- Factory pode rodar em invocações que nunca abrem sessão. Proibido abrir timers, processos, sockets ou watchers na factory; tudo nasce em `session_start` ou no handler que precisa. Valida a decisão de timer stateless do ticket de lifecycle.
- Modelo de processo: TUI interativo mantém um processo entre turns; cada `pi -p` ou execução nova é processo novo. Valem os dois: persistir após todo `dispatch` e reconstruir em `session_start` cobre ambos.
- `pi.appendEntry(type, data)` grava custom entries na conversa: fora do contexto LLM, restauráveis via `sessionManager`. É metadado de agent session, nunca dado de jogo. Valida a regra de ouro 12 da arquitetura.
- State Management oficial manda reconstruir estado de conversa a partir do branch (`getBranch`, tool result `details`). Estado de jogo mora fora da sessão, no arquivo da Lori.
- Commands registrados na extensão são checados primeiro e bypassam o agente. `before_agent_start` injeta system prompt via `systemPromptOptions` (`sections`, `promptGuidelines`, `selectedTools`); `event.messageType` é `user` ou `custom` (runs via `pi.sendMessage` com `triggerTurn`), checar antes de atuar. Personas entram como `sections`/`promptGuidelines`, com patch transcript-backed que preserva cache. `agent_settled` é o sinal de idle real (`agent_end` não é); `agent_before_settle` pode anexar entries e pedir 1 continuação. Hook `context` não vê mais system messages, Pi recompõe prompt e tools depois; injeção durável vai em `before_agent_start` ou `context_with_system`. `ctx.ui.setStatus` e `setWidget` cobrem dashboard sem processo próprio. `keyText`/`keyHint` vêm das opções injetadas do renderer, não de import direto (1.5.0).
- Deps npm: `package.json` ao lado da extensão, install de produção omite devDeps. `node:fs` e `node:path` disponíveis.

## Implicação

Entry point único reconstrói tudo em `session_start` a partir do arquivo da Lori, sem recurso background. Nenhum bloqueio para lifecycle da Lori session, store simples ou Skin Minimal.

## Sources

- `docs/extensions.md` (Pi 1.5.0): Extension Styles, async factory, Long-lived resources and shutdown, Lifecycle Overview, Session Events (`session_start`, `session_shutdown`), State Management, `pi.appendEntry`, ExtensionCommandContext, Custom UI (`setStatus`, `setWidget`)
- `docs/sessions.md` e `docs/session-format.md` (Pi 1.5.0): storage JSONL e SessionManager
- `extensions/lori/index.ts`: o entry point atual exporta uma factory vazia;
