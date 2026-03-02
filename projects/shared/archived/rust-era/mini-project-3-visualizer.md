# 🛠️ Mini-Projeto 3: Sorting Visualizer

## 📅 Quando
**Semana 43** (após Fase 3: Algorithms)

## 🎯 Objetivo
Demonstrar entendimento profundo de algoritmos de ordenação através de visualização.

---

## ❓ Pergunta Central
> O que cada algoritmo de sorting está realmente fazendo a cada passo?

---

## 📋 Escopo (5 horas)

### O Projeto: Simple Sorting Visualizer

Visualizador **simples** que mostra passo-a-passo de cada algoritmo usando `println!`.

> ⚠️ **Escopo ajustado**: Usar apenas `println!` para output. Sem bibliotecas de terminal complexas!

### Algoritmos a Implementar
- [ ] Bubble Sort
- [ ] Selection Sort
- [ ] Insertion Sort
- [ ] Merge Sort
- [ ] Quick Sort (stretch)

### Requisitos Mínimos
- [ ] Visualização ASCII simples com `println!`
- [ ] Mostrar array em cada passo
- [ ] Contador de comparações e swaps
- [ ] Pelo menos 4 algoritmos

### Exemplo de Output (simples):
```
=== Bubble Sort - Passo 5 ===
[3, 5, *8*, *2*, 9, 1]   <- comparando 8 e 2
Swap!
[3, 5, 2, 8, 9, 1]

Comparações: 5 | Swaps: 3
---
```

### Stretch Goals (apenas se sobrar tempo)
- [ ] Quick Sort visualizado
- [ ] Usar sleep() para animação
- [ ] Gerar relatório final comparativo

---

## 📚 Recursos

| Recurso | Seção | Propósito |
|---------|-------|-----------|
| `std::thread::sleep` | https://doc.rust-lang.org/std/thread/fn.sleep.html | Pausar entre passos |
| Visualgo | https://visualgo.net/en/sorting | Inspiração visual |
| Seu código da Fase 3 | Implementações de sorting | Base |

> ⚠️ **Não use crossterm ou outras bibliotecas complexas** - mantenha simples com println!

---

## 📋 Entregas por Dia

**Dia 1**: Setup e Bubble Sort
- [ ] Setup de projeto
- [ ] Função para imprimir array formatado
- [ ] Bubble Sort com visualização
- [ ] Contador de comparações/swaps

**Dia 2**: Selection e Insertion
- [ ] Selection Sort com visualização
- [ ] Insertion Sort com visualização
- [ ] Testar e refinar output

**Dia 3**: Merge Sort
- [ ] Merge Sort com visualização
- [ ] Desafio: mostrar o processo de merge
- [ ] Contar operações corretamente

**Dia 4**: Polish e Quick Sort (opcional)
- [ ] Refinar visualização
- [ ] Adicionar sleep() para "animação"
- [ ] Quick Sort se tempo permitir

**Dia 5**: Documentação e Análise
- [ ] README com análise de complexidade
- [ ] Exemplos de output
- [ ] Tabela comparativa de métricas
- [ ] 5 SRS cards sobre comportamento dos algoritmos

---

## ✅ Critérios de Sucesso

### Você completou se:
1. [ ] Pelo menos 4 algoritmos visualizados
2. [ ] É possível "ver" o algoritmo trabalhando
3. [ ] Métricas são contadas corretamente
4. [ ] Consegue explicar cada passo observando a visualização

### Perguntas de Auto-avaliação:
- Por que Merge Sort faz mais comparações que Quick Sort em alguns casos?
- Como você vê a diferença entre O(n²) e O(n log n)?
- Qual algoritmo "parece" mais eficiente visualmente?

---

## 📊 Análise Esperada

Preencha após executar com array de 20 elementos:

| Algoritmo | Comparações | Swaps | Observação |
|-----------|-------------|-------|------------|
| Bubble | | | |
| Selection | | | |
| Insertion | | | |
| Merge | | | |
| Quick | | | |

---

## 🔄 Reflexão

### O que a visualização revelou que números não mostravam?
_Escreva_

### Qual algoritmo você entende melhor agora?
_Escreva_

### Como isso muda sua intuição sobre Big O?
_Escreva_

---

## ⏭️ Próximo
**Buffer 4** (Semana 44) → **Fase 4: Advanced Rust + DP** (Semana 45)
