# Proposta: Unificação de Configuração de Agentes

**Data**: 2026-03-03  
**Tipo**: planning proposal  
**Agente**: @review  

---

## 🎯 Resumo Executivo

**Problema**: Configuração de agentes duplicada entre `opencode.json` (131 linhas) e YAML frontmatter dos arquivos `.opencode/agents/*.md` (~75 linhas repetidas em 5 arquivos).

**Solução proposta**: Manter APENAS `opencode.json` para configuração, simplificar os arquivos `.md` para conter apenas o system prompt.

**Impacto**: 
- Remove ~75 linhas de redundância
- Garante consistência (uma fonte de verdade)
- Mantém legibilidade e documentação

---

## 📊 Análise Atual

### O que está duplicado

| Campo | opencode.json | agents/*.md | Redundante |
|-------|---------------|-------------|------------|
| `description` | ✅ | ✅ | ✅ |
| `mode` | ❌ | ✅ | ✅ |
| `model` | ✅ (global + por agente) | ✅ | ✅ |
| `temperature` | ❌ | ✅ | ✅ |
| `tools` | ✅ | ✅ | ✅ |
| `permission` | ✅ | ✅ | ✅ |
| `task` | ✅ | ❌ | Parcial |

### Tamanho da redundância

```
agents/meta.md:      ~15 linhas YAML
agents/tutor.md:     ~15 linhas YAML
agents/review.md:    ~15 linhas YAML
agents/session.md:   ~16 linhas YAML
agents/run.md:       ~15 linhas YAML
─────────────────────────────────────
Total duplicado:     ~75 linhas
```

### O que NÃO é redundante

Os arquivos `.md` contêm conteúdo único e essencial:

| Seção | Linhas | Preservar? |
|-------|--------|------------|
| Identidade (texto) | ~5 | ✅ Sim |
| Missão | ~10 | ✅ Sim |
| Contexto e Continuidade | ~30 | ✅ Sim |
| Keywords completas | ~150 | ✅ Sim |
| Quick Reference | ~30 | ✅ Sim |
| Exemplos de Interação | ~50 | ✅ Sim |
| Checklist Final | ~20 | ✅ Sim |
| Conexão com Outros Agentes | ~30 | ✅ Sim |

---

## 🏗️ Estrutura Proposta

### Após a migração:

```
.opencode/
├── opencode.json          # ✅ Configuração COMPLETA dos agentes
├── agents/
│   ├── _template-agent.md # ✅ Template atualizado (sem YAML)
│   ├── meta.md           # ✅ System prompt apenas
│   ├── tutor.md          # ✅ System prompt apenas
│   ├── review.md         # ✅ System prompt apenas
│   ├── session.md        # ✅ System prompt apenas
│   └── run.md            # ✅ System prompt apenas
└── skills/               # ✅ Inalterado
```

### Alteração no template (_template-agent.md):

```yaml
# ANTES (com YAML redundante):
---
description: Descrição curta...
mode: subagent
temperature: 0.5
tools:
  write: false
  ...
---

# DEPOIS (apenas comentário informativo):
<!-- 
Configuração: see opencode.json
- model: opencode/glm-5 (padrão) ou glm-4.7
- mode: primary ou subagent
- temperature: 0.1-0.5
- tools/permission: see opencode.json
-->
```

### quick reference nos .md (nova seção):

Adicionar uma tabela resumida no início de cada .md para referência rápida:

```markdown
# 🎓 Agente @tutor - Mentor Socrático

| 属性 | Valor |
|------|-------|
| **Modelo** | opencode/glm-5 |
| **Mode** | primary |
| **Temperature** | 0.5 |
| **Uso** | 80% do tempo |

> ⚙️ Configuração: see `.opencode/opencode.json`

---
```

---

## 📋 Plano de Migração

### Fase 1: Preparação (5 min)

1. **Backup**: Copiar `opencode.json` para `opencode.json.backup`
2. **Validar**: Garantir que `opencode.json` está completo e funcional

### Fase 2: Atualizar Template (10 min)

1. Editar `_template-agent.md`:
   - Remover YAML frontmatter completo
   - Substituir por comentário informativo
   - Adicionar tabela de resumo inline

### Fase 3: Migrar Agentes (15 min)

Para cada agente (`meta.md`, `tutor.md`, `review.md`, `session.md`, `run.md`):

1. Remover YAML frontmatter (~15 linhas)
2. Adicionar tabela de resumo inline (~8 linhas)
3. Atualizar referência para opencode.json

### Fase 4: Validar (5 min)

1. Testar agentes com `opencode run @tutor "#quiz 1 test"`
2. Verificar que `opencode.json` continua funcionando
3. Confirmar que autocomplete de agentes funciona

---

## ⚠️ Riscos e Mitigações

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| opencode.json invalida | Baixa | Backup antes, reverter se necessário |
| Agentes param de carregar | Baixa | Testar cada agente após mudança |
| Perda de informação | Baixa | YAML é duplicado, conteúdo principal está no .md |

---

## ✅ Critérios de Sucesso

- [ ] opencode.json continua funcionando para todos os agentes
- [ ] ~75 linhas de redundância eliminadas
- [ ] Autocomplete de agentes funciona
- [ ] Nenhum comportamento alterado para o usuário
- [ ] Template atualizado serve como referência para novos agentes

---

## 📅 Cronograma

| Fase | Esforço | Tempo |
|------|---------|-------|
| Preparação | 5 min | Imediato |
| Template | 10 min | Imediato |
| Agentes (5x) | 15 min | Imediato |
| Validação | 5 min | Imediato |
| **Total** | **35 min** | **Uma sessão** |

---

## 🔄 Rollback (se necessário)

Se algo der errado:

```bash
# Restaurar backup
cp opencode.json.backup opencode.json

# Os arquivos .md voltam ao anterior (têm backup no git)
git checkout -- .opencode/agents/
```

---

## 💡 Alternativa: Manter Status Quo

Se decidir não migrar, documentar como "已知 trade-off":

```markdown
### Configuração Duplicada (Trade-off Aceito)

| Local | Uso |
|-------|-----|
| opencode.json | Runtime - usado pelo OpenCode |
| agents/*.md | Desenvolvimento - documentação e referência |

**Ventaja**: Cada arquivo .md é auto-contido
**Desventaja**: ~75 linhas duplicadas
```

---

## 🎯 Recomendação Final

**Recomendo a migração** porque:

1. **Uma fonte de verdade** — Elimina risco de divergência
2. **Manutenção simplificada** — Mudar 1 arquivo, não 5
3. **Massa crítica pequena** — 75 linhas, migração rápida
4. **Sem perda funcional** — Tudo que importa está no .md

---

*Proposta criada em: 2026-03-03*
