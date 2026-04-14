---
description: Aprender fazendo projetos reais (/ul-study-project)
agent: tutor
model: opencode-go/kimi-k2.5
---

Argumento recebido: $ARGUMENTS (descrição do desafio)

## Uso
/ul-study-project [desafio]

## Descrição

Este command é um **wrapper** que invoca a skill `directness` para guiar o desenvolvimento de projetos práticos. A skill fornece planejamento socrático, divisão em micro-passos e feedback iterativo sem entregar código pronto.

## Processo

### Passo 1: Validar Entrada

Se não houver `[desafio]`, perguntar:
```
"Que projeto deseja construir?
Exemplos:
• 'API REST com autenticação JWT'
• 'CLI de gerenciamento de tarefas'
• 'Visualizador de algoritmos de sorting'"
```

### Passo 2: Contextualização Rápida (30s)

Coletar informações:
1. **Skill alvo**: O que vai praticar? (ex: APIs, concorrência, parsing)
2. **Complexidade**: MVP (2h) ou completo (várias sessões)?
3. **Restrições**: Alguma tecnologia específica?
4. **Entrega final**: O que deve funcionar ao final?

### Passo 3: Invocar Skill `directness`

Delegar para a skill com os parâmetros coletados.

A skill `directness` fará:
- **Planejamento socrático**: Quebrar em etapas menores
- **Setup inicial**: Estrutura de diretórios
- **Guided coding**: Perguntar antes de mostrar código
- **Feedback iterativo**: Revisar progresso a cada etapa
- **Validação**: Testar se atende aos critérios

### Passo 4: Acompanhamento

O command permanece ativo enquanto a skill executa. O progresso é salvo automaticamente via `memcommit()` no final da sessão.

## Exemplo de Interação

```
Usuário: /ul-study-project "API REST com autenticação"

Sistema:
"Ótimo desafio! Antes de começarmos:

1. Qual skill principal vai praticar?
   a) Design de APIs
   b) Autenticação/JWT
   c) Persistência
   d) Testes

2. Escopo: MVP (só login/cadastro) ou completo?

3. Tecnologia: Go, Python, Node?"

Usuário: "Go, JWT, completo"

Sistema:
"Perfeito! Invocando guia de projeto...

[Skill directness assume]

📋 Etapa 1/8: Setup do projeto
Vamos criar a estrutura base. Você já tem o Go instalado?

[Skill guia passo a passo...]"
```

## Quando Usar

✅ **USE para:**
- Construir projetos reais (não tutoriais)
- Praticar múltiplas skills integradas
- Criar portfolio
- Resolver problemas práticos

❌ **NÃO USE para:**
- Aprender sintaxe básica → `/ul-study-drill`
- Validar compreensão → `/ul-study-feynman`
- Setup rápido → `/ul-setup-scaffold`

## Integrações

**Skill invocada:**
- `directness` — Guia socrático de projetos

**Tools utilizadas:**
- `context-hybrid.getProjectInfo` — Contexto do projeto

**Commands relacionados:**
- `/ul-setup-scaffold` — Setup inicial de estrutura
- `/ul-study-end` — Encerrar e salvar sessão
- `/ul-study-debug` — Se travar em bugs

## Handoff

- Usuário travou em bug → `/ul-study-debug`
- Usuário quer pausar → Faça uma pausa de 15 min (modo difuso)
- Projeto completo → `/ul-study-end` para salvar

---

*Command: /ul-study-project — Wrapper para skill directness*
