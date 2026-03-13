# 📦 Arquivados

Pasta destinada a projetos finalizados e concluídos.

## Propósito

Esta pasta armazena projetos que foram **concluídos**, mantendo todo o histórico, logs, código e métricas para referência futura. Quando um projeto é arquivado:

- ✅ É **removido** do módulo ativo (não fica duplicado)
- ✅ Mantém **todos os arquivos** (logs, código, métricas, documentação)
- ✅ Inclui um **relatório final** com resultados e lições aprendidas
- ✅ Permite **consulta futura** de soluções e aprendizados

## Estrutura

```
archived/
├── README.md                    # Este arquivo
├── indice.md                    # Lista de projetos arquivados
├── _template-relatorio.md       # Template para relatório de arquivamento
└── [modulo]/                    # Organizado por módulo de origem
    └── [YYYY-MM-DD]-[nome]/     # Pasta do projeto (data + nome)
        ├── README.md            # README original do projeto
        ├── relatorio-final.md   # Relatório de conclusão
        ├── logs/                # Logs diários de estudo
        ├── projects/            # Código e projetos práticos
        ├── knowledge/           # Conceitos e flashcards
        └── meta/                # Planos e metadados
```

## Como Arquivar um Projeto

### Método 1: Command (Recomendado)

```bash
/ul-module-archive [nome]
```

Este command irá:
1. Verificar o módulo ativo em `projects/`
2. Pedir confirmação do nome do projeto
3. Mover todos os arquivos de `projects/[modulo]/` para `archived/[modulo]/[data]-[nome]/`
4. Criar o relatório final a partir do template
5. Atualizar o índice de projetos arquivados
6. Remover o projeto da pasta `projects/`

### Método 2: Manual

1. Crie a pasta no formato: `archived/[modulo]/YYYY-MM-DD-nome-do-projeto/`
2. Copie todos os arquivos de `projects/[modulo]/` (README, logs, projects, knowledge, meta)
3. Preencha o `relatorio-final.md` usando o template
4. Adicione o projeto ao `indice.md`
5. Remova o projeto de `projects/[modulo]/`

## Convenções de Nomenclatura

**Pastas de projeto:**
```
[YYYY-MM-DD]-[nome-do-projeto]
```

Exemplos:
- `2026-02-15-cli-tool`
- `2026-03-20-http-server`
- `2026-04-10-database-engine`

**Regras:**
- Data no formato ISO (YYYY-MM-DD) - data de arquivamento
- Nome em minúsculas com hífens
- Descritivo mas curto (máx. 3-4 palavras)

## Relatório Final

Todo projeto arquivado DEVE incluir um `relatorio-final.md` com:

- **Objetivo**: O que o projeto propunha alcançar
- **Resultado**: O que foi de fato alcançado
- **Métricas**: Tempo gasto, dias estudados, streak
- **O que funcionou**: Técnicas e abordagens efetivas
- **O que não funcionou**: Dificuldades e falhas
- **Lições aprendidas**: Insights para projetos futuros
- **Links úteis**: Referências e recursos importantes

Use o template: [`_template-relatorio.md`](./_template-relatorio.md)

## Índice de Projetos

Consulte o [`indice.md`](./indice.md) para ver todos os projetos arquivados organizados por:
- Módulo de origem
- Data de arquivamento
- Status de conclusão
- Links para relatórios

## Benefícios

1. **Histórico preservado**: Todo o trabalho está documentado
2. **Consulta rápida**: Encontre soluções antigas facilmente
3. **Análise de progresso**: Compare projetos ao longo do tempo
4. **Referência para novos projetos**: Reutilize código e técnicas
5. **Módulos limpos**: Apenas projetos ativos nos módulos

---

*Projetos arquivados são conquistas concluídas. Celebre cada arquivamento!*
