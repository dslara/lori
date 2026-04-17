---
name: lori-decomposition
description: Framework 3D de decomposição de aprendizado - 40% conceitos, 20% fatos, 40% procedimentos. Use para planejar novo módulo de estudo.
---

# Lori Decomposition

Ritual de decomposição de módulo usando framework 3D.

## Quando usar
- Criando novo módulo de estudo
- Usuário quer aprender tópico novo
- `/lori-plan <modulo>` seguido de decomposição

## Ritual

### 1. Definir objetivo mensurável
"Em 4 semanas, serei capaz de _______________"

### 2. Decomposição 3D
Divida o módulo em 3 categorias:

#### Conceitos (40% do tempo)
- "Entender como/why"
- Exige Feynman para validação
- Pergunta-chave: "Por que funciona assim?"

#### Fatos (20% do tempo)
- "Saber que"
- Dados, nomes, valores padrão
- Pergunta-chave: "Qual é o valor/nome/regra?"

#### Procedimentos (40% do tempo)
- "Saber fazer"
- Passo a passo replicável
- Pergunta-chave: "Quais são os passos exatos?"

### 3. Mapear em plano
Crie `.lori/modules/<modulo>/plan.md`:
```markdown
## Objetivo
## Conceitos (40%)
- [ ] Conceito A
- [ ] Conceito B
## Fatos (20%)
- [ ] Fato 1
- [ ] Fato 2
## Procedimentos (40%)
- [ ] Procedimento X
- [ ] Procedimento Y
```

### 4. Definir semanas
Cada semana foca em 1-2 conceitos + fatos/procedimentos associados.
Crie `.lori/modules/<modulo>/week-01.md`, `week-02.md`, etc.

### 5. Benchmark
Defina benchmark de saída em `benchmark.md`:
- Tarefa realista que cobre os 3D
- Critério de sucesso (tempo/precisão)

### 6. Registrar
```
lori_log_event type=module_created data={name, decomposition: {concepts, facts, procedures}}
```

## Regras
- 40/20/40 é heurística, não lei rígida
- Todo conceito deve ter procedimento associado
- Sem benchmark, sem plano válido
