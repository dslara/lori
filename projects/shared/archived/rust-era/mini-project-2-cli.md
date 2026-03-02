# 🛠️ Mini-Projeto 2: CLI Tool com Data Structures

## 📅 Quando
**Semana 29** (após Fase 2: Data Structures)

## 🎯 Objetivo
Usar as principais estruturas de dados aprendidas em um projeto prático.

---

## ❓ Pergunta Central
> Qual estrutura de dados é melhor para cada operação do meu programa?

---

## 📋 Escopo (5 horas)

### O Projeto: Task Manager CLI

Um gerenciador de tarefas em linha de comando que demonstra cada DS:

| Estrutura | Uso no Projeto |
|-----------|----------------|
| **Vec** | Lista principal de tarefas |
| **HashMap** | Índice por ID para O(1) lookup |
| **Stack** | Undo (histórico de ações) |
| **Heap** | Priorização de tarefas |

> ⚠️ **Escopo ajustado**: 4 estruturas principais em 5h. Não tente usar todas as DS!

### Requisitos Mínimos
- [ ] CRUD básico de tarefas
- [ ] Usar **4 estruturas diferentes** corretamente
- [ ] Justificar escolha de cada DS no README
- [ ] Comandos: add, list, complete, undo, priority

### Stretch Goals (apenas se sobrar tempo)
- [ ] HashSet para tags únicas
- [ ] Persistência em arquivo JSON
- [ ] Filtros por prioridade

---

## 📚 Recursos

| Recurso | Seção | Propósito |
|---------|-------|-----------|
| clap (Rust) | https://docs.rs/clap/ | Parsing de CLI |
| std::collections | https://doc.rust-lang.org/std/collections/ | Referência |
| Seu código da Fase 2 | Suas implementações | Base |

---

## 📋 Entregas por Dia

**Dia 1**: Design e Setup
- [ ] Definir comandos e estrutura
- [ ] Mapear qual DS para qual feature
- [ ] Setup do projeto com clap

**Dia 2**: Core Features
- [ ] Implementar Task struct
- [ ] CRUD básico com Vec + HashMap
- [ ] Comando add e list

**Dia 3**: Estruturas Avançadas
- [ ] Implementar undo com Stack
- [ ] Adicionar prioridade com Heap
- [ ] Comando complete e undo

**Dia 4**: Refinamento
- [ ] Adicionar mais DS (BST para ordenação, etc)
- [ ] Testes
- [ ] Edge cases

**Dia 5**: Documentação e Reflexão
- [ ] README com justificativas de DS
- [ ] Diagrama de arquitetura simples
- [ ] 5 SRS cards sobre escolhas de DS

---

## ✅ Critérios de Sucesso

### Você completou se:
1. [ ] CLI funciona com comandos básicos
2. [ ] **4 DS diferentes** usadas corretamente
3. [ ] README explica POR QUE cada DS foi escolhida
4. [ ] Consegue explicar trade-offs de cada escolha

### Perguntas de Auto-avaliação:
- Por que HashMap para lookup e não Vec?
- Por que Heap para prioridade e não sorted Vec?
- Por que Stack para undo e não Vec?

---

## 🔄 Reflexão

### Qual DS foi mais natural de usar?
_Escreva_

### Qual DS foi mais difícil de encaixar?
_Escreva_

### O que você escolheria diferente em um projeto real?
_Escreva_

---

## ⏭️ Próximo
**Buffer 3** (Semana 30) → **Fase 3: Algorithms** (Semana 31)
