## Project context

Lori is a Pi extension that turns accelerated learning into a single-player, gamified terminal experience. It is local-first, not a standalone app or service.

This repository is the TypeScript Pi package. Its extension entry point is `extensions/lori/index.ts`. The design docs describe more than the current implementation, so verify behavior in code before assuming a feature exists.

- **Architecture:** read `docs/ARCHITECTURE.md` for architecture or implementation changes.
- **Game design:** read `docs/GAME_DESIGN.md` for learning mechanics, progression, XP, or narrative.

## Agent skills

### Issue tracker

Issues live in GitHub Issues via `gh`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: root `GLOSSARY.md` plus `docs/adr/`. See `docs/agents/domain.md`.
