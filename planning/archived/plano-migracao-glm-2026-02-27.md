# Plano de Migração: OpenCode Agents + GLM

**Gerado por**: @review  
**Data**: 2026-02-27  
**Status**: ✅ Implementado — 2026-02-27  
**Referência**: `reviews/opencode-agents-best-practices-2026-02-27-v1.0.0.md`

---

## Objetivo

Implementar boas práticas do OpenCode Agents (frontmatter YAML, `mode`, `tools`, `permissions`, `description`) e migrar o modelo principal de Claude Sonnet/Haiku para **GLM-5 / GLM-4.7** via OpenCode Zen.

---

## Modelo de Custos (Zen)

| Modelo | Input | Output | Cached | vs. Anterior |
|--------|-------|--------|--------|--------------|
| **GLM-5** | $1.00 | $3.20 | $0.20 | **-67%** vs Sonnet ($3/$15) |
| **GLM-4.7** | $0.60 | $2.20 | $0.10 | **-40%** vs Haiku ($1/$5) |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $0.30 | baseline |
| Claude Haiku 4.5 | $1.00 | $5.00 | $0.10 | baseline |

**Economia estimada**: ~70% em custos de tokens

---

## Roteamento de Modelos

| Agente | Modelo | Justificativa |
|--------|--------|---------------|
| @meta | GLM-5 | Primary agent — planejamento complexo, raciocínio de alto nível |
| @tutor | GLM-5 (padrão global) | Ensino socrático exige raciocínio, analogias, feedback de qualidade |
| @review | GLM-5 (padrão global) | Análise crítica profunda, auditoria arquitetural |
| @session | GLM-4.7 | Orquestração simples — mapear atividade → keyword, template fixo |
| small_model | GLM-4.7 | Títulos de sessão, sumarização, tarefas leves |

---

## Decisões de Configuração: Tools, Temperature, Permissions

Esta seção documenta o racional técnico por trás de cada escolha de configuração.

### Tools: O que o Agente PODE fazer

As ferramentas controlam a superfície de atuação do agente:

| Tool | O que faz | Risco |
|------|-----------|-------|
| `read` | Ler arquivos | Zero — read-only |
| `write` | Criar arquivos novos | Médio — pode criar lixo |
| `edit` | Modificar arquivos existentes | Alto — pode quebrar código |
| `bash` | Executar comandos shell | Muito alto — pode deletar/pushar/instalar |
| `grep/glob` | Buscar arquivos/conteúdo | Zero — read-only |

#### @meta: `tools: {write: false, edit: false, bash: false}`

**Por quê false?**

@meta é **planejamento puro**. Seus artefatos são `learning-map.md`, `week-N.md`, `resources.md`.

**Problema se tools=true**:
```
@meta: "#create-weekly-plan semana 5"
[@meta sobrescreve week-05.md existente SEM PERGUNTAR]
Usuário: "?! Eu queria ATUALIZAR, não sobrescrever!"
```

**Com `write: false`**:
- @meta **gera** o conteúdo na conversa
- Usuário **valida** visualmente
- Usuário **copia/salva** manualmente ou pede explicitamente

> **Alternativa**: `write: "ask"` → toda geração pede confirmação. Mas como @meta nunca edita, `false` é mais limpo.

#### @tutor: `tools: {write: "ask", edit: "ask", bash: "ask"}`

**Por quê "ask"?**

@tutor é **execução com filosofia socrática**:

```markdown
> "Você guia, NÃO resolve."
```

**Problema se tools=true**:
```
Usuário: "#directness Criar API REST"
@tutor: [cria 15 arquivos, edita 3 existentes, roda npm install]
Usuário: "Eu queria APRENDER a fazer, não receber código pronto!"
```

**Com `"ask"`**:
```
@tutor: "Vou criar o arquivo src/api.js. Prosseguir?"
[1] Sim
[2] Não
[3] Explique primeiro o que você vai fazer
```

Isso **força intervenção do usuário** — alinhado com ensino socrático.

**Por quê não false?**

@tutor às vezes PRECISA criar/modificar:
- `#scaffold` → criar estrutura de projeto
- `#feedback` → pode sugerir correções (com confirmação)
- `#directness` → ajudar a construir passo a passo (com confirmação)

#### @review: `tools: {write: false, edit: false, bash: false}`

**Por quê false?**

@review é **auditor read-only**:

```markdown
> "Você NÃO executa mudanças. Você diagnostica, propõe e planeja."
```

**Problema se tools=true**:
```
@review: "#audit-quality"
[@review encontra problema e EDITA o arquivo automaticamente]
Usuário: "Quem te deu permissão de mudar o código?!"
```

**Com `false`**:
- @review gera relatório
- @review propõe mudanças
- @review **NUNCA toca nos arquivos**

> Handoff claro: "@review propõe → humano decide → @meta/@tutor implementa"

#### @session: `tools: {write: false, edit: false, bash: false}`

**Por quê false?**

@session é **orquestrador ultra-leve**:

```
make start → @session #session-start → sugere "@tutor #drill X" → FIM
```

Ele NÃO cria, NÃO edita, NÃO roda comandos. Ele só:
1. Lê o plano da semana
2. Sugere a keyword do @tutor
3. Devolve controle

---

### Temperature: Criatividade vs Determinismo

| Range | Comportamento | Uso típico |
|-------|---------------|------------|
| **0.0-0.2** | Muito focado, determinístico | Análise, planejamento, auditoria |
| **0.3-0.5** | Balanceado, consistente | Desenvolvimento geral |
| **0.6-1.0** | Criativo, variado | Brainstorm, exploração |

#### @meta: `temperature: 0.2`

**Por quê baixo?**

Planejamento beneficia de **determinismo**:

```
Usuário: "#create-weekly-plan semana 5"
[Semana 5, mesmo contexto, Output MUITO SIMILAR]
```

**Problema se temperature alto (0.7)**:
```
@meta: "Semana 5: vamos focar em... [inventa tópicos novos aleatórios]"
[Semana 5 já tinha plano, @meta diverge criativamente]
```

**0.2 garante**:
- Cronogramas estruturados consistentes
- Variação mínima entre respostas
- Foco no plano existente, NÃO em "inventar"

#### @tutor: `temperature: 0.5`

**Por quê médio?**

Ensino socrático PRECISA de flexibilidade:

**Cenário: explicar conceito difícil**
```
[1ª tentativa - analogia culinária]
@tutor: "Recursão é como uma matrioska..."
Usuário: "Não entendi."

[2ª tentativa - analogia diferente]
@tutor: "Vamos tentar outro jeito: recursão é como um espelho refletindo outro espelho..."
[temperature 0.5 permite VARIAÇÃO na 2ª resposta]
```

**Problema se temperature baixo (0.1)**:
```
@tutor: "Explique recursão..."
[Output sempre idêntico, repete a mesma analogia que não funcionou]
```

**0.5 garante**:
- Analogias variadas quando necessário
- Adaptação ao nível do usuário
- Perguntas criativas (não repetitivas)

**Por quê não mais alto?**
- 0.7+ → @tutor poderia "inventar" exercícios errados
- 0.8+ → perguntas genéricas demais
- 0.5 é sweet spot para ensino adaptativo

#### @review: `temperature: 0.1`

**Por quê muito baixo?**

Auditoria precisa de **consistência total**:

```
@review: "#audit-quality"
[Output estruturado, previsível, sem variação criativa]
```

**Problema se temperature alto (0.6)**:
```
@review: "#review-scripts"
[1ª execução] "Script X tem 3 problemas..."
[2ª execução, mesmo contexto] "Os scripts estão ótimos!"
[Inconsistência — perigoso para auditoria]
```

**0.1 garante**:
- Mesma análise, mesmo diagnóstico
- Relatórios estruturados padrão
- Objetividade (sem "criatividade" na hora de julgar)

> Como um linter: output previsível e confiável.

#### @session: `temperature: 0.3`

**Por quê baixo-médio?**

Orquestração é **quase determinística**:

```
Input: "week-05.md, dia 3, conceito pendente"
Output: "#explain closures" [sempre mapeia igual]
```

Mas PRECISA de leve ajuste:

```
[Usuário em dia ruim]
@session: "Vejo que está atrás do plano. Sugestão:..."
[temperature 0.3 permite ajuste de TOM, não de lógica]
```

**0.3 garante**:
- Mapeamento consistente (atividade → keyword)
- Leve adaptação de tom
- Sem "criatividade" nas sugestões

---

### Permissions: O que é BLOQUEADO ou controlado

| Valor | Significado |
|-------|-------------|
| `"allow"` | Sempre permitido, sem confirmação |
| `"ask"` | Pede confirmação antes |
| `"deny"` | Bloqueado totalmente |

#### @meta: `permission: {edit: "deny", bash: "deny"}`

**Por quê deny?**

`edit` ≠ `write`:
- `write` = criar arquivos NOVOS
- `edit` = modificar arquivos EXISTENTES

@meta **NUNCA edita** existentes:
- `learning-map.md` existente → não deve sobrescrever
- Código fonte → não é papel dele

`bash: deny`:
- @meta não roda `npm install`, `git push`, `rm -rf`
- Reduz superfície de ataque

#### @tutor: `permission: {edit: "ask", bash: {"*": "ask", "grep *": "allow", "git status": "allow"}}`

**Por quê ask com exceções?**

```
"bash": {
  "*": "ask",        ← default: TUDO pede confirmação
  "grep *": "allow", ← exceção: grep é read-only, permitido
  "git status": "allow" ← exceção: consulta, seguro
}
```

**Benefício**:
```
@tutor: "#debug API retorna 500"
@tutor: [roda grep sem pedir confirmação] ✅
@tutor: [roda git status sem pedir confirmação] ✅
@tutor: "Vou rodar 'rm -rf node_modules'..."
[1] Permitir
[2] Negar  ← confirmação OBRIGATÓRIA para comandos perigosos
```

Reduz fricção para inofensivos, mantém controle no críticos.

#### @review: `permission: {edit: "deny", bash: "deny", webfetch: "allow"}`

**Por quê deny + webfetch allow?**

`edit/bash deny`:
- @review é read-only, nunca executa

`webfetch allow`:
- @review pode buscar documentação externa
- Ex: você pediu revisão de boas práticas → @review buscou no opencode.ai

**Por quê não ask?**
- `webfetch` é fetch read-only
- Não tem risco de modificação
- `allow` simplifica — não atrapalha workflow

#### @session: `permission: {edit: "deny", bash: "deny"}`

**Por quê deny?**

@session é **orquestrador sem escrita**:
- Ele só lê e sugere
- Nunca edita, nunca roda comandos

---

### Resumo Visual

```
┌──────────┬───────────────┬─────────────┬───────────────────────────────┐
│ Agente   │ Tools         │ Temperature │ Permissions                   │
├──────────┼───────────────┼─────────────┼───────────────────────────────┤
│ @meta    │ write: false  │ 0.2 (foco)  │ edit: deny, bash: deny        │
│          │ edit: false   │             │                               │
│          │ bash: false   │             │ task: tutor allow, review ask │
├──────────┼───────────────┼─────────────┼───────────────────────────────┤
│ @tutor   │ write: ask    │ 0.5         │ edit: ask                     │
│          │ edit: ask     │ (adaptativo)│ bash: *ask, grep allow       │
│          │ bash: ask     │             │                               │
├──────────┼───────────────┼─────────────┼───────────────────────────────┤
│ @review  │ write: false  │ 0.1 (rígido)│ edit: deny, bash: deny       │
│ (hidden) │ edit: false   │             │ webfetch: allow               │
│          │ bash: false   │             │ task: não configurado         │
├──────────┼───────────────┼─────────────┼───────────────────────────────┤
│ @session │ write: false  │ 0.3         │ edit: deny, bash: deny       │
│          │ edit: false   │ ( leve)     │ task: tutor allow             │
│          │ bash: false   │             │                               │
│          │               │ Model:      │                               │
│          │               │ GLM-4.7     │                               │
└──────────┴───────────────┴─────────────┴───────────────────────────────┘
```

---

## Arquivos a Modificar

| # | Arquivo | Tipo de Mudança |
|---|---------|-----------------|
| 1 | `.opencode/opencode.json` | Modelos + seção `agent` completa |
| 2 | `.opencode/agents/meta.md` | Frontmatter + Identidade |
| 3 | `.opencode/agents/tutor.md` | Frontmatter + Identidade + Model Routing |
| 4 | `.opencode/agents/review.md` | Frontmatter + Identidade |
| 5 | `.opencode/agents/session.md` | Frontmatter + Identidade |
| 6 | `.opencode/agents/_template-agent.md` | Frontmatter exemplo + Identidade padrão |

---

## Fase 1: `.opencode/opencode.json`

### Mudanças

1. `"model"`: `opencode/claude-sonnet-4-6` → `opencode/glm-5`
2. `"small_model"`: `opencode/claude-haiku-4-5` → `opencode/glm-4.7`
3. Remover `"models"` do provider `opencode` (variantes Sonnet não necessárias)
4. Manter `"setCacheKey": true` no provider `opencode`
5. Manter provider `lmstudio` (modelos locais — não afetados)
6. Adicionar seção `"agent"` com configuração dos 4 agentes

### Resultado Esperado

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/glm-5",
  "small_model": "opencode/glm-4.7",
  "provider": {
    "lmstudio": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "LM Studio (local)",
      "options": {
        "baseURL": "http://192.168.1.137:1234/v1"
      },
      "models": {
        "qwen/qwen3-coder-30b": {
          "name": "Qwen 3.5 Coder 30B (local)"
        },
        "zai-org/glm-4.7-flash": {
          "name": "GLM 4.7 Flash (local)"
        }
      }
    },
    "opencode": {
      "options": {
        "setCacheKey": true
      }
    }
  },
  "agent": {
    "meta": {
      "description": "Arquiteto de aprendizado. Planeja módulos, mapeia recursos, cria cronogramas semanais.",
      "mode": "primary",
      "model": "opencode/glm-5",
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
      "description": "Mentor socrático de ultralearning. Guia sessões com #directness, #feynman, #drill, #quiz.",
      "mode": "subagent",
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
      "description": "Revisor arquitetural. Audita qualidade do framework e propõe melhorias.",
      "mode": "subagent",
      "hidden": true,
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
      "description": "Orquestrador de sessões. Sugere atividades baseado no plano semanal.",
      "mode": "subagent",
      "model": "opencode/glm-4.7",
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

---

## Fase 2: Frontmatter dos Agentes

Adicionar bloco YAML no topo de cada arquivo `.md` (antes do `# Título`).

### @meta.md

```yaml
---
description: Arquiteto de aprendizado. Planeja módulos, mapeia recursos, cria cronogramas semanais.
mode: primary
model: opencode/glm-5
temperature: 0.2
tools:
  write: false
  edit: false
  bash: false
permission:
  edit: deny
  bash: deny
task:
  "*": deny
  tutor: allow
  review: ask
---
```

### @tutor.md

```yaml
---
description: Mentor socrático de ultralearning. Guia sessões com #directness, #feynman, #drill, #quiz.
mode: subagent
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

### @review.md

```yaml
---
description: Revisor arquitetural. Audita qualidade do framework e propõe melhorias.
mode: subagent
hidden: true
temperature: 0.1
tools:
  write: false
  edit: false
  bash: false
permission:
  edit: deny
  bash: deny
  webfetch: allow
---
```

### @session.md

```yaml
---
description: Orquestrador de sessões. Sugere atividades baseado no plano semanal.
mode: subagent
model: opencode/glm-4.7
temperature: 0.3
tools:
  write: false
  edit: false
  bash: false
permission:
  edit: deny
  bash: deny
task:
  "*": deny
  tutor: allow
---
```

---

## Fase 3: Atualizar Seção Identidade

Linha `**Modelo**` em cada arquivo:

| Arquivo | De | Para |
|---------|-----|------|
| meta.md | `Claude Sonnet 4.6` | `GLM-5` |
| tutor.md | `Claude Sonnet 4.6` | `GLM-5` |
| review.md | `Claude Sonnet 4.6` | `GLM-5` |
| session.md | `Claude Sonnet 4.6` | `GLM-4.7` |

---

## Fase 4: Atualizar Seção Model Routing em @tutor

Linha que menciona `claude-haiku`:

**De**:
```markdown
**Candidatas a `small_model`** (claude-haiku - custo ~80% menor):
```

**Para**:
```markdown
**Candidatas a `small_model`** (glm-4.7 - custo ~80% menor):
```

---

## Fase 5: Atualizar Template `_template-agent.md`

1. Adicionar frontmatter de exemplo no topo
2. Atualizar linha `**Modelo**` na seção Identidade

### Frontmatter exemplo

```yaml
---
description: [Descrição curta — obrigatório para Task tool e autocomplete]
mode: subagent
model: opencode/glm-5
temperature: 0.5
tools:
  write: false
  edit: false
  bash: false
permission:
  edit: deny
  bash: deny
---
```

### Identidade padrão

```markdown
- **Modelo**: GLM-5 (padrão) ou GLM-4.7 (agentes de orquestração simples)
```

---

## Checklist de Implementação

### Fase 1 — `opencode.json`
- [ ] Trocar `model` → `opencode/glm-5`
- [ ] Trocar `small_model` → `opencode/glm-4.7`
- [ ] Remover bloco `models` do provider `opencode`
- [ ] Manter `setCacheKey: true`
- [ ] Adicionar seção `agent` completa

### Fase 2 — Frontmatter
- [ ] `meta.md` — adicionar frontmatter
- [ ] `tutor.md` — adicionar frontmatter
- [ ] `review.md` — adicionar frontmatter
- [ ] `session.md` — adicionar frontmatter

### Fase 3 — Identidade
- [ ] `meta.md` — atualizar modelo
- [ ] `tutor.md` — atualizar modelo
- [ ] `review.md` — atualizar modelo
- [ ] `session.md` — atualizar modelo

### Fase 4 — Model Routing
- [ ] `tutor.md` — substituir referência a `claude-haiku`

### Fase 5 — Template
- [ ] `_template-agent.md` — adicionar frontmatter exemplo
- [ ] `_template-agent.md` — atualizar modelo padrão na Identidade

### Validação
- [ ] `/models` no TUI → GLM-5 selecionado por padrão
- [ ] `Tab` → cicla entre @meta e agente build
- [ ] `@` autocomplete → @review NÃO aparece (hidden)
- [ ] `@tutor ...` → subagent invocável
- [ ] @review tenta editar arquivo → bloqueado por permission `deny`

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| GLM-5 não disponível no Zen | Baixa | Listado na doc Zen; verificar com `/models` antes |
| Frontmatter com YAML inválido | Média | Usar template e validar ordem das chaves |
| `hidden: true` não funciona para @review | Baixa | Documentado: só funciona com `mode: subagent` ✅ |
| Permissions não aplicadas corretamente | Média | Testar @review manualmente após implementação |
| Comportamento diferente GLM vs Claude | Média | Monitorar qualidade das primeiras sessões; ajustar temperature se necessário |

---

## Plano de Rollback

Se necessário reverter:

1. `opencode.json`: Restaurar `model: opencode/claude-sonnet-4-6` e `small_model: opencode/claude-haiku-4-5`
2. Agentes `.md`: Remover blocos de frontmatter (tudo antes do primeiro `# Título`)
3. Identidade: Restaurar `Claude Sonnet 4.6` nos arquivos editados

O rollback não afeta dados de estudo nem scripts bash.

---

## Tempo Estimado

| Fase | Tempo |
|------|-------|
| 1: opencode.json | 15 min |
| 2: Frontmatter (4 arquivos) | 20 min |
| 3: Identidade (4 arquivos) | 10 min |
| 4: Model Routing @tutor | 5 min |
| 5: Template | 5 min |
| Validação | 10 min |
| **Total** | **~65 min** |

---

*Plano gerado a partir da análise `reviews/opencode-agents-best-practices-2026-02-27-v1.0.0.md`*
