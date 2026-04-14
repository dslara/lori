# 🧪 Guia Completo: Experimentation (Experimentação)

> **Última atualização**: 2026-02-08  
> **Versão**: 1.0 

---

## 📋 Índice

- [O que é Experimentation](#o-que-e-experimentation)
- [Quando Experimentar](#quando-experimentar)
- [Como Experimentar](#como-experimentar-passo-a-passo)
- [Framework 3D](#framework-3d-onde-experimentation-se-encaixa)
- [Boas Práticas](#boas-praticas-como-experimentar-efetivamente)
- [Workflow](#workflow-tipico)
- [Métricas](#metricas-como-saber-se-experimentacao-funcionou)
- [Resumo](#resumo-regras-de-ouro)
- [Exemplos Completos](#exemplos-completos)

---

## 🎯 O que é Experimentation? 
### Definição
**Experimentation** é testar **múltiplas abordagens** para aprender, em vez de seguir apenas 1 caminho "correto".

### Metáfora
- ❌ **Sem experimentação**: Seguir mapa único (pode ser subótimo)
- ✅ **Com experimentação**: Testar 3 rotas diferentes (descobre a melhor)

### Por quê usar?
Implementa **Princípio #9 - Experimentation** do Ultralearning:
- **Evita zona de conforto**: Testa abordagens novas
- **Descobre ótimos**: Encontra O QUE funciona melhor para VOCÊ
- **Flexibilidade**: Adapta método ao contexto

### Diferença de outros princípios

| Princípio | Foco | Experimentação |
|-----------|------|----------------|
| **Drill** | Dominar 1 técnica | Testar VARIAÇÕES da técnica |
| **Directness** | Fazer 1 projeto | Fazer MÚLTIPLAS versões do projeto |
| **Feedback** | Corrigir erro | Testar SE outra abordagem é melhor |

**Experimentação = busca ativa por OTIMIZAÇÃO.**

---

## 🧠 Quando Experimentar?

### ✅ EXPERIMENTE nestes contextos:

| Situação | O que experimentar | Por quê |
|----------|-------------------|---------|
| **Método de estudo não funciona** | Teste 3 técnicas diferentes | Descobre qual funciona pra você |
| **Projeto com múltiplas soluções** | Implementa 2-3 abordagens | Compara trade-offs |
| **Dominou o básico** | Testa variações avançadas | Expande repertório |
| **Curioso sobre alternativa** | Implementa "e se eu fizesse X?" | Aprendizado profundo |
| **Stuck em platô** | Muda abordagem radicalmente | Sai da zona de conforto |

### ❌ NÃO experimente quando:

| Situação | Por quê não | Faça isto em vez |
|----------|-------------|------------------|
| **Ainda aprendendo basics** | Precisa dominar 1 forma primeiro | Drill até automatizar |
| **Sob pressão (deadline)** | Experimentação leva tempo | Use método comprovado |
| **Muitas variáveis** | Não sabe O QUÊ causou diferença | Controle 1 variável por vez |

**Regra**: Domine o básico ANTES de experimentar. Depois, experimente bastante!

---

## 🛠️ Como Experimentar (Passo a Passo)

### Tipo 1: Experimentar Métodos de Estudo

#### Cenário
Você quer descobrir qual método de revisão funciona MELHOR para você.

#### Passo 1: Definir variável a testar (5 min)
```markdown
# Experimento: Método de Revisão

## Hipótese
Qual método de revisão retém mais informação após 1 semana?

## Variáveis
- **Independente** (o que testo): Método de revisão
- **Dependente** (o que meço): Taxa de retenção após 1 semana
- **Controle**: Mesmo conteúdo, mesmo tempo (1h)

## Métodos a testar
1. Reler material (baseline)
2. Retrieval practice (papel em branco)
3. Feynman (explicar sem consultar)
```

#### Passo 2: Executar experimento (3 semanas)
```markdown
## Semana 1: Método 1 (Reler)
- Estuda conceito A (1h)
- Revisa: Relê material (1h)
- Testa após 1 semana: Taxa de retenção = ?

## Semana 2: Método 2 (Retrieval)
- Estuda conceito B (1h, similar dificuldade)
- Revisa: Papel em branco, sem consultar (1h)
- Testa após 1 semana: Taxa de retenção = ?

## Semana 3: Método 3 (Feynman)
- Estuda conceito C (1h, similar dificuldade)
- Revisa: Explica para alguém (1h)
- Testa após 1 semana: Taxa de retenção = ?
```

#### Passo 3: Medir resultados
```markdown
## Resultados (Taxa de retenção após 1 semana)

| Método | Taxa de Retenção | Tempo de Recall |
|--------|------------------|-----------------|
| Reler | 60% | 30s/pergunta |
| Retrieval | 85% | 10s/pergunta |
| Feynman | 90% | 5s/pergunta |

## Conclusão
Feynman > Retrieval > Reler
Para mim, Feynman é 50% mais efetivo que reler!

## Ação
Usar Feynman como método principal de revisão.
```

---

### Tipo 2: Experimentar Implementações de Algoritmo

#### Cenário
Você quer comparar 3 abordagens para implementar sorting.

#### Passo 1: Definir abordagens (10 min)
```markdown
# Experimento: Sorting Performance

## Objetivo
Comparar bubble sort, merge sort e quick sort em diferentes cenários.

## Abordagens
1. Bubble Sort (O(n²)) - simples
2. Merge Sort (O(n log n)) - garantido
3. Quick Sort (O(n log n) médio) - rápido na prática

## Cenários de teste
- Array pequeno (n=10)
- Array médio (n=1000)
- Array grande (n=100.000)
- Array já ordenado
- Array reverso
```

#### Passo 2: Implementar as 3 versões (2-3h)
```rust
// 1. Bubble Sort
fn bubble_sort(arr: &mut [i32]) { ... }

// 2. Merge Sort
fn merge_sort(arr: &mut [i32]) { ... }

// 3. Quick Sort
fn quick_sort(arr: &mut [i32]) { ... }
```

#### Passo 3: Medir e comparar
```rust
use std::time::Instant;

fn benchmark(name: &str, sort_fn: fn(&mut [i32]), arr: &[i32]) {
    let mut arr_copy = arr.to_vec();
    let start = Instant::now();
    sort_fn(&mut arr_copy);
    let elapsed = start.elapsed();
    println!("{}: {:?}", name, elapsed);
}

// Resultados:
// n=10:      Bubble 0.1ms, Merge 0.2ms, Quick 0.15ms
// n=1000:    Bubble 50ms, Merge 2ms, Quick 1ms
// n=100k:    Bubble 8s, Merge 15ms, Quick 10ms
```

#### Passo 4: Analisar trade-offs
```markdown
## Resultados

| Algoritmo | Melhor Caso | Pior Caso | Complexidade Espaço | Quando usar |
|-----------|-------------|-----------|---------------------|-------------|
| Bubble | n=10 (simples) | Qualquer caso grande | O(1) | Arrays pequenos, código simples |
| Merge | Garantia O(n log n) | Sempre bom | O(n) | Quando precisa estabilidade |
| Quick | Prática (mais rápido) | Array já ordenado | O(log n) | Caso geral (melhor na prática) |

## Aprendizado
- Bubble é OK para n<50 (simplicidade vale a pena)
- Quick é melhor na PRÁTICA (apesar de pior caso O(n²))
- Merge é escolha quando PRECISA de garantia O(n log n)

## Decisão
Usar Quick por padrão, Merge quando precisa estabilidade.
```

---

### Tipo 3: Experimentar Recursos de Aprendizado

#### Cenário
Você quer descobrir qual recurso te ensina melhor.

#### Experimento (2 semanas)
```markdown
# Experimento: Melhor Recurso para Rust

## Semana 1: The Rust Book (docs oficiais)
- Lê Capítulo 4 (Ownership)
- Tempo: 3h
- Teste após 1 semana: 70% retenção
- Feedback: Muito texto, pouco hands-on

## Semana 2: Rustlings (exercícios práticos)
- Faz 20 exercícios de ownership
- Tempo: 3h
- Teste após 1 semana: 90% retenção
- Feedback: Hands-on, aprendi fazendo

## Conclusão
Rustlings (prático) > Rust Book (teórico) para MIM.
Mas Rust Book é bom como referência.

## Estratégia final
1. Rustlings para aprender (hands-on)
2. Rust Book para consulta (referência)
```

---

## 🎯 Framework 3D: Onde Experimentation se Encaixa?

### Experimentação permeia TUDO

| Dimensão | Como experimentar |
|----------|-------------------|
| **Conceitos** | Teste 3 formas de explicar (analogias diferentes) |
| **Fatos** | Teste SRS vs leitura repetida (qual retém mais?) |
| **Procedimentos** | Implemente algoritmo de 2-3 formas (qual mais clara?) |

**Experimentação = meta-skill (melhora COMO você aprende).**

---

## 🔗 Técnicas Relacionadas

### Técnicas que Implementam este Princípio

| Técnica | Descrição | Quando usar |
|---------|-----------|-------------|
| [benchmarking.md](../tecnicas/benchmarking.md) | Comparar múltiplos recursos ou abordagens | Para Principle #9 - Experimentation |

### Técnicas Complementares

- [drill.md](../tecnicas/drill.md) - Domine o básico ANTES de experimentar variações
- [feedback-loop.md](../tecnicas/feedback-loop.md) - Use feedback para identificar o que experimentar
- [retrospective.md](../tecnicas/retrospective.md) - Avalie resultados de experimentos
- [directness.md](../tecnicas/directness.md) - Aplique descobertas em projetos reais

---

## ✍️ Boas Práticas: Como Experimentar Efetivamente

### ✅ BOM: Controlar Variáveis

```markdown
# ✅ CERTO: 1 variável por vez

## Experimento: Melhor hora para estudar?

### Variável testada: Hora do dia
- Controle 1: Mesmo conteúdo (ownership)
- Controle 2: Mesmo tempo (1h)
- Controle 3: Mesmo método (feynman)

Semana 1: Estuda às 8h → Resultado: 80% retenção
Semana 2: Estuda às 14h → Resultado: 70% retenção
Semana 3: Estuda às 20h → Resultado: 60% retenção

Conclusão: Manhã (8h) é melhor para MIM.
```

```markdown
# ❌ RUIM: Múltiplas variáveis

Semana 1: Estuda às 8h, método feynman, conceito A
Semana 2: Estuda às 14h, método drill, conceito B
Semana 3: Estuda às 20h, método reler, conceito C

Resultado diferente... mas POR QUÊ?
- Foi a hora?
- Foi o método?
- Foi o conceito?
- Impossível saber!
```

**Regra**: Mude 1 variável, controle o resto.

---

### ✅ BOM: Medir Objetivamente

```markdown
# ✅ CERTO: Métrica clara

## Experimento: Rust Book vs Rustlings

Métrica: Taxa de retenção após 1 semana (teste de 10 perguntas)
- Rust Book: 7/10 (70%)
- Rustlings: 9/10 (90%)

Conclusão objetiva: Rustlings é 20% melhor.
```

```markdown
# ❌ RUIM: Métrica subjetiva

## Experimento: Rust Book vs Rustlings

Métrica: "Qual me pareceu melhor?"
- Rust Book: "Achei interessante"
- Rustlings: "Gostei mais"

Conclusão vaga: "Gostei de Rustlings"
# Problema: Não sabe QUANTO melhor, baseado em feeling
```

**Regra**: Use métricas objetivas (taxa de retenção, tempo, erros).

---

### ✅ BOM: Experimentar DEPOIS de Dominar Básico

```bash
# ✅ CERTO: Ordem correta

# Semana 1-2: Aprende binary search (1 forma)
Implementa binary search seguindo tutorial (10x)

# Semana 3: AGORA experimenta variações
Versão 1: Iterativo (original)
Versão 2: Recursivo (variação)
Versão 3: Com lower_bound/upper_bound (avançado)

# Por quê funciona: Você JÁ sabe o básico, pode comparar
```

```bash
# ❌ RUIM: Experimenta antes de dominar

# Semana 1: Tenta 3 abordagens ao mesmo tempo
Versão 1: Iterativo (não dominou)
Versão 2: Recursivo (confuso)
Versão 3: Avançado (perdido)

# Problema: Não sabe O BÁSICO, experimentos são caóticos
```

**Regra**: Domine 1 forma ANTES de experimentar variações.

---

### ✅ BOM: Documentar Aprendizados

```markdown
# ✅ CERTO: Registra experimento

## Experimento 3: Implementações de HashMap

### Abordagens testadas
1. Chaining (linked list em cada bucket)
2. Open addressing (linear probing)
3. Robin Hood hashing (open addressing melhorado)

### Resultados
| Abordagem | Colisões | Memória | Complexidade |
|-----------|----------|---------|--------------|
| Chaining | +colisões OK | +memória (ponteiros) | O(1) médio |
| Open addr | -colisões | -memória (array) | O(1) se load<0.7 |
| Robin Hood | -colisões | -memória | O(1) garantido |

### Trade-offs descobertos
- Chaining: Simples de implementar, mas usa mais memória
- Open addressing: Eficiente em memória, mas degrada se full
- Robin Hood: Melhor dos dois, mas implementação complexa

### Decisão
Chaining para aprendizado (mais simples).
Robin Hood para produção (quando dominar).
```

**Por quê**: Você vai esquecer. Documentação = referência futura.

---

### ✅ BOM: "E se eu fizesse X?" (Curiosidade)

```rust
// ✅ CERTO: Explora variações

// Implementou bubble sort (básico)
fn bubble_sort(arr: &mut [i32]) { ... }

// Agora pergunta: "E se eu otimizar?"
// Experimento 1: Early exit se não houve swap
fn bubble_sort_optimized(arr: &mut [i32]) {
    let mut swapped = true;
    while swapped {
        swapped = false;
        for i in 0..arr.len()-1 {
            if arr[i] > arr[i+1] {
                arr.swap(i, i+1);
                swapped = true;
            }
        }
    }
}

// Testa: Array quase ordenado
// Original: 50ms
// Otimizado: 5ms (10x mais rápido!)

// Aprendizado: Early exit IMPORTA para arrays quase ordenados!
```

**Regra**: Sempre pergunte "E se eu fizesse diferente?".

---

## 🔄 Workflow Típico

### Experimentação Contínua (Mensal)

```
Semana 1-2: Aprende método padrão
     - Segue tutorial/docs
     - Domina o básico (drill)
     ↓
Semana 3: Experimenta variações
     - "E se eu fizesse recursivo?"
     - "E se eu usasse outra estrutura?"
     - Compara trade-offs
     ↓
Semana 4: Integra aprendizado
     - Documenta resultados
     - Escolhe melhor abordagem
     - Aplica em projeto
```

**Frequência**: 1 experimento por módulo (4-8 semanas).

---

### Experimento de Fim de Módulo

```markdown
# Ao completar M3 (Data Structures)

## Experimento: Qual estrutura para cache LRU?

### Opções
1. HashMap + LinkedList (padrão)
2. HashMap + Vec (mais simples)
3. Single linked list (sem HashMap)

### Implementa as 3
[código]

### Compara
| Estrutura | Get O(?) | Put O(?) | Espaço | Implementação |
|-----------|----------|----------|--------|---------------|
| Hash+List | O(1) | O(1) | O(n) | Complexa |
| Hash+Vec | O(1) | O(n) | O(n) | Média |
| List only | O(n) | O(n) | O(n) | Simples |

### Aprendizado
HashMap + LinkedList é padrão por boa razão (O(1) para tudo).
Mas Hash + Vec serve para cache pequeno (<100 itens).

### Aplica no Capstone (M8)
Usar Hash+List para cache de database (produção).
```

---

## 📊 Métricas: Como Saber se Experimentação Funcionou?

### Critérios de Sucesso ✅

| Métrica | Verde ✅ | Amarelo ⚠️ | Vermelho 🔴 |
|---------|----------|------------|-------------|
| **Experimentos/módulo** | 2-3 | 1 | 0 |
| **Variáveis controladas** | 1 variável por vez | 2 variáveis | 3+ variáveis |
| **Resultados documentados** | Tabela comparativa | Notas soltas | Não documentou |
| **Aprendizado claro** | "X é 20% melhor que Y porque..." | "X pareceu melhor" | Não concluiu |
| **Aplicação** | Usa descobertas em projetos | Só experimentou | Não aplicou |

### Sinais de Experimentação Efetiva

```markdown
## Exemplo: Após 3 meses (M1-M3)

### Experimentos realizados
1. Método de revisão (Feynman > Reler)
2. Hora de estudo (Manhã > Noite)
3. Sorting (Quick > Bubble para n>100)
4. Estrutura de cache (HashMap+List > Vec)

### Impacto
- Retenção: 70% → 90% (mudou para Feynman)
- Produtividade: +30% (estuda de manhã)
- Performance: Código 10x mais rápido (quick sort)

# Experimentação FUNCIONOU! ✅
```

---

### Red Flags (Sinais de problema)

| Sinal | Problema | Solução |
|-------|----------|---------|
| 🚩 Nunca experimenta | Zona de conforto | Force 1 experimento/mês |
| 🚩 Experimenta tudo ao mesmo tempo | Caos | 1 variável por vez |
| 🚩 Não documenta resultados | Esquece aprendizados | Template de experimento |
| 🚩 Experimenta antes de dominar | Não tem baseline | Domine básico primeiro |
| 🚩 Não aplica descobertas | Experimento inútil | Use em projeto real |

---

## 🎓 Resumo: Regras de Ouro

### ✅ 5 Regras para Experimentação Efetiva

1. **Domine o básico ANTES de experimentar**
   - ✅ Aprende 1 forma → domina → experimenta variações
   - ❌ Não tenta 3 abordagens ao mesmo tempo (iniciante)

2. **Controle variáveis (1 por vez)**
   - ✅ Muda SÓ método de revisão (resto igual)
   - ❌ Não muda 3 coisas (impossível saber causa)

3. **Meça objetivamente (não "feeling")**
   - ✅ Taxa de retenção, tempo, erros
   - ❌ Não "achei melhor" (subjetivo)

4. **Documente aprendizados**
   - ✅ Tabela comparativa com trade-offs
   - ❌ Não confie na memória

5. **Aplique descobertas em projetos**
   - ✅ Experimento → Conclusão → Usa em projeto real
   - ❌ Não experimente só por experimentar

---

## 📝 Exemplos Completos

### Exemplo 1: Experimentar Método de Estudo

#### Contexto
Você quer descobrir qual método de revisão funciona melhor (Semana 4 de M1).

#### Experimento (3 semanas)
```markdown
# Experimento: Método de Revisão

## Hipótese
Retrieval practice > Reler material

## Design
- Conteúdo: Provas por indução (M1, Semana 4)
- Tempo: 1h de revisão
- Teste: 10 perguntas após 1 semana

### Semana 4: Baseline (Reler)
- Estuda: Provas por indução (1h)
- Revisa: Relê capítulo (1h)
- Testa (semana 5): 6/10 (60%)

### Semana 5: Teste (Retrieval)
- Estuda: Somatórios (1h, similar dificuldade)
- Revisa: Papel em branco, escreve do zero (1h)
- Testa (semana 6): 9/10 (90%)

### Semana 6: Confirmação (Retrieval de novo)
- Estuda: Combinatória (1h)
- Revisa: Retrieval (1h)
- Testa (semana 7): 8/10 (80%)
```

#### Resultados
```markdown
## Resultados

| Método | Retenção Média | Tempo de Recall |
|--------|----------------|-----------------|
| Reler | 60% | 45s/pergunta |
| Retrieval | 85% | 15s/pergunta |

**Diferença**: Retrieval é 25% mais efetivo E 3x mais rápido!

## Conclusão
Retrieval practice > Reler (para MIM).
Evidência: 3 testes, 25% melhoria consistente.

## Ação
Mudar método padrão de revisão para retrieval.
Reler APENAS se esqueceu 100% (não consegue retrieval).
```

**Impacto**: Mudou método de estudo baseado em EVIDÊNCIA (não feeling).

---

### Exemplo 2: Experimentar Implementações de Algoritmo

#### Contexto
Você quer comparar HashSet vs BTreeSet (Semana 23-24 de M3).

#### Experimento (2h)
```rust
// Implementa 2 versões de "unique elements"

// Versão 1: HashSet
use std::collections::HashSet;
fn unique_hashset(arr: &[i32]) -> Vec<i32> {
    arr.iter().cloned().collect::<HashSet<_>>()
        .into_iter().collect()
}

// Versão 2: BTreeSet
use std::collections::BTreeSet;
fn unique_btreeset(arr: &[i32]) -> Vec<i32> {
    arr.iter().cloned().collect::<BTreeSet<_>>()
        .into_iter().collect()
}

// Benchmark
use std::time::Instant;

let arr: Vec<i32> = (0..100_000).collect();

// HashSet
let start = Instant::now();
let result1 = unique_hashset(&arr);
println!("HashSet: {:?}", start.elapsed()); // 5ms

// BTreeSet
let start = Instant::now();
let result2 = unique_btreeset(&arr);
println!("BTreeSet: {:?}", start.elapsed()); // 15ms
```

#### Resultados
```markdown
## Resultados

| Estrutura | Inserção | Busca | Memória | Ordenado? |
|-----------|----------|-------|---------|-----------|
| HashSet | O(1) | O(1) | Mais | Não |
| BTreeSet | O(log n) | O(log n) | Menos | Sim |

### Performance (n=100k)
- HashSet: 5ms
- BTreeSet: 15ms (3x mais lento)

## Trade-offs
**HashSet**: Mais rápido, mas não mantém ordem
**BTreeSet**: Mais lento, mas resultado é ordenado

## Quando usar?
- HashSet: Quando só precisa unique (sem ordem)
- BTreeSet: Quando precisa unique + ordenado

## Aprendizado
"Sempre use HashSet" é MITO!
Se precisa ordem, BTreeSet pode valer 3x slowdown.
```

**Impacto**: Entendeu trade-offs NA PRÁTICA (não só teoria).

---

### Exemplo 3: Experimentar Recursos de Aprendizado

#### Contexto
Você quer descobrir melhor forma de aprender Rust (Semana 7 de M2).

#### Experimento (4 semanas)
```markdown
# Experimento: Melhor Recurso para Rust

## Recursos testados
1. The Rust Book (docs oficiais)
2. Rustlings (exercícios práticos)
3. Rust by Example (exemplos de código)
4. Vídeos (YouTube - Let's Get Rusty)

## Design
- Tópico: Ownership & Borrowing
- Tempo: 3h/recurso
- Teste: 10 perguntas + 1 mini-projeto após 1 semana

### Semana 1: Rust Book
- Lê Capítulos 4-5 (3h)
- Teste: 7/10 (70%)
- Mini-projeto: Conseguiu (mas consultou muito)
- Feedback: Muito teórico, pouco hands-on

### Semana 2: Rustlings
- Faz 30 exercícios (3h)
- Teste: 9/10 (90%)
- Mini-projeto: Fez sozinho
- Feedback: Hands-on, aprendeu fazendo

### Semana 3: Rust by Example
- Lê + testa exemplos (3h)
- Teste: 8/10 (80%)
- Mini-projeto: Conseguiu (consultou pouco)
- Feedback: Bom equilíbrio teoria/prática

### Semana 4: Vídeos
- Assiste 6 vídeos (3h)
- Teste: 6/10 (60%)
- Mini-projeto: Difícil (consultou muito)
- Feedback: Passivo, não fixou
```

#### Resultados
```markdown
## Resultados

| Recurso | Retenção | Projeto | Engajamento |
|---------|----------|---------|-------------|
| Rust Book | 70% | Médio | Baixo |
| Rustlings | 90% | Alto | Alto |
| Rust by Example | 80% | Alto | Médio |
| Vídeos | 60% | Baixo | Baixo |

## Conclusão
**Rustlings** é MELHOR para MIM (hands-on > passivo).

## Estratégia final
1. **Aprender**: Rustlings (70% do tempo)
2. **Consultar**: Rust Book (20%)
3. **Reforçar**: Rust by Example (10%)
4. **Evitar**: Vídeos (muito passivo)
```

**Impacto**: Otimizou tempo de estudo baseado em dados reais.

---

## 🔗 Links Relacionados

- [feynman.md] - Experimentar analogias
- [drill.md](../tecnicas/drill.md) - Experimentar variações de procedimento
- [directness.md](../tecnicas/directness.md) - Experimentar arquiteturas
- [6-feedback.md](6-feedback.md) - Feedback de experimentos

---

## 💡 Dica Final

**Experimentação é o antídoto para estagnação.**

Maioria das pessoas:
- ❌ Aprende 1 forma e para (zona de conforto)
- ❌ Nunca questiona "será que tem jeito melhor?"
- ❌ Segue método subótimo por anos

Você, experimentando:
- ✅ Testa 3 abordagens, descobre a melhor
- ✅ Sempre pergunta "e se eu fizesse X?"
- ✅ Otimiza continuamente baseado em dados

**"Insanity is doing the same thing over and over and expecting different results."** - Albert Einstein

**Experimente. Meça. Aprenda. Repita.** 🧪🔁

---

**Criado por**: @meta  
**Data**: 2026-02-08  
**Versão**: 1.0
