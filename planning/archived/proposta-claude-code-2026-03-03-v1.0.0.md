# Proposta: Migração de Agentes OpenCode → Claude Code

## Visão Geral

Proposta de implementar os 4 agentes do framework ultralearning usando Claude Code como engine, mantendo a mesma experiência do usuário mas com maior controle sobre a infraestrutura.

---

## 1. Arquitetura do Sistema

### 1.1 Como Claude Code Simula Agentes

Claude Code **não tem sistema nativo de múltiplos agentes com handoff**, mas podemos replicar a arquitetura usando:

| Componente OpenCode | Implementação em Claude Code |
|--------------------|------------------------------|
| `@meta` | `claude --system-prompt-file prompts/meta.md` |
| `@tutor` | `claude --system-prompt-file prompts/tutor.md` |
| `@review` | `claude --system-prompt-file prompts/review.md` |
| `@session` | `claude --system-prompt-file prompts/session.md` |
| `#keyword` | Argumento positional passado ao Claude |
| `opencode run --agent @X` | Script wrapper (`bin/ultralearning`) |

### 1.2 Estrutura de Arquivos Proposta

```
ultralearning/
├── bin/
│   └── ultralearning           # CLI wrapper principal
├── prompts/
│   ├── meta.md                 # System prompt @meta
│   ├── tutor.md                # System prompt @tutor
│   ├── review.md               # System prompt @review
│   └── session.md              # System prompt @session
├── tools/
│   ├── read-module.sh          # Ler dados do módulo
│   ├── update-progress.sh      # Atualizar progresso
│   ├── generate-plan.sh        # Gerar planos
│   └── ...                     # Outras tools
├── Makefile                     # 14 comandos (mantido)
└── scripts/                     # Scripts existentes
```

---

## 2. CLI Wrapper: `bin/ultralearning`

### 2.1 Interface Proposta

```bash
# Usar @meta
./bin/ultralearning meta "#decompose-goal Python para dados"
./bin/ultralearning meta "#create-weekly-plan semana 3"

# Usar @tutor
./bin/ultralearning tutor "#explain closures"
./bin/ultralearning tutor "#drill list comprehensions"
./bin/ultralearning tutor "#feynman recursão"

# Usar @review
./bin/ultralearning review "#review-scripts"

# Usar @session
./bin/ultralearning session "#session-start"

# Modo interativo
./bin/ultralearning chat tutor    # Entra em chat com @tutor
```

### 2.2 Implementação do Wrapper

```bash
#!/usr/bin/env bash
# bin/ultralearning

set -e

AGENT="$1"
shift || die "Uso: ultralearning <agente> [keyword] [args]"
KEYWORD="$1"
shift

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROMPTS_DIR="$SCRIPT_DIR/../prompts"

# Validar agente
case "$AGENT" in
    meta|tutor|review|session) ;;
    *) die "Agente inválido: $AGENT. Use: meta, tutor, review, session" ;;
esac

# Construir comando
PROMPT_FILE="$PROMPTS_DIR/$AGENT.md"

# Se tem keyword, prepend ao argumento
if [ -n "$KEYWORD" ]; then
    INPUT="$KEYWORD $@"
else
    # Modo interativo
    INPUT=""
fi

# Executar Claude Code
claude \
    --system-prompt-file "$PROMPT_FILE" \
    --print \
    "$INPUT"
```

---

## 3. System Prompts: Adaptação

### 3.1 Diferenças entre OpenCode e Claude Code

| Aspecto | OpenCode | Claude Code |
|---------|----------|-------------|
| Formato | `.md` com frontmatter | `.md` puro |
| Inclusão de arquivos | `@file` | Claude automaticamente inclui contexto |
| Tools | Built-in (read, write, edit, bash) | Mesmas + SDK para customizar |
| Cache | Manual | `--cache-key` flag |

### 3.2 Adaptações Necessárias

#### Remover frontmatter OpenCode

**Antes (OpenCode)**:
```markdown
---
name: @tutor
model: claude-sonnet-4-20250514
---

# Agente @tutor
```

**Depois (Claude Code)**:
```markdown
# Agente @tutor - Mentor Socrático

[Conteúdo do prompt sem frontmatter]
```

#### Adaptar referências a tools

**Antes**:
```markdown
Para ler o log de hoje:
`opencode run --agent @tutor "#read log"`
```

**Depois**:
```bash
# Para ler o log de hoje:
cat projects/$MODULE/logs/daily/$(date +%Y-%m-%d).md
```

### 3.3 Exemplo: Prompt @tutor Adaptado

```markdown
# Agente @tutor - Mentor Socrático

## Missão

Você é um mentor socrático de ultralearning. Seu papel é guiar através de perguntas, NUNCA entregando soluções prontas.

> "Não me diga a resposta. Me faça as perguntas certas."

## Contexto

Para carregar contexto do módulo atual:
```bash
MODULE=$(cat .ultralearning/module 2>/dev/null || echo "python-basics")
cat projects/$MODULE/meta/learning-map.md
```

## Keywords

### #explain [CONCEITO]

Quando usar: Introdução a conceito novo.

Processo:
1. Analogia do mundo real
2. Exemplo mínimo
3. Aplicação prática

[... resto do conteúdo ...]
```

---

## 4. Ferramentas Customizadas (Opcional)

### 4.1 Quando Criar Tools Customizadas

- Leitura de arquivos do projeto (módulo, logs, progresso)
- Execução de scripts existentes (make, streak, SRS)
- Integração com sistema de arquivos

### 4.2 Exemplo: Tool de Contexto

```python
# tools/context.py
#!/usr/bin/env python3
"""Tool para carregar contexto do módulo."""

import json
import os
import sys

def main():
    module = os.getenv('ULTRALARNING_MODULE', 'default')
    
    context = {
        "module": module,
        "paths": {
            "root": f"projects/{module}",
            "logs": f"projects/{module}/logs/daily",
            "meta": f"projects/{module}/meta",
            "knowledge": f"projects/{module}/knowledge"
        }
    }
    
    print(json.dumps(context))

if __name__ == "__main__":
    main()
```

### 4.3 Registro de Tools (MCP ou Native)

Claude Code suporta tools nativas. Para registrar:

```bash
# Via claude.json (na raiz do projeto)
{
  "tools": [
    {
      "name": "load-context",
      "command": "python3 tools/context.py"
    }
  ]
}
```

---

## 5. Integração com Makefile

### 5.1 Comandos Atuais (manter compatibilidade)

```makefile
# Executar @tutor
tutor:
	@./bin/ultralearning tutor "$$(cat /dev/stdin)"

# Executar @meta
meta:
	@./bin/ultralearning meta "$$(cat /dev/stdin)"

# Revisão
review:
	@./bin/ultralearning review "$$(cat /dev/stdin)"
```

### 5.2 Usage

```bash
# Sem mudança para o usuário
make start      # same
make study      # same
make end        # same
make plan       # invoca @meta
make review     # invoca @tutor (SRS)
```

---

## 6. Comparação: OpenCode vs Claude Code

### 6.1 Custos

| Aspecto | OpenCode | Claude Code |
|---------|----------|-------------|
| Plano | ~€15-30/mês (variável) | $17-20/m (Pro) ou $100-200/m (Max) |
| Controle | Limitado | Total |
| Agentes nativos | Sim | Não (simulado) |
| Multi-agent handoff | Built-in | Manual (scripts) |
| Ferramentas | Fixas | Customizáveis |

### 6.2 Benefícios da Migração

| Benefício | Descrição |
|-----------|-----------|
| **Portabilidade** | Prompts são arquivos .md simples |
| **Transparência** | Você controla exatamente o que entra no prompt |
| **Customização** | Pode adicionar tools específicas do projeto |
| **Custo previsível** | Plano fixo, não variational por tokens |
| **Debugging** | Pode testar prompts diretamente |

### 6.3 Riscos

| Risco | Mitigação |
|-------|-----------|
| Perda de handoff automático | Scripts wrapper simulam o fluxo |
| Curva de manutenção | Manter prompts em arquivos .md é simples |
| Funcionalidade reducida | Avaliar se todas as features são necessárias |

---

## 7. Plano de Implementação

### Fase 1: Setup (1 dia)

- [ ] Criar estrutura de diretórios
- [ ] Criar CLI wrapper `bin/ultralearning`
- [ ] Copiar prompts existentes para `prompts/`

### Fase 2: Adaptação de Prompts (1 dia)

- [ ] Remover frontmatter OpenCode
- [ ] Adaptar referências a tools
- [ ] Testar cada agente

### Fase 3: Integração Makefile (4 horas)

- [ ] Atualizar targets para usar wrapper
- [ ] Testar comandos `make plan`, `make study`, etc.

### Fase 4: Validação (1 dia)

- [ ] Testar ciclo completo (meta → tutor → review)
- [ ] Comparar qualidade de saída com OpenCode
- [ ] Ajustar prompts se necessário

---

## 8. Estimativa de Esforço

| Fase | Tempo |
|------|-------|
| Setup | 1 dia |
| Adaptação | 1 dia |
| Integração | 4 horas |
| Validação | 1 dia |
| **Total** | **~3 dias** |

---

## 9. Próximos Passos

1. **Validar interesse**: O usuário quer prosseguir com a migração?
2. **Testar proof-of-concept**: Criar wrapper mínimo com 1 agente
3. **Avaliar trade-offs**: Vale a pena vs manter OpenCode?

---

*Proposta gerada em 2026-02-27*
