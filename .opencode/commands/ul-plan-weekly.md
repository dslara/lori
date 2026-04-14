---
description: Criar plano semanal detalhado (/ul-plan-weekly)
agent: meta
model: opencode-go/glm-5
---

Argumento recebido: $ARGUMENTS (número da semana)

## Uso
/ul-plan-weekly [semana]

## Descrição

Cria plano semanal detalhado com objetivo SMART, cronograma diário e entregas mensuráveis. Analisa semana anterior para ajustar ritmo.

## Processo

### Passo 1: Carregar Contexto

Invocar tools:
- `context-hybrid.getSessionContext` — Sessões recentes e streak
- `insights.generateReport` — Ritmo recente e efetividade
- `insights.getWeaknesses` — Tópicos fracos

**Se existe semana anterior**, ler contextos:
- `context-hybrid.getRelevantSessions` (query: "semana passada") — O que funcionou/não funcionou
- Verificar métricas: completou <60%? → Reduzir escopo. 80-100%? → Manter ritmo. >100%? → Aumentar desafio.

### Passo 2: Definir Objetivo SMART

Perguntar:
```
"📅 Plano Semanal - Semana [N]

Qual o foco principal desta semana?

Contexto:
• Módulo atual: [nome]
• Progresso: [X]%
• Tópicos pendentes: [lista]
[• Semana anterior: X/Y entregas (Z%) — ajuste: ...]

Opções:
a) Continuar tópico atual: [tópico]
b) Iniciar novo tópico: [tópico]
c) Revisar tópicos fracos
   ([lista de tópicos com error_rate > 30%])
d) Preparar para benchmark

Objetivo SMART:
• Específico (não 'estudar Go')
• Mensurável (como saber se conseguiu?)
• Atingível (realista para 6 dias)
• Relevante (para seu objetivo maior)
• Temporal (esta semana apenas)

Exemplo: 'Implementar autenticação JWT em API'
```

### Passo 3: Distribuir Entregas

Baseado no foco e ritmo do usuário:

**Estrutura recomendada**:
- **Segunda-Quarta**: Conceitos + prática guiada
- **Quinta-Sexta**: Projeto prático (directness)
- **Sábado**: Benchmark + revisão

```
"⏱️ Seu ritmo médio: [X] horas/semana
Disponibilidade esta semana: __h

Distribuindo entregas:

📅 CRONOGRAMA:

Segunda (2h):
• [Entrega 1]
• Técnica sugerida: [drill/feynman/etc]

Terça (2h):
• [Entrega 2]

Quarta (2h):
• [Entrega 3]

Quinta (2h):
• [Entrega 4] — Projeto prático

Sexta (2h):
• [Entrega 5] — Projeto prático

Sábado:
• Buffer/revisão
• SRS review

Domingo:
• /ul-plan-retro"
```

### Passo 4: Balancear Técnicas

Verificar distribuição de técnicas:
```
📊 Técnicas esta semana:
• Drill: [N]x
• Feynman: [N]x
• Quiz: [N]x
• Project: [N]x

⚠️ Técnicas subutilizadas: [lista]
💡 Sugestão: incluir [técnica] na quinta
```

### Passo 5: Gerar Arquivo week-[N].md

```markdown
# 📅 Semana [N]: [TEMA]

## 📊 Revisão Semana Anterior
- Completado: [X]/[Y] entregas ([Z]%)
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

## 📊 Métricas de Sucesso
- [ ] 80%+ das entregas concluídas
- [ ] Foco médio ≥ 7/10
- [ ] Pelo menos 5 dias de estudo
- [ ] Revisar SRS 3x

## 🚨 Riscos e Mitigações
- **Risco:** [possível problema]
  - **Mitigação:** [solução]

## 🔗 Recursos
- Tier 1: [recurso principal]
- Referência: [docs]

## 📝 Notas
[ espaço para anotações durante a semana ]
```

### Passo 6: Apresentar e Iniciar

```
✅ Plano Semanal Criado!

📄 Arquivo: week-[N].md

📊 Resumo:
• [N] entregas distribuídas
• [X] horas estimadas
• Balanceamento de técnicas ✅
• Buffer no sábado ✅

🎯 Foco: [tema]
🎯 Objetivo SMART: [objetivo]

🚀 Próximo passo:
→ /ul-study-start para começar
   segunda-feira!
```

## Exemplo

```
Usuário: /ul-plan-weekly 5

Sistema:
"📅 Criando Plano - Semana 5

Contexto:
• Módulo: M1-math-foundations
• Progresso: 45%
• Ritmo: 8h/semana
• Semana 4: 4/5 entregas (80%) — recursão difícil

Qual foco desta semana?

a) Continuar: Recursão
b) Novo: Programação Dinâmica
c) Revisar: Ponteiros (error_rate 40%)
d) Preparar: Benchmark de algoritmos

🎯 Qual seu objetivo SMART para esta semana?"

Usuário: "a) Dominar recursão e implementar BST"

Sistema:
"⏱️ Disponibilidade esta semana?"

Usuário: "10 horas"

Sistema:
"Distribuindo entregas:

📅 SEMANA 5 - Recursão e BST

| Dia | Foco | Atividade | Entrega |
|-----|------|-----------|----------|
| Seg | Conceito | /ul-study-feynman "Recursão" | Explicação 5 linhas |
| Ter | Prática | /ul-study-drill "recursão em árvores" | 5 exercícios |
| Qua | Conceito | /ul-study-learn "BST" | Analogia |
| Qui | Projeto | /ul-study-project "BST básico" | Inserção + busca |
| Sex | Projeto | /ul-study-project "BST completo" | Travessias |
| Sáb | Revisão | Benchmark + SRS | Teste 80%+ |

📊 Técnicas balanceadas: 1 Feynman, 1 Drill, 2 Project, 1 Explain

✅ Plano salvo em: week-05.md

🚀 Começar segunda?
→ /ul-study-start"
```

## Quando Usar

✅ **USE:**
- Domingo (próxima semana)
- Após retrospectiva (`/ul-plan-retro`)
- Início de nova fase
- Quando mudar de direção

❌ **NÃO USE:**
- No meio da semana (use `/ul-plan-adjust`)
- Sem contexto do módulo

## Integrações

**Tools:**
- `context-hybrid.getSessionContext` — Sessões e streak
- `context-hybrid.getRelevantSessions` — Contexto da semana anterior
- `insights.generateReport` — Ritmo e efetividade
- `insights.getWeaknesses` — Tópicos fracos

**Commands:**
- `/ul-plan-retro` — Antes de criar novo plano
- `/ul-study-start` — Começar a executar
- `/ul-plan-decompose` — Se não tem learning-map
- `/ul-plan-adjust` — Ajustar plano durante a semana

---

*Command: /ul-plan-weekly — Criar plano semanal detalhado*