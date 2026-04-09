---
description: Mapear recursos de estudo em 3 tiers (/ul-plan-resources)
agent: meta
model: opencode-go/kimi-k2.5
---

Argumento recebido: $ARGUMENTS (tópico a mapear)

## Uso
/ul-plan-resources <tópico>

## Descrição

Identificar os melhores materiais de estudo para um tópico, organizando em 3 tiers (conceito, prática, referência).

## Argumentos

- `tópico`: Área de estudo (ex: "Rust async", "machine learning", "algoritmos")

## Critérios de Seleção (80/20)

- ✅ Prático (hands-on > teoria)
- ✅ Atualizado (últimos 2 anos)
- ✅ Bem avaliado (reviews positivos)
- ✅ Gratuito ou custo-benefício
- ❌ Evitar: cursos muito longos, conteúdo desatualizado, teoria sem prática

## Regra de Ouro

**Máximo 3 recursos Tier 1. Menos é mais.**

## Diversificação

Os 3 slots de Tier 1 devem ser complementares:
1. 📖 **Conceito** → docs oficial / tutorial teórico
2. 🔨 **Prática** → projeto guiado / exercícios
3. 📚 **Referência** → documentação completa / cheatsheet

## Processo

### Passo 1: Contexto (30 seg)

```
📚 Mapeando recursos para: [TÓPICO]

Módulo atual: [nome do módulo]

Buscando recursos em:
- Documentação oficial
- Tutoriais interativos
- Cursos práticos
- Livros/E-books
- Projetos open source
```

### Passo 2: Pesquisa (2-3 min)

Use web search para encontrar:
1. **Documentação oficial** (docs, guides, tutorials)
2. **Recursos práticos** (exercícios, projetos, playgrounds)
3. **Cursos/Tutoriais** (YouTube, Udemy, Coursera, etc.)
4. **Comunidade** (Reddit, Stack Overflow, blogs)

**Critérios de avaliação**:
- ⭐ Relevância (1-5)
- ⭐ Qualidade (1-5)
- ⭐ Atualização (1-5)
- ⭐ Praticidade (1-5)

### Passo 3: Apresentar Sugestões (1 min)

```
📚 Recursos encontrados para [TÓPICO]:

TIER 1 - Comece aqui (escolha 3):

📖 Conceito:
  1. [Nome] - [breve descrição]
     Link: [url]
     Por quê: [razão]
     
🔨 Prática:
  2. [Nome] - [breve descrição]
     Link: [url]
     Por quê: [razão]
     
📚 Referência:
  3. [Nome] - [breve descrição]
     Link: [url]
     Por quê: [razão]

Opções (a/b/c):
a) Usar sugestões
b) Buscar outros recursos
c) Especificar recursos que já conhece

Escolha: __________"
```

### Passo 4: Detalhar Recurso (2 min)

Para cada recurso Tier 1:
```
🔍 Detalhes: [Nome do recurso]

Link: [url]
Tipo: [docs/tutorial/curso/livro]
Tempo estimado: Xh
Custo: Grátis/X€
Pré-requisitos: [se houver]
Tópicos cobertos:
- [tópico 1]
- [tópico 2]
- [tópico 3]

Avaliação:
- ⭐⭐⭐⭐⭐ Qualidade
- ⭐⭐⭐⭐ Praticidade
- ⭐⭐⭐ Atualização

✅ Recomendado para: [seu objetivo]
```

### Passo 5: Salvar arquivo (1 min)

```
💾 Salvar em projects/{modulo}/meta/resources.md? (s/n)

✅ Recursos mapeados!

📄 Arquivo: projects/{modulo}/meta/resources.md

💡 Próximos passos:
- Começar estudo → /ul-study-start
- Planejar semana → /ul-plan-weekly
- Decompor objetivo → /ul-plan-decompose
```

## Output

Arquivo `projects/{modulo}/meta/resources.md`:

```markdown
# 📚 Recursos: [TÓPICO]

**Data**: YYYY-MM-DD
**Módulo**: [nome]
**Status**: 🟢 Ativo

---

## 🥇 Tier 1 - Comece aqui (máx 3)

| Slot | Recurso | Por quê |
|------|---------|---------|
| 📖 Conceito | [Nome] | [razão] |
| 🔨 Prática | [Nome] | [razão] |
| 📚 Referência | [Nome] | [razão] |

### 1. [Nome do Recurso]
- **Link**: [url]
- **Tipo**: [docs/tutorial/curso/livro]
- **Tempo**: Xh
- **Custo**: Grátis/X€
- **Por quê**: [razão específica]
- **Tópicos**: [lista]

---

## 🥈 Tier 2 - Aprofundamento

### 4. [Nome]
[detalhes...]

---

## 🥉 Tier 3 - Avançado

### 5. [Nome]
[detalhes...]

---

## ⚠️ Evitar

- [Recurso X] - Motivo: [desatualizado/muito teórico/etc]
```

## Exemplo

```
Usuário: /ul-plan-resources Rust async

Você:
📚 Vou mapear recursos para Rust async...

Módulo atual: M2-rust-backend

Buscando recursos...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 Recursos encontrados para Rust async:

TIER 1 - Comece aqui:

📖 Conceito:
  1. The Rust Book - Chapter 17: Async
     Link: https://doc.rust-lang.org/book/ch17-01-what-is-async.html
     Por quê: Documentação oficial, explicação clara dos fundamentos
     
🔨 Prática:
  2. Rustlings - Async Exercises
     Link: https://github.com/rust-lang/rustlings
     Por quê: Exercícios práticos com feedback imediato
     
📚 Referência:
  3. Tokio Tutorial
     Link: https://tokio.rs/tokio/tutorial
     Por quê: Tutorial completo do runtime mais popular

Opções (a/b/c):
a) Usar sugestões
b) Buscar outros recursos
c) Especificar recursos que já conheço

Escolha: __________
```

## Integrações

**Tools utilizadas:**
- `context-hybrid.getCurrentModule` — Obtém módulo atual para contexto
- `context-hybrid.getProjectInfo` — Busca recursos específicos do projeto
- **Web search** — Para encontrar recursos externos (Tier 2 e 3)

---

*Command: /ul-plan-resources - Mapear recursos de estudo*
