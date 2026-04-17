---
name: lori-retro
description: Retrospectiva semanal Lori com ajustes de plano. Use todo domingo ou quando usuário pedir review de progresso.
---

# Lori Retro

Ritual de retrospectiva semanal para ajuste contínuo.

## Quando usar
- Domingo de cada semana
- Usuário pede para revisar progresso
- `/lori-retro`

## Ritual

### 1. Coletar dados
Use `lori_get_context` e leia `.lori/state.jsonl` dos últimos 7 dias.
Métricas:
- Minutos estudados por dia
- Técnicas utilizadas
- Cards SRS revisados/criados
- Weaknesses adicionadas/resolvidas
- Módulos ativos progresso

### 2. 4 perguntas da retro

**Q1 - O que funcionou?**
- Qual técnica rendeu mais?
- Qual horário foi melhor?
- Qual módulo teve maior progresso?

**Q2 - O que não funcionou?**
- Onde você travou mais?
- Qual técnica foi ignorada?
- Quais interrupções ocorreram?

**Q3 - Weaknesses persistentes**
Liste weaknesses ainda não resolvidas.
Para cada: criar plano de ação específico (drill, card, ou sessão Feynman).

**Q4 - Ajustes para próxima semana**
- Módulos a continuar/iniciar/pausar
- Técnica principal da semana
- Meta de minutos e SRS
- Proteções contra interrupções

### 3. Documentar
Crie `.lori/modules/<modulo>/retro-YYYY-WWW.md`:
```markdown
## Retrospectiva YYYY-WWW
### Métricas
- Minutos: X
- SRS: Y revisados, Z criados
### O que funcionou
### O que não funcionou
### Weaknesses persistentes
### Ajustes próxima semana
```

### 4. Atualizar plano
Ajuste `.lori/modules/<modulo>/plan.md` se necessário.

### 5. Preparar próxima semana
Crie `week-NEXT.md` com foco claro.

### 6. Registrar
```
lori_log_event type=retro_done data={week, minutes_total, weaknesses_open}
```

## Regras
- Retro sem dados = opinião. Sempre baseie em state.jsonl
- Nunca termine sem ajuste concreto para próxima semana
- Weakness persistente > 2 semanas = mude técnica
