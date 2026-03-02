# 🐹 Fase 5: Networking + DB (Meses 14-15)

> **Semanas reais no timeline**: 56-64 (apos Buffer 5)
> **Arquivos**: `week-56-57-tcp-ip.md` ate `week-64-integration.md`

## 📋 Visao Geral

**Duracao**: 9 semanas total (45 horas)
**Objetivo**: Entender redes e databases na pratica

---

## 🎯 Pergunta Central

> Como dados trafegam e sao armazenados? Como HTTP conversa com storage?

Esta fase responde:
- Como dados viajam pela rede?
- Como HTTP lida com requests e respostas?
- Como databases armazenam e transacionam dados?

---

## 📅 Semanas

| Semana | Tema | Pergunta Guia | Arquivo |
|--------|------|---------------|---------|
| 56-57 | TCP/IP | Como dados chegam ao destino? | `week-56-57-tcp-ip.md` |
| 58-59 | HTTP | O que acontece ao acessar um site? | `week-58-59-http.md` |
| 60-61 | DB: Storage | Como databases armazenam dados? | `week-60-61-db-storage.md` |
| 62-63 | DB: Transactions | Como garantir consistencia? | `week-62-63-db-transactions.md` |
| 64 | Integracao | Como conectar HTTP + storage simples? | `week-64-integration.md` |

---

## 🧠 Topicos a Dominar

### Networking
- TCP/IP stack
- DNS
- HTTP/HTTPS
- Sockets

### Databases
- Storage engines
- B-Trees e LSM Trees
- ACID
- Isolation levels

---

## ✅ Benchmark da Fase (Q3)

### Projeto: HTTP Server from Scratch
Implementar em Go:
- TCP socket listener
- HTTP request parsing
- HTTP response formatting
- Routing basico
- Serving static files

Explicar cada camada durante code review.

---

## 📚 Recursos Principais

| Recurso | Uso |
|---------|-----|
| Computer Networking (Kurose) | Networking |
| MDN HTTP | HTTP fundamentos |
| Designing Data-Intensive Apps | Databases |
| Database Internals | Storage engines |

---

## 🔗 Conexoes

### Usa conhecimentos de
- **Fase 4**: Go + OS/CPU
- **Fase 2**: Estruturas de dados (B-Trees)
- **Fase 3**: Algoritmos (Dijkstra em routing)

### Prepara para
- **Fase 6**: Entender como compiladores funcionam

---

## 🎯 Tracking

- [ ] Semana 56-57 completa (TCP/IP)
- [ ] Semana 58-59 completa (HTTP)
- [ ] Semana 60-61 completa (DB Storage)
- [ ] Semana 62-63 completa (DB Transactions)
- [ ] Semana 64 completa (Integracao)
- [ ] Benchmark Q3 passado (HTTP Server)
- [ ] Cards SRS criados (minimo 60)

**Confianca geral**: _/5

---

*"Voce nao entende realmente algo ate implementa-lo." - Richard Feynman (parafrase)*
