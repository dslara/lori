---
description: Aprender fazendo projetos reais (/ul-study-project)
agent: tutor
model: opencode-go/kimi-k2.5
---

Argumentos recebidos: $ARGUMENTS (descrição do projeto)

## Uso
/ul-study-project [descrição do projeto]

## Descrição

Aprender através de projetos reais com guia socrático. Delega para a skill `directness` que implementa o processo de planejamento, micro-passos e validação.

## Processo

1. Carregar contexto: `context-hybrid.getProjectInfo` para obter módulo atual e projetos existentes
2. Carregar skill `directness` e seguir processo definido nela
3. A skill conduzirá: perguntas de planejamento → micro-passos → guia socrático → validação → mini-retrieval
4. Ao finalizar, usar `memcommit` com `wait: true` para persistir progresso

## Argumento

- `$ARGUMENTS` vazio → perguntar qual projeto deseja construir
- `$ARGUMENTS` preenchido → usar como descrição do projeto

## Quando Usar

- Integrar múltiplos conceitos
- Mini-projetos semanais
- Resolver problema real
- Preparar para trabalho

## Integrações

- Skill: `directness` — processo de aprendizado por projetos
- Tool: `context-hybrid.getProjectInfo` — contexto do projeto
- `/ul-study-end` — salvar sessão ao concluir
- `/ul-study-drill` — praticar skill fraca identificada