---
description: Criar estrutura/boilerplate de projeto
agent: tutor
model: opencode-go/kimi-k2.5
---

$ARGUMENTS (descrição do projeto, opcional)

## Descrição

Cria estrutura base de projeto com TODOs e placeholders. Não entrega lógica de negócio, apenas estrutura para o usuário preencher.

## Processo

1. **Coletar informações** — Se não houver argumento, perguntar: linguagem, tipo (API/CLI/library/web), funcionalidades principais, dependências
2. **Definir estrutura** — Baseado no tipo de projeto, criar árvore de diretórios padrão com arquivos TODO.md em cada pacote
3. **Gerar boilerplate** — Criar arquivos com esqueletos vazios e TODOs comentados (entry point, config, Makefile, README, .gitignore). Nenhuma lógica de negócio
4. **Gerar comandos de setup** — Criar comandos para inicializar o projeto (ex: `go mod init`, `npm init`, `git init`)
5. **Apresentar resultado** — Listar arquivos criados, lembrar que é só estrutura, sugerir próximos passos

## Argumento

- `projeto`: Descrição do projeto (opcional — será perguntado se não fornecido). Ex: "API REST em Go", "CLI de tarefas em Python"

## Handoff

- Scaffold criado → `/ul-study-project` para implementar funcionalidades
- Não entende a estrutura → `/ul-study-learn`
- Pronto para codar → `/ul-study-start`