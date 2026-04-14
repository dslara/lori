# 📚 Guia Completo: Spaced Repetition System (SRS)

> **Última atualização**: 2026-02-18  
> **Versão**: 1.0  
> **"Revisar no momento certo é mais eficiente que revisar muito"**

---

## 📋 Índice

- [O que é SRS](#o-que-e-srs)
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

## 🎯 O que é SRS? 
### Definição
**Spaced Repetition System (SRS)** é um algoritmo que calcula o momento ótimo para revisar informações, baseado na Curva do Esquecimento de Ebbinghaus. Em vez de revisar tudo igualmente, você revisa cada item no exato momento em que está prestes a esquecê-lo.

### Como Funciona

```
Curva do Esquecimento:

Retenção
  100% ┤██████
       │      ██████
   50% │            ██████
       │                  ██████
   25% │                        ██████
       │                              ██████
    0% └────┬───────┬─────────┬─────────┬────
           1h      1d        3d        7d
           ⬆️      ⬆️        ⬆️        ⬆️
        Revisão  Revisão  Revisão  Revisão
        (reinicia (aumenta (aumenta (aumenta
        intervalo) intervalo) intervalo) intervalo)
```

**Sem SRS**: Esquece 70% em 24h  
**Com SRS**: Retém 80%+ a longo prazo com 1/10 do esforço

### 🔗 Princípios Relacionados

**Implementa:**
- **[7-retention.md](../principios/7-retention.md)** - Princípio #7: Retention

**Complementa:**
- [flashcards.md](flashcards.md) - Criar e usar flashcards
- [mnemonics.md](mnemonics.md) - Técnicas mnemônicas
- [feynman.md](feynman.md) - Validar entendimento antes de memorizar

---

## 💡 Por que usar?

### Benefícios Científicos

| Benefício | Mecanismo | Resultado |
|-----------|-----------|-----------|
| **Eficiência 10x** | Revisa só quando necessário | 80% de retenção com 20% do esforço |
| **Consolidação** | Revisão no ponto crítico | Memória de curto → longo prazo |
| **Personalização** | Cada item tem intervalo próprio | Foco no que você realmente esquece |
| **Previsibilidade** | Sabe quanto revisar por dia | Planejamento consistente |

### Eficiência do SRS vs Estudo Tradicional

```markdown
## Estudar Vocabulary (1000 palavras)

### Método Tradicional (Sem SRS)
- Semana 1: Estuda 100 palavras
- Semana 2: Esqueceu 70 → Reestuda 100 palavras
- Semana 3: Esqueceu 80 → Reestuda 100 palavras
- ...
- Total após 10 semanas: ~500 revisões, reteve ~200 palavras

### Método SRS
- Dia 1: Estuda 20 palavras novas
- Dia 2: Revisa 20 (fáceis → +3 dias, difíceis → +1 dia)
- Dia 3: Estuda 20 palavras novas + revisa algumas
- ...
- Total após 10 semanas: ~150 revisões, reteve ~800 palavras
```

---

## 🧠 Quando Usar

### ✅ USE SRS

| Tipo de Conteúdo | Exemplo | Por que SRS funciona |
|------------------|---------|----------------------|
| **Vocabulário** | Termos técnicos, idiomas | Muitos itens, revisão espaçada ideal |
| **Fórmulas** | Big O, logaritmos | Precisa recall instantâneo |
| **Sintaxe** | Comandos Zig, Git | Memória procedural |
| **Definições** | Conceitos chave | Base para entendimento |
| **Fatos técnicos** | Portas HTTP, códigos de erro | Consulta frequente |
| **Comandos CLI** | Docker, Kubernetes | Automação através de repetição |

### ❌ NÃO USE SRS

| Tipo | Por que NÃO SRS | Use isto em vez |
|------|----------------|-----------------|
| **Conceitos complexos** | Requer entendimento, não memorização | [feynman.md](feynman.md) |
| **Procedimentos** | Precisa de prática hands-on | [drill.md](drill.md) |
| **Intuição** | Não se memoriza, se desenvolve | [analogy.md](analogy.md) |
| **Projetos** | Aprende fazendo | [directness.md](directness.md) |
| **Skills criativas** | Não há "resposta certa" | Prática deliberada |

---

## 🛠️ Como Usar (Passo a Passo)

### Algoritmos de SRS

#### Algoritmo SM-2 (Padrão)

```python
def calcular_intervalo(intervalo_atual, facilidade, resposta):
    """
    resposta: 0=Errou, 3=Difícil, 4=Médio, 5=Fácil
    facilidade: começa em 2.5
    """
    if resposta < 3:
        return 1  # Reinicia
    
    if intervalo_atual == 1:
        novo_intervalo = 1
    elif intervalo_atual == 2:
        novo_intervalo = 6
    else:
        novo_intervalo = round(intervalo_atual * facilidade)
    
    # Ajusta facilidade
    facilidade = max(1.3, facilidade + (0.1 - (5 - resposta) * (0.08 + (5 - resposta) * 0.02)))
    
    return novo_intervalo
```

#### Progressão Típica de Intervalos

```markdown
| Tentativa | Avaliação | Próxima Revisão | Intervalo |
|-----------|-----------|-----------------|-----------|
| 1ª        | -         | +1 dia          | 1 dia     |
| 2ª        | Fácil     | +6 dias         | 6 dias    |
| 3ª        | Fácil     | +15 dias        | 15 dias   |
| 4ª        | Fácil     | +37 dias        | 37 dias   |
| 5ª        | Fácil     | +90 dias        | 3 meses   |
| 6ª        | Fácil     | +225 dias       | 7 meses   |
```

### Método Completo (20 min/dia)

#### Passo 1: Configurar Sistema (5 min)

```bash
# 1. Escolher ferramenta
# Opções:
# - Anki (desktop/mobile) - Mais popular
# - Mochi.cards - Minimalista
# - Memrise - Cursos prontos
# - Sistema próprio (CSV + script)

# 2. Criar deck para cada módulo
mkdir -p knowledge/srs/
echo "deck: M1-Math-Foundations" > knowledge/srs/config.ini
echo "deck: M2-Zig-Fundamentals" >> knowledge/srs/config.ini
```

**Ferramentas Recomendadas:**

| Ferramenta | Plataforma | Melhor para | Preço |
|------------|-----------|-------------|-------|
| **Anki** | Desktop/Mobile | Controle total, algoritmo SM-2 | Grátis |
| **Mochi** | Web/Desktop | Interface limpa, markdown nativo | Freemium |
| **RemNote** | Web | Notas + SRS integrado | Freemium |
| **CSV + Script** | Terminal | Personalização total | Grátis |

---

#### Passo 2: Criar Cards (10 min durante estudo)

```bash
# Durante sessão de estudo, crie cards:
nano knowledge/srs/new-cards.csv
```

**Formato de Card:**
```csv
front,back,tags,created
"O que significa ∈?","Pertence (elemento de conjunto)","M1-math,symbols","2026-02-18"
"log₂(64) = ?","6","M1-math,logarithms","2026-02-18"
"Zig: Como criar ArrayList?","std.ArrayList.init(allocator)","M2-zig,syntax","2026-02-18"
```

**Boas práticas de criação:**
- ✅ 1 pergunta = 1 resposta
- ✅ Resposta curta (< 20 palavras)
- ✅ Inclua contexto na pergunta
- ❌ Não crie cards de conceitos que não entendeu

---

#### Passo 3: Revisar Diariamente (15-20 min)

```bash
/ul-study-recall
```

**Fluxo de Revisão:**
```markdown
1. Sistema mostra card:
   [FRONT] "O que é Big O notation?"

2. Você responde mentalmente (não olhe!):
   "Notação para descrever limite superior assintótico"

3. Sistema mostra verso:
   "Limite superior assintótico (comportamento quando n→∞)"

4. Você avalia:
   - 😊 Fácil (acertou perfeitamente) → Intervalo × 2.5
   - 🤔 Médio (acertou com hesitação) → Intervalo × 1.5
   - 😰 Difícil (quase errou) → Intervalo × 1.2
   - ❌ Errou → Intervalo = 1 dia

5. Sistema atualiza e mostra próximo card
```

---

#### Passo 4: Sincronizar e Manter (5 min/semana)

```bash
# Backup semanal
cp knowledge/srs/master-deck.csv knowledge/srs/backup/

# Sincronizar entre dispositivos
# (se usar Anki: sincronização automática)
# (se usar CSV: git commit/push)

# Limpar cards obsoletos
# Remova cards de conteúdo que não é mais relevante
```

---

### Método Rápido via @tutor

```bash
# Durante sessão de estudo
/ul-study-start

# Escolha: 5. SRS Review
> @tutor #srs review

# @tutor vai:
# 1. Selecionar cards pendentes para hoje
# 2. Mostrar frente
# 3. Aguardar sua resposta mental
# 4. Mostrar verso
# 5. Registrar sua avaliação
# 6. Ajustar intervalo automaticamente
# 7. Mostrar estatísticas ao final
```

---

## 🎯 Framework 3D

### Onde SRS se Encaixa

| Dimensão | % Tempo | Método | SRS? |
|----------|---------|--------|------|
| **Conceitos** | 40% | #feynman, #intuition | ❌ Não |
| **Fatos** | 30% | **SRS** | ✅ **SIM** |
| **Procedimentos** | 30% | #drill, #directness | ❌ Não |

### Integração com Outras Técnicas

```bash
# Ordem correta de aprendizado:

# 1. ENTENDER (não use SRS ainda!)
@tutor #feynman "O que é Big O?"
# → Você explica o conceito

# 2. MEMORIZAR FATOS (agora sim, use SRS)
# Criar cards:
# "Big O é notação de...?" → "limite superior assintótico"
# "O(n) é melhor que O(n²)?" → "Sim"
# "O(log n) cresce mais rápido que O(n)?" → "Não"
/ul-study-recall

# 3. PRATICAR (não use SRS!)
@tutor #drill "analisar complexidade de 10 algoritmos"

# 4. APLICAR (não use SRS!)
@tutor #directness "criar projeto usando análise de complexidade"
```

---

## ✍️ Boas Práticas

### ✅ BOM: Cards Atômicos

```csv
# ✅ BOM: 1 pergunta, 1 resposta, específico
"log₂(64) = ?","6","M1-math"
"∈ significa?","Pertence (elemento de conjunto)","M1-math"
"Zig: ArrayList.init() retorna?","ArrayList(T)","M2-zig"
```

**Por que funciona:**
- Pode responder em 5-10 segundos
- Clareza total do que está sendo perguntado
- Fácil avaliar se acertou

---

### ❌ RUIM: Cards Vagos ou Complexos

```csv
# ❌ RUIM: Pergunta ampla
"Explique Big O notation","Big O é uma notação matemática...","M1-math"
# Problema: Resposta longa, difícil avaliar

# ❌ RUIM: Múltiplas perguntas
"O que é Big O e como calcula?","Big O é notação... calcula contando...","M1-math"
# Problema: Duas perguntas em uma

# ❌ RUIM: Sem contexto
"Qual a complexidade?","O(n)","M1-math"
# Problema: Complexidade de QUÊ?
```

**Corrija assim:**
```csv
# Divida em cards específicos:
"Big O é notação de...?","limite superior assintótico","M1-math"
"Busca linear em array é O(?)","O(n)","M1-math"
"Binary search é O(?)","O(log n)","M1-math"
```

---

### ✅ BOM: Cards com Contexto

```csv
# ✅ BOM: Contexto claro
"Zig: Como declarar HashMap?","var map = std.AutoHashMap(K,V).init(allocator);","M2-zig"
"Git: Como ver histórico em formato curto?","git log --oneline","tools"
"Big O: Complexidade de merge sort?","O(n log n)","M3-ds"
```

**Por que funciona:**
- Evita ambiguidade
- Conecta com aplicação real
- Facilita recall

---

### ✅ BOM: Revisar no Horário Certo

```markdown
## Agenda Ideal de SRS

### Manhã (Melhor)
07:00 - SRS Review (15-20 min)
      - Cérebro fresco
      - Retenção máxima
      - Não interfere no estudo

### NÃO Faça
23:00 - SRS Review
      - Cérebro cansado
      - Baixa qualidade de avaliação
      - Pode afetar sono
```

---

### ❌ RUIM: Acumular Revisões

```bash
# ❌ NÃO FAÇA:
# Segunda: 50 cards pendentes (faz 20, deixa 30)
# Terça: 30 pendentes + 20 novos = 50
# Quarta: 50 pendentes + 20 novos = 70
# ...
# Sexta: 200 cards pendentes → Desiste do SRS

# ✅ FAÇA:
# Defina limite diário
MAX_CARDS_PER_DAY=50

# Se acumular, use "modo catch-up":
# - Priorize cards recentes
# - Suspense novos cards até zerar backlog
# - Ou divida: 50 cards manhã, 50 cards noite
```

---

## 🔄 Workflow Típico

### Dia de Estudo com SRS

```
07:00 ┤ SRS Review (15 min)
      │ → 20-30 cards pendentes
      │ → Avalia cada um
      │ → Sistema atualiza intervalos
      ↓
07:15 ┤ Estudo novo conteúdo
      │ → Assiste vídeo/lê capítulo
      │ → Toma notas
      ↓
08:00 ┤ Criar cards SRS
      │ → Identifica 5-10 fatos importantes
      │ → Cria cards no formato CSV
      ↓
08:10 ┤ Continua estudo
      │ → #feynman para conceitos
      │ → #drill para procedimentos
      ↓
20:00 ┤ Sincronizar
      │ → Salva novos cards
      │ → Backup do master-deck
      ↓
20:05 ┤ Fim
```

**Total SRS por dia: 20-25 minutos**

---

### Semana Típica

| Dia | Atividade SRS | Duração |
|-----|---------------|---------|
| **Segunda** | Review + Novos cards | 25 min |
| **Terça** | Review + Novos cards | 25 min |
| **Quarta** | Review + Novos cards | 25 min |
| **Quinta** | Review apenas | 15 min |
| **Sexta** | Review apenas | 15 min |
| **Sábado** | Review + Catch-up se necessário | 30 min |
| **Domingo** | Review leve | 10 min |

---

## 📊 Métricas

### Indicadores de Sucesso

| Métrica | Verde ✅ | Amarelo ⚠️ | Vermelho 🔴 |
|---------|----------|------------|-------------|
| **Taxa de acerto** | >80% | 60-80% | <60% |
| **Cards revisados/dia** | 20-50 | 10-20 ou 50-100 | <10 ou >100 |
| **Tempo médio/card** | 5-10s | 10-20s | >20s |
| **Cards vencidos** | 0 | <10 | >20 |
| **Streak de dias** | >30 | 7-30 | <7 |

### Red Flags

| Sinal | Problema | Solução |
|-------|----------|---------|
| 🚩 Taxa de acerto <60% | Cards muito difíceis | Simplifique ou divida cards |
| 🚩 >100 cards/dia | Criando cards demais | Pare novos cards, foque em revisar |
| 🚩 Sempre os mesmos cards errados | Não entendeu conceito | Volte para #feynman |
| 🚩 Revisão >30 min | Cards complexos demais | Respostas devem ser curtas |
| 🚩 Acúmulo constante | Frequência irregular | Defina horário fixo todos os dias |

### Métricas para Acompanhar

```bash
# Relatório semanal de SRS
srs-stats --week
```

```markdown
## Relatório SRS - Semana 2026-W07

### Revisões
- Total de cards revisados: 245
- Taxa de acerto média: 87%
- Tempo total: 3h 12min
- Média por dia: 35 cards

### Novos Cards
- Criados: 42
- Módulos: M1-math (15), M2-zig (27)
- Taxa de acerto (1ª revisão): 72%

### Alertas
⚠️ 8 cards com taxa de acerto <50%
   → Recomendado: Revisar com #feynman

✅ Cards maduros (>5 revisões): 156
   → Intervalo médio: 45 dias
```

---

## 🎓 Resumo: Regras de Ouro

### ✅ 5 Regras para SRS Efetivo

1. **Use SÓ para fatos, não conceitos**
   - ✅ Símbolos, definições curtas, fórmulas
   - ❌ Explicações longas, raciocínio complexo

2. **Cards devem ser atômicos**
   - ✅ 1 pergunta = 1 resposta curta
   - ❌ Múltiplas perguntas ou respostas longas

3. **Revisar TODOS os dias**
   - ✅ Consistência > Intensidade
   - ❌ Acumular revisões

4. **Avalie honestamente**
   - ✅ "Errou" se hesitou
   - ❌ "Fácil" só se soube instantaneamente

5. **Entenda ANTES de memorizar**
   - ✅ #feynman → SRS (ordem correta)
   - ❌ SRS sem entender (decoreba)

---

## 📝 Exemplos Completos

### Exemplo 1: Aprender Logaritmos (M1)

#### Contexto
Semana 3 de matemática - estudando logaritmos.

#### Cards Criados

```csv
"log₂(8) = ?","3 (porque 2³=8)","M1-math"
"log₂(64) = ?","6 (porque 2⁶=64)","M1-math"
"log(a×b) = ?","log(a) + log(b)","M1-math"
"log(a/b) = ?","log(a) - log(b)","M1-math"
"log(aⁿ) = ?","n × log(a)","M1-math"
"Por que binary search é O(log n)?","A cada passo, problema reduz pela metade","M1-math"
```

#### Progressão de Revisões

```markdown
Card: "log₂(64) = ?"

| Revisão | Data       | Avaliação | Intervalo | Próxima    |
|---------|------------|-----------|-----------|------------|
| 1       | 2026-02-18 | -         | 1 dia     | 2026-02-19 |
| 2       | 2026-02-19 | Fácil     | 6 dias    | 2026-02-25 |
| 3       | 2026-02-25 | Fácil     | 15 dias   | 2026-03-12 |
| 4       | 2026-03-12 | Médio     | 10 dias   | 2026-03-22 |
| 5       | 2026-03-22 | Fácil     | 25 dias   | 2026-04-16 |
```

#### Resultado
✅ Após 5 revisões: Sabe responder instantaneamente  
✅ Intervalo de 25 dias: Custo de manutenção quase zero

---

### Exemplo 2: Sintaxe Rust (M2)

#### Contexto
Semana 7-8 de Rust - memorizando sintaxe básica.

#### Cards Criados

```csv
"Zig: Como criar ArrayList vazio?","std.ArrayList.init(allocator)","M2-zig"
"Zig: O que é @as?","Cast explícito em comptime/runtime","M2-zig"
"Zig: Como lidar com erro?","try/ catch/ errdefer","M2-zig"
"Zig: Optional type?","?T (pode ser null)","M2-zig"
"Zig: Diferença entre *T e ?*T?","Ponteiro obrigatório vs opcional","M2-zig"
"Zig: Como clonar slice?","allocator.dupe(u8, slice)","M2-zig"
```

#### Fluxo de Uso

```bash
# Dia 1: Cria cards durante estudo
# Estudando ownership...
echo '"Zig: Optional type?","?T (pode ser null)"' >> srs.csv

# Dia 2: Primeira revisão
/ul-study-recall
# Card: "Zig: Como criar ArrayList vazio?"
# Você: "std.ArrayList.init(allocator)"
# Sistema: ✅ "std.ArrayList.init(allocator)"
# Avalia: Fácil → Próximo: 6 dias

# Dia 8: Segunda revisão
# Card: "Zig: Como criar ArrayList vazio?"
# Você: "std.ArrayList.init(allocator)"
# Avalia: Fácil → Próximo: 15 dias

# Dia 23: Terceira revisão
# Agora você lembra sem pensar!
```

---

### Exemplo 3: Comandos Git

#### Contexto
Sempre consultando cheatsheet de git. Criar cards para automatizar.

#### Cards Criados

```csv
"Git: Ver status?","git status","tools"
"Git: Adicionar arquivo?","git add <arquivo>","tools"
"Git: Commit com mensagem?","git commit -m \"mensagem\"","tools"
"Git: Ver histórico curto?","git log --oneline","tools"
"Git: Criar branch?","git checkout -b <nome>","tools"
"Git: Trocar de branch?","git checkout <nome>","tools"
"Git: Desfazer último commit (manter alterações)?","git reset --soft HEAD~1","tools"
"Git: Desfazer alterações no arquivo?","git checkout -- <arquivo>","tools"
```

#### Resultado
✅ Antes: Consultava cheatsheet 5x por dia  
✅ Depois: Sabe de cor em 2 semanas  
✅ Economia: ~5 min/dia = 30h/ano

---

## 🔗 Links Relacionados

- [7-retention.md](../principios/7-retention.md) - Princípio #7: Retention
- [flashcards.md](flashcards.md) - Criar e usar flashcards
- [feynman.md](feynman.md) - Entender antes de memorizar
- [mnemonics.md](mnemonics.md) - Técnicas mnemônicas

---

## 💡 Dica Final

**SRS não é mágica - é matemática.**

A Curva do Esquecimento é uma lei natural. Você não pode "vencê-la" com força de vontade, mas pode **trabalhar com ela**.

A fórmula é simples:
```
Revisão no momento certo = Retenção máxima com esforço mínimo
```

**Se você:**
- ❌ Cria cards de conceitos que não entendeu
- ❌ Acumula revisões
- ❌ Avalia "fácil" quando hesitou
- ❌ Para de usar SRS por dias

**Então você está desperdiçando tempo.**

SRS só funciona com consistência e honestidade.

---

**Criado por**: @meta  
**Data**: 2026-02-18  
**Versão**: 1.0
