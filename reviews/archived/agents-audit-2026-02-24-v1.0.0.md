# 🔍 Revisão de Agentes: @meta, @tutor e @review

**Data**: 2026-02-24  
**Versão**: v1.0.0  
**Gerado por**: @review  
**Tipo**: agents

---

## 📊 Estado Atual

O sistema possui **3 agentes** bem delimitados:

| Agente | Papel | Keywords | Linhas |
|--------|-------|----------|--------|
| `@meta` | Arquiteto de Aprendizado | 6 | 382 |
| `@tutor` | Mentor Socrático | 10 | 444 |
| `@review` | Revisor Arquitetural | 8 | 267 |

A divisão de papéis é clara: **planeja → executa → revisa**. O ciclo faz sentido conceitual. A documentação é bem escrita e consistente no idioma (PT-BR + termos técnicos em EN).

---

## ✅ Coerência com Projeto

| Critério | @meta | @tutor | @review |
|----------|-------|--------|---------|
| Idioma correto | ✅ | ✅ | ✅ |
| Formato padronizado | ✅ | ✅ | ⚠️ |
| Keywords documentadas | ✅ | ✅ | ⚠️ |
| Integração com Make | ✅ | ✅ | ❌ |
| Contexto do projeto | ✅ | Parcial | ✅ |
| Fluxo entre agentes | ✅ | ✅ | ❌ |

---

## ⚠️ Problemas Identificados

### @meta

**1. [BAIXO] `#habit-stack` não tem output estruturado**
- O exemplo está bem feito, mas não tem formato de arquivo para salvar
- Impacto: baixo — é só exemplificação, mas inconsistente com os outros comandos que geram arquivos

**2. [MÉDIO] `#adjust-plan` não referencia `retro-*.md`**
- O diagnóstico pede informações ao usuário, mas a seção "Contexto e Continuidade" diz para checar `meta/retro-*.md` primeiro
- Impacto: médio — cria inconsistência entre a diretriz e o processo do comando

**2b. [MÉDIO] Seção "Contexto e Continuidade" é descritiva, não obrigatória**
- A seção existe (linhas 24-44 do meta.md) mas é apenas leitura passiva — não é um passo obrigatório vinculado a cada keyword
- Resultado: @meta pode planejar no vácuo, ignorando `week-*.md`, `retro-*.md` e logs existentes
- Impacto: médio — planejamentos genéricos ou redundantes com o que já foi feito
- Solução: Adicionar prompt interno "⚠️ ANTES DE PLANEJAR: Leia os arquivos do módulo" no início de `#decompose-goal`, `#create-weekly-plan` e `#adjust-plan`

**2c. [BAIXO] Falta keyword `#update-plan semana [N]` no @meta**
- Existe `#adjust-plan` (reajuste por desvio) e `#create-weekly-plan` (plano novo)
- **Não existe** keyword para simplesmente marcar progresso em plano existente sem criar um novo
- Usuário confunde quando usar `#adjust-plan` vs `#create-weekly-plan semana N`
- Impacto: baixo — gap de cobertura, força workarounds
- Solução: Adicionar `#update-plan semana [N]` para marcar entregas como completas, adicionar notas de progresso e atualizar status sem reescrever plano

**3. [BAIXO] `#benchmark-test` duplica `@tutor`**
- `@meta` cria benchmark (planejamento), `@tutor` executa testes
- A linha é tênue, pode confundir qual usar
- Impacto: baixo — funciona, mas gera dúvida

**4. [BAIXO] Quick Reference menciona `week-N.md` mas o padrão do projeto é `week-[N].md`**
- Linha 344: `#create-weekly-plan semana N → Plano semanal → week-N.md`
- Padrão real: `week-{N}.md` ou `week-01.md`
- Impacto: baixo — inconsistência cosmética

---

### @tutor

**5. [BAIXO] `#scaffold` tem inconsistência no exemplo**
- O exemplo em bloco de código perde a formatação de caminho de arquivo mencionada nas instruções
- Instrução diz "Use comentários indicando o caminho do arquivo" mas o exemplo não demonstra isso
- Impacto: baixo — inconsistência entre instrução e exemplo

**6. [ALTO] `#quiz` faz referência a `make review → opção 3` que pode estar desatualizada**
- `make review → opção 3` é uma referência a um submenu interativo
- Se a interface do `make review` mudou, instrução quebra
- Impacto: alto — instrução incorreta durante retrieval practice corromperia o fluxo

**7. [BAIXO] Falta keyword `#explain [conceito]` no @tutor**
- `#feynman` = usuário explica para *validar* compreensão própria
- `#intuition` = entender o "por quê" profundo
- **Falta**: "Me explique X do zero" — quando o usuário ainda não sabe nada sobre o conceito
- Impacto: baixo — usuário não sabe qual keyword usar para introdução a conceito novo, pode recorrer a pergunta livre sem estrutura socrática
- Solução: Adicionar `#explain [conceito]` com: analogia + exemplo prático + aplicação + "agora tente `#feynman` para validar"

**8. [MÉDIO] Nenhuma keyword de `end-of-session`**
- O checklist final de toda resposta é bom, mas não há keyword explícita para encerrar sessão
- O usuário faz `make end` mas @tutor não tem equivalente para "encerrar e consolidar"
- Impacto: médio — gap de experiência: make end → prompt para @tutor não existe

**9. [MÉDIO] Histórico não tem mecanismo real**
- "Referencie o que já foi estudado quando relevante" — mas LLMs não têm memória de sessões anteriores
- O agente não instrui o usuário a fornecer contexto nem tem forma de carregar logs
- Impacto: médio — promessa que o agente não consegue cumprir sem contexto explícito

---

### @review (auto-análise)

**10. [CRÍTICO] Seção de keywords está fragmentada e confusa**
- Há duas subseções distintas que descrevem as mesmas keywords com texto diferente
- As keywords `#review-structure`, `#review-scripts`, etc. são descritas duas vezes com conteúdo diferente
- Impacto: alto — agente lendo o próprio prompt pode ter comportamento inconsistente

**11. [CRÍTICO] `#review-architecture` está truncada no arquivo**
- A keyword existe mas **não tem descrição, processo nem output**
- Pula diretamente para `#check-readiness` após o título
- Impacto: alto — keyword documentada mas não funcional

**12. [MÉDIO] Processo de "Você Gera, Usuário Salva" tem contradição**
- Seção "Processo" diz: "Se usuário pedir para salvar: **Crie o arquivo você mesmo**"
- Mas logo abaixo: "❌ Não salve arquivos automaticamente" e "❌ Não modifique repositories do usuário"
- Impacto: médio — comportamento imprevisível dependendo da interpretação

**13. [BAIXO] Contexto do projeto duplicado no system prompt**
- O system prompt já contém toda a arquitetura do projeto
- O `review.md` duplica parte desse contexto (tabela de abordagens, estrutura de pastas)
- Impacto: baixo — redundância aumenta tokens por interação desnecessariamente

**14. [BAIXO] `#meta-review` é uma keyword obscura**
- Não está em nenhum Quick Reference
- Não tem exemplos de uso concretos
- Impacto: baixo — feature útil mas difícil de descobrir

---

## 💡 Sugestões de Melhoria

### Pequenas (Quick Wins)

1. **Completar `#review-architecture`** — adicionar descrição completa, processo em 5 etapas e formato de output
2. **Resolver contradição no @review** — escolher: ou o agente *pode* criar arquivos quando pedido, ou *nunca* cria
3. **Adicionar Quick Reference ao @review** — bloco resumido de todas keywords, como @meta tem no final
4. **Corrigir `make review → opção 3` no @tutor** — verificar se essa referência ainda é válida

### Médias (Próximo Sprint)

5. **Resolver `#benchmark-test` duplicado entre @meta e @tutor**
   - Opção A: @meta cria o benchmark (definição), @tutor executa (avaliação) — deixar explícito
   - Opção B: Mover totalmente para @meta com handoff explícito para @tutor

6. **Contextualização de histórico no @tutor**
   - Adicionar instrução: "Para carregar contexto, forneça seu log diário: `cat projects/[modulo]/logs/daily/YYYY-MM-DD.md`"
   - Remove a promessa não cumprível de "memória" e dá ao usuário um workflow real

### Grandes (Estratégicas)

7. **Criar Template Unificado de Agentes**
   - **Problema que resolve**: Cada agente tem estrutura ligeiramente diferente — @meta tem Quick Reference, @tutor tem checklist final, @review não tem nenhum dos dois. Isso dificulta manutenção e criação de novos agentes
   - **Solução proposta**: Criar `_template-agent.md` em `.opencode/agents/` com seções obrigatórias:
     ```
     # [Emoji] Agente @[nome] - [Tagline]
     ## Identidade
     ## 🎯 Missão
     ## 🧭 Contexto e Continuidade   ← O que verificar antes de agir
     ## 🔑 Keywords                  ← Comando + Quando usar + Processo + Exemplo
     ## 📎 Quick Reference           ← Tabela resumo
     ## 🎯 Exemplos de Interação
     ## ⚠️ Checklist Final           ← Validação por resposta
     ## 🤝 Conexão com Outros Agentes
     ```
   - **Plano de transição**:
     - Fase 1: Criar template + migrar @review (mais simples, 267 linhas)
     - Fase 2: Migrar @meta (bem estruturado, menor risco)
     - Fase 3: Migrar @tutor (maior, 444 linhas, 10 keywords)
   - **Impacto**: Não-breaking — mesmo conteúdo, reorganizado
   - **Benefício**: Consistência 100%, facilita criação de novos agentes, melhora manutenibilidade
   - **Recomendação**: ✅ Fazer após implementar quick wins

8. **Criar um 5º agente: `@coach` (Habit Tracking)**
    - **Problema que resolve**: Atomic Habits (James Clear) é um dos 3 pilares do framework, mas está sub-representado nos agentes. O @meta tem `#habit-stack` mas é apenas um exemplo; nenhum agente foca em manutenção de hábitos de longo prazo
    - **Solução proposta**: Agente dedicado a consistência e Atomic Habits:
      - `#habit-design [hábito]` — desenhar hábito com cue-routine-reward
      - `#habit-stack [novo] após [existente]` — empilhamento de hábitos
      - `#two-minute-rule [tarefa]` — reduzir resistência inicial
      - `#environment-design` — otimizar ambiente físico/digital
      - `#identity-based-goals [objetivo]` — focar em identidade vs resultados
      - `#track-habits` — analisar streak e sugerir ajustes
    - **Plano de transição**:
      - Fase 1: Criar `coach.md` usando template unificado (se #7 feito)
      - Fase 2: Integrar com streak tracking existente nos scripts bash
    - **Impacto**: Agente novo, não quebra nada existente
    - **Benefício**: Completa a tríade operacional: @meta (planejar) + @tutor (executar) + @coach (sustentar) + @review (melhorar)
    - **Recomendação**: ⏳ Após consolidar e unificar os agentes atuais

9. **Criar um 5º agente: `@session`**
   - **Problema que resolve**: Não existe agente para gerenciar o fluxo de uma sessão completa. O usuário gerencia manualmente: `make start` → escolher keyword → `make end`
   - **Solução proposta**: `@session` seria um orquestrador leve que:
     - Carrega contexto do dia (`logs/daily/`, `meta/week-N.md`)
     - Sugere atividade baseada no plano da semana
     - Faz warmup (`#quiz`) automático
     - Ao final, consolida e salva log
   - **Plano de transição**:
     - Fase 1: Mapear exatamente o que `make start/study/end` faz hoje
     - Fase 2: Criar `session.md` como agente orquestrador
     - Fase 3: Integrar com `make study` para invocar @session
   - **Impacto**: Mudança significativa no workflow; requer refactor em scripts
   - **Benefício**: Remove friction — usuário não precisa saber qual keyword usar
   - **Recomendação**: ⭐ Valor alto, mas deixar para depois de estabilizar os 3 agentes atuais

10. **Reestruturar @review com formatos de output distintos por tipo**
    - **Problema**: @review mistura análise pedagógica, análise de código e análise arquitetural no mesmo formato
    - **Solução**: Criar sub-modos com formatos de output distintos:
      - `#review-agents` → foco em efetividade pedagógica
      - `#review-scripts` → foco em qualidade técnica
      - `#review-architecture` → foco em decisões fundamentais
    - **Impacto**: Refactor médio do agent file
    - **Benefício**: Outputs mais precisos para cada tipo de análise
    - **Recomendação**: Fazer junto com a correção do `#review-architecture`

---

## 📋 Resumo Executivo

| Agente | ✅ OK | ⚠️ Avisos | ❌ Críticos |
|--------|-------|-----------|------------|
| @meta | 4 | 3 | 0 |
| @tutor | 3 | 2 | 1 |
| @review | 1 | 3 | 2 |

- ✅ **9** verificações passaram
- ⚠️ **9** alertas/avisos
- ❌ **3** erros críticos (problemas #6, #11, #12)
- 💡 **10** sugestões de melhoria (4 quick wins, 2 médio prazo, 4 estratégicas)

**Veredito**: @meta está **saudável com gaps de cobertura** (2 keywords faltantes). @tutor está **funcional com melhorias urgentes**. @review precisa de **reestruturação moderada** — especialmente `#review-architecture` literalmente vazia e keywords duplicadas.

---

## 🎯 Ações Recomendadas (Priorizadas)

### Imediato
1. **[Agora]** Completar a descrição de `#review-architecture` no `review.md`
2. **[Agora]** Resolver a contradição "cria/não cria arquivo" no `review.md`
3. **[Agora]** Adicionar Quick Reference ao `review.md`

### Curto Prazo
4. **[Curto prazo]** Verificar e corrigir `make review → opção 3` no `tutor.md`
5. **[Curto prazo]** Adicionar keyword `#explain [conceito]` ao `tutor.md`
6. **[Curto prazo]** Adicionar keyword `#update-plan semana [N]` ao `meta.md`
7. **[Curto prazo]** Tornar checagem de contexto obrigatória nas keywords de planejamento do `meta.md`

### Médio Prazo
8. **[Médio prazo]** Resolver ambiguidade do `#benchmark-test` entre @meta e @tutor
9. **[Médio prazo]** Criar `_template-agent.md` e unificar formato dos 3 agentes

### Longo Prazo
10. **[Longo prazo]** Criar agente `@coach` para Habit Tracking (Atomic Habits)
11. **[Longo prazo]** Avaliar criação do `@session` como orquestrador de sessões

---

*Gerado por @review em 2026-02-24 | Incorpora insights de agents-review-2026-02-23-v2.8.0.md*
