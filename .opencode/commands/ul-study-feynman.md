---
description: Validar compreensão explicando para criança de 12 anos (/ul-study-feynman)
agent: tutor
model: opencode-go/glm-5
---

Argumento recebido: $ARGUMENTS (conceito a validar)

## Uso
/ul-study-feynman [conceito]

## Descrição

Técnica de Feynman: explicar um conceito em linguagem simples, como se estivesse ensinando uma criança de 12 anos. Se não consegue simplificar, não entendeu de verdade.

## Processo

### Passo 1: Escolher Conceito (1 min)

Se não houver `[conceito]`, perguntar:
```
"Qual conceito você quer validar?

Dicas:
• Escolha algo que estudou recentemente
• Algo que acha que entendeu
• Um tópico que vai usar no projeto"
```

### Passo 2: Explicação do Usuário (5 min)

**Instrução:**
```
"Explique [conceito] como se eu fosse uma criança de 12 anos.

Regras:
• Sem jargões técnicos
• Use analogias do dia a dia
• Máximo 3 parágrafos
• Pode usar exemplos simples"
```

### Passo 3: Análise de Gaps (3 min)

Analisar a explicação do usuário procurando:
- **Jargões não explicados**: Palavras técnicas sem definição
- **Saltos lógicos**: Assumiu conhecimento prévio
- **Vagueza**: "Alguma coisa que faz..." (não específico)
- **Circularidade**: Explicou A usando B, e B usando A

**Perguntas socráticas:**
- "O que você quis dizer com [termo técnico]?"
- "Por que isso funciona assim?"
- "Pode dar um exemplo do mundo real?"

### Passo 4: Simplificação Guiada (5 min)

Ajudar a simplificar:
```
"Vamos melhorar sua explicação:

❌ Antes: 'Memoization é uma técnica de otimização...'
✅ Depois: 'Memoization é como fazer anotações em uma prova.
   Se a pergunta 5 depende da resposta da pergunta 3,
   você já tem a resposta anotada e não precisa calcular de novo.'

Tente novamente com essa analogia."
```

### Passo 5: Analogia do Mundo Real (3 min)

Criar analogia perfeita:
- **Recursão**: Caixa de bonecas russas
- **Memoization**: Anotações em prova
- **Callback**: Deixar recado para alguém
- **Promise**: Pedido em restaurante
- **Closure**: Mochila com itens pessoais

### Passo 6: Validação Final

Usuário explica novamente usando a analogia.

**Critérios de sucesso:**
- ✅ Sem jargões
- ✅ Exemplo concreto
- ✅ Por que explicado
- ✅ Criança entenderia

Se atende todos → **Validado!**
Se ainda tem gaps → Repetir Passo 4

## Exemplo Completo

```
Usuário: /ul-study-feynman "recursão"

Sistema:
"Ótimo! Vamos validar se você entendeu recursão.

Exercício: Explique recursão como se eu fosse uma 
criança de 12 anos.

Regras:
• Sem palavras técnicas difíceis
• Use algo do dia a dia
• Explique o por que

Escreva sua explicação:"

Usuário: "Recursão é quando uma função chama ela mesma
até chegar em um caso base."

Sistema:
"Análise:
❌ 'Função' - jargão técnico
❌ 'Caso base' - não explicado
❌ Falta analogia
❌ Não explica o por que

Vamos simplificar. Pense em caixas de bonecas russas:
• A maior caixa contém uma caixa menor
• Essa contém outra menor
• Até chegar na menor de todas

Agora tente novamente usando essa analogia:"

Usuário: "Recursão é como caixas de bonecas russas.
Você abre uma caixa e encontra outra dentro.
Você abre essa e encontra outra.
Continua até a caixa mais pequena que não tem nada dentro.
Cada caixa faz a mesma coisa: se abre e procura dentro."

Sistema:
"✅ Muito melhor!

Análise:
✅ Analogia clara (bonecas russas)
✅ Sem jargões
✅ Explica o processo
✅ Criança entenderia

Gap identificado:
• Mas por que usar recursão? Qual a vantagem?

Pergunta: Porque não abrir todas as caixas de uma vez?"

Usuário: "Porque você só pode abrir uma por vez, e
precisa saber o que tem dentro para saber se continua
ou para."

Sistema:
"✅ EXCELENTE!

Você entendeu recursão:
✅ Analogia clara
✅ Caso base (caixa vazia)
✅ Chamada recursiva (abrir próxima)
✅ Por que usar (só sabe se continua depois de olhar)

🎯 Conceito VALIDADO!

💡 Recomendação: criar flashcard com analogia
   das bonecas russas"
```

## Quando Usar

✅ **USE para:**
- Validar se entendeu de verdade
- Preparar para entrevistas técnicas
- Ensinar outros (aprender ensinando)
- Identificar gaps de compreensão

❌ **NÃO USE para:**
- Memorizar fatos → `/ul-study-recall`
- Praticar procedimentos → `/ul-study-drill`
- Aprender conceito novo → `/ul-study-learn`

## Integrações

**Tools utilizadas:**
- `data.createFlashcard` — Salva analogia boa

**Commands relacionados:**
- `/ul-study-learn` — Se não consegue explicar (aprender primeiro)
- `/ul-study-drill` — Se já entendeu, praticar
- `/ul-study-memorize` — Salvar analogias em flashcards

**Nota**: As interações são registradas automaticamente em `session_skills.csv` via `memcommit()` no final da sessão.

## Handoff

- Não consegue simplificar → `/ul-study-learn` para aprender melhor
- Explicação boa → `/ul-study-drill` para automatizar
- Analogia perfeita → `/ul-study-memorize` para salvar
- Validado → `/ul-study-end` ou novo conceito

---

*Command: /ul-study-feynman — Técnica de validação via explicação simples*
