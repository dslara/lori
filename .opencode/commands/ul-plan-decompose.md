---
description: Decompor objetivo complexo em plano acionável
agent: meta
model: opencode-go/glm-5
---

$ARGUMENTS (objetivo a decompor, opcional)

## Descrição

Wrapper que invoca a skill `decomposition` para quebrar objetivos grandes em planos acionáveis usando o Framework 3D (Deconstruct-Design-Define) com hierarquia de 5 níveis.

## Processo

1. **Validar entrada** — Se não houver objetivo, perguntar qual objetivo decompor.
2. **Contextualização** — Coletar: nível atual, prazo, disponibilidade semanal, pré-requisitos e motivação.
3. **Invocar skill** — Carregar skill `decomposition`. A skill gera hierarquia de 5 níveis: (1) Domínio, (2) Meta, (3) Habilidades, (4) Conceitos, (5) Entregas. Framework 3D: Deconstruct → Design → Define.
4. **Gerar artefatos** — A skill cria `learning-map.md`, `week-01.md` até `week-N.md` e checkpoints/milestones.
5. **Apresentar resumo** — Hierarquia completa, arquivos gerados, estimativa total de semanas/horas e cronograma sugerido.

## Argumento

- `objetivo`: Objetivo a decompor (opcional — será perguntado se não fornecido)

## Handoff

- Plano criado → `/ul-study-start` para começar
- Ajustar cronograma → `/ul-plan-weekly`
- Fim de semana → `/ul-plan-retro` para avaliar
- Definir critérios de conclusão → `/ul-plan-benchmark`