# 📅 Semana 2: Conjuntos & Funções

## 🎯 Objetivo
Ao final desta semana, você será capaz de:
- Entender conjuntos e suas operações
- Entender funções matematicamente
- Conectar esses conceitos com tipos e coleções em programação

---

## ❓ Perguntas Guia

### Conjuntos
1. O que é um conjunto? Exemplos?

2. Como representar conjuntos?
   - Enumeração: {1, 2, 3}
   - Construção: {x | x > 0}
   - Conjuntos especiais: ℕ, ℤ, ℚ, ℝ

3. O que são estas operações?
   - União (A ∪ B)
   - Interseção (A ∩ B)
   - Diferença (A - B)
   - Complemento (Aᶜ)

4. O que é cardinalidade |A|?

5. O que é conjunto vazio (∅)? Por que é importante?

6. O que é produto cartesiano (A × B)?

### Funções
7. O que é uma função matematicamente?
   - Domínio
   - Contradomínio (codomínio)
   - Imagem

8. O que significa f: A → B?

9. O que são estas propriedades?
   - Injetora (um-para-um)
   - Sobrejetora (sobre)
   - Bijetora (ambos)

10. O que é composição de funções (g ∘ f)?

11. O que é função inversa (f⁻¹)?

### Conexão com Programação
12. Como conjuntos se relacionam com:
    - Arrays/Listas
    - Sets
    - Tipos

13. Como funções matemáticas se relacionam com:
    - Funções em código
    - Mapeamentos
    - Tipos de retorno

---

## 📚 Recursos

| Recurso | Seção |
|---------|-------|
| Khan Academy | "Sets" e "Functions" |
| Rosen (livro) | Cap 2.1-2.3 (Sets), Cap 2.5 (Functions) |
| MIT OCW 6.042 | Lectures sobre Sets e Functions |

---

## 📋 Entregas

### Dia 1: Conjuntos Básicos
- [ ] Responder perguntas 1-2
- [ ] Listar 5 conjuntos do dia-a-dia
- [ ] Representar conjuntos de 3 formas diferentes

### Dia 2: Operações com Conjuntos
- [ ] Responder perguntas 3-6
- [ ] Dado A = {1,2,3} e B = {2,3,4}, calcular todas operações
- [ ] Desenhar diagramas de Venn para cada operação

### Dia 3: Funções - Conceito
- [ ] Responder perguntas 7-9
- [ ] Dar 3 exemplos de funções injetoras
- [ ] Dar 3 exemplos de funções não-injetoras
- [ ] Identificar domínio/contradomínio/imagem de 5 funções

### Dia 4: Funções - Operações
- [ ] Responder perguntas 10-11
- [ ] Compor 3 pares de funções
- [ ] Encontrar inversa de 3 funções (quando existir)

### Dia 5: Conexão com Código
- [ ] Responder perguntas 12-13
- [ ] Traduzir 5 operações de Set em código para operações matemáticas
- [ ] Analisar 5 funções de código: são injetoras? sobrejetoras?
- [ ] Criar cards SRS

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Realizar operações com conjuntos sem hesitar
2. [ ] Desenhar diagrama de Venn para qualquer operação
3. [ ] Identificar domínio/contradomínio/imagem de função
4. [ ] Determinar se função é injetora/sobrejetora
5. [ ] Conectar Set/Map em código com conceitos matemáticos

### Teste Prático
Dado:
- A = {1, 2, 3, 4, 5}
- B = {4, 5, 6, 7}
- f(x) = x²

Responda:
- A ∪ B = ?
- A ∩ B = ?
- A - B = ?
- |A × B| = ?
- f é injetora em A? Por quê?
- Qual a imagem de A sob f?

---

## 🔗 Conexão com CS

| Matemática | Programação |
|------------|-------------|
| Conjunto | Set, Array, tipos |
| ∈ (pertence) | `.contains()`, `in` |
| ∪ (união) | `.union()`, `\|\|` |
| ∩ (interseção) | `.intersection()`, `&&` |
| Função f: A → B | `fn f(a: A) -> B` |
| Injetora | Função sem colisões (útil em hash) |
| Bijetora | Mapeamento reversível |
| Composição | `g(f(x))`, pipelines |

---

## 🔄 Reflexão

### Conexão mais surpreendente
_Escreva_

### O que ainda confunde
_Escreva_

### Confiança (1-5)
- [ ] Conjuntos: _/5
- [ ] Funções: _/5

---

## ⏭️ Próximo

**Semana 3**: Logaritmos & Exponenciais
- Por que log₂(n) aparece em todo lugar em CS?
- O que significa crescimento exponencial?
