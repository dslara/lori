# Relatório de Pendências — [DATA]

**Tipo**: pendencias-consolidadas  
**Gerado por**: @review  
**Data**: 2026-03-03  
**Escopo**: reviews/archived + planning/archived

---

## Sumário

| Categoria | Qtd |
|-----------|-----|
| Pendências Abertas | 4 |
| Resolvidas | 7 |
| Total Analisado | 38 arquivos |

---

## Pendências Abertas

### 1. [Alta] Estrutura M5/M6 — Decisão Pendente

**Arquivo de origem**: `planning/archived/plan-review-2026-03-03-v5.0.0.md`

**Problema**:
- M5 mistura comptime + DP sem conexão pedagógica
- M6 cobre 5+ disciplinas em 18 semanas sem milestone intermediário

**Propostas**:
1. Dissolver M5 (comptime → M2, DP → M4)
2. Quebrar M6 em módulos menores

**Status**: ⚠️ Pendente de decisão

---

### 2. [Média] Memória Automática — Implementação Incompleta

**Arquivo de origem**: `planning/archived/proposta-memoria-automatica-2026-03-03-v1.0.0.md`

**O que falta**:
- [ ] Função `get_srs_pending()` em `common.sh`
- [ ] Carregamento automático de contexto no `make start`

**Status**: ⚠️ Parcialmente implementado

---

### 3. [Baixa] Master Learning Maps — Duplicação

**Arquivo de origem**: `reviews/archived/audit-quality-2026-03-03-v3.1.0.md`

**Problema**:
- `projects/shared/master-learning-map.md` (v4.0)
- `projects/shared/learning-map-master.md` (v3.0)

**Ação sugerida**: Arquivar v3.0, manter v4.0

**Status**: ⚠️ Pendente

---

### 4. [Baixa] M3 Dual-Language — Não Implementado

**Arquivo de origem**: `planning/archived/plan-review-2026-03-03-v5.0.0.md`

**Proposta**:
- Implementar DS primeiro em Python (conceito)
- Depois reimplementar em Zig (memória)

**Status**: ⚠️ Pendente

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

---

## Ações Recomendadas

### Imediato (Esta Semana)
1. [ ] Decidir sobre M5/M6 (planejamento)
2. [ ] Arquivar learning-map-master.md v3.0

### Curto Prazo (Este Mês)
3. [ ] Implementar `get_srs_pending()` em common.sh
4. [ ] Testar carregamento automático de contexto

### Médio Prazo (Próximos Meses)
5. [ ] Implementar M3 Dual-Language

---

## Critério de Encerramento

Este documento pode ser arquivado quando:

- [ ] Decisão M5/M6 tomada
- [ ] Duplicate learning map resolvido
- [ ] get_srs_pending() implementado
- [ ] M3 Dual-Language implementado (ou decisão de não fazer)

---

*Gerado em: 2026-03-03*
