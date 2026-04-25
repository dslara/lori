# Revisão: Boas Práticas OpenCode Agents vs. Framework Ultralearning

**Gerado por**: @review  
**Data**: 2026-02-27  
**Versão**: v1.0.0  
**Tipo**: agents (configuração)

---

## Resumo Executivo

Análise comparativa entre a [documentação oficial do OpenCode Agents](https://opencode.ai/docs/agents/) e os 4 agentes atuais do framework (`@meta`, `@tutor`, `@review`, `@session`).

**Veredito**: Agentes estão **bem estruturados em texto**, mas **completamente ausentes de configuração técnica**. Faltam frontmatter YAML, `opencode.json` e opções essenciais como `mode`, `tools`, `permissions` e `temperature`.

**Distribuição de problemas**:
- 🔴 Críticos: **3**
- ⚠️ Importantes: **3**
- 🟡 Melhorias: **3**

---

## 📊 Estado Atual

### Nossos Agentes

| Agente | Linhas | Modelo (texto) | Mode (config) | Tools | Permission |
|--------|--------|----------------|---------------|-------|------------|
| @meta | 458 | Sonnet 4.6 | ❌ None | ❌ None | ❌ None |
| @tutor | 584 | Sonnet 4.6 | ❌ None | ❌ None | ❌ None |
| @review | 397 | Sonnet 4.6 | ❌ None | ❌ None | ❌ None |
| @session | 312 | Sonnet 4.6 | ❌ None | ❌ None | ❌ None |

### Opções Disponíveis (não utilizadas)

| Opção | Uso | Status |
|-------|-----|--------|
| `description` | Obrigatório p/ Task tool autocomplete | ❌ Apenas em texto |
| `mode` | `primary` / `subagent` / `all` | ❌ None |
| `model` | Override de modelo | ❌ Apenas em Identidade |
| `tools` | write, edit, bash, glob, grep, etc. | ❌ None |
| `permission` | ask/allow/deny p/ edit, bash, webfetch | ❌ None |
| `temperature` | Criatividade/foco | ❌ None |
| `task` | Quais subagentes pode invocar | ❌ None |
| `hidden` | Remover do autocomplete | ❌ None |
| `color` | Identificação visual | ❌ None |
| `steps` | Limitar iterações agentes | ❌ None |

---

## 🚨 Problemas Identificados

### CRÍTICOS

| # | Problema | Severidade | Impacto |
|---|----------|------------|---------|
| 1 | **Frontmatter YAML ausente** | 🔴 CRÍTICO | OpenCode não lê config — agentes dependem 100% do prompt text |
| 2 | **`opencode.json` inexistente** | 🔴 CRÍTICO | Sem config global (model default, cache, etc.) |
| 3 | **`mode` não definido** | 🔴 CRÍTICO | OpenCode não sabe quais são primary vs subagent |

### IMPORTANTES

| # | Problema | Severidade | Impacto |
|---|----------|------------|---------|
| 4 | **Sem controle de `tools`** | ⚠️ IMPORTANTE | Agentes podem fazer mais do que deveriam |
| 5 | **Sem `permission` configurado** | ⚠️ IMPORTANTE | @review não deveria editar, @meta não deveria executar bash |
| 6 | **`description` não indexado** | ⚠️ IMPORTANTE | Task tool não consegue selecionar agente automaticamente |

### MELHORIAS

| # | Problema | Severidade | Impacto |
|---|----------|------------|---------|
| 7 | **Model routing não configurado** | 🟡 MELHORIA | Keywords simples pagam Sonnet quando Haiku basta |
| 8 | **Sem `hidden` em @review** | 🟡 MELHORIA | @review aparece no autocomplete mas é uso raro |
| 9 | **Temperature fixo** | 🟡 MELHORIA | @meta poderia ter temp menor (foco), @tutor maior (criatividade) |

---

## 💡 Proposta de Implementação

### 1. Criar `opencode.json`

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-20250514",
  "setCacheKey": true,
  "agent": {
    "meta": {
      "description": "Arquiteto de aprendizado. Planeja módulos, mapeia recursos, cria cronogramas.",
      "mode": "primary",
      "model": "anthropic/claude-sonnet-4-20250514",
      "temperature": 0.2,
      "tools": {
        "write": false,
        "edit": false,
        "bash": false
      },
      "permission": {
        "edit": "deny",
        "bash": "deny"
      },
      "task": {
        "*": "deny",
        "tutor": "allow",
        "review": "ask"
      }
    },
    "tutor": {
      "description": "Mentor socrático de ultralearning. Guia sessões de estudo com #directness, #feynman, #drill, #quiz.",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4-20250514",
      "temperature": 0.5,
      "tools": {
        "write": "ask",
        "edit": "ask",
        "bash": "ask"
      },
      "permission": {
        "edit": "ask",
        "bash": {
          "*": "ask",
          "grep *": "allow",
          "git status": "allow"
        }
      }
    },
    "review": {
      "description": "Revisor arquitetural e planejador estratégico. Audita qualidade do framework.",
      "mode": "subagent",
      "hidden": true,
      "model": "anthropic/claude-sonnet-4-20250514",
      "temperature": 0.1,
      "tools": {
        "write": false,
        "edit": false,
        "bash": false
      },
      "permission": {
        "edit": "deny",
        "bash": "deny",
        "webfetch": "allow"
      }
    },
    "session": {
      "description": "Orquestrador de sessões de estudo. Sugere atividade e consolida progresso.",
      "mode": "subagent",
      "model": "anthropic/claude-haiku-4-20250514",
      "temperature": 0.3,
      "tools": {
        "write": false,
        "edit": false,
        "bash": false
      },
      "permission": {
        "edit": "deny",
        "bash": "deny"
      },
      "task": {
        "*": "deny",
        "tutor": "allow"
      }
    }
  }
}
```

### 2. Adicionar Frontmatter nos Arquivos Markdown

**@tutor.md** (exemplo de frontmatter):
```yaml
---
description: Mentor socrático de ultralearning. Guia sessões de estudo com #directness, #feynman, #drill, #quiz.
mode: subagent
model: anthropic/claude-sonnet-4-20250514
temperature: 0.5
tools:
  write: ask
  edit: ask
  bash: ask
permission:
  edit: ask
  bash:
    "*": ask
    "grep *": allow
    "git status": allow
---
```

### 3. Model Routing por Keyword

Configurar Haiku para keywords simples (economia ~80%):

| Keyword | Agente | Modelo Sugerido | Justificativa |
|---------|--------|-----------------|----------------|
| `#zombie` | @tutor | Haiku | Micro-passos simples |
| `#diffuse` | @tutor | Haiku | Instrução de pausa |
| `#quiz` | @tutor | Haiku | 3-5 perguntas rápidas |
| `#wrap-up` | @tutor | Haiku | Consolidação com template |
| `#session-start` | @session | Haiku | Mapear atividade → keyword |
| `#session-end` | @session | Haiku | Preencher template |
| `#session-plan` | @session | Haiku | Leitura + display |

---

## 📋 Plano de Implementação

| Fase | Tarefa | Tempo | Prioridade |
|------|--------|-------|------------|
| 1 | Criar `opencode.json` com config dos 4 agentes | 30min | 🔴 CRÍTICO |
| 2 | Adicionar frontmatter YAML em cada `.md` | 20min | 🔴 CRÍTICO |
| 3 | Testar switching entre agentes (`Tab`) | 10min | 🔴 CRÍTICO |
| 4 | Configurar `hidden: true` para @review | 5min | 🟡 MELHORIA |
| 5 | Documentar em `guides/` como usar frontmatter | 20min | 🟢 DOC |
| 6 | Implementar model routing (verificar suporte OpenCode) | 1h | 🟡 MELHORIA |

**Total estimado**: ~2h

---

## ⚠️ Riscos

1. **Breaking change**: Mudar de `.md` puramente textual para frontmatter pode requerer ajuste se o OpenCode já lê os arquivos de outra forma
2. **`small_model`**: Verificar se OpenCode suporta model routing por keyword ou se requer lógica no prompt

---

## 🔗 Referência

- [OpenCode Agents Documentation](https://opencode.ai/docs/agents/)
- [OpenCode Configuration](https://opencode.ai/docs/config/)

---

## 🤝 Próximos Passos

- **@meta**: Após implementar, atualizar `learning-map.md` para referenciar o novo system
- **@review**: Fazer `#review-costs` após implementação para validar se economizamos tokens

---

*Revisão gerada pelo agente @review — Comparação com documentação oficial OpenCode*
