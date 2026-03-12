---
description: Criar novo módulo de estudo (/ul-module-create)
agent: meta
model: opencode-go/glm-5
---

## Uso
/ul-module-create [nome]

## Descrição
Cria novo módulo de estudo com estrutura completa de diretórios e arquivos iniciais.

## Processo

### Passo 1: Validar Nome

- Converter para kebab-case automaticamente
- Verificar comprimento (3-50 caracteres)
- Validar caracteres (a-z, 0-9, hífens)

### Passo 2: Criar Estrutura

Gerar ID único (M + timestamp) e criar diretórios:

```
projects/
  M03101430-python-backend/
    meta/            # Planejamento e retrospectivas
    projects/        # Projetos práticos
    knowledge/       # Notas e recursos
    README.md        # Documentação inicial
```

### Passo 3: Atualizar Sistema

- Desativar outros módulos em `modules.csv`
- Adicionar novo módulo como ativo
- Criar README.md com template

### Passo 4: Oferecer Próximos Passos

Sugerir:
- Decompor objetivo: `/ul-plan-decompose [objetivo]`
- Criar plano semanal: `/ul-plan-weekly 1`

## Parâmetros

- `nome`: Nome do módulo em kebab-case (ex: python-backend, rust-async, algorithms)

## Output

```
✓ Módulo criado: M03101430-python-backend
✓ Estrutura: meta/, projects/, knowledge/
✓ README.md criado
✓ Módulo ativo

Próximos passos:
  /ul-plan-decompose "Aprender Python para backend"
  /ul-plan-weekly 1
```

## Exemplos

### Exemplo 1: Criar módulo simples

```
Usuário: /ul-module-create python-basics

Sistema:
"🆕 Criando novo módulo...

✓ Nome validado: python-basics
✓ ID gerado: M03101430
✓ Estrutura criada: projects/M03101430-python-basics/
✓ README.md inicial criado
✓ Módulo marcado como ativo

📦 Módulo: M03101430-python-basics

Próximos passos:
  1. Definir objetivos: /ul-plan-decompose "Dominar Python básico"
  2. Criar plano semanal: /ul-plan-weekly 1"
```

### Exemplo 2: Nome com espaços (convertido automaticamente)

```
Usuário: /ul-module-create Machine Learning

Sistema:
"🆕 Criando novo módulo...

✓ Nome convertido: machine-learning
✓ ID gerado: M03101545
✓ Estrutura criada: projects/M03101545-machine-learning/

📦 Módulo: M03101545-machine-learning"
```

## Validações

- Nome deve ter 3-50 caracteres
- Caracteres permitidos: a-z, 0-9, hífen
- ID único baseado em timestamp
- Módulo anterior é desativado automaticamente

## Integração com Tools

Este command invoca:
- `data.createModule` - Criar estrutura e atualizar CSV

## Ver Também

- `/ul-module-switch` - Alternar entre módulos
- `/ul-module-archive` - Arquivar módulo finalizado
- `/ul-plan-decompose` - Planejar objetivos do módulo
