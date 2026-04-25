# 🗺️ Plano de Migração: [NOME DA MIGRAÇÃO]

**Data de criação**: YYYY-MM-DD  
**Versão origem**: vX.Y.Z  
**Versão destino**: vX'.Y'.Z'  
**Duração estimada**: [X semanas/meses]  
**Responsável**: [Nome/Time]  
**Status**: 🟡 Planejado / 🟢 Em andamento / 🔴 Bloqueado / ✅ Concluído

---

## 📋 Visão Geral

### O que será migrado?
[Descrição completa do escopo da migração]

### Por que esta migração é necessária?
[Justificativa do problema que resolve]

### Qual o resultado esperado?
[Como será o sistema após a migração completa]

---

## 🎯 Objetivos

### Objetivo Principal
[O que queremos alcançar com esta migração]

### Objetivos Secundários
- [ ] [Objetivo 1]
- [ ] [Objetivo 2]
- [ ] [Objetivo 3]

### Critérios de Sucesso da Migração
- [ ] [Critério 1 - mensurável]
- [ ] [Critério 2 - mensurável]
- [ ] [Critério 3 - mensurável]

---

## 🏗️ Arquitetura

### Estado Atual (Antes)
```
[Diagrama ou descrição da arquitetura atual]
```

### Estado Futuro (Depois)
```
[Diagrama ou descrição da arquitetura futura]
```

### Principais Mudanças
| Componente | Antes | Depois | Impacto |
|------------|-------|--------|---------|
| [Componente 1] | [Estado] | [Estado] | [Alto/Médio/Baixo] |
| [Componente 2] | [Estado] | [Estado] | [Alto/Médio/Baixo] |

---

## 📅 Cronograma Detalhado

### Visão Geral das Fases
```
Semana:  1    2    3    4    5    6    7    8    9    10   11   12
         |----|----|----|----|----|----|----|----|----|----|----|
Fase 1:  [====]
Fase 2:       [=======]
Fase 3:                [=======]
Fase 4:                         [========]
Buffer:                                     [==]
```

### Fase 1: Preparação (Semanas 1-X)

**Objetivo**: [O que precisa estar pronto antes de começar a migração real]

**Tarefas**:
| ID | Tarefa | Responsável | Status | Início | Fim |
|----|--------|-------------|--------|--------|-----|
| 1.1 | [Tarefa 1] | [Nome] | ⬜/🟡/✅ | [Data] | [Data] |
| 1.2 | [Tarefa 2] | [Nome] | ⬜/🟡/✅ | [Data] | [Data] |
| 1.3 | [Tarefa 3] | [Nome] | ⬜/🟡/✅ | [Data] | [Data] |

**Entregáveis**:
- [ ] [Item 1]
- [ ] [Item 2]

**Critérios de sucesso**:
- [Critério 1]
- [Critério 2]

**Dependências de entrada**:
- [O que precisa estar pronto antes de começar esta fase]

**Riscos específicos**:
| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| [Risco] | A/M/B | A/M/B | [Ação] |

### Fase 2: [Nome da Fase] (Semanas X-Y)

[Mesma estrutura da Fase 1]

### Fase 3: [Nome da Fase] (Semanas Y-Z)

[Mesma estrutura da Fase 1]

### Fase 4: Finalização (Semanas Z-W)

[Mesma estrutura da Fase 1]

---

## ⚠️ Gestão de Riscos

### Riscos Identificados

| ID | Risco | Probabilidade | Impacto | Prioridade | Mitigação | Contingência |
|----|-------|--------------|---------|------------|-----------|--------------|
| R01 | [Descrição do risco] | Alta/Média/Baixa | Alto/Médio/Baixo | 🔴🟡🟢 | [Como evitar] | [O que fazer se acontecer] |
| R02 | [Outro risco] | ... | ... | ... | ... | ... |

### Riscos Técnicos
- **[Risco técnico 1]**: [Descrição e mitigação]
- **[Risco técnico 2]**: [Descrição e mitigação]

### Riscos de Negócio
- **[Risco de negócio 1]**: [Descrição e mitigação]
- **[Risco de negócio 2]**: [Descrição e mitigação]

---

## 🔄 Plano de Rollback

### Quando executar rollback?
[Condições que acionam o rollback]

### Como executar rollback?
```bash
# Passo 1
[Comando ou ação]

# Passo 2
[Comando ou ação]

# Passo 3
[Comando ou ação]
```

### Tempo de rollback estimado
[X minutos/horas/dias]

### Perda de dados em rollback
[O que será perdido se fizer rollback? Como recuperar?]

---

## 📊 Métricas e Acompanhamento

### Métricas de Progresso
| Métrica | Baseline | Target | Atual | Status |
|---------|----------|--------|-------|--------|
| % de scripts migrados | 0% | 100% | X% | 🟡 |
| Testes passando | 0 | 100% | X | 🟡 |
| Documentação atualizada | 0% | 100% | X% | 🟡 |

### Métricas de Qualidade
| Métrica | Antes | Depois (Target) | Depois (Real) |
|---------|-------|-----------------|---------------|
| Performance | X | Y | - |
| Cobertura de testes | X% | Y% | - |
| Dívida técnica | Alto | Baixo | - |

### Checkpoints de Validação

**Checkpoint 1 - Fim da Fase 1**:
- [ ] [Critério 1]
- [ ] [Critério 2]
- **Decisão**: [ ] Continuar / [ ] Ajustar / [ ] Abortar

**Checkpoint 2 - Fim da Fase 2**:
- [ ] [Critério 1]
- [ ] [Critério 2]
- **Decisão**: [ ] Continuar / [ ] Ajustar / [ ] Abortar

---

## 🧪 Testes e Validação

### Estratégia de Testes
- **Testes unitários**: [Como serão testados componentes individuais]
- **Testes de integração**: [Como testar a integração entre componentes]
- **Testes de regressão**: [Como garantir que nada quebrou]
- **Testes de aceitação**: [Critérios para considerar a migração bem-sucedida]

### Ambientes
- **Desenvolvimento**: [Configuração]
- **Staging**: [Configuração]
- **Produção**: [Configuração e estratégia de deploy]

### Plano de Testes
| Tipo | Escopo | Responsável | Status |
|------|--------|-------------|--------|
| Unitários | [O que testar] | [Quem] | ⬜ |
| Integração | [O que testar] | [Quem] | ⬜ |
| Performance | [O que testar] | [Quem] | ⬜ |
| Aceitação | [O que testar] | [Quem] | ⬜ |

---

## 📚 Documentação

### Documentação a Atualizar
- [ ] `README.md` principal
- [ ] `CHANGELOG.md`
- [ ] `guides/` (se aplicável)
- [ ] Comentários no código
- [ ] Wiki/Confluence (se aplicável)

### Migration Guide
[Guia para usuários/mantenedores sobre como migrar para a nova versão]

---

## 👥 Comunicação

### Stakeholders
| Papel | Nome | Responsabilidade | Notificar em |
|-------|------|------------------|--------------|
| [Papel] | [Nome] | [O que faz] | [Checkpoint/mudança] |

### Cronograma de Comunicação
| Data | Evento | Audiência | Canal |
|------|--------|-----------|-------|
| [Data] | Início da Fase 1 | [Quem] | [Onde] |
| [Data] | Checkpoint 1 | [Quem] | [Onde] |

---

## ✅ Checklist de Conclusão

### Pré-migração
- [ ] Todos os stakeholders aprovaram
- [ ] Plano revisado e validado
- [ ] Recursos alocados
- [ ] Ambientes preparados
- [ ] Backups realizados

### Durante a migração
- [ ] Checkpoint 1 aprovado
- [ ] Checkpoint 2 aprovado
- [ ] Todos os testes passando
- [ ] Documentação atualizada
- [ ] Treinamentos realizados (se aplicável)

### Pós-migração
- [ ] Métricas de sucesso atingidas
- [ ] Monitoramento em operação
- [ ] Documentação final revisada
- [ ] Lições aprendidas documentadas
- [ ] Comunicação de conclusão enviada

---

## 🎓 Lições Aprendidas

### Durante a Execução
[Registrar aprendizados à medida que a migração ocorre]

**[Data] - [Fase/Tarefa]**:
[O que funcionou bem / O que não funcionou / O que fazer diferente]

### Post-mortem
[Após conclusão, resumo das lições aprendidas]

---

## 🔗 Referências

### Documentos Relacionados
- [Proposta original em planning/]
- [Revisão técnica em reviews/]
- [Outros planos relacionados]

### Recursos Externos
- [Documentação de ferramentas]
- [Artigos de referência]
- [Guias de boas práticas]

---

## 📝 Notas e Observações

[Anotações adicionais, contexto, alterações no plano durante a execução, etc.]

---

*Plano gerado pelo agente @review*  
*Template: `planning/_template-plano-migracao.md`*
