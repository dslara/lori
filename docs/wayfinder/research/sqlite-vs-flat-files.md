# SQLite contra flat files no Pi (research)

Pergunta do ticket: SQLite ou flat files para a persistência da Fase 1 em extensão Pi.

## Fatos

- O binário Pi 1.5.0 embute Bun 1.4.4 (strings `Bun v1.4.4` no ELF). Extensões carregam via jiti dentro desse runtime.
- `bun:sqlite` funciona com zero dependência: revalidado dentro do runtime Pi 1.5.0 (`Database`, `CREATE TABLE`, `INSERT`, `PRAGMA journal_mode=WAL`, tudo síncrono).
- `node:sqlite` AGORA resolve dentro do runtime Pi 1.5.0: probe via `pi -e` confirma `DatabaseSync`, `StatementSync`, `Session`, `backup` e `CREATE TABLE` funcional. Era ausente no Bun 1.3.10; Bun 1.4 anuncia paridade. Vira opção zero-dep portátil (Node 22.5+/23+/24, Deno 2.2, Bun 1.4) contra o lock-in `bun:sqlite`.
- `better-sqlite3` é addon nativo de ABI Node com prebuilds, mas o install pode invocar `node-gyp` e exigir Python mesmo com prebuilt presente (WiseLibs/better-sqlite3#1503). Sob Bun é risco sem necessidade.
- O próprio Pi persiste sessions como JSONL flat em `~/.pi/agent/sessions/` (docs `sessions.md`). Precedente oficial de flat file para dado persistente.
- Extensões têm `node:fs` e `node:path` garantidos (docs `extensions.md`, Available Imports) e podem declarar npm deps com install de produção sem devDeps.
- Snapshot da Fase 1 é só player, session e skinConfig: cabe num JSON pequeno, sem query. Due cards e ghost matching, que pediriam query, são fog de fases futuras.
- Risco do flat: escrita concorrente entre TUI interativo e `pi -p` simultâneos. Mitigação é escrita atômica via tmp mais rename e fila por arquivo (`withFileMutationQueue`, mesmo doc).

## Implicação

Os dois caminhos são viáveis, mas os fatos pesam para snapshot direto em JSON atômico na Fase 1: zero dep, precedente do Pi, nenhuma query para pagar o SQLite. `node:sqlite` é o upgrade zero-dep preferido quando SRS e ghost pedirem query (portátil); `bun:sqlite` segue como alternativa. A decisão final sai no ticket de event log contra snapshot.

## Sources/n

- `docs/extensions.md` (Pi 1.5.0): Available Imports, package with dependencies
- `docs/sessions.md` (Pi 1.5.0): Session Storage, JSONL em `~/.pi/agent/sessions/`
- `docs/extensions.md` (Pi 1.5.0): `withFileMutationQueue` para mutação concorrente
- https://nodejs.org/docs/latest/api/sqlite.html: `node:sqlite` sem flag desde v22.13.0 e v23.4.0, ainda experimental
- https://github.com/WiseLibs/better-sqlite3: prebuilds para plataformas principais
- https://github.com/WiseLibs/better-sqlite3/issues/1503: install invocando node-gyp e Python mesmo com prebuilt
- Probes locais: `bun:sqlite` OK e WAL OK no Bun 1.3.10; `node:sqlite` não resolve
