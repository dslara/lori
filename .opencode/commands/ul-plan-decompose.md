---
description: Decompor objetivo complexo em plano acionável (/ul-plan-decompose)
agent: meta
model: opencode-go/glm-5
---

Argumento recebido: $ARGUMENTS (objetivo a decompor)

## Uso
/ul-plan-decompose [objetivo]

## Descrição

Este command é um **wrapper** que invoca a skill `decomposition` para quebrar objetivos grandes em planos acionáveis. A skill aplica o **Framework 3D** (Deconstruct-Design-Define) para criar hierarquias de aprendizado de 5 níveis.

## Processo

### Passo 1: Validar Entrada

Se não houver `[objetivo]`, perguntar:
```
"Qual objetivo você quer decompor?

Exemplos:
• 'Aprender Python para backend'
• 'Dominar algoritmos de grafos'
• 'Construir um compilador'
• 'Entender sistemas distribuídos'"
```

### Passo 2: Contextualização

Coletar informações para a skill:
1. **Nível atual**: O usuário é iniciante, intermediário ou avançado?
2. **Prazo**: Qual deadline? (1 mês, 6 meses, 1 ano?)
3. **Disponibilidade**: Horas por semana?
4. **Pré-requisitos**: Já sabe alguma coisa sobre o tema?
5. **Motivação**: Por que quer aprender isso? (trabalho, projeto pessoal, curiosidade)

### Passo 3: Invocar Skill `decomposition`

Delegar para a skill com os parâmetros coletados.

A skill `decomposition` fará:
- **Nível 1 - Domínio**: Área grande (ex: "Backend")
- **Nível 2 - Meta**: Objetivo específico (ex: "API REST em Python")
- **Nível 3 - Habilidades**: Componentes necessárias (ex: HTTP, Flask, SQL)
- **Nível 4 - Conceitos**: Tópicos de cada habilidade (ex: Routing, ORM)
- **Nível 5 - Entregas**: Produtos verificáveis (ex: "API de TODOs")

**Framework 3D aplicado:**
1. **Deconstruct**: Quebrar em partes menores
2. **Design**: Organizar dependências e sequência
3. **Define**: Definir entregas mensuráveis

### Passo 4: Gerar Artefatos

A skill cria automaticamente:
- `learning-map.md` — Mapa visual de 5 níveis
- `week-01.md` até `week-N.md` — Plano semanal
- Checkpoints e milestones

### Passo 5: Apresentar Resumo

```
✅ Objetivo Decomposto!

🎯 [Objetivo Principal]

📊 Hierarquia criada:
• Domínio: [X]
• Meta: [X]
• Habilidades: [N] identificadas
• Conceitos: [N] mapeados
• Entregas: [N] definidas

📁 Arquivos gerados:
• projects/[modulo]/meta/learning-map.md
• projects/[modulo]/meta/week-01.md
[...]

⏱️ Estimativa total: [X] semanas ([Y] horas)
📅 Cronograma sugerido: [data início] → [data fim]

🚀 Próximo passo: /ul-study-start para começar!
```

## Exemplo de Interação

```
Usuário: /ul-plan-decompose "Aprender Go para backend"

Sistema:
"Ótimo objetivo! Para decompor adequadamente:

1. Qual seu nível atual em Go?
   a) Nunca programei
   b) Sei outras linguagens
   c) Já programei um pouco em Go

2. Qual seu prazo?
   a) 1 mês (intensivo)
   b) 3 meses (ritmo moderado)
   c) 6+ meses (paralelo com trabalho)

3. Disponibilidade semanal?
   a) 5-10h
   b) 10-20h
   c) 20h+"

Usuário: "Sei Python/Java, 3 meses, 10h/semana"

Sistema:
"Perfeito! Invocando decomposição...

[Skill decomposition assume]

📋 Analisando objetivo...
📋 Aplicando Framework 3D...
📋 Criando hierarquia de 5 níveis...
📋 Gerando arquivos...

✅ Decomposição Completa!

🎯 Aprender Go para Backend

📊 Hierarquia:
• Domínio: Backend Development
• Meta: APIs REST performantes em Go
• Habilidades:
  1. Fundamentos Go (2 semanas)
  2. HTTP e APIs (2 semanas)
  3. Concorrência (3 semanas)
  4. Banco de dados (2 semanas)
  5. Deploy e DevOps (1 semana)
• Conceitos: 23 tópicos mapeados
• Entregas: 5 projetos práticos

📁 Arquivos criados em projects/M5-go-backend/meta/:
✓ learning-map.md
✓ week-01.md a week-10.md
✓ phase-1-overview.md a phase-3-overview.md

⏱️ Total: 10 semanas (~100h)
📅 Março/2026 → Maio/2026

🚀 Começar agora? /ul-study-start"
```

## Framework 3D

A skill implementa o Framework 3D de Metalearning:

### 1. Deconstruct (Decompor)
Quebrar o objetivo em componentes menores
- O que precisa saber?
- Quais são os sub-tópicos?
- Como se relacionam?

### 2. Design (Projetar)
Organizar a ordem de aprendizado
- Dependências entre tópicos
- Sequência lógica
- Agrupamento em fases

### 3. Define (Definir)
Tornar mensurável
- Entregas concretas
- Checkpoints verificáveis
- Critérios de conclusão

## Quando Usar

✅ **USE para:**
- Começar novo módulo/tema grande
- Objetivos de 1+ mês
- Quando não sabe por onde começar
- Para criar roadmap estruturado

❌ **NÃO USE para:**
- Tarefas de 1 sessão → `/ul-study-start`
- Ajustar plano existente → `/ul-plan-weekly`
- Revisar progresso → `/ul-study-plan`

## Integrações

**Skill invocada:**
- `decomposition` — Framework 3D e geração de hierarquias

**Tools utilizadas:**
- `data.createInteraction` — Registra decomposição
- `context.getFullContext` — Contexto atual

**Commands relacionados:**
- `/ul-study-start` — Começar a executar o plano
- `/ul-plan-weekly` — Criar detalhes da semana
- `/ul-retro-weekly` — Ajustar plano se necessário
- `/ul-plan-benchmark` — Definir critérios de conclusão

## Handoff

- Plano criado → `/ul-study-start` para começar
- Quer ajustar cronograma → `/ul-plan-weekly`
- Fim de semana → `/ul-retro-weekly` para avaliar

---

*Command: /ul-plan-decompose — Wrapper para skill decomposition (Framework 3D)*
