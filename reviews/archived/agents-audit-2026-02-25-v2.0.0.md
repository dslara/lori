# 🔍 Revisão de Agentes: @meta, @tutor e @review

**Data**: 2026-02-25  
**Versão**: v2.0.0  
**Gerado por**: @review  
**Tipo**: agents  
**Histórico**: Consolida e atualiza `agents-audit-2026-02-24-v1.0.0.md` após unificação de formato

---

## 📊 Estado Atual

O sistema possui **3 agentes** + **1 template** bem delimitados:

| Agente | Papel | Keywords | Linhas |
|--------|-------|----------|--------|
| `@meta` | Arquiteto de Aprendizado | 6 | 428 |
| `@tutor` | Mentor Socrático | 11 | 491 |
| `@review` | Revisor Arquitetural | 10 | 364 |
| `_template-agent` | Template de referência | — | 157 |

A divisão de papéis é clara: **planeja → executa → revisa**. Todos os 3 agentes seguem o mesmo formato definido no `_template-agent.md`, com 100% de conformidade nas 8 seções obrigatórias.

---

## ✅ O que Foi Resolvido (desde v1.0.0)

A sessão de unificação de 2026-02-25 resolveu **12 dos 14 problemas** identificados na v1.0.0:

| # | Problema | Severidade | Status |
|---|----------|-----------|--------|
| 2b | Contexto e Continuidade passivo no @meta | MÉDIO | ✅ Resolvido — marcado `⚠️ OBRIGATÓRIO` |
| 3 | `#benchmark-test` ambíguo (@meta vs @tutor) | BAIXO | ✅ Resolvido — diferença explicitada na keyword |
| 4 | Quick Reference com `week-N.md` (padrão errado) | BAIXO | ✅ Resolvido — corrigido para `week-{N}.md` |
| 6 | `#quiz` referencia `make review → opção 3` desatualizado | ALTO | ✅ Resolvido — corrigido para `make review → adicionar card` |
| 9 | Promessa irreal de "memória" no @tutor | MÉDIO | ✅ Resolvido — instrução explícita de carregar `logs/daily/` |
| 10 | Keywords duplicadas no @review | CRÍTICO | ✅ Resolvido — consolidadas em seção única |
| 11 | `#review-architecture` vazia | CRÍTICO | ✅ Resolvido — completa com processo + exemplo + output |
| 12 | Contradição "cria/não cria arquivo" no @review | MÉDIO | ✅ Resolvido — regra clara: cria quando pedido explicitamente |
| 13 | Contexto do projeto duplicado no @review | BAIXO | ✅ Resolvido — seção removida |
| 14 | `#meta-review` obscura | BAIXO | ✅ Resolvido — no Quick Reference + exemplo concreto |
| Sugestão 3 | Quick Reference ausente no @review | — | ✅ Adicionado |
| Sugestão 7 | Template unificado inexistente | ESTRATÉGICO | ✅ Criado `_template-agent.md` + 100% conformidade |

---

## ✅ Coerência com Projeto (Estado Atual)

| Critério | @meta | @tutor | @review |
|----------|-------|--------|---------|
| Idioma correto | ✅ | ✅ | ✅ |
| Formato padronizado (template) | ✅ | ✅ | ✅ |
| Keywords documentadas | ✅ | ✅ | ✅ |
| Quick Reference presente | ✅ | ✅ | ✅ |
| Checklist Final presente | ✅ | ✅ | ✅ |
| Contexto e Continuidade obrigatório | ✅ | ✅ | ✅ |
| Fluxo entre agentes | ✅ | ✅ | ✅ |
| Exemplos de interação | ✅ | ✅ | ✅ |

---

## ⚠️ Problemas Ainda em Aberto

### @meta

**1. [BAIXO] `#habit-stack` não tem output estruturado**
- A keyword tem um bom exemplo em prosa, mas não define arquivo de saída nem formato para salvar
- Todos os outros comandos do @meta geram arquivos (`learning-map.md`, `resources.md`, `week-{N}.md`)
- Impacto: baixo — é uso pontual de orientação, mas inconsistente com o padrão do agente
- Solução: Decidir conscientemente: ou `#habit-stack` é intencionalmente sem arquivo (adicionar nota explícita), ou criar formato `habit-chain.md`

**2. [BAIXO] Falta keyword `#update-plan semana [N]`**
- Existe `#adjust-plan` (reajuste por desvio) e `#create-weekly-plan` (plano novo)
- **Não existe**: marcar progresso em plano existente sem criar novo ou reescrever
- Usuário confunde quando usar `#adjust-plan` vs `#create-weekly-plan semana N`
- Impacto: baixo — gap de cobertura, força workarounds
- Solução: Adicionar `#update-plan semana [N]` para marcar entregas como completas e adicionar notas sem reescrever plano

---

### @tutor

**3. [BAIXO] `#scaffold` — exemplo não demonstra comentário de caminho de arquivo**
- A instrução diz "Use comentários indicando o caminho do arquivo"
- O exemplo demonstra `# main.py` como comentário de caminho — tecnicamente está presente, mas de forma mínima
- Para projetos com múltiplos arquivos, o padrão não fica claro
- Impacto: baixo — ambiguidade menor, mas pode gerar scaffolds inconsistentes
- Solução: Expandir o exemplo com 2+ arquivos para deixar o padrão óbvio

**4. [BAIXO] Falta keyword `#explain [conceito]`**
- `#feynman` = usuário explica para *validar* compreensão própria
- `#intuition` = entender o "por quê" profundo
- **Falta**: "Me explique X do zero" — quando o usuário ainda não sabe nada sobre o conceito
- Impacto: baixo — usuário sem conhecimento prévio não sabe qual keyword usar para introdução
- Solução: Adicionar `#explain [conceito]` com: analogia inicial + exemplo prático + aplicação + sugestão de `#feynman` para validar depois

**5. [MÉDIO] Falta keyword `#wrap-up` para encerrar sessão**
- O usuário faz `make end` mas @tutor não tem equivalente para "encerrar e consolidar"
- O Checklist Final de cada resposta é útil, mas não é o mesmo que consolidar uma sessão inteira
- Impacto: médio — gap de experiência: `make end` cria o log automaticamente, mas não há prompt de reflexão estruturada pré-log
- Solução: Adicionar `#wrap-up` que gera: resumo do que foi estudado, conceitos consolidados, itens para SRS, e próximos passos

---

### @review (auto-análise)

**6. [BAIXO] Quick Reference do @tutor usa coluna "O que NÃO fazer" — diverge do padrão**
- @meta e @review usam colunas `Keyword | Quando usar | Output`
- @tutor usa `Keyword | Quando usar | O que NÃO fazer`
- A coluna "O que NÃO fazer" é mais informativa para o @tutor (agente socrático), mas é uma divergência intencional não documentada
- Impacto: baixo — divergência justificável, mas deveria ser explícita no template
- Solução: Documentar no `_template-agent.md` que a terceira coluna do Quick Reference pode ser adaptada (`Output` ou `Restrição` dependendo do agente)

---

## 💡 Sugestões de Melhoria

### Pequenas (Quick Wins)

1. **Decidir sobre `#habit-stack` output** — ou adicionar nota "sem arquivo de saída por design", ou criar `habit-chain.md` como output opcional
2. **Expandir exemplo do `#scaffold`** — demonstrar padrão com 2+ arquivos para ficar inequívoco
3. **Atualizar `_template-agent.md`** — documentar que a 3ª coluna do Quick Reference pode variar (`Output` vs `Restrição`)

### Médias (Próximo Sprint)

4. **Adicionar `#update-plan semana [N]` ao @meta**
   - Ação: adicionar keyword entre `#adjust-plan` e `#habit-stack`
   - Formato: checklist do plano atual com campos para marcar `✅ / ⏳ / ❌` por entrega

5. **Adicionar `#explain [conceito]` ao @tutor**
   - Ação: adicionar antes de `#feynman` (é o passo anterior no fluxo natural)
   - Estrutura: analogia do zero → exemplo prático → aplicação → "agora teste com `#feynman`"

6. **Adicionar `#wrap-up` ao @tutor**
   - Ação: adicionar após `#experiment` (last keyword da sessão)
   - Estrutura: O que estudei hoje? | Conceitos consolidados | Cards para SRS | Próximos passos
   - Integração: `make end` poderia invocar este prompt antes de salvar o log

### Estratégicas (Longo Prazo)

7. **Criar agente `@coach` (Habit Tracking)**
   - Atomic Habits é um dos 3 pilares do framework, mas está sub-representado nos agentes
   - `#habit-stack` no @meta é superficial para o peso do tema
   - Usar `_template-agent.md` para estruturar
   - Keywords sugeridas: `#habit-design`, `#two-minute-rule`, `#environment-design`, `#identity-based-goals`, `#track-habits`
   - **Pré-requisito**: estabilizar os 3 agentes atuais (blocos #4, #5, #6 acima)

8. **Avaliar criação de `@session` como orquestrador**
   - Orquestraria o fluxo completo: `make start` → sugere keyword → `make end` → `#wrap-up`
   - Valor alto, mas impacto significativo em scripts
   - **Pré-requisito**: `#wrap-up` implementado no @tutor

---

## 📋 Resumo Executivo

| Agente | ✅ OK | ⚠️ Avisos | ❌ Críticos |
|--------|-------|-----------|------------|
| @meta | 8 | 2 | 0 |
| @tutor | 11 | 3 | 0 |
| @review | 10 | 1 | 0 |

- ✅ **29** verificações passaram (todos os critérios do template)
- ⚠️ **6** problemas abertos (todos BAIXO ou MÉDIO)
- ❌ **0** críticos (todos resolvidos)
- 💡 **8** sugestões (3 quick wins, 3 médio prazo, 2 estratégicas)

**Veredito**: Os 3 agentes estão **saudáveis e estruturalmente consistentes** após a unificação. O formato template eliminou todos os problemas críticos. Os gaps restantes são de cobertura de keywords (funcionalidades ausentes mas não urgentes) e pequenas inconsistências de exemplo.

---

## 🎯 Ações Recomendadas (Priorizadas)

### Imediato
1. **[Agora]** Decidir sobre `#habit-stack`: output por design ou sem output — documentar explicitamente
2. **[Agora]** Atualizar `_template-agent.md` com nota sobre flexibilidade da 3ª coluna do Quick Reference

### Curto Prazo
3. **[Curto prazo]** Expandir exemplo do `#scaffold` com múltiplos arquivos
4. **[Curto prazo]** Adicionar keyword `#explain [conceito]` ao `tutor.md`
5. **[Curto prazo]** Adicionar keyword `#update-plan semana [N]` ao `meta.md`

### Médio Prazo
6. **[Médio prazo]** Adicionar keyword `#wrap-up` ao `tutor.md` com integração ao `make end`

### Longo Prazo
7. **[Longo prazo]** Criar agente `@coach` para Habit Tracking (após estabilizar gaps atuais)
8. **[Longo prazo]** Avaliar criação do `@session` como orquestrador de sessões

---

*Gerado por @review em 2026-02-25 | Consolida agents-audit-2026-02-24-v1.0.0.md*
