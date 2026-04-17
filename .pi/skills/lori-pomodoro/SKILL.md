---
name: lori-pomodoro
description: Timer Pomodoro 50/10 com proteção de interrupções para sessões de aprendizado profundo. Use quando usuário quer iniciar sessão focada de estudo.
---

# Lori Pomodoro

Ritual de sessão focada com timer e proteção contra interrupções.

## Quando usar
- Usuário quer estudar algo específico
- Precisa de estrutura de tempo para aprendizado
- `/lori-start <modulo> pomodoro`

## Ritual

### 1. Pré-sessão (2 min)
- Pergunte: "Qual o objetivo desta sessão?"
- Pergunte: "O que pode interromper você?"
- Anote 1 weakness se houver dúvida prévia

### 2. Configurar timer
```
/lori-timer start 50
```
- Trabalho: 50 minutos
- Pausa: 10 minutos
- Se necessário, ajuste via config: pomodoroWork / pomodoroBreak

### 3. Proteção de interrupções
- Silencie notificações externas
- Se surgir distração durante sessão: anote em `.lori/state.jsonl` como `distraction_noted`
- Não pare o timer para responder mensagens

### 4. Durante sessão
- Foque em UMA técnica por pomodoro
- Se travar, use `/skill:lori-stuck`
- Ao final dos 50min:
```
/lori-timer stop
```

### 5. Pausa (10 min)
- **NÃO tela**
- Caminhar, água, respirar
- **NÃO** redes sociais
- Anote distrações se surgirem

### 6. Pós-sessão obrigatório
Sempre pergunte:
1. "O que ficou confuso?"
2. "Quais conceitos precisam de reforço?"
3. Registrar weaknesses via `lori_log_event type=weakness_added`

## Regras
- Nunca pule o pós-sessão
- Se timer acabar durante tool call, finalize call e depois pare
- Máximo 4 pomodoros seguidos antes de pausa longa (30min)
