# Lori

Aprende qualquer coisa no terminal. Baseado no Ultralearning do Scott Young.

```bash
pi install git:github.com/dslara/lori
```

---

## O que é

Você estuda sem sair do terminal. Conversa com o Pi, escreve código, revisa conceitos, faz projetos — tudo no mesmo lugar. O sistema lembra o que você está estudando, onde costuma errar e quanto tempo focou. Não tem dashboard web, não tem container, não tem banco de dados. É só você, o terminal e uns arquivos locais.

---

## Como começar

```bash
/lori-start rust-foundations drill   # começa sessão de estudo
/lori-end 8 true                     # termina, nota 8 de foco, honesto
/lori-timer start 50                 # pomodoro de 50 min
```

O Pi sugere sozinho a técnica certa no momento certo. Mas você pode forçar quando quiser:

```bash
/skill:lori-feynman     # explica como se fosse pra um amigo
/skill:lori-drill       # treina até não errar mais
/skill:lori-stuck       # travou? 5 perguntas pra desatar
```

---

## Os 9 rituais

| Skill | Pra quê |
|-------|---------|
| **lori-pomodoro** | Focar sem ser interrompido. Timer 50/10. |
| **lori-decomposition** | Começar algo novo. Quebra em partes pequenas. |
| **lori-retrieval** | Revisar. Quiz que pega no seu calo. |
| **lori-feynman** | Achar buraco no seu entendimento. Explica em voz alta. |
| **lori-drill** | Treinar procedimento. Errou → analisa → repete. |
| **lori-directness** | Usar de verdade. Projeto real, não exercício de livro. |
| **lori-srs** | Memorizar. Flashcards com algoritmo SM-2. |
| **lori-stuck** | Travou. 5 perguntas que te tiram do atoleiro. |
| **lori-retro** | Todo domingo. O que funcionou, o que não, o que muda. |

---

## Commands

| Command | O que faz |
|---------|-----------|
| `/lori-start [modulo] [tecnica]` | Inicia sessão: pré-sessão → foco → pós-sessão |
| `/lori-end [foco 0-10] [honesto]` | Termina e pergunta: "o que ficou confuso?" |
| `/lori-timer start\|stop\|status [min]` | Pomodoro com notificação no TUI quando acaba |
| `/lori-plan [modulo]` | Cria ou mostra o plano do módulo |
| `/lori-decomposition [modulo]` | Decompõe o tópico em conceitos, fatos, procedimentos |
| `/lori-retro` | Gera artefatos da retrospectiva semanal |
| `/lori-review-srs` | Revisa só os flashcards que estão devendo |
| `/lori-weak` | Mostra seus pontos fracos ativos |
| `/lori-resources` | Lista recursos do módulo atual |
| `/lori-stats` | Streak, horas totais, weaknesses, SRS, taxa de honestidade |

---

## Como funciona por baixo

- **Sem banco de dados.** O estado é uma lista de eventos em `.lori/state.jsonl`. Append-only. Reconstrói tudo lendo do começo ao fim.
- **Sem containers.** Zero Docker. É uma extension TypeScript do Pi.
- **Contexto automático.** Antes de cada turno o Pi recebe seu estado atual — módulos ativos, weaknesses, streak, tempo de hoje.
- **Timer vivo.** Se o pomodoro acaba enquanto você conversa, o TUI avisa sozinho.

```
.pi/
  extensions/lori/     # extension TypeScript
  skills/              # os 9 rituais
  prompts/             # templates pré/pós-sessão

.lori/
  state.jsonl          # eventos append-only
  modules/{nome}/      # planos, semanas, retros, projetos
  flashcards/          # SRS SM-2
```

---

## Quer entender ou mudar algo?

[ARQUITETURA_FINAL.md](ARQUITETURA_FINAL.md) tem o mapa completo: eventos, fluxos, estrutura da extension.

---

*Sala de aula é aqui.*
