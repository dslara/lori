import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { selectTransitionAt } from "../../../core/session/selectors.ts";
import { showStatus } from "../../ui/status/status.ts";
import type { LoriExtensionState } from "../shared/shared.types.ts";
import { acceptDispatchResult, dispatchAndPersist } from "../shared/persistence.ts";
import { requireReadyState, sessionPresentation } from "../shared/session.ts";
import type { CloseVerdict } from "./lori-close.types.ts";

function splitPipeArgs(args: string): [string, string] | null {
  const separator = args.indexOf("|");
  if (separator < 0) {
    return null;
  }

  return [args.slice(0, separator).trim(), args.slice(separator + 1).trim()];
}

export function parseCloseArgs(args: string): CloseVerdict | null {
  const parts = splitPipeArgs(args);
  if (
    parts === null ||
    parts[0].length === 0 ||
    parts[1].length === 0
  ) {
    return null;
  }

  const [focusInput, honestyInput] = parts;
  const focus = Number(focusInput);
  const honesty = Number(honestyInput);
  if (!Number.isFinite(focus) || !Number.isFinite(honesty)) {
    return null;
  }
  return { focus, honesty };
}

export function registerLoriClose(api: ExtensionAPI, shared: LoriExtensionState): void {
  api.registerCommand("lori-close", {
    description: "Fechar uma Session com Verdict: /lori-close <Focus> | <Honesty>",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) {
        return;
      }
      const { projectDir, skin } = ready;

      const verdict = parseCloseArgs(args);
      if (!verdict) {
        ctx.ui.notify("Uso: /lori-close <Focus> | <Honesty> (ambos devem ser números finitos)", "warning");
        return;
      }

      const result = await dispatchAndPersist(projectDir, (state) => {
        const session = state.session;
        if ((session?.kind !== "legacyStudy" && session?.kind !== "study") || (session.status !== "open" && session.status !== "paused")) {
          return undefined;
        }

        const closedAt = selectTransitionAt(session, Date.now());
        if (!Number.isFinite(closedAt)) {
          return undefined;
        }

        return { type: "session/close", closedAt, ...verdict };
      });
      if (!acceptDispatchResult(shared, ctx, result, "Lori: Session não fechada porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        const { domain, technique } = sessionPresentation(result.state);
        ctx.ui.notify(skin.render("session.closeRejected", { domain, technique }), "warning");
        return;
      }

      const status = showStatus(ctx, result.state, skin);
      ctx.ui.notify(status, "info");
    },
  });
}
