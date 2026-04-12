# 👁️ Guia Completo: Code Review (Revisão de Código)

> **Técnica de Feedback para Código**

---

## 📋 Índice

- [O que é Code Review](#o-que-e-code-review)
- [Quando Fazer](#quando-fazer)
- [Como Revisar](#como-revisar)
- [Checklist de Revisão](#checklist-de-revisao)
- [Como Receber Feedback](#como-receber-feedback)

---

## 🎯 O que é Code Review? 
**Code Review** é o processo de revisar código escrito por outra pessoa (ou por você mesmo, após um tempo) para identificar melhorias, bugs e oportunidades de aprendizado.

### Benefícios
- ✅ Encontra bugs antes de produção
- ✅ Compartilha conhecimento entre o time
- ✅ Padroniza qualidade
- ✅ Acelera aprendizado do revisor E do autor

### 🔗 Princípios Relacionados

**Implementa:**
- **[6-feedback.md](../principios/6-feedback.md)** - Princípio #6: Feedback

**Complementa:**
- [feedback-loop.md](feedback-loop.md) - Ciclo de feedback geral
- [feynman.md](feynman.md) - Explicar escolhas de código

---

## 🧠 Quando Fazer

### ✅ SEMPRE revise:
- Antes de mergear para main/master
- Após implementar feature completa
- Quando está "travado" há muito tempo

### ✅ Revise também:
- Seu próprio código ("self-review") após 1 dia
- Código de exemplos e tutoriais
- Soluções de exercícios

---

## 🔍 Como Revisar

### Abordagem: 3 Passos

#### 1. Primeira Leitura (Visão Geral)
- Entende o que o código faz?
- Faz sentido a estrutura?
- Não olhe detalhes ainda

#### 2. Segunda Leitura (Detalhes)
- Lógica está correta?
- Edge cases cobertos?
- Nomes claros?

#### 3. Terceira Leitura (Qualidade)
- Pode ser mais simples?
- Está repetindo código?
- Testes suficientes?

---

## ✅ Checklist de Revisão

### Funcionalidade
- [ ] Código faz o que deveria fazer?
- [ ] Edge cases tratados?
- [ ] Erros são tratados adequadamente?

### Qualidade
- [ ] Nomes de variáveis/funções são claros?
- [ ] Funções são pequenas e focadas?
- [ ] Sem código duplicado?
- [ ] Comentários explicam "por quê", não "o quê"?

### Performance
- [ ] Algoritmo adequado para o caso de uso?
- [ ] Não há queries/loops desnecessários?
- [ ] Memória gerenciada corretamente?

### Testes
- [ ] Testes cobrem casos principais?
- [ ] Testes cobrem edge cases?
- [ ] Testes são claros e independentes?

---

## 🎯 Framework 3D

### Onde Code Review se Encaixa

**Aplicável a todas as dimensões:**

| Dimensão | Aplicação |
|----------|-----------|
| **Conceitos** | Revisar explicações e documentação |
| **Fatos** | Verificar precisão de informações |
| **Procedimentos** | Principal uso - revisar código |

---

## 💬 Como Dar Feedback

### ✅ BOM: Construtivo e Específico
```
"Essa função tem 100 linhas. Que tal dividir em 3 funções menores?
Sugestão de divisão:
1. Validar input
2. Processar dados
3. Formatar output"
```

### ❌ RUIM: Vago ou Negativo
```
"Isso está ruim"
"Não gostei"
"Refaz"
```

### Formato Sugerido
```
[QUESTÃO] - Pergunta genuína
[SUGESTÃO] - Ideia opcional
[BLOQUEIO] - Deve ser resolvido
[ELOGIO] - O que está bom
```

---

## 🙏 Como Receber Feedback

### Regra de Ouro
**Feedback é sobre o código, não sobre você.**

### Processo
1. **Leia tudo** antes de responder
2. **Entenda** a intenção
3. **Pergunte** se não entender
4. **Agradeça** (a pessoa está te ajudando)
5. **Implemente** ou explique por que não

### Exemplo de Resposta
```
Revisor: "Aqui poderia usar match em vez de if-else"

Autor: "Boa sugestão! Não conhecia essa sintaxe.
Vou mudar e adicionar um link para docs no comentário."
```

---

## 🎯 Self-Review

Antes de pedir review para outros:

```bash
# 1. Deixe o código "descansar" 1 dia
# 2. Revise você mesmo com fresh eyes

# Checklist rápido:
□ Rode todos os testes
□ Rode linter (clippy, eslint, etc)
□ Leia diff no PR (linha por linha)
□ Teste manualmente os fluxos principais
```

---

## 📊 Métricas

### Qualidade do Code Review
| Métrica | Boa | Ruim |
|---------|-----|------|
| Tempo médio | 200-400 linhas/hora | <100 (muito lento) ou >500 (superficial) |
| Comentários úteis | 80%+ | <50% |
| Bugs encontrados | Antes de produção | Depois de merge |

---

**Relacionado:** [feedback-loop.md](feedback-loop.md) - Ciclo de feedback geral
**Relacionado:** [feynman.md](feynman.md) - Para explicar suas escolhas
