# Semana 64: Integracao HTTP + Storage

## Objetivo
Ao final desta semana, voce sera capaz de:
- Conectar um servidor HTTP simples a um storage basico
- Explicar o fluxo request -> processamento -> persistencia
- Definir limites de escopo para a fase de networking + DB

---

## Perguntas Guia

1. Onde o HTTP server deve chamar o storage?
2. Como representar dados em memoria vs em disco?
3. Quais erros devem virar status 4xx/5xx?
4. Como manter API simples e previsivel?
5. Como testar fluxo ponta a ponta?

---

## Entregas

**Dia 1**: Design
- [ ] Definir endpoints (GET/POST basicos)
- [ ] Definir esquema de dados simples (key/value)

**Dia 2**: Implementacao
- [ ] Conectar handler HTTP com storage local
- [ ] Persistir dados em arquivo simples

**Dia 3**: Erros
- [ ] Mapear erros de parsing e storage para status codes

**Dia 4**: Testes
- [ ] Teste manual com curl
- [ ] Testes automatizados basicos

**Dia 5**: Consolidacao
- [ ] Resumo de 10 linhas
- [ ] 5 cards SRS

---

## Critérios de Sucesso

- [ ] Fluxo request -> storage funciona
- [ ] Erros mapeados corretamente
- [ ] Explica o pipeline sem consultar

---

## Proximo

**Semana 65**: Buffer antes de Compilers
