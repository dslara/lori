import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { FileDomainAdapter } from "./domain/domain";

export default function (pi: ExtensionAPI) {
  const domainAdapter = new FileDomainAdapter(process.cwd());

  pi.registerCommand("lori", {
    description: "Lori dashboard",
    handler: async (args, ctx) => {
      if (args) {
        // Atalhos diretos serão tratados em issues futuras
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
