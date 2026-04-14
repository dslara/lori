# Ultralearning System

Sistema de aprendizado autodirigido integrando Ultralearning (Scott Young) + A Mind for Numbers (Barbara Oakley). Otimizado para CS Fundamentals.

## Quick Start

```bash
/ul-setup-check                                     # Verificar dependências
/ul-module-create                                    # Criar módulo
/ul-study-start → /ul-study-drill → /ul-study-end  # Rotina diária
```

**Guia completo**: [HOW_TO_USE.md](HOW_TO_USE.md)

## Arquitetura

| Camada | Tecnologia | Propósito |
|--------|------------|-----------|
| Commands | `.opencode/commands/` | Interface principal (commands `/ul-*`) |
| Tools | `.opencode/tools/` | Processamento de dados (tools TypeScript) |
| Skills | `.opencode/skills/` | Guias especializados (skills) |
| Agents | `.opencode/agents/` | @tutor, @meta, @review |
| Dados (CSV) | `data/*.csv` | Dados quantitativos (offline-first) |
| Memória | OpenViking | Dados qualitativos (contexto entre sessões) |

**Regra**: CSV obrigatório. OpenViking opcional.

## Agentes

| Agente | Função |
|--------|--------|
| **@tutor** | Mentor socrático, quiz, drills, feedback |
| **@meta** | Planejamento estratégico, decomposição |
| **@review** | Auditoria do framework |

## Estrutura do Projeto

```
ultralearning/
├── .opencode/         # Commands, tools, skills, agents
├── data/               # Base de dados local (CSV)
├── projects/           # Módulos de aprendizado
├── docs/guides/        # princípios + técnicas
└── HOW_TO_USE.md       # Guia completo e autocontido
```

---

*Comece agora com `/ul-setup-check`. Guia completo em [HOW_TO_USE.md](HOW_TO_USE.md).*