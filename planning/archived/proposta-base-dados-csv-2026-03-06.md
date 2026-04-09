# Proposta: Base de Dados Local em CSV

**Data**: 2026-03-06
**Status**: Implementado
**Autor**: @meta (com input do usuário)

## Contexto

O Ultralearning System precisa de uma base de dados local para:
1. Servir de contexto para os agentes
2. Manter histórico de progresso
3. Preparar para migração futura a uma base de dados real

Atualmente os dados estão fragmentados:
- `.ultralearning-stats` (streak, sessões)
- `projects/M1/logs/daily/*.md` (logs em markdown)
- `.current-topic` (módulo ativo)

## Decisão

Implementar base de dados local em **CSV** com as seguintes características:
- **Formato**: CSV (simples, legível, fácil migrar para SQL)
- **Estrutura**: Um diretório `data/` centralizado
- **Multi-tenant**: Preparado para múltiplos usuários
- **Memória do tutor**: Captura interações para contexto futuro

## Schema

```
data/
├── users.csv              # Usuários
├── modules.csv            # Módulos de aprendizado
├── sessions.csv           # Sessões diárias
├── session_skills.csv     # Técnicas usadas por sessão
├── flashcards.csv         # Flashcards SRS
├── reviews.csv            # Histórico de revisões SRS
├── insights.csv           # Métricas agregadas
├── goals.csv              # Metas do usuário
├── tutor_interactions.csv # Memória das interações
└── schema.md              # Documentação
```

### Tabelas Principais

| Tabela | Propósito | Chaves |
|--------|-----------|--------|
| `users` | Dados do usuário | PK: id |
| `modules` | Módulos de estudo | PK: id, FK: user_id |
| `sessions` | Sessões diárias | PK: id, FK: user_id, module_id |
| `session_skills` | Técnicas usadas | FK: session_id |
| `flashcards` | Flashcards SRS | PK: id, FK: user_id, module_id |
| `reviews` | Histórico SRS | FK: flashcard_id |
| `insights` | Analytics | FK: user_id, module_id |
| `goals` | Metas pessoais | PK: id, FK: user_id, module_id |
| `tutor_interactions` | Memória do tutor | PK: id, FK: session_id |

### Destaques

1. **Multi-tenant**: Todas as tabelas principais têm `user_id`
2. **Memória do tutor**: `tutor_interactions.csv` captura conversas
3. **Analytics**: `insights.csv` para métricas agregadas
4. **SRS**: `flashcards.csv` + `reviews.csv` para spaced repetition
5. **Metas**: `goals.csv` para tracking de objetivos

## Migração de Dados Existentes

### Dados a Migrar

| Origem | Destino | Script |
|--------|---------|--------|
| `.ultralearning-stats` | `insights.csv` | Manual (dados iniciais) |
| `projects/M1/logs/daily/*.md` | `sessions.csv` | Script de migração |
| Flashcards existentes | `flashcards.csv` | Script de migração |

### Dados Iniciais

**users.csv**:
```csv
dani,dani,,America/Sao_Paulo,2026-03-01,"{""daily_goal_min"":60}"
```

**modules.csv**:
```csv
M1,dani,math-foundations,active,2026-03-01,,0
```

## Integração com Sistema

### Scripts Afetados

| Script | Mudança |
|--------|---------|
| `scripts/end.sh` | Escrever em `sessions.csv` e `insights.csv` |
| `scripts/start.sh` | Ler contexto de `sessions.csv` |
| `scripts/status.sh` | Ler de `insights.csv` |
| `scripts/streak.sh` | Migrar lógica para `insights.csv` |
| `scripts/spaced-repetition.sh` | Ler/escrever em `reviews.csv` |

### Agentes Afetados

| Agente | Mudança |
|--------|---------|
| `@session` | Ler `sessions.csv` para contexto |
| `@tutor` | Ler/escrever `tutor_interactions.csv` |
| `@meta` | Ler `insights.csv` para analytics |

### Makefile

Nenhum comando novo necessário. Os scripts existentes são atualizados para usar CSVs.

## Benefícios

| Benefício | Descrição |
|-----------|-----------|
| **Contexto rico** | Agentes leem histórico de sessões |
| **Memória do tutor** | Interações anteriores disponíveis |
| **Analytics** | Métricas agregadas para insights |
| **Multi-tenant** | Preparado para múltiplos usuários |
| **Migração fácil** | Schema 1:1 com SQL |
| **Backup simples** | CSVs incluídos no `make backup` |

## Status Final

**Data**: 2026-03-06
**Status**: ✅ Implementado e testado

### Scripts Criados

| Script | Linhas | Função |
|--------|--------|--------|
| `data.sh` | 265 | Gerenciar dados CSV |
| `analytics.sh` | 156 | Gerar analytics avançados |
| `tutor-log.sh` | 84 | Registrar interações do tutor |
| `tutor-interaction.sh` | 50 | Helper simplificado para registro |

### Skills Criadas

| Skill | Arquivo | Função |
|-------|---------|--------|
| `tutor-log` | `.opencode/skills/tutor-log/SKILL.md` | Registrar interações automaticamente |

### Comandos Makefile

| Comando | Descrição |
|---------|-----------|
| `make status` | Ver streak + sessões CSV |
| `make analytics` | Ver analytics avançados |
| `make backup` | Inclui dados CSV no backup |

### Dados Atuais

```
data/sessions.csv:          2 sessões (105 min total)
data/insights.csv:          8 métricas
data/tutor_interactions.csv: 6 interações (3 com user_response)
data/session_skills.csv:    1 skill (quiz)
```

### Registro Automático de Interações

```bash
# Registrar interação (com resposta do usuário)
./scripts/tutor-interaction.sh quiz "símbolos matemáticos" "O que significa ∀?" "Para todo" "Correto!" '{"correct":true}'

# Consultar histórico
./scripts/tutor-log.sh topic "símbolos matemáticos" 5
./scripts/tutor-log.sh recent 10
```

### Schema tutor_interactions.csv

```
id,session_id,skill,topic,user_message,user_response,tutor_response,timestamp,metadata
```

**Campos**:
- `user_message`: Pergunta/mensagem do usuário
- `user_response`: Resposta do usuário (NOVO!)
- `tutor_response`: Resposta do tutor
data/sessions.csv:          2 sessões (105 min total)
data/insights.csv:          8 métricas
data/tutor_interactions.csv: 3 interações
data/session_skills.csv:    1 skill (quiz)
```

### Fluxo Testado

```bash
make start  # ✅ Cria log diário
make end    # ✅ Registra sessão em CSV
make status # ✅ Lê dados de CSV
make analytics # ✅ Gera relatório
make backup # ✅ Inclui CSVs no tarball
```

### Registro Automático de Interações

```bash
# Registrar interação (simples)
./scripts/tutor-interaction.sh quiz "símbolos matemáticos" "O que significa ∀?" "Para todo" '{"correct":true}'

# Consultar histórico
./scripts/tutor-log.sh topic "símbolos matemáticos" 5
./scripts/tutor-log.sh recent 10
```

### Integração com Agentes

- **@tutor**: Registra automaticamente após cada interação significativa
- **@session**: Lê histórico de `tutor_interactions.csv`
- **@meta**: Lê analytics de `insights.csv`

## Próximos Passos

1. ✅ Criar estrutura `data/`
2. ✅ Criar arquivos CSV com headers
3. ✅ Adicionar dados iniciais (usuário, módulo)
4. ✅ Documentar schema em `schema.md`
5. ✅ Migrar dados existentes (`.ultralearning-stats`, logs)
6. ✅ Atualizar scripts (`end.sh`, `status.sh`, etc.)
7. ✅ Atualizar agentes para ler/escrever CSVs
8. ✅ Testar fluxo completo
9. ✅ Criar analytics avançados
10. ✅ Integrar backup de CSVs
11. ✅ **Registro automático de interações do tutor**
12. ✅ **Adicionar user_response ao schema**

## Alternativas Consideradas

| Alternativa | Prós | Contras | Decisão |
|-------------|------|---------|---------|
| **SQLite** | Queries SQL, índices | Binário, mais complexo | ❌ Rejeitado |
| **JSON Lines** | Flexível, aninhado | Menos legível | ❌ Rejeitado |
| **YAML** | Legível | Lento para parsear | ❌ Rejeitado |
| **CSV** | Simples, legível, SQL-ready | Sem índices | ✅ Escolhido |

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Arquivos crescem muito | Backup regular, arquivamento |
| Concorrência de escrita | Scripts usam append atômico |
| Encoding de caracteres | UTF-8 obrigatório |

## Referências

- `data/schema.md` - Documentação completa do schema
- Scott Young, Ultralearning - Princípio de Metalearning
- SM-2 Algorithm - Algoritmo SRS usado em `reviews.csv`
