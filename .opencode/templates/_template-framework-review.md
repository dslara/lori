# 🔍 [TÍTULO DA REVISÃO]

**Data**: YYYY-MM-DD  
**Versão do Projeto**: vX.Y.Z  
**Tipo**: [scripts|architecture|structure|docs|complete|agents|consistency|makefile]  
**Agente**: @review  
**Revisor**: [Nome do usuário ou @review]

---

## 📊 Estado Atual

[Descrição objetiva do que existe hoje]

Exemplo:
- 16 scripts bash em `scripts/`
- Todos usam `common.sh` para funções compartilhadas
- Makefile com 74 linhas orquestrando 14 comandos
- Documentação extensiva em `guides/`

---

## 🔗 Matriz de Dependências *(se aplicável)*

[Incluir apenas em revisões de arquitetura, consistência ou auditoria completa]

### Commands → Tools

| Command | Tools Usadas | Frequência |
|---------|-------------|------------|
| [command] | [tool1, tool2] | [Alta/Média/Baixa] |

### Commands → Skills

| Command | Skill Invocada | Via |
|---------|---------------|-----|
| [command] | [skill] | skill tool |

### Tools → Tools

| Tool | Depende de | Tipo |
|------|-----------|------|
| [tool] | [outra tool] | Importação |

### Análise de Acoplamento

**Tools Sobrecarregadas**:
- [tool]: usada por N commands (⚠️ alto acoplamento)

**Tools Subutilizadas**:
- [tool]: usada por 1 command

**Skills Mais Usadas**:
- [skill]: N commands

**Skills Subutilizadas**:
- [skill]: 0 commands (❓ keyword only?)

---

## ✅ Coerência com Projeto

[O aspecto analisado segue os padrões e convenções do projeto?]

Exemplo:
- ✅ Scripts seguem convenção de source common.sh
- ✅ Nomenclatura consistente em kebab-case
- ⚠️  Alguns scripts não têm tratamento de erro robusto
- ❌ Documentação desatualizada em relação ao código

---

## ⚠️ Problemas Identificados

### 1. **[Gravidade: Alto/Médio/Baixo]** Título do problema
**Descrição**: [Explicação detalhada do problema]

**Impacto**: [Como afeta o projeto? Usuários? Manutenção?]

**Evidência**: 
- [Arquivo:linha] - [Descrição do problema encontrado]
- [Outro arquivo:linha] - [Outra ocorrência]

**Sugestão imediata**: [Como resolver rapidamente]

### 2. **[Gravidade]** Outro problema
...

---

## 💡 Sugestões de Melhoria

### 🔵 Pequenas (Quick Wins)
Ajustes simples que podem ser feitos imediatamente:

1. **[Título da melhoria]**
   - **Problema**: [Breve descrição]
   - **Solução**: [O que fazer]
   - **Esforço**: [minutos/horas]
   - **Benefício**: [Valor agregado]

2. **[Outra melhoria]**
...

### 🟡 Médias (Próximo Sprint)
Mudanças significativas que requerem planejamento:

1. **[Título da melhoria]**
   - **Problema**: [Descrição]
   - **Solução**: [Abordagem proposta]
   - **Esforço**: [dias/semanas]
   - **Dependências**: [O que precisa estar pronto antes]
   - **Riscos**: [O que pode dar errado]

2. **[Outra melhoria]**
...

### 🔴 Grandes (Estratégicas)
Propostas radicais se necessário:

#### 1. **[PROPOSTA RADICAL - título]**

**🎯 Problema que resolve**:
[Por que a estrutura atual é insuficiente? Qual o impacto de não mudar?]

**💡 Solução proposta**:
[Descrição completa da nova abordagem, sem limitações]

**🗺️ Plano de transição**:

- **Fase 1: Preparação** (X semanas)
  - [ ] Tarefa 1
  - [ ] Tarefa 2
  - Entregável: [O que será concluído]

- **Fase 2: Implementação** (Y semanas)
  - [ ] Tarefa 1
  - [ ] Tarefa 2
  - Entregável: [O que será concluído]

- **Fase 3: Finalização** (Z semanas)
  - [ ] Tarefa 1
  - [ ] Tarefa 2
  - Entregável: [O que será concluído]

**⚖️ Análise de Impacto vs Benefício**:

| Aspecto | Atual | Proposto | Diferença |
|---------|-------|----------|-----------|
| Manutenibilidade | [nota] | [nota] | [ganho/perda] |
| Performance | [nota] | [nota] | [ganho/perda] |
| Escalabilidade | [nota] | [nota] | [ganho/perda] |
| Complexidade | [nota] | [nota] | [ganho/perda] |

**⏱️ Esforço estimado**: [X semanas/meses, Y pessoas]

**💰 Custo de migração**: [Breaking changes? Tempo de indisponibilidade?]

**✨ Benefícios**:
- [Benefício 1]
- [Benefício 2]
- [Benefício 3]

**🎯 Recomendação**: 
[ ] **APROVAR** - Implementar imediatamente  
[ ] **APROVAR COM RESSALVAS** - Implementar após [condição]  
[ ] **ADIAR** - Reavaliar em [quando]  
[ ] **REJEITAR** - Manter estrutura atual  
[ ] **REQUER MAIS ANÁLISE** - Investigar [o que]

---

## 📋 Resumo Executivo

### Estatísticas
- ✅ **[X]** verificações passaram
- ⚠️  **[Y]** alertas/avisos (não críticos)
- ❌ **[Z]** erros críticos
- 💡 **[W]** sugestões de melhoria

### Veredito Geral
**[Projeto saudável / Melhorias sugeridas / Reestruturação recomendada / Requer atenção imediata]**

Justificativa: [Por que este veredito?]

---

## 🎯 Ações Recomendadas (Priorizadas)

### Imediatas (Esta semana)
1. [ ] [Ação 1]
2. [ ] [Ação 2]

### Curto prazo (Próximas 2-4 semanas)
1. [ ] [Ação 1]
2. [ ] [Ação 2]

### Médio prazo (Próximos 2-3 meses)
1. [ ] [Ação 1]
2. [ ] [Ação 2]

### Longo prazo (Considerar para futuro)
1. [ ] [Ação 1]
2. [ ] [Ação 2]

---

## 📚 Referências

- [Links para documentação relacionada]
- [Revisões anteriores em reviews/]
- [Planos relacionados em planning/]
- [Issues ou PRs relevantes]

---

## 📝 Notas Adicionais

[Anotações extras, observações, contexto histórico, etc.]

---

*Revisão gerada pelo agente @review*  
*Template: `.opencode/templates/_template-framework-review.md`*
