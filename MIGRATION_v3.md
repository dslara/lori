# Guia de Migração v2.0 → v3.0

## O que Mudou?

### Resumo da Mudança

O Ultralearning System v3.0 migrou completamente de **keywords para commands**, unificando a interface em uma única forma de interação.

**Antes (v2.0):**
- Keywords: `@tutor #start`, `@tutor #drill`, `@meta #retro`, etc.
- Commands: `/status`, `/analytics` (apenas 4)
- Disperso entre @tutor, @meta e commands

**Depois (v3.0):**
- **22 Commands** unificados: `/ul-*`
- Interface única via `/` no TUI
- Sem keywords — tudo é command

---

## Mapeamento Completo: Antigo → Novo

### Sessão de Estudo

| Antigo (v2.0) | Novo (v3.0) | Notas |
|--------------|-------------|-------|
| `@tutor #start` | `/ul-study-start` | Interface unificada |
| `@tutor #end` | `/ul-study-end` | Interface unificada |
| `@tutor #plan` | `/ul-study-plan` | Interface unificada |

### Prática

| Antigo (v2.0) | Novo (v3.0) | Notas |
|--------------|-------------|-------|
| `@tutor #drill [conceito]` | `/ul-practice-drill [conceito]` | Command direto |
| `@tutor #feynman [conceito]` | `/ul-practice-feynman [conceito]` | Command direto |
| `@tutor #quiz N [tópico]` | `/ul-practice-quiz N [tópico]` | Command direto |
| `@tutor #directness [desafio]` | `/ul-practice-project [desafio]` | Nome mais claro |

### Aprendizado

| Antigo (v2.0) | Novo (v3.0) | Notas |
|--------------|-------------|-------|
| `@tutor #explain [conceito]` | `/ul-learn-explain [conceito]` | Command direto |
| `@tutor #debug` | `/ul-learn-debug` | Command direto |

### Produtividade

| Antigo (v2.0) | Novo (v3.0) | Notas |
|--------------|-------------|-------|
| `@tutor #zombie` | `/ul-productivity-start` | Nome mais descritivo |
| `@tutor #diffuse` | `/ul-productivity-break` | Nome mais descritivo |

### Setup

| Antigo (v2.0) | Novo (v3.0) | Notas |
|--------------|-------------|-------|
| `@tutor #scaffold [projeto]` | `/ul-setup-scaffold [projeto]` | Command direto |

### Memória

| Antigo (v2.0) | Novo (v3.0) | Notas |
|--------------|-------------|-------|
| `@tutor #srs-generator` | `/ul-memory-create` | Nome mais claro |
| `@tutor #srs-generator review` | `/ul-memory-review` | Command separado |

### Planejamento

| Antigo (v2.0) | Novo (v3.0) | Notas |
|--------------|-------------|-------|
| `@meta #decompose-goal [obj]` | `/ul-plan-decompose [obj]` | Command direto |
| `@meta #retro` | `/ul-plan-retro` | Command direto |
| `@meta #create-weekly-plan semana N` | `/ul-plan-weekly N` | Simplificado |
| `@meta #benchmark-test` | `/ul-plan-benchmark [skill]` | Agora requer skill |

### Dados

| Antigo (v2.0) | Novo (v3.0) | Notas |
|--------------|-------------|-------|
| `/status` | `/ul-data-status` | Prefixo `ul-data` |
| `/analytics` | `/ul-data-analytics` | Prefixo `ul-data` |
| `/dashboard` | `/ul-data-dashboard` | Prefixo `ul-data` |
| `/data init` | `/ul-data-manage init` | Prefixo `ul-data` |
| `/data reset` | `/ul-data-manage reset` | Prefixo `ul-data` |

---

## Arquitetura Simplificada

### Antes (v2.0)

```
Usuário → @tutor #keyword → Skill → (talvez) Tool
Usuário → @meta #keyword → Skill
Usuário → /command → Tool
```

- 14 skills carregadas on-demand
- 4 commands
- 35+ keywords
- Interface dispersa

### Depois (v3.0)

```
Usuário → /ul-* command → (lógica inline ou skill)
```

- **22 commands** unificados
- **5 skills** mantidas (apenas complexas)
- **0 keywords**
- Interface única via `/`

---

## Skills Eliminadas

As seguintes skills foram eliminadas e substituídas por commands:

1. **drill** → `/ul-practice-drill`
2. **feynman** → `/ul-practice-feynman`
3. **quiz** → `/ul-practice-quiz`
4. **explain-concept** → `/ul-learn-explain`
5. **zombie-mode** → `/ul-productivity-start`
6. **scaffold** → `/ul-setup-scaffold`
7. **retrospective** → `/ul-plan-retro`
8. **benchmarking** → `/ul-plan-benchmark`
9. **tutor-log** → `logTutorInteraction()` built-in nas tools

### Skills Mantidas (5)

- **directness** — Projetos complexos (usada por `/ul-practice-project`)
- **debug-socratic** — Debug socrático (usada por `/ul-learn-debug`)
- **srs-generator** — Algoritmo SM-2 (usada por `/ul-memory-*`)
- **decomposition** — Framework 3D (usada por `/ul-plan-decompose`)
- **session** — Helpers reduzidos (usada por `/ul-study-*`)

---

## Benefícios da Migração

### Para o Usuário

1. **Interface unificada**: Tudo via `/` no TUI
2. **Descoberta fácil**: Tab completion mostra todos os commands
3. **Menos complexidade**: Não precisa saber quando usar @tutor vs @meta
4. **Documentação clara**: Cada command é autoexplicativo

### Para Manutenção

1. **Menos código**: -64% nas skills (14 → 5)
2. **Centralizado**: Commands em único local
3. **Testável**: Commands isolados
4. **Escalável**: Fácil adicionar novos commands

---

## Guia de Transição

### Dia 1: Primeiros Passos

1. Abra o TUI do OpenCode: `opencode`
2. Digite `/` para ver todos os commands
3. Use `/ul-study-start` ao invés de `@tutor #start`
4. Note que todos os commands começam com `/ul-`

### Semana 1: Adaptação

- **Old habit**: `@tutor #dril...` (digita parcial, tab)
- **New habit**: `/ul-prac...` (digita parcial, tab)

Os commands têm autocomplete — use!

### Migração de Scripts/Aliases

Se tinha aliases ou scripts com keywords antigas:

```bash
# Antes
alias start='opencode run --agent @tutor "#start"'

# Depois
alias start='opencode run "/ul-study-start"'
```

### Documentos Pessoais

Atualize seus planos pessoais:

```markdown
# Antes
Semana 1:
- Seg: @tutor #drill recursão
- Ter: @tutor #feynman closures

# Depois
Semana 1:
- Seg: /ul-practice-drill recursão
- Ter: /ul-practice-feynman closures
```

---

## FAQ

### Meus dados serão perdidos?

**Não.** Os CSVs são 100% compatíveis. Apenas a interface mudou.

### Os agents @tutor e @meta ainda existem?

**Sim**, mas agora são usados internamente pelos commands. Você não precisa mais chamá-los diretamente.

### Posso usar ainda as keywords antigas?

**Não.** As keywords foram completamente removidas. Use os commands `/ul-*`.

### O que aconteceu com inline keywords como `#intuition`?

**Mantidas** como complementares durante sessões. Mas o fluxo principal agora é via commands.

### Por que tantos commands? Não é complexo demais?

São 22 commands organizados por categoria:
- `ul-data-*`: 4 commands de dados
- `ul-study-*`: 3 commands de sessão
- `ul-practice-*`: 4 commands de prática
- `ul-learn-*`: 2 commands de aprendizado
- `ul-productivity-*`: 2 commands de produtividade
- `ul-setup-*`: 1 command de setup
- `ul-memory-*`: 2 commands de memória
- `ul-plan-*`: 4 commands de planejamento

Na prática você usará 5-6 commands regularmente.

### Quais são os commands mais usados?

1. `/ul-study-start` — Início de toda sessão
2. `/ul-practice-drill` — Prática diária
3. `/ul-practice-feynman` — Validar compreensão
4. `/ul-study-end` — Fim de toda sessão
5. `/ul-data-status` — Verificar progresso
6. `/ul-memory-review` — Revisar SRS

---

## Troubleshooting

### "Command não encontrado"

Verifique:
1. Está usando `/` no início? ✓
2. Digitou `ul-` após a barra? ✓
3. Nome do command está correto? Verifique lista acima

### "Sistema não responde como antes"

- Commands são **stateless** — não mantêm contexto entre chamadas
- Use `/ul-study-start` e `/ul-study-end` para marcar sessões
- Dados são salvos automaticamente nas tools

### "Missão a keyword antiga"

Crie aliases no seu shell:

```bash
# ~/.bashrc ou ~/.zshrc
alias start='/ul-study-start'
alias drill='/ul-practice-drill'
alias end='/ul-study-end'
```

---

## Feedback

Encontrou problemas na migração? Tem sugestões?

- Abra uma issue no repositório
- Ou mencione no seu próximo estudo

---

*Guia de Migração v3.0 — Da era das keywords para a era dos commands*
