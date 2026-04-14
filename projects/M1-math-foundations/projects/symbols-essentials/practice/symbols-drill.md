# 📝 Drill: Símbolos Matemáticos

> Prática estruturada para dominar tradução de símbolos

**Instruções**:
- Não consulte o cheat sheet na primeira tentativa
- Anote o que errou para adicionar ao SRS
- Repita até acertar 100% sem consulta

---

## Parte 1: Tradução Simples (Símbolo → Português)

### 1.1 Quantificadores

**Traduza para português:**

1. `∀x ∈ A : x > 0`

   <details>
   <summary>Resposta</summary>
   "Para todo x que pertence ao conjunto A, x é maior que zero."
   </details>

2. `∃i : arr[i] = target`

   <details>
   <summary>Resposta</summary>
   "Existe um índice i tal que arr[i] é igual ao target."
   </details>

3. `∀x ∃y : x + y = 0`

   <details>
   <summary>Resposta</summary>
   "Para todo x, existe um y tal que x + y = 0."
   </details>

4. `∃x ∀y : x ≤ y`

   <details>
   <summary>Resposta</summary>
   "Existe um x tal que, para todo y, x é menor ou igual a y."
   (Ou: "Existe um elemento mínimo x")
   </details>

5. `¬∃x ∈ A : x < 0`

   <details>
   <summary>Resposta</summary>
   "Não existe x em A tal que x < 0."
   (Equivalente a: ∀x ∈ A : x ≥ 0)
   </details>

---

### 1.2 Conjuntos

**Traduza para português:**

6. `x ∈ A ∩ B`

   <details>
   <summary>Resposta</summary>
   "x pertence à interseção de A e B" (x está em A E em B)
   </details>

7. `A ⊂ B ∧ B ⊂ A`

   <details>
   <summary>Resposta</summary>
   "A está contido em B E B está contido em A."
   (Implica: A = B)
   </details>

8. `|A ∪ B| = |A| + |B| - |A ∩ B|`

   <details>
   <summary>Resposta</summary>
   "O tamanho da união de A e B é igual ao tamanho de A mais o tamanho de B menos o tamanho da interseção."
   </details>

9. `{x ∈ ℕ : x² < 10}`

   <details>
   <summary>Resposta</summary>
   "O conjunto de x em N (naturais) tal que x² < 10."
   (Resultado: {0, 1, 2, 3})
   </details>

10. `A \ B = ∅`

    <details>
    <summary>Resposta</summary>
    "A diferença de A e B é o conjunto vazio."
    (Todo elemento de A está em B, ou seja: A ⊂ B)
    </details>

---

### 1.3 Somatórios

**Expanda e calcule:**

11. `Σ(i=1→4) i`

    <details>
    <summary>Resposta</summary>
    1 + 2 + 3 + 4 = 10
    </details>

12. `Σ(i=1→3) i²`

    <details>
    <summary>Resposta</summary>
    1² + 2² + 3² = 1 + 4 + 9 = 14
    </details>

13. `Σ(i=0→n-1) 1`

    <details>
    <summary>Resposta</summary>
    1 + 1 + ... + 1 (n vezes) = n
    </details>

14. `Σ(i=1→n) Σ(j=1→n) 1`

    <details>
    <summary>Resposta</summary>
    n × n = n²
    (Soma n uns, n vezes)
    </details>

15. `Π(i=1→4) i`

    <details>
    <summary>Resposta</summary>
    1 × 2 × 3 × 4 = 4! = 24
    </details>

---

## Parte 2: Tradução Reversa (Português → Símbolo)

**Escreva em notação matemática:**

16. "Para todo número inteiro x, se x é par então x² é par."

    <details>
    <summary>Resposta</summary>
    `∀x ∈ ℤ : (x é par) ⇒ (x² é par)`
    
    Ou mais formal:
    `∀x ∈ ℤ : (∃k ∈ ℤ : x = 2k) ⇒ (∃k ∈ ℤ : x² = 2k)`
    </details>

17. "Existe um elemento no array que é maior que todos os outros."

    <details>
    <summary>Resposta</summary>
    `∃i ∈ [0, n) : ∀j ∈ [0, n) : arr[i] ≥ arr[j]`
    </details>

18. "A soma de todos os elementos de 1 até n é n(n+1)/2."

    <details>
    <summary>Resposta</summary>
    `Σ(i=1→n) i = n(n+1)/2`
    </details>

19. "O conjunto A não está contido em B."

    <details>
    <summary>Resposta</summary>
    `A ⊄ B`
    
    Ou equivalentemente:
    `∃x ∈ A : x ∉ B`
    </details>

20. "Para cada elemento do conjunto, existe sua raiz quadrada nos reais."

    <details>
    <summary>Resposta</summary>
    `∀x ∈ A : ∃y ∈ ℝ : y² = x`
    </details>

---

## Parte 3: Tradução com Código

**Traduza para pseudocódigo ou código real:**

21. `∀x ∈ arr : x > 0`

    <details>
    <summary>Resposta</summary>

        # Todos os elementos são positivos
        all(x > 0 for x in arr)
        
        # Ou:
        for x in arr:
            if x <= 0:
                return False
        return True

    </details>

22. `∃i ∈ [0, n) : arr[i] = target`

    <details>
    <summary>Resposta</summary>

        # Existe elemento igual ao target
        target in arr
        
        # Ou:
        for i in range(n):
            if arr[i] == target:
                return True
        return False

    </details>

23. `Σ(i=0→n-1) arr[i]`

    <details>
    <summary>Resposta</summary>

        # Soma de todos os elementos
        sum(arr)
        
        # Ou:
        total = 0
        for i in range(n):
            total += arr[i]
        return total

    </details>

24. `∃i,j ∈ [0, n) : i ≠ j ∧ arr[i] = arr[j]`

    <details>
    <summary>Resposta</summary>

        # Existe duplicata no array
        for i in range(n):
            for j in range(n):
                if i != j and arr[i] == arr[j]:
                    return True
        return False
        
        # Ou mais eficiente:
        len(arr) != len(set(arr))

    </details>

25. `∀i ∈ [0, n-1) : arr[i] ≤ arr[i+1]`

    <details>
    <summary>Resposta</summary>

        # Array está ordenado (não decrescente)
        all(arr[i] <= arr[i+1] for i in range(n-1))
        
        # Ou:
        for i in range(n-1):
            if arr[i] > arr[i+1]:
                return False
        return True

    </details>

---

## Parte 4: Leitura de Análise de Algoritmos

**Interprete as seguintes análises:**

26. "O algoritmo percorre `∀i ∈ [0, n)` e para cada i, percorre `∀j ∈ [0, n)`."

    <details>
    <summary>Resposta</summary>
    Dois loops aninhados, cada um percorrendo n elementos.
    Complexidade: O(n²)
    </details>

27. "`Σ(i=0→n) Σ(j=0→i) 1 = Σ(i=0→n) (i+1) = O(n²)`"

    <details>
    <summary>Resposta</summary>
    Loop externo roda n+1 vezes.
    Loop interno roda i+1 vezes (depende de i).
    Total: 1 + 2 + 3 + ... + (n+1) = (n+1)(n+2)/2 = O(n²)
    </details>

28. "O algoritmo busca binária divide o espaço de busca por 2 a cada iteração: `O(log n)`."

    <details>
    <summary>Resposta</summary>
    A cada passo, o problema fica metade do tamanho anterior.
    Número de passos até problema ter tamanho 1:
    n → n/2 → n/4 → ... → 1
    Isso requer log₂(n) passos.
    </details>

29. "`∃i ∈ [0, n) : arr[i] = target` requer O(n) no pior caso."

    <details>
    <summary>Resposta</summary>
    Busca linear: no pior caso, percorre todo o array.
    Se o target não existe ou está na última posição,
    verifica todos os n elementos.
    </details>

30. "Gerar todas as permutações de n elementos: `O(n!)` pois `P(n,n) = n!`."

    <details>
    <summary>Resposta</summary>
    Existem n! permutações possíveis de n elementos.
    Se o algoritmo gera todas, precisa fazer n! operações.
    Isso é intratável para n grande (n=10 → 3.6M permutações).
    </details>

---

## Parte 5: Exercícios Mistos

31. Escreva: "O conjunto A tem mais elementos que B."

    <details>
    <summary>Resposta</summary>
    `|A| > |B|`
    </details>

32. Escreva: "Para todo x no array, se x é positivo então seu dobro também é."

    <details>
    <summary>Resposta</summary>
    `∀x ∈ arr : (x > 0) ⇒ (2x > 0)`
    </details>

33. Calcule: `Σ(k=1→5) k(k-1)`

    <details>
    <summary>Resposta</summary>
    k=1: 1×0 = 0
    k=2: 2×1 = 2
    k=3: 3×2 = 6
    k=4: 4×3 = 12
    k=5: 5×4 = 20
    Total: 0 + 2 + 6 + 12 + 20 = 40
    </details>

34. Traduza: `∀ε > 0 ∃δ > 0 : |x-a| < δ ⇒ |f(x)-L| < ε`

    <details>
    <summary>Resposta</summary>
    "Para todo épsilon maior que zero, existe um delta maior que zero tal que, se a distância entre x e a for menor que delta, então a distância entre f(x) e L é menor que épsilon."
    
    (Esta é a definição formal de limite!)
    </details>

35. Escreva: "A interseção de A com o vazio é vazia."

    <details>
    <summary>Resposta</summary>
    `A ∩ ∅ = ∅`
    </details>

---

## ✅ Checklist de Domínio

Após completar este drill, você deve conseguir:

- [ ] Traduzir ∀ e ∃ sem hesitar
- [ ] Explicar a diferença entre ∀∃ e ∃∀
- [ ] Expandir somatórios simples
- [ ] Converter entre português e notação matemática
- [ ] Ler análise de algoritmo com símbolos
- [ ] Reconhecer padrões comuns (loops = Σ, busca = ∃, verificação = ∀)

---

## 🔄 Próximos Passos

1. **Errou algo?** → Adicione ao SRS com `/ul-study-memorize`
2. **Acertou tudo?** → Use `/ul-study-feynman "símbolos"` para validar compreensão
3. **Quer mais prática?** → Repita este drill amanhã

---

*Baseado em: Rosen Cap 1, MIT 6.042J, Khan Academy*
