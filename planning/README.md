# 📐 Planejamento do Framework

Pasta destinada a documentos de planejamento estratégico do **framework Ultralearning** — propostas de mudança em arquitetura, agentes, scripts e configuração.

> **Nota**: Planos relacionados a projetos de estudo (currículo, fases, migração de linguagem) ficam em `projects/[modulo]/planning/`.

---

## Estrutura

```
planning/
├── README.md
├── _template-proposta.md
├── _template-plano-migracao.md
├── archived/                    # Documentos implementados/supersedidos
│   └── README.md
└── [documentos ativos]
```

---

## Separação de Responsabilidades

| Domínio | Local |
|---------|-------|
| **Framework** (commands, tools, agents, arquitetura) | `planning/` (esta pasta) |
| **Projeto de estudo** (currículo, fases, migração de linguagem) | `projects/[modulo]/planning/` |
| **Guias compartilhados** | `projects/shared/planning/` |
| **Planos ativos do projeto** | `projects/[modulo]/meta/` |

---

## Convenção de Nomenclatura

```
[TIPO]-[descricao]-YYYY-MM-DD.md
```

### Tipos de Documento

| Tipo | Uso | Exemplo |
|------|-----|---------|
| `proposta` | Propostas de mudança no framework | `proposta-memoria-automatica-2026-02-28.md` |
| `plano` | Planos de migração ou implementação | `plano-migracao-glm-2026-02-27.md` |
| `report` | Relatórios de fases, protótipos | `report-prototipo-fase0.md` |
| `consolidated-analysis` | Análise consolidada de múltiplos documentos | `consolidated-analysis-2026-02-28-v1.0.0.md` |

### Regras

- Nomes em **minúsculo**
- Palavras separadas por **hífen** (`-`)
- Sem acentos ou caracteres especiais
- Descrição curta e objetiva (máx. 4-5 palavras)

---

## Status dos Documentos

| Status | Emoji | Significado |
|--------|-------|-------------|
| Proposta | 🟡 | Aguardando análise/decisão |
| Aprovada | 🟢 | Aprovada para implementação |
| Rejeitada | 🔴 | Não será implementada |
| Em análise | ⏸️ | Sob revisão/feedback |
| Implementada | ✅ | Já executada/concluída |
| Parcial | ⚠️ | Implementada parcialmente |

---

## Como Gerar Documentos

Usando o agente `@review`:

```bash
# Análise arquitetural que identifica necessidade de mudança
/ul-review-audit
# Ou via keyword interna:
# @review #review-architecture

# Auditoria completa que pode gerar recomendações
# @review #review-costs
```

O @review recomenda mudanças através de análise, mas **não gera automaticamente** propostas ou planos. O fluxo é:

1. @review analisa o projeto
2. Identifica necessidade de mudança estrutural
3. Gera recomendações no relatório
4. Usuário decide se quer criar proposta/plano manualmente

---

## Templates Disponíveis

- [`_template-proposta.md`](./_template-proposta.md) - Para propostas de mudança
- [`_template-plano-migracao.md`](./_template-plano-migracao.md) - Para planos de migração

---

## Conteúdo dos Documentos

**Propostas** (`proposta-[nome]-YYYY-MM-DD.md`):
- 🎯 Problema identificado
- 💡 Solução proposta
- 🗺️ Plano de transição
- ⚖️ Análise de impacto vs benefício
- ✅ Checklist de implementação

**Planos** (`plano-[nome]-YYYY-MM-DD.md`):
- 📅 Cronograma detalhado por fases
- ⚠️ Riscos e mitigações
- 🔄 Plano de rollback
- 📊 Métricas de acompanhamento

**Análises Consolidadas** (`consolidated-analysis-[data]-v[X.Y.Z].md`):
- 📊 Resumo de todos os documentos analisados
- ✅ Checklist de implementação por documento
- 📋 Pontos pendentes priorizados
- 🎯 Roadmap de ações

---

## Documentos Ativos

| Data | Documento | Status | Descrição |
|------|-----------|--------|-----------|
| 2026-04-09 | `proposta-melhorias-agentes-agency-2026-04-09.md` | 🟡 Proposta | Melhorias nos agentes baseadas em agency-agents |

---

## Histórico de Consolidacões

| Data | Documento | Documentos Analisados | Veredito |
|------|-----------|----------------------|----------|
| 2026-02-28 | `consolidated-analysis-2026-02-28-v1.0.0.md` | 5 | 7/10, 60% implementado |

---

*Documentos de planejamento são referências históricas das decisões arquiteturais. Sempre que possível, mantenha-os atualizados com o status atual.*
