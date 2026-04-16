---
description: Auditoria completa do framework
agent: review
model: opencode-go/glm-5
---

## Descrição

Auditoria completa do Ultralearning System. Executa revisão sequencial de todas as áreas e gera relatório com roadmap de melhorias. Resultado é arquivado no OpenViking para busca semântica futura.

## Processo

1. **Contexto** — Buscar revisões anteriores para evitar repetição:
   ```
   resource.find({ query: "auditoria framework", target: "viking://resources/ultralearning/reviews/" })
   resource.find({ query: "proposta", target: "viking://resources/ultralearning/planning/" })
   ```
2. **`#review-structure`** — Estrutura do projeto: diretórios, nomenclatura, arquivos órfãos
3. **`#review-tools`** — Tools TypeScript (`.opencode/tools/`): tratamento de erros, tipagem Zod, cache, consistência
4. **`#review-docs`** — Documentação: coerência com código, links, seções desatualizadas
5. **`#review-commands`** — Commands (`.opencode/commands/`): frontmatter completo, `$ARGUMENTS`, nomenclatura
6. **`#review-skills`** — Skills (`.opencode/skills/`): SKILL.md com `name` e `description`, nomenclatura válida
7. **`#review-agents`** — Agentes: formato padronizado, keywords, consistência
8. **`#review-consistency`** — Consistência: nomenclatura, redundâncias, keywords órfãs, matriz de dependências
9. **`#review-costs`** — Otimização de custos: tamanho de agentes, duplicação, cache elegível

Gerar relatório usando template @.opencode/templates/_template-framework-review.md com: Estado Atual, Problemas Identificados (CRÍTICO/ALTO/MÉDIO/BAIXO), Ações Recomendadas.

## Arquivamento

Após gerar o relatório, arquivar no OpenViking:
```
resource.write({
  uri: "viking://resources/ultralearning/reviews/audit-[tipo]-YYYY-MM-DD.md",
  content: "<conteúdo do relatório>",
  mode: "replace"
})
```

Isso permite que revisões futuras encontrem esta auditoria via `resource.find`.

## Handoff

- Problemas encontrados → sugerir correções específicas por prioridade
- Quer detalhar área específica → executar revisão individual