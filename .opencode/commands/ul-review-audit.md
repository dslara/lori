---
description: Auditoria completa do framework (/ul-review-audit)
agent: review
model: opencode-go/glm-5
---

## Uso
/ul-review-audit

## Descrição

Auditoria completa do Ultralearning System. Executa revisão sequencial de todas as áreas do framework e gera relatório executivo com roadmap de melhorias.

## Processo

### Passo 1: Revisão de Estrutura

Analisar organização do projeto:
- Listar estrutura de diretórios
- Verificar nomenclatura (kebab-case)
- Identificar arquivos órfãos ou duplicados

### Passo 2: Revisão de Commands

Verificar os 22 commands em `.opencode/commands/`:
- Frontmatter completo (description, agent, model)
- Campo `model` definido (opencode-go/glm-5, opencode-go/kimi-k2.5, opencode-go/minimax-m2.5)
- Nomenclatura consistente (`ul-[categoria]-[ação]`)
- Documentação clara

### Passo 3: Revisão de Tools

Analisar 9 tools em `.opencode/tools/`:
- Tratamento de erros adequado
- Tipagem Zod implementada
- Cache de 5 minutos configurado
- Padrão consistente entre tools

### Passo 4: Revisão de Skills

Verificar 5 skills em `.opencode/skills/`:
- Necessidade e complexidade justificadas
- Documentação atualizada
- Integração com commands

### Passo 5: Revisão de Scripts

Analisar 7 scripts de sistema em `scripts/`:
- Tratamento de erros
- Mensagens padronizadas
- Complexidade vs necessidade

### Passo 6: Revisão de Documentação

Verificar documentação em `guides/`, `README.md`:
- Coerência com código atual
- Links funcionando
- Seções desatualizadas

### Passo 7: Revisão de Consistência

Checar padrões no projeto:
- Nomenclatura de arquivos
- Formato de datas (YYYY-MM-DD)
- Mensagens de output (tom, emoji)
- Prefixos padronizados

### Passo 8: Análise de Technical Debt

Consolidar problemas encontrados:
- Priorização (crítico/alto/médio/baixo)
- Roadmap de melhorias
- Estimativa de esforço

## Output

Relatório executivo com:
- Resumo por área (commands, tools, skills, docs)
- Lista de problemas identificados
- Priorização de correções
- Roadmap de melhorias:
  - **Imediato** (esta semana)
  - **Curto prazo** (próximo mês)
  - **Médio prazo** (3 meses)
  - **Longo prazo** (6+ meses)

## Exemplo

```
Usuário: /ul-review-audit

Sistema:
"🔍 Auditoria Completa - Ultralearning System v3.0

## Resumo Executivo
✅ Commands: 22 (todos com model definido)
✅ Tools: 9 (cache implementado)
✅ Skills: 5 (adequadas)
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

💾 Para salvar: reviews/audit-complete-2026-03-09-v3.0.0.md
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
