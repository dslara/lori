# Guia de Migração v1.x → v2.0

## O que Mudou?

### Antes (v1.x) — Scripts Bash
```bash
# Ver progresso
make status

# Ver analytics
make analytics

# Iniciar sessão (REMOVIDO - use @tutor #start)
# make start      # ❌ Removido na v2.0
# scripts/start.sh # ❌ Script removido

# Encerrar sessão (REMOVIDO - use @tutor #end)
# make end        # ❌ Removido na v2.0
# scripts/end.sh   # ❌ Script removido
```

### Depois (v2.0) — Tools + Commands
```bash
# No TUI do OpenCode (digite /)
/status          # Ver progresso
/analytics       # Ver analytics
/data init       # Inicializar dados

# Sessões continuam via @tutor (agora com tools automáticas)
@tutor #start    # Carrega contexto automaticamente
@tutor #end      # Salva dados automaticamente
```

---

## Nova Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     INTERFACE DO USUÁRIO                    │
├─────────────────────────────────────────────────────────────┤
│  Commands (digite / no TUI)                                 │
│  ├── /status      → Tool status.ts                          │
│  ├── /analytics   → Tool analytics.ts                       │
│  └── /data        → Tool data.ts                            │
├─────────────────────────────────────────────────────────────┤
│  Agents (@tutor, @meta)                                     │
│  └── Invocam tools automaticamente                          │
├─────────────────────────────────────────────────────────────┤
│  Tools TypeScript (.opencode/tools/)                        │
│  ├── data.ts      → CRUD nos CSVs                           │
│  ├── context.ts   → Contexto da sessão                      │
│  ├── analytics.ts → Métricas e cálculos                     │
│  └── status.ts    → Formatação visual                       │
├─────────────────────────────────────────────────────────────┤
│  Dados (CSV)                                                │
│  └── data/*.csv (mesmo formato)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Passo a Passo de Migração

### 1. Backup dos Dados (Importante!)

Antes de migrar, faça backup:

```bash
cd /home/dani/Work/dslara/ultralearning
make backup
# ou manualmente:
cp -r data backups/data-$(date +%Y%m%d)
```

### 2. Atualizar para Nova Versão

```bash
# Pull das mudanças
git pull origin main

# Instalar dependências das tools
cd .opencode && npm install
```

### 3. Inicializar Estrutura

No TUI do OpenCode:

```
/data init
```

Isso garante que todos os arquivos CSV existam e estejam no formato correto.

### 4. Verificar Migração

Teste se os dados antigos foram preservados:

```
/status
```

Você deve ver seu streak, sessões anteriores e módulo atual.

### 5. Testar Fluxo Completo

Faça uma sessão de teste:

1. `/status` — Verifique status atual
2. `@tutor #start` — Iniciar sessão (deve carregar contexto)
3. `@tutor #end` — Encerrar sessão (deve salvar dados)
4. `/analytics` — Ver se sessão aparece no relatório

---

## Mapeamento: Comandos Antigos → Novos

| Antigo (v1.x) | Novo (v2.0) | Notas |
|--------------|-------------|-------|
| `make status` | `/status` | No TUI do OpenCode |
| `make analytics` | `/analytics` | No TUI do OpenCode |
| `make start` ❌ | `@tutor #start` | **Removido** - comando não existe mais |
| `make end` ❌ | `@tutor #end` | **Removido** - comando não existe mais |
| `make data init` | `/data init` | No TUI do OpenCode |
| `make backup` | `make backup` | **Mantido** (operação de sistema) |
| `make setup` | `make setup` | **Mantido** (operação de sistema) |
| `scripts/data.sh` | Tool `data.ts` | Invocado automaticamente |
| `tutor-log.sh` ❌ | Tool `tutor-log.ts` | **Removido** - use a tool |

---

## FAQ

### Meus dados antigos serão perdidos?

**Não.** Os CSVs são 100% compatíveis. O `/data init` apenas garante que os arquivos existam. Seus dados de sessões, streaks e flashcards serão preservados.

### Posso continuar usando `make status`?

Não recomendado. O comando `make status` foi removido. Use `/status` no TUI do OpenCode para ter acesso às novas features.

### Como funciona a nova arquitetura?

Agora temos **tools** (funções TypeScript que o LLM invoca) e **commands** (interface do usuário no TUI). O `@tutor` invoca as tools automaticamente para:

1. **Carregar contexto** no início da sessão (`context.ts`)
2. **Salvar dados** no fim da sessão (`data.ts`)
3. **Calcular dificuldade** antes de quizzes (`analytics.ts`)

### O que aconteceu com os scripts bash?

Os scripts `data.sh`, `analytics.sh`, `status.sh` e `common.sh` foram migrados para tools TypeScript. Isso proporciona:

- ✅ Parsing de CSV robusto (sem grep/awk frágil)
- ✅ Tipagem segura com TypeScript
- ✅ Manipulação de datas com `date-fns`
- ✅ Integração nativa com o OpenCode

### Por que remover `make start` e `make end`?

Esses comandos invocavam scripts bash que faziam parsing manual de CSV. Agora o `@tutor` usa as tools diretamente, proporcionando:

- Contexto mais rico (módulo, plano da semana, SRS pendente)
- Salvamento automático sem intervenção manual
- Melhor integração com as skills

### E se eu encontrar bugs nas tools?

Reporte como sempre! As tools são TypeScript, então erros são mais fáceis de diagnosticar. Verifique:

1. Se as dependências estão instaladas: `cd .opencode && npm list`
2. Se os arquivos CSV não estão corrompidos: `head -5 data/sessions.csv`
3. Se o OpenCode está atualizado: `opencode --version`

---

## Troubleshooting

### "Tool não encontrada"

```bash
# Verifique se as tools existem
ls .opencode/tools/*.ts

# Reinstale dependências
cd .opencode && npm install
```

### "Dados não aparecem no /status"

```bash
# Verifique se os CSVs existem
ls data/*.csv

# Se não existirem, inicialize
# No TUI: /data init

# Se existirem mas estão vazios
# Verifique o formato: deve ter header na primeira linha
cat data/sessions.csv
```

### "Módulo ativo não detectado"

```bash
# Verifique se há um módulo ativo no CSV
grep "true" data/modules.csv

# Se não houver, crie ou ative um:
# make module    # Criar novo
# make switch    # Alternar ativo
```

---

## Próximos Passos

Após a migração:

1. **Leia o HOW_TO_USE.md atualizado** — Interface nova documentada
2. **Explore os /commands** — `/status`, `/analytics`, `/data`
3. **Use @tutor normalmente** — Agora com contexto automático
4. **Consulte o sistema-dados.md** — Novo guia de dados

---

## Feedback

Encontrou problemas na migração? Tem sugestões?

- Abra uma issue no repositório
- Ou mencione no seu próximo `@review`

---

*Guia de Migração v2.0 — Migrando de scripts bash para Tools + Commands*
