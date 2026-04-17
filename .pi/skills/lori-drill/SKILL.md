---
name: lori-drill
description: Repetição deliberada com progressão de nível. Use para automatizar procedimentos e padrões através de prática intencional.
---

# Lori Drill

Ritual de repetição deliberada com níveis crescentes de dificuldade.

## Quando usar
- Usuário quer dominar procedimento/padrão
- Erros recorrentes em mesmo tipo de problema
- Praticar até fluência
- `/lori-start <modulo> drill`

## Ritual

### 1. Definir alvo
- Procedimento específico (ex: "resolver equação quadrática")
- Critério de sucesso: tempo + precisão
- Nível inicial: 1

### 2. Níveis de progressão
| Nível | Condição | Objetivo |
|-------|----------|----------|
| 1 | Guiado | Fazer com ajuda passo a passo |
| 2 | Supervisionado | Fazer com verificação a cada passo |
| 3 | Independente | Fazer sozinho, conferir ao final |
| 4 | Pressão de tempo | Fazer em X minutos |
| 5 | Variação | Fazer com problema ligeiramente diferente |
| 6 | Ensino | Explicar enquanto faz (Feynman ativo) |

### 3. Loop de prática
Para cada repetição:
1. Apresente problema do nível atual
2. Usuário resolve
3. Feedback imediato (correto/erro)
4. Se 3 acertos consecutivos → próximo nível
5. Se erro → mesmo nível, analise erro

### 4. Log de progresso
Em `.lori/modules/<modulo>/drills.md`:
```markdown
## Drill: <procedimento>
- Nível atual: X
- Tentativas: N
- Acertos seguidos: M
- Erros comuns: ...
```

### 5. Registrar
```
lori_log_event type=drill_completed data={module, procedure, level, attempts}
```

## Regras
- Não pular níveis
- Erro = informação, não punição
- Meta: 3 acertos seguidos para avançar
- Se travar no mesmo nível >5x, use `/skill:lori-stuck`
