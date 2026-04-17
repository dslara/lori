---
description: Aprender fazendo projetos reais
agent: tutor
---

$ARGUMENTS (descrição do projeto, opcional)

## Descrição

Aprender através de projetos reais com guia socrático. Delega para a skill `directness` que implementa o processo de planejamento, micro-passos e validação.

## Processo

1. **Carregar contexto** — Invocar `context-hybrid.getProjectInfo` para obter módulo atual e projetos existentes
2. **Carregar skill** — Carregar skill `directness` e seguir processo definido nela
3. **Executar projeto** — A skill conduzirá: perguntas de planejamento → micro-passos → guia socrático → validação → mini-retrieval
4. **Persistir** — Ao finalizar, persistir progresso

### Persistência

```
memcommit({ wait: true })
```

## Argumento

- `descrição`: Descrição do projeto (opcional — será perguntado se não fornecido)

## Handoff

- Projeto concluído → `/ul-study-end` para salvar sessão
- Skill fraca identificada → `/ul-study-drill`
- Precisa scaffold → `/ul-setup-scaffold`