# Relatório de Pendências — 2026-03-03

**Tipo**: pendencias-consolidadas  
**Gerado por**: @review  
**Data**: 2026-03-03  
**Escopo**: reviews/archived + planning/archived  
**Revisão**: 2026-03-03 (todas resolvidas!)

---

## ✅ Status: TODAS RESOLVIDAS!

---

## Pendências (Revisão: 2026-03-03)

### 1. [Alta] Estrutura M5/M6 — Decisão Pendente

**Arquivo de origem**: `planning/archived/plan-review-2026-03-03-v5.0.0.md`

**Problema**:
- M5 mistura comptime + DP sem conexão pedagógica
- M6 cobre 5+ disciplinas em 18 semanas sem milestone intermediário

**Propostas**:
1. Dissolver M5 (comptime → M2, DP → M4)
2. Quebrar M6 em módulos menores

**Status**: ✅ **RESOLVIDO**

**Evidência**:
- M5 agora é "Go + OS/CPU" (sem DP, sem comptime)
- DP foi movido para M4 (Algorithms + DP) - 14 semanas
- M6 continua "Networking + DB" com 9 semanas

---

### 2. [Média] Memória Automática — Implementação Incompleta

**Arquivo de origem**: `planning/archived/proposta-memoria-automatica-2026-03-03-v1.0.0.md`

**O que faltava**:
- [x] Função `get_srs_pending()` em `common.sh`
- [x] Carregamento automático de contexto no `make start`

**Status**: ✅ **RESOLVIDO**

**Evidência**:
- `scripts/common.sh:184` - função implementada
- `scripts/start.sh:41` - usada automaticamente no start

---

### 3. [Baixa] Master Learning Maps — Duplicação

**Arquivo de origem**: `reviews/archived/audit-quality-2026-03-03-v3.1.0.md`

**Problema**:
- `projects/shared/master-learning-map.md` (v4.0)
- `projects/shared/learning-map-master.md` (v3.0)

**Status**: ✅ **RESOLVIDO**

**Evidência**:
- Apenas `master-learning-map.md` existe atualmente
- `learning-map-master.md` foi removido

---

### 4. [Baixa] M3 Dual-Language — Não Implementado

**Arquivo de origem**: `planning/archived/plan-review-2026-03-03-v5.0.0.md`

**Proposta**:
- Implementar DS primeiro em Python (conceito)
- Depois reimplementar em Zig (memória)

**Status**: ✅ **RESOLVIDO**

**Evidência**:
- M3 README.md já documenta: "Python primeiro → Zig depois"
- Regra prática incluída: "Se travar >30min em Zig, revise o Python"

---

## Pendências Resolvidas

| # | Item | Status |
|---|------|--------|
| 1 | Estrutura modular M1-M8 | ✅ Concluído |
| 2 | Documentação vs estrutura atual | ✅ Corrigido |
| 3 | Risco operacional archive.sh | ✅ Corrigido |
| 4 | Dependência bc no SRS | ✅ Corrigido |
| 5 | Numeração semanas/retros | ✅ Corrigido |
| 6 | Inconsistência @review | ✅ Corrigido |
| 7 | Dedupe master deck | ✅ Corrigido |
| 8 | M5/M6 (DP movido) | ✅ Resolvido |
| 9 | Memória automática | ✅ Resolvido |
| 10 | Master learning maps duplicados | ✅ Resolvido |
| 11 | M3 Dual-Language | ✅ Resolvido |

---

## Critério de Encerramento

**Este documento pode ser arquivado** ✅

Todas as pendências foram revisadas e resolvidas!

---

*Gerado em: 2026-03-03*
