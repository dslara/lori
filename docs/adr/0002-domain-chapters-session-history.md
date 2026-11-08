# Persist Domains, Chapter versions, and Session history in the local snapshot

Persist active Domains with immutable approved Chapter versions, Metalearning drafts, and closed Session history in the atomic, versioned local JSON snapshot. Keeping them together preserves local continuity and lets Verdicts retain references to their approved Chapter without event sourcing or a database; the trade-off is rewriting a growing snapshot on each mutation, accepted while this state remains small.
