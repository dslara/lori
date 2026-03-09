---
name: "zombie-mode"
description: "Superar procrastinação com Two-Minute Rule — menor passo possível para começar."
license: MIT
compatibility: opencode
metadata:
  principle: "2-focus"
  agent: "@tutor"
  keywords: "zombie, procrastination, two-minute-rule, start, motivation"
---

## O que é Zombie Mode

**Two-Minute Rule** (James Clear, Atomic Habits):
- Encontre o **menor passo possível** (ridiculamente pequeno)
- Execute em <2 minutos
- Frequentemente, continue naturalmente

**Por que funciona**:
- ✅ Remove barreira inicial (medo de "grande tarefa")
- ✅ Cria momentum (começar é o mais difícil)
- ✅ Reduz frição (passo tão pequeno que é impossível falhar)

## Quando Usar

✅ **USE** para:
- Procrastinação ("não tô afim hoje")
- Resistência inicial ("não sei por onde começar")
- Travado há >30 min sem progresso
- Medo de tarefa grande

❌ **NÃO USE** para:
- Bloqueio técnico real → use `#debug`
- Falta de conhecimento → use `#explain`
- Cansaço real → use pausa real (`@tutor #diffuse`)

## Processo

### Passo 1: Identificar Menor Passo Possível (1 min)

Pergunte ao usuário:
- "Qual o menor passo possível que você consegue dar agora?"
- "Pode ser em 5 segundos?"

**Regra**: Ridiculamente pequeno, quase patético.

**Exemplos de micro-passos**:
```markdown
❌ "Estudar recursão" → grande demais
✅ "Abrir o VS Code" → 5 segundos

❌ "Fazer o projeto" → grande demais
✅ "Abrir o arquivo index.js" → 3 segundos

❌ "Resolver esse bug" → grande demais
✅ "Ler a mensagem de erro" → 10 segundos
```

### Passo 2: Executar SEM Compromisso (1 min)

**Contrato**:
```markdown
"Execute só esse micro-passo.
Se quiser PARAR depois, PODE.
Sem pressão de continuar."
```

**Por que funciona**:
- Remove pressão de "tenho que fazer tudo"
- Libera para fazer "só isso"
- Frequentemente, momentum leva adiante

### Passo 3: Observar Momentum (variável)

**Resultado típico**:
- 70% das vezes: continua naturalmente
- 20% das vezes: faz mais 1-2 passos
- 10% das vezes: para mesmo (tudo bem!)

### Passo 4: Handoff (se continuar)

Quando começar a fluir:
```markdown
"Você começou! 🎉
Pronto para continuar?
→ `#quiz` para aquecer
→ `#drill` se sabe o que praticar
→ `#directness` se tem projeto em mente"
```

## Exemplo de Interação

```
Usuário: "#zombie"

Você: "Modo Zumbi ativado! 🧟

Qual o menor passo possível agora?

[Dica: pode ser em 5 segundos]
- Abrir editor?
- Ler 1 linha de código?
- Abrir o arquivo do projeto?

Qual você escolhe? (pode escolher menor ainda)"
```

## Escala de Micro-passos

| Nível | Micro-passo | Tempo |
|-------|-------------|-------|
| 0 | "Pensar sobre fazer" | 1s |
| 1 | "Abrir o VS Code" | 5s |
| 2 | "Abrir o arquivo do projeto" | 10s |
| 3 | "Ler a primeira linha" | 15s |
| 4 | "Ler a primeira função" | 30s |
| 5 | "Executar o código" | 1-2 min |
| 6 | "Fazer 1 drill" | 5 min |

**Regra**: Comece no nível 0-2, NÃO no nível 5+.

## Métricas de Sucesso

| Métrica | Verde ✅ | Vermelho 🔴 |
|---------|----------|-------------|
| Micro-passo executado | Sim | Não tentou |
| Momentum criado | Continuou naturalmente | Travou |
| Micro-passo pequeno | <30 segundos | >2 minutos |

## Handoff

- Começou e fluiu? → `#quiz` para aquecer ou técnica escolhida
- Travou mesmo assim? → Verificar se é bloqueio técnico (`#debug`) ou cansaço (`@tutor #diffuse`)
- Conseguiu pouco progresso? → Tudo bem! Cada micro-passo conta.

## 📋 Makefile Integration

**Comandos relacionados**:
- `@tutor #start` — Continuar sessão após superar procrastinação
- `@tutor #diffuse` — Pausa real se for cansaço, não procrastinação

**Quando sugerir**:
- Funcionou e começou → sugerir `@tutor #start` para continuar
- Descobriu que é cansaço → sugerir `@tutor #diffuse`
