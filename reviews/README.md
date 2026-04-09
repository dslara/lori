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

  - 4 problemas críticos/alto identificados
  - 3 problemas da revisão anterior não resolvidos
  - 2 novos problemas críticos descobertos

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
