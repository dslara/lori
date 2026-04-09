---
description: Prática deliberada - repetir procedimento 5-10x (/ul-practice-drill)
agent: tutor
model: opencode-go/kimi-k2.5
---

Argumentos recebidos: $1 (conceito), $2 (variações)

## Uso
/ul-practice-drill [conceito] [variações]

## Descrição

Repetir um procedimento específico **5-10 vezes** até automatizar. Foca em velocidade, precisão e execução de memória.

## Processo

### Passo 1: Identificar Skill (5 min)

Pergunte ao usuário:
- Que procedimento foi **LENTO** hoje?
- Que skill vai usar **MUITAS vezes** no futuro?
- Consegue fazer em **<10 min** por repetição?
- Tem "jeito certo" de fazer (não criativo)?

**Critérios de seleção:**
- ✅ Vai usar 10+ vezes no futuro
- ✅ Tem "jeito certo" de fazer
- ✅ Pode ser feito em <10 min/repetição
- ✅ Pode verificar se acertou (output claro)

### Passo 2: Definir Variações (3 min)

Criar **5-10 variações** do mesmo procedimento:

**Exemplo - Recursão:**
1. Fibonacci iterativo
2. Fibonacci recursivo
3. Factorial recursivo
4. Soma de array recursiva
5. Busca binária recursiva
6. Merge de listas ordenadas
7. Quick sort particionamento
8. Verificação de palíndromo
9. Potência recursiva
10. Torre de Hanoi (3 discos)

### Passo 3: Execução (40 min)

Para cada variação:
```
--- Variação [N/10] ---
⏱️  Tempo limite: 10 min
🎯  Meta: Fazer de memória, sem consulta

[Tentativa 1]: _____ minutos
✅ Erros: _____

[Tentativa 2]: _____ minutos  
✅ Erros: _____
...
```

**Regras:**
- Cronometrar cada tentativa
- Não consultar anotações
- Se errar, anotar tipo de erro
- Tentar novamente até acertar

### Passo 4: Análise de Padrões (5 min)

Identificar:
- **Erro mais comum**: O que sempre erra?
- **Tempo médio**: Diminuiu nas tentativas?
- **Confiança**: Consegue fazer sem pensar?

### Passo 5: Consolidação

Se ainda errar frequentemente:
- Criar flashcard para o padrão de erro
- Usar `/ul-practice-feynman` para entender por que erra
- Agendar nova sessão de drill em 2-3 dias

Se automatizou:
- Parabenizar!
- Documentar tempo final
- Próximo drill: outro conceito

## Exemplo Completo

```
Usuário: /ul-practice-drill "recursão"

Sistema:
"Ótimo! Vamos praticar recursão até automatizar.

Primeiro, me diga:
1. Que problema recursivo você fez hoje que foi LENTO?
2. Quanto tempo demorou?"

Usuário: "Fibonacci, demorei 15 min"

Sistema:
"Perfeito! Vamos criar 10 variações:

📋 Variações de Recursão:
1. Fibonacci (warm-up)
2. Factorial
3. Soma de array
4. Busca binária
5. Merge recursivo
6. Quick sort partition
7. Palíndromo
8. Potência
9. Máximo divisor comum
10. Torres de Hanoi

⏱️ Regras:
• Máximo 10 min por variação
• Sem consultar anotações
• Cronometrar cada tentativa
• Anotar erros

--- Variação 1/10: Fibonacci ---
Pronto? Digite 'começar' quando quiser iniciar o cronômetro."

[Usuário pratica...]

"✅ Drill Completo!

📊 Estatísticas:
• Variações: 10/10
• Tempo médio: 6.5 min (diminuiu de 15!)
• Erros iniciais: 7
• Erros finais: 2

🎯 Conclusão: 80% automatizado

💡 Recomendações:
• Criar flashcard para 'caso base' (erro mais comum)
• Próximo drill em 3 dias
• Tentar explicar recursão para validar → /ul-practice-feynman"
```

## Quando Usar

✅ **USE para:**
- Implementar algoritmos (binary search, merge sort)
- Escrever sintaxe de memória
- Debug patterns reconhecer erros
- Git workflows (muscle memory)

❌ **NÃO USE para:**
- Conceitos abstratos → `/ul-practice-feynman`
- Fatos isolados → `/ul-memory-review`
- Projetos completos → `/ul-practice-project`
- Design criativo → experimentação livre

## Integrações

**Tools utilizadas:**
- `data.createFlashcard` — Cria cards para erros

**Commands relacionados:**
- `/ul-practice-feynman` — Se não entende o por que
- `/ul-memory-create` — Para padrões de erro
- `/ul-study-end` — Ao finalizar sessão

**Nota**: As interações são registradas automaticamente em `session_skills.csv` via `memcommit()` no final da sessão.

## Handoff

- Ainda errando → `/ul-memory-create` ou `/ul-practice-feynman`
- Conseguiu automatizar → `/ul-study-end` ou novo drill
- Travou em conceito → `/ul-learn-explain`

---

*Command: /ul-practice-drill — Prática deliberada 5-10x*
