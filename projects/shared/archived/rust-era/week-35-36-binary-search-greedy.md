# 📅 Semana 35-36: Binary Search & Greedy Algorithms 🎯

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar binary search e suas variações (lower_bound, upper_bound)
- Reconhecer quando um problema pode usar binary search
- Entender o paradigma greedy e quando aplicá-lo
- Provar corretude de algoritmos greedy
- Resolver problemas clássicos com greedy

---

## ❓ Perguntas Guia

### Binary Search - Fundamentos
1. Por que binary search requer array ordenado?
2. Qual a complexidade de binary search? Por quê?
3. Qual a relação entre binary search e logaritmos?
4. Como implementar binary search iterativo?
5. Como implementar binary search recursivo?

### Binary Search - Variações
6. O que é lower_bound? Como implementar?
   - Encontrar primeiro elemento >= target
7. O que é upper_bound? Como implementar?
   - Encontrar primeiro elemento > target
8. Como encontrar o primeiro/último índice de um elemento?
9. Como usar binary search para encontrar "ponto de rotação"?
10. O que é "binary search on answer"?
    - Quando o espaço de busca não é um array
11. Como usar binary search em funções monótonas?

### Binary Search - Armadilhas
12. Por que `(low + high) / 2` pode dar overflow?
13. Quando usar `low < high` vs `low <= high`?
14. Como evitar infinite loops em binary search?
15. O que é off-by-one error em binary search?

### Greedy - Fundamentos
16. O que é um algoritmo greedy?
17. O que significa "escolha localmente ótima"?
18. Quando greedy funciona?
19. Quando greedy NÃO funciona?
20. O que é "greedy choice property"?
21. O que é "optimal substructure"?

### Greedy - Provas
22. Como provar que greedy é correto?
    - "Greedy stays ahead"
    - "Exchange argument"
23. Como provar que greedy não funciona para um problema?
24. Qual a diferença entre greedy e dynamic programming?

### Greedy - Problemas Clássicos
25. Activity Selection: Como funciona? Qual o critério de ordenação?
26. Fractional Knapsack: Por que greedy funciona? E no 0/1 Knapsack?
27. Huffman Coding: Qual é a ideia greedy?
28. Interval Scheduling: Como maximizar intervalos não-sobrepostos?
29. Jump Game: Greedy vs DP?
30. Coin Change: Quando greedy funciona? Quando não funciona?

---

## 📚 Recursos

### Leitura
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| CLRS | Chapter 16 - Greedy Algorithms | Teoria e provas |
| Grokking Algorithms | Greedy chapter | Introdução acessível |
| Algorithm Design Manual | Binary Search | Variações |

### Prática
| Recurso | Propósito |
|---------|-----------|
| LeetCode Binary Search tag | Problemas específicos |
| LeetCode Greedy tag | Problemas específicos |
| NeetCode | Explicações em vídeo |

---

## 📋 Entregas

### Semana 35: Binary Search

**Dia 1: Fundamentos**
- [ ] Responder perguntas 1-5
- [ ] Implementar binary search iterativo
- [ ] Implementar binary search recursivo
- [ ] Traçar execução para array de 10 elementos

**Dia 2: Variações**
- [ ] Responder perguntas 6-9
- [ ] Implementar lower_bound
- [ ] Implementar upper_bound
- [ ] Problema: First and Last Position (LeetCode 34)

**Dia 3: Binary Search Avançado**
- [ ] Responder perguntas 10-11
- [ ] Problema: Search in Rotated Array (LeetCode 33)
- [ ] Problema: Find Minimum in Rotated Array (LeetCode 153)
- [ ] Problema: Peak Element (LeetCode 162)

**Dia 4: Armadilhas e Prática**
- [ ] Responder perguntas 12-15
- [ ] Refatorar suas implementações para evitar bugs
- [ ] Problema: Sqrt(x) (LeetCode 69)
- [ ] Problema: Search a 2D Matrix (LeetCode 74)

**Dia 5: Consolidação**
- [ ] Criar template de binary search
- [ ] 3 variações documentadas
- [ ] Cards SRS para patterns

### Semana 36: Greedy Algorithms

**Dia 1: Fundamentos Greedy**
- [ ] Responder perguntas 16-21
- [ ] Estudar: O que torna um problema "greedy"?
- [ ] Exemplo: Activity Selection
- [ ] Provar corretude com "greedy stays ahead"

**Dia 2: Provas e Contraexemplos**
- [ ] Responder perguntas 22-24
- [ ] Provar: Fractional Knapsack
- [ ] Mostrar: Por que 0/1 Knapsack não é greedy
- [ ] Mostrar: Por que Coin Change nem sempre é greedy

**Dia 3: Problemas Clássicos**
- [ ] Responder perguntas 25-27
- [ ] Implementar: Activity Selection
- [ ] Implementar: Fractional Knapsack
- [ ] Estudar: Huffman Coding (conceitual)

**Dia 4: Mais Problemas**
- [ ] Responder perguntas 28-30
- [ ] Problema: Jump Game (LeetCode 55)
- [ ] Problema: Jump Game II (LeetCode 45)
- [ ] Problema: Gas Station (LeetCode 134)
- [ ] Problema: Candy (LeetCode 135)

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Criar decision tree: Greedy vs DP
- [ ] Cards SRS para problemas greedy
- [ ] Resumo: padrões de problemas greedy

---

## 🎯 Meta de LeetCode

| Semana | Problemas | Dificuldade | Tópico |
|--------|-----------|-------------|--------|
| 35 | 5-6 | Easy/Med | Binary Search |
| 36 | 4-5 | Med/Hard | Greedy |

**Binary Search:**
- [ ] Binary Search (LeetCode 704)
- [ ] First Bad Version (LeetCode 278)
- [ ] Find First and Last Position (LeetCode 34)
- [ ] Search in Rotated Array (LeetCode 33)
- [ ] Find Minimum in Rotated (LeetCode 153)
- [ ] Search a 2D Matrix (LeetCode 74)

**Greedy:**
- [ ] Jump Game (LeetCode 55)
- [ ] Jump Game II (LeetCode 45)
- [ ] Gas Station (LeetCode 134)
- [ ] Candy (LeetCode 135)
- [ ] Task Scheduler (LeetCode 621)

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar binary search sem bugs em 5 minutos
2. [ ] Implementar lower_bound e upper_bound
3. [ ] Reconhecer quando usar "binary search on answer"
4. [ ] Explicar por que greedy funciona para um problema
5. [ ] Identificar quando greedy não funciona
6. [ ] Resolver Activity Selection e explicar a prova

### Templates para Memorizar

```rust
// Binary Search - Template 1 (elemento exato)
fn binary_search(arr: &[i32], target: i32) -> Option<usize> {
    let (mut lo, mut hi) = (0, arr.len());
    while lo < hi {
        let mid = lo + (hi - lo) / 2;
        match arr[mid].cmp(&target) {
            Ordering::Less => lo = mid + 1,
            Ordering::Greater => hi = mid,
            Ordering::Equal => return Some(mid),
        }
    }
    None
}

// Lower Bound - Primeiro elemento >= target
fn lower_bound(arr: &[i32], target: i32) -> usize {
    let (mut lo, mut hi) = (0, arr.len());
    while lo < hi {
        let mid = lo + (hi - lo) / 2;
        if arr[mid] < target {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    lo
}

// Greedy Pattern
// 1. Ordenar por critério
// 2. Iterar e fazer escolha localmente ótima
// 3. Nunca voltar atrás
```

### Red flags (precisa revisar):
- Bugs de overflow em binary search
- Não sabe quando binary search é aplicável
- Não consegue provar corretude de greedy
- Confunde greedy com DP

---

## 🔄 Reflexão

### Binary Search
_Quais são os "truques" para implementar sem bugs?_

### Greedy
_Como você decide se um problema é greedy ou DP?_

### Conexão com Sorting
_Por que binary search e greedy frequentemente precisam de ordenação?_

### Intuição
_Desenvolva seu "sensor" para identificar problemas greedy_

---

## ⏭️ Próximo

**Semana 37-38**: Recursão
- Como a call stack funciona?
- Quando usar recursão vs iteração?
- Como converter recursão em iteração?
