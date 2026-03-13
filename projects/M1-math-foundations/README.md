# M1: Math Foundations

**Objetivo**: Dominar notação matemática e fundamentos para análise de algoritmos.

**Semanas**: 1-5 (5 semanas, ~25h)  
**Pré-requisitos**: Nenhum  
**Próximo módulo**: [M2: Zig Foundations](../M2-zig-foundations/README.md)

---

## O que você vai aprender

- Ler e escrever notação matemática com precisão
- Entender conjuntos, funções e relações
- Trabalhar com logaritmos e exponenciais
- Provar corretude por indução matemática
- Calcular combinatórias e probabilidades básicas
- **Resultado**: Ler análise de algoritmo e entender cada termo de Big O

---

## Timeline Semanal

| Semana | Tema | Pergunta Central |
|--------|------|-----------------|
| 1 | Notação & Lógica | Como ler e escrever afirmações matemáticas? |
| 2 | Conjuntos & Funções | O que define uma função? |
| 3 | Logaritmos & Exponenciais | Por que log aparece em complexidade? |
| 4 | Somatórios & Indução | Como provar que algo funciona para N? |
| 5 | Combinatória & Probabilidade | Como contar possibilidades? |

**Buffer 1** (Semana 6): Recuperação e revisão antes do M2.

---

## Arquivos deste módulo

```
meta/
├── phase-0-overview.md           # Visão completa do phase
├── week-01-notation-logic.md
├── week-02-sets-functions.md
├── week-03-log-exp.md
├── week-04-summation-induction.md
└── week-05-combinatorics-probability.md

projects/                         # Projetos de prática
└── symbols-essentials/           # Símbolos matemáticos
    ├── reference/
    │   └── symbols-cheatsheet.md # Consulta rápida
    ├── practice/
    │   └── symbols-drill.md      # Exercícios de tradução
    └── srs/
        └── symbols-cards.md      # Flashcards para Anki/Mochi
```

---

## Benchmark de conclusão

Ao terminar M1, você deve conseguir:
- [ ] Ler uma análise de algoritmo e entender cada símbolo matemático
- [ ] Calcular Big O de loops simples e aninhados
- [ ] Provar um invariante por indução
- [ ] Calcular permutações e combinações básicas

---

## Conexões com outros módulos

- **M2 (Zig Foundations)**: Notação de complexidade será usada ao analisar allocators
- **M3 (Data Structures)**: Big O para operações de DS (insert, search, delete)
- **M4 (Algorithms)**: Base matemática para provas de corretude e complexidade
- **M4 (Algorithms + DP)**: Análise de recorrências em DP

---

## Retrieval de módulos anteriores

*M1 é o primeiro módulo — sem retrieval necessário.*

---

## Como começar

```
echo "M1-math-foundations" > .current-topic
/ul-study-start
```

Comece por `meta/phase-0-overview.md` para o contexto completo, depois siga `week-01-notation-logic.md`.
