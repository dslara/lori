# 📋 Revisões

Pasta destinada a todas as revisões e avaliações críticas do projeto.

## Propósito

As revisões servem para:

- **Validar** a qualidade e coerência do plano
- **Identificar** riscos, gaps e pontos de melhoria
- **Documentar** decisões e mudanças importantes
- **Acompanhar** a evolução do projeto ao longo do tempo

## Estrutura

```
reviews/
├── README.md                    # Este arquivo
├── _template-framework-review.md
├── archived/                    # Revisões supersedidas/implementadas
│   └── README.md
└── [revisões atuais]
```

---

## 🔍 Revisões Técnicas do Framework

Revisões técnicas do próprio framework, geradas pelo agente `@review`.

### Convenção de Nomenclatura

```
[tipo]-[descricao]-YYYY-MM-DD-v[X.Y.Z].md
```

Exemplos:
- `audit-complete-2026-02-27-v5.0.0.md`
- `architecture-review-2026-02-27-v1.0.0.md`
- `agents-audit-2026-02-26-v3.1.0.md`

### Tipos de Revisões

| Tipo | Descrição | Command |
|------|-----------|---------|
| **audit** | Auditoria completa de qualidade | `/ul-review-audit` |
| **structure** | Organização de pastas e arquivos | `#review-structure` |
| **tools** | Qualidade das tools TypeScript | `#review-tools` |
| **docs** | Coerência da documentação | `#review-docs` |
| **commands** | Consistência dos commands `/ul-*` | `#review-commands` |
| **agents** | Efetividade dos agentes | `#review-agents` |
| **consistency** | Consistência geral | `#review-consistency` |
| **architecture** | Análise arquitetural | `#review-architecture` |
| **costs** | Otimização de tokens | `#review-costs` |
| **consolidated** | Análise consolidada de múltiplas reviews | `#meta-review` |

---

## Revisão Ativa

| Data | Documento | Status | Descrição |
|------|-----------|--------|-----------|
| 2026-04-09 | `audit-complete-2026-04-09-v3.4.0.md` | 🟢 Ativa | Auditoria completa do framework v3.4.0 |
| 2026-04-09 | `agents-meta-tutor-audit-2026-04-09-v1.0.0.md` | 🟡 Arquivada | Auditoria dos agentes @meta e @tutor |

**Resumo da Auditoria Completa (v3.4.0 — v2)**:
- ✅ 27 verificações passaram (4 resolvidas desde v1)
- ⚠️ 8 alertas/avisos (não críticos)
- ❌ 2 erros críticos (1 resolvido, 1 parcial)
- 💡 15 sugestões de melhoria

**Problemas Críticos Restantes**:
1. Conflito arquitetural de dados (CSV vs OpenViking)
2. Bug em `retro.ts` — `this.execute()` em contexto incorreto (parcial: imports corrigidos)

**Resolvidos desde v1**:
- ✅ `context.ts` fantasma — removido, `context-hybrid.ts` é o único
- ✅ Regras de Ouro adicionadas em todos os 4 agentes
- ✅ Módulos compartilhados migrados para `.opencode/shared/`
- ✅ Agentes otimizados (~40% redução de tamanho)

**Problemas Anteriores (Agentes)**:
1. Regras Críticas no Final (Alta) — ✅ RESOLVIDO (Regras de Ouro adicionadas)
2. Sem Métricas de Sucesso (Alta) — Pendente na proposta ativa
3. Referências desatualizadas (Média) — Pendente
4. Sem Destaques de Personalidade (Baixa) — Pendente

---

## Revisões Arquivadas

Revisões arquivadas ou implementadas ficam em `archived/`.

Consulte [`archived/README.md`](./archived/README.md) para o histórico completo.

---

## Como Gerar Revisões Técnicas

Usando o agente `@review` via commands:

```bash
# Auditoria completa (todas as revisões)
/ul-review-audit

# Revisões específicas (via keywords internas do @review)
# Digite no TUI do OpenCode:
# @review #review-structure
# @review #review-tools
# @review #review-docs
# @review #review-commands
# @review #review-agents
# @review #review-architecture
# @review #review-costs
# @review #check-readiness 3.0.0
# @review #meta-review [arquivo]
```

---

## Template Disponível

- [`_template-framework-review.md`](./_template-framework-review.md) - Template para revisões técnicas

---

## Diferença: Revisões de Plano vs Revisões Técnicas

| Aspecto | Revisões de Plano | Revisões Técnicas |
|---------|-------------------|-------------------|
| **Foco** | Plano de estudos (CS Fundamentals) | Código, arquitetura, scripts |
| **Gerado por** | Humano | Agente @review |
| **Convenção** | `review-v{X.Y}.md` | `[tipo]-[desc]-YYYY-MM-DD-v{X.Y.Z}.md` |
| **Público** | Estudante revisando progresso | Mantenedor revisando qualidade |

---

*As revisões são checkpoints estratégicos. Quando uma revisão é concluída, as ações identificadas devem ser priorizadas ou adicionadas ao backlog.*
