# Lori — Game Design Spec

> Consolidada dos 7 tickets do mapa de storytelling e mecânicas. Cada seção aponta o ticket de origem, onde mora o detalhe. Decisões, não implementação. Sem números finais de balanceamento.

## Fantasia central e loop core

Origem: [Fantasia central e loop core](https://github.com/dslara/lori/issues/18).

O verbo é Conquistar. Cada Chapter da skill tree é um arco finito com exit proof e clear. Após o clear há sustain suave: cleared Nodes exibem decay visível, upkeep dá bônus, ignorar nunca tira nada. Regime sem malus em tudo: nada subtrai, fazer soma mais.

O retorno é puxado por curiosidade narrativa. Cliffhanger de Chapter como motor principal, a sessão fecha com a próxima cena travada e uma pergunta aberta. Ghost sombra como motor secundário, a sessão passada reaparece como marca a superar.

## Fases e progressão

Origem: [Fases e progressão por domínio](https://github.com/dslara/lori/issues/19). Forma canônica no protótipo [fases-react.md](https://github.com/dslara/lori/blob/prototype/fases-dominio-exemplo/docs/wayfinder/prototypes/fases-react.md).

Chapter contract: Nodes começam locked, exit proof completa dá clear, o clear revela a primeira cena do próximo Chapter travada, o clear dá unlock do próximo Chapter mais 1 técnica e 1 quest narrativa. Granularidade de referência: 4 Chapters por Domain, cada exit proof exige artefato funcionando e reusa o Chapter anterior.

Duração da sessão é intenção suave sem countdown. Timer conta para cima, Pomodoro e timeboxing são rituais opt-in.

## Técnicas como verbos

Origem: [Técnicas como verbos](https://github.com/dslara/lori/issues/21).

Sessão conta para streak e XP sem piso de tempo, desde que fechada com veredito de foco e honestidade. Abandono vira pausa neutra retomável. Cada técnica sobe níveis 1 a 10 com uso, a sessão declara 1 técnica primária, no 10 vira passiva ativável que dispara sem declarar. Combos vivem dentro da sessão: duas técnicas de princípios distintos somam bônus com nome explícito no veredito. Sem combo não há malus, só ausência de bônus.

## Stakes e falha

Origem: [Stakes e falha](https://github.com/dslara/lori/issues/22).

Streak é momentum que congela e retoma do mesmo ponto, com etiqueta de pausa e recorde preservado. Reviews atrasados viram pilha com decay no dashboard, ordenada por idade, com sessão de limpeza. SM-2 intacto, a fila só se mostra. Fraqueza convida por dois canais sem punir: slot fixo no veredito com drill sugerido e cutucada da persona na abertura seguinte.

## Economia de XP e desbloqueios

Origem: [Economia de XP e desbloqueios](https://github.com/dslara/lori/issues/23).

XP base do fechamento com veredito, foco e honestidade como multiplicadores a partir de 1, combo e momentum somados depois. Declarar bem acelera, declarar mal nunca corta. Unlock em pacote fixo por Chapter com ordem desenhada por Domain. Skins todas abertas desde o início, skin é preferência pura.

## Personagens e vozes

Origem: [Personagens e vozes](https://github.com/dslara/lori/issues/20). Roster no protótipo [personagens-vozes.md](https://github.com/dslara/lori/blob/prototype/personagens-vozes/docs/wayfinder/prototypes/personagens-vozes.md).

Player sem avatar, papel da skin é só pronome. 10 vozes separadas: 9 personas standalone por princípio mais a Lori como Tutora. A técnica em uso elege a voz ativa, consultar a Lori é override manual e a voz contextual retoma ao fim. Lori usa método socrático amarrado só à voz dela: nunca entrega resposta direta, então a consulta nunca fura o recall. Consulta sem custo, sem pausar a sessão, com progresso em Elaborative Interrogation.

## Lore por skin

Origem: [Lore por skin](https://github.com/dslara/lori/issues/24).

Core emite eventos tipados com parâmetros, skin mapeia evento para template mais tom, catálogo fixo no core com fallback para Minimal. Matriz de tom travada sem culpa nas 5 skins: sombrio sobre o mundo vale, sobre o player parado nunca. Nomes da Lori travados como exemplo: Minimal Lori, RPG Oráculo, Horror Sussurro, Sci-Fi Nave Mãe, Zen Fonte. Requisito: usuário cria skins próprias ou edita existentes com outros nomes, schema aceita nomes custom com fallback.

## Convenções do esforço

Termos técnicos de game design sempre em inglês, prosa em português. Core nunca conhece nomes de skin. Skin e persona traduzem, nunca mudam regra.

## Fora desta spec

Tutorial e primeira sessão, quests narrativas longas, bosses e checkpoints: nevoeiro para esforço novo. Código, números finais de XP, ASCII art final: execução.
