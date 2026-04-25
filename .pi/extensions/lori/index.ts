import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { FileDomainAdapter } from "./domain/domain";
import { JsonFileXPAdapter } from "./adapters/xp-adapter";

export default function (pi: ExtensionAPI) {
  const domainAdapter = new FileDomainAdapter(process.cwd());
  const xpAdapter = new JsonFileXPAdapter(process.cwd());

  async function refreshStatus(ctx: any) {
    const profile = await xpAdapter.loadProfile();
    ctx.ui.setStatus?.(`Lori | 🔥 ${profile.streak} | ${profile.totalXP} XP`);
  }

  pi.registerCommand("lori", {
    description: "Lori dashboard",
    handler: async (args, ctx) => {
      await refreshStatus(ctx);

      if (args) {
        ctx.ui.notify("Use /lori sem argumentos para o menu.", "info");
        return;
      }

      const choice = await ctx.ui.select("Lori - O que deseja fazer?", [
        "Planejar domínio",
      ]);

      if (choice === "Planejar domínio") {
        const name = await ctx.ui.input("Nome do domínio:", "ex: Japanese");
        if (!name) return;
        const domain = await domainAdapter.create(name);
        ctx.ui.notify(`Domínio criado: ${domain.name} (${domain.slug})`, "info");
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
}
