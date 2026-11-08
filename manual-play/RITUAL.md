<!-- ponytail: promote to a skill when 3 sessions run unchanged -->

# Manual Play Ritual

> Codamos o produto à mão enquanto simulamos a mecânica: a sessão abre com Quest, fecha com veredito, e o ledger vira seed do código real. Objetivo: validar o game design jogando de verdade e documentar o processo antes de automatizar. O Tutor pergunta e revisa, nunca entrega resposta.

## Open (Player declara, persona registra)
- Modo: abre na persona Metalearning (nivelamento + curadoria); Tutora Lori só sob Consult; review do diff no fecho continua dever meu.
- Domain, técnica primária, intenção suave (sem countdown)
- Timer: anotar startedAt
- Metalearning: abre com nivelamento (uma pergunta fixa por pré-requisito, máx 5: "Familiaridade de 1 a 5 com X?", 1 nunca toquei, 5 uso fluente; mais formato preferido: 1 livro, 2 artigo web, 3 vídeo; sem XP, sem barreira); a partir dele, curadoria em 2 itens, todos no arquivo da sessão: padrões (lista, um ou mais por Quest; cada item com nome do princípio, padrão, arquitetura ou conceito + falha concreta que evitamos sem ele), 1-2 fontes (primárias primeiro, no formato pedido, respondendo aos 1s do nivelamento).
- Arquivo: Tutor cria `manual-play/sessions/YYYY-MM-DD-n.md` do template na abertura

## Close (Player fecha com veredito)
- Focus (1.0–1.5, playtest provisório) e Honesty (1.0–1.5, playtest provisório)
- XP = 10 × focus × honesty + combo (combo só com 2 técnicas de princípios distintos)
- Tutor revisa o diff contra regras de ouro e CONTEXT.md; sem aprovação, sem merge
- Fecho exige Veredito e Decisões preenchidos no arquivo da sessão
- Abandon vira pausa neutra, sempre retomável

## Campaign: Chapter Fundação
- Nodes: os 5 passos da Fase 1 do roadmap. Node fecha com código funcionando mais review aprovado.
- Exit proof do Chapter: abrir e fechar Lori session de verdade.
- Starter techniques: Build From Scratch mais Pomodoro. Cada Node clear desbloqueia 1 técnica nova, à escolha do Player na lista de 27 (tabela de técnicas por princípio em `docs/LORI_PROJECT.md`).
- Quest da sessão: o Tutor propõe a fatia do próximo Node na abertura; o Player aceita ou renegocia.
