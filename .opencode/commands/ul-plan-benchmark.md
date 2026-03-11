---
description: Criar teste de proficiência mensurável (/ul-plan-benchmark)
agent: meta
model: opencode-go/glm-5
---

Argumento recebido: $ARGUMENTS (skill a ser testada)

## Uso
/ul-plan-benchmark [skill]

## Descrição

Cria testes de proficiência com 3 níveis (iniciante, intermediário, avançado) para validar domínio de uma skill específica.

## Processo

### Passo 1: Identificar Skill

Se não forneceu `[skill]`, perguntar:
```
"Qual skill você quer testar?

Exemplos:
• 'algoritmos de ordenação'
• 'manipulação de strings em Go'
• 'recursão'
• 'APIs REST'
• 'ponteiros em C'

Descreva a skill: __________"
```

### Passo 2: Definir 3 Níveis

Para a skill, criar:

**Nível 1 - Iniciante:**
- Conceitos básicos
- Uso simples
- 30 minutos para completar

**Nível 2 - Intermediário:**
- Aplicação prática
- Combinar conceitos
- 1 hora para completar

**Nível 3 - Avançado:**
- Edge cases
- Otimização
- 2+ horas para completar

### Passo 3: Criar Tarefas Mensuráveis

**Para cada nível, criar 3 tarefas:**

**Exemplo - Recursão:**

**Nível 1 (Iniciante):**
1. Implementar factorial recursivo
2. Implementar fibonacci recursivo
3. Implementar soma de array recursiva

**Nível 2 (Intermediário):**
1. Implementar busca binária recursiva
2. Implementar merge sort
3. Resolver problema de torres de Hanoi

**Nível 3 (Avançado):**
1. Implementar quick sort otimizado (pivô aleatório)
2. Resolver problema de labirinto com backtracking
3. Implementar parser recursivo descendente para expressões matemáticas

### Passo 4: Definir Critérios de Sucesso

Para cada tarefa, definir:
- **Input:** Dados de entrada
- **Output esperado:** Resultado correto
- **Restrições:** Tempo máximo, memória
- **Critérios:** Testes que devem passar

### Passo 5: Gerar Arquivo

Criar `benchmark-[skill].md`:

```markdown
# Benchmark - [Skill]

## 📋 Descrição
Teste de proficiência para [skill]

## 🎯 Objetivo
Validar domínio através de tarefas práticas

---

## 🟢 Nível 1 - Iniciante
**Tempo estimado:** 30 minutos

### Tarefa 1.1: [Nome]
**Descrição:** [O que fazer]

**Input:**
```
[dados]
```

**Output esperado:**
```
[resultado]
```

**Critérios:**
- [ ] Passa em todos os testes
- [ ] Implementação recursiva
- [ ] Caso base correto

---

### Tarefa 1.2: [Nome]
...

### Tarefa 1.3: [Nome]
...

---

## 🟡 Nível 2 - Intermediário
**Tempo estimado:** 1 hora

### Tarefa 2.1: [Nome]
...

### Tarefa 2.2: [Nome]
...

### Tarefa 2.3: [Nome]
...

---

## 🔴 Nível 3 - Avançado
**Tempo estimado:** 2+ horas

### Tarefa 3.1: [Nome]
...

### Tarefa 3.2: [Nome]
...

### Tarefa 3.3: [Nome]
...

---

## 📊 Rubrica de Avaliação

### Pontuação
- Nível 1 completo: 30 pontos
- Nível 2 completo: 40 pontos
- Nível 3 completo: 30 pontos

**Total máximo:** 100 pontos

### Classificação
- **0-39:** Iniciante - Precisa de mais prática
- **40-69:** Intermediário - Bom domínio básico
- **70-89:** Avançado - Domínio sólido
- **90-100:** Especialista - Domínio completo

---

## 🚀 Como Usar

1. Tente completar sem consultar materiais
2. Cronometre o tempo
3. Teste suas soluções
4. Avalie com base na rubrica
5. Identifique gaps para estudar

---

*Criado em: [data]*
```

### Passo 6: Apresentar e Sugerir

```
✅ Benchmark Criado!

📄 Arquivo: benchmark-[skill].md

📊 Estrutura:
• Nível 1 (Iniciante): 3 tarefas - 30min
• Nível 2 (Intermediário): 3 tarefas - 1h
• Nível 3 (Avançado): 3 tarefas - 2h

🎯 Critérios claros para cada tarefa
📊 Rubrica de pontuação definida

💡 Quando usar:
• Início do módulo (baseline)
• Meio do módulo (checkpoint)
• Final do módulo (validação)

🚀 Próximo passo:
→ /ul-practice-project para começar
   preparação para o benchmark
```

## Exemplo

```
Usuário: /ul-plan-benchmark "recursão"

Sistema:
"Criando benchmark para 'recursão'!

Definindo níveis:

🟢 NÍVEL 1 - Iniciante (30min):
• Factorial
• Fibonacci
• Soma de array

🟡 NÍVEL 2 - Intermediário (1h):
• Busca binária
• Merge sort
• Torres de Hanoi

🔴 NÍVEL 3 - Avançado (2h):
• Quick sort otimizado
• Labirinto com backtracking
• Parser recursivo

✅ Benchmark Criado!

📄 Salvo em: benchmark-recursao.md

📋 Conteúdo:
9 tarefas distribuídas em 3 níveis
Critérios de sucesso para cada uma
Rubrica de pontuação (0-100)

💡 Sugestão:
Faça o benchmark no início (baseline),
no meio (checkpoint) e no final
(validação) do módulo.

🎯 Próximo passo:
→ /ul-practice-drill 'recursão'
   para se preparar"
```

## Quando Usar

✅ **USE:**
- Início do módulo (baseline)
- Meio do módulo (checkpoint)
- Final do módulo (validação)
- Preparação para entrevistas
- Quer medir progresso objetivamente

❌ **NÃO USE:**
- Skills muito abrangentes (focar)
- Sem prática prévia (fazer drill primeiro)
- Quando ainda está aprendendo conceito

## Integrações

**Commands:**
- `/ul-practice-drill` — Praticar para benchmark
- `/ul-practice-project` — Preparar com projetos
- `/ul-plan-retro` — Discutir resultados

---

*Command: /ul-plan-benchmark — Criar testes de proficiência*
