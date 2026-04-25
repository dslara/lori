# 🗂️ Guia Completo: Decomposição de Objetivos

> **Última atualização**: 2026-02-18  
> **Versão**: 1.0  
> **Técnica de Planejamento**

---

## 📋 Índice

- [O que é Decomposição](#o-que-e-decomposicao)
- [Quando Usar](#quando-usar-decomposicao)
- [Por que Funciona](#por-que-funciona)
- [Como Decompor](#como-decompor-passo-a-passo)
- [Framework 3D](#framework-3d)
- [Boas Práticas](#boas-praticas)
- [Workflow](#workflow-tipico)
- [Métricas](#metricas)
- [Resumo](#resumo-regras-de-ouro)
- [Exemplos](#exemplos-completos)

---

## 🎯 O que é Decomposição? 
### Definição
**Decomposição** é a técnica de dividir objetivos complexos em partes menores, gerenciáveis e acionáveis, organizadas hierarquicamente até atingir tarefas que podem ser executadas em sessões de estudo individuais.

### Princípio Implementado
Esta técnica implementa principalmente:
- **[1-metalearning.md](../principios/1-metalearning.md)** - Planejamento estratégico
- **[8-intuition.md](../principios/8-intuition.md)** - Entender estrutura do domínio

**Técnicas relacionadas:**
- [benchmarking.md](benchmarking.md) - Avaliar recursos
- [mindmap.md](mindmap.md) - Visualizar estrutura
- [first-principles.md](first-principles.md) - Identificar componentes fundamentais

---

## 🧠 Quando Usar Decomposição?

### ✅ USE quando:

| Situação | Exemplo |
|----------|---------|
| **Objetivo parece grande demais** | "Aprender Rust" → impreciso |
| **Não sabe por onde começar** | Falta de clareza no caminho |
| **Estimativa de tempo difícil** | "Quanto tempo leva?" |
| **Múltiplos componentes** | Habilidade com várias sub-habilidades |
| **Dependências entre tópicos** | Precisa ordenar sequência |
| **Acompanhamento necessário** | Medir progresso incremental |

### ❌ NÃO USE quando:

| Situação | Por quê |
|----------|---------|
| **Tarefa já é simples** | Over-engineering |
| **Exploração livre** | Decomposição prematura limita descoberta |
| **Tempo extremamente curto** | Custo de planejamento > benefício |

---

## 🧬 Por que Decomposição Funciona?

### Benefícios Cognitivos

```
OBJETIVO GRANDE
   │
   ├── Muito complexo para mente processar
   ├── Dificulta estimativa de tempo
   ├── Causa procrastinação (medo)
   └── Não claro próximo passo
   
   ↓ DECOMPOSIÇÃO
   
PARTES PEQUENAS
   │
   ├── Cada parte é gerenciável
   ├── Tempo estimável (+-20%)
   ├── Procrastinação reduzida
   └── Próximo passo sempre claro
```

### Estrutura Hierárquica

```
META (12 meses)
    │
    ├─ Módulo 1 (6 semanas)
    │   ├─ Semana 1-2: Tópico A
    │   │   ├─ Sessão 1: Conceito A1
    │   │   └─ Sessão 2: Conceito A2
    │   └─ Semana 3-4: Tópico B
    │       ├─ Sessão 3: Conceito B1
    │       └─ Sessão 4: Conceito B2
    │
    ├─ Módulo 2 (6 semanas)
    │   └─ ...
    │
    └─ Módulo N
```

---

## 🛠️ Como Decompor (Passo a Passo)

### Passo 1: Definir Meta SMART (10 min)

**Template:**
```
S - Specific: [O quê exatamente?]
M - Measurable: [Como saber se consegui?]
A - Achievable: [É realista?]
R - Relevant: [Por que importa?]
T - Time-bound: [Quando?]
```

**Exemplo:**
```
❌ "Aprender Rust"

✅ "Conseguir emprego como desenvolvedor Rust júnior
   em 12 meses, demonstrando através de portfólio
   com 5 projetos no GitHub"
```

### Passo 2: Identificar Domínios (15 min)

Use Framework 3D para categorizar:

```
APRENDER RUST:

CONCEITOS (40%):
├─ Ownership e borrowing
├─ Lifetimes
├─ Trait system
├─ Memory management
└─ Concurrency model

FATOS (20%):
├─ Sintaxe básica
├─ Keywords
├─ Standard library APIs
└─ Cargo commands

PROCEDIMENTOS (40%):
├─ Escrever funções
├─ Manipular collections
├─ Error handling
├─ Testing
├─ Debugging
└─ Build e deploy
```

### Passo 3: Criar Módulos (20 min)

Divida em unidades de 4-8 semanas:

```
RUST: 8 Módulos de 6 semanas cada

Módulo 1: Fundamentos
├─ Semana 1-2: Sintaxe básica
├─ Semana 3-4: Tipos e estruturas
└─ Semana 5-6: Controle de fluxo

Módulo 2: Ownership
├─ Semana 1-2: Move semantics
├─ Semana 3-4: Borrowing
└─ Semana 5-6: Lifetimes

Módulo 3: Structs e Enums
...

Módulo 8: Async e Concorrência
```

### Passo 4: Detalhar Semanas (15 min)

Cada semana = 1-2 tópicos principais:

```
Módulo 1, Semana 1: Sintaxe Básica

Objetivo da semana:
"Escrever programas Rust simples sem erros de compilação"

Tópicos:
├─ Variáveis e mutabilidade (2h)
├─ Tipos primitivos (2h)
├─ Funções (2h)
└─ Controle de fluxo básico (2h)

Total: 8h (4 sessões de 2h)

Entregável:
- 5 exercícios completados
- 1 mini-programa funcional
```

### Passo 5: Definir Sessões (10 min)

Cada sessão = 1 conceito acionável:

```
SESSÃO: "Variáveis em Rust"

Duração: 2 horas

Pré-requisitos:
- Ambiente configurado
- Hello world compilando

Conteúdo:
├─ let vs let mut (30 min)
├─ Shadowing (30 min)
├─ Constants (30 min)
└─ Exercícios práticos (30 min)

Check de sucesso:
□ Declarar variáveis mutáveis e imutáveis
□ Explicar shadowing sem consultar
□ Resolver 5 exercícios sem erros

Recursos:
- Capítulo 3 do Rust Book
- Rustlings exercises 1-5
```

### Passo 6: Mapear Dependências (10 min)

Identifique o que precisa vir antes:

```
DEPENDÊNCIAS RUST:

[Fundamentos] → [Ownership] → [Structs]
      ↓              ↓            ↓
[Sintaxe]    [Borrowing] → [Traits]
      ↓              ↓            ↓
[Funções]    [Lifetimes] → [Generics]
      ↓              ↓            ↓
[Controle]   [Smart Ptrs] → [Collections]
```

**Regra**: Nunca comece módulo N sem completar 80% do módulo N-1.

---

## 🎯 Framework 3D

### Decomposição por Dimensão

| Dimensão | Unidade | Conteúdo |
|----------|---------|----------|
| **Conceitos** | 1 conceito/sessão | Entender "por quê" |
| **Fatos** | 5-10 fatos/sessão | Flashcards SRS |
| **Procedimentos** | 1 procedimento/sessão | Drill 5-10x |

### Exemplo Completo

```
META: Dominar Binary Search Tree (BST)

CONCEITOS (3 sessões):
Sessão 1: "O que é BST?"
├─ Propriedade: left < node < right
├─ Por que O(log n) na média?
└─ Técnica: Feynman

Sessão 2: "Operações básicas"
├─ Insert: encontrar posição correta
├─ Search: navegar comparando
└─ Técnica: Walkthrough visual

Sessão 3: "Balanceamento"
├─ Por que árvore desbalanceada = lista
├─ Rotações (AVL, Red-Black)
└─ Técnica: First Principles

FATOS (2 sessões):
Sessão 4: "Complexidades"
├─ Search: O(log n) médio, O(n) pior
├─ Insert: O(log n) médio, O(n) pior
├─ Delete: O(log n) médio, O(n) pior
└─ Técnica: Flashcards

Sessão 5: "Comparações"
├─ BST vs Hash Table
├─ BST vs Array ordenado
├─ Balanceado vs Desbalanceado
└─ Técnica: Concept Map

PROCEDIMENTOS (4 sessões):
Sessão 6: "Implementar Insert"
├─ Caso base: árvore vazia
├─ Recursivo: comparar e descer
└─ Técnica: Drill (5 implementações)

Sessão 7: "Implementar Search"
├─ Caso base: encontrou ou null
├─ Recursivo: left ou right
└─ Técnica: Drill (5 implementações)

Sessão 8: "Implementar Delete"
├─ Caso 1: folha (simples)
├─ Caso 2: 1 filho (substitui)
├─ Caso 3: 2 filhos (sucessor)
└─ Técnica: Drill (10 implementações)

Sessão 9: "Projeto: BST completa"
├─ Todas operações
├─ Testes unitários
└─ Técnica: Directness

Total: 9 sessões (~18 horas)
```

---

## ✍️ Boas Práticas

### ✅ BOM: Granularidade Adequada

```
❌ Muito grande:
"Módulo 1: Aprender Rust"
→ Impreciso, não acionável

❌ Muito pequeno:
"Sessão 1: Entender o 'l' em 'let'"
→ Over-engineering

✅ Adequado:
"Sessão 1: Variáveis e mutabilidade em Rust"
→ Completo em 2h, acionável, verificável
```

### ✅ BOM: Checklist de Sucesso

```
Cada sessão deve ter:

□ Critério objetivo de sucesso
  Ex: "Implementar binary search sem consultar"

□ Entregável concreto
  Ex: "Código no GitHub + 3 testes passando"

□ Estimativa de tempo
  Ex: "2 horas"

□ Recursos identificados
  Ex: "Rust Book cap. 3, exercícios 1-5"
```

### ❌ RUIM: Decomposição Vaga

```
❌ "Estudar semana 1"
→ O quê especificamente?

✅ "Completar exercícios 1-10 de ownership"
→ Claro, mensurável, acionável
```

---

## 🔄 Workflow Típico

### Início de Novo Módulo

```bash
# Semana 0: Planejamento
@meta #create-weekly-plan

@meta #decompose-goal "Dominar [tópico]"
  ↓
1. Meta SMART definida
2. Framework 3D aplicado
3. Módulos criados (4-8 semanas)
4. Dependências mapeadas
5. Cronograma estimado

# Salvar
mkdir -p 01-math-foundations/meta
echo "# Learning Map" > 01-math-foundations/meta/learning-map.md
```

### Ajuste Contínuo

```
SEMANALMENTE:
□ Progresso real vs planejado?
  └─ ±20% → Normal
  └─ >20% atraso → Reduzir escopo
  └─ >20% adiantado → Aumentar desafio

□ Algum tópico mais difícil?
  └─ Adicionar sessões extras
  └─ Buscar recursos adicionais

□ Algum tópico mais fácil?
  └─ Combinar com outro
  └─ Acelerar cronograma
```

---

## 📊 Métricas

### Qualidade da Decomposição

| Critério | Ótimo ✅ | Bom | Insuficiente ❌ |
|----------|---------|-----|----------------|
| Clareza | Sabe exatamente o próximo passo | Próximos 2-3 passos claros | Confuso sobre o que fazer |
| Mensurabilidade | Pode dizer "consegui/não consegui" | Pode estimar progresso | Subjetivo |
| Tempo | ±20% da estimativa | ±50% da estimativa | >±50% ou sem estimativa |
| Completo | Todos componentes cobertos | 80%+ coberto | <80% coberto |
| Acionável | Pode começar imediatamente | Pequena preparação necessária | Bloqueado por dependências |

### Teste da Decomposição

```
PEGUE PRÓXIMA SESSÃO:

□ Posso começar agora?
□ Sei quanto tempo leva?
□ Sei quando terminei?
□ Sei se fui bem-sucedido?
□ Não dependo de nada não-finished?

✅ 5/5 = Excelente decomposição
⚠️ 3-4/5 = Ajustes necessários
❌ <3/5 = Decompor mais
```

---

## 🎓 Resumo: Regras de Ouro

1. **Comece com meta SMART**
   - ✅ Específica, mensurável, com prazo
   - ❌ Vaga sem critério de sucesso

2. **Use Framework 3D**
   - ✅ Separe conceitos, fatos, procedimentos
   - ❌ Misturar tudo sem estrutura

3. **Módulos de 4-8 semanas**
   - ✅ Unidade gerenciável
   - ❌ Muito longo (>12 semanas) ou curto (<2 semanas)

4. **Sessões de 1-2 conceitos**
   - ✅ Acionável em 1-2h
   - ❌ Sessões >4h ou <30min

5. **Mapeie dependências**
   - ✅ Ordem lógica clara
   - ❌ Começar do meio

---

## 📝 Exemplos Completos

### Exemplo 1: Mudança de Carreira (Rust)

```
META: Emprego como Dev Rust Júnior em 12 meses

MÊS 1-3: Fundamentos
├─ Semana 1-2: Setup e sintaxe básica
├─ Semana 3-4: Ownership e borrowing
├─ Semana 5-6: Structs e enums
├─ Semana 7-8: Collections
└─ Entregável: CLI calculator

MÊS 4-6: Intermediário
├─ Semana 1-2: Error handling
├─ Semana 3-4: Traits e generics
├─ Semana 5-6: Testing
└─ Entregável: API client

MÊS 7-9: Avançado
├─ Semana 1-2: Lifetimes avançados
├─ Semana 3-4: Smart pointers
├─ Semana 5-6: Macros
└─ Entregável: Web server

MÊS 10-12: Projetos e Portfolio
├─ Semana 1-4: Projeto 1 (sistema de arquivos)
├─ Semana 5-8: Projeto 2 (database simples)
├─ Semana 9-10: Projeto 3 (mini-compilador)
└─ Semana 11-12: Polir portfolio + aplicar

Total: 48 semanas, ~300h de estudo
```

### Exemplo 2: Aprender Algoritmo Específico

```
META: Implementar Dijkstra do zero

SESSÃO 1: Entender problema (2h)
├─ O que é shortest path?
├─ Por que greedy funciona?
└─ Feynman: Explica o algoritmo

SESSÃO 2: Estruturas necessárias (2h)
├─ Priority queue (heap)
├─ Distâncias (array/hashmap)
├─ Predecessor (reconstruir path)
└─ Flashcards: Complexidades

SESSÃO 3: Pseudocódigo (2h)
├─ Passo a passo no papel
├─ Walkthrough com exemplo pequeno
└─ Identificar edge cases

SESSÃO 4: Implementação v1 (2h)
├─ Código direto do pseudocódigo
├─ Testar com exemplo pequeno
└─ Debug se necessário

SESSÃO 5: Implementação v2-5 (4h)
├─ Drill: Implementar 4x mais
├─ Sem olhar implementação anterior
├─ Cronometrar cada tentativa

SESSÃO 6: Testes e Otimização (2h)
├─ Testes unitários completos
├─ Testar com grafos grandes
├─ Otimizar se necessário

SESSÃO 7: Aplicação (2h)
├─ Resolver 3 problemas do LeetCode
├─ Usar em projeto real
└─ Medir performance

Total: 7 sessões (16h)
```

---

## 🔗 Links Relacionados

- [1-metalearning.md](../principios/1-metalearning.md) - Planejamento estratégico
- [benchmarking.md](benchmarking.md) - Avaliar recursos
- [mindmap.md](mindmap.md) - Visualizar estrutura
- [first-principles.md](first-principles.md) - Identificar fundamentos
- [indice.md](indice.md) - Índice completo

---

**Criado por**: @meta  
**Data**: 2026-02-18  
**Versão**: 1.0
