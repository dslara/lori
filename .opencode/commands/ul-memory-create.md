---
description: Criar flashcards SRS (/ul-memory-create)
agent: tutor
model: opencode-go/glm-5
---

Argumentos recebidos: $1 (frente), $2 (verso)

## Uso
/ul-memory-create [frente] [verso]

## Descrição

Cria flashcards para o sistema de repetição espaçada (SRS). Pode criar um card de cada vez ou em lote.

## Processo

### Passo 1: Modo de Criação

**Se forneceu frente e verso:**
Criar card imediatamente.

**Se não forneceu:**
Perguntar modo:
```
"Criar flashcards!

Modo:
a) Card único
b) Múltiplos cards (lote)
c) Cards de conceito atual"
```

### Passo 2: Criar Card Único

Coletar informações:
```
"Frente (pergunta):
[Usuário responde]

Verso (resposta):
[Usuário responde]

Categoria:
a) Algoritmo
b) Sintaxe
c) Conceito
d) Comando
e) Outro: _____

Tags (opcional, separadas por vírgula):
[Ex: go, concorrência, goroutines]"
```

### Passo 3: Validação

**Verificar qualidade:**
- Frente é pergunta clara?
- Verso é resposta completa?
- Não é muito longo (> 200 chars)?
- Não é muito vago?

**Se qualidade ruim, sugerir melhorias:**
```
"💡 Dica: Bons flashcards são:
• Específicos (não genéricos)
• Concisos (até 2 frases)
• Testáveis (você saberia responder?)

Exemplo ruim:
❌ Frente: 'Go'
❌ Verso: 'Linguagem de programação'

Exemplo bom:
✅ Frente: 'O que faz defer em Go?'
✅ Verso: 'Adia execução de função até retorno da função atual'

Quer refinar seu card?"
```

### Passo 4: Criar via Tool

Invocar `data.createFlashcard`:
- front
- back
- category
- tags
- moduleId (automático)
- userId (automático)

**Retorno:**
```
✅ Flashcard Criado!

📝 Card #[ID]:
Frente: [frente]
Verso: [verso]
Categoria: [categoria]
Próxima revisão: Amanhã

📊 Estatísticas:
• Total de cards: [N]
• Cards deste módulo: [N]
• Para revisar hoje: [N]

💡 Quer criar mais?
• Outro card → /ul-memory-create
• Revisar pendentes → /ul-memory-review
• Voltar ao estudo → /ul-study-start"
```

### Passo 5: Criar em Lote (opcional)

Se modo lote:
```
"Modo lote! Envie múltiplos cards no formato:

---
Frente: [pergunta 1]
Verso: [resposta 1]
Categoria: [cat]
Tags: [tags]

---
Frente: [pergunta 2]
Verso: [resposta 2]
...

[Cole os cards aqui]"
```

Processar cada separador `---` e criar todos.

## Boas Práticas

**Flashcards efetivos:**
1. **Uma ideia por card** — Não misturar conceitos
2. **Pergunta específica** — Não genérico
3. **Resposta completa** — Mas concisa
4. **Contexto quando necessário** — Ex: "Em Go..."
5. **Exemplos no verso** — Se aplicável

**Exemplos:**

❌ **Ruim:**
```
Frente: Quick sort
Verso: Algoritmo de ordenação rápido
```

✅ **Bom:**
```
Frente: Qual complexidade média do quick sort?
Verso: O(n log n). Pior caso: O(n²) quando pivô é extremo.
```

❌ **Ruim:**
```
Frente: Goroutines
Verso: Concorrência em Go
```

✅ **Bom:**
```
Frente: Qual diferença entre goroutine e thread?
Verso: Goroutine é gerenciada pelo runtime Go (2KB stack, multiplexada). Thread é gerenciada pelo SO (1MB stack).
```

## Exemplo Completo

```
Usuário: /ul-memory-create

Sistema:
"Criar flashcards!

Modo:
a) Card único
b) Múltiplos cards
c) Do conceito atual"

Usuário: "a"

Sistema:
"Frente (pergunta):"

Usuário: "O que é memoization?"

Sistema:
"Verso (resposta):"

Usuário: "Técnica de otimização que armazena resultados de funções custosas e retorna o cache quando inputs se repetem"

Sistema:
"Categoria:
a) Algoritmo
b) Sintaxe
c) Conceito"

Usuário: "c"

Sistema:
"Tags (opcional):"

Usuário: "performance, cache, otimização"

Sistema:
"Validação:

📝 Seu card:
Frente: 'O que é memoization?'
Verso: 'Técnica de otimização que armazena 
resultados de funções custosas...'

✅ Bom: Pergunta específica
✅ Bom: Resposta completa
⚠️  Melhorar: Pode adicionar exemplo

Quer:
a) Criar assim mesmo
b) Adicionar exemplo
c) Editar"

Usuário: "a"

Sistema:
"✅ Flashcard Criado!

📝 Card #F12345:
Frente: O que é memoization?
Verso: Técnica de otimização que armazena 
resultados de funções custosas e retorna 
o cache quando inputs se repetem
Categoria: conceito
Tags: performance, cache, otimização
Próxima revisão: Amanhã

📊 Estatísticas:
• Total de cards: 47
• Cards deste módulo: 12
• Para revisar hoje: 3

💡 Próximo passo:
a) Criar outro → /ul-memory-create
b) Revisar pendentes → /ul-memory-review
c) Voltar ao estudo → /ul-study-start"
```

## Quando Usar

✅ **USE para:**
- Conceitos importantes para memorizar
- Sintaxe que sempre esquece
- Algoritmos para entrevistas
- Comandos de CLI
- Após /ul-practice-feynman (analogias boas)
- Após /ul-learn-explain (conceitos novos)

❌ **NÃO USE para:**
- Procedimentos (use /ul-practice-drill)
- Projetos inteiros (muitos cards)
- Coisas que já domina

## Integrações

**Skill invocada:**
- `srs-generator` — Validação e formatação

**Tools utilizadas:**
- `data.createFlashcard` — Persiste no CSV
- `insights.getWeaknesses` — Sugere tópicos fracos

**Commands relacionados:**
- `/ul-memory-review` — Revisar cards criados
- `/ul-practice-feynman` — Criar card de analogia boa
- `/ul-study-end` — Sugerir criar cards ao finalizar

## Handoff

- Card criado → Outro card, revisão, ou estudo
- Vários cards criados → `/ul-memory-review`
- Terminou → `/ul-study-start` ou `/ul-study-end`

---

*Command: /ul-memory-create — Criar flashcards SRS*
