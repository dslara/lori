# 🔗 Guia Completo: Concept Mapping (Mapa Conceitual)

> **Técnica de Mapeamento de Relações**

---

## 📋 Índice

- [O que é Concept Mapping](#o-que-e-concept-mapping)
- [Quando Usar](#quando-usar)
- [Como Criar](#como-criar)
- [Exemplos](#exemplos-de-proposicoes)

### 🔗 Princípios Relacionados

**Implementa:**
- **[1-metalearning.md](../principios/1-metalearning.md)** - Princípio #1: Metalearning
- **[8-intuition.md](../principios/8-intuition.md)** - Princípio #8: Intuition

**Complementa:**
- [mindmap.md](mindmap.md) - Brainstorming inicial
- [feynman.md](feynman.md) - Explicar conceitos

---

## 🎯 O que é Concept Mapping? 
**Concept Mapping** é uma técnica para representar relações hierárquicas entre conceitos usando nós (conceitos) e elos rotulados (relações).

### Diferença do Mind Map
- **Mind Map**: Estrutura radial, 1 conceito central
- **Concept Map**: Múltiplos conceitos, relações explícitas com verbos

---

## 🧠 Quando Usar

### ✅ USE para:
- Entender relações entre conceitos
- Ver hierarquias complexas
- Identificar gaps de conhecimento
- Planejar arquitetura de sistemas

---

## 🛠️ Como Criar

### Elementos
1. **Conceitos** (caixas/nós)
2. **Relações** (linhas com verbos)
3. **Hierarquia** (de cima para baixo)

### Estrutura
```
[Conceito A] ---(verbo)---> [Conceito B]
     |                           |
 (verbo)                     (verbo)
     |                           |
[Conceito C]               [Conceito D]
```

### Exemplo: Ownership em Rust
```
[Ownership] ---garante---> [Memory Safety]
     |                            |
   usa                       através de
     |                            |
[Move Semantics]          [Borrow Checker]
     |                            |
   quando                    invalida
     |                            |
[Variable] <--------- [Dangling References]
```

---

## 🎯 Framework 3D

### Onde Concept Mapping se Encaixa

**Primariamente para Conceitos (40%):**

| Dimensão | Aplicação |
|----------|-----------|
| **Conceitos** | ✅ Mapear relações hierárquicas |
| **Fatos** | ⚠️ Organizar, mas não memorizar |
| **Procedimentos** | ⚠️ Visualizar fluxo de processos |

---

## 📝 Exemplos de Proposições

- "Ownership **garante** Memory Safety"
- "Structs **são** tipos compostos"
- "Traits **definem** comportamentos"

---

**Técnica complementar:** [mindmap.md](mindmap.md) para brainstorm inicial
