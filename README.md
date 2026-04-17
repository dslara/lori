# Lori

> Sistema de aprendizado autodirigido para qualquer domínio. CS, música, ilustração, idiomas — tudo no terminal. Construído como Pi Package nativo.

Baseado nos princípios de Ultralearning (Scott Young).

**Instalação:**
```bash
pi install git:github.com/dslara/lori
```

---

## Visão

O estudante não "usa" um sistema. O Pi **é** o ambiente de aprendizado. Cada sessão de estudo acontece dentro de uma sessão Pi normal. O aluno conversa, escreve, pratica, lê — tudo no mesmo terminal. Sem context switching. Sem dashboards web. Sem containers.

**O que o Pi sabe sobre você:**
- Que módulo está estudando agora
- Que conceitos erra com frequência
- Quanto tempo focou ontem
- Qual técnica de aprendizado funcionou melhor

Tudo isso vive no **contexto da conversa**, não em bancos separados.

---

## Quick Start

```bash
# Iniciar sessão de estudo
/lori-start

# Durante a sessão, escolha técnica:
/skill:lori-drill        # Repetição deliberada
/skill:lori-feynman      # Validar compreensão
/skill:lori-directness   # Projeto real

# Finalizar sessão
/lori-end

# Retrospectiva semanal (domingo)
/lori-retro
```

**Guia completo**: [HOW_TO_USE.md](HOW_TO_USE.md)  
**Arquitetura detalhada**: [ARQUITETURA_FINAL.md](ARQUITETURA_FINAL.md)

---

## Skills (9 Rituais de Aprendizado)

| Skill | Quando usar |
|-------|-------------|
| **lori-pomodoro** | Antes de qualquer técnica — timer 50/10, proteção de interrupções |
| **lori-decomposition** | Iniciar novo tópico — quebrar objetivo em semanas |
| **lori-retrieval** | Warm-up ou revisão — quiz adaptativo baseado em erros |
| **lori-feynman** | Quando achar que "entendeu" — explicar para criança de 5 anos |
| **lori-drill** | Praticar procedimentos — erro → análise → repetição |
| **lori-directness** | Consolidar conhecimento — projeto real, review socrático |
| **lori-srs** | Memorizar fatos — flashcards SM-2 |
| **lori-stuck** | Quando travar — 5 perguntas socráticas genéricas |
| **lori-retro** | Todo domingo — retrospectiva semanal com ajustes |

Invoque com `/skill:lori-feynman` ou deixe o Pi sugerir automaticamente.

---

## Arquitetura

| Aspecto | Antes | Agora |
|---------|-------|-------|
| **Distribuição** | Clone git + Docker + setup manual | `pi install` como Pi Package |
| **Infra** | Docker (Ollama + OpenViking) | Zero containers. Zero bancos. |
| **Dados** | CSVs + memória vetorial externa | Event sourcing nativo (`appendEntry` + `state.jsonl`) |
| **Contexto** | Tool chamada manual | Injeção automática via `before_agent_start` |
| **Interface** | Commands markdown + texto puro | Widgets TUI, timer integrado, status bar |

**Princípios:**
- Event sourcing — estado = sequência de eventos append-only
- Contexto sobre consulta — LLM recebe estado diretamente via `custom_message`
- Skills como rituais completos, não commands soltos
- Honestidade forçada — pós-sessão sempre pergunta "o que ficou confuso?"

---

## Estrutura

```
.pi/
  extensions/lori/             # Extension TypeScript (cérebro do sistema)
  skills/                      # 9 skills com ritual completo
  prompts/                     # Templates pré/pós-sessão

.lori/                         # Dados do usuário
  state.jsonl                  # Eventos append-only
  modules/{nome}/              # Planos, retros, conceitos, drills
  resources/                   # Materiais curados
  flashcards/{modulo}.jsonl    # SRS com SM-2
```

---

## Commands

| Command | Ação |
|---------|------|
| `/lori-start` | Inicia ciclo de estudo + ritual pré-sessão |
| `/lori-end` | Finaliza ciclo + ritual pós-sessão |
| `/lori-timer [start\|stop\|status]` | Pomodoro integrado no TUI |
| `/lori-plan` | Mostra plano da semana e progresso |
| `/lori-retro` | Guia retrospectiva interativa |
| `/lori-weak` | Lista pontos fracos ativos |
| `/lori-resources` | Lista recursos curados |
| `/lori-stats` | Analytics derivados dos eventos |
| `/lori-review-srs` | Flashcards pendentes de revisão |

---

## Para Desenvolvedores

Quer entender ou estender o sistema? Leia [ARQUITETURA_FINAL.md](ARQUITETURA_FINAL.md). Contém:
- Eventos Pi interceptados (session_start, before_agent_start, etc.)
- Estrutura completa de eventos
- Fluxos de uso (novo módulo, sessão diária, travou, retrospectiva)
- Prompt executável para regenerar o sistema do zero

---

*Terminal é a sala de aula.*
