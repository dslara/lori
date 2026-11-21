# Discard an open or paused Session when deleting its active Domain

`/lori-delete` no longer refuses an active Domain while a linked Session is open or paused. The Session is discarded with the Domain, without a Verdict and without XP, and the confirmation says so. The Player chose deletion regardless of Session state; this supersedes the refusal clause in ADR 0003. The cascade and the irreversible loss of that Domain's history still apply.
