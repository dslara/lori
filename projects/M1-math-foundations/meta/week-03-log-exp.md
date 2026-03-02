# 📅 Semana 3: Logaritmos & Exponenciais

## 🎯 Objetivo
Ao final desta semana, você será capaz de:
- Entender intuitivamente o que são logaritmos
- Calcular logaritmos simples mentalmente
- Entender por que O(log n) é eficiente
- Reconhecer crescimento exponencial vs logarítmico

---

## ❓ Perguntas Guia

### Exponenciais
1. O que significa 2ⁿ?
   - Calcule: 2¹, 2², 2³, 2⁴, 2⁵, 2¹⁰

2. Por que potências de 2 são importantes em CS?

3. O que é crescimento exponencial?
   - Por que é "explosivo"?

4. Quais as propriedades de exponenciais?
   - aᵐ × aⁿ = ?
   - (aᵐ)ⁿ = ?
   - a⁰ = ?
   - a⁻ⁿ = ?

### Logaritmos
5. O que é logaritmo? (definição intuitiva)
   - Se 2³ = 8, então log₂(8) = ?

6. O que significa log₂(n)?
   - "Quantas vezes preciso dividir n por 2 até chegar a 1?"

7. Calcule mentalmente:
   - log₂(2) = ?
   - log₂(4) = ?
   - log₂(8) = ?
   - log₂(16) = ?
   - log₂(1024) = ?
   - log₂(1.000.000) ≈ ?

8. Quais as propriedades de logaritmos?
   - log(a × b) = ?
   - log(a / b) = ?
   - log(aⁿ) = ?

9. O que é logaritmo natural (ln) e log base 10?

### Conexão com CS
10. Por que Binary Search é O(log n)?

11. Por que árvores balanceadas têm altura O(log n)?

12. Quantas vezes você pode dividir 1.000.000 por 2?

13. Se um algoritmo é O(2ⁿ), por que é impraticável para n grande?

14. Compare o crescimento:
    - n = 1.000.000
    - O(n) vs O(log n) vs O(n²) vs O(2ⁿ)

---

## 📚 Recursos

| Recurso | Seção |
|---------|-------|
| Khan Academy | "Logarithms" (série completa) |
| Khan Academy | "Exponential growth & decay" |
| 3Blue1Brown | "What's so special about Euler's number e?" (YouTube) |
| BetterExplained | "Using Logarithms in the Real World" |

---

## 📋 Entregas

### Dia 1: Exponenciais
- [ ] Responder perguntas 1-4
- [ ] Criar tabela de potências de 2 (2⁰ até 2²⁰)
- [ ] Memorizar: 2¹⁰ ≈ 1.000 (mil)
- [ ] Memorizar: 2²⁰ ≈ 1.000.000 (milhão)

### Dia 2: Logaritmos - Conceito
- [ ] Responder perguntas 5-6
- [ ] Explicar logaritmo em suas próprias palavras
- [ ] Criar analogia pessoal para logaritmo

### Dia 3: Logaritmos - Cálculo
- [ ] Responder perguntas 7-9
- [ ] Calcular 20 logaritmos base 2 mentalmente
- [ ] Praticar propriedades com 10 exercícios

### Dia 4: Conexão com CS
- [ ] Responder perguntas 10-14
- [ ] Explicar por que Binary Search é log n
- [ ] Calcular quantas operações para buscar em 1 bilhão de itens

### Dia 5: Comparação de Crescimento
- [ ] Criar tabela comparando crescimentos
- [ ] Desenhar gráficos (papel ou ferramenta)
- [ ] Criar cards SRS
- [ ] Quiz: dado n, estimar valores de log n, n, n², 2ⁿ

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Calcular log₂ de potências de 2 instantaneamente
2. [ ] Estimar log₂(n) para qualquer n
3. [ ] Explicar por que log n é muito menor que n
4. [ ] Justificar por que Binary Search é O(log n)
5. [ ] Reconhecer quando algoritmo é exponencial (ruim)

### Teste Prático
Responda sem calculadora:
- log₂(256) = ?
- log₂(1.000.000) ≈ ?
- Se busca binária faz log₂(n) comparações, quantas para n = 1 bilhão?
- Por que O(log n) é muito melhor que O(n) para n grande?
- 2²⁰ é aproximadamente quanto?

---

## 🔗 Conexão com CS

| Conceito | Onde aparece |
|----------|--------------|
| log₂(n) | Binary Search, árvores balanceadas |
| 2ⁿ | Subconjuntos, combinações, algoritmos ruins |
| log₁₀(n) | Número de dígitos |
| Crescimento exponencial | Por que alguns algoritmos são impraticáveis |
| Dividir por 2 repetidamente | Divide and conquer |

### Hierarquia de Crescimento (MEMORIZAR)
```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)
 ↑        ↑         ↑         ↑          ↑        ↑       ↑
ótimo   muito     bom      aceitável   ruim   péssimo  impossível
        bom
```

---

## 🔄 Reflexão

### Intuição que desenvolvi
_Escreva_

### Onde logaritmo aparece que eu não esperava
_Escreva_

### Confiança (1-5)
- [ ] Exponenciais: _/5
- [ ] Logaritmos: _/5
- [ ] Aplicar em CS: _/5

---

## ⏭️ Próximo

**Semana 4**: Somatórios & Indução
- Como analisar a complexidade de loops?
- Como provar que algoritmos recursivos funcionam?
