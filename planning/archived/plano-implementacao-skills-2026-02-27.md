# Plano: Implementação de Skills no Framework Ultralearning

**Gerado por**: @review  
**Data**: 2026-02-27  
**Status**: ✅ Implementado — 2026-02-27  
**Referência**: `reviews/opencode-agents-best-practices-2026-02-27-v1.0.0.md`  
**Relacionado**: `planning/plano-migracao-glm-2026-02-27.md`

---

## Objetivo

Integrar **OpenCode Skills** ao framework para:
1. Reduzir prompts dos agentes (~70% tokens)
2. Conectar `guides/tecnicas/` aos agentes automaticamente
3. Centralizar manutenção de comportamentos específicos
4. Ativar guias completos on-demand

---

## Conceito

### O que são Skills

```markdown
> Skills são blocos de instruções carregados ON-DEMAND via tool `skill({ name: "..." })`
```

**Antes**:
```
@tutor: 584 linhas carregadas SEMPRE
→ Mesmo se só vai usar #zombie (5 linhas relevantes)
→ Tokens desperdiçados
```

**Depois**:
```
@tutor: ~200 linhas (identity + quick reference)
→ #drill invocado → skill({ name: "drill" }) carrega +300 linhas
→ Tokens economizados em sessões simples
```

### Relação: Agent → Skill → Guide

```
┌─────────────────────────────────────────────────────────┐
│  AGENT (.opencode/agents/tutor.md)                      │
│  ─────────────────────────────────────────────────────  │
│  - Identidade + missão                                  │
│  - Quick Reference table (keywords)                     │
│  - Cada keyword: 3-5 linhas + skill("name")             │
│  - Sem exemplos extensos (delegar para skills)          │
└─────────────────────────────────────────────────────────┘
                            │
                            │ @tutor recebe "#drill binary search"
                            │ → chama skill({ name: "drill" })
                            ▼
┌─────────────────────────────────────────────────────────┐
│  SKILL (.opencode/skills/drill/SKILL.md)                │
│  ─────────────────────────────────────────────────────  │
│  - Frontmatter (name, description)                      │
│  - Definição + quando usar                              │
│  - Processo passo a passo                               │
│  - Exemplo de interação                                 │
│  - Métricas de sucesso                                  │
│  - Handoff para próxima técnica                         │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Derivado/resumido de
                            ▼
┌─────────────────────────────────────────────────────────┐
│  GUIDE (guides/tecnicas/drill.md)                       │
│  ─────────────────────────────────────────────────────  │
│  778 linhas — para leitura humana                       │
│  - Explicação científica completa                       │
│  - 5+ exemplos detalhados                               │
│  - Métricas avançadas                                   │
│  - Links relacionados                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Estrutura de Diretórios

```
.opencode/skills/
├── _template-skill/
│   └── SKILL.md          ← Template para criar novas skills
├── drill/
│   └── SKILL.md          ← #drill
├── feynman/
│   └── SKILL.md          ← #feynman
├── directness/
│   └── SKILL.md          ← #directness
├── explain-concept/
│   └── SKILL.md          ← #explain
├── quiz/
│   └── SKILL.md          ← #quiz
├── zombie-mode/
│   └── SKILL.md          ← #zombie
├── debug-socratic/
│   └── SKILL.md          ← #debug
├── scaffold/
│   └── SKILL.md          ← #scaffold
├── decomposition/
│   └── SKILL.md          ← #decompose-goal (@meta)
└── benchmarking/
    └── SKILL.md          ← #benchmark-test (@meta)
```

---

## Template de SKILL.md

```markdown
---
name: [skill-name]
description: [1 frase clara — 1-1024 chars]
license: MIT
compatibility: opencode
metadata:
  principle: "[principle-number]-[name]"
  agent: "[@meta/@tutor/@review/@session]"
  keywords: "[comma-separated]"
---

## O que é [Skill]

[Definição em 2-3 frases]

## Quando Usar

✅ **USE** para:
- [Situação 1]
- [Situação 2]

❌ **NÃO USE** para:
- [Situação A] → use #[outra-keyword]
- [Situação B] → use #[outra-keyword]

## Processo

### Passo 1: [Nome] ([tempo])
[Instrução]

### Passo 2: [Nome] ([tempo])
[Instrução]

## Exemplo de Interação

Usuário: "#[keyword] [exemplo]"

Você: "[Resposta do agente seguindo o processo]"

## Métricas de Sucesso

| Métrica | Verde ✅ | Vermelho 🔴 |
|---------|----------|-------------|
| [Métrica] | [Valor] | [Valor] |

## Handoff

- [Situação]? → `#[próxima-keyword]`
- [Situação]? → `#[outra-keyword]`

## 📋 Makefile Integration

**Comandos relacionados**:
- `make [comando]` — [Descrição]
- `make [comando]` — [Descrição]

**Quando sugerir**:
- [Situação] → sugerir `make [comando]`
```

---

## Skills e Makefile: Separação de Responsabilidades

### Princípio Fundamental

**Skills NÃO executam scripts. Skills SUGEREM comandos.**

```
┌─────────────────────────────────────────────────────────────┐
│  Camada           │ Responsabilidade      │ Executa?       │
├───────────────────┼───────────────────────┼────────────────┤
│  Skills           │ Instruções (O QUE)    │ ❌ NÃO         │
│  Agentes          │ Comportamento (COMO)  │ ✅ SIM (c/ perm)│
│  Scripts (bash)   │ Interface para usuário│ ✅ SIM         │
│  Makefile         │ Orquestra scripts     │ ✅ SIM         │
└─────────────────────────────────────────────────────────────┘
```

### Por quê Skills NÃO executam?

1. **Skills são texto injetado no prompt**
   - Não tem acesso direto a `bash`, `write`, `edit`
   - Carregadas ON-DEMAND pelo agente via `skill({ name: "..." })`

2. **Quem executa é o AGENTE**
   - Agente carrega skill → age conforme instruções
   - Agente tem `tools` e `permissions` configurados
   - Skill só diz O QUE fazer, não COMO

3. **Separação de concerns**
   - Skill = "como fazer drill" (comportamento)
   - Script = "executar drill-extra" (implementação bash)
   - Makefile = "orquestrar comandos" (UX)

### Fluxo Correto

```
1. Usuário: make study → opção 2 (drill)
2. Script: opencode run --agent @tutor "#drill closures"
3. @tutor: carrega skill "drill"
4. Skill: contém "Handoff: Para overlearning: make drill-extra"
5. @tutor: executa drill, ao final SUGERE: "Para overlearning: make drill-extra"
6. Usuário: decide se quer executar make drill-extra
```

**Skill não executa** → **Agente sugere** → **Usuário decide**

### Tabela: Skills x Comandos Makefile

| Skill | Make command | Quando sugerir |
|-------|--------------|-----------------|
| `drill` | `make drill-extra` | Conceito dominado, quer overlearning |
| `drill` | `make review` | Erros recorrentes → criar flashcards |
| `quiz` | `make review` | Acertos < 80% → reforçar com flashcards |
| `feynman` | `make review` | Definições importantes → flashcards |
| `directness` | `make end` | Projeto concluído → salvar sessão |
| `zombie-mode` | `make study` | Superou procrastinação → continuar |
| `debug-socratic` | `make study` | Bug resolvido → continuar código |
| `session` | `make end` | Sessão concluída → salvar progresso |

### O que Skills NÃO devem fazer

| Ação | Por quê evitar |
|------|----------------|
| `skill: "execute make drill-extra"` | Skills não executam |
| `skill: "rode ./scripts/status.sh"` | Viola separação concerns |
| `skill: "use @tutor para..."` | Skill já está DENTRO de @tutor |

### Makefile Commands Disponíveis para Handoff

| Comando | Descrição | Útil para skill |
|---------|-----------|-----------------|
| `make start` | Iniciar sessão + quiz | Warm-up |
| `make study` | Loop de estudo interativo | Continuar sessão |
| `make end` | Encerrar + salvar + streak | Consolidar |
| `make review` | Spaced repetition (SRS) | Criar flashcards |
| `make drill-extra` | Overlearning: 5 variações | Aprimorar |
| `make retro` | Retrospectiva semanal | Reflexão |
| `make break` | Pausa 15min modo difuso | Descanso |
| `make status` | Ver streak e info | Progresso |
| `make plan` | Planejar semana com @meta | Próximo passo |
| `make archive` | Arquivar projeto | Limpeza |

---

## Mapeamento: Agent → Keyword → Skill

### @tutor (13 keywords → 8 skills)

| # | Keyword | Skill | Deriva de | Prioridade |
|---|---------|-------|-----------|------------|
| 1 | `#drill` | `drill` | guides/tecnicas/drill.md (778 linhas) | 🔴 Alta |
| 2 | `#feynman` | `feynman` | guides/tecnicas/feynman.md (721 linhas) | 🔴 Alta |
| 3 | `#directness` | `directness` | guides/tecnicas/directness.md (993 linhas) | 🔴 Alta |
| 4 | `#explain` | `explain-concept` | ✨ Criar do zero | 🟡 Média |
| 5 | `#quiz` | `quiz` | guides/tecnicas/quiz.md (170 linhas) | 🟡 Média |
| 6 | `#zombie` | `zombie-mode` | guides/tecnicas/procrastination-zombie.md (220 linhas) | 🟡 Média |
| 7 | `#debug` | `debug-socratic` | ✨ Criar do zero | 🟡 Média |
| 8 | `#scaffold` | `scaffold` | ✨ Criar do zero | 🟢 Baixa |
| 9 | `#feedback` | manter inline | — | — |
| 10 | `#diffuse` | manter inline | — | — |
| 11 | `#intuition` | manter inline | — | — |
| 12 | `#experiment` | manter inline | — | — |
| 13 | `#wrap-up` | manter inline | — | — |

### @meta (7 keywords → 2 skills)

| # | Keyword | Skill | Deriva de | Prioridade |
|---|---------|-------|-----------|------------|
| 1 | `#decompose-goal` | `decomposition` | guides/tecnicas/decomposition.md (559 linhas) | 🟡 Média |
| 2 | `#benchmark-test` | `benchmarking` | guides/tecnicas/benchmarking.md (521 linhas) | 🟢 Baixa |
| 3 | `#map-resources` | manter inline | — | — |
| 4 | `#create-weekly-plan` | manter inline | — | — |
| 5 | `#adjust-plan` | manter inline | — | — |
| 6 | `#update-plan` | manter inline | — | — |
| 7 | `#habit-stack` | manter inline | — | — |

---

## Fase 1: Skills Principais do @tutor

### Skill `drill`
- **Definição**: Prática deliberada — repetir procedimento 5-10x até automatizar
- **Quando usar**: Procedimentos (algoritmos, sintaxe, debug patterns)
- **Processo**: 5 passos (identificar → primeira vez COM consulta → 5-10x SEM consulta → analisar erros → documentar)
- **Cronometragem**: Obrigatório em todas as tentativas
- **Métricas**: Tempo <50% inicial, 0 erros em 3 tentativas seguidas
- **Handoff**: Erros recorrentes → flashcards; Não entendeu → `#feynman`

### Skill `feynman`
- **Definição**: Explicar conceito como para criança de 12 anos para validar compreensão
- **Quando usar**: Conceitos abstratos (ownership, Big O, recursão)
- **Processo**: 5 passos (escolher → escrever SEM consultar → identificar gaps → revisar → testar)
- **Analogias**: Obrigatório (mínimo 1)
- **"5 Por Quês"**: Técnica para aprofundar
- **Handoff**: Conceito validado → `#drill` se for procedimento; → `make review` para flashcards de fatos

### Skill `directness`
- **Definição**: Aprender através de projeto real, não tutoriais isolados
- **Método socrático**: NUNCA entregar código pronto — guia com perguntas
- **Quando usar**: Integrar múltiplos conceitos, mini-projetos semanais, capstones
- **Perguntas de início**: 3-5 questões de planejamento antes de começar
- **Mini-retrieval ao final**: 3 perguntas de consolidação
- **Handoff**: Projeto concluído → `#feedback` para revisar; → `#drill` para pontos fracos

---

## Fase 2: Skills Secundários do @tutor

### Skill `explain-concept`
- **Diferença de `#feynman`**: `#explain` = agente introduz; `#feynman` = usuário valida
- **Quando usar**: Usuário NUNCA viu o conceito
- **Processo**: Analogia → Exemplo mínimo → Aplicação → Sugerir `#feynman`
- **Handoff**: Entendeu? → `#feynman`; É procedimento? → `#drill`

### Skill `quiz`
- **Definição**: Retrieval practice — recuperar da memória sem consultar
- **Quando usar**: Warm-up de sessão, revisar ontem, testar retenção
- **Regra 3 segundos**: Pensar antes de responder, sem consultar
- **Score**: Contar acertos/erros
- **Handoff**: Errou? → `make review` adicionar flashcard

### Skill `zombie-mode`
- **Definição**: Two-Minute Rule (James Clear) — menor passo possível
- **Quando usar**: Procrastinação, resistência inicial
- **Processo**: Identificar micro-passo ridiculamente pequeno → Permitir parar → Frequentemente continua
- **Exemplo**: "Só abrir o VS Code (5 segundos)"
- **Handoff**: Começou? → `#quiz` ou `#explain` para aquecer

### Skill `debug-socratic`
- **Definição**: Guia socrático para encontrar e corrigir bugs
- **REGRA**: NUNCA dizer "o erro é X, faça Y" — SEMPRE fazer perguntas
- **Processo 4 etapas**: Entender (esperado vs real) → Isolar (menor reprodução) → Hipótese → Validar
- **Handoff**: Bug resolvido? → `#feynman` para consolidar entendimento

### Skill `scaffold`
- **Definição**: Criar estrutura/boilerplate para focar no conceito, não na infraestrutura
- **Regras**: ✅ Caminhos como comentários; ✅ Imports reais; ✅ TODOs precisos; ❌ Sem lógica de negócio
- **Quando usar**: Início de projeto, setup de tecnologia nova
- **Handoff**: Setup pronto → `#directness` para implementar lógica

---

## Fase 3: Skills do @meta

### Skill `decomposition`
- **Definição**: Dividir objetivos complexos em partes gerenciáveis e ordenadas
- **5 Níveis**: Módulo → Phase → Week → Day → Session
- **Framework 3D**: Conceitos (30%), Fatos (20%), Procedimentos (50%)
- **Output**: `learning-map.md`
- **Handoff**: Plano criado → `#map-resources`

### Skill `benchmarking`
- **Definição**: Criar testes de proficiência mensuráveis para avaliar domínio
- **Níveis**: Básico (90%+), Intermediário (80%+), Avançado (70%+)
- **Output**: Critérios objetivos com tempo-alvo por nível
- **Handoff**: → @tutor executa o benchmark

---

## Fase 4: Atualizar Agentes

### @tutor.md: 584 → ~200 linhas

Cada keyword passa a ter 3-5 linhas + referência à skill:

```markdown
### `#drill [CONCEITO]` - Prática Deliberada
**Quando usar**: Automatizar procedimentos (algoritmos, sintaxe, debug patterns)
**Skill**: Carrega guia completo automaticamente

### `#feynman [CONCEITO]` - Técnica de Explicação
**Quando usar**: Validar compreensão profunda de conceito
**Skill**: Carrega guia completo automaticamente
```

**Seções removidas**: Exemplos extensos inline → delegados para skills

### @meta.md: 458 → ~180 linhas

Apenas `#decompose-goal` e `#benchmark-test` delegam para skills.
Restante mantém inline (templates únicos do framework).

---

## Fase 5: Configuração no opencode.json

```json
{
  "permission": {
    "skill": {
      "*": "allow"
    }
  },
  "agent": {
    "tutor": {
      "permission": {
        "skill": { "*": "allow" }
      }
    },
    "meta": {
      "permission": {
        "skill": { "*": "allow" }
      }
    },
    "review": {
      "tools": {
        "skill": false
      }
    },
    "session": {
      "tools": {
        "skill": false
      }
    }
  }
}
```

**Nota**: @review e @session não precisam de skills — desabilitar reduz ruído no prompt.

---

## Checklist de Implementação

### Fase 1 — Criar estrutura
- [ ] Criar diretório `.opencode/skills/`
- [ ] Criar `_template-skill/SKILL.md`

### Fase 2 — Skills principais (@tutor)
- [ ] `drill/SKILL.md`
- [ ] `feynman/SKILL.md`
- [ ] `directness/SKILL.md`
- [ ] Testar carregamento das 3 skills

### Fase 3 — Skills secundários (@tutor)
- [ ] `explain-concept/SKILL.md`
- [ ] `quiz/SKILL.md`
- [ ] `zombie-mode/SKILL.md`
- [ ] `debug-socratic/SKILL.md`
- [ ] `scaffold/SKILL.md`

### Fase 4 — Skills do @meta
- [ ] `decomposition/SKILL.md`
- [ ] `benchmarking/SKILL.md`

### Fase 5 — Atualizar agentes
- [ ] `@tutor.md` → reduzir para ~200 linhas
- [ ] `@meta.md` → reduzir para ~180 linhas

### Fase 6 — Configuração
- [ ] `opencode.json` → adicionar `permission.skill`
- [ ] Desabilitar skills em @review e @session

### Fase 7 — Validação
- [ ] `@tutor #drill binary search` → skill carrega
- [ ] `@tutor #feynman closures` → skill carrega
- [ ] `@meta #decompose-goal ...` → skill carrega
- [ ] @review NÃO tem acesso a skills
- [ ] @tutor.md < 300 linhas após atualização

---

## Ordem de Implementação

| Fase | Tarefa | Tempo |
|------|--------|-------|
| 1 | Criar diretórios + template | 10 min |
| 2 | Skills drill + feynman + directness | 90 min |
| 3 | Testar as 3 skills principais | 15 min |
| 4 | Skills explain + quiz + zombie + debug + scaffold | 75 min |
| 5 | Skills decomposition + benchmarking | 50 min |
| 6 | Atualizar @tutor.md | 40 min |
| 7 | Atualizar @meta.md | 30 min |
| 8 | Configurar opencode.json | 10 min |
| 9 | Validação completa | 20 min |
| **Total** | | **~6h** |

---

## Benefícios Esperados

| Benefício | Antes | Depois |
|-----------|-------|--------|
| @tutor linhas permanentes | 584 | ~200 |
| @meta linhas permanentes | 458 | ~180 |
| Manutenção de `#drill` | 2 arquivos | 1 arquivo |
| Adicionar nova técnica | ~50 linhas no agente | Criar SKILL.md |
| guides/ conectados a agentes | ❌ | ✅ automático |
| Risco de dessincronização | Alto | Baixo |

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Skill não carrega | Média | Testar manualmente após criar cada skill |
| Tokens aumentam (muitas skills) | Média | Agente carrega 1 skill por vez |
| Manutenção duplicada skill + guide | Alta | Skill = fonte de verdade; Guide = documentação humana |
| @review acessa skills indesejadas | Baixa | `tools: { skill: false }` em @review e @session |

---

## Critérios de Sucesso

| Critério | Métrica |
|----------|---------|
| Skills carregam | `skill({ name: "drill" })` funciona via @tutor |
| Tokens reduzidos | @tutor.md < 300 linhas |
| Guias conectados | Skill deriva e referencia guide existente |
| Manutenção centralizada | Mudar drill = 1 arquivo |
| Sem quebra | #drill, #feynman, #directness funcionam igual |

---

*Plano gerado após análise da documentação OpenCode Skills (https://opencode.ai/docs/skills/) e revisão do framework*
