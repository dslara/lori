# Lori

Lori is a local-first Pi extension for studying in the terminal. It stores Player, Session, and Skin in the study project. It has no backend or account.

## Install

Install this directory as a Pi package:

```bash
pi install /path/to/lori
```

## Commands

- `/lori-status` checks the Session and refreshes the dashboard.
- `/lori-start <Domain> | <primary Technique>` starts a Session.
- `/lori-abandon` pauses an open Session without penalty.
- `/lori-resume` resumes a paused Session.
- `/lori-close <Focus> | <Honesty>` closes a Session with a Verdict. Focus and Honesty must be finite numbers; no scale or XP formula is set yet.

Elapsed time is derived from timestamps. Lori does not run a background timer.

## Local data and Skins

The versioned snapshot is `.lori/snapshot.json` in the study project. Custom Skin files go in `.lori/skins/<id>.json`. Set `skinConfig.skin` in the snapshot to the Skin ID before starting Pi, or reload the extension after changing it. Skin Minimal is the fallback.

## Development

```bash
bun install
bun run test
bun run typecheck
```
