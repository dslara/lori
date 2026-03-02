# Auditoria Completa — v7.0.0 (2026-03-02)

**Tipo**: audit  
**Gerado por**: @review via `#audit-quality`  
**Versão auditada**: 3.1.0  
**Baseline**: `audit-complete-2026-03-02-v6.0.0.md` (9.1/10)

---

## Sumário Executivo

Nova auditoria detecta **inconsistências pontuais** em documentação, scripts críticos e configuração de agentes, apesar do framework permanecer sólido. Os riscos principais são **operacionais** (scripts) e **de onboarding** (docs), com correção rápida.

**Resultado**: 6 dívidas técnicas prioritárias abertas → **nota ajustada: 8.9/10**

---

## Achados Prioritários (P1–P3)

### P1 — Risco de deleção indevida em `archive.sh`
- **Impacto**: `rm -rf` sem validação de path pode apagar conteúdo fora do projeto se `.current-topic` estiver corrompido.
- **Arquivo**: `scripts/archive.sh`
- **Ação**: validar prefixo (`projects/`) antes do `rm -rf`.

### P2 — Dependência `bc` não verificada em SRS
- **Impacto**: falha silenciosa do SRS em ambientes sem `bc`.
- **Arquivo**: `scripts/spaced-repetition.sh`
- **Ação**: checar `bc` no bootstrap de dependências.

### P3 — Documentação de flashcards/SRS desatualizada
- **Impacto**: comandos e caminhos inválidos → onboarding quebrado.
- **Arquivos**: `guides/tecnicas/flashcards.md`, `guides/tecnicas/srs.md`
- **Ação**: atualizar paths (`projects/M1-*`) e comandos (`make review`).

---

## Achados por Área

### 1) Documentação
- **Comandos divergentes**: `make srs-review` (inexistente) vs `make review` (real).
- **Paths legados**: `01-math-foundations` e `sync-script.sh` não existem.
- **Contagens inconsistentes**: Quickstart ainda indica 4 agentes e 24 técnicas.

### 2) Scripts Bash
- **Numeração de semanas/retro**: cálculo por contagem pode sobrescrever arquivos.
- **Pipelines frágeis**: `ls | head | while read` sob `set -euo pipefail`.
- **Dedupe frágil no master deck**: deduplicação apenas pelo front.

### 3) Agentes
- **Inconsistência `hidden` do @review**: README afirma, config não.
- **Ferramentas x permissões**: `webfetch` permitido mas não habilitado; `skill` habilitado no opencode.json mas não no frontmatter.
- **Model routing ausente** em @review/@run.

---

## Roadmap de Correções

### Imediato (hoje)
- [ ] Validar `TOPIC_PATH` antes de `rm -rf` em `archive.sh`
- [ ] Checar dependência `bc` no SRS
- [ ] Corrigir docs de flashcards/SRS (paths e comandos)
- [ ] Resolver divergência `hidden: true` do @review

### Curto Prazo (esta semana)
- [ ] Corrigir numeração de weeks/retros
- [ ] Dedupe robusto no `sync-flashcards.sh`
- [ ] Padronizar mensagens sobre OpenCode
- [ ] Atualizar Quickstart e índice de técnicas

### Médio Prazo
- [ ] Harmonizar tools/permissions nos agentes
- [ ] Adicionar model routing em @review/@run
- [ ] Reduzir duplicação de exemplos no @review

### Estratégico (decisão necessária)
- [ ] Confirmar status real da memória automática (docs vs implementação)
- [ ] Decidir estrutura modular M1–M8

---

## Scorecard Final

| Dimensão | Nota | Observação |
|----------|------|------------|
| Estrutura de pastas | 9/10 | Consistente, sem legado ativo crítico |
| Scripts bash | 8.5/10 | Risco em archive.sh + deps faltantes |
| Documentação | 8.5/10 | Comandos e paths desatualizados |
| Agentes | 8.8/10 | Inconsistências tools/permissions/hidden |
| Consistência | 8.8/10 | Contagens e routing divergentes |
| **Total** | **8.9/10** | Ações rápidas pendentes |

---

## Estado do Framework

- **Versão**: 3.1.0
- **Agentes**: 5 (@meta, @tutor, @review, @session, @run)
- **Skills**: 10
- **Comandos make**: 16
- **Scripts bash**: 19
- **Problemas críticos abertos**: 1 (risco de deleção)

---

*Próxima auditoria recomendada: após correção dos P1–P3 ou ao atingir v3.2.0*
