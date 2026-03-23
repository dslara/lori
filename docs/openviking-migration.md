# Migração CSV → OpenViking

**Data**: 2026-03-13  
**Status**: ~~Em andamento~~ **Supersed pela Arquitetura Híbrida (2026-03-20)**

> ⚠️ **Nota**: Este documento descreve uma migração completa para OpenViking que foi **substituída** pela **Arquitetura de Dados Híbrida** (ver `planning/proposta-arquitetura-dados-hibrida-2026-03-19.md`).
>
> A arquitetura final mantém **CSVs para dados estruturados** (sessões, módulos, flashcards) e usa **OpenViking para memória semântica** (preferências, padrões, cases).

## Resumo

Migração do sistema de persistência baseado em CSV para OpenViking (sistema de memória semântica).

## O que foi Feito

### 1. Tools CSV Eliminadas (14 arquivos)

```
.opencode/tools/
├── context.ts              ✗ Eliminado
├── data.ts                 ✗ Eliminado
├── data-core.ts            ✗ Eliminado
├── data-module.ts          ✗ Eliminado
├── data-insight.ts         ✗ Eliminado
├── data-flashcard.ts       ✗ Eliminado
├── data-interaction.ts     ✗ Eliminado
├── data-session.ts         ✗ Eliminado
├── utils-csv.ts            ✗ Eliminado
├── insights.ts             ✗ Eliminado
├── status.ts               ✗ Eliminado
├── retro.ts                ✗ Eliminado
├── setup.ts                ✗ Eliminado
└── model-types.ts          ✗ Eliminado
```

### 2. Commands Obsoletos Eliminados (3 arquivos)

```
.opencode/commands/
├── ul-data-backup.md       ✗ Eliminado (CSV não existe mais)
├── ul-data-dashboard.md    ✗ Eliminado (redundante com analytics)
└── ul-data-manage.md       ✗ Eliminado (CSV não existe mais)
```

### 3. Skill Reescrita

- `session/SKILL.md` → Migração completa para OpenViking

### 4. Commands Migrados (12 arquivos)

| Command | Status |
|---------|--------|
| `/ul-study-start` | ✅ Migrado |
| `/ul-study-end` | ✅ Migrado |
| `/ul-study-plan` | ✅ Migrado |
| `/ul-memory-review` | ✅ Migrado |
| `/ul-memory-create` | ✅ Migrado |
| `/ul-data-status` | ✅ Migrado |
| `/ul-data-analytics` | ✅ Migrado |
| `/ul-module-switch` | ✅ Migrado |
| `/ul-module-create` | ✅ Migrado |
| `/ul-module-archive` | ✅ Migrado |
| `/ul-retro-weekly` | ✅ Migrado |

## Nova Arquitetura

### Substituição de Tools

| Tool CSV | Tool OpenViking |
|----------|-----------------|
| `context.getFullContext` | `memread("viking://user/memories/profile.md")` + `memsearch({ query: "sessões recentes" })` |
| `context.getCurrentModule` | `memread("viking://user/memories/profile.md")` |
| `data.getSessions` | `memsearch({ query: "sessões recentes", limit: 5 })` |
| `data.createSession` | Sincronização automática via `memcommit()` |
| `data.getFlashcards` | `memsearch({ query: "flashcards pendentes" })` |
| `insights.getWeaknesses` | `memsearch({ query: "padrões de erro" })` |
| `insights.getEffectiveness` | `memread("viking://user/memories/insights.md")` |

### Estrutura OpenViking

```
viking://user/memories/
├── profile.md              # Perfil, módulo ativo, streak, preferências
├── insights.md            # Métricas agregadas
├── patterns.md            # Padrões de erro
├── sessions/              # Sessões de estudo (auto-sync)
│   └── 2026-03-13-*.json  # Metadados estruturados
└── flashcards/            # Flashcards/SRS
    └── index.json         # Lista + metadados

viking://user/projects/
└── M1-math-foundations/
    └── meta/
        └── week-01.md
```

## O que Falta

### Commands com Referências CSV (18 arquivos)

| Command | Prioridade |
|---------|-----------|
| `/ul-plan-weekly` | Baixa |
| `/ul-plan-weekly-create` | Baixa |
| `/ul-plan-resources` | Baixa |
| `/ul-plan-adjust` | Baixa |
| `/ul-plan-decompose` | Baixa |
| `/ul-plan-benchmark` | Baixa |
| `/ul-practice-quiz` | Baixa |
| `/ul-practice-feynman` | Baixa |
| `/ul-practice-drill` | Baixa |
| `/ul-practice-project` | Baixa |
| `/ul-learn-explain` | Baixa |
| `/ul-learn-debug` | Baixa |
| `/ul-productivity-start` | Baixa |
| `/ul-productivity-break` | Baixa |
| `/ul-setup-check` | Baixa |
| `/ul-setup-scaffold` | Baixa |
| `/ul-review-audit` | Baixa |

### Documentação

- `docs/tools.md` → Atualizar para OpenViking
- `docs/agents.md` → Atualizar referências
- `README.md` → Atualizar arquitetura

## Dados Preservados

Os dados CSV em `data/` foram mantidos como backup:

```
data/
├── sessions.csv        # Backup (não usado)
├── modules.csv         # Backup (não usado)
├── flashcards.csv      # Backup (não usado)
├── reviews.csv         # Backup (não usado)
├── insights.csv        # Backup (não usado)
├── session_skills.csv  # Métricas por técnica (inclui campo 'correct')
└── users.csv           # Backup (não usado)
```

## Próximos Passos

1. **Migrar commands restantes** (baixa prioridade) — Substituir referências a `data.*`, `context.*`, `insights.*` por OpenViking
2. **Atualizar documentação** — Refletir nova arquitetura
3. **Testar fluxo completo** — Verificar se OpenViking está capturando dados corretamente
4. **Remover backup CSV** (opcional) — Após confirmação de que OpenViking está funcionando

## Rollback

Se necessário, restaurar tools CSV via:

```bash
git checkout -- .opencode/tools/
```

---

*Documento gerado em 2026-03-13*