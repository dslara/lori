# Pendências da Auditoria — v1.0.0 (2026-03-02)

**Tipo**: audit-pendencias  
**Gerado por**: @review  
**Origem**: `audit-complete-2026-03-02-v7.0.0.md`

---

## Pendências Abertas (6)

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

### P4 — Numeração de weeks/retros pode sobrescrever arquivos
- **Impacto**: cálculo por contagem pode gerar duplicações.
- **Arquivos**: `scripts/plan.sh`, `scripts/retro.sh`
- **Ação**: usar maior índice existente + 1.

### P5 — Dedupe frágil no master deck
- **Impacto**: deduplicação só pelo front elimina cards distintos.
- **Arquivo**: `scripts/sync-flashcards.sh`
- **Ação**: dedupe por chave composta (front+back+module) e recriar master do zero.

### P6 — Inconsistência @review hidden (docs x config)
- **Impacto**: README afirma `hidden`, config não.
- **Arquivos**: `README.md`, `.opencode/opencode.json`
- **Ação**: alinhar (adicionar `hidden: true` ou remover do README).

---

## Observações

- Este documento consolida **apenas pendências** ativas da auditoria v7.0.0.
- Quando todas as ações forem concluídas, este arquivo pode ser arquivado.
