---
description: Ver status atual - streak, sessões, módulo (/ul-data-status)
agent: tutor
model: opencode-go/minimax-m2.5
---

## Descrição

Mostra status atual de estudo: streak atual, recorde, total de sessões, módulo ativo e data da última sessão via OpenViking.

## Uso
/ul-data-status

## Processo

Carregar informações via OpenViking:
1. `memread` com URI `viking://user/memories/profile.md` nível `read` — perfil do usuário
2. `memsearch` com query `"sessões de estudo recentes"`, `limit: 5` — sessões recentes
3. `memsearch` com query `"streak métricas estudo"`, `limit: 3` — streak e métricas

Exiba:
- Streak atual com barra de progresso visual
- Recorde de streak
- Total de sessões
- Módulo ativo
- Data da última sessão

Apresente as informações de forma clara e motivadora. Se o usuário tiver um bom streak, celebre! Se não estudou recentemente, encoraje-o gentilmente.

Se não houver dados (OpenViking vazio), sugira começar com `/ul-study-start`.

## Output

```
📊 Status de Estudo

🔥 Streak: 15 dias (recorde: 23 dias)
███████████████░░░░░░░ 65%

📚 Módulo: go-os-cpu
   Iniciado: 2026-03-01
   Sessões: 12
   Tempo total: 8h 30min

📅 Última sessão: Ontem (45 min)
   Foco: 8/10
   
💡 Dica: Você está numa sequência boa! Mantenha assim.
```

Se streak quebrado:
```
📊 Status de Estudo

⚠️ Streak: 0 dias (quebrou há 3 dias)
   Recorde: 5 dias

📚 Módulo: math-foundations

📅 Última sessão: 3 dias atrás

💡 Não desanime! Uma sessão rápida já conta.
   → /ul-study-start para retomar
```

## Estrutura OpenViking

Os dados são buscados de:

| Dado | URI OpenViking |
|------|---------------|
| Perfil/Streak | `viking://user/memories/profile.md` |
| Sessões recentes | `memsearch({ query: "sessões recentes" })` |
| Métricas | `memsearch({ query: "métricas streak" })` |

## Integrações

**Tools OpenViking utilizadas:**
- `memread` — Carregar perfil
- `memsearch` — Buscar sessões e métricas

**Commands relacionados:**
- `/ul-study-start` — Iniciar sessão
- `/ul-data-analytics` — Ver relatório detalhado

---

*Command: /ul-data-status — Status rápido via OpenViking*