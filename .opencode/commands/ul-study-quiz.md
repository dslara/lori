---
description: Warm-up com quiz adaptativo (/ul-study-quiz)
agent: tutor
model: opencode-go/glm-5
---

Argumentos recebidos: $ARGUMENTS

## Uso
/ul-study-quiz [N] [tópico]

## Descrição

Quiz de 3-5 perguntas para retrieval practice. Dificuldade adaptativa baseada no histórico de erros do usuário.

## Processo

### Passo 1: Determinar Parâmetros

**Se usuário forneceu:** `/ul-study-quiz 5 "algoritmos"`
- N = 5 perguntas
- Tópico = "algoritmos"

**Se usuário não forneceu:**
```
"Quiz rápido! Configuração:

1. Quantas perguntas? (3-5 recomendado)
2. Qual tópico?
   a) Último estudado
   b) Tópico específico: _____
   c) Mix geral"
```

### Passo 2: Calcular Dificuldade

Invocar tool `insights.getDifficultyLevel`:
- **Easy**: error_rate < 20%
- **Medium**: error_rate 20-40%
- **Hard**: error_rate > 40%

**Ajuste:**
- Fácil → Perguntas mais desafiadoras
- Médio → Perguntas balanceadas
- Difícil → Perguntas mais simples, mais contexto

### Passo 3: Gerar Perguntas

Baseado no tópico e nível:

**Exemplo - Algoritmos (Medium):**
1. "Qual a complexidade do merge sort?"
2. "Em que caso quicksort é O(n²)?"
3. "Por que busca binária requer array ordenado?"

**Exemplo - Go (Hard - error_rate 50%):**
1. "O que faz o `defer` em Go?" (conceito básico)
2. "Qual diferença entre slice e array?" (comparação)
3. "Dado este código [simples], o que imprime?" (aplicação)

### Passo 4: Aplicar Quiz

Para cada pergunta:
```
--- Pergunta [N/X] ---

[Tipo: múltipla escolha / aberta]

[Pergunta]

a) [Opção 1]
b) [Opção 2]
c) [Opção 3]
d) [Opção 4]

Sua resposta: __________
```

### Passo 5: Feedback Imediato

**Se acertou:**
```
✅ Correto!

Explicação rápida:
[Por que está certo + conceito relacionado]

Próxima pergunta →"
```

**Se errou:**
```
❌ Incorreto

Resposta certa: [X]

Explicação:
[Por que é essa resposta]

💡 Dica mnemônica: [dica para lembrar]

Próxima pergunta →"
```

### Passo 6: Consolidação

Apresentar resultados:
```
✅ Quiz Completo!

📊 Resultados:
• Acertos: [X]/[N] ([X]%)
• Tempo: [M] minutos
• Dificuldade: [Easy/Medium/Hard]

🎯 Análise:
• [Tópico A]: 100% ✅
• [Tópico B]: 33% ⚠️ (revisar)

💡 Recomendações:
• Tópico B com dificuldade → /ul-study-feynman
• Praticar mais → /ul-study-drill [tópico B]
• Criar flashcard → /ul-study-memorize
```

As interações do quiz são registradas automaticamente em `session_skills.csv`via `memcommit()` no final da sessão.

## Exemplo Completo

```
Usuário: /ul-study-quiz 3 "goroutines"

Sistema:
"🧠 Quiz - 3 perguntas sobre Goroutines
Dificuldade: Medium (baseada no seu histórico)

--- Pergunta 1/3 ---
O que é uma goroutine em Go?

a) Uma função especial do sistema operacional
b) Uma thread leve gerenciada pelo runtime do Go
c) Um tipo de variável especial
d) Uma biblioteca de concorrência

Sua resposta: b"

Sistema:
"✅ Correto!

Goroutines são threads leves gerenciadas pelo runtime
do Go, não pelo sistema operacional. São mais eficientes
que threads tradicionais.

💡 Mnemônica: Go routine = rotina do Go

--- Pergunta 2/3 ---
Qual a diferença entre:
`go func()` e `func()`?

a) Sintaxe apenas, funciona igual
b) `go` executa em paralelo, sem `go` é síncrono
c) `go` é mais rápido
d) Nenhuma diferença

Sua resposta: b"

Sistema:
"✅ Correto!

A palavra-chave `go` inicia a função em uma goroutine
separada (assíncrona), enquanto sem `go` é chamada
síncrona (espera terminar).

--- Pergunta 3/3 ---
O que acontece neste código?

```go
func main() {
    go fmt.Println("Hello")
    fmt.Println("World")
}
```

a) Imprime "Hello" depois "World"
b) Imprime "World" depois "Hello"
c) Só imprime "World"
d) Erro de compilação

Sua resposta: c"

Sistema:
"✅ Correto!

A goroutine pode não executar antes do main terminar.
Para garantir execução, precisa de sync.WaitGroup ou
canal.

✅ Quiz Completo!

📊 Resultados:
• Acertos: 3/3 (100%)
• Tempo: 2 minutos
• Dificuldade: Medium

🎯 Excelente! Goroutines dominadas.

💡 Próximo passo:
• Praticar canais → /ul-study-quiz 3 "canais"
• Ou iniciar sessão → /ul-study-start"
```

## Quando Usar

✅ **USE para:**
- Warm-up no início da sessão
- Testar retenção de conceitos
- Identificar gaps antes de estudar
- Preparação para entrevistas

❌ **NÃO USE para:**
- Aprender conceito novo → `/ul-study-learn`
- Praticar procedimentos → `/ul-study-drill`
- Validar compreensão profunda → `/ul-study-feynman`

**Ideal:** 1 quiz por dia, 3-5 perguntas, 5 minutos.

## Integrações

**Tools utilizadas:**
- `insights.getDifficultyLevel` — Determina dificuldade
- `insights.getWeaknesses` — Identifica tópicos fracos

**Commands relacionados:**
- `/ul-study-start` — Sugere quiz como warm-up
- `/ul-study-feynman` — Se errar conceitos
- `/ul-study-drill` — Se precisar praticar mais
- `/ul-study-recall` — Para retenção de longo prazo

## Handoff

- Acertou tudo → `/ul-study-start` ou novo desafio
- Errou conceitos → `/ul-study-feynman` ou `/ul-study-learn`
- Errou procedimentos → `/ul-study-drill`
- Padrão de erro → `/ul-study-memorize`

---

*Command: /ul-study-quiz — Retrieval practice com dificuldade adaptativa*
