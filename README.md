# Ultralearning sobre Pi

> Sistema de aprendizado autodirigido para qualquer domínio. CS, música, ilustração, idiomas — tudo no terminal. Construído como Pi Package nativo.

**Instalação:**
```bash
pi install git:github.com/dslara/ultralearning
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
/ul-start

# Durante a sessão, escolha técnica:
/skill:ul-drill        # Repetição deliberada
/skill:ul-feynman      # Validar compreensão
/skill:ul-directness   # Projeto real

# Finalizar sessão
/ul-end

# Retrospectiva semanal (domingo)
/ul-retro
```

**Guia completo**: [HOW_TO_USE.md](HOW_TO_USE.md)  
**Arquitetura detalhada**: [ARQUITETURA_FINAL.md](ARQUITETURA_FINAL.md)

---

## Skills (9 Rituais de Aprendizado)

| Skill | Quando usar |
|-------|-------------|
| **ul-pomodoro** | Antes de qualquer técnica — timer 50/10, proteção de interrupções |
| **ul-decomposition** | Iniciar novo tópico — quebrar objetivo em semanas |
| **ul-retrieval** | Warm-up ou revisão — quiz adaptativo baseado em erros |
| **ul-feynman** | Quando achar que "entendeu" — explicar para criança de 5 anos |
| **ul-drill** | Praticar procedimentos — erro → análise → repetição |
| **ul-directness** | Consolidar conhecimento — projeto real, review socrático |
| **ul-srs** | Memorizar fatos — flashcards SM-2 |
| **ul-stuck** | Quando travar — 5 perguntas socráticas genéricas |
| **ul-retro** | Todo domingo — retrospectiva semanal com ajustes |

Invoque com `/skill:ul-feynman` ou deixe o Pi sugerir automaticamente.

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
  extensions/ultralearning/    # Extension TypeScript (cérebro do sistema)
  skills/                      # 9 skills com ritual completo
  prompts/                     # Templates pré/pós-sessão

.ultralearning/                # Dados do usuário
  state.jsonl                  # Eventos append-only
  modules/{nome}/              # Planos, retros, conceitos, drills
  resources/                   # Materiais curados
  flashcards/{modulo}.jsonl    # SRS com SM-2
```

---

## Commands

| Command | Ação |
|---------|------|
| `/ul-start` | Inicia ciclo de estudo + ritual pré-sessão |
| `/ul-end` | Finaliza ciclo + ritual pós-sessão |
| `/ul-timer [start\|stop\|status]` | Pomodoro integrado no TUI |
| `/ul-plan` | Mostra plano da semana e progresso |
| `/ul-retro` | Guia retrospectiva interativa |
| `/ul-weak` | Lista pontos fracos ativos |
| `/ul-resources` | Lista recursos curados |
| `/ul-stats` | Analytics derivados dos eventos |
| `/ul-review-srs` | Flashcards pendentes de revisão |

---

## Para Desenvolvedores

Quer entender ou estender o sistema? Leia [ARQUITETURA_FINAL.md](ARQUITETURA_FINAL.md). Contém:
- Eventos Pi interceptados (session_start, before_agent_start, etc.)
- Estrutura completa de eventos
- Fluxos de uso (novo módulo, sessão diária, travou, retrospectiva)
- Prompt executável para regenerar o sistema do zero

---

*Terminal é a sala de aula.*
