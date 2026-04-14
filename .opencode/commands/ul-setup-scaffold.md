---
description: Criar estrutura/boilerplate de projeto (/ul-setup-scaffold)
agent: tutor
model: opencode-go/kimi-k2.5
---

Argumento recebido: $ARGUMENTS (descrição do projeto)

## Uso
/ul-setup-scaffold [projeto]

## Descrição

Cria estrutura base de projeto com TODOs e placeholders. Não entrega lógica de negócio, apenas estrutura para o usuário preencher.

## Processo

### Passo 1: Entender o Projeto (3 min)

Se não houver `[projeto]`, perguntar:
```
"Qual projeto quer criar?

Exemplos:
• 'API REST em Go'
• 'CLI de tarefas em Python'
• 'Jogo da velha em Rust'
• 'Parser de JSON'

Descreva em 1 frase: __________"
```

Coletar informações:
1. **Linguagem**: Go, Python, Rust, etc.
2. **Tipo**: API, CLI, Library, Web
3. **Funcionalidades principais**: O que deve fazer?
4. **Dependências**: Banco de dados? Autenticação? etc.

### Passo 2: Definir Estrutura (2 min)

Baseado no tipo, criar estrutura padrão:

**Exemplo - API REST em Go:**
```
myapi/
├── cmd/
│   └── server/
│       └── main.go          # Entry point
├── internal/
│   ├── handlers/            # HTTP handlers
│   │   └── TODO.md
│   ├── models/              # Data models
│   │   └── TODO.md
│   ├── repository/          # Database layer
│   │   └── TODO.md
│   └── service/             # Business logic
│       └── TODO.md
├── pkg/
│   └── utils/               # Shared utilities
│       └── TODO.md
├── api/
│   └── routes.go            # Route definitions
├── config/
│   └── config.go            # Configuration
├── migrations/              # DB migrations
├── tests/
│   └── integration/         # Integration tests
├── Makefile
├── go.mod
├── README.md
└── .gitignore
```

### Passo 3: Gerar Boilerplate (5 min)

Criar arquivos com TODOs claros:

**main.go:**
```go
package main

// TODO: Initialize configuration
// TODO: Setup database connection
// TODO: Register routes
// TODO: Start HTTP server

func main() {
    // TODO: Implement main
}
```

**handlers/TODO.md:**
```markdown
# Handlers TODO

## User Handler
- [ ] POST /users - Create user
- [ ] GET /users/:id - Get user
- [ ] PUT /users/:id - Update user
- [ ] DELETE /users/:id - Delete user

## Auth Handler
- [ ] POST /login - Authenticate
- [ ] POST /logout - Logout
- [ ] POST /refresh - Refresh token
```

**models/TODO.md:**
```markdown
# Models TODO

## User Model
- [ ] ID (uuid)
- [ ] Email (string)
- [ ] Password (hashed)
- [ ] CreatedAt (timestamp)
- [ ] UpdatedAt (timestamp)
```

### Passo 4: Comandos de Setup

Gerar comandos para inicializar:
```bash
# Inicializar Go module
cd myapi && go mod init github.com/user/myapi

# Instalar dependências comuns
go get -u github.com/gin-gonic/gin
go get -u github.com/jmoiron/sqlx
go get -u github.com/golang-jwt/jwt

# Criar primeiro commit
git init
git add .
git commit -m "Initial scaffold"
```

### Passo 5: Apresentar e Próximos Passos

```
✅ Scaffold Criado!

📁 Estrutura gerada em: [projeto]/

📋 Arquivos criados:
✓ cmd/server/main.go
✓ internal/handlers/TODO.md
✓ internal/models/TODO.md
✓ internal/repository/TODO.md
✓ internal/service/TODO.md
✓ api/routes.go
✓ config/config.go
✓ Makefile
✓ go.mod
✓ README.md
✓ .gitignore

📝 Cada TODO.md contém:
• Lista de tarefas
• Assinaturas de funções
• Dependências necessárias

⚠️ IMPORTANTE:
Este scaffold NÃO tem lógica de negócio.
É apenas estrutura para você preencher!

🎯 Próximos passos:
1. cd [projeto] && go mod init ...
2. Escolher primeira tarefa do TODO.md
3. /ul-study-project para implementar

Ou quer começar implementando agora?
→ /ul-study-project '[descrição]'
```

## Exemplo Completo

```
Usuário: /ul-setup-scaffold "API de tarefas em Go"

Sistema:
"Vou criar a estrutura base!

Primeiro, algumas perguntas:

1. Funcionalidades principais?
   [Usuário: CRUD de tarefas, autenticação simples]

2. Banco de dados?
   [Usuário: PostgreSQL]

3. Framework HTTP?
   [Usuário: Gin]

✅ Criando estrutura...

📁 taskapi/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── handlers/
│   │   ├── task_handler.go (TODO)
│   │   ├── auth_handler.go (TODO)
│   │   └── TODO.md
│   ├── models/
│   │   ├── task.go (TODO)
│   │   ├── user.go (TODO)
│   │   └── TODO.md
│   ├── repository/
│   │   ├── task_repo.go (TODO)
│   │   ├── user_repo.go (TODO)
│   │   └── TODO.md
│   ├── service/
│   │   ├── task_service.go (TODO)
│   │   ├── auth_service.go (TODO)
│   │   └── TODO.md
│   └── middleware/
│       ├── auth.go (TODO)
│       └── TODO.md
├── api/
│   └── routes.go (TODO)
├── config/
│   └── database.go (TODO)
├── migrations/
│   └── 001_initial.sql (TODO)
├── tests/
│   └── task_test.go (TODO)
├── Makefile
├── go.mod
├── README.md
└── .gitignore

📋 Exemplo de TODO.md:

internal/handlers/TODO.md:
```markdown
# Task Handler

## Endpoints
- [ ] GET /tasks - List tasks
  ```go
  func ListTasks(c *gin.Context) {
      // TODO: Get user from context
      // TODO: Call service.ListTasks(userID)
      // TODO: Return JSON response
  }
  ```

- [ ] POST /tasks - Create task
  ```go
  func CreateTask(c *gin.Context) {
      // TODO: Bind JSON to Task model
      // TODO: Validate input
      // TODO: Call service.CreateTask(task)
      // TODO: Return 201 Created
  }
  ```

## Dependencies
- github.com/gin-gonic/gin
- internal/service
- internal/models
```

⚠️ Lembrete: Isso é só estrutura!
Nenhuma lógica implementada ainda.

🎯 Setup inicial:
```bash
cd taskapi
go mod init github.com/user/taskapi
go get -u github.com/gin-gonic/gin
go get -u github.com/jmoiron/sqlx
go get -u github.com/lib/pq
git init
```

Quer começar implementando?
→ /ul-study-project 'Implementar CRUD de tarefas'
```

## Quando Usar

✅ **USE para:**
- Começar projeto novo
- Padronizar estrutura
- Não saber por onde começar
- Garantir boas práticas de organização

❌ **NÃO USE para:**
- Projetos pequenos (< 3 arquivos)
- Scripts simples
- Quando já tem estrutura definida

## Integrações

**Commands relacionados:**
- `/ul-study-project` — Implementar funcionalidades
- `/ul-study-learn` — Se não entende estrutura
- `/ul-study-start` — Começar sessão de implementação

## Handoff

- Estrutura criada → `/ul-study-project` para implementar
- Não entende estrutura → `/ul-study-learn`
- Quer começar → `/ul-study-start`

---

*Command: /ul-setup-scaffold — Cria estrutura de projeto com TODOs*
