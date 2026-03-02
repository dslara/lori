# Semana 48-49: Go Concurrency

## Objetivo
Ao final destas duas semanas, voce sera capaz de:
- Usar goroutines, channels e select
- Evitar race conditions basicas
- Comparar concorrencia Go vs Zig

---

## Perguntas Guia

1. O que e uma goroutine?
2. Como channels sincronizam?
3. Quando usar mutex vs channel?
4. O que e um data race?
5. Como testar concorrencia?

---

## Recursos

| Recurso | Secao | Acao |
|---------|-------|------|
| Go Blog | Concurrency pipelines | Ler |
| Effective Go | Concurrency | Ler |

---

## Entregas por Dia

### Semana 48
**Dia 1**: Goroutines
- [ ] Criar 3 goroutines simples
- [ ] Medir tempo com `time.Since`

**Dia 2**: Channels
- [ ] Implementar pipeline com channels

**Dia 3**: Select
- [ ] Usar `select` com timeout

**Dia 4**: Mutex
- [ ] Proteger contador compartilhado

**Dia 5**: Revisao
- [ ] Comparar mutex vs channel

### Semana 49
**Dia 1**: Worker pool
- [ ] Implementar worker pool simples

**Dia 2**: Race detector
- [ ] Rodar `go test -race`

**Dia 3**: Padroes
- [ ] Fan-in / Fan-out

**Dia 4**: Consolidacao
- [ ] Criar 5 cards SRS

**Dia 5**: Resumo
- [ ] Resumo de 10 linhas

---

## Critérios de Sucesso

- [ ] Usa goroutines e channels com confianca
- [ ] Entende trade-offs mutex vs channel

---

## Proximo

**Semana 50-51**: CPU & Cache
