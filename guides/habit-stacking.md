# 🔗 Habit Stacking (Empilhamento de Hábitos)

> **Técnica de**: James Clear (Atomic Habits)  
> **Princípio**: Acople novos hábitos a hábitos existentes

---

## O que é Habit Stacking

**Definição**: Conectar um novo hábito (estudo) a um gatilho que já existe na sua rotina.

**Metáfora**:
```
❌ Criar novo gatilho: "Vou estudar às 19h"
   → Depende de vontade, lembrança, energia

✅ Usar gatilho existente: "Após café da manhã, estudo 25 min"
   → Automático, confiável, sem esforço mental
```

**Fórmula**:
```
"Após [HÁBITO EXISTENTE], eu vou [NOVO HÁBITO]"
```

---

## Por que Funciona

### 1. Gatilhos já existem
- Você já toma café, almoça, janta **todos os dias**
- Não precisa criar lembranças novas
- **Confiabilidade**: 100% dos dias você faz o gatilho

### 2. Reduz decisões
- Não decide "quando estudar" → Já está definido
- Economiza energia mental
- Elimina procrastinação por indecisão

### 3. Cria sequência
```
Gatilho → Hábito 1 → Hábito 2 → Recompensa
  ↓          ↓          ↓           ↓
Café     → Estudo   → Descanso  → Satisfação
```

---

## Como Implementar

### Passo 1: Identificar Gatilhos Existentes

**Gatilhos confiáveis** (100% frequência):
- ☕ **Café da manhã** — Todo dia
- 🍽️ **Almoço** — Todo dia
- 🌙 **Jantar** — Todo dia
- 🪥 **Escovar dentes** — Todo dia
- 🛏️ **Deitar na cama** — Todo dia
- 📱 **Checar notificações** — Todo dia

**Evitar**:
- ❌ "Quando chegar em casa" (hora varia)
- ❌ "Antes de dormir" (pode estar cansado)
- ❌ "Quando tiver tempo" (subjetivo)

---

### Passo 2: Definir Cadeias de Hábitos

#### Cadeia 1: Manhã (Alto Desempenho)
```
☕ Após café da manhã:
   → /ul-study-start (25 min)
   → [Breve descanso 5 min]
   → /ul-practice-drill (25 min)
   
✅ Total: 55 min de estudo antes do dia começar
```

#### Cadeia 2: Almoço (Recuperação)
```
🍽️  Após almoço:
   → 10 min de pausa digestiva
   → /ul-memory-review (10 min SRS)
   → Voltar ao trabalho
   
✅ Total: 20 min de revisão leve
```

#### Cadeia 3: Noite (Manutenção)
```
🌙 Após jantar:
   → /ul-practice-quiz 5 [tópico] (10 min)
   → Preparar-se para dormir
   
✅ Total: 10 min de retrieval leve
```

---

### Passo 3: Criar Sequência Pessoal

**Template**:
```
## Minha Cadeia de Estudo

**Manhã**:
Após [___], eu vou [___] por [___] min

**Almoço**:
Após [___], eu vou [___] por [___] min

**Noite**:
Após [___], eu vou [___] por [___] min
```

**Exemplo preenchido**:
```
## Minha Cadeia - Maria

**Manhã**:
Após [café], eu vou [/ul-study-start] por [50] min

**Almoço**:
Após [almoço], eu vou [/ul-memory-review] por [10] min

**Noite**:
Após [jantar], eu vou [/ul-practice-quiz 3] por [15] min

✅ Total diário: 75 min de estudo estruturado
```

---

## Exemplos Práticos

### Exemplo 1: Desenvolvedor Trabalhador
```
Rotina:
6:30 — Acorda
7:00 — Café da manhã
   → ESTUDO (30 min)
7:30 — Prepara-se para trabalho

12:00 — Almoço
   → ESTUDO (15 min SRS)
12:30 — Volta ao trabalho

18:00 — Chega em casa
19:00 — Jantar
   → ESTUDO (30 min)
19:30 — Descanso/lazer
```

### Exemplo 2: Estudante Universitário
```
Rotina:
8:00 — Acorda
8:30 — Café
   → ESTUDO (60 min)
9:30 — Aulas

12:00 — Almoço
   → ESTUDO (10 min SRS)
12:20 — Volta às aulas

18:00 — Jantar
   → ESTUDO (45 min projeto)
18:45 — Lazer/descanso
```

### Exemplo 3: Pai/Mãe Ocupado
```
Rotina:
6:00 — Acorda
6:30 — Café (antes crianças acordarem)
   → ESTUDO (25 min)
6:55 — Acorda crianças

13:00 — Almoço (no trabalho)
   → ESTUDO (10 min SRS)

21:00 — Crianças dormem
   → ESTUDO (30 min)
21:30 — Descanso
```

---

## Regras de Ouro

### ✅ FAÇA:
- **Comece pequeno**: 10-25 min por sessão
- **Seja específico**: "Após café" não "de manhã"
- **Use o mesmo gatilho**: Consistência cria automação
- **Tenha backup**: Se perder manhã, use almoço

### ❌ NÃO FAÇA:
- Criar múltiplos gatilhos para o mesmo hábito
- Depender de "quando der tempo"
- Mudar gatilhos frequentemente
- Pular dois dias seguidos (quebra cadeia)

---

## Integração com Commands

### Commands Recomendados por Momento

| Gatilho | Command | Duração | Intensidade |
|---------|---------|---------|-------------|
| Café manhã | `/ul-study-start` → `/ul-practice-*` | 25-50 min | Alta |
| Almoço | `/ul-memory-review` | 10 min | Baixa |
| Jantar | `/ul-practice-quiz` | 10-15 min | Média |
| Antes de dormir | `/ul-memory-review` | 5-10 min | Baixa |

### Sequência Ideal
```
Manhã:  /ul-study-start → /ul-practice-drill (conceito difícil)
Almoço: /ul-memory-review (revisão leve)
Noite:  /ul-practice-quiz (retrieval rápido)
```

---

## Métricas de Sucesso

| Métrica | Semana 1 | Semana 4 | Mês 3 |
|---------|----------|----------|-------|
| Dias completados | 3/7 | 5/7 | 6/7 |
| Consistência | 43% | 71% | 86% |
| Hábito automático | Não | Quase | Sim |

**O hábito está funcionando quando**:
- ✅ Estudar sem pensar (automação)
- ✅ Sentir estranho se pular
- ✅ Não precisar de motivação

---

## Solução de Problemas

### "Não consigo estudar de manhã"
**Solução**: Mova para almoço ou noite. Não force o momento.

### "Sempre esqueço no meio da semana"
**Solução**: Use reminder no celular por 21 dias. Depois o hábito sustenta.

### "Gatilho não acontece no mesmo horário"
**Solução**: Escolha gatilho com horário fixo (ex: escovar dentes > café).

### "Sobrecarreguei com muitos hábitos"
**Solução**: Comece com 1 cadeia apenas. Adicione outra após 30 dias.

---

## Resumo

**Fórmula do Sucesso**:
```
Hábito Automático = Gatilho Existente + Micro-hábito + Repetição (21+ dias)
```

**Chave**: Não crie novos gatilhos. Use os que já existem.

---

**Relacionado**:
- [pomodoro.md](./pomodoro.md) — Técnica para sessões focadas
- [environment-design.md](./environment-design.md) — Criar ambiente propício
- [atomic-habits.md](./atomic-habits.md) — Framework completo de hábitos

---

*Técnica de James Clear — Atomic Habits*
