# 📅 Semana 4: Somatórios & Indução

## 🎯 Objetivo
Ao final desta semana, você será capaz de:
- Ler e calcular somatórios
- Traduzir loops para somatórios e vice-versa
- Entender o princípio da indução matemática
- Conectar indução com recursão

---

## ❓ Perguntas Guia

### Somatórios
1. O que significa Σᵢ₌₁ⁿ i?
   - Como você escreveria isso como loop?

2. Quais são os somatórios clássicos?
   - Σᵢ₌₁ⁿ i = ? (soma de 1 até n)
   - Σᵢ₌₁ⁿ i² = ? (soma de quadrados)
   - Σᵢ₌₀ⁿ 2ⁱ = ? (soma de potências de 2)
   - Σᵢ₌₁ⁿ 1 = ? (soma de constantes)

3. Quais as propriedades de somatórios?
   - Σ(a + b) = ?
   - Σ(c × a) = ?

4. Como analisar complexidade de loops aninhados?
   - Loop simples: Σᵢ₌₁ⁿ 1
   - Loop duplo: Σᵢ₌₁ⁿ Σⱼ₌₁ⁿ 1

5. O que é uma série geométrica?
   - Σᵢ₌₀ⁿ rⁱ = ?

### Indução Matemática
6. O que é indução matemática?
   - Passo base
   - Passo indutivo
   - Hipótese de indução

7. Como provar por indução que Σᵢ₌₁ⁿ i = n(n+1)/2?

8. Por que indução funciona? (intuição)

9. O que é indução forte?

### Conexão com Recursão
10. Como indução se relaciona com recursão?

11. Se uma função recursiva tem:
    - Caso base
    - Caso recursivo que se aproxima do base
    Por que isso garante que termina?

12. Como provar que um algoritmo recursivo está correto?

---

## 📚 Recursos

| Recurso | Seção |
|---------|-------|
| Khan Academy | "Sequences, series, and induction" |
| Rosen (livro) | Cap 5.1-5.2 (Induction) |
| MIT OCW 6.042 | Lectures sobre Induction |
| 3Blue1Brown | "Mathematical induction" (se houver) |

---

## 📋 Entregas

### Dia 1: Somatórios Básicos
- [ ] Responder perguntas 1-2
- [ ] Calcular 5 somatórios manualmente
- [ ] Traduzir 5 loops para notação de somatório

### Dia 2: Somatórios e Loops
- [ ] Responder perguntas 3-4
- [ ] Analisar complexidade de 5 loops usando somatórios
- [ ] Traduzir 5 somatórios para loops

### Dia 3: Séries Importantes
- [ ] Responder pergunta 5
- [ ] Memorizar somatórios clássicos
- [ ] Provar que Σᵢ₌₀ⁿ 2ⁱ = 2ⁿ⁺¹ - 1 (verificar com exemplos)

### Dia 4: Indução
- [ ] Responder perguntas 6-9
- [ ] Fazer 3 provas por indução simples
- [ ] Explicar indução em suas palavras

### Dia 5: Conexão com Recursão
- [ ] Responder perguntas 10-12
- [ ] Analisar 3 funções recursivas: por que terminam?
- [ ] Criar cards SRS

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Ler somatório e traduzir para loop
2. [ ] Olhar loop e escrever como somatório
3. [ ] Usar somatórios clássicos para analisar complexidade
4. [ ] Explicar os passos de uma prova por indução
5. [ ] Conectar indução com recursão

### Teste Prático

**Somatórios:**
```
Σᵢ₌₁¹⁰⁰ i = ?
Σᵢ₌₁ⁿ Σⱼ₌₁ⁿ 1 = ?
```

**Loop para somatório:**
```
for i in 1..=n {
    for j in 1..=i {
        // operação O(1)
    }
}
```
Qual a complexidade?

**Indução:**
Prove que 1 + 2 + 4 + 8 + ... + 2ⁿ = 2ⁿ⁺¹ - 1

---

## 🔗 Conexão com CS

| Matemática | Programação |
|------------|-------------|
| Σᵢ₌₁ⁿ | for i in 1..=n |
| Σᵢ₌₁ⁿ Σⱼ₌₁ⁿ | loops aninhados → O(n²) |
| Σᵢ₌₁ⁿ i = n(n+1)/2 | 1+2+...+n cresce quadraticamente |
| Indução | Provar corretude de recursão |
| Caso base | Condição de parada |
| Hipótese indutiva | Assumir recursão funciona para n-1 |

### Somatórios Úteis para Big O (MEMORIZAR)
```
Σᵢ₌₁ⁿ 1 = n                    → O(n)
Σᵢ₌₁ⁿ i = n(n+1)/2 ≈ n²/2     → O(n²)
Σᵢ₌₁ⁿ i² = n(n+1)(2n+1)/6     → O(n³)
Σᵢ₌₀ⁿ 2ⁱ = 2ⁿ⁺¹ - 1          → O(2ⁿ)
Σᵢ₌₀ⁿ rⁱ = (rⁿ⁺¹-1)/(r-1)    → depende de r
```

---

## 🔄 Reflexão

### Conexão somatórios ↔ loops
_Escreva sua compreensão_

### Conexão indução ↔ recursão
_Escreva sua compreensão_

### Confiança (1-5)
- [ ] Somatórios: _/5
- [ ] Indução: _/5

---

## ⏭️ Próximo

**Semana 5**: Combinatória & Probabilidade
- Quantas formas de escolher k itens de n?
- Como probabilidade entra em análise de algoritmos?
