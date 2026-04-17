---
description: Auditoria completa do framework
agent: review
---

## Descrição

Auditoria completa do Ultralearning System. Executa revisão sequencial de todas as áreas e gera relatório com roadmap de melhorias. Resultado é arquivado no OpenViking para busca semântica futura.

## Processo

### 1. Contexto OpenViking (pré-execução)

```
context-hybrid.getCurrentModule
context-hybrid.getFullContext
resource.find({ query: "auditoria framework", target: "viking://resources/ultralearning/reviews/" })
resource.find({ query: "proposta melhoria", target: "viking://resources/ultralearning/planning/" })
```

### 2. Execução Principal

1. **`#review-structure`** — Estrutura do projeto: diretórios, nomenclatura, arquivos órfãos
2. **`#review-tools`** — Tools TypeScript (`.opencode/tools/`): tratamento de erros, tipagem Zod, cache, consistência
3. **`#review-docs`** — Documentação: coerência com código, links, seções desatualizadas
4. **`#review-commands`** — Commands (`.opencode/commands/`): frontmatter completo, `$ARGUMENTS`, nomenclatura
5. **`#review-skills`** — Skills (`.opencode/skills/`): SKILL.md com `name` e `description`, nomenclatura válida
6. **`#review-agents`** — Agentes: formato padronizado, keywords, consistência
7. **`#review-consistency`** — Consistência: nomenclatura, redundâncias, keywords órfãs, matriz de dependências
8. **`#review-costs`** — Otimização de custos: tamanho de agentes, duplicação, cache elegível

Gerar relatório usando template @.opencode/templates/_template-framework-review.md com: Estado Atual, Problemas Identificados (CRÍTICO/ALTO/MÉDIO/BAIXO), Ações Recomendadas.

### 3. Persistência (pós-execução)

```
resource.mkdir({ uri: "viking://resources/ultralearning/reviews/" })
resource.write({
  uri: "viking://resources/ultralearning/reviews/audit-framework-YYYY-MM-DD.md",
  content: "<conteúdo completo do relatório>",
  mode: "replace"
})
resource.link({
  from: "viking://resources/ultralearning/reviews/audit-framework-YYYY-MM-DD.md",
  to: "viking://resources/ultralearning/",
  reason: "auditoria do framework"
})
memcommit({ wait: false })
```

Isso permite que revisões futuras encontrem esta auditoria via `resource.find`.

## Handoff

- Problemas encontrados → sugerir correções específicas por prioridade
- Quer detalhar área específica → executar revisão individual