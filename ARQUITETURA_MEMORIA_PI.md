# Arquitetura de Memoria: Pi SessionManager vs OpenViking

> Explicacao honesta do que Pi nativo substitui, o que nao substitui, e estrategias.

---

## 1. O que e SessionManager do Pi

O Pi armazena **toda conversa** em arquivo JSONL (`~/.pi/agent/sessions/...`). Cada linha e um `entry`. Entries formam **arvore** (com `id`/`parentId`), permitindo branching nativo via `/tree`.

### Tipos de Entry relevantes

| Entry | Participa do LLM? | Uso |
|-------|-------------------|-----|
| `message` (user, assistant, toolResult) | Sim | Conversa normal |
| `custom` | **Nao** | Estado da extension (`appendEntry()`). Persiste entre reloads. Nao vai pro contexto. |
| `custom_message` | **Sim** | Injecao de contexto pela extension. Vai pro LLM. |
| `compaction` | Sim (como summary) | Resumo de contexto antigo |
| `branch_summary` | Sim (como summary) | Contexto de branch abandonada |
| `label` | Nao | Bookmark em entry |

### API principal

```typescript
// Persistir estado (NAO participa do contexto LLM)
pi.appendEntry("ul-state", { streak: 7, module: "rust-async" });

// Injeta mensagem no contexto LLM
pi.appendCustomMessageEntry("ul-context", "Streak atual: 7", false);

// Navegar arvore
ctx.sessionManager.getBranch();        // entries do root ate leaf
ctx.sessionManager.getEntries();       // todas entries
ctx.sessionManager.getLabel(id);       // bookmark
ctx.sessionManager.buildSessionContext(); // mensagens que vao pro LLM
```

---

## 2. O que OpenViking fazia (e o que Pi nao tem)

| Funcao OpenViking | O que era | Pi tem equivalente? |
|-------------------|-----------|---------------------|
| `memcommit()` | Salvar memoria qualitativa | `appendEntry()` + `appendCustomMessageEntry()` |
| `memread(uri, level)` | Ler memoria por URI | `sessionManager.getEntry()` (por ID) ou ler arquivo |
| `memsearch(query)` | **Busca semantica** por similaridade de embedding | **Nao tem** |
| `membrowse(uri)` | Listar memoria em URI | `sessionManager.getEntries()` + filtro por `customType` |
| `resource.add(url)` | Indexar repositorio/URL para busca | **Nao tem** |
| `resource.find(query)` | Busca semantica em resource indexado | **Nao tem** |
| `resource.write` | Publicar artefato | `write` tool nativo + `appendEntry()` |

### Conclusao importante

**Pi SessionManager nao e vector database.** Nao calcula embeddings. Nao faz busca por similaridade coseno. Nao indexa repositorios externos.

O que Pi substitui: **persistencia estruturada de estado + injecao seletiva de contexto**.
O que Pi **nao** substitui: **busca semantica**.

---

## 3. Mapeamento: OpenViking -> Pi

### 3.1 Preferencias do usuario

**Antes (OpenViking):**
```
memcommit("viking://user/default/memories/preferences/", { style: "visual" })
memread("viking://user/default/memories/preferences/", "overview")
```

**Depois (Pi nativo):**
```typescript
// Salvar
pi.appendEntry("ul-preferences", { style: "visual", created: Date.now() });

// Recuperar (em session_start)
const prefs = ctx.sessionManager.getBranch()
  .filter(e => e.type === "custom" && e.customType === "ul-preferences")
  .pop()?.data;

// Ou: salvar em JSON e ler com tool
await write("data/preferences.json", JSON.stringify({ style: "visual" }));
```

**Veredito:** Substitui perfeitamente. Preferencias sao poucos KB.

---

### 3.2 Entidades/Conceitos aprendidos

**Antes (OpenViking):**
```
memcommit("viking://user/default/memories/entities/recursao", { ... })
memsearch("recursao", limit=5)
```

**Depois (Pi nativo) — 3 estrategias:**

**A. Arquivo JSONL/CSV local + busca exata:**
```typescript
// data/concepts.jsonl
{ "id": "recursao", "tags": ["algoritmos", "dividir-conquistar"], "summary": "...", "date": "2026-04-10" }

// Busca: filtra por tag ou substring
const concepts = await readJSONL("data/concepts.jsonl");
const matches = concepts.filter(c => 
  c.tags.includes(tag) || c.id.includes(query)
);
```

**B. CustomEntry na session:**
```typescript
// Ao aprender conceito
pi.appendEntry("ul-concept", { 
  concept: "recursao", 
  tags: ["algoritmos"],
  summary: "Funcao que chama a si mesma...",
  sessionId: ctx.sessionManager.getSessionId()
});

// Recuperar todas entidades
const concepts = ctx.sessionManager.getEntries()
  .filter(e => e.type === "custom" && e.customType === "ul-concept")
  .map(e => e.data);
```

**C. Arquivos markdown no projeto:**
```
projects/rust-async/concepts/recursao.md
projects/rust-async/concepts/ownership.md
```

**Veredito:** Funciona bem para dezenas/centenas de conceitos. Nao escala para milhares sem busca semantica.

---

### 3.3 Casos/Padroes do tutor

**Antes (OpenViking):**
```
memcommit("viking://agent/{id}/memories/cases/", { problem: "bug X", solution: "..." })
memsearch("bug semelhante", target="viking://agent/{id}/memories/cases/")
```

**Depois (Pi nativo):**

**Problema:** Casos sao textos longos. Busca por substring nao encontra "bug em borrow checker" quando o caso fala de "lifetime invalidation".

**Solucao hibrida recomendada:**
```typescript
// Extension calcula keywords e salva em JSON
interface Case {
  id: string;
  problem: string;
  solution: string;
  keywords: string[];        // Extraido pelo LLM no momento da criacao
  relatedConcepts: string[]; // Tags manual ou LLM
  date: string;
}

// Salvar
pi.appendEntry("ul-case", case);

// Busca: combina substring + keywords + concepts
function findCases(query: string, cases: Case[]): Case[] {
  const q = query.toLowerCase();
  return cases.filter(c => 
    c.problem.toLowerCase().includes(q) ||
    c.keywords.some(k => k.includes(q)) ||
    c.relatedConcepts.some(r => r.includes(q))
  );
}
```

**Veredito:** Funciona para dezenas de casos. Para centenas, precisa de busca semantica real.

---

### 3.4 Recursos indexados (GitHub, docs)

**Antes (OpenViking):**
```
resource.add("https://github.com/rust-lang/book")
resource.find("ownership", target="viking://resources/ultralearning/")
```

**Depois (Pi nativo):**

**Realidade:** Pi nao indexa repositorios externos. Alternativas:

1. **Clonar localmente e usar `read` nativo:**
   ```bash
   git clone https://github.com/rust-lang/book projects/resources/rust-book
   # Depois: @rust-book/src/ownership.md no editor, ou read tool
   ```

2. **Curadoria manual:** Salvar trechos relevantes em `docs/resources/` como markdown.

3. **LLM como retriever (mais caro, zero infra):**
   ```typescript
   // Extension tool que usa LLM para buscar em texto grande
   async function semanticFind(query: string, docs: string[]) {
     // Divide docs em chunks
     // Para cada chunk, pergunta ao LLM: "Este texto fala sobre {query}? Responda SIM ou NAO e justifique."
     // Retorna chunks relevantes
   }
   ```

**Veredito:** Para CS fundamentals, curadoria manual e mais efetiva que indexacao automatica. Recursos de alta qualidade sao poucos.

---

## 4. Estrategias para "Busca Semantica" sem OpenViking

### Estrategia A: Estruturacao rigida + busca exata (recomendada para MVP)

**Principio:** Nao busque. Organize.

```
data/
├── sessions.csv          # Ja buscavel por data, modulo
├── flashcards.csv        # Ja buscavel por next_review
├── modules.csv           # Ja buscavel por status
├── concepts.jsonl        # Cada linha: { id, tags[], summary, date }
└── cases.jsonl           # Cada linha: { id, keywords[], concepts[], problem, solution }
```

**Busca e trivial:**
```typescript
// Buscar conceito por tag
const concepts = readJSONL("data/concepts.jsonl")
  .filter(c => c.tags.includes("recursao"));

// Buscar caso por keyword
const cases = readJSONL("data/cases.jsonl")
  .filter(c => c.keywords.includes("borrow-checker"));
```

**Vantagem:** Zero dependencias. Instantaneo. Deterministico.
**Desvantagem:** Nao encontra conceitos relacionados semanticamente (ex: "closure" vs "lambda").

---

### Estrategia B: LLM como Retriever (sem infra extra)

**Principio:** Use o proprio LLM para classificar e rankear.

```typescript
// Tool: dado um query e N candidatos, pergunte ao LLM qual e relevante
async function llmRetrieve(query: string, candidates: Concept[]) {
  const prompt = `Dado a consulta "${query}", quais destes conceitos sao relevantes?
${candidates.map((c, i) => `${i}: ${c.summary}`).join("\n")}

Responda apenas os indices relevantes, um por linha.`;

  const result = await llmCall(prompt);
  const indices = result.split("\n").map(Number);
  return indices.map(i => candidates[i]);
}
```

**Vantagem:** Captura semantica. Zero infra.
**Desvantagem:** Custa tokens. Lento para muitos candidatos.
**Uso ideal:** Pool de 10-20 candidatos pre-filtrados por tags.

---

### Estrategia C: Embedding Local com Ollama (volta o container, mas so 1)

**Principio:** Container Ollama so para embeddings, nao para LLM principal.

```typescript
// Extension roda Ollama local com mxbai-embed-large
async function embed(text: string): Promise<number[]> {
  const res = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    body: JSON.stringify({ model: "mxbai-embed-large", prompt: text })
  });
  return res.json().embedding;
}

// Indexar conceitos
for (const c of concepts) {
  c.embedding = await embed(c.summary);
}

// Busca por similaridade
function cosineSimilarity(a: number[], b: number[]): number { ... }

function semanticSearch(query: string, concepts: Concept[]) {
  const q = await embed(query);
  return concepts
    .map(c => ({ ...c, score: cosineSimilarity(q, c.embedding!) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
```

**Vantagem:** Busca semantica real. Privado. Gratuito.
**Desvantagem:** Requer container Ollama (1GB+). Primeira carga lenta.
**Recomendacao:** So ativar quando conceitos > 100.

---

### Estrategia D: Arquitetura Hibrida (recomendada para V2)

**Combinacao:**
- **CSV** = sessoes, streak, flashcards (dados tabulares)
- **JSONL** = conceitos e casos com tags/keywords (dados estruturados)
- **SessionManager CustomEntry** = estado temporario da sessao atual, checkpoints
- **Ollama (opcional)** = embeddings quando necessario, via extension que detecta quando ativar

```
Fluxo de busca:
1. Usuario pergunta sobre "recursao"
2. Busca exata em JSONL por id="recursao" ou tags.includes("recursao")
3. Se nao encontrar, busca substring em summaries
4. Se ainda nao encontrar E Ollama disponivel, busca semantica
5. Se Ollama indisponivel, pergunta ao LLM para classificar entre os N conceitos existentes
```

---

## 5. Como Pi SessionManager melhora o que OpenViking fazia

### 5.1 Branching de tentativas

**Cenario:** Aluno tenta resolver exercicio de recursao. Erra. Quer tentar abordagem diferente sem perder a primeira.

**OpenViking:** Nao tinha branching. Nova tentativa = novo caso salvo.

**Pi nativo:** `/tree` + fork. Cada tentativa e um branch na mesma sessao. `BranchSummaryEntry` preserva contexto da tentativa anterior.

```
[exercicio recursao] -- [tentativa A: for-loop] -- [errado]
                \
                 -- [tentativa B: recursao pura] -- [correto]
```

### 5.2 Compaction inteligente

**Cenario:** Sessao de 3h. Contexto explode.

**OpenViking:** Sem gerenciamento de contexto. Memoria cresce indefinidamente.

**Pi nativo:** `session_before_compact` customizado. Extension intercepta e gera resumo mantendo:
- Pontos fracos identificados
- Recursos descobertos
- Decisoes de arquitetura
- Proximos passos

```typescript
pi.on("session_before_compact", async (event, ctx) => {
  const { preparation } = event;
  
  // Resumo customizado para contexto de estudo
  const summary = `
## Sessao de Estudo: ${currentModule}
### Conceitos trabalhados
- ${concepts.join("\n- ")}
### Pontos fracos
- ${weaknesses.join("\n- ")}
### Recursos descobertos
- ${resources.join("\n- ")}
### Proximo foco
${nextFocus}
`;

  return {
    compaction: {
      summary,
      firstKeptEntryId: preparation.firstKeptEntryId,
      tokensBefore: preparation.tokensBefore,
      details: { studySession: true, module: currentModule }
    }
  };
});
```

### 5.3 Contexto automatico

**Cenario:** Iniciar sessao de estudo.

**OpenViking:** Tool `context-hybrid` chamada manualmente por command `/ul-study-start`.

**Pi nativo:** `before_agent_start` detecta automaticamente:
```typescript
pi.on("before_agent_start", async (event, ctx) => {
  const text = event.prompt.toLowerCase();
  const isStudy = ["/ul-", "estudar", "drill", "feynman", "quiz", "exercicio"]
    .some(k => text.includes(k));
  
  if (!isStudy) return;

  // Injeta contexto automaticamente
  const context = buildStudyContext(); // le CSV, monta resumo
  return {
    message: {
      customType: "ul-context",
      content: context,
      display: false  // Nao mostra no TUI, mas vai pro LLM
    }
  };
});
```

### 5.4 Labels e checkpoints

**Cenario:** Marcar ponto importante na sessao (ex: "entendi ownership!").

**OpenViking:** `memcommit()` com URI.

**Pi nativo:** `pi.setLabel()`.
```typescript
pi.setLabel(entryId, "entendi-ownership");

// Depois, navegar ate este ponto:
// /tree mostra o label "entendi-ownership"
```

---

## 6. Decisao de arquitetura recomendada

### Para MVP (agora)

| Dado | Onde | Como buscar |
|------|------|-------------|
| Sessoes, streak, flashcards | `data/*.csv` | Busca tabular (filtro por data, modulo, next_review) |
| Conceitos | `data/concepts.jsonl` | Tags + substring (busca exata) |
| Casos | `data/cases.jsonl` | Keywords + substring |
| Preferencias | `data/preferences.json` | Leitura direta |
| Estado da sessao | `appendEntry("ul-state")` | Reconstrucao em `session_start` |
| Contexto LLM | `appendCustomMessageEntry()` | Automatico via `before_agent_start` |

**Sem containers. Sem embeddings. Sem busca semantica.**

### Para V2 (quando conceitos > 100)

Adicionar **Estrategia C** como extension opcional:
- Detecta se `concepts.jsonl` > 100 entries
- Pergunta se usuario quer ativar embeddings locais
- Se sim, sobe Ollama com mxbai-embed-large (container leve, so embeddings)
- Cache de embeddings em `data/embeddings.jsonl`

### Para V3 (quando recursos externos sao necessarios)

Adicionar **Estrategia B** (LLM como retriever):
- Salvar recursos curados em `docs/resources/`
- Tool `ul_resource_search` que chunka docs e pergunta ao LLM sobre relevancia

---

## 7. Codigo exemplo: Extension completa de memoria

```typescript
// .pi/extensions/ultralearning/memory.ts
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

interface Concept {
  id: string;
  summary: string;
  tags: string[];
  date: string;
  weak: boolean;
}

export class ULMemory {
  private concepts: Concept[] = [];
  private dataDir: string;

  constructor(private pi: ExtensionAPI, private ctx: ExtensionContext) {
    this.dataDir = join(ctx.cwd, "data");
    this.load();
  }

  private load() {
    const path = join(this.dataDir, "concepts.jsonl");
    if (!existsSync(path)) return;
    
    const lines = readFileSync(path, "utf8").trim().split("\n");
    this.concepts = lines.map(l => JSON.parse(l));
  }

  private save() {
    const path = join(this.dataDir, "concepts.jsonl");
    const data = this.concepts.map(c => JSON.stringify(c)).join("\n");
    writeFileSync(path, data + "\n");
  }

  addConcept(c: Omit<Concept, "date">) {
    const concept = { ...c, date: new Date().toISOString() };
    this.concepts.push(concept);
    this.save();
    
    // Tambem persiste no sessionManager para reconstrucao rapida
    this.pi.appendEntry("ul-concept", concept);
  }

  search(query: string): Concept[] {
    const q = query.toLowerCase();
    return this.concepts.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q)) ||
      c.summary.toLowerCase().includes(q)
    );
  }

  getWeakConcepts(): Concept[] {
    return this.concepts.filter(c => c.weak);
  }

  // Reconstroi de sessionManager entries (mais rapido que ler arquivo)
  reconstructFromSession() {
    const entries = this.ctx.sessionManager.getEntries()
      .filter(e => e.type === "custom" && e.customType === "ul-concept")
      .map(e => e.data as Concept);
    
    // Merge com arquivo (arquivo = fonte de verdade)
    const seen = new Set(this.concepts.map(c => c.id));
    for (const e of entries) {
      if (!seen.has(e.id)) this.concepts.push(e);
    }
  }
}
```

---

## 8. Resumo honesto

| Pergunta | Resposta |
|----------|----------|
| Pi substitui OpenViking? | **Parcialmente.** Substitui persistencia, injecao de contexto, branching, compaction. **Nao** substitui busca semantica. |
| Preciso de vector DB? | **Nao para MVP.** Estruturacao rigida + tags resolve 90% dos casos de ultralearning. |
| Quando preciso de embeddings? | Quando conceitos/cases > 100, ou quando busca exata falha consistentemente. |
| Qual o custo de nao ter busca semantica? | Aluno precisa usar tags/keywords consistentes. LLM ainda recebe contexto relevante via injecao manual. |
| Pi e melhor que OpenViking para este caso? | **Sim.** Menos infra, state nativo, branching, compaction customizado, UI integrada. A perda de busca semantica e aceitavel para escala de estudo individual. |

---

*Documento para referencia de arquitetura. Atualizar se estrategia de embeddings for adotada.*
