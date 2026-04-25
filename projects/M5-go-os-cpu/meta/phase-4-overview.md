# Fase 4: Go + OS/CPU (Meses 12-13)

> **Semanas reais no timeline**: 46-54 (apos Mini-Projeto 3 + Buffer 4)
> **Arquivos**: `week-46-47-go-basics.md` ate `week-54-os-scheduling.md`

## Visão Geral

**Duracao**: 9 semanas (45 horas)
**Objetivo**: Aprender Go e fundamentos de CPU/OS

---

## Pergunta Central

> Como computadores executam codigo? Como Go difere de Zig em memoria e concorrencia?

Esta fase combina:
- Go (sintaxe, tipos, concorrencia)
- Fundamentos de CPU/OS (cache, processos, scheduling)

---

## Semanas

| Semana | Tema | Pergunta Guia | Arquivo |
|--------|------|---------------|---------|
| 46-47 | Go Basics | Como Go difere de Zig em modelo de memoria? | `week-46-47-go-basics.md` |
| 48-49 | Go Concurrency | Como goroutines diferem de threads? | `week-48-49-go-concurrency.md` |
| 50-51 | CPU & Cache | Por que ordem de acesso importa? | `week-50-51-cpu-cache.md` |
| 52-53 | OS: Processos | Como o OS decide quem executa? | `week-52-53-os-processes.md` |
| 54 | OS: Scheduling | O que e preempcao? | `week-54-os-scheduling.md` |

---

## Conceitos-Chave

### Go
- Sintaxe e tipos basicos
- Slices, maps, interfaces
- Goroutines e channels

### CPU/OS
- Cache e hierarquia de memoria
- Processos e threads
- Scheduling e preempcao

---

## Benchmark da Fase

### Entrega minima
1. Codigo Go idiomatico com goroutines e channels
2. Explicar cache locality com exemplo simples
3. Descrever processos vs threads vs goroutines

---

## Recursos Principais

| Recurso | Uso |
|---------|-----|
| A Tour of Go | Fundamentos de Go |
| Effective Go | Estilo idiomatico |
| CS:APP | CPU e cache |
| OSTEP | Processos e scheduling |

---

## Conexões

### Usa conhecimentos de
- **Fase 1**: Conceitos de memoria em Zig
- **Fase 3**: Analise de complexidade

### Prepara para
- **Fase 5**: Networking + DB

---

## Tracking

- [ ] Semana 46-47 completa (Go Basics)
- [ ] Semana 48-49 completa (Go Concurrency)
- [ ] Semana 50-51 completa (CPU & Cache)
- [ ] Semana 52-53 completa (OS: Processos)
- [ ] Semana 54 completa (OS: Scheduling)
- [ ] Cards SRS criados (minimo 30)

**Confiança geral**: _/5

---

*"Sistemas ficam claros quando voce ve o fluxo completo."*
