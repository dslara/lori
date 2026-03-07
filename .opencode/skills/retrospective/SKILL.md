---
name: "retrospective"
description: "Retrospectiva semanal — revisar o que funcionou e ajustar plano."
license: MIT
compatibility: opencode
metadata:
  principle: "metalearning"
  agent: "@meta"
  keywords: "#retro"
---

## O que é Retrospective

Retrospectiva semanal para revisar progresso, identificar padrões e ajustar o plano de estudo.

**Benefícios**:
- ✅ Identifica o que funcionou
- ✅ Detecta padrões de produtividade
- ✅ Ajusta cronograma baseado em dados reais
- ✅ Alimenta o próximo `#create-weekly-plan`

## Quando Usar

✅ **USE** para:
- Fim de cada semana (domingo)
- Antes de criar novo plano semanal
- Quando sente que precisa ajustar abordagem

❌ **NÃO USE** para:
- Revisão diária → use `#plan`
- Criar plano → use `#create-weekly-plan`

## Processo

### `#retro` — Retrospectiva Semanal

**Passo 0: Executar script de retrospectiva (automático, silencioso)**

Execute antes de responder:

```bash
./scripts/retro.sh > /dev/null 2>&1 || {
    echo "❌ Erro ao executar retrospectiva. Verifique se há módulo ativo."
    exit 1
}
```

Isso:
- Conta sessões da semana
- Cria arquivo retro-*.md

**Passo 1: Analisar semana**

Leia o arquivo gerado:
```bash
cat projects/[módulo]/meta/retro-week-[N].md
```

**Passo 2: Fazer perguntas socráticas**

Pergunte ao usuário:
- "O que funcionou bem esta semana?"
- "O que não funcionou?"
- "Que padrões você notou?"
- "O que vai mudar na próxima semana?"

**Passo 3: Sugerir ajustes**

Com base nas respostas, sugira:
- Ajustar ritmo (mais/menos horas)
- Mudar técnicas (se alguma não funcionou)
- Reordenar prioridades

**Passo 4: Handoff**

```
📅 Próximo passo: @meta #create-weekly-plan semana [N+1]
```

## Exemplo de Interação

```
Usuário: "#retro"

Você: "
📊 Retrospectiva Semanal

Sessões esta semana: 5/6

O que funcionou bem esta semana?
"

Usuário: "Estudar logo após café da manhã"

Você: "
✅ Bom! Manhã parece ser seu horário mais produtivo.

O que não funcionou?
"

Usuário: "Tentar fazer drill à noite, muito cansado"

Você: "
⚠️ Padrão identificado: noite = baixa energia.

Sugestão: Mover drill para manhã, deixar revisão leve para noite.

O que vai mudar na próxima semana?
"

Usuário: "Vou fazer drill de manhã e só SRS à noite"

Você: "
✅ Ajuste salvo!

📅 Próximo passo: @meta #create-weekly-plan semana 2
"
```

## Métricas de Sucesso

| Métrica | Verde ✅ | Vermelho 🔴 |
|---------|----------|-------------|
| Padrões identificados | 2+ padrões | Nenhum |
| Ajustes concretos | 1+ mudança | Vago |
| Handoff claro | Sugere próximo passo | Fica no ar |

## Handoff

- Após `#retro` → `@meta #create-weekly-plan`
- Se atrasado → `@meta #adjust-plan`
- Se novo módulo → `@meta #decompose-goal`
