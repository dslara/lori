---
description: Criar plano semanal detalhado (/ul-plan-weekly-create)
agent: meta
model: opencode-go/minimax-m2.5
---

Argumento recebido: $1 (número da semana)

## Uso
/ul-plan-weekly-create [semana]

## Descrição

Cria plano semanal detalhado com objetivo SMART, cronograma diário e entregas mensuráveis. Analisa semana anterior para ajustar ritmo.

## Processo

### Passo 1: Ler Contexto

**⚠️ Antes de criar**:
1. Ler `week-{N-1}.md` (semana anterior)
2. Ler `retro-*.md` (última retrospectiva)
3. Verificar métricas em `data/insights.csv`

**Adaptação baseada em dados**:
- Completou <60% → Reduzir escopo
- Completou 80-100% → Manter ritmo
- Completou >100% → Aumentar desafio

### Passo 2: Definir Objetivo SMART (5 min)

Perguntar ao usuário:
```
"Qual o objetivo desta semana?

Dicas:
• Específico (não 'estudar Go')
• Mensurável (como saber se conseguiu?)
• Atingível (realista para 6 dias)
• Relevante (para seu objetivo maior)
• Temporal (esta semana apenas)

Exemplo: 'Implementar autenticação JWT em API'
"
```

### Passo 3: Distribuir na Semana

**Estrutura padrão**:
- **Segunda-Quarta**: Conceitos + prática guiada
- **Quinta-Sexta**: Projeto prático (directness)
- **Sábado**: Benchmark + revisão

**Para cada dia, definir**:
- Foco principal
- Atividade específica
- Entrega mensurável

### Passo 4: Gerar Arquivo

Criar `{módulo}/meta/week-{N}.md`:

```markdown
# 📅 Semana [N]: [TEMA]

## 📊 Revisão Semana Anterior
- Completado: X/Y entregas
- Dificuldades: [se houver]
- Ajuste: [se necessário]

## 🎯 Objetivo SMART
"[Objetivo específico e mensurável]"

## 📋 Plano Diário (1h cada)
| Dia | Foco | Atividade | Entrega |
|-----|------|-----------|----------|
| Seg | [Tipo] | /[command] [tema] | [Resultado] |
| Ter | [Tipo] | /[command] [tema] | [Resultado] |
| Qua | [Tipo] | /[command] [tema] | [Resultado] |
| Qui | [Tipo] | /[command] [tema] | [Resultado] |
| Sex | [Tipo] | /[command] [tema] | [Resultado] |
| Sáb | Revisão | Benchmark + SRS | Teste |

## ✅ Entregas da Semana
- [ ] Projeto: [nome específico]
- [ ] Drill: [X] exercícios
- [ ] SRS: [Y] cards novos
- [ ] Benchmark: [Z]% sucesso

## 🔗 Recursos
- Tier 1: [recurso principal]
- Referência: [docs]
- Extras: [se houver]

## 📝 Notas
_Anotações sobre ajustes ou observações_
```

## Exemplo Completo

```
Usuário: /ul-plan-weekly-create 3

Sistema:
"📅 Criando Plano - Semana 3

[Analisando contexto...]
✓ Semana 2: 4/5 entregas (80%)
✓ Retro: 'recursão foi difícil, preciso de mais prática'

🎯 Qual seu objetivo SMART para esta semana?"

Usuário: "Dominar árvores binárias e implementar BST"

Sistema:
"✅ Objetivo definido!

## 📅 Semana 3: Árvores Binárias

### 📊 Revisão Semana Anterior
- Completado: 4/5 entregas
- Dificuldades: Recursão em árvores
- Ajuste: +1 dia de reforço em recursão

### 🎯 Objetivo SMART
"Implementar BST do zero com inserção, busca e travessias"

### 📋 Plano Diário
| Dia | Foco | Atividade | Entrega |
|-----|------|-----------|----------|
| Seg | Conceito | /ul-practice-feynman "BST vs arrays" | Explicação 5 linhas |
| Ter | Prática | /ul-practice-drill "recursão em árvores" | 5 exercícios |
| Qua | Conceito | /ul-learn-explain "balanceamento AVL" | Analogia |
| Qui | Projeto | /ul-practice-project "BST básico" | Inserção + busca |
| Sex | Projeto | /ul-practice-project "BST completo" | Travessias |
| Sáb | Revisão | Benchmark + SRS | Teste 80%+

### ✅ Entregas
- [ ] Projeto: BST completo em Python
- [ ] Drill: 5 exercícios recursão
- [ ] SRS: 10 cards sobre árvores
- [ ] Benchmark: 80% acerto

### 🔗 Recursos
- Tier 1: Visualgo.net (BST)
- Referência: Cormen cap. 12

✅ Plano salvo em: week-3.md

Próximo passo: /ul-study-start"
```

## Integrações

**Commands relacionados:**
- `/ul-retro-weekly` — Fazer antes (domingo manhã)
- `/ul-plan-weekly` — Visualizar plano existente
- `/ul-study-start` — Começar execução

## Handoff

- Plano criado → `/ul-study-start` para começar
- Domingo seguinte → `/ul-retro-weekly` para avaliar

---

*Command: /ul-plan-weekly-create — Criar plano semanal detalhado*
