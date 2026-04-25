import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { FileDomainAdapter } from "./domain/domain";
import { JsonFileXPAdapter } from "./adapters/xp-adapter";
import { FileSessionAdapter } from "./domain/session";
import { NodeTimerAdapter } from "./domain/timer";
import { Dashboard } from "./dashboard";
import { handleBeforeAgentStart } from "./llm-context";

export default function (pi: ExtensionAPI) {
  const domainAdapter = new FileDomainAdapter(process.cwd());
  const xpAdapter = new JsonFileXPAdapter(process.cwd());
  const sessionAdapter = new FileSessionAdapter(process.cwd());
  const timerAdapter = new NodeTimerAdapter();

  async function refreshStatus(ctx: any) {
    const profile = await xpAdapter.loadProfile();
    ctx.ui.setStatus?.("lori", `Lori | 🔥 ${profile.streak} | ${profile.totalXP} XP`);
  }

  pi.on("session_start", async (_event, ctx) => {
    const dashboard = new Dashboard(
      sessionAdapter,
      timerAdapter,
      ctx.ui,
      domainAdapter,
      xpAdapter
    );
    await dashboard.reconstructSession();
  });

  pi.on("before_agent_start", async (event, _ctx) => {
    const systemPrompt = await handleBeforeAgentStart(
      sessionAdapter,
      xpAdapter,
      event.systemPrompt
    );
    if (systemPrompt) return { systemPrompt };
  });

  pi.registerCommand("lori", {
    description: "Lori dashboard",
    handler: async (args, ctx) => {
      await refreshStatus(ctx);

      if (args) {
        ctx.ui.notify("Use /lori sem argumentos para o menu.", "info");
        return;
      }

      const dashboard = new Dashboard(
        sessionAdapter,
        timerAdapter,
        ctx.ui,
        domainAdapter,
        xpAdapter
      );
      const choice = await dashboard.showMenu();
      if (choice === "Planejar domínio") {
        const name = await ctx.ui.input("Nome do domínio:", "ex: Japanese");
        if (!name) return;
        const domain = await domainAdapter.create(name);
        ctx.ui.notify(`Domínio criado: ${domain.name} (${domain.slug})`, "info");
      } else if (choice === "Iniciar sessão") {
        await dashboard.startSession();
      } else if (choice === "Encerrar sessão") {
        await dashboard.endSession();
      } else if (choice === "Trocar skin") {
        ctx.ui.notify("Skins em breve.", "info");
      }
    },
  });

  pi.registerCommand("lori-plan", {
    description: "Criar domínio de estudo",
    handler: async (args, ctx) => {
      await refreshStatus(ctx);

      let name: string | undefined = args;
      if (!name) {
        name = await ctx.ui.input("Nome do domínio:", "ex: Japanese");
      }
      if (!name) return;
      const domain = await domainAdapter.create(name);
      ctx.ui.notify(`Domínio criado: ${domain.name} (${domain.slug})`, "info");
    },
  });

  pi.registerCommand("lori-start", {
    description: "Iniciar sessão de estudo",
    handler: async (args, ctx) => {
      await refreshStatus(ctx);
      const dashboard = new Dashboard(
        sessionAdapter,
        timerAdapter,
        ctx.ui,
        domainAdapter,
        xpAdapter
      );
      await dashboard.startSession(args);
    },
  });

  pi.registerCommand("lori-end", {
    description: "Encerrar sessão de estudo",
    handler: async (_args, ctx) => {
      await refreshStatus(ctx);
      const dashboard = new Dashboard(
        sessionAdapter,
        timerAdapter,
        ctx.ui,
        domainAdapter,
        xpAdapter
      );
      await dashboard.endSession();
    },
  });
}
