# 🎴 SRS Cards: Símbolos Matemáticos

> Flashcards para memorização espaçada

**Formato**: Pergunta → Resposta (use com Anki, Mochi, ou similar)

---

## 📦 Deck: Símbolos Básicos

### Card 1
```
Frente: ∀
Verso: Para todo / Cada elemento sem exceção
Exemplo: ∀x ∈ A : P(x) = "Para todo x em A, P(x) é verdadeiro"
```

### Card 2
```
Frente: ∃
Verso: Existe / Pelo menos um
Exemplo: ∃x ∈ A : P(x) = "Existe x em A tal que P(x) é verdadeiro"
```

### Card 3
```
Frente: ∈
Verso: Pertence a / Faz parte de
Exemplo: 3 ∈ {1,2,3} ✓
```

### Card 4
```
Frente: ⊂
Verso: Está contido em / Subconjunto de
Exemplo: {1,2} ⊂ {1,2,3}
```

### Card 5
```
Frente: ∩
Verso: Interseção / Elementos em comum
Exemplo: {1,2} ∩ {2,3} = {2}
```

### Card 6
```
Frente: ∪
Verso: União / Junta tudo (sem repetir)
Exemplo: {1,2} ∪ {2,3} = {1,2,3}
```

### Card 7
```
Frente: Σ
Verso: Somatório / Soma de todos
Exemplo: Σ(i=1→n) i = 1 + 2 + ... + n
```

### Card 8
```
Frente: ⇒
Verso: Implica / Se... então
Exemplo: x > 5 ⇒ x > 3
```

### Card 9
```
Frente: ⇔
Verso: Equivalente / Se e somente se
Exemplo: x² = 4 ⇔ x = 2 ∨ x = -2
```

### Card 10
```
Frente: |A|
Verso: Cardinalidade / Número de elementos
Exemplo: |{a,b,c}| = 3
```

---

## 🔄 Deck: Quantificadores Avançados

### Card 11
```
Frente: ∀x ∃y : P(x,y)
Verso: Para cada x, existe um y (pode ser diferente para cada x)
Exemplo: ∀x ∃y : x + y = 0 (y = -x, depende de x)
```

### Card 12
```
Frente: ∃x ∀y : P(x,y)
Verso: Existe um x que funciona para TODOS os y
Exemplo: ∃x ∀y : x ≤ y (x é o mínimo)
```

### Card 13
```
Frente: ¬∃x : P(x)
Verso: Não existe x tal que P(x)
Equivalente a: ∀x : ¬P(x)
```

### Card 14
```
Frente: ¬∀x : P(x)
Verso: Não é verdade que todo x satisfaz P
Equivalente a: ∃x : ¬P(x)
```

---

## 📐 Deck: Somatórios

### Card 15
```
Frente: Σ(i=1→n) i = ?
Verso: n(n+1)/2
Derivação: 1 + 2 + ... + n
```

### Card 16
```
Frente: Σ(i=1→n) 1 = ?
Verso: n
Explicação: Soma 1, n vezes
```

### Card 17
```
Frente: Σ(i=0→n-1) Σ(j=0→n-1) 1 = ?
Verso: n²
Explicação: Soma n uns, n vezes (matriz n×n)
```

### Card 18
```
Frente: Σ(i=1→n) Σ(j=1→i) 1 = ?
Verso: n(n+1)/2 = O(n²)
Explicação: 1 + 2 + 3 + ... + n
```

### Card 19
```
Frente: Π(i=1→n) i = ?
Verso: n!
Explicação: 1 × 2 × ... × n
```

---

## 🧮 Deck: Combinatória

### Card 20
```
Frente: n!
Verso: n × (n-1) × ... × 1
Exemplos: 5! = 120, 0! = 1
```

### Card 21
```
Frente: C(n,k) = ?
Verso: n! / (k! × (n-k)!)
Significado: Escolher k de n (ordem não importa)
```

### Card 22
```
Frente: P(n,k) = ?
Verso: n! / (n-k)!
Significado: Permutar k de n (ordem importa)
```

### Card 23
```
Frente: C(n,k) = C(n, n-k)
Verso: Escolher k é igual a descartar n-k
Exemplo: C(5,2) = C(5,3) = 10
```

---

## 🎯 Deck: Tradução Código ↔ Matemática

### Card 24
```
Frente: ∀x ∈ arr : x > 0
Verso: 
Português: "Todo elemento do array é positivo"
Código: all(x > 0 for x in arr)
```

### Card 25
```
Frente: ∃x ∈ arr : x = target
Verso:
Português: "Existe elemento igual ao target"
Código: target in arr
```

### Card 26
```
Frente: for i in range(n): for j in range(n): ...
Verso: Σ(i=0→n-1) Σ(j=0→n-1) 1 = O(n²)
```

### Card 27
```
Frente: while n > 0: n = n // 2
Verso: O(log n)
Explicação: Divide por 2 a cada iteração
```

### Card 28
```
Frente: ∀i : arr[i] ≤ arr[i+1]
Verso:
Português: "Array está ordenado"
Código: all(arr[i] <= arr[i+1] for i in range(n-1))
```

---

## 📊 Deck: Probabilidade

### Card 29
```
Frente: P(A)
Verso: Probabilidade do evento A
Fórmula: casos favoráveis / casos possíveis
```

### Card 30
```
Frente: P(A|B)
Verso: Probabilidade de A dado B (condicional)
Fórmula: P(A∩B) / P(B)
```

### Card 31
```
Frente: P(A∩B) quando A e B independentes
Verso: P(A) × P(B)
Exemplo: P(moeda=H, dado=6) = 0.5 × 1/6 = 1/12
```

### Card 32
```
Frente: E[X]
Verso: Valor esperado (média ponderada)
Fórmula: Σ x × P(x)
Exemplo: E[dado] = 3.5
```

---

## 🔗 Deck: Big O

### Card 33
```
Frente: O(1)
Verso: Constante
Exemplo: Acesso por índice em array
```

### Card 34
```
Frente: O(log n)
Verso: Logarítmico
Exemplo: Busca binária
```

### Card 35
```
Frente: O(n)
Verso: Linear
Exemplo: Busca linear, percorrer array
```

### Card 36
```
Frente: O(n log n)
Verso: Linearítmico
Exemplo: Merge sort, quick sort (caso médio)
```

### Card 37
```
Frente: O(n²)
Verso: Quadrático
Exemplo: Bubble sort, loops aninhados
```

### Card 38
```
Frente: O(2ⁿ)
Verso: Exponencial
Exemplo: Subconjuntos (powerset)
```

### Card 39
```
Frente: O(n!)
Verso: Fatorial
Exemplo: Permutações, traveling salesman (força bruta)
```

---

## 🎨 Deck: Símbolos Especiais

### Card 40
```
Frente: ⌊x⌋
Verso: Piso / Arredonda para baixo
Exemplo: ⌊3.7⌋ = 3
```

### Card 41
```
Frente: ⌈x⌉
Verso: Teto / Arredonda para cima
Exemplo: ⌈3.2⌉ = 4
```

### Card 42
```
Frente: a mod b
Verso: Resto da divisão de a por b
Exemplo: 7 mod 3 = 1
```

### Card 43
```
Frente: a | b
Verso: a divide b
Exemplo: 2 | 6 ✓
```

### Card 44
```
Frente: ∅
Verso: Conjunto vazio
Propriedade: |∅| = 0
```

### Card 45
```
Frente: ℕ, ℤ, ℝ
Verso:
ℕ = Naturais {0, 1, 2, ...}
ℤ = Inteiros {..., -1, 0, 1, ...}
ℝ = Reais
```

---

## 📋 Como Usar

### Importar para Anki

1. Crie um deck "M1-Símbolos"
2. Adicione cards copiando "Frente" e "Verso"
3. Configure revisões diárias

### Importar para Mochi/Outros

1. Use formato CSV: `frente,verso`
2. Importe para o app de sua escolha

### Revisão Diária

```
Novos cards/dia: 5-10
Revisões: conforme o app sugerir
Meta: 100% de recall em 2 semanas
```

---

## ✅ Checklist

- [ ] Importei os cards para meu app SRS
- [ ] Configurei revisão diária
- [ ] Completei primeira revisão
- [ ] Adicionei cards dos erros do drill

---

*Total: 45 cards*
*Tempo estimado de revisão diária: 5-10 min*
