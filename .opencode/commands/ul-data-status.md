---
description: Ver status atual - streak, sessões, módulo (/ul-data-status)
agent: tutor
model: opencode-go/kimi-k2.5
---

## Descrição

Mostra status atual de estudo: streak atual, recorde, total de sessões, módulo ativo e data da última sessão.

## Uso
/ul-data-status

Mostre o status atual de estudo do usuário usando a ferramenta 'status' com a operação formatStatus.

Exiba:
- Streak atual com barra de progresso visual
- Recorde de streak
- Total de sessões
- Módulo ativo
- Data da última sessão

Apresente as informações de forma clara e motivadora. Se o usuário tiver um bom streak, celebre! Se não estudou recentemente, encoraje-o gentilmente.

Se não houver dados, sugira começar com /ul-study-start.

## Integrações

**Tools utilizadas:**
- `status.getStatus` — Obtém dados brutos de status
- `status.formatStatus` — Formata com emojis e barra de progresso
- `data.getSessions` — Obtém sessões recentes
- `context.getCurrentModule` — Obtém módulo ativo

**Processo:**
1. Invocar `status.getStatus` para obter streak, total de sessões, etc.
2. Invocar `context.getCurrentModule` para obter módulo ativo
3. Invocar `status.formatStatus` para formatar output visual
4. Apresentar de forma motivadora
