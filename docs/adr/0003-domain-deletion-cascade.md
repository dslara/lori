# Domain deletion cascades associated learning data

> Partly superseded by ADR 0004: an open or paused Session no longer blocks deletion.

`/lori-delete` requires explicit confirmation and removes the selected active Domain or preparation draft with its Chapter versions, pending proposals, and linked Session history; deleting a draft also removes its Metalearning Session. It preserves Player XP and unrelated Domains, and refuses to delete an active Domain while a linked Session is open or paused. This avoids dangling references in the snapshot; the accepted trade-off is irreversible loss of that Domain's history.
