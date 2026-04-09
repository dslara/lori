---
description: Criar backup dos dados (/ul-data-backup)
agent: tutor
model: opencode-go/minimax-m2.5
---

## Uso
/ul-data-backup

## Descrição
Cria backup completo dos dados CSV e opcionalmente dos projetos.

## Processo

### Passo 1: Criar Diretório de Backup

```
backups/
  2026-03-10_143022/    # Timestamp
    data/                # Cópia dos CSVs
      sessions.csv
      modules.csv
      flashcards.csv
      ...
```

### Passo 2: Copiar Dados

- Copiar diretório `data/` completo
- Preservar estrutura e permissões

### Passo 3: Criar Tarball (se tar disponível)

```
backups/2026-03-10_143022.tar.gz
```

### Passo 4: Mostrar Localização

- Caminho do backup
- Tamanho
- Próximos passos

## Output

```
💾 Criando backup...

✓ Diretório criado: backups/2026-03-10_143022
✓ Dados CSV copiados
✓ Tarball criado: backups/2026-03-10_143022.tar.gz

📊 Resumo:
  • Arquivos: 9 CSVs
  • Tamanho: 245 KB (tarball: 52 KB)
  • Localização: backups/2026-03-10_143022.tar.gz

💡 Para restaurar:
  tar -xzf backups/2026-03-10_143022.tar.gz
  cp -r 2026-03-10_143022/data ./
```

## Exemplos

### Exemplo 1: Backup simples

```
Usuário: /ul-data-backup

Sistema:
"💾 Criando backup dos dados...

✓ Backup criado: backups/2026-03-10_143022
✓ Dados CSV incluídos: 9 arquivos
✓ Tarball: backups/2026-03-10_143022.tar.gz (52 KB)

✅ Backup completo!

📍 Localização: backups/2026-03-10_143022.tar.gz

💡 Para restaurar:
  tar -xzf backups/2026-03-10_143022.tar.gz"
```

### Exemplo 2: Sem tar disponível

```
Usuário: /ul-data-backup

Sistema:
"💾 Criando backup dos dados...

✓ Backup criado: backups/2026-03-10_143500
✓ Dados CSV incluídos: 9 arquivos
⚠️ Tarball não criado (tar não disponível)

✅ Backup completo (diretório apenas)!

📍 Localização: backups/2026-03-10_143500/"
```

### Exemplo 3: Backup em projeto grande

```
Usuário: /ul-data-backup

Sistema:
"💾 Criando backup dos dados...

✓ Lendo dados...
  • sessions.csv: 156 registros
  • modules.csv: 8 registros
  • flashcards.csv: 89 registros
  • insights.csv: 234 registros
  • reviews.csv: 312 registros

✓ Backup criado: backups/2026-03-10_144500
✓ Tarball: backups/2026-03-10_144500.tar.gz (128 KB)

✅ Backup completo!"
```

## Estrutura de Backup

```
backups/
  2026-03-10_143022/
    data/
      sessions.csv
      modules.csv
      flashcards.csv
      insights.csv
      reviews.csv
      session_skills.csv
      goals.csv
      users.csv
  
  2026-03-10_143022.tar.gz  # Compactado
  
  2026-03-09_090000.tar.gz  # Backups anteriores
  2026-03-08_180000.tar.gz
```

## Restauração Manual

Para restaurar um backup:

```bash
# Descompactar
tar -xzf backups/2026-03-10_143022.tar.gz

# Restaurar dados
cp -r 2026-03-10_143022/data ./data

# Verificar
ls -la data/
```

## Frequência Recomendada

- **Diário**: Durante uso intenso
- **Semanal**: Uso normal
- **Antes de mudanças**: Antes de `/ul-data-manage reset`

## Validações

- Diretório `data/` deve existir
- Espaço em disco suficiente
- Permissões de escrita em `backups/`

## Integração com Tools

Este command invoca:
- `data.createBackup` - Criar backup e tarball

## Ver Também

- `/ul-data-manage reset` - Resetar dados (criar backup antes!)
- `backups/` - Diretório de backups
- `.gitignore` - Backups são ignorados pelo git
