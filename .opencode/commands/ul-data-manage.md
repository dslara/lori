---
description: Gerenciar dados - inicializar, resetar (/ul-data-manage)
agent: tutor
model: opencode-go/kimi-k2.5
---

## Descrição

Gerencia dados do sistema Ultralearning: inicializa estrutura CSV ou reseta todos os dados. Use com cautela.

## Uso
/ul-data-manage [init|reset]

Comando de gerenciamento de dados para o Sistema Ultralearning.

## Operações

### /ul-data-manage init
Inicializa a estrutura de dados CSV. Cria todos os arquivos necessários se não existirem.

Use quando:
- Configurando o sistema pela primeira vez
- Após clonar o repositório em uma nova máquina
- Se arquivos de dados estiverem faltando ou corrompidos

### /ul-data-manage reset
⚠️ AVISO: Isso exclui TODOS os dados incluindo sessões, streaks, flashcards e progresso!

Use quando:
- Começando do zero com uma base limpa
- Testando o sistema (apenas desenvolvimento)

**Sempre confirme com o usuário antes de resetar dados.**

## Operações Disponíveis

Pergunte ao usuário qual operação deseja realizar:
- "init" - Inicializar estrutura de dados
- "reset" - Resetar todos os dados (requer confirmação)

Execute a operação apropriada usando a ferramenta 'data'.
