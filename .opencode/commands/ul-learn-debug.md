---
description: Debug socrático - guia para encontrar bugs (/ul-learn-debug)
agent: tutor
model: opencode-go/kimi-k2.5
---

Argumento recebido: $ARGUMENTS (descrição do problema)

## Uso
/ul-learn-debug [descrição do problema]

## Descrição

Este command é um **wrapper** que invoca a skill `debug-socratic` para guiar o usuário a encontrar bugs através de perguntas, sem revelar a solução diretamente.

## Processo

### Passo 1: Coletar Informações

Se não houver `[descrição]`, perguntar:
```
"Descreva o bug:

1. O que deveria acontecer?
2. O que está acontecendo?
3. Erro específico? (mensagem, stack trace)
4. Quando começou? (depois de qual mudança?)
5. Você já tentou algo?"
```

### Passo 2: Invocar Skill `debug-socratic`

Delegar para a skill com o problema descrito.

A skill `debug-socratic` fará:

**Fase 1 - Entender (5 min):**
- Perguntar o que o código deveria fazer
- Identificar expectativa vs realidade
- Coletar contexto do sistema

**Fase 2 - Isolar (10 min):**
- Sugerir criar caso mínimo reproduzível
- Identificar entrada específica que causa o bug
- Reduzir escopo do problema

**Fase 3 - Hipóteses (10 min):**
- Listar possíveis causas
- Priorizar mais prováveis
- Sugerir testes para validar cada uma

**Fase 4 - Validar (15 min):**
- Guiar adição de logs/pontos de interrupção
- Interpretar resultados
- Confirmar ou refutar hipóteses

**Fase 5 - Solucionar (10 min):**
- Discutir possíveis correções
- Sugerir melhor solução
- Prevenir regressões futuras

### Passo 3: Registro

O progresso do debug é registrado automaticamente via `memcommit()` no final da sessão.

### Passo 4: Consolidação

```
✅ Debug Concluído!

📋 Resumo:
• Problema: [descrição]
• Causa raiz: [causa]
• Solução: [solução]
• Tempo: [X] minutos

💡 Aprendizado:
• Padrão identificado: [padrão]
• Prevenção futura: [dica]

🎯 Recomendação:
• Criar flashcard do padrão de erro → /ul-memory-create
• Praticar detecção → /ul-practice-drill 'debug patterns'
```

## Exemplo de Interação

```
Usuário: /ul-learn-debug "Meu programa Go trava ao processar arquivos grandes"

Sistema:
"Vamos debugar isso juntos! 

[Skill debug-socratic assume]

--- Fase 1: Entender ---

Primeiro, me ajude a entender:

1. O que o programa deveria fazer com os arquivos?
   [Usuário explica]

2. Quando você diz 'trava', o que acontece exatamente?
   • Congela e não responde?
   • Dá erro e fecha?
   • Fica lento eternamente?
   
3. Qual tamanho dos arquivos que funcionam vs que travam?
   [Usuário: 'Arquivos < 1MB funcionam, > 10MB travam']

💡 Padrão identificado: Limite de memória?

--- Fase 2: Isolar ---

Vamos criar um caso mínimo. Você consegue criar
um programa que:
• Lê apenas 1 arquivo grande
• Não faz processamento complexo
• Ainda assim trava?

Isso ajuda a isolar se é problema de:
✓ Leitura de arquivo
✓ Processamento
✓ Memória

[Usuário cria caso mínimo]

✅ Caso mínimo reproduz o bug!

--- Fase 3: Hipóteses ---

Possíveis causas para travar com arquivos grandes:

1. **Memória**: Lendo arquivo inteiro na RAM
2. **Buffer**: Buffer muito pequeno, muitas alocações
3. **Goroutines**: Deadlock ou leak
4. **Recursos**: Arquivo não sendo fechado

Qual você acha mais provável?
Por que?

[Usuário: 'Acho que é memória, uso ioutil.ReadAll']

💡 Excelente hipótese! ioutil.ReadAll carrega tudo na RAM.

--- Fase 4: Validar ---

Vamos confirmar. Adicione este log antes da leitura:

```go
var m runtime.MemStats
runtime.ReadMemStats(&m)
fmt.Printf("Alloc = %v MiB", m.Alloc / 1024 / 1024)
```

Execute com arquivo grande. O que acontece
com a memória?

[Usuário: 'Memória sobe até 2GB e programa morre']

✅ Confirmado! É estouro de memória.

--- Fase 5: Solucionar ---

Problema: ioutil.ReadAll carrega arquivo inteiro.

Soluções possíveis:
1. bufio.Scanner (linha a linha)
2. bufio.Reader (chunks)
3. streaming (io.Pipe)

Qual faz mais sentido para seu caso?

[Discute opções...]

✅ SOLUÇÃO: Usar bufio.Scanner para ler linha a linha

Código corrigido:
[Mostra solução]

✅ Debug Concluído!

📋 Resumo:
• Problema: Travamento com arquivos grandes
• Causa: ioutil.ReadAll carregava tudo na RAM
• Solução: bufio.Scanner para streaming
• Tempo: 25 minutos

💡 Aprendizado:
• Nunca usar ReadAll para arquivos grandes
• Sempre considerar streaming
• Monitorar uso de memória

🎯 Recomendação:
• Criar flashcard: 'Quando usar streaming vs ReadAll'
• Praticar: /ul-practice-drill 'file I/O patterns'"
```

## Quando Usar

✅ **USE para:**
- Bugs difíceis (travado >30 min)
- Erros que não entende
- Problemas intermitentes
- Quer aprender técnica de debug

❌ **NÃO USE para:**
- Erros de sintaxe óbvios → compilador já diz
- Problemas simples → tente sozinho primeiro
- Quer solução rápida → sem paciência para socrático

## Integrações

**Skill invocada:**
- `debug-socratic` — Guia socrático de debugging

**Tools utilizadas:**
- `context.getFullContext` — Contexto do projeto

**Commands relacionados:**
- `/ul-productivity-break` — Se travou mentalmente
- `/ul-practice-drill` — Praticar padrões de debug
- `/ul-memory-create` — Salvar padrões de erro
- `/ul-study-end` — Ao resolver, encerrar sessão

## Handoff

- Bug resolvido → `/ul-study-end` para salvar
- Padrão identificado → `/ul-memory-create`
- Travou mentalmente → `/ul-productivity-break`
- Novo bug → Reiniciar `/ul-learn-debug`

---

*Command: /ul-learn-debug — Wrapper para skill debug-socratic*
