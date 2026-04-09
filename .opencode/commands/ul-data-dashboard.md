---
description: Ver dashboard completo com métricas (/ul-data-dashboard)
agent: tutor
model: opencode-go/minimax-m2.5
---

## Descrição

Exibe dashboard completo com todas as métricas de aprendizado: streak, sessões, técnicas mais efetivas, padrões de estudo e pontos fracos identificados.

## Uso
/ul-data-dashboard

Gere um dashboard abrangente mostrando todas as métricas de aprendizado usando a ferramenta 'dashboard' com a operação 'show'.

Exiba:
- **Resumo**: Streak, melhor streak, total de sessões, tempo de estudo semanal
- **Efetividade**: Técnica mais efetiva, técnica menos usada
- **Padrões**: Melhor período para estudar, duração ideal de sessão
- **Pontos Fracos**: Tópicos com taxa de erro > 0.3 e técnicas sugeridas

Se o usuário quiser comparar períodos, use a operação 'compare' com o período apropriado (semana ou mês).

Apresente as informações em um formato visualmente atraente com emojis e seções claras.

Inclua recomendações baseadas nos dados:
- Se encontrar pontos fracos, sugira atacá-los primeiro
- Se identificar o melhor período, sugira agendar sessões difíceis nesse horário
- Se encontrar duração ideal, sugira otimizar o tamanho da sessão

## Integrações

**Tools utilizadas:**
- `insights.showDashboard` — Gera dashboard visual consolidado
- `insights.comparePeriods` — Compara com período anterior (se solicitado)

**Processo:**
1. Invocar `insights.showDashboard` para obter métricas consolidadas
2. Formatar output com emojis e seções visuais
3. Se usuário pedir comparação, invocar `insights.comparePeriods`

---

**Uso:**
- `/ul-data-dashboard` - Mostra dashboard da semana atual
- `/ul-data-dashboard month` - Mostra dashboard mensal (se suportado)
