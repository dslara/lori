---
description: Introduzir conceito novo com analogias (/ul-learn-explain)
agent: tutor
model: opencode-go/glm-5
---

Argumento recebido: $ARGUMENTS (conceito a explicar)

## Uso
/ul-learn-explain [conceito]

## Descrição

Introduzir conceito completamente novo usando analogias do mundo real e exemplos mínimos. Diferente de /ul-practice-feynman (onde usuário explica), aqui o sistema introduz.

## Processo

### Passo 1: Identificar Conceito (1 min)

Se não houver `[conceito]`, perguntar:
```
"Qual conceito você quer aprender?

Exemplos:
• ' closures em Go'
• 'generics em Rust'  
• 'async/await em Python'
• 'ponteiros em C'"
```

### Passo 2: Verificar Pré-requisitos (2 min)

Perguntar rapidamente:
```
"Antes de explicar [conceito], preciso saber:

1. Você já programa em [linguagem]? (sim/não)
2. Conhece [pré-requisito 1]? (sim/não/pouco)
3. Conhece [pré-requisito 2]? (sim/não/pouco)

Isso me ajuda a calibrar a explicação."
```

### Passo 3: Análogo do Mundo Real (5 min)

**Explicar usando analogia:**

**Closure** = "Mochila com variáveis":
```
"Imagine uma função como uma pessoa.
Normalmente, quando a pessoa termina o trabalho,
joga fora tudo que usou (variáveis locais).

Closure é como se a pessoa guardasse itens
importantes numa mochila e pudesse usar depois,
mesmo depois de 'sair da função'.

A mochila (closure) mantém acesso às variáveis
do 'escopo externo' mesmo depois que a função
externa já terminou."
```

### Passo 4: Exemplo Mínimo (5 min)

Código simples que demonstra:
```go
// Exemplo de closure
func contador() func() int {
    i := 0
    return func() int {
        i++  // i veio do 'escopo externo'
        return i
    }
}

cont := contador()
fmt.Println(cont()) // 1
fmt.Println(cont()) // 2 (lembrou o valor!)
```

**Explicar linha por linha:**
- `i := 0` → variável no escopo externo
- `return func()` → retorna função interna
- `i++` → função interna acessa `i` da externa
- Chamadas sucessivas mantêm estado

### Passo 5: Casos de Uso Reais (3 min)

**Onde usar na prática:**
- Contadores independentes
- Callbacks com estado
- Decorators/middlewares
- Factory functions

### Passo 6: Validação Rápida (3 min)

Testar compreensão:
```
"Pergunta rápida:

Se eu criar dois contadores:
cont1 := contador()
cont2 := contador()

cont1() → 1
cont1() → 2
cont2() → ?

Resposta: 1 (cada closure tem sua própria 'mochila')"
```

### Passo 7: Próximos Passos

```
"✅ Conceito Introduzido!

📋 Você aprendeu:
• O que é [conceito]
• Analogia: [analogia]
• Exemplo prático
• Casos de uso

🎯 Recomendações:
• Validar compreensão → /ul-practice-feynman [conceito]
• Praticar uso → /ul-practice-drill [conceito]
• Criar flashcard → /ul-memory-create
• Usar em projeto → /ul-practice-project"
```

## Exemplo Completo

```
Usuário: /ul-learn-explain "closures em Go"

Sistema:
"Vou introduzir closures de forma intuitiva!

Primeiro, você já programa em Go?
E conhece funções que retornam funções?"

Usuário: "Sim, programo. Funções retornando funções é novo."

Sistema:
"Perfeito! Vamos usar uma analogia:

🎒 ANÁLOGIA: A Mochila

Imagine você trabalha num escritório.
Todo dia você usa canetas, papel, post-its.
Quando termina, joga fora tudo.

Agora imagine que você tem uma MOCHILA.
Você pode guardar itens importantes na mochila
e usar depois, mesmo em outro lugar.

Closure = Mochila da função

A função 'externa' cria a mochila com variáveis.
A função 'interna' (closure) carrega a mochila
para onde for, mantendo acesso às variáveis.

---

💻 EXEMPLO PRÁTICO:

```go
// Função que cria um contador
func makeCounter() func() int {
    count := 0  // Variável na 'mochila'
    
    return func() int {
        count++  // Acessa mochila
        return count
    }
}

// Criar dois contadores
contA := makeCounter()
contB := makeCounter()

fmt.Println(contA()) // 1
fmt.Println(contA()) // 2 (mochila lembra!)
fmt.Println(contB()) // 1 (outra mochila)
```

Por que 1, 2, 1?
• contA tem sua própria mochila com count
• contB tem mochila DIFERENTE com count
• Cada closure é independente

---

🎯 CASOS DE USO:

1. **Contadores independentes**
   Cada contador tem seu próprio estado

2. **Middleware/Decorators**
   Manter estado entre chamadas

3. **Factory functions**
   Criar funções configuradas

---

🧪 VALIDAÇÃO:

O que imprime este código?

```go
func makeAdder(x int) func(int) int {
    return func(y int) int {
        return x + y
    }
}

add5 := makeAdder(5)
fmt.Println(add5(3))
```

Resposta: 8 (5 da 'mochila' + 3 parâmetro)

✅ Conceito Introduzido!

💡 Próximos passos:
• Validar com feynman → /ul-practice-feynman closures
• Praticar padrões → /ul-practice-drill closures
• Criar flashcard → /ul-memory-create"
```

## Quando Usar

✅ **USE para:**
- Conceito completamente novo
- Não sabe nada sobre o tema
- Quer analogia intuitiva primeiro
- Aprender fundamentos antes de praticar

❌ **NÃO USE para:**
- Já conhece o conceito → `/ul-practice-feynman` para validar
- Praticar → `/ul-practice-drill`
- Memorizar → `/ul-memory-review`

**Sequência ideal:**
`/ul-learn-explain` → `/ul-practice-feynman` → `/ul-practice-drill` → `/ul-practice-project`

## Integrações

**Commands relacionados:**
- `/ul-practice-feynman` — Validar se entendeu
- `/ul-practice-drill` — Praticar o conceito
- `/ul-memory-create` — Salvar analogia em flashcard
- `/ul-practice-project` — Usar em projeto real

## Handoff

- Analogia ficou clara → `/ul-practice-feynman` para validar
- Quer praticar → `/ul-practice-drill`
- Quer usar em projeto → `/ul-practice-project`
- Terminou estudo → `/ul-study-end`

---

*Command: /ul-learn-explain — Introdução a conceitos novos com analogias*
