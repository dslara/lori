---
description: Criar teste de proficiência mensurável
agent: meta
---

$ARGUMENTS (skill a ser testada, opcional)

## Descrição

Cria testes de proficiência com 3 níveis (iniciante, intermediário, avançado) para validar domínio de uma skill. Cada nível tem 3 tarefas com critérios de sucesso claros.

## Processo

### 1. Contexto OpenViking (pré-execução)

```
context-hybrid.getCurrentModule
memsearch({ query: "benchmarks anteriores", target_uri: "viking://resources/ultralearning/", mode: "auto" })
resource.find({ query: "benchmark", target: "viking://resources/ultralearning/projects/{id}/benchmarks/" })
```

### 2. Execução Principal

1. **Identificar skill** — Se não forneceu skill, perguntar qual testar.
2. **Definir 3 níveis** — Nível 1 (iniciante): conceitos básicos, ~30min. Nível 2 (intermediário): aplicação prática, ~1h. Nível 3 (avançado): edge cases, ~2h+.
3. **Criar tarefas mensuráveis** — 3 tarefas por nível. Para cada: input, output esperado, restrições e critérios de sucesso.
4. **Definir rubrica** — Nível 1 = 30 pts, Nível 2 = 40 pts, Nível 3 = 30 pts (total 100). Classificação: 0-39 Iniciante, 40-69 Intermediário, 70-89 Avançado, 90-100 Especialista.
5. **Gerar arquivo** — Criar `benchmark-[skill].md` com: descrição, 3 níveis com tarefas, rubrica e instruções de uso.
6. **Apresentar resumo** — Quantidade de tarefas, tempo estimado por nível, rubrica definida.

### 3. Persistência (pós-execução)

```
resource.mkdir({ uri: "viking://resources/ultralearning/projects/{id}/benchmarks/" })
resource.write({
  uri: "viking://resources/ultralearning/projects/{id}/benchmarks/benchmark-[skill].md",
  content: "<conteúdo completo do benchmark>",
  mode: "replace"
})
resource.link({
  from: "viking://resources/ultralearning/projects/{id}/benchmarks/benchmark-[skill].md",
  to: "viking://resources/ultralearning/projects/{id}/",
  reason: "benchmark de proficiência do projeto"
})
memcommit({ wait: false })
```

## Argumento

- `skill`: Skill a ser testada (opcional — será perguntada se não fornecida)

## Handoff

- Baseline do módulo → `/ul-study-drill` para praticar antes
- Resultados ruins → `/ul-plan-adjust` para ajustar plano
- Fim de módulo → `/ul-plan-retro` para discutir resultados