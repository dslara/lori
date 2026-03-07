# Tutor Log Skill - Registrar Interações Automaticamente

## Objetivo

Registrar automaticamente as interações do tutor em `data/tutor_interactions.csv` para memória e contexto futuro.

## Quando Registrar

**REGISTRE AUTOMATICAMENTE** quando:
- Usuário fizer uma pergunta conceitual
- Usuário responder a um quiz
- Usuário completar um exercício de drill
- Usuário explicar um conceito (#feynman)
- Usuário pedir ajuda com debug
- Usuário pedir feedback em código

**NÃO REGISTRE** quando:
- Interação é muito curta (< 10 palavras)
- Usuário só disse "ok", "obrigado", "entendi"
- Interação é puramente administrativa

## Como Registrar

### Opção 1: Script Bash (Recomendado)

Use o script `scripts/tutor-interaction.sh`:

```bash
./scripts/tutor-interaction.sh <skill> <topic> <user_message> <user_response> <tutor_response> [metadata]
```

**Parâmetros**:
- `session_id`: ID da sessão atual (formato: YYYY-MM-DD-HHMMSS)
- `skill`: Nome da skill usada (quiz, feynman, drill, etc.)
- `topic`: Tópico da interação (ex: "símbolos matemáticos", "recursão")
- `user_message`: Mensagem/pergunta do usuário (máx 200 chars)
- `user_response`: Resposta do usuário (máx 200 chars)
- `tutor_response`: Sua resposta (máx 500 chars)
- `metadata`: JSON opcional com dados extras

**Exemplo**:
```bash
./scripts/tutor-interaction.sh quiz "símbolos matemáticos" "O que significa ∀?" "Para todo" "Correto! ∀ é o quantificador universal" '{"correct":true}'
```

### Opção 2: Append Direto

Se não tiver acesso ao script, registre diretamente:

```bash
echo "I$(date +%Y%m%d%H%M%S),<session_id>,<skill>,<topic>,\"<user_message>\",\"<user_response>\",\"<tutor_response>\",$(date -Iseconds),\"<metadata>\"" >> data/tutor_interactions.csv
```

## Formato do CSV

```
id,session_id,skill,topic,user_message,user_response,tutor_response,timestamp,metadata
I20260306085731,2026-03-06-085708,quiz,símbolos matemáticos,"O que significa ∀?","Para todo","Correto! ∀ é o quantificador universal",2026-03-06T08:57:31+01:00,"{"correct":true}"
```

## Exemplos por Keyword

### #quiz
```bash
./scripts/tutor-interaction.sh quiz "símbolos matemáticos" "O que significa ∀?" "Para todo" "Correto! ∀ é o quantificador universal" '{"correct":true}'
```

### #feynman
```bash
./scripts/tutor-interaction.sh feynman "recursão" "Explique recursão como para uma criança" "É quando uma função chama a si mesma" "Boa! E quando ela para?" '{"depth_score":7}'
```

### #drill
```bash
./scripts/tutor-interaction.sh drill "Big O" "Qual a complexidade de n²?" "Quadrática" "Correto! Cresce muito rápido" '{"correct":true}'
```

### #debug
```bash
./scripts/tutor-interaction.sh debug "null pointer" "Por que recebo NullPointerException?" "O objeto está null" "Onde você inicializou?" '{"found":false}'
```

## Obter Session ID

O session_id pode ser obtido de:
1. **Variável de ambiente**: `$SESSION_ID` (se definida)
2. **Última sessão**: `tail -1 data/sessions.csv | cut -d',' -f1`
3. **Data atual**: `$(date +%Y-%m-%d-%H%M%S)`

**Recomendado**: Use a última sessão do CSV:
```bash
SESSION_ID=$(tail -1 data/sessions.csv | cut -d',' -f1)
```

## Metadata JSON

O campo `metadata` pode conter:
- `correct`: true/false (para quizzes)
- `time_sec`: tempo de resposta em segundos
- `depth_score`: 1-10 (para feynman)
- `found`: true/false (para debug)
- `attempts`: número de tentativas

**Exemplo**:
```json
{"correct":true,"time_sec":12,"attempts":1}
```

## Consultar Histórico

Para ver interações anteriores:

```bash
# Por tópico
./scripts/tutor-log.sh topic "símbolos matemáticos" 5

# Por sessão
./scripts/tutor-log.sh session "2026-03-06-085708"

# Últimas 10
./scripts/tutor-log.sh recent 10
```

## Benefícios

1. **Memória do tutor**: Consultar interações anteriores
2. **Analytics**: Ver quais tópicos são mais difíceis
3. **Personalização**: Adaptar baseado no histórico
4. **Progresso**: Ver evolução ao longo do tempo

## Checklist

Antes de registrar, verifique:
- [ ] Session ID está correto?
- [ ] Skill está correta?
- [ ] Tópico está claro?
- [ ] Mensagens estão sanitizadas (sem vírgulas/quebras)?
- [ ] Metadata é JSON válido?

## Integração com Agentes

Este skill é chamado automaticamente pelo @tutor quando:
- Usa uma keyword (#quiz, #feynman, #drill, etc.)
- Interação é significativa (> 10 palavras)
- Não é puramente administrativa

O registro é **transparente** para o usuário — ele não precisa fazer nada.
