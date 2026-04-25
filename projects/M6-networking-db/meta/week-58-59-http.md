# 📅 Semana 58-59: HTTP 🌍

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Entender protocolo HTTP em profundidade
- Implementar servidor HTTP do zero
- Explicar o que acontece ao acessar um site
- Debugar requests/responses HTTP

---

## ❓ Perguntas Guia

### Fundamentos
1. O que é HTTP?
2. HTTP usa TCP ou UDP? Por quê?
3. O que significa stateless?
4. O que é request/response cycle?
5. Qual a versão atual de HTTP?

### Request
6. O que compõe um HTTP request?
7. Quais os métodos HTTP? (GET, POST, etc)
8. O que é URL vs URI?
9. O que são query parameters?
10. O que são headers de request?
11. O que é request body?

### Response
12. O que compõe um HTTP response?
13. O que são status codes?
14. O que significa 2xx, 3xx, 4xx, 5xx?
15. Quais os status codes mais comuns?
16. O que são headers de response?
17. O que é Content-Type?

### Headers Importantes
18. O que é Host header? Por que é obrigatório?
19. O que é User-Agent?
20. O que é Accept?
21. O que é Content-Length?
22. O que é Connection: keep-alive?
23. O que são cookies?

### HTTP/1.1 vs HTTP/2 vs HTTP/3
24. O que é HTTP/1.1 pipelining?
25. O que HTTP/2 melhora?
26. O que é multiplexing?
27. O que é HTTP/3? (QUIC)

### HTTPS
28. O que é HTTPS?
29. O que é TLS?
30. Como TLS handshake funciona?
31. O que são certificados?

---

## 📚 Recursos

### Leitura
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| MDN Web Docs | HTTP Guide | Referência completa |
| RFC 2616 | HTTP/1.1 | Spec original |
| High Performance Browser Networking | HTTP | Deep dive |

### Ferramentas
| Recurso | Propósito |
|---------|-----------|
| curl | Fazer requests |
| httpie | curl mais amigável |
| Browser DevTools | Inspecionar requests |
| netcat | Raw HTTP |

---

## 📋 Entregas

### Semana 58: Teoria e Request/Response

**Dia 1: Fundamentos**
- [ ] Responder perguntas 1-5
- [ ] Usar curl para fazer requests
- [ ] Ver request/response raw
- [ ] O que acontece quando acessa google.com?

**Dia 2: Request**
- [ ] Responder perguntas 6-11
- [ ] Fazer requests com diferentes métodos
- [ ] Adicionar headers customizados
- [ ] Enviar body com POST

**Dia 3: Response**
- [ ] Responder perguntas 12-17
- [ ] Catalogar status codes comuns
- [ ] Inspecionar headers de response
- [ ] Entender Content-Type

**Dia 4: Headers**
- [ ] Responder perguntas 18-23
- [ ] Por que Host é obrigatório?
- [ ] Experimentar com cookies via curl
- [ ] O que é Connection: keep-alive?

**Dia 5: HTTP Versions**
- [ ] Responder perguntas 24-27
- [ ] Comparar HTTP/1.1, HTTP/2, HTTP/3
- [ ] Verificar qual versão sites usam
- [ ] O que é multiplexing?

### Semana 59: Implementacao

**Dia 1: HTTP Server from Scratch**
- [ ] Criar TCP server em Go
- [ ] Parsear HTTP request manualmente
- [ ] Extrair method, path, headers
- [ ] Enviar response simples

**Dia 2: Routing**
- [ ] Adicionar routing ao server
- [ ] Diferentes handlers para diferentes paths
- [ ] Extrair query parameters
- [ ] Implementar 404 Not Found

**Dia 3: Features**
- [ ] Servir arquivos estáticos
- [ ] Implementar POST handling
- [ ] Parsear JSON body
- [ ] Retornar JSON response

**Dia 4: HTTPS**
- [ ] Responder perguntas 28-31
- [ ] Entender TLS handshake
- [ ] Adicionar TLS ao seu server
- [ ] Gerar certificados auto-assinados

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] HTTP server funcional
- [ ] Cards SRS para status codes e headers
- [ ] Resumo: anatomia de HTTP request/response

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Explicar request/response cycle
2. [ ] Implementar HTTP server básico
3. [ ] Usar curl para debugging
4. [ ] Explicar status codes comuns
5. [ ] Entender diferença HTTP/1.1 vs HTTP/2

### Status Codes para Decorar

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 301 | Moved Permanently |
| 302 | Found (redirect) |
| 304 | Not Modified |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |
| 502 | Bad Gateway |
| 503 | Service Unavailable |

### HTTP Request Anatomy

```
GET /path/to/resource?query=param HTTP/1.1
Host: example.com
User-Agent: curl/7.64.1
Accept: */*
Connection: keep-alive

[body for POST/PUT]
```

### HTTP Response Anatomy

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 123
Date: Mon, 01 Jan 2024 00:00:00 GMT

{"key": "value"}
```

### Red flags (precisa revisar):
- Não sabe diferença entre GET e POST
- Não conhece status codes básicos
- Não consegue implementar server básico

---

## 🔄 Reflexão

### Full Stack
_Como frontend e backend se comunicam?_

### Performance
_Como HTTP/2 melhora performance?_

### Segurança
_Por que HTTPS é importante?_

---

## ⏭️ Próximo

**Semana 60-61**: DB - Storage
- Como databases armazenam bilhões de registros?
- O que são B-Trees e LSM Trees?
- Row vs Column storage?
