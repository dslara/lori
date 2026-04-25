# Exemplo Prático: Registro Automático de Interações

## Cenário

Usuário está estudando símbolos matemáticos com o @tutor.

## Fluxo de Interação

### 1. Usuário inicia quiz

```
Usuário: "#quiz 5 sobre símbolos matemáticos"
```

**@tutor responde**:
```
🧠 Quiz (3s cada):
1. O que significa ∀?
2. O que significa ∃?
3. O que significa Σ?
4. O que significa ∈?
5. O que significa ⊂?
Responda!
```

**Registro automático**:
```bash
./scripts/tutor-interaction.sh quiz "símbolos matemáticos" "#quiz 5 sobre símbolos matemáticos" "Quiz: 5 perguntas sobre ∀, ∃, Σ, ∈, ⊂" '{"questions":5}'
```

---

### 2. Usuário responde

```
Usuário: "1. Para todo 2. Existe 3. Soma 4. Pertence 5. Subconjunto"
```

**@tutor responde**:
```
✓✓✗✓✓ Score: 4/5
Errou Σ? Σ é somatório (não soma simples).
Quer entender a diferença? → #intuition Σ
```

**Registro automático**:
```bash
./scripts/tutor-interaction.sh quiz "símbolos matemáticos" "Respostas: Para todo, Existe, Soma, Pertence, Subconjunto" "Score 4/5. Errou Σ (somatório). Sugestão: #intuition Σ" '{"correct":false,"score":"4/5","wrong":"Σ"}'
```

---

### 3. Usuário pede explicação

```
Usuário: "#intuition Σ"
```

**@tutor responde**:
```
Σ não é soma — é SOMATÓRIO.

Diferença:
- Soma: 2 + 3 = 5 (resultado único)
- Somatório: Σ(i=1 to n) i = 1 + 2 + 3 + ... + n (soma de sequência)

Analogia: Soma é uma conta. Somatório é uma conta REPETIDA.

❓ Onde você usaria somatório na prática?
```

**Registro automático**:
```bash
./scripts/tutor-interaction.sh intuition "Σ" "#intuition Σ" "Σ = somatório (não soma). Soma de sequência. Analogia: conta repetida." '{"depth_score":8}'
```

---

### 4. Usuário pratica

```
Usuário: "#drill Σ 5 exercícios"
```

**@tutor responde**:
```
🎯 Drill: Somatório (5 exercícios)

1. Σ(i=1 to 5) i = ?
2. Σ(i=1 to 3) i² = ?
3. Σ(i=1 to 4) 2i = ?
4. Σ(i=1 to n) 1 = ?
5. Σ(i=1 to 10) i - Σ(i=1 to 9) i = ?

Responda!
```

**Registro automático**:
```bash
./scripts/tutor-interaction.sh drill "Σ" "#drill Σ 5 exercícios" "Drill: 5 exercícios de somatório" '{"exercises":5}'
```

---

### 5. Usuário responde drill

```
Usuário: "1. 15 2. 14 3. 20 4. n 5. 10"
```

**@tutor responde**:
```
✓✓✓✓✓ Score: 5/5
Perfeito! Você dominou somatório.

Próximo passo: Aplicar em projeto real?
→ #directness 'calculadora de somatórios'
```

**Registro automático**:
```bash
./scripts/tutor-interaction.sh drill "Σ" "Respostas: 15, 14, 20, n, 10" "Score 5/5. Dominou somatório. Sugestão: #directness" '{"correct":true,"score":"5/5"}'
```

---

## Resultado em `data/tutor_interactions.csv`

```csv
id,session_id,skill,topic,user_message,user_response,tutor_response,timestamp,metadata
I20260306090143,2026-03-06-085708,quiz,símbolos matemáticos,"#quiz 5 sobre símbolos matemáticos","","Quiz: 5 perguntas sobre ∀, ∃, Σ, ∈, ⊂",2026-03-06T09:01:43+01:00,"{"questions":5}"
I20260306090215,2026-03-06-085708,quiz,símbolos matemáticos,"Respostas: Para todo, Existe, Soma, Pertence, Subconjunto","Para todo, Existe, Soma, Pertence, Subconjunto","Score 4/5. Errou Σ (somatório). Sugestão: #intuition Σ",2026-03-06T09:02:15+01:00,"{"correct":false,"score":"4/5","wrong":"Σ"}"
I20260306090245,2026-03-06-085708,intuition,Σ,"#intuition Σ","","Σ = somatório (não soma). Soma de sequência.",2026-03-06T09:02:45+01:00,"{"depth_score":8}"
I20260306090310,2026-03-06-085708,drill,Σ,"#drill Σ 5 exercícios","","Drill: 5 exercícios de somatório",2026-03-06T09:03:10+01:00,"{"exercises":5}"
I20260306090345,2026-03-06-085708,drill,Σ,"Respostas: 15, 14, 20, n, 10","15, 14, 20, n, 10","Score 5/5. Dominou somatório.",2026-03-06T09:03:45+01:00,"{"correct":true,"score":"5/5"}"
```

---

## Benefícios

1. **Memória do tutor**: Pode consultar interações anteriores
2. **Analytics**: Ver quais tópicos são mais difíceis
3. **Personalização**: Adaptar baseado no histórico
4. **Progresso**: Ver evolução ao longo do tempo

---

## Consultar Histórico

```bash
# Ver interações sobre Σ
./scripts/tutor-log.sh topic "Σ" 10

# Ver interações da sessão atual
./scripts/tutor-log.sh session "2026-03-06-085708"

# Ver últimas 10 interações
./scripts/tutor-log.sh recent 10
```

---

## Checklist para o Tutor

Após cada interação significativa:

- [ ] Interação > 10 palavras?
- [ ] Skill identificada? (quiz, feynman, drill, etc.)
- [ ] Tópico claro?
- [ ] Registrou com `./scripts/tutor-interaction.sh`?
- [ ] Metadata JSON válida?

---

## Nota

O registro é **automático e transparente** para o usuário. Ele não precisa fazer nada — o tutor registra sozinho.
