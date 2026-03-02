# Semana 39-40: Grafos - Representacao

## Objetivo
Ao final destas duas semanas, você será capaz de:
- Entender terminologia de grafos
- Implementar representações de grafos em Zig
- Escolher entre matriz e lista de adjacência
- Modelar problemas reais como grafos

**Linguagem**: Python no LeetCode, Zig localmente para implementações

---

## Perguntas Guia

### Conceitos Básicos
1. O que é um grafo?
2. O que são vértices (nodes) e arestas (edges)?
3. O que é grafo direcionado vs não-direcionado?
4. O que é grafo ponderado?
5. O que é grau de um vértice?
6. O que é caminho (path)?
7. O que é ciclo?
8. O que é grafo conectado?
9. O que é componente conectado?

### Tipos Especiais
10. O que é grafo completo?
11. O que é grafo bipartido?
12. O que é árvore em termos de grafo?
13. O que é DAG (Directed Acyclic Graph)?
14. Onde DAGs são usados?

### Representações
15. O que é matriz de adjacência?
16. O que é lista de adjacência?
17. Qual a complexidade de espaço de cada?
18. Qual a complexidade para verificar se aresta existe?
19. Qual a complexidade para listar vizinhos?
20. Quando usar matriz? Quando usar lista?

### Grafos Densos vs Esparsos
21. O que é grafo denso?
22. O que é grafo esparso?
23. Qual representação é melhor para cada?
24. Como calcular densidade de um grafo?

### Modelagem
25. Como modelar rede social como grafo?
26. Como modelar mapa de estradas?
27. Como modelar dependências de pacotes?
28. Como modelar web pages e links?

---

## Recursos

### Leitura
| Recurso | Seção | Propósito |
|---------|-------|-----------|
| CLRS | Chapter 22 - Elementary Graph Algorithms | Fundamentos |
| Visualgo.net | Graph DS | Visualização |

---

## Entregas

### Semana 39: Conceitos e Representacoes

**Dia 1: Conceitos Básicos**
- [ ] Responder perguntas 1-9
- [ ] Desenhar grafo com 6 vértices e 8 arestas
- [ ] Identificar: grau de cada vértice
- [ ] Encontrar: um caminho, um ciclo

**Dia 2: Tipos de Grafos**
- [ ] Responder perguntas 10-14
- [ ] Desenhar exemplo de cada tipo
- [ ] Listar 3 aplicações de DAGs
- [ ] Por que árvore é grafo especial?

**Dia 3: Matriz de Adjacência**
- [ ] Responder perguntas 15, 18 (matriz)
- [ ] Implementar `AdjMatrix` em Zig (usando `std.ArrayList([]bool)`)
- [ ] Operações: add_vertex, add_edge, has_edge
- [ ] Listar vizinhos de um vértice

**Dia 4: Lista de Adjacência**
- [ ] Responder perguntas 16, 19 (lista)
- [ ] Implementar `AdjList` em Zig (usando `std.ArrayList(std.ArrayList(usize))`)
- [ ] Mesmas operações
- [ ] Comparar código das duas implementações

**Dia 5: Comparação**
- [ ] Responder perguntas 17, 20-24
- [ ] Criar tabela comparativa
- [ ] Benchmark: operações em grafo denso vs esparso
- [ ] Decision tree: quando usar cada

### Semana 40: Aplicacoes e Problemas

**Dia 1: Grafos Ponderados**
- [ ] Modificar implementações para suportar pesos
- [ ] Matriz: armazenar `?f64` em vez de `bool`
- [ ] Lista: armazenar `struct { neighbor: usize, weight: f64 }`

**Dia 2: Grafos Direcionados**
- [ ] Modificar implementações para direcionados
- [ ] Implementar in-degree e out-degree
- [ ] Exemplo: grafo de dependências

**Dia 3: Modelagem**
- [ ] Responder perguntas 25-28
- [ ] Modelar: seu projeto como grafo de dependências
- [ ] Modelar: rede de metrô como grafo
- [ ] Discutir: qual representação para cada?

**Dia 4: Problemas**
- [ ] Problema: Find if Path Exists in Graph — Python
- [ ] Problema: Find Center of Star Graph — Python
- [ ] Problema: Find the Town Judge — Python
- [ ] Problema: Course Schedule (detectar ciclo) — Python

**Dia 5: Consolidação**
- [ ] Responder TODAS as perguntas guia
- [ ] Criar biblioteca de grafos reutilizável em Zig
- [ ] Cards SRS para terminologia
- [ ] Preparar: BFS e DFS vêm a seguir

---

## Critérios de Sucesso

### Você dominou se consegue:
1. [ ] Implementar ambas representações em Zig
2. [ ] Explicar trade-offs de cada
3. [ ] Modelar problema real como grafo
4. [ ] Calcular complexidade de operações
5. [ ] Escolher representação para cenário

### Complexidades

| Operação | Matriz | Lista |
|----------|--------|-------|
| Espaço | O(V²) | O(V + E) |
| Adicionar vértice | O(V²) | O(1) |
| Adicionar aresta | O(1) | O(1) |
| Remover aresta | O(1) | O(E) |
| Verificar aresta | O(1) | O(grau) |
| Listar vizinhos | O(V) | O(grau) |

### Red flags (precisa revisar):
- Confunde direcionado com não-direcionado
- Não sabe diferença entre denso e esparso
- Não consegue modelar problema como grafo

---

## Reflexão

### Abstração
_Como grafos generalizam árvores e listas?_

### Modelagem
_Que problemas você agora vê como grafos?_

### Preparação
_Como a representação afeta algoritmos?_

---

## Próximo

**Semana 41-42**: Grafos - Algoritmos
- BFS: busca em largura
- DFS: busca em profundidade
- Dijkstra: menor caminho ponderado
- Topological Sort: ordenação de DAG
