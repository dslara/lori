# Símbolos Essenciais

> Dominar a leitura e escrita de símbolos matemáticos para análise de algoritmos

---

**Caminho**: `projects/M1-math-foundations/projects/symbols-essentials/`

---

## 🎯 Objetivo

Ao concluir este projeto, você será capaz de:

- [ ] Ler qualquer símbolo matemático comum em análise de algoritmos
- [ ] Traduzir entre português e notação matemática
- [ ] Converter notação matemática em código
- [ ] Entender análises de complexidade escritas em notação formal

**Tempo estimado**: 2-3 horas (pode ser dividido em múltiplas sessões)

---

## 📋 Pré-requisitos

- Nenhum (este é um projeto introdutório)

---

## 📁 Estrutura

```
symbols-essentials/
├── README.md                    # Este arquivo
├── reference/
│   └── symbols-cheatsheet.md    # Consulta rápida (45 símbolos)
├── practice/
│   └── symbols-drill.md         # 35 exercícios de tradução
└── srs/
    └── symbols-cards.md         # 45 flashcards para Anki/Mochi
```

---

## 🚀 Como Trabalhar Este Projeto

### Passo 1: Leitura Inicial (10 min)

```bash
# Abra o cheatsheet e leia uma vez
cat projects/M1-math-foundations/projects/symbols-essentials/reference/symbols-cheatsheet.md
```

**Não tente memorizar** — apenas familiarize-se com os símbolos.

---

### Passo 2: Primeiro Drill (30 min)

```bash
# Abra o drill e resolva SEM CONSULTA
cat projects/M1-math-foundations/projects/symbols-essentials/practice/symbols-drill.md
```

**Regras**:
- ✅ Anote suas respostas em um papel/editor
- ✅ Marque o que errou ou hesitou
- ❌ NÃO consulte o cheatsheet durante o drill

**Após completar**:
- Verifique as respostas (estão nos `<details>`)
- Anote os números que errou

---

### Passo 3: Gerar Flashcards com SRS Generator (5 min)

```bash
# Use a keyword #srs-generator para criar cards dinamicamente
# Opção 1: Modo batch (cria múltiplos cards de uma vez)
#srs-generator batch

# Opção 2: Modo individual (cria um card por vez)
#srs-generator
```

**O que acontece**:
- O agente detecta o contexto (M1-math-foundations, Semana 5)
- Sugere conceitos-chave: ∀, ∃, Σ, ∈, ⊂, ∩, ∪
- Você escolhe quais cards criar
- Cards são adicionados ao SRS automaticamente

**Verificar cards criados**:
```bash
make review
# Escolha: 1 (Ver cards para hoje)
```

---

### Passo 4: Revisão SRS (diário, 5-10 min)

**Rotina diária até 100% de recall**:
```bash
make review
# Escolha: 2 (Sessão de revisão)
```

**Sistema SM-2**:
- Nota 0-5 para cada card
- Intervalos automáticos (1d → 3d → 7d → ...)
- Cards difíceis aparecem mais frequentemente

**Meta**: Acertar todos os cards por 3 dias consecutivos

---

### Passo 5: Segundo Drill (20 min)

**Após 2-3 dias de revisão SRS**:
```bash
# Refaça o drill SEM CONSULTA
cat projects/M1-math-foundations/projects/symbols-essentials/practice/symbols-drill.md
```

**Critério de sucesso**: 100% de acerto

---

### Passo 6: Validação Feynman (10 min)

```bash
# Use o modo Feynman para validar compreensão
make study
# Escolha: 3 (Feynman)
# Conceito: símbolos matemáticos
```

**Você deve conseguir explicar**:
- O que ∀ significa e dar um exemplo
- A diferença entre ∀∃ e ∃∀
- Como traduzir Σ para código

---

## ✅ Critérios de Conclusão

Você completou este projeto quando:

- [ ] Fez o drill 2x e acertou 100% na segunda
- [ ] Importou os flashcards para SRS
- [ ] Consegue explicar ∀, ∃, Σ, ∈, ⊂ sem hesitar
- [ ] Consegue ler uma análise de algoritmo com símbolos
- [ ] Passou no Feynman

---

## 📊 Progresso

| Etapa | Status | Data |
|-------|--------|------|
| Leitura inicial | ⬜ | |
| Primeiro drill | ⬜ | |
| Gerar Flashcards SRS | ⬜ | |
| Revisão 3 dias | ⬜ | |
| Segundo drill | ⬜ | |
| Feynman | ⬜ | |

**Ver estatísticas SRS**:
```bash
make review
# Escolha: 4 (Estatísticas)
```

---

## 🔗 Próximos Passos

Após concluir este projeto:

1. **Continue M1 Semana 5** → Combinatória & Probabilidade
2. **Pratique com código real** → Leia análises de algoritmos
3. **Crie mais projetos** → `logic-drills`, `sets-practice`

---

## 📚 Recursos Relacionados

- **Rosen Cap 1** — Lógica e quantificadores
- **Rosen Cap 2** — Conjuntos
- **Khan Academy** — Algebra (seções de lógica)
- `meta/resources.md` — Lista completa de recursos

---

## 💡 Dicas

- **Errou algo?** → Adicione ao SRS imediatamente
- **Travado?** → Use `#zombie` para destravar
- **Quer aprofundar?** → Use `#intuition` em um símbolo específico

---

*Tempo total estimado: 2-3h (distribuídas em 1 semana com SRS)*
