---
name: "benchmarking"
description: "Criar testes de proficiência mensuráveis para avaliar domínio de um skill."
license: MIT
compatibility: opencode
metadata:
  principle: "1-metalearning"
  agent: "@meta"
  keywords: "benchmark, test, proficiency, assessment, mastery"
---

## O que é Benchmarking

Criar **testes de proficiência objetivos** para:
- ✅ Medir nível atual
- ✅ Definir meta clara
- ✅ Saber quando atingiu domínio

**Diferente de quiz**:
- Quiz = aquecimento, retrieval rápido
- Benchmark = avaliação formal, critério de sucesso

## Quando Usar

✅ **USE** para:
- Medir progresso ao final de módulo/phase
- Validar prontidão antes de avançar
- Criar critérios objetivos de domínio
- "Como sei que aprendi?"

❌ **NÃO USE** para:
- Warm-up de sessão → use `#quiz`
- Diagnóstico inicial (use entrevista)
- Testes de personalidade/aptidão

## Processo

### Passo 1: Definir Skill a Avaliar (5 min)

Pergunte:
- "Qual skill quer avaliar?"
- "Em que contexto?" (job, projeto pessoal, certificação)
- "Nível alvo?" (básico, intermediário, avançado)

### Passo 2: Definir 3 Níveis de Proficiência (10 min)

| Nível | Critério | Exemplo |
|-------|----------|---------|
| **Básico** | Consegue fazer COM referência | Implementar binary search consultando docs |
| **Intermediário** | Consegue fazer SEM referência | Implementar do zero em <15 min |
| **Avançado** | Consegue explicar, ensinar, adaptar | Implementar, otimizar, e criar variações |

### Passo 3: Criar Tarefas de Avaliação (15 min)

**Tarefa = exercício prático mensurável**

| Nível | Tarefas (3-5) | Tempo | Critério de sucesso |
|-------|---------------|-------|---------------------|
| Básico | 3 tarefas simples | 30 min | 90%+ acertos, pode consultar |
| Intermediário | 3 tarefas médias | 45 min | 80%+ acertos, sem consulta |
| Avançado | 3 tarefas complexas | 60 min | 70%+ acertos, sem consulta |

**Exemplo de tarefas**:

```markdown
## Benchmark: Sorting Algorithms

### Nível Básico (pode consultar docs)
1. Implementar bubble sort com comentários
2. Identificar Big O de código dado
3. Explicar quando usar bubble sort

### Nível Intermediário (sem consulta)
1. Implementar quick sort em <15 min
2. Analisar trade-offs de 3 algoritmos
3. Otimizar código dado para melhor Big O

### Nível Avançado (sem consulta)
1. Implementar hybrid sort (quick + insertion para pequenos)
2. Criar sorting para dados específicos (strings, structs)
3. Ensinar sorting para iniciante (explicar em 5 min)
```

### Passo 4: Definir Métricas (5 min)

**Métricas objetivas**:
```markdown
## Métricas

| Critério | Básico | Intermediário | Avançado |
|----------|--------|---------------|----------|
| Acertos | 90%+ | 80%+ | 70%+ |
| Tempo total | <30min | <45min | <60min |
| Consulta | Permitida | Não | Não |
| Explicação | Opcional | Requerida | Requerida |
```

### Passo 5: Output (5 min)

Gerar arquivo de benchmark:

```markdown
# Benchmark: Sorting Algorithms

## Objetivo
Avaliar proficiência em algoritmos de ordenação.

## Níveis

### Básico (90%+ acertos, 30 min, consulta OK)
- [ ] Implementar bubble sort
- [ ] Identificar Big O de código
- [ ] Explicar quando usar

### Intermediário (80%+ acertos, 45 min, sem consulta)
- [ ] Implementar quick sort <15 min
- [ ] Comparar 3 algoritmos
- [ ] Otimizar código

### Avançado (70%+ acertos, 60 min, sem consulta)
- [ ] Implementar hybrid sort
- [ ] Criar sorting específico
- [ ] Ensinar sorting em 5 min

## Como Executar
1. Escolha nível alvo
2. Execute com @tutor: "#drill [tarefa]"
3. Cronometre e registre acertos
4. Compare com critérios
```

## Exemplo de Interação

```
Usuário: "#benchmark-test para estruturas de dados"

Você: "Vamos criar o benchmark!

1. Qual estrutura específica? (hash table, tree, graph, todas?)
2. Qual seu objetivo? (job interview, projeto, certificação?)
3. Nível alvo? (básico, intermediário, avançado)"

[Após respostas]

"## Benchmark: Hash Tables

### Básico (consulta OK)
1. Criar HashMap e adicionar 5 items
2. Explicar complexidade de .get()
3. Identificar quando usar HashMap

### Intermediário (sem consulta)
1. Implementar HashMap do zero em <30 min
2. Resolver colisão com chaining
3. Analisar Big O de código com loops + hash

### Avançado (sem consulta)
1. Implementar HashMap com open addressing
2. Criar LRU cache usando HashMap + doubly linked list
3. Otimizar para caso específico (strings vs ints)

Quer executar agora? Posso passar para @tutor."
```

## Métricas de Sucesso

| Métrica | Verde ✅ | Vermelho 🔴 |
|---------|----------|-------------|
| Níveis definidos | 3 níveis claros | Só 1 ou vago |
| Tarefas mensuráveis | 3-5 por nível | Genéricas |
| Critérios objetivos | % acertos + tempo | Subjetivos |
| Output claro | Benchmark.md gerado | Sem output |

## Handoff

- Benchmark criado? → Passar para @tutor executar
- Nível definido? → Usuário pode começar a estudar para atingir

## 📋 Makefile Integration

**Comandos relacionados**:
- `@meta #create-weekly-plan` — Criar plano semanal que inclui benchmark
- `/status` — Ver progresso geral

**Quando sugerir**:
- Benchmark criado → sugerir executar com `#drill` ou `#directness`
- Fim de módulo → sugerir criar benchmark para validar domínio
