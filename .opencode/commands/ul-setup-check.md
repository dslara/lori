---
description: Verificar dependências do sistema (/ul-setup-check)
agent: tutor
model: opencode-go/glm-5
---

## Uso
/ul-setup-check

## Descrição
Verifica se todas as dependências do Ultralearning System estão instaladas e configuradas corretamente.

## Processo

### Passo 1: Verificar Dependências

Checar cada ferramenta:
- **jq**: Processamento de JSON (opcional)
- **bc**: Cálculos matemáticos (opcional para SRS)
- **opencode**: CLI principal
- **bun**: Runtime para tools TypeScript

### Passo 2: Testar Funcionalidade

Para cada dependência:
- Verificar se está instalada
- Obter versão
- Testar execução básica

### Passo 3: Gerar Relatório

Mostrar:
- ✓ Instalado e funcionando
- ⚠ Instalado mas com problemas
- ✗ Não instalado

### Passo 4: Sugerir Correções

Para cada problema:
- Comando de instalação
- Link para documentação
- Alternativas

## Output

```
🔍 Verificando dependências do Ultralearning System...

✓ jq: 1.6 (instalado)
⚠️ bc: não instalado (opcional para SRS)
✓ opencode: 0.5.1 (instalado)
✓ bun: 1.0.25 (instalado)

📊 Status: 3/4 dependências instaladas
✅ Sistema pronto para uso!

⚠️ Recomendações:
  • bc é opcional mas melhora cálculos de SRS
  • Instale: sudo apt install bc (Linux) ou brew install bc (macOS)
```

## Exemplos

### Exemplo 1: Tudo instalado

```
Usuário: /ul-setup-check

Sistema:
"🔍 Verificando dependências...

  ✓ jq: 1.6
  ✓ bc: 1.07.1
  ✓ opencode: 0.5.1
  ✓ bun: 1.0.25

✅ Todas as dependências instaladas!
✅ Sistema pronto para uso.

🚀 Próximos passos:
  /ul-module-create [nome]  → Criar primeiro módulo
  /ul-study-start           → Iniciar sessão"
```

### Exemplo 2: Dependências faltando

```
Usuário: /ul-setup-check

Sistema:
"🔍 Verificando dependências...

  ✗ jq: não instalado
  ✗ bc: não instalado
  ⚠️ opencode: não instalado
  ✓ bun: 1.0.25

❌ 3/4 dependências faltando

⚠️ Ações necessárias:

1. jq (recomendado):
   Linux: sudo apt install jq
   macOS: brew install jq

2. bc (opcional para SRS):
   Linux: sudo apt install bc
   macOS: brew install bc

3. opencode (obrigatório):
   Baixe: https://github.com/opencode-ai/opencode/releases
   Ou: npm install -g opencode

💡 Após instalar, execute: /ul-setup-check"
```

### Exemplo 3: Versões desatualizadas

```
Usuário: /ul-setup-check

Sistema:
"🔍 Verificando dependências...

  ✓ jq: 1.5 (versão antiga, recomendado 1.6+)
  ✓ bc: 1.07.1
  ⚠️ opencode: 0.3.0 (desatualizado, recomendado 0.5+)
  ✓ bun: 1.0.25

⚠️ Sistema funcional mas com versões antigas

Recomendações:
  • Atualize opencode: npm update -g opencode
  • Considere atualizar jq para melhor performance"
```

## Dependências Detalhadas

### Obrigatórias

| Ferramenta | Versão Min | Uso |
|------------|------------|-----|
| **opencode** | 0.5.0+ | CLI principal, agents, commands |
| **bun** | 1.0.0+ | Compilar e executar tools TypeScript |

### Opcionais

| Ferramenta | Versão Min | Uso |
|------------|------------|-----|
| **jq** | 1.5+ | Processamento avançado de JSON |
| **bc** | 1.06+ | Cálculos matemáticos no SRS |

## Instalação por Sistema

### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install jq bc
npm install -g opencode
curl -fsSL https://bun.sh/install | bash
```

### Linux (Fedora)

```bash
sudo dnf install jq bc
npm install -g opencode
curl -fsSL https://bun.sh/install | bash
```

### macOS

```bash
brew install jq bc
npm install -g opencode
curl -fsSL https://bun.sh/install | bash
```

## Verificação Avançada

Para verificação mais profunda, use:

```bash
/ul-setup-verify
```

Que inclui:
- Verificar CSVs
- Testar tools
- Validar estrutura

## Integração com Tools

Este command invoca:
- `setup.checkDependencies` - Verificar dependências

## Ver Também

- `/ul-setup-init` - Inicializar estrutura
- `/ul-setup-verify` - Verificação completa
- `/ul-data-manage init` - Inicializar CSVs
