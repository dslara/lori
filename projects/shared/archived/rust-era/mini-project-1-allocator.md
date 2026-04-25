# 🛠️ Mini-Projeto 1: Memory Allocator Simplificado

## 📅 Quando
**Semana 15** (após Fase 1: Rust Foundations)

## 🎯 Objetivo
Aplicar ownership, borrowing, lifetimes e smart pointers em um projeto real.

---

## ❓ Pergunta Central
> Como um alocador de memória decide onde colocar dados e como rastreia o que está livre?

---

## 📋 Escopo (5 horas)

### Requisitos Mínimos
- [ ] Struct `BumpAllocator` com buffer fixo (ex: 1KB)
- [ ] Método `alloc(size: usize) -> Option<*mut u8>`
- [ ] Método `reset()` para liberar tudo
- [ ] Testes básicos

### Stretch Goals (se sobrar tempo)
- [ ] Alignment handling
- [ ] Método `free()` individual (free list)
- [ ] Benchmark comparando com sistema

---

## 📚 Recursos

| Recurso | Seção | Propósito |
|---------|-------|-----------|
| Rustonomicon | [Implementing Vec](https://doc.rust-lang.org/nomicon/vec/vec.html) | Inspiração |
| Writing an OS in Rust | [Heap Allocation](https://os.phil-opp.com/heap-allocation/) | Conceitos |
| Crafting Interpreters | Cap 14 (memory) | Contexto |

---

## 📋 Entregas por Dia

**Dia 1**: Pesquisa e Design
- [ ] Estudar como bump allocators funcionam
- [ ] Esboçar struct e assinaturas
- [ ] Criar projeto Rust

**Dia 2**: Implementação Básica
- [ ] Implementar `new()` e `alloc()`
- [ ] Testes para casos simples
- [ ] Lidar com erros (buffer cheio)

**Dia 3**: Refinamento
- [ ] Implementar `reset()`
- [ ] Adicionar testes de edge cases
- [ ] Documentar código

**Dia 4**: Stretch ou Revisão
- [ ] Implementar stretch goal OU
- [ ] Refatorar e melhorar testes

**Dia 5**: Reflexão e Documentação
- [ ] README explicando decisões
- [ ] Responder pergunta central
- [ ] Criar 5 SRS cards sobre o aprendizado

---

## ✅ Critérios de Sucesso

### Você completou se:
1. [ ] Código compila sem warnings
2. [ ] Testes passam
3. [ ] Consegue explicar cada linha de unsafe (se usar)
4. [ ] README documenta trade-offs

### Conexões com Fase 1:
- Ownership: Quem é dono do buffer?
- Borrowing: Como retornar referências válidas?
- Lifetimes: Como garantir que alocações não outlive o allocator?
- Smart Pointers: Por que não usar Box aqui?

---

## 🔄 Reflexão

### O que foi mais difícil?
_Escreva_

### Como ownership ajudou/atrapalhou?
_Escreva_

### O que faria diferente?
_Escreva_

---

## ⏭️ Próximo
**Buffer 2** (Semana 16) → **Fase 2: Data Structures** (Semana 17)
