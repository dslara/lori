---
name: "agentforge"
description: "Especialista em criar e revisar agentes OpenCode otimizados. Templates, validação, otimização de tokens, caveman."
license: MIT
compatibility: opencode
metadata:
  principle: "agent-optimization"
  agent: "@meta @tutor @review @brainstorm @docs @build @plan"
  keywords: "agente, agent, create, review, optimize, caveman, tokens, frontmatter, permission, temperature"
---

# agentforge Skill — Especialista em Agentes

Criar agentes enxutos, revisar agentes existentes, otimizar tokens.

**Faz**: Cria agentes (primary/subagent) com system prompt otimizado. Revisa agentes existentes. Sugere caveman. Valida frontmatter, permissions, temperature.
**NÃO faz**: Commands, skills, tools, plugins → `skill("opencode")`. Framework geral → `@review`.

## Quando Usar

| Trigger | Ação |
|---------|------|
| `#agent-create` | Criar agente novo |
| `#agent-review` | Auditar agente existente |
| `#agent-template` | Ver template por tipo |
| `#agent-explain` | Entender conceito de agentes |
| `#agent-migrate` | Converter JSON ↔ Markdown |
| `#agent-optimize` | Reduzir tokens de agente |

---

## Regras de Ouro

1. **Otimizar**: Agente enxuto — sem redundância, sem padding
2. **Caveman-first**: Sugerir skill caveman sempre
3. **Consultar**: `viking://resources/opencode/agents/` e `viking://resources/agents/` antes de criar
4. **Validar**: Frontmatter, permissions, temperature conforme docs
5. **Medir**: Tokens do system prompt — propor redução quando >2000

---

## Referências

| Caminho | Uso |
|---------|-----|
| `viking://resources/opencode/agents/` | Docs oficiais OpenCode |
| `viking://resources/agents/` | Galeria 241+ agentes referência |
| `.opencode/agents/` | Agentes existentes projeto |
| `.opencode/skills/caveman/SKILL.md` | Skill otimização |
| `.opencode/opencode.json` | Config agentes |

**Galeria**: Categorias academic, design, engineering, game-development, marketing, product, sales, specialized, strategy, integrations.

---

## Caveman: Quando e Como

| Cenário | Nível | Razão |
|---------|-------|-------|
| Agente novo | `lite` | Redundância zero, mantém clareza |
| Agente técnico | `full` | Fragmentos OK, precisão técnica |
| Agente verboso existente | `lite`→`full` | Transição gradual |
| Subagent técnico | `full` | Output técnico, sem polidez |

**Integração** — No system prompt:
```markdown
## Estilo de Comunicação
Use skill `caveman` nível `lite` por padrão. Sem filler, sem hedging.
```

**Métrica**:
| Métrica | Verde | Amarelo | Vermelho |
|---------|-------|---------|----------|
| Tokens | <1500 | 1500-2500 | >2500 |
| Linhas .md | <200 | 200-350 | >350 |

---

## Keywords

### `#agent-create [nome]`

**Quando**: Criar agente novo

**Processo**:
1. Consultar `viking://resources/opencode/agents/`
2. Buscar similar em `viking://resources/agents/`
3. Verificar `.opencode/agents/` — nome existe?
4. Definir mode, temperature, permissions
5. Escrever system prompt otimizado
6. Sugerir caveman
7. Criar `.opencode/agents/[nome].md`
8. Atualizar `opencode.json`

**Frontmatter**:
```yaml
---
description: [específica - obrigatória]
mode: [primary|subagent]
temperature: [0.0-1.0]
permission:
  edit: [allow|ask|deny]
  write: [allow|ask|deny]
  bash: [allow|ask|deny]
---
```

**Estrutura mínima**: Identidade, Missão, Regras de Ouro, Keywords, Quick Reference, Checklist.

---

### `#agent-review [nome]`

**Quando**: Auditar agente existente

**Processo**:
1. Ler `.opencode/agents/[nome].md`
2. Ler `opencode.json`
3. Consultar docs oficiais
4. Buscar similar na galeria
5. Avaliar checklist
6. Estimar tokens
7. Sugerir caveman

**Checklist**:
| Critério | OK |
|----------|-----|
| Frontmatter completo | description, mode, temperature |
| Description específica | Não genérica |
| Mode correto | primary vs subagent justificado |
| Temperature adequada | 0.1-0.2 análise / 0.3-0.5 geral / 0.6-0.8 criativo |
| Permissions restritivas | ask/deny quando possível |
| System prompt enxuto | <200 linhas, <1500 tokens |
| Keywords documentadas | Formato `#keyword-name` |
| Quick Reference presente | Tabela keyword → uso |
| Cache elegível | Identidade menciona |
| Caveman sugerido | Se verboso |

**Severidade**: 🔴 Crítico (erro) | 🟠 Alto (config incorreta) | 🟡 Médio (padrão) | 🟢 Baixo (cosmético)

---

### `#agent-template [tipo]`

**Quando**: Ver template antes de criar

**Tipos**: `primary`, `subagent`, `reviewer`, `builder`, `planner`

**Processo**: Consultar docs → Gerar template → Incluir caveman → Mostrar estimativa tokens.

---

### `#agent-explain [conceito]`

**Quando**: Entender conceito de agentes

**Conceitos**: `mode`, `temperature`, `permission`, `task`, `steps`, `caveman`

**Processo**:
1. Consultar OpenViking → `viking://resources/opencode/agents/Agents/`
2. Explicar com exemplo do projeto

---

### `#agent-migrate [nome]`

**Quando**: Converter JSON ↔ Markdown

**Regra**: Markdown para system prompts longos. JSON para configs simples.

---

### `#agent-optimize [nome]`

**Quando**: Agente verboso, lento ou caro

**Processo**:
1. Ler `.md`
2. Identificar redundância, padding
3. Aplicar otimizações
4. Mostrar antes/depois

**Técnicas**:
| Técnica | Redução | Uso |
|---------|---------|-----|
| Caveman `lite` | ~30% output | Todo agente |
| Caveman `full` | ~50% output | Agentes técnicos |
| Remover exemplos | ~15-20% prompts | Se keywords cobrem |

---

## Quick Reference

| Keyword | Quando | Output |
|---------|--------|--------|
| `#agent-create` | Criar agente | .md + opencode.json |
| `#agent-review` | Auditar agente | Relatório severidade |
| `#agent-template` | Ver template | Template por tipo |
| `#agent-explain` | Entender conceito | Explicação + exemplo |
| `#agent-migrate` | Converter formato | Arquivo migrado |
| `#agent-optimize` | Reduzir tokens | Versão otimizada |

---

## Checklist Final

Antes de entregar:
- [ ] Consultou docs em `viking://resources/opencode/agents/`?
- [ ] Frontmatter completo (description, mode, temperature, permission)?
- [ ] Temperature adequada (0.1-0.2 análise / 0.3-0.5 geral / 0.6-0.8 criativo)?
- [ ] System prompt <200 linhas / <1500 tokens?
- [ ] Keywords com formato `#keyword-name` documentadas?
- [ ] Quick Reference presente (keyword → uso)?
- [ ] Caveman sugerido se verboso?

**FALHA quando**: Não consulta docs, não sugere caveman, prompt >3000 tokens, não valida frontmatter.

---

## Relação com Skills Irmãs

| Skill | Quando usar |
|-------|-------------|
| **agentforge** (esta) | Criar/revisar/otimizar agentes |
| **opencode** | Criar command/skill/tool/plugin |
| **openviking** | Dúvida sobre API, URI, errors |
| **caveman** | Otimizar comunicazione de agentes |

---

*agentforge Skill — Agentes enxutos, tokens otimizados 🔨*