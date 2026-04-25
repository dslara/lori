# 💰 Revisão de Agentes: Otimização de Custos

**Data**: 2026-02-25  
**Versão**: v1.0.0  
**Gerado por**: @review  
**Tipo**: agents  
**Foco**: Redução de custo de tokens nos system prompts dos 3 agentes

---

## 📊 Contexto: Como o Custo Funciona

**Custo por interação = tokens de entrada (system prompt + histórico + mensagem) + tokens de saída**

Os agentes são **system prompts estáticos** lidos inteiros em toda interação.

| Agente | Linhas | Tamanho | Tokens estimados¹ | Custo input/chamada² | Frequência de uso |
|--------|--------|---------|-------------------|---------------------|-------------------|
| @meta | 428 | ~11KB | ~2.800 tokens | ~$0.0084 | 10% das interações |
| @tutor | 491 | ~12KB | ~3.200 tokens | ~$0.0096 | 80% das interações |
| @review | 364 | ~12KB | ~3.100 tokens | ~$0.0093 | 10% das interações |

¹ *~350 tokens/KB de markdown técnico*  
² *Claude Sonnet 4.6: $3/M input tokens*

**@tutor é o agente com maior impacto de custo** — maior em tokens E mais frequente.

**Nota de escala**: Para uso pessoal (5–10 sessões/semana), o custo absoluto é pequeno (~$2–5/mês). O valor desta análise é arquitetural: boas práticas hoje evitam custos quando a frequência escalar ou quando novos agentes forem criados.

---

## ⚠️ Problemas Identificados

### #1 [ALTO] Prompt Caching não está sendo explorado

**O que é**: Anthropic oferece prompt caching nativo. System prompts estáticos reutilizados têm custo de **10% do input normal** (90% de desconto) quando marcados como bloco cacheável na chamada de API.

**Situação atual**: Os 3 agentes têm conteúdo 100% estático entre sessões — o caso ideal para caching. Mas:
- Nenhum agente documenta que é elegível para caching
- O `opencode` pode ou não estar usando esta feature (requer verificação)
- O design atual não garante que o conteúdo estático venha **antes** de conteúdo dinâmico (requisito para cache hits)

**Impacto estimado com caching ativo**:
- @tutor: 5 sessões/semana × 3.200 tokens → 16.000 tokens/semana → com cache: 1.600 tokens/semana
- Economia: ~$0.41/mês só no @tutor (insignificante hoje, multiplicável por frequência)

**Solução**:
1. Verificar se o `opencode` usa a API de prompt caching da Anthropic
2. Adicionar na `Identidade` de cada agente: `**Cache**: System prompt estático — elegível para prompt caching`
3. Garantir que o sistema prompt seja enviado antes de qualquer conteúdo dinâmico (já é o caso hoje)

---

### #2 [MÉDIO] Seção "Exemplos de Interação" duplica conteúdo das keywords

**Situação**: A seção `🎯 Exemplos de Interação` no final de @meta e @tutor repete exemplos de keywords que já têm os seus próprios exemplos inline.

**@tutor** (linhas 400–440, ~40 linhas / ~200 tokens):
- Mostra `#quiz 3 perguntas sobre FastAPI` → já coberto em `### #quiz` (linhas 138–156)
- Mostra `#directness Criar sistema de login` → já coberto em `### #directness` (linhas 54–75)
- Mostra `#feynman JWT` → já coberto em `### #feynman` (linhas 88–98)

**@meta** (linhas 341–370, ~30 linhas / ~150 tokens):
- Mostra `#decompose-goal` → já coberto na keyword (linhas 62–119)
- Mostra `#create-weekly-plan semana 3` → já coberto na keyword (linhas 160–203)

**Total de tokens duplicados**: ~350 tokens por chamada a @tutor ou @meta.

**O que a seção deveria ser** (se mantida): Exemplos de **composição entre keywords** ou **fluxos completos** — algo que os exemplos isolados das keywords não mostram. Ex: "usuário começa com `#quiz`, erra conceito, é direcionado para `#feynman`".

**Solução**: Substituir exemplos duplicados por 1–2 exemplos de fluxo composto, ou remover a seção completamente.

---

### #3 [MÉDIO] Output sem instrução de concisão explícita

**O problema**: Output tokens custam 3–8x mais que input tokens no Sonnet. Os agentes instruem **comportamento** (socrático, planeja, revisa) mas não instruem **tamanho de output**.

**Keywords com risco de verbosidade desnecessária**:

| Keyword | Output ideal | Risco sem instrução |
|---------|-------------|---------------------|
| `#quiz N perguntas` | N perguntas, 1–2 linhas cada | Adicionar contexto, dicas, explicações |
| `#zombie` | 3 micro-passos, ~8 linhas | Virar motivational speech de 30 linhas |
| `#diffuse` | 4 passos, ~8 linhas | Idem |
| `#habit-stack` | 3 hábitos encadeados, ~10 linhas | Explicação longa sobre Atomic Habits |
| `#review-structure` | Análise direta com problemas listados | Relatório de 200 linhas sem necessidade |

**Solução por agente**:
- **@tutor** — adicionar ao Checklist Final: `[ ] Resposta está no tamanho mínimo? (sem explicações não solicitadas)`
- **@meta** — adicionar à Missão: "outputs seguem os templates definidos — não expandir além do formato"
- **@review** — adicionar ao Checklist Final: `[ ] O relatório está na densidade certa? (problemas + evidência + solução, sem padding)`

---

### #4 [BAIXO] @review induz carregamento de contexto não-seletivo

**Situação**: A seção `🧭 Contexto e Continuidade` do @review lista vários arquivos a verificar antes de revisar. Isso é correto para `#audit-quality`, mas para keywords específicas como `#review-makefile` ou `#review-consistency`, carregar `reviews/README.md` + `planning/` + `scripts/` + `agents/` é excessivo.

**Custo indireto**: O agente induz o usuário a trazer mais contexto do que o necessário para a keyword invocada, inflando o contexto da conversa.

**Solução**: Adicionar instrução na seção:
> "Solicite ao usuário apenas os arquivos relevantes para a keyword invocada. Não peça tudo de uma vez."

---

### #5 [ESTRATÉGICO] Model routing: Sonnet para todas as keywords independente de complexidade

**Situação**: Os 3 agentes declaram `Claude Sonnet 4.6`. Mas a complexidade cognitiva das keywords varia muito:

| Complexidade | Keywords | Modelo adequado | Custo relativo |
|-------------|----------|-----------------|---------------|
| **Baixa** (geração mecânica) | `#quiz`, `#drill`, `#zombie`, `#diffuse`, `#habit-stack` | Haiku 3.5 | ~6x mais barato |
| **Média** (raciocínio guiado) | `#feynman`, `#feedback`, `#debug`, `#scaffold` | Sonnet ✅ | baseline |
| **Alta** (análise estratégica) | `#decompose-goal`, `#review-architecture`, `#audit-quality`, `#intuition` | Sonnet ✅ | baseline |

**Estimativa**: ~35–40% das interações com @tutor são keywords de complexidade baixa.

**Trade-off importante**: Model routing adiciona complexidade ao workflow (`make study` teria que escolher o modelo). Para uso pessoal com volume baixo, o ROI não justifica agora. Mas é uma alavanca disponível se o uso escalar.

**Solução possível (sem mudar os agentes)**:
- Criar `make study-fast` que invoca @tutor com Haiku para `#quiz`, `#drill`, `#zombie`, `#diffuse`
- Os arquivos de agente não precisariam mudar — só o script de invocação

---

## 📋 Resumo de Impacto

| # | Problema | Impacto de Custo | Esforço | Recomendação |
|---|----------|-----------------|---------|--------------|
| 1 | Prompt Caching não explorado | **Alto** — 90% dos tokens input | Baixo (verificar config) | ✅ Implementar agora |
| 2 | Exemplos duplicados em @meta e @tutor | Médio — ~350 tokens/chamada | Baixo (editar ~70 linhas) | ✅ Implementar agora |
| 3 | Output sem instrução de concisão | **Alto** — output custa 3–8x mais | Baixo (1 linha por agente) | ✅ Implementar agora |
| 4 | @review induz contexto não-seletivo | Baixo-Médio — contexto inflado | Baixo (1 instrução) | ✅ Implementar agora |
| 5 | Model routing não implementado | **Alto potencial** — 6x em tasks simples | Alto (mudança arquitetural) | ⏳ Avaliar quando uso escalar |

---

## 🎯 Ações Recomendadas

### Imediato (mudanças nos arquivos `.md` dos agentes)

1. **[Agora — @tutor]** Substituir seção `🎯 Exemplos de Interação` por 1 exemplo de fluxo composto
2. **[Agora — @meta]** Idem — substituir exemplos duplicados por fluxo composto
3. **[Agora — todos]** Adicionar instrução de concisão no `⚠️ Checklist Final`:
   - @tutor: `[ ] Resposta no tamanho mínimo? (sem explicações não solicitadas)`
   - @meta: `[ ] Output segue o template definido sem expansão desnecessária?`
   - @review: `[ ] Relatório na densidade certa? (sem padding entre problema/evidência/solução)`
4. **[Agora — todos]** Adicionar em `Identidade`: `**Cache**: System prompt estático — elegível para prompt caching`
5. **[Agora — @review]** Adicionar em `🧭 Contexto e Continuidade`: nota sobre solicitar apenas arquivos relevantes para a keyword invocada

### Verificação técnica (fora dos arquivos de agente)

6. **[Curto prazo]** Verificar se o `opencode` envia chamadas com `cache_control` para system prompts — esta é a maior alavanca de custo disponível

### Estratégico (mudança arquitetural)

7. **[Longo prazo]** Avaliar `make study-fast` com model routing para keywords de baixa complexidade no @tutor

---

## 💡 Padrões Gerais Aprendidos

Para referência ao criar novos agentes (como @coach, @session):

| Padrão | Impacto | Como aplicar |
|--------|---------|--------------|
| **Prompt Caching** | 50–90% input | System prompt estático → cache elegível |
| **Sem duplicação** | 5–15% tamanho | 1 exemplo por keyword, sem seção de repetição |
| **Instrução de concisão** | 20–40% output | 1 linha no Checklist Final é suficiente |
| **Output tokens > Input tokens** | 3–8x custo | Priorizar restrição de output sobre compressão de input |
| **Model routing** | Até 6x custo | Reservar modelos pesados para análise; leves para geração mecânica |
| **Contexto seletivo** | Variável | Pedir só o necessário para a tarefa atual |

---

*Gerado por @review em 2026-02-25*
