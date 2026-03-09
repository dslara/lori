---
name: "drill"
description: "Prática deliberada — repetir procedimento 5-10x até automatizar. Use para algoritmos, sintaxe, debug patterns."
license: MIT
compatibility: opencode
metadata:
  principle: "4-drill"
  agent: "@tutor"
  keywords: "drill, practice, repetition, automate, procedure"
---

## O que é Drill

Repetir um procedimento específico **5-10 vezes** até automatizar, focando em:
- ✅ **Velocidade** — fazer mais rápido a cada repetição
- ✅ **Precisão** — fazer sem erros
- ✅ **Sem consulta** — fazer de memória

**Inspiração**: Músicos repetem escalas 100x. Atletas repetem fundamentos 1000x. Programadores automatizam algoritmos.

## Quando Usar

✅ **USE** para:
- Implementar algoritmos (binary search, merge sort, quick sort)
- Escrever sintaxe de memória (HashMap em Rust, decoradores Python)
- Debug patterns (reconhecer erro de borrow checker rapidamente)
- Análise de código (identificar Big O de loops)
- Git workflows (branch, commit, rebase → muscle memory)

❌ **NÃO USE** para:
- Conceitos abstratos ("entender ownership") → use `#feynman`
- Fatos isolados ("decorar símbolo ∈") → use `make review` (flashcards)
- Projetos completos → use `#directness`
- Design criativo → use experimentação livre

## Processo

### Passo 1: Identificar Skill para Drill (5 min)

Pergunte ao usuário:
- Que procedimento fez hoje que foi **LENTO**?
- Que skill vai usar **MUITAS vezes** no futuro?
- Consegue fazer em **<10 min** por repetição?
- Tem "jeito certo" de fazer (não criativo)?

**Critérios de seleção**:
- ✅ Vai usar 10+ vezes no futuro
- ✅ Tem "jeito certo" de fazer
- ✅ Pode ser feito em <10 min/repetição
- ✅ Pode verificar se acertou (output claro)

### Passo 2: Primeira Vez COM Consulta (10-15 min)

1. Siga tutorial, exemplo ou documentação
2. Anote **CADA passo** em um checklist
3. Entenda **POR QUÊ** cada passo é necessário
4. Marque partes que pareceram difíceis

**Checklist de exemplo**:
```markdown
## Drill: Binary Search
- [ ] 1. Inicializar left = 0, right = arr.len() - 1
- [ ] 2. Loop while left <= right
- [ ] 3. Calcular mid = left + (right - left) / 2
- [ ] 4. Se arr[mid] == target → return Some(mid)
- [ ] 5. Se arr[mid] < target → left = mid + 1
- [ ] 6. Se arr[mid] > target → right = mid - 1
- [ ] 7. Se loop termina → return None

⚠️ Atenção: Fórmula de mid evita overflow!
```

### Passo 3: Repetir 5-10x SEM Consulta (30-45 min)

**REGRAS INQUEBRÁVEIS**:
1. SEM olhar código anterior
2. SEM consultar documentação
3. SE travar: anota e continua (não para)
4. Cada repetição é do ZERO (apaga código anterior)
5. CRONOMETRE cada tentativa

**Progressão típica**:
```
| Tentativa | Tempo   | Erros |
|-----------|---------|-------|
| 1 (c/ consulta) | 15m | 0     |
| 2        | 12m    | 2     |
| 3        | 9m     | 1     |
| 4        | 7m     | 1     |
| 5        | 5m30s  | 0 ✅   |
| 6        | 4m20s  | 0     |
| 7        | 3m40s  | 0     |
| 8        | 3m10s  | 0 ✅   |
```

**Quando parar**:
- Meta de tempo: <50% do tempo inicial
- Meta de erros: 0 erros por 3 tentativas seguidas
- Ou: 10 tentativas (o que vier primeiro)

### Passo 4: Analisar Erros Recorrentes (5 min)

Identifique padrões nos erros e crie flashcards:

```markdown
## Erros Recorrentes

### Erro 1: Fórmula de mid
- Aconteceu: 4/10 tentativas
- Erro: `mid = (left + right) / 2`
- Correto: `mid = left + (right - left) / 2`
- Ação: Criar flashcard dessa fórmula

### Erro 2: Condição do while
- Aconteceu: 3/10 tentativas
- Erro: `while left < right`
- Correto: `while left <= right`
- Ação: Mnemônico "<= para incluir tudo"
```

### Passo 5: Versão Final Documentada (10 min)

Código final perfeito com:
- Comentários explicativos
- Testes básicos
- Tempo e tentativas anotados

## Exemplo de Interação

```
Usuário: "#drill binary search"

Você: "Vamos drillar binary search!

Checklist de passos:
[ ] 1. Inicializar left = 0, right = arr.len() - 1
[ ] 2. Loop while left <= right
[ ] 3. Calcular mid = left + (right - left) / 2
[ ] 4. Se arr[mid] == target → return Some(mid)
[ ] 5. Se arr[mid] < target → left = mid + 1
[ ] 6. Se arr[mid] > target → right = mid - 1
[ ] 7. Se loop termina → return None

⚠️ Atenção: Fórmula de mid evita overflow em arrays grandes!

Tentativa 1: Pode consultar. Cronômetro ligado em 3... 2... 1... GO!"
```

## Métricas de Sucesso

| Métrica | Verde ✅ | Vermelho 🔴 |
|---------|----------|-------------|
| Tempo final | <50% do inicial | >70% do inicial |
| Taxa de erro | 0 erros em 3x seguidas | 3+ erros |
| Sem consulta | 100% das tentativas finais | Consultou 3+ vezes |
| Tentativas | 5-10 | >15 |

## Handoff

- Erros recorrentes identificados? → `make review` para adicionar flashcards
- Não entendeu o conceito? → `#feynman` antes de continuar
- Pronto para aplicar em contexto real? → `#directness` com projeto
- Quer mais variação? → `@tutor "#drill [conceito] variações"` para overlearning

## 📋 Makefile Integration

**Comandos relacionados**:
- `@tutor "#drill [conceito] variações"` — Overlearning: 5 variações de dificuldade
- `@tutor #srs-generator` — Adicionar flashcards de pontos fracos
- `@tutor #start` — Continuar sessão com outra técnica

**Quando sugerir**:
- Drill bem-sucedido → sugerir `@tutor "#drill [conceito] variações"` para overlearning
- Erros recorrentes → sugerir `make review` para criar flashcards
- Skill automatizada → sugerir `#directness` para aplicar em projeto
