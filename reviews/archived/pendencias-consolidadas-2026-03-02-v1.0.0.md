# Pendências Consolidadas — v1.0.0 (2026-03-02)

**Tipo**: pendencias-consolidadas  
**Gerado por**: @review  
**Escopo**: reviews/archived + planning/archived

---

## Sumário Executivo

Revisão de **todos os documentos arquivados** encontrou pendências recorrentes e decisões não concluídas. Este documento consolida **apenas itens ainda relevantes** (não resolvidos pelo estado atual) e elimina duplicatas históricas.

---

## Pendências Ativas (consolidadas) — **0 abertas / 7 resolvidas**

### 1) Estrutura modular M1–M8 — ✅ Resolvido
- **Origem**: `planning/archived/proposta-estrutura-modular.md`
- **Estado**: ✅ **Concluído** (módulos M1–M8 existem e READMEs têm conexões + retrieval manual).

### 2) Documentação desatualizada vs estrutura atual — ✅ Resolvido
- **Origem**: `reviews/archived/audit-complete-2026-03-02-v7.0.0.md`
- **Problema**: comandos/paths em `guides/tecnicas/flashcards.md` e `guides/tecnicas/srs.md` apontam para estrutura antiga.
- **Ação**: atualizar paths (`projects/M1-*`) e comandos (`make review`).

### 3) Risco operacional em `archive.sh` — ✅ Resolvido
- **Origem**: `reviews/archived/audit-complete-2026-03-02-v7.0.0.md`
- **Problema**: `rm -rf` sem validação de prefixo.
- **Ação**: validar `TOPIC_PATH` antes da remoção.

### 4) Dependência `bc` não verificada no SRS — ✅ Resolvido
- **Origem**: `reviews/archived/audit-complete-2026-03-02-v7.0.0.md`
- **Ação**: checar `bc` no bootstrap do script de SRS.

### 5) Numeração de semanas/retros pode sobrescrever — ✅ Resolvido
- **Origem**: `reviews/archived/audit-complete-2026-03-02-v7.0.0.md`
- **Ação**: usar maior índice existente + 1.

### 6) Inconsistência @review hidden (docs x config) — ✅ Resolvido
- **Origem**: `reviews/archived/audit-complete-2026-03-02-v7.0.0.md`
- **Ação**: alinhar README e `opencode.json`.

### 7) Dedupe frágil no master deck — ✅ Resolvido
- **Origem**: `reviews/archived/audit-complete-2026-03-02-v7.0.0.md`
- **Ação**: dedupe por chave composta (front+back+module) e recriar master do zero.

---

## Pendências Históricas (não priorizadas)

> Mantidas apenas como referência. Podem estar resolvidas no estado atual.

- Itens de consistência antiga (ex.: contagem de comandos, `date +%U`).
- Gaps de semanas em numeração legada.
- Revisões de agentes com recomendações já implementadas.

---

## Critério de Encerramento

Este documento pode ser arquivado quando:

- A decisão M1–M8 já foi tomada e documentada (✅)
- Scripts críticos corrigidos (archive.sh, SRS, weeks) — ✅
- Docs de flashcards/SRS atualizadas — ✅
- Configuração do @review alinhada — ✅
- Dedupe de flashcards consistente — ✅
