---
description: Auditoria completa do framework (/ul-review-audit)
agent: review
model: opencode-go/glm-5.1
---

## Uso
/ul-review-audit

## Descrição

Auditoria completa do Ultralearning System. Executa revisão sequencial de todas as áreas do framework e gera relatório executivo com roadmap de melhorias.

## Documentação de Referência

Consulte a documentação oficial do OpenCode durante a auditoria:
- **Commands**: https://opencode.ai/docs/commands/
- **Custom Tools**: https://opencode.ai/docs/custom-tools/
- **Agents**: https://opencode.ai/docs/agents/
- **Skills**: https://opencode.ai/docs/skills/

## Processo

Executar revisões na seguinte ordem (cada passo corresponde a uma keyword do agente @review):

### Passo 1: `#review-structure` — Estrutura do Projeto

Analisar organização do projeto:
- Listar estrutura de diretórios
- Verificar nomenclatura (kebab-case)
- Identificar arquivos órfãos ou duplicados

### Passo 2: `#review-tools` — Tools TypeScript

Analisar **11 tools** em `.opencode/tools/`:
- Tratamento de erros adequado
- Tipagem Zod implementada
- Cache de 5 minutos configurado
- Padrão consistente entre tools

### Passo 3: `#review-docs` — Documentação

Verificar documentação em `guides/`, `README.md`:
- Coerência com código atual
- Links funcionando
- Seções desatualizadas

### Passo 4: `#review-commands` — Commands Unificados

Verificar os **29 commands** em `.opencode/commands/`:
- Frontmatter completo (description, agent, model)
- Campo `model` definido (opencode-go/glm-5.1, opencode-go/glm-5, opencode-go/kimi-k2.5, opencode-go/minimax-m2.5)
- Placeholders `$ARGUMENTS` configurados corretamente
- Nomenclatura consistente (`ul-[categoria]-[ação]`)
- Documentação clara

### Passo 5: `#review-skills` — Skills do Sistema

Verificar **5 skills** em `.opencode/skills/`:
- Frontmatter `SKILL.md` com `name` e `description`
- Nomenclatura válida (`^[a-z0-9]+(-[a-z0-9]+)*$`)
- Integração com commands

### Passo 6: `#review-agents` — Agentes do Sistema

Verificar agentes em `.opencode/agents/`:
- Formato padronizado
- Keywords documentadas
- Quick Reference presente
- Consistência entre agentes

### Passo 7: `#review-consistency` — Consistência e Redundâncias

Executar análise completa:
- **Cosmético**: nomenclatura, datas, mensagens, prefixos
- **Redundância funcional**: commands, tools, skills, docs sobrepostos
- **Redundância em agentes**: keywords e funcionalidades duplicadas
- **Keywords órfãs**: definidas mas não referenciadas
- **Matriz de dependências**: mapear Commands → Tools → Skills

### Passo 8: `#review-costs` — Otimização de Custos

Verificar otimização:
- Tamanho dos agentes (tokens estimados)
- Duplicação de conteúdo
- Cache elegível documentado
- Contexto seletivo

### Passo 9: Análise de Technical Debt

Consolidar problemas encontrados:
- Priorização (crítico/alto/médio/baixo)
- Roadmap de melhorias
- Estimativa de esforço

## Output

Gerar relatório usando **template**: `@reviews/_template-framework-review.md`

O template já define estrutura completa. Preencher com:
- **Tipo**: `complete`
- **Estado Atual**: resumo de commands (29), tools (11), skills (5), agents (3)
- **Problemas Identificados**: usar gravidade CRÍTICO/ALTO/MÉDIO/BAIXO
- **Ações Recomendadas**: priorizar por imediato/curto/médio/longo prazo

## Exemplo

```
Usuário: /ul-review-audit

Sistema:
"🔍 Auditoria Completa - Ultralearning System v3.0

## Resumo Executivo
✅ Commands: 29 (todos com model definido)
✅ Tools: 11 (cache implementado)
✅ Skills: 5 (adequadas)
✅ Agents: 3 (@meta, @tutor, @review)
⚠️ Docs: 3 seções desatualizadas

## Problemas Identificados
1. [CRÍTICO] Command X sem campo model
2. [ALTO] Tool Y sem tratamento de erro
3. [MÉDIO] Doc Z referencia keyword antiga

## Roadmap
**Imediato**:
- Corrigir commands sem model

**Curto prazo**:
- Atualizar documentação

💾 Para salvar: reviews/audit-complete-2026-03-10-v3.0.0.md
Quer salvar ou detalhar algum aspecto?"
```

## Liberdade

Pode propor:
- Reestruturação completa se justificada
- Migração de tecnologia
- Consolidação de tools ou commands
- Remoção de funcionalidades obsoletas

---

*Command: /ul-review-audit - Auditoria completa do framework*
