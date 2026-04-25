import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { FileDomainAdapter } from "./domain/domain";
import { JsonFileXPAdapter } from "./adapters/xp-adapter";
import { JsonSkinAdapter } from "./domain/skin";
import { Dashboard } from "./dashboard";
import { handleBeforeAgentStart } from "./llm-context";

export default function (pi: ExtensionAPI) {
  const domainAdapter = new FileDomainAdapter(process.cwd());
  const xpAdapter = new JsonFileXPAdapter(process.cwd());

  async function getSkinAdapter(): Promise<JsonSkinAdapter> {
    const profile = await xpAdapter.loadProfile();
    return new JsonSkinAdapter(process.cwd(), profile.activeSkin);
  }

  async function refreshStatus(ctx: any) {
    const profile = await xpAdapter.loadProfile();
    ctx.ui.setStatus?.("lori", `Lori | ${profile.totalXP} XP`);
  }

  pi.on("session_start", async (_event, ctx) => {
    await refreshStatus(ctx);
  });

  pi.on("before_agent_start", async (event, _ctx) => {
    const systemPrompt = await handleBeforeAgentStart(
      xpAdapter,
      event.systemPrompt
    );
    if (systemPrompt) return { systemPrompt };
  });

  pi.registerCommand("lori", {
    description: "Lori dashboard",
    handler: async (args, ctx) => {
      await refreshStatus(ctx);
      const skin = await getSkinAdapter();

      if (args) {
        ctx.ui.notify(skin.getString("help.lori_args"), "info");
        return;
      }
      const dashboard = new Dashboard(domainAdapter, xpAdapter, ctx.ui, skin);
      const choice = await dashboard.showMenu();
      const planLabel = skin.getString("menu.plan");
      const recordLabel = skin.getString("menu.record");
      const skinLabel = skin.getString("menu.skin");

      if (choice === planLabel) {
        await dashboard.planDomain();
      } else if (choice === recordLabel) {
        await dashboard.recordSession();
      } else if (choice === skinLabel) {
        await switchSkin(ctx, skin);
      }
    },
  });

  async function switchSkin(ctx: any, skin: JsonSkinAdapter) {
    const skins = skin.listSkins();
    const choice = await ctx.ui.select(
      skin.getString("menu.skin"),
      skins.map((s) => s.name)
    );
    if (!choice) return;
    const chosen = skins.find((s) => s.name === choice);
    if (chosen) await setSkin(ctx, skin, chosen.id);
  }

  async function setSkin(ctx: any, _skin: JsonSkinAdapter, id: string) {
    const profile = await xpAdapter.loadProfile();
    const skin = new JsonSkinAdapter(process.cwd(), id);
    if (!skin.listSkins().find((s) => s.id === id)) {
      ctx.ui.notify(skin.getString("error.skin_not_found", { name: id }), "error");
      return;
    }
    profile.activeSkin = id;
    await xpAdapter.saveProfile(profile);
    ctx.ui.notify(skin.getString("skin.changed", { name: skin.listSkins().find((s) => s.id === id)?.name ?? id }), "info");
  }
}
