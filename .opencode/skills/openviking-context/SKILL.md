# OpenViking Context Skill

Carrega contexto hierárquico do OpenViking para sessões.

## Disponibilidade

Este skill é carregado automaticamente pelos agentes para:
- Carregar contexto hierárquico (L0/L1/L2)
- Buscar memórias relevantes
- Navegar estrutura de contexto

## Tools do OpenViking

### memsearch - Busca Semântica

Busca memórias por significado, não por palavras-chave.

```typescript
// Buscar por preferências do usuário
await memsearch({
  query: "preferências de aprendizado do usuário",
  limit: 5
})

// Buscar por padrões de erro
await memsearch({
  query: "erros comuns em recursão",
  session_id: sessionId
})
```

**Parâmetros**:
- `query`: Texto da busca (obrigatório)
- `limit`: Máximo de resultados (padrão: 10)
- `session_id`: Filtrar por sessão específica (opcional)
- `mode`: "fast" (busca rápida) ou "deep" (busca profunda)

### memread - Ler Conteúdo

Lê conteúdo de memórias em diferentes níveis de detalhe.

```typescript
// L0: Quick check (~100 tokens)
await memread({
  uri: "viking://user/memories/",
  level: "abstract"
})

// L1: Overview (~2k tokens)
await memread({
  uri: "viking://user/memories/",
  level: "overview"
})

// L2: Full content
await memread({
  uri: "viking://user/memories/preferences.md",
  level: "read"
})
```

**Níveis**:
- `abstract`: Resumo breve (~100 tokens) - para quick check
- `overview`: Visão geral (~2k tokens) - para planning
- `read`: Conteúdo completo - para deep dive
- `auto`: Escolhe automaticamente (overview para diretórios, read para arquivos)

**URIs Comuns**:
- `viking://user/memories/` - Memórias do usuário
- `viking://agent/memories/` - Memórias dos agentes
- `viking://resources/` - Recursos indexados

### membrowse - Navegar Estrutura

Lista estrutura de diretórios e arquivos.

```typescript
// Listar memórias do usuário
await membrowse({
  uri: "viking://user/memories/",
  view: "list"
})

// Ver árvore completa
await membrowse({
  uri: "viking://agent/memories/",
  view: "tree"
})

// Metadados de um arquivo
await membrowse({
  uri: "viking://user/memories/preferences.md",
  view: "stat"
})
```

### memcommit - Forçar Extração

Força extração de memórias da sessão atual.

```typescript
await memcommit({
  wait: true  // Esperar conclusão (padrão: false)
})
```

## Fluxo de Contexto

### Início de Sessão

```typescript
// 1. Carregar L0 (quick check)
const abstract = await memread({
  uri: "viking://user/memories/",
  level: "abstract"
})

// 2. Se relevante, carregar L1 (overview)
if (abstract.includes("preferências")) {
  const overview = await memread({
    uri: "viking://user/memories/",
    level: "overview"
  })
}

// 3. Buscar contexto específico
const results = await memsearch({
  query: "últimas sessões de estudo",
  limit: 5
})
```

### Durante a Sessão

O OpenViking sincroniza automaticamente:
- Mensagens são capturadas (session lifecycle hooks)
- Memórias são extraídas periodicamente (auto-commit a cada 10 min)
- Ao final da sessão, faz commit final

### Fim de Sessão

```typescript
// Forçar extração de memórias pendentes
await memcommit({ wait: true })
```

## Estrutura de Memórias

```
viking://
├── user/
│   └── memories/
│       ├── preferences.md    # Estilo de aprendizado
│       ├── goals.md          # Objetivos
│       ├── patterns.md       # Padrões de erro
│       └── profile.md        # Perfil do usuário
│
└── agent/
    └── memories/
        ├── tutor/            # Memórias do @tutor
        │   ├── sessions/     # Sessões anteriores
        │   └── patterns/     # Padrões de ensino
        ├── meta/             # Memórias do @meta
        │   └── plans/       # Histórico de planejamento
        └── review/           # Memórias do @review
            └── audits/      # Auditorias anteriores
```

## Exemplos de Uso

### Carregar Preferências do Usuário

```typescript
// Busca rápida
const prefs = await memsearch({
  query: "preferências de estudo",
  limit: 3
})

// Se encontrou, ler em detalhe
if (prefs.memories.length > 0) {
  const content = await memread({
    uri: prefs.memories[0].uri,
    level: "read"
  })
}
```

### Ver Padrões de Erro Anteriores

```typescript
const errors = await memsearch({
  query: "erros em recursão",
  limit: 5
})

// L1 é suficiente para ver padrões
const overview = await memread({
  uri: "viking://user/memories/patterns.md",
  level: "overview"
})
```

### Consultar Histórico de Planejamento

```typescript
const plans = await memsearch({
  query: "plano semanal",
  session_id: sessionId
})
```

## Benefícios

1. **Memória Persistente**: Lembra conversas anteriores
2. **Contexto Hierárquico**: Carrega apenas o necessário (L0/L1/L2)
3. **Redução de Tokens**: -70% a -90% no consumo
4. **Busca Semântica**: Encontra contexto relevante automaticamente
5. **Auto-sync**: Sincroniza mensagens automaticamente

## Troubleshooting

### OpenViking não responde

```bash
# Verificar se containers estão rodando
docker-compose ps

# Verificar saúde
curl http://localhost:1933/health

# Ver logs
docker-compose logs openviking
```

### Memórias não aparecem

```typescript
// Forçar commit
await memcommit({ wait: true })

// Buscar novamente
await memsearch({ query: "..." })
```

### Tokens muito altos

```typescript
// Usar L0 em vez de L1/L2
await memread({
  uri: "...",
  level: "abstract"  // ~100 tokens
})
```

---

*Skill carregada automaticamente pelos agentes*