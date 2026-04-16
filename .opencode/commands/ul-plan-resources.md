---
description: Mapear recursos de estudo em 3 tiers e indexar no OpenViking
agent: meta
model: opencode-go/glm-5
---

$ARGUMENTS (tópico a mapear, opcional)

## Descrição

Identifica os melhores materiais de estudo para um tópico, organizando em 3 tiers (conceito, prática, referência). Máximo 3 recursos Tier 1. Menos é mais. Recursos são indexados no OpenViking para busca semântica futura.

## Processo

1. **Contexto** — Invocar `context-hybrid.getCurrentModule` e `context-hybrid.getProjectInfo` para módulo atual.
2. **Buscar recursos existentes** — Antes de pesquisar na web, verificar se já existem recursos indexados:
   ```
   resource.find({ query: "{tópico} recursos", target: "viking://resources/ultralearning/projects/{id}/resources/" })
   resource.find({ query: "{tópico} tutorial documentação", target: "viking://resources/ultralearning/resources/" })
   ```
3. **Pesquisar recursos na web** — Usar `webfetch` para encontrar: documentação oficial, tutoriais interativos, projetos práticos, cursos e comunidades. Avaliar por relevância, qualidade, atualização e praticidade (1-5).
4. **Apresentar sugestões** — Oferecer 3 slots Tier 1: 📖 Conceito, 🔨 Prática, 📚 Referência. Cada um com nome, link e justificativa.
5. **Detalhar recursos** — Para cada Tier 1: link, tipo, tempo estimado, custo, pré-requisitos, tópicos cobertos, avaliação.
6. **Salvar localmente** — Gerar `projects/{modulo}/meta/resources.md` com Tier 1 (tabela + detalhes), Tier 2 (aprofundamento), Tier 3 (avançado) e lista de recursos a evitar.
7. **Indexar no OpenViking** — Publicar os recursos curados para busca semântica:
   ```
   # Para cada recurso Tier 1 com conteúdo web
   resource.write(
     uri: "viking://resources/ultralearning/projects/{id}/resources/{recurso}.md",
     content: "<conteúdo filtrado com metadata>",
     mode: "replace"
   )

   # Para recursos externos (URLs diretas)
   resource.add(
     path: "https://docs.exemplo.com/guide/",
     target: "viking://resources/ultralearning/projects/{id}/resources/",
     instruction: "Focar em exemplos práticos e APIs",
     reason: "Recurso Tier 1 para {tópico}"
   )

   # Linkar ao projeto
   resource.link(
     uri: "viking://resources/ultralearning/projects/{id}/resources/{recurso}.md",
     to_uri: "viking://resources/ultralearning/projects/{id}/",
     reason: "recurso de estudo do projeto"
   )
   ```

## Argumento

- `tópico`: Área de estudo (opcional — será perguntado se não fornecido). Ex: "Rust async", "machine learning"

## Formato de Metadata para Recursos

Cada recurso publicado no OpenViking deve incluir metadata no topo:

```markdown
---
source: https://docs.exemplo.com/guide/
date: 2026-04-15
tier: 1
type: conceito|prática|referência
topic: {tópico}
project: {id}
---

# {Nome do Recurso}
{Conteúdo filtrado e organizado}
```

## Handoff

- Recursos mapeados → `/ul-study-start` para começar estudo
- Precisa planejar semanas → `/ul-plan-weekly`
- Objetivo muito grande → `/ul-plan-decompose`