# Learning Map: M2 Zig Foundations + Comptime (Semanas 7-16)

> **Plano tático** para as 10 semanas deste módulo. Para visão estratégica global, veja [master-learning-map](../../shared/master-learning-map.md).

---

## Pergunta Central do Módulo

**Como Zig gerencia memória de forma explícita e transparente?**

---

## Timeline

| Semana | Tema | Pergunta Guia | Entrega |
|--------|------|---------------|---------|
| 7 | Zig Setup | Tenho tudo que preciso para começar Zig? | `zig version`, Ziglings 30+ |
| 8 | Básico + Memória Overview | Como stack e heap funcionam em Zig? | Hello world + análise de stack frames |
| 9 | Ponteiros + Optionals | Diferença entre `*T`, `?T` e `?*T`? | Exercícios de pointers |
| 10 | Error Handling | Como `try`/`catch`/`errdefer` funcionam? | Função com proper error handling |
| 11 | Structs/Enums/Unions + Testes | Como definir tipos customizados com testes? | Struct com métodos + testes passando |
| 12 | Memory Deep Dive | Por que alignment e padding importam? | Análise de layout de structs |
| 13 | Allocators + ArrayList | Como allocators funcionam? Arena vs GPA? | MyArrayList(T) funcional |
| 14 | Comptime Patterns | Como type functions funcionam? | Type function simples | 
| 15 | Comptime Code Gen | Como gerar código em compile-time? | Tabela gerada em comptime |
| 16 | Mini-Projeto 1 | Arena Allocator com instrumentação | Arena Allocator completo |

---

## Horas Estimadas

- Total: ~50h (9 semanas de estudo + 1 mini-projeto)
- Distribuição sugerida: 1h/dia, 5 dias/semana

---

## Benchmark de Saída

Ao terminar M2, você passa se conseguir:
- [ ] Explicar stack vs heap sem consulta, com exemplos em Zig
- [ ] Implementar `MyArrayList(T)` do zero com `init`/`deinit`/`append`/`get`
- [ ] Escrever Arena Allocator funcional com tracking de bytes alocados
- [ ] Responder: "Por que Zig não tem GC? Qual o custo disso?"

---

## Sistema de Sustentabilidade

### Buffer 2 (Semana 17)
Use para:
- Finalizar Mini-Projeto 1 se não concluído
- Revisar ponteiros e allocators (conceitos fundamentais para tudo que vem)
- SRS review profundo antes de M3

---

## Métricas de Acompanhamento

| Semana | Status | Horas | Notas |
|--------|--------|-------|-------|
| 7 (Setup) | [ ] | | |
| 8 | [ ] | | |
| 9 | [ ] | | |
| 10 | [ ] | | |
| 11 | [ ] | | |
| 12 | [ ] | | |
| 13 | [ ] | | |
| 14 | [ ] | | |
| 15 | [ ] | | |
| 16 (Mini-P1) | [ ] | | |
| Buffer 2 | [ ] | | |

**Total M2**: 0/50h
