---
name: lori-directness
description: Aprendizado por projeto real com review socrático. Use quando usuário quer aplicar conhecimento em contexto prático imediato.
---

# Lori Directness

Ritual de aprendizado direto: aprender fazendo projeto real.

## Quando usar
- Usuário quer aplicar teoria na prática
- Projeto real ou simulado disponível
- `/lori-start <modulo> directness`

## Ritual

### 1. Definir projeto mínimo
- Escolha projeto que exija o conceito-alvo
- Escopo: 1-2 horas máximo para primeira iteração
- Exemplo: aprender API → construir script que usa API

### 2. Benchmark inicial
Antes de começar, registre:
```
# Benchmark em .lori/modules/<modulo>/benchmark.md
## Data: YYYY-MM-DD
## Tarefa: <descrição>
## Tempo estimado: X min
## Resultado real: __
## Erros cometidos: __
```

### 3. Execução com mínimo de teoria
- Não leia documentação completa antes
- Comece o projeto, consulte docs apenas quando travar
- Use `/skill:lori-stuck` quando travar

### 4. Review socrático (a cada 20min)
Pergunte:
1. "O que você está fazendo e por quê?"
2. "Esse é o caminho mais direto?"
3. "O que aconteceria se você removesse essa parte?"
4. "Como você sabe que está funcionando?"
5. "Qual a próxima ação mais pequena possível?"

### 5. Pós-projeto
Atualize benchmark com tempo real e erros.
Compare: estimado vs real.
Identifique 1-2 weaknesses para drill.

### 6. Registrar
```
lori_log_event type=drill_completed data={module, project, time_estimated, time_actual}
```

## Regras
- Projeto sempre vem antes da teoria completa
- Review socrático a cada 20min ou quando detectar divagação
- Documentar estimativas vs realidade
