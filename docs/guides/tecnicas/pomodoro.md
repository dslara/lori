# 🍅 Guia Completo: Técnica Pomodoro

> **Última atualização**: 2026-02-18  
> **Versão**: 1.0  
> **"O segredo da produtividade é trabalhar em ciclos, não em maratonas"**

---

## 📋 Índice

- [O que é a Técnica Pomodoro](#o-que-e-a-tecnica-pomodoro)
- [Por que usar](#por-que-usar)
- [Quando Usar](#quando-usar)
- [Como Usar](#como-usar-passo-a-passo)
- [Framework 3D](#framework-3d)
- [Boas Práticas](#boas-praticas)
- [Workflow](#workflow-tipico)
- [Métricas](#metricas)
- [Resumo](#resumo-regras-de-ouro)
- [Exemplos Completos](#exemplos-completos)

---

## 🎯 O que é a Técnica Pomodoro? 
### Definição
A **Técnica Pomodoro** é um método de gerenciamento de tempo que divide o trabalho em **intervalos de 25 minutos** (chamados "pomodoros") separados por **pausas curtas de 5 minutos**. Após 4 pomodoros, faz-se uma **pausa longa de 15-30 minutos**.

### Criada por
**Francesco Cirillo** - Desenvolveu a técnica em 1980 usando um timer de cozinha em formato de tomate ("pomodoro" em italiano).

### Estrutura Básica

```
🍅 Pomodoro 1 (25 min) → ☕ Pausa (5 min)
🍅 Pomodoro 2 (25 min) → ☕ Pausa (5 min)
🍅 Pomodoro 3 (25 min) → ☕ Pausa (5 min)
🍅 Pomodoro 4 (25 min) → 🌴 Pausa Longa (15-30 min)
```

### 🔗 Relação com Dra. Barbara Oakley (A Mind for Numbers)
As pausas do Pomodoro ativam o **modo difuso** do cérebro, permitindo insights inconscientes quando travado em problemas complexos.

### 🔗 Princípios Relacionados

**Implementa:**
- **[2-focus.md](../principios/2-focus.md)** - Princípio #2: Focus

**Complementa:**
- [focused-diffuse.md](focused-diffuse.md) - Gestão intencional dos modos

### 🔗 Relação com James Clear (Atomic Habits)
**Habit Stacking**: Acople o Pomodoro a um hábito existente:
- "Após tomar café, inicio 1 Pomodoro"
- "Após almoço, faço revisão SRS"
- Cria cadeia de hábitos automáticos

---

## 💡 Por que usar?

### Benefícios Científicos

| Benefício | Explicação | Impacto |
|-----------|------------|---------|
| **Reduz procrastinação** | 25 min é psicologicamente gerenciável | Começar fica mais fácil |
| **Prevents burnout** | Pausas regulares mantêm energia | Sessões mais longas |
| **Melhora retenção** | Foco intenso + descanso consolida memória | Aprendizado mais eficiente |
| **Aumenta awareness** | Timer cria senso de urgência | Menos distrações |
| **Data tracking** | Conta pomodoros completados | Métricas objetivas |

### Implementação do Princípio #2 (Focus)

```markdown
Sem Pomodoro:
- "Vou estudar por 3 horas" → Procrastina, distrações, burnout

Com Pomodoro:
- "Vou fazer 4 pomodoros (2h efetivas)" → Foco total, pausas, sustentável
```

---

## 🧠 Quando Usar

### ✅ USE Pomodoro

| Situação | Por quê funciona |
|----------|------------------|
| **Estudar conceitos novos** | Foco intenso sem burnout |
| **Codificar projetos** | Prevents "só mais 5 minutos" que vira 2h |
| **Resolver problemas complexos** | Pausa permite insight (efeito incubation) |
| **Tarefas que você evita** | 25 min parece gerenciável |
| **Manhãs de baixa energia** | Estrutura ajuda a começar |

### ❌ NÃO USE Pomodoro

| Situação | Use isto em vez |
|----------|-----------------|
| **Tarefas criativas em flow** | Continue! Não interrompa flow |
| **Reuniões/calls** | Timing não é controlável |
| **Atividades <10 min** | Overhead de setup não vale |
| **Sessões de SRS/flashcards** | [flashcards.md](flashcards.md) - revisão tem ritmo próprio |

---

## 🛠️ Como Usar (Passo a Passo)

### Preparação (5 min)

#### Passo 1: Definir a Tarefa
```bash
# Escolha 1 tarefa específica para o pomodoro
# ❌ RUIM: "Estudar Rust" (vago)
# ✅ BOM: "Implementar bubble sort" (específico)
```

**Checklist de preparação**:
- [ ] Tarefa definida (escreva no papel)
- [ ] Material aberto (só o necessário)
- [ ] Timer pronto (app, site, ou físico)

#### Passo 2: Configurar Timer

```bash
# Opções de timer:

# 1. Terminal (simples)
# sleep 25m && notify-send "Pomodoro finalizado!"

# 2. Aplicativos recomendados:
# - Pomofocus.io (web)
# - Forest (mobile)
# - GNOME Pomodoro (Linux)
# - Focus To-Do (cross-platform)

# 3. Comando customizado
# pomodoro --work 25 --break 5
```

---

### Execução do Ciclo

#### 🍅 Pomodoro (25 min) - FOCO TOTAL

```markdown
REGRAS INQUEBRÁVEIS:
1. NÃO pause o timer
2. NÃO cheque celular/email
3. NÃO mude de tarefa
4. SE distração surgir: anote em papel e volte
5. SE terminar antes: revise ou estude relacionado

DICA: Foque em QUALIDADE, não quantidade
```

**O que fazer se...**
- **Interrompido por alguém**: "Estou num pomodoro, volto em X minutos"
- **Termina tarefa antes**: Estude a fundo, faça exercícios, ou revise
- **Travou no problema**: Anote, prossiga, retorne na próxima sessão

#### ☕ Pausa Curta (5 min) - DESCANSO ATIVO

```markdown
✅ FAÇA:
- Levantar da cadeira
- Caminhar/esticar
- Olhar para longe (descansar olhos)
- Água/banheiro
- Respiração profunda

❌ NÃO FAÇA:
- Checar celular (vai virar 30 min)
- Continuar trabalhando
- Ler emails/mensagens
- Ficar sentado
```

**Regra de ouro**: Pausa é parte do pomodoro, não "tempo perdido"

#### 🌴 Pausa Longa (15-30 min) - RECUPERAÇÃO

Após 4 pomodoros:
- Algoção leve se necessário
- Exercício físico leve
- Natureza/luz do sol se possível
- Afaste-se completamente da tarefa

---

### Variações da Técnica

#### Pomodoro Adaptativo

```markdown
# Iniciante (foco fraco)
🍅 15 min trabalho → ☕ 5 min pausa

# Padrão (recomendado)
🍅 25 min trabalho → ☕ 5 min pausa

# Avançado (flow state)
🍅 50 min trabalho → ☕ 10 min pausa

# Deep Work (tarefas complexas)
🍅 90 min trabalho → ☕ 20 min pausa
```

**Como escolher**:
- Comece com 25/5 (padrão)
- Aumente gradualmente conforme capacidade de foco melhora
- Tarefas criativas podem precisar de blocos maiores

---

## 🎯 Framework 3D

### Onde Pomodoro se Encaixa no Framework 3D

| Dimensão | % Tempo | Como Pomodoro Ajuda |
|----------|---------|---------------------|
| **Conceitos** | 40% | Foco intenso para entender (#feynman) |
| **Fatos** | 30% | Revisão SRS pode usar pomodoros curtos |
| **Procedimentos** | 30% | Drill de skills (#drill) em pomodoros |

### Integração com Outras Técnicas

```bash
# Sessão de Estudo Completa (2h)

10:00-10:25 | 🍅 Pomodoro 1: Estudar conceito novo
            |     → Usar #feynman para entender
10:25-10:30 | ☕ Pausa
10:30-10:55 | 🍅 Pomodoro 2: Criar flashcards
            |     → Fatos relacionados ao conceito
10:55-11:00 | ☕ Pausa
11:00-11:25 | 🍅 Pomodoro 3: Drill de procedimento
            |     → #drill de código/sintaxe
11:25-11:30 | ☕ Pausa
11:30-11:55 | 🍅 Pomodoro 4: Projeto (#directness)
            |     → Aplicar conceito em código real
11:55-12:25 | 🌴 Pausa Longa (30 min)
```

**Resultado**: 4 pomodoros = 1h40min de foco real + descanso sustentável

---

## ✍️ Boas Práticas

### ✅ BOM: Pomodoro Realista

```markdown
# ✅ CERTO: Planejamento flexível

Meta do dia: 8 pomodoros (4h foco real)
- Manhã: 4 pomodoros (conceitos novos)
- Tarde: 2 pomodoros (revisão)
- Noite: 2 pomodoros (projeto)

SE não completar 8: Tudo bem! 6 já é ótimo.
SE completar 10: Excelente, mas não esperado.
```

```markdown
# ❌ RUIM: Metas irreais

"Vou fazer 16 pomodoros hoje!" (8h foco)
→ Burnout no 6º pomodoro
→ Desiste completamente
→ Frustração
```

### ✅ BOM: Tarefa Única por Pomodoro

```markdown
# ✅ CERTO: Foco singular

🍅 Pomodoro: Implementar binary search
- Só isso
- Nada mais
- Se terminar antes: testes ou otimização
```

```markdown
# ❌ RUIM: Multi-tasking

🍅 Pomodoro: "Estudar Rust"
- Ler sobre ownership (10 min)
- Checar email (ops!)
- Implementar linked list (15 min)
- Pensar no jantar...

Resultado: Superficial em tudo, profundo em nada
```

### ✅ BOM: Respeitar as Pausas

```markdown
# ✅ CERTO: Pausa é sagrada

Timer tocou → PARA imediatamente
Mesmo que:
- Esteja "no flow" (anote onde parou)
- Quase terminando (termina no próximo)
- Tenha uma ideia (anote e pausa)

Por quê: Pausa permite consolidação da memória
```

```markdown
# ❌ RUIM: Pular pausas

"Só mais 5 minutos..."
→ 30 min depois: Burnout
→ Próximo pomodoro: 50% eficiência
→ Acumula fadiga
```

### ✅ BOM: Tracking Objetivo

```bash
# Arquivo: ~/study-log.md

## 2026-02-18

### Pomodoros Completados: 6/8
- 🍅 10:00 - Binary search study (#feynman)
- 🍅 10:30 - Flashcards creation
- 🍅 11:00 - Binary search drill
- 🍅 14:00 - Rust project work
- 🍅 14:30 - Code review
- 🍅 15:00 - Documentation

### Interrupções: 2
- 10:15: Mensagem (ignorada ✓)
- 14:45: Pergunta do colega (atrasou 2 min)

### Qualidade de Foco: 8/10
```

---

## 🔄 Workflow Típico

### Dia de Estudo com Pomodoros

```
08:00 | Preparação (15 min)
      | - Revisar plano do dia
      | - Preparar ambiente
      | - Configurar timer
      ↓
08:15 | 🍅 Pomodoro 1 (25 min)
      | - Conteúdo mais difícil (energia alta)
      ↓
08:40 | ☕ Pausa (5 min)
      | - Café, água, alongamento
      ↓
08:45 | 🍅 Pomodoro 2 (25 min)
      | - Continuar ou próximo tópico
      ↓
09:10 | ☕ Pausa (5 min)
      ↓
09:15 | 🍅 Pomodoro 3 (25 min)
      ↓
09:40 | ☕ Pausa (5 min)
      ↓
09:45 | 🍅 Pomodoro 4 (25 min)
      ↓
10:10 | 🌴 Pausa Longa (30 min)
      | - Café da manhã completo
      | - Descanso total
      ↓
10:40 | Repete ciclo (4 pomodoros)
      ↓
12:40 | 🌴 Pausa Longa (almoço)
      ↓
...
```

**Total típico**: 6-8 pomodoros/dia = 2.5-3.5h foco real (produtividade alta!)

---

## 📊 Métricas

### Indicadores de Sucesso

| Métrica | Verde ✅ | Amarelo ⚠️ | Vermelho 🔴 |
|---------|----------|------------|-------------|
| **Pomodoros/dia** | 6-10 | 4-5 | <4 ou >12 |
| **Taxa de conclusão** | >80% | 60-80% | <60% |
| **Interrupções/pomodoro** | 0-1 | 2 | 3+ |
| **Pausas respeitadas** | 100% | 80% | <80% |
| **Qualidade subjetiva** | 8-10/10 | 6-7/10 | <6/10 |

### Tracking Semanal

```markdown
## Semana: 2026-W08

| Dia | Meta | Real | Qualidade | Observações |
|-----|------|------|-----------|-------------|
| Seg | 8    | 7    | 9/10      | Ótimo foco  |
| Ter | 8    | 6    | 7/10      | Reuniões    |
| Qua | 8    | 8    | 10/10     | Flow state  |
| Qui | 8    | 5    | 6/10      | Distrações  |
| Sex | 6    | 6    | 8/10      | Consistente |

**Total**: 32/38 (84%) ✅
**Média qualidade**: 8/10 ✅
```

### Red Flags

| Sinal | Problema | Solução |
|-------|----------|---------|
| 🚩 0 pomodoros completados | Procrastinação grave | Use "2-Minute Rule" (ver [2-focus.md](../principios/2-focus.md)) |
| 🚩 Pula todas as pausas | Burnout iminente | Force pausa, mesmo contra vontade |
| 🚩 Metas nunca atingidas | Expectativas irreais | Reduza meta para 4 pomodoros/dia |
| 🚩 Qualidade baixa (<6) | Tarefa muito difícil ou distrações | Simplifique ou melhore ambiente |

---

## 🎓 Resumo: Regras de Ouro

### ✅ 5 Regras para Pomodoro Efetivo

1. **Uma tarefa por pomodoro**
   - ✅ Específico: "Implementar binary search"
   - ❌ Vago: "Estudar"

2. **Timer visível e sonoro**
   - ✅ Timer na tela ou físico
   - ❌ "Vou olhar o relógio" (esquece)

3. **Pausas são sagradas**
   - ✅ Pare quando tocar
   - ❌ "Só mais 5 minutos"

4. **Interrupções = anotar e voltar**
   - ✅ "Pensar depois" lista
   - ❌ Lidar imediatamente

5. **Metas realistas**
   - ✅ 6-8 pomodoros/dia
   - ❌ 16 pomodoros (burnout)

---

## 📝 Exemplos Completos

### Exemplo 1: Sessão de Estudo de 2 Horas

#### Contexto
Estudando algoritmos de sorting (Semana 31-34).

#### Plano de Pomodoros
```markdown
Meta: 4 pomodoros (1h40min foco)

🍅 1. 10:00-10:25 | Estudar merge sort
   - Ler teoria
   - Fazer anotações
   - #feynman: Explicar como funciona

☕ Pausa: 10:25-10:30

🍅 2. 10:30-10:55 | Criar flashcards
   - Complexidade: O(n log n)
   - Pré-requisito: Array ordenado
   - Trade-offs vs quicksort

☕ Pausa: 10:55-11:00

🍅 3. 11:00-11:25 | Drill de merge sort
   - Implementar do zero
   - Tentativa 1: COM consulta
   - Tentativa 2: SEM consulta

☕ Pausa: 11:00-11:30

🍅 4. 11:30-11:55 | Mini-projeto
   - Adicionar merge sort ao visualizer
   - Testar com dados reais

🌴 Pausa Longa: 11:55-12:25
```

#### Execução
```
10:00 | Timer iniciado, celular no modo avião
10:15 | Interrupção: mensagem (ignorada ✓)
10:25 | Timer tocou → PARA (merge sort não terminado, anotar para próximo)

10:30 | Pomodoro 2 iniciado
10:55 | Flashcards criados: 5 cards

11:00 | Pomodoro 3 iniciado
11:10 | Erro de implementação (debug leva 15 min)
11:25 | Timer tocou → PARA (merge incompleto, OK)

11:30 | Pomodoro 4 iniciado
11:55 | Projeto avançou 60% ✅

Resultado: 4/4 pomodoros completados ✅
```

---

### Exemplo 2: Recuperação de Burnout

#### Contexto
Estudante tentou estudar 12h/dia, queimou, zerou produtividade.

#### Plano de Recuperação
```markdown
Semana 1: Reconstruir hábito
- Meta: 2 pomodoros/dia (só!)
- Foco: Começar, não quantidade

Semana 2: Estabilizar
- Meta: 4 pomodoros/dia
- Foco: Consistência

Semana 3+: Normalizar
- Meta: 6-8 pomodoros/dia
- Foco: Qualidade
```

#### Dia 1 (Recuperação)
```
Meta: 2 pomodoros

🍅 1. 10:00-10:25 | Revisar conceito simples
   - Só releitura, nada novo
   - Meta: sentir-se confortável

☕ Pausa: 10:25-10:30

🍅 2. 10:30-10:55 | Criar 3 flashcards
   - Só 3 cards, nada mais

🌴 Pausa Longa: 10:55-11:25

Resultado: 2/2 ✅ (sucesso!)
```

**Feedback**: "Começar pequeno funciona. Dois pomodoros parecem pouco, 
mas depois de uma semana voltei a sentir prazer em estudar."

---

## 🔗 Links Relacionados

- [2-focus.md](../principios/2-focus.md) - Princípio #2: Focus
- environment-design - Preparar ambiente
- [feynman.md](feynman.md) - Técnica Feynman (para conceitos)
- [drill.md](drill.md) - Drill de procedimentos
- [flashcards.md](flashcards.md) - Revisão SRS
- [Índice](../README.md) - Índice completo

---

## 💡 Dica Final

**Pomodoro não é sobre tempo, é sobre compromisso.**

O valor não está nos 25 minutos - está na promessa:
- "Nesses 25 minutos, eu me comprometo 100%"
- "Nessa pausa, eu descanso 100%"

25 minutos de foco total vale mais que 2 horas distraído.

**"Time is what we want most, but what we use worst."** - William Penn

---

**Criado por**: @meta  
**Data**: 2026-02-18  
**Versão**: 1.0
