---
name: lori-feynman
description: Técnica Feynman - explicar conceito como se para uma criança de 12 anos, identificar gaps no entendimento. Use para validar compreensão profunda.
---

# Lori Feynman

Ritual de explicação simplificada para identificar gaps de entendimento.

## Quando usar
- Usuário acabou de aprender conceito complexo
- Quer verificar se realmente entendeu
- Preparando explicação para outrem
- `/lori-start <modulo> feynman`

## Ritual

### 1. Escolher conceito
- Um conceito por sessão Feynman
- Escreva o nome no topo: `## Feynman: <conceito>`

### 2. Explicar em voz alta (simulado)
Peça ao usuário para explicar como se ensinasse uma criança de 5 anos.
Regras da explicação:
- Zero jargão técnico
- Sem "é óbvio que"
- Analogia do mundo real
- Máximo 3 frases

### 3. Identificar gaps
Durante a explicação, marque:
- `GAP` - quando usuário usa jargão sem definir
- `GAP` - quando pula etapa lógica
- `GAP` - quando diz "não sei explicar direito"
- `GAP` - analogia quebrada

### 4. Refinar
Para cada GAP:
1. Volte ao material fonte
2. Releia a definição formal
3. Crie nova analogia
4. Tente novamente

### 5. Documentar
Salvar em `.lori/modules/<modulo>/concepts.md`:
```markdown
## <conceito>
**Explicação simples:** ...
**Analogia:** ...
**Gaps encontrados:** ...
```

### 6. Registrar
```
lori_log_event type=concept_learned data={concept, module, gaps_count}
```
Se houver gaps não resolvidos:
```
lori_log_event type=weakness_added data={concept}
```

## Regras
- Se não consegue simplificar, não entendeu
- Criança de 5 anos = teste de ouro
- Sempre documentar gaps
