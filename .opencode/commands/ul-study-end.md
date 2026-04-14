---
description: Encerrar sessão, salvar progresso e atualizar plano semanal (/ul-study-end)
agent: tutor
model: opencode-go/kimi-k2.5
---

## Uso
/ul-study-end

## Descrição

Finaliza sessão de estudo com reflexão estruturada, salva progresso via OpenViking e sugere próximos passos baseado no desempenho.

## Processo

### Passo 1: Reflexão Estruturada (3-5 min)

**Perguntas:**
1. O que você aprendeu/praticou hoje? (1 frase)
2. Qual foi o maior desafio?
3. O que ainda está confuso? (se aplicável)
4. Nota de foco: ___/10
5. Qual sua confiança no tópico? ___/10

### Passo 2: Análise de Gaps

Com base nas respostas:
- **Se confiança < 7** → Sugerir criar flashcard (`/ul-study-memorize`)
- **Se desafio recorrente** → Sugerir mais prática (`/ul-study-drill`)
- **Se foco < 5** → Sugerir técnica pomodoro ou pausa

### Passo 3: Persistência via OpenViking

**Obrigatório:** Chamar `memcommit()` para persistir a sessão:

```typescript
// 1. Salvar sessão no CSV
await data({ operation: "createSession", ... })

// 2. Commitar memória automaticamente (CRÍTICO)
await memcommit({ wait: true })

// 3. Retornar resultado
return JSON.stringify({
  success: true,
  message: "Sessão salva e memória sincronizada"
})
```

**Dados capturados automaticamente:**
- moduleId (do perfil)
- Duração (calculada automaticamente)
- Foco (nota fornecida)
- Notas (resumo do aprendizado)
- Timestamp

**OpenViking extrai automaticamente:**
- Preferências de aprendizado
- Conceitos aprendidos (entities)
- Padrões de erro/franqueza**

### Passo 4: Atualização do Plano Semanal (Opcional)

**Perguntar ao usuário:**
```
"📋 Atualizar Plano da Semana?

Você completou alguma entrega hoje?

1. Sim — Projeto: [nome]
2. Sim — Drill/Exercícios
3. Sim — SRS/Flashcards
4. Não — Só estudo de conteúdo
5. Pular atualização"
```

**Se usuário completou entrega:**
1. Buscar plano atual: `memread("viking://user/projects/[module]/meta/week-*.md")`
2. Atualizar arquivo usando `membrowse` + escrita
3. Marcar checkbox correspondente: `[x]`
4. Adicionar nota de progresso com data

### Passo 5: Consolidação

Apresentar resumo:
```
✅ Sessão Salva!

📊 Resumo:
• Duração: [X] minutos
• Foco: [N]/10
• Técnicas: [lista]
• Streak: 🔥 [N] dias

💡 Recomendações:
• [Sugestão baseada nas respostas]
• Próxima sessão: [sugestão]
```

### Passo 6: Check de Domingo

Se for domingo:
```
📅 Hoje é domingo — fim de semana!
→ /ul-plan-retro para revisar a semana
```

## Exemplo de Interação

```
Usuário: /ul-study-end

Sistema:
"Vamos consolidar! O que você fez hoje?"

Usuário: "Foquei 8/10, aprendi recursão e memoization"

Sistema:
"Excelente! Algum desafio específico?"

Usuário: "Memoization ainda está confusa"

Sistema:
"Entendido. Vamos salvar:

📋 Atualizar Plano da Semana?
Você completou alguma entrega hoje?"

Usuário: "Sim — finalizei o projeto de recursão"

Sistema:
"✅ Sessão Salva!
✅ Plano atualizado — Projeto: Recursão marcado como completo

📊 Resumo:
• Duração: 60 minutos
• Foco: 8/10
• Técnicas: drill, practice
• Streak: 🔥 15 dias
• Entrega: Projeto de recursão ✓

💡 Recomendações:
• Criar flashcard sobre memoization → /ul-study-memorize
• Praticar mais casos de memoization → /ul-study-drill memoization

📅 Próxima sessão: Quarta-feira (amanhã)
   Sugestão: Continuar memoization antes de avançar"
```

## Estrutura OpenViking

Os dados são persistidos automaticamente via session hooks:

| Dado | URI OpenViking |
|------|---------------|
| Sessão atual | Sincronizado automaticamente |
| Perfil/Streak | `viking://user/memories/profile.md` |
| Insights | Extraído por `memcommit` |

## Integrações

**Tools OpenViking utilizadas:**
- `memcommit` — Forçar persistência (opcional, automático)
- `memread` — Ler plano da semana
- `membrowse` — Navegar estrutura de projetos

**Commands relacionados:**
- `/ul-study-start` — Iniciar nova sessão
- `/ul-study-memorize` — Criar flashcards para gaps
- `/ul-plan-retro` — Retrospectiva semanal (domingos)
- `/ul-plan-adjust` — Ajustar cronograma se necessário

## Handoff

- Usuário quer criar flashcard → `/ul-study-memorize`
- Usuário quer mais prática → `/ul-study-drill`
- Domingo → Sugerir `/ul-plan-retro`
- Plano precisa de ajustes maiores → `/ul-plan-adjust`

---

*Command: /ul-study-end — Consolidação e persistência via OpenViking*