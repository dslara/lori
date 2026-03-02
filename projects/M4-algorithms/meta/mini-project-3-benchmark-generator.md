# Mini-Projeto 3: Benchmark Generator

## Quando
**Semana 44** (junto de DP)

## Objetivo
Criar uma ferramenta que gera casos de teste e benchmarks automaticamente para algoritmos, combinando sorting, searching, e análise de performance.

---

## Pergunta Central
> Como você mede objetivamente a performance de algoritmos e valida que implementações são corretas para inputs de qualquer tamanho?

---

## Contexto

**Por que Benchmark Generator?**
- Uso real: qualquer engenheiro precisa benchmarkar código
- Exercita: sorting, searching, análise de complexidade, geração de dados
- Produto tangível: ferramenta que você vai querer usar depois
- Conecta F1 (Zig mechanics) + F2 (DS) + F3 (algorithms)

**O que o projeto faz:**
- Gera inputs de diferentes tamanhos e distribuições (random, sorted, reversed, nearly-sorted)
- Roda múltiplos algoritmos no mesmo input
- Mede tempo e compara contra complexidade teórica esperada
- Valida corretude: todos produzem o mesmo output?

---

## Escopo (5 horas)

### Requisitos Mínimos
- [ ] Gerador de inputs: `generateArray(allocator, n, distribution) ![]i32`
  - Distribuições: `.random`, `.sorted`, `.reversed`, `.nearly_sorted`
- [ ] Benchmarker: `benchmark(name, fn, input) BenchmarkResult`
  - Mede tempo com `std.time.Timer`
  - Retorna: nome, tamanho, tempo_ns
- [ ] Algoritmos incluídos: bubble sort, insertion sort, merge sort, quicksort
- [ ] Validador: verifica que todos os resultados são iguais
- [ ] Output: tabela comparativa (texto)

### Stretch Goals (apenas se sobrar tempo)
- [ ] Output CSV para análise posterior
- [ ] Binary search benchmark
- [ ] Detectar automaticamente complexidade (O(n), O(n log n), O(n²)) por regressão simples
- [ ] Gráfico ASCII da curva de crescimento

---

## Recursos

| Recurso | Seção | Propósito |
|---------|-------|-----------|
| Zig Documentation | `std.time.Timer` | Medição de tempo |
| Zig Documentation | `std.rand` | Geração de números aleatórios |
| Seu código da Fase 3 | Sorting implementations | Base dos algoritmos |

---

## Entregas por Dia

**Dia 1**: Design e Gerador
- [ ] Esboçar: que dados o relatório deve mostrar?
- [ ] Implementar `generateArray` com as 4 distribuições
- [ ] Verificar: distribuição `.sorted` realmente produz array sorted?

**Dia 2**: Algoritmos e Benchmarker
- [ ] Copiar/adaptar: bubble, insertion, merge, quicksort da Fase 3
- [ ] Implementar `benchmark(name, sort_fn, input) BenchmarkResult`
- [ ] Testar: para n=1000, qual algoritmo é mais rápido em input sorted?

**Dia 3**: Validador e Output
- [ ] Implementar: verificar que todos os sorts produzem output idêntico
- [ ] Implementar: formatar tabela de resultado
  ```
  Algorithm       N=100    N=1000    N=10000
  bubble_sort     50µs     5ms       500ms
  insertion_sort  30µs     3ms       300ms
  merge_sort      10µs     0.1ms     1ms
  quicksort        8µs     0.08ms    0.9ms
  ```
- [ ] Rodar com distribuição `.reversed` — qual piora mais?

**Dia 4**: Análise e Testes
- [ ] Testar todas as combinações: 4 algoritmos × 4 distribuições × 3 tamanhos
- [ ] Verificar que complexidades baten com teoria (n=100 vs n=1000: tempo ~10x para O(n log n)?)
- [ ] Escrever 5+ testes de corretude (output sorted = expected?)
- [ ] Stretch goal se houver tempo

**Dia 5**: Reflexão
- [ ] Escrever análise: quais resultados surpreenderam? Por quê?
- [ ] Comparar: quicksort vs mergesort em input nearly_sorted
- [ ] Criar 5 SRS cards sobre o aprendizado
- [ ] Preencher reflexão abaixo

---

## Critérios de Sucesso

### Você completou se:
1. [ ] Gera tabela comparativa para 4 algoritmos × múltiplos N
2. [ ] Validador confirma que todos os resultados são iguais
3. [ ] Resultados são consistentes com complexidade teórica
4. [ ] Código sem leaks (GPA para verificar)
5. [ ] Consegue responder pergunta central com dados concretos

### Conexões com F1, F2, F3:
- F1: Allocators para buffers de input, comptime para `benchmark` genérico
- F2: ArrayList para resultados, sorting implementations
- F3: Os próprios algoritmos sendo testados
- Análise de complexidade: teoria encontra prática

---

## Exemplo de Uso

```zig
pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    const sizes = [_]usize{ 100, 1000, 10000 };
    const distributions = [_]Distribution{ .random, .sorted, .reversed };

    for (distributions) |dist| {
        std.debug.print("\nDistribution: {s}\n", .{@tagName(dist)});
        for (sizes) |n| {
            const input = try generateArray(allocator, n, dist);
            defer allocator.free(input);

            const r1 = benchmark("bubble", bubbleSort, input);
            const r2 = benchmark("merge", mergeSort, input);
            const r3 = benchmark("quick", quickSort, input);

            printRow(n, &[_]BenchmarkResult{ r1, r2, r3 });
        }
    }
}
```

---

## Reflexão

### Qual resultado mais surpreendeu e por quê?
_Escreva_

### Como os dados mudaram sua intuição sobre sorting?
_Escreva_

### Em que situação você escolheria cada algoritmo?
_Escreva_

---

## Proximo
**Semana 45**: Buffer F3→F4
**Semana 46**: Fase 4 comeca — Go + OS/CPU
