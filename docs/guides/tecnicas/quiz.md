# 📝 Guia Completo: Quiz (Questionários)

> **Técnica de Retrieval Practice**

---

## 📋 Índice

- [O que é Quiz](#o-que-e-quiz)
- [Quando Usar](#quando-usar)
- [Como Criar](#como-criar)
- [Tipos de Questões](#tipos-de-questoes)
- [Exemplos](#exemplos-por-tipo)

---

## 🎯 O que é Quiz? 
**Quiz** é uma técnica de teste ativo onde você responde perguntas sobre o conteúdo estudado sem consultar material, forçando o cérebro a recuperar informações da memória.

### Diferença de Releitura
```
RELEITURA (passivo):
└─ Olha o material → Cérebro reconhece → "Acho que sei"

QUIZ (ativo):
└─ Pergunta em branco → Cérebro recupera → "Sei ou não sei"
```

### 🔗 Relação com Dra. Barbara Oakley (A Mind for Numbers)
Esta técnica implementa o **Test Effect** - prática de teste ativo fortalece conexões neurais mais que releitura.

### 🔗 Princípios Relacionados

**Implementa:**
- **[5-retrieval.md](../principios/5-retrieval.md)** - Princípio #5: Retrieval

**Complementa:**
- [feynman.md](feynman.md) - Explicar conceitos
- [flashcards.md](flashcards.md) - Revisão espaçada

---

## 🧠 Quando Usar

### ✅ USE para:
- Aquecimento antes de estudar (retrieval do dia anterior)
- Verificar compreensão após estudar
- Preparação para provas
- Identificar gaps de conhecimento

### ❌ NÃO USE para:
- Aprender conteúdo novo (estude primeiro!)

---

## 🎯 Framework 3D

### Onde Quiz se Encaixa

**Primariamente para Conceitos e Fatos:**

| Dimensão | Aplicação |
|----------|-----------|
| **Conceitos** | ✅ Testar entendimento profundo |
| **Fatos** | ✅ Verificar retenção de informações |
| **Procedimentos** | ⚠️ Teste prático (não quiz teórico) |

---

## 🛠️ Como Criar

### Passo 1: Definir Escopo
```
O que testar?
├─ Conceitos fundamentais (40%)
├─ Fatos específicos (30%)
└─ Aplicação prática (30%)
```

### Passo 2: Criar Perguntas
**Quantidade ideal:** 3-5 perguntas por sessão

**Timing:**
- 3 segundos para fatos simples
- 30 segundos para conceitos
- 2-3 minutos para problemas

### Passo 3: Auto-correção Honesta
```
✅ Acertou? → Revisar daqui a 3-7 dias
❌ Errou? → Revisar amanhã + reestudar conceito
```

---

## 📝 Tipos de Questões

### 1. Múltipla Escolha
```
Qual a complexidade do binary search?
A) O(1)      B) O(log n)     
C) O(n)      D) O(n²)

Resposta: B
```

### 2. Verdadeiro/Falso
```
"Rust usa garbage collector."
Resposta: Falso (usa ownership)
```

### 3. Preenchimento
```
A função _____ em Rust aloca memória no heap.
Resposta: Box::new()
```

### 4. Explicação Curta
```
"Explique ownership em 2 frases."
Resposta: Sistema onde cada valor tem um dono único.
Quando o dono sai de escopo, o valor é liberado.
```

---

## 💡 Exemplos por Tipo

### Para Conceitos (Rust)
```
1. O que é borrowing?
2. Quando usar &mut vs &?
3. Explique lifetimes com uma analogia.
```

### Para Fatos (Estruturas de Dados)
```
1. Qual a complexidade de inserção em HashMap? (O(1))
2. O que é pior caso de QuickSort? (O(n²))
3. Quantos filhos pode ter um nó em árvore binária? (0-2)
```

### Para Procedimentos (Algoritmos)
```
1. Escreva o passo a passo do binary search.
2. Como detectar ciclo em linked list?
3. Implemente fibonacci recursivo.
```

---

## 🔄 Integração com Estudo

### Workflow Diário
```
09:00 - Quiz (10 min) → Conteúdo de ontem
09:10 - Estudo novo  → Leitura/Prática
10:00 - Quiz (5 min)  → O que acabou de aprender
```

### Via @tutor
```bash
@tutor #quiz 3 perguntas sobre ownership
```

---

**Relacionado:** [feynman.md](feynman.md) - Para explicar conceitos
**Relacionado:** [flashcards.md](flashcards.md) - Para revisão espaçada
