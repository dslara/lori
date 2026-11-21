import { randomUUID } from "node:crypto";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { selectCanOpenSession } from "../../../core/session/selectors.ts";
import { showStatus } from "../../ui/status/status.ts";
import type { LoriExtensionState } from "../shared/shared.types.ts";
import { continueDomainPreparation } from "../shared/domain-preparation.ts";
import { acceptDispatchResult, dispatchAndPersist } from "../shared/persistence.ts";
import { requireReadyState, sessionPresentation } from "../shared/session.ts";

export function registerLoriInit(api: ExtensionAPI, shared: LoriExtensionState): void {
  api.registerCommand("lori-init", {
    description: "Preparar um Domain com objetivo e questionário de Metalearning; sem argumentos",
    handler: async (args, ctx) => {
      const ready = requireReadyState(shared, ctx);
      if (!ready) {
        return;
      }
      if (args.trim().length > 0) {
        ctx.ui.notify("Uso: /lori-init (sem argumentos)", "warning");
        return;
      }
      const { projectDir, skin } = ready;
      const latest = await dispatchAndPersist(projectDir, () => undefined);
      if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível consultar o snapshot antes do preparo.")) {
        return;
      }
      if (latest.state.domainDraft !== null) {
        ctx.ui.notify("Já existe um Domain em preparação; use /lori-resume para continuar, se estiver pausado.", "warning");
        return;
      }
      if (!selectCanOpenSession(latest.state.session)) {
        const { domain, technique } = sessionPresentation(latest.state);
        ctx.ui.notify(skin.render("session.startRejected", { domain, technique }), "warning");
        return;
      }

      const result = await dispatchAndPersist(projectDir, (state) => {
        if (state.domainDraft !== null || !selectCanOpenSession(state.session)) {
          return undefined;
        }
        return { type: "session/open-metalearning", domainId: randomUUID(), startedAt: Date.now() };
      });
      if (!acceptDispatchResult(shared, ctx, result, "Lori: preparo não iniciado porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (result.status === "unchanged") {
        ctx.ui.notify("Lori: preparo não iniciado porque já existe um Domain ou Session ativo.", "warning");
        return;
      }
      showStatus(ctx, result.state, skin, "session.open");
      await continueDomainPreparation(shared, ctx, projectDir, skin);
    },
  });
}
