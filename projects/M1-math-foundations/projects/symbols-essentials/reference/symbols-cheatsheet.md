# 📋 Cheat Sheet: Símbolos Matemáticos

> Consulta rápida durante estudo de algoritmos

---

## 🔤 Lógica e Quantificadores

| Símbolo | Nome | Significado | Exemplo |
|---------|------|-------------|---------|
| **∧** | E (and) | ambas verdadeiras | `x > 0 ∧ x < 10` |
| **∨** | Ou (or) | pelo menos uma verdadeira | `x = 0 ∨ x = 1` |
| **¬** | Não (not) | negação | `¬(x > 5)` = x ≤ 5 |
| **⇒** | Implica | se... então | `x > 5 ⇒ x > 3` |
| **⇔** | Equivalente | se e somente se | `x² = 4 ⇔ x = 2 ∨ x = -2` |
| **∀** | Para todo | cada elemento sem exceção | `∀x ∈ ℕ : x ≥ 0` |
| **∃** | Existe | pelo menos um | `∃x : x² = 4` |

### Padrões de Leitura

```
∀x ∈ A : P(x)     → "Para todo x em A, P(x) é verdadeiro"
∃x ∈ A : P(x)     → "Existe x em A tal que P(x) é verdadeiro"
∀x ∃y : P(x,y)    → "Para cada x, existe um y..."
∃x ∀y : P(x,y)    → "Existe um x que funciona para todo y"
```

**⚠️ Ordem importa!** `∀x ∃y` ≠ `∃y ∀x`

---

## 📦 Conjuntos

| Símbolo | Nome | Significado | Exemplo |
|---------|------|-------------|---------|
| **∈** | Pertence | "faz parte de" | `3 ∈ {1,2,3}` ✓ |
| **∉** | Não pertence | "não faz parte de" | `5 ∉ {1,2,3}` ✓ |
| **⊂** | Subconjunto | "está contido em" | `{1,2} ⊂ {1,2,3}` |
| **⊄** | Não subconjunto | "não está contido" | `{1,4} ⊄ {1,2,3}` |
| **∩** | Interseção | "elementos em comum" | `{1,2} ∩ {2,3} = {2}` |
| **∪** | União | "junta tudo (sem repetir)" | `{1,2} ∪ {2,3} = {1,2,3}` |
| **\\** | Diferença | "está em A mas não em B" | `{1,2,3} \ {2} = {1,3}` |
| **∅** | Vazio | "conjunto sem elementos" | `{ }` ou `∅` |
| **\|A\|** | Cardinalidade | "número de elementos" | `\|{a,b,c}\| = 3` |

### Notações de Conjunto

```
{x ∈ A : P(x)}     → "x em A tal que P(x)" (set comprehension)
{x : P(x)}         → "todos x que satisfazem P"
A = {1, 2, 3}      → "A é o conjunto com elementos 1, 2, 3"
ℕ = {0, 1, 2, ...} → "Números naturais"
ℤ = {..., -1, 0, 1, ...} → "Inteiros"
ℝ                   → "Reais"
```

---

## ➕ Aritmética e Somatórios

| Símbolo | Nome | Significado | Exemplo |
|---------|------|-------------|---------|
| **Σ** | Somatório | soma de todos | `Σ(i=1→n) i = n(n+1)/2` |
| **Π** | Produtório | produto de todos | `Π(i=1→n) i = n!` |
| **n!** | Fatorial | `n × (n-1) × ... × 1` | `5! = 120` |
| **⌊x⌋** | Piso | "arredonda para baixo" | `⌊3.7⌋ = 3` |
| **⌈x⌉** | Teto | "arredonda para cima" | `⌈3.2⌉ = 4` |
| **a mod b** | Módulo | resto da divisão | `7 mod 3 = 1` |
| **a \| b** | Divide | "a divide b" | `2 \| 6` ✓ |
| **a ∤ b** | Não divide | "a não divide b" | `2 ∤ 5` ✓ |

### Somatório Expandido

```
Σ(i=1→n) i = 1 + 2 + 3 + ... + n

Σ(i=1→n) i² = 1² + 2² + 3² + ... + n²

Σ(i=0→n-1) Σ(j=0→m-1) a[i][j] = soma de matriz
```

---

## 📊 Combinatória e Probabilidade

| Símbolo | Nome | Fórmula | Exemplo |
|---------|------|---------|---------|
| **P(n,k)** | Permutação | `n!/(n-k)!` | P(5,3) = 60 |
| **C(n,k)** | Combinação | `n!/(k!(n-k)!)` | C(5,3) = 10 |
| **(n k)** | Combinação (alt) | mesmo que C(n,k) | `(5 3) = 10` |
| **P(A)** | Probabilidade | `casos favoráveis / casos possíveis` | P(dado=6) = 1/6 |
| **P(A\|B)** | Prob. Condicional | "prob de A dado B" | P(chuva\|nuvens) |
| **P(A∩B)** | Interseção | "A e B acontecem" | P(A) × P(B) se independentes |
| **P(A∪B)** | União | "A ou B acontecem" | P(A) + P(B) - P(A∩B) |
| **E[X]** | Valor esperado | média ponderada | E[dado] = 3.5 |

### Fórmulas Chave

```
C(n,k) = C(n, n-k)          → "escolher k é igual a descartar n-k"
C(n,0) = C(n,n) = 1         → "única forma de escolher 0 ou todos"
n! = n × (n-1)!             → "definição recursiva"
0! = 1                       → "convenção (produto vazio)"
```

---

## 🔄 Relações e Funções

| Símbolo | Nome | Significado |
|---------|------|-------------|
| **f: A → B** | Função | "f mapeia A em B" |
| **f(x) = y** | Imagem | "f aplicada a x resulta y" |
| **f⁻¹** | Inversa | "função inversa de f" |
| **f ∘ g** | Composição | "f depois de g" |
| **x R y** | Relação | "x está relacionado com y por R" |

---

## 📐 Desigualdades

| Símbolo | Nome | Exemplo |
|---------|------|---------|
| **<** | Menor que | `x < 5` |
| **≤** | Menor ou igual | `x ≤ 5` |
| **>** | Maior que | `x > 3` |
| **≥** | Maior ou igual | `x ≥ 3` |
| **≠** | Diferente | `x ≠ 0` |

---

## 🧮 Big O Notation

| Notação | Nome | Crescimento |
|---------|------|-------------|
| **O(1)** | Constante | não cresce |
| **O(log n)** | Logarítmico | cresce devagar |
| **O(n)** | Linear | proporcional |
| **O(n log n)** | Linearítmico | quase linear |
| **O(n²)** | Quadrático | cresce rápido |
| **O(2ⁿ)** | Exponencial | cresce muito rápido |
| **O(n!)** | Fatorial | cresce absurdamente |

---

## 🎯 Quick Reference: Tradução Imediata

```
∀ → "para todo" / "cada"
∃ → "existe" / "pelo menos um"
∈ → "pertence a" / "em"
⊂ → "está contido em" / "subconjunto de"
∩ → "interseção" / "e (conjuntos)"
∪ → "união" / "ou (conjuntos)"
Σ → "soma de"
⇒ → "implica" / "se... então"
⇔ → "se e somente se" / "equivalente"
```

---

## 📚 Fontes

- Rosen, *Discrete Mathematics and Its Applications*, Cap 1-2
- MIT 6.042J, *Mathematics for Computer Science*
- Khan Academy, *Algebra* e *Precalculus*
