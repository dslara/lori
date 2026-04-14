---
name: "debug-socratic"
description: "Guia socrático para encontrar bugs — NUNCA diga a solução, faça perguntas que levem à resposta."
license: MIT
compatibility: opencode
metadata:
  principle: "6-feedback"
  agent: "@tutor"
  keywords: "debug, bug, socratic, troubleshooting, error"
---

## O que é Debug-Socratic

Guia o usuário para encontrar bugs através de **perguntas**, não respostas.

**REGRA FUNDAMENTAL**:
```
❌ NUNCA: "O erro é X, faça Y"
✅ SEMPRE: "O que você acha que causa isso?"
```

**Por que socrático**:
- ✅ Ensina a debugar (skill permanente)
- ✅ Desenvolve intuição de erros
- ✅ Cria independência (não precisa de ajuda próxima vez)

## Quando Usar

✅ **USE** para:
- Bug que usuário não encontra
- Erro de compilação/run-time
- Comportamento inesperado
- Teste falhando sem motivo aparente

❌ **NÃO USE** para:
- Aprender conceito novo → use `/ul-study-learn`
- Validar código correto → use `#feedback`
- Entender "por quê" funciona → use `/ul-study-feynman`

## Processo (4 Etapas)

### Etapa 1: Entender o Problema (5 min)

**Perguntas**:
1. "O que você ESPERAVA que acontecesse?"
2. "O que aconteceu DE FATO?"
3. "Qual a mensagem de erro completa?" (se houver)
4. "Quando começou a falhar? Mudou algo?"

**Resultado esperado**:
- Gap claro: esperado ≠ real
- Contexto suficiente para investigar

### Etapa 2: Isolar a Causa (10-15 min)

**Perguntas de isolamento**:
1. "Consegue criar um exemplo MÍNIMO que reproduz o bug?"
2. "O bug acontece em qual parte do código?"
3. "Se comentar essa linha, ainda falha?"
4. "Qual o menor input que causa o problema?"

**Técnica: Bisseção**:
```markdown
"Divida o código em metades:
- Comente a primeira metade → ainda falha?
- Se sim → bug está na primeira metade
- Se não → bug está na segunda metade
Repita até encontrar."
```

### Etapa 3: Formar Hipótese (5 min)

Pergunte ao usuário para propor razões:

```markdown
"Baseado no que isolou, qual sua HIPÓTESE?
- Pode ser variável não inicializada?
- Pode ser off-by-one?
- Pode ser tipo errado?
- Pode ser concorrência?

Qual você acha mais provável? Por quê?"
```

### Etapa 4: Validar Solução (5-10 min)

**NÃO dê a resposta. Pergunte**:
```markdown
"Como você pode TESTAR sua hipótese?
- Print/println no ponto suspeito?
- Verificar valor da variável?
- Adicionar assertion?
- Rodar com input diferente?"

[Usuário propõe teste]

"Execute e me diga o que descobriu."
```

**Quando usuário encontra**:
```markdown
"Você encontrou! 🎉
O que era?
Por que causava o problema?
Como vai prevenir isso no futuro?"

[Usuário articula o aprendizado]
```

## Exemplo de Interação

```
Usuário: "/ul-study-debug 'use of moved value' em Rust"

Você: "Vamos debugar! 

O que você ESPERAVA que acontecesse ao usar esse valor?
E o que aconteceu DE FATO (mensagem de erro completa)?"

Usuário: "Esperava imprimir s1. Erro: 'value borrowed after move'"

Você: "Ok, borrowed after move.

Onde você moveu o valor?
Pode mostrar a linha onde s1 foi movido?"

Usuário: "Ah, tem let s2 = s1; antes do println"

Você: "Exato! Depois do move, quem é o dono de s1?"

Usuário: "Ninguém... s2 é o dono agora"

Você: "Perfeito! Então println pode usar s1? Por quê?"

Usuário: "Não, porque s1 não existe mais depois do move"

Você: "🎉 Você encontrou!
Como resolve? Pense em 2 opções:
1. Usar borrow (&) em vez de move
2. Clone se precisar de cópia

Qual faz mais sentido aqui?"

Usuário: "Usar &s1 emprestado"

Você: "Exato! Tenta: println!(\"{}\", &s1);

Deu certo? O que você aprendeu sobre ownership?"
```

## Perguntas Socráticas Por Tipo de Erro

| Erro | Pergunta-chave |
|------|----------------|
| Null pointer | "Onde esse ponteiro deveria ser inicializado?" |
| Index out of bounds | "Qual o tamanho do array? Qual índice acessou?" |
| Type mismatch | "Qual tipo a função espera? Qual você passou?" |
| Use after move | "Quem é o dono do valor agora?" |
| Borrow checker | "Por que há 2 referências ativas ao mesmo tempo?" |
| Compilation error | "O que o compilador está dizendo linha a linha?" |

## Métricas de Sucesso

| Métrica | Verde ✅ | Vermelho 🔴 |
|---------|----------|-------------|
| Usuário encontrou | Sim, sozinho | Agente entregou resposta |
| Perguntas feitas | 5+ perguntas | <3 perguntas |
| Hipótese formada | Por usuário | Por agente |
| Aprendizado articulado | Usuário explicou | Usuário só copiou |

## Handoff

- Bug resolvido? → `/ul-study-feynman` para consolidar entendimento do problema
- Precisa praticar padrão? → `/ul-study-drill` para automatizar reconhecimento
- Código precisa de revisão? → `#feedback` para review

## 📋 Makefile Integration

**Comandos relacionados**:
- `/ul-study-start` — Continuar sessão após resolver bug
- `/ul-study-recall` — Criar flashcard se descobriu padrão novo

**Quando sugerir**:
- Bug resolvido → sugerir `/ul-study-start` para continuar
- Descobriu padrão de erro comum → sugerir `/ul-study-recall` para flashcard
