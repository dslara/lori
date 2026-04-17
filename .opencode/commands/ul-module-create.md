---
description: Criar novo módulo de estudo
agent: meta
---

$1 (nome do módulo)

## Descrição

Cria novo módulo de estudo com estrutura completa de diretórios e arquivos iniciais, tanto no filesystem local quanto no OpenViking.

## Processo

1. **Validar entrada** — Se `$1` vazio, perguntar nome do módulo.
2. **Criar módulo local** — Invocar `data.createModule` com `moduleName: $1`. A tool valida nome (3-50 chars, kebab-case), gera ID, cria diretórios (`meta/`, `projects/`, `knowledge/`), escreve `README.md`, marca como ativo no CSV.
3. **Criar estrutura no OpenViking** — Invocar as seguintes operações para criar a estrutura de recursos do projeto:
   ```
   resource.mkdir(uri: "viking://resources/ultralearning/projects/{id}/")
   resource.mkdir(uri: "viking://resources/ultralearning/projects/{id}/meta/")
   resource.mkdir(uri: "viking://resources/ultralearning/projects/{id}/plans/")
   resource.mkdir(uri: "viking://resources/ultralearning/projects/{id}/benchmarks/")
   resource.mkdir(uri: "viking://resources/ultralearning/projects/{id}/maps/")
   resource.mkdir(uri: "viking://resources/ultralearning/projects/{id}/notes/")
   resource.mkdir(uri: "viking://resources/ultralearning/projects/{id}/knowledge/")
   resource.mkdir(uri: "viking://resources/ultralearning/projects/{id}/resources/")
   resource.mkdir(uri: "viking://resources/ultralearning/projects/{id}/retros/")
   ```
4. **Escrever descrição do projeto** — Invocar `resource.write` para criar o arquivo de descrição:
   ```
   resource.write(
     uri: "viking://resources/ultralearning/projects/{id}/meta/project.md",
     content: "# {nome}\n\n> Módulo criado em {data}\n\n## Objetivo\n\n## Status\n- Prioridade: \n- Progresso: 0%",
     mode: "replace"
   )
   ```
5. **Apresentar resultado** — Módulo ID, nome, caminho local, URI no OpenViking. Confirmar módulo ativo.
6. **Oferecer próximos passos** — Sugerir decomposição e plano semanal.

## Argumento

- `$1`: Nome do módulo em kebab-case (ex: python-backend, rust-async, algorithms). Espaços são convertidos automaticamente.

## URIs do Projeto no OpenViking

```
viking://resources/ultralearning/projects/{id}/
├── meta/project.md          ← Descrição e objetivos
├── plans/                   ← Planos semanais
├── benchmarks/              ← Benchmarks de proficiência
├── maps/                    ← Learning maps
├── notes/                   ← Notas de sessão
├── knowledge/               ← Conhecimento acumulado
├── resources/               ← Recursos de estudo
└── retros/                  ← Retrospectivas
```

## Handoff

- Objetivo definido → `/ul-plan-decompose` para decompor
- Planejar semana → `/ul-plan-weekly 1`
- Mapear recursos → `/ul-plan-resources`
- Alternar módulo → `/ul-module-switch`