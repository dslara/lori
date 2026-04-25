import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { FileDomainAdapter } from "./domain/domain";
import { JsonFileXPAdapter } from "./adapters/xp-adapter";
import { FileSessionAdapter } from "./domain/session";
import { NodeTimerAdapter } from "./domain/timer";
import { JsonSkinAdapter } from "./domain/skin";
import { Dashboard } from "./dashboard";
import { StudyLifecycle } from "./core/study-lifecycle";
import { handleBeforeAgentStart } from "./llm-context";

export default function (pi: ExtensionAPI) {
  const domainAdapter = new FileDomainAdapter(process.cwd());
  const xpAdapter = new JsonFileXPAdapter(process.cwd());
  const sessionAdapter = new FileSessionAdapter(process.cwd());
  const timerAdapter = new NodeTimerAdapter();

  async function getSkinAdapter(): Promise<JsonSkinAdapter> {
    const profile = await xpAdapter.loadProfile();
    return new JsonSkinAdapter(process.cwd(), profile.activeSkin);
  }

  async function refreshStatus(ctx: any) {
    const profile = await xpAdapter.loadProfile();
    ctx.ui.setStatus?.("lori", `Lori | 🔥 ${profile.streak} | ${profile.totalXP} XP`);
  }

  pi.on("session_start", async (_event, ctx) => {
    const skin = await getSkinAdapter();
    const lifecycle = new StudyLifecycle(
      sessionAdapter,
      timerAdapter,
      domainAdapter,
      (text) => ctx.ui.setWidget("lori-timer", text ? [text] : undefined),
    );
    const dashboard = new Dashboard(lifecycle, ctx.ui, skin);
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
      const skin = await getSkinAdapter();

      if (args) {
        ctx.ui.notify(skin.getString("help.lori_args"), "info");
        return;
      }
      const lifecycle = new StudyLifecycle(
        sessionAdapter,
        timerAdapter,
        domainAdapter,
        (text) => ctx.ui.setWidget("lori-timer", text ? [text] : undefined),
      );
      const dashboard = new Dashboard(lifecycle, ctx.ui, skin);
      const choice = await dashboard.showMenu();
      const planLabel = skin.getString("menu.plan");
      const startLabel = skin.getString("menu.start");
      const endLabel = skin.getString("menu.end");
      const skinLabel = skin.getString("menu.skin");

      if (choice === planLabel) {
        const name = await ctx.ui.input(skin.getString("input.domain_name"), skin.getString("input.domain_placeholder"));
        if (!name) return;
        const domain = await domainAdapter.create(name);
        ctx.ui.notify(skin.getString("domain.created", { name: domain.name }), "info");
      } else if (choice === startLabel) {
        await dashboard.startSession();
      } else if (choice === endLabel) {
        await dashboard.endSession();
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
