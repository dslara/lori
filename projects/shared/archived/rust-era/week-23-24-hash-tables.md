# 📅 Semana 23-24: Hash Tables 🔑

## 🎯 Objetivo
Ao final destas duas semanas, você será capaz de:
- Implementar hash table do zero
- Entender e resolver colisões
- Analisar quando O(1) não é garantido
- Escolher entre HashMap e alternativas

---

## ❓ Perguntas Guia

### Conceitos Fundamentais
1. O que é uma hash function?
2. O que significa "determinística" para hash functions?
3. O que é uma "boa" hash function?
4. O que é o "hash code" e o "index"?
5. Por que hash tables têm O(1) lookup?

### Colisões
6. O que é uma colisão?
7. Por que colisões são inevitáveis? (Pigeonhole principle)
8. O que é "chaining"? Como funciona?
9. O que é "open addressing"? Como funciona?
10. O que é "linear probing"? Problemas?
11. O que é "quadratic probing"?
12. O que é "double hashing"?

### Load Factor e Resizing
13. O que é "load factor"?
14. Por que load factor afeta performance?
15. Quando hash table faz resize?
16. Qual a complexidade de resize?
17. Por que resize é amortizado O(1)?

### Em Rust
18. Qual a diferença entre `HashMap` e `BTreeMap`?
19. O que é a trait `Hash` em Rust?
20. O que é a trait `Eq` e por que é necessária?
21. Como implementar Hash para tipos custom?

### Trade-offs
22. Quando HashMap NÃO é a melhor escolha?
23. O que é "hash flooding attack"?
24. Por que Rust usa SipHash por padrão?

---

## 📚 Recursos

### Leitura
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| CLRS | Chapter 11 - Hash Tables | Teoria completa |
| Rust std docs | `std::collections::HashMap` | API em Rust |

### Visualização
| Recurso | Propósito |
|---------|-----------|
| Visualgo.net | Hash table visualizations |

---

## 📋 Entregas

### Semana 23: Fundamentos e Implementação

**Dia 1: Hash Functions**
- [ ] Responder perguntas 1-5
- [ ] Implementar hash function simples para strings
- [ ] Testar: mesma entrada = mesma saída?
- [ ] Testar: distribuição uniforme?

**Dia 2: Colisões - Chaining**
- [ ] Responder perguntas 6-8
- [ ] Implementar hash table com chaining
- [ ] Usar Vec<Vec<(K, V)>> como estrutura
- [ ] Operações: insert, get, remove

**Dia 3: Colisões - Open Addressing**
- [ ] Responder perguntas 9-12
- [ ] Implementar hash table com linear probing
- [ ] O que acontece com "tombstones" em delete?
- [ ] Comparar: chaining vs open addressing

**Dia 4: Load Factor**
- [ ] Responder perguntas 13-17
- [ ] Adicionar resize automático à sua implementação
- [ ] Testar: performance antes e depois de resize
- [ ] Medir load factor ideal

**Dia 5: Projeto**
- [ ] Implementar MyHashMap completo
- [ ] Com resize automático
- [ ] Benchmark vs std::collections::HashMap

### Semana 24: Rust e Problemas

**Dia 1: HashMap em Rust**
- [ ] Responder perguntas 18-21
- [ ] Explorar API de HashMap
- [ ] Entry API: `entry().or_insert()`
- [ ] Implementar Hash para struct custom

**Dia 2: Problemas Clássicos - Contagem**
- [ ] Two Sum (usando HashMap)
- [ ] Group Anagrams
- [ ] Top K Frequent Elements

**Dia 3: Problemas Clássicos - Sets**
- [ ] O que é HashSet? Quando usar?
- [ ] Intersection of Two Arrays
- [ ] Longest Consecutive Sequence
- [ ] Contains Duplicate

**Dia 4: Segurança e Trade-offs**
- [ ] Responder perguntas 22-24
- [ ] Pesquisar: Hash flooding attacks
- [ ] Por que Rust usa SipHash?
- [ ] Quando usar BTreeMap em vez de HashMap?

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Criar cheat sheet: HashMap operations
- [ ] Cards SRS para conceitos de hash
- [ ] Documentar: 5 casos de uso ideais para HashMap

---

## ✅ Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar hash table com chaining do zero
2. [ ] Explicar por que O(1) não é sempre garantido
3. [ ] Resolver Two Sum com HashMap em 5 minutos
4. [ ] Explicar load factor e resize
5. [ ] Implementar Hash para tipo custom em Rust

### Teste Rápido
Sem consulta:
- Load factor 0.75 significa?
- Chaining vs Open Addressing: trade-offs?
- Por que precisamos de Hash E Eq?
- Quando HashMap é O(n)?

### Red flags (precisa revisar):
- Não sabe o que é colisão
- Não entende por que resize é necessário
- Acha que HashMap é sempre O(1)

---

## 🔄 Reflexão

### Insight
_O que você não sabia sobre hash tables?_

### Trade-offs
_Quando você NÃO usaria HashMap?_

### Conexão
_Como hash tables se relacionam com arrays?_

---

## ⏭️ Próximo

**Semana 25-26**: Trees & BST
- Como organizar dados hierarquicamente?
- Por que O(log n) não é garantido em BST?
- O que são árvores balanceadas?
