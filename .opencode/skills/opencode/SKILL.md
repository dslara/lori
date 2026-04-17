---
name: "opencode"
description: "Especialista OpenCode — criar e explicar Commands, Skills, Tools e Plugins. Valida conformance com documentação oficial."
license: MIT
compatibility: opencode
metadata:
  principle: "opencode-extensions"
  agent: "@meta @tutor @review @brainstorm @docs @build @plan"
  keywords: "opencode, command, skill, tool, plugin, extension, frontmatter, zod, hook"
---

# opencode Skill — Especialista OpenCode

Criar e explicar Commands, Skills, Tools e Plugins para OpenCode. Valida conformance com documentação oficial.

**Faz**: Commands (`/command`), skills (`SKILL.md`), tools (`.ts`), plugins (`.ts`)
**NÃO faz**: Configura servidor, gerencia LSP, cria agentes (isso é `skill("agentforge")`)

## Quando Usar

| Trigger | Ação |
|---------|------|
| `#command` | Criar command personalizado |
| `#skill` | Criar skill reutilizável |
| `#tool` | Criar tool TypeScript |
| `#plugin` | Criar plugin com hooks |
| `#explain` | Explicar estrutura OpenCode |

---

## Regras de Ouro

1. **Consultar** — Pesquise primeiro em `viking://resources/opencode/`
2. **Validar** — Frontmatter e nomes conforme documentação
3. **Testar** — Verifique se arquivo está bem formado
4. **Padrão** — Use templates do projeto existente
5. **Documentar** — Explique como usar

---

## Contexto

**Antes de criar, verifique:**

| Tipo | Documentação | Padrões |
|------|--------------|---------|
| Command | `membrowse viking://resources/opencode/commands/` | `.opencode/commands/` |
| Skill | `membrowse viking://resources/opencode/skills/` | `.opencode/skills/` |
| Tool | `membrowse viking://resources/opencode/custom-tools/` | `.opencode/tools/` |
| Plugin | `membrowse viking://resources/opencode/plugins/` | `.opencode/plugins/` |

---

## Keywords

### `#command [nome]` — Criar Command

**Quando**: Usuário quer command personalizado

**Template**:
```yaml
---
description: [descrição curta - obrigatória]
agent: [nome do agent primary]
model: [modelo específico - opcional]
---

[prompt executado quando chamar /nome]
```

**Validação**: `description` obrigatória, `agent` obrigatório

---

### `#skill [nome]` — Criar Skill

**Quando**: Usuário quer skill reutilizável

**Template**:
```yaml
---
name: [nome-da-skill]
description: [descrição clara para agente escolher]
license: MIT
compatibility: opencode
metadata:
  principle: [opcional]
  agent: [opcional - ex: @tutor]
  keywords: [opcional - ex: "keyword1, keyword2"]
---

## What I do
[O que a skill faz]

## When to use me
[Quando usar esta skill]

## Process
[Passos detalhados - opcional]
```

**Validação**:
- `name`: 1-64 chars, lowercase, hifens, não começa/termina com `-`
- `description`: 1-1024 chars
- Nome do diretório = `name`

---

### `#tool [nome]` — Criar Tool

**Quando**: Usuário quer tool TypeScript

**Template**:
```typescript
import { tool } from "@opencode-ai/plugin";
import { z } from "zod";

export default tool({
  description: "Descrição clara da tool",
  args: {
    operation: z.enum(["op1", "op2"]).describe("Operação"),
    param1: z.string().optional().describe("Parâmetro opcional"),
    param2: z.number().min(0).max(100).optional().describe("Numérico"),
  },
  async execute(args, context) {
    // context: { agent, sessionID, messageID, directory, worktree }
    const { directory } = context;
    
    switch (args.operation) {
      case "op1":
        return JSON.stringify({ success: true, data: {...} });
      case "op2":
        return JSON.stringify({ success: true, data: {...} });
      default:
        return JSON.stringify({ success: false, error: "UNKNOWN" });
    }
  }
});
```

**Múltiplas tools por arquivo**:
```typescript
export const add = tool({ ... });
export const multiply = tool({ ... });
// Cria: math_add, math_multiply
```

---

### `#plugin [nome]` — Criar Plugin

**Quando**: Usuário quer plugin com hooks

**Template**:
```typescript
import type { Hooks, PluginInput } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin";

export const MyPlugin = async (input: PluginInput): Promise<Hooks> => {
  const { directory, worktree } = input;
  
  return {
    // Hook de eventos
    event: async ({ event }) => {
      if (event.type === "session.created") {
        // Lógica para sessão criada
      }
      if (event.type === "message.updated") {
        // Lógica para mensagem atualizada
      }
    },
    
    // Tools expostas pelo plugin
    tool: {
      myTool: tool({
        description: "Descrição",
        args: { /* ... */ },
        async execute(args, context) {
          return JSON.stringify({ success: true });
        }
      })
    }
  };
};
```

**Eventos disponíveis**:
- `session.created`, `session.updated`, `session.deleted`
- `message.updated`, `message.part.updated`
- `session.error`

---

### `#explain [tipo]` — Explicar Estrutura

**Quando**: Usuário quer entender como algo funciona

**Processo**: Consultar doc → Explicar com exemplo → Mostrar código

---

## Quick Reference

| Keyword | Quando | Output |
|---------|--------|--------|
| `#command` | Criar command | `.opencode/commands/[nome].md` |
| `#skill` | Criar skill | `.opencode/skills/[nome]/SKILL.md` |
| `#tool` | Criar tool | `.opencode/tools/[nome].ts` |
| `#plugin` | Criar plugin | `.opencode/plugins/[nome].ts` |
| `#explain` | Explicar estrutura | Documentação + exemplo |

---

## Checklist Final

Antes de criar:
- [ ] Consultou documentação em `viking://resources/opencode/`?
- [ ] Frontmatter correto?
- [ ] Nome segue padrões?
- [ ] Arquivo salvo no local correto?
- [ ] Explicou como usar?

**FALHA quando**: Cria sem doc | Não valida | Local errado | Não explica

---

## Relação com Skills Irmãs

| Skill | Quando usar |
|-------|-------------|
| **opencode** (esta) | Criar command/skill/tool/plugin |
| **openviking** | Dúvida sobre API, URI, errors, config |
| **openviking-context** | Buscar/ler memórias ou contexto |
| **resource-workflow** | Gerenciar recursos no viking:// |

---

## Documentação de Referência

| Fonte | Caminho |
|-------|---------|
| Commands API | `viking://resources/opencode/commands/` |
| Skills API | `viking://resources/opencode/skills/` |
| Tools API | `viking://resources/opencode/custom-tools/` |
| Plugins API | `viking://resources/opencode/plugins/` |
| Agentes | `viking://resources/opencode/agents/` |

---

*opencode Skill — Especialista em extensões OpenCode*