# 🔁 Guia Completo: Feedback Loop (Ciclo de Feedback)

> **Obter e incorporar feedback iterativamente**

---

## 📋 Índice

- [O que é Feedback Loop](#o-que-e-feedback-loop)
- [Quando Usar](#quando-usar)
- [O Ciclo](#o-ciclo)
- [Implementação](#implementacao)

---

## 🎯 O que é Feedback Loop? 
**Feedback Loop** é um processo cíclico de: executar → medir → ajustar → repetir, permitindo melhoria contínua através de informações sobre desempenho.

### Por que funciona?
- Identifica gaps rapidamente
- Permite correção de curso
- Evita prática incorreta
- Acelera aprendizado

### 🔗 Princípios Relacionados

**Implementa:**
- **[6-feedback.md](../principios/6-feedback.md)** - Princípio #6: Feedback

**Complementa:**
- [retrospective.md](retrospective.md) - Auto-avaliação periódica
- [quiz.md](quiz.md) - Testar conhecimento

---

## 🧠 Quando Usar

### ✅ USE para:
- Qualquer habilidade em desenvolvimento
- Código e projetos
- Estudos e exercícios
- Soft skills

---

## 🎯 Framework 3D

### Onde Feedback Loop se Encaixa

**Aplicável a todas as dimensões:**

| Dimensão | Aplicação |
|----------|-----------|
| **Conceitos** | Testar explicações (Feynman) |
| **Fatos** | Verificar retenção (Quiz) |
| **Procedimentos** | Identificar erros (Code Review) |

---

## 🔄 O Ciclo

```
    ┌─────────────────┐
    │   EXECUTAR     │
    │  (faz/pratica) │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │    MEDIR        │
    │ (coletar dados) │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   ANALISAR      │
    │  (identificar   │
    │   gaps)         │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │    AJUSTAR      │
    │  (implementar   │
    │   melhorias)    │
    └────────┬────────┘
             │
             └──────────► (voltar para EXECUTAR)
```

---

## 🛠️ Implementação

### Passo 1: Definir Métricas
O que você vai medir?
- Tempo de execução
- Taxa de acerto
- Qualidade do código
- Compreensão do conceito

### Passo 2: Coletar Feedback
Fontes:
- **Automático**: Testes, compilador, linter
- **Humano**: Code review, mentor, colegas
- **Auto-reflexão**: Retrospectivas pessoais

### Passo 3: Analisar
Perguntas:
- O que funcionou?
- O que não funcionou?
- Qual o gap entre atual e ideal?

### Passo 4: Ajustar
Mudanças específicas e mensuráveis:
- ❌ "Vou estudar mais"
- ✅ "Vou fazer 5 exercícios extras de recursão"

### Passo 5: Repetir
Ciclo contínuo até atingir o objetivo.

---

## 📝 Exemplo: Aprendendo Recursão

```
Ciclo 1:
EXECUTAR: Implementar fibonacci
MEDIR: Demorou 30 min, teve que consultar 5x
ANALISAR: Não entende caso base
AJUSTAR: Estudar caso base especificamente

Ciclo 2:
EXECUTAR: Implementar fatorial
MEDIR: Demorou 15 min, consultou 2x
ANALISAR: Melhorou, mas ainda confunde retorno
AJUSTAR: Fazer mais 3 exercícios focando no retorno

Ciclo 3:
EXECUTAR: Implementar soma de array
MEDIR: Demorou 10 min, sem consultar
ANALISAR: Domínio satisfatório
AJUSTAR: Próximo tópico
```

---

**Relacionado:** [feynman.md](feynman.md) - Para auto-feedback em conceitos
