import { LoriCommand, LoriCommandRegister } from "./commands.model";
import { LoriOptions } from "../core/core.model";
import { readModuleFile } from "../modules/modules.io";
import { getMarkdownTheme, DynamicBorder } from "@mariozechner/pi-coding-agent";
import { SelectList, Container, Text, Markdown, matchesKey, Key } from "@mariozechner/pi-tui";
import { join } from "node:path";
import { readdir } from "node:fs/promises";

export const loriCmdResources = ({
  getState,
}: LoriOptions): LoriCommandRegister => [
  LoriCommand.RESOURCES,
  {
    description: "Listar e visualizar documentos do módulo ativo. Uso: /lori-resources [numero|nome.md]",
    handler: async (args, ctx) => {
      const state = getState();
      const mod = state.config.activeModules[0];
      if (!mod) {
        ctx.ui.notify("Nenhum módulo ativo", "warning");
        return;
      }

      const modPath = join(ctx.cwd, ".lori", "modules", mod);
      let files: string[];
      try {
        const entries = await readdir(modPath, { withFileTypes: true });
        files = entries
          .filter((e) => e.isFile() && e.name.endsWith(".md"))
          .map((e) => e.name)
          .sort((a, b) => a.localeCompare(b));
      } catch {
        ctx.ui.notify(`Módulo ${mod} não encontrado`, "error");
        return;
      }

      if (files.length === 0) {
        ctx.ui.notify(`Nenhum .md em ${mod}`, "info");
        return;
      }

      const arg = args.trim();

      function resolveFileName(input: string): string | undefined {
        const num = parseInt(input, 10);
        if (!isNaN(num) && num >= 1 && num <= files.length) {
          return files[num - 1];
        }
        if (files.includes(input)) return input;
        if (files.includes(`${input}.md`)) return `${input}.md`;
        return undefined;
      }

      const resolved = arg ? resolveFileName(arg) : undefined;
      if (arg && !resolved) {
        ctx.ui.notify(`❌ Documento não encontrado: ${arg}`, "warning");
        return;
      }

      async function openSelection() {
        await ctx.ui.custom<undefined>((tui, theme, _kb, done) => {
          const container = new Container();
          container.addChild(new DynamicBorder((s: string) => theme.fg("accent", s)));
          container.addChild(new Text(theme.fg("accent", theme.bold(`📚 ${mod} — documentos`)), 1, 0));

          const items = files.map((f, i) => ({
            value: String(i + 1),
            label: `${String(i + 1).padStart(2)}. ${f}`,
          }));

          const selectList = new SelectList(items, Math.min(items.length, 10), {
            selectedPrefix: (t) => theme.fg("accent", t),
            selectedText: (t) => theme.fg("accent", t),
            description: (t) => theme.fg("muted", t),
            scrollInfo: (t) => theme.fg("dim", t),
            noMatch: (t) => theme.fg("warning", t),
          });
          selectList.onSelect = (item) => {
            done(undefined);
            setTimeout(() => showPreview(files[parseInt(item.value, 10) - 1]), 0);
          };
          selectList.onCancel = () => done(undefined);
          container.addChild(selectList);

          container.addChild(new Text(theme.fg("dim", "↑↓ navegar • enter selecionar • esc cancelar"), 1, 0));
          container.addChild(new DynamicBorder((s: string) => theme.fg("accent", s)));

          return {
            render: (w: number) => container.render(w),
            invalidate: () => container.invalidate(),
            handleInput: (data: string) => {
              selectList.handleInput(data);
              tui.requestRender();
            },
          };
        }, { overlay: false, overlayOptions: { anchor: "center", width: "60%", maxHeight: "50%" } });
      }

      async function showPreview(fileName: string) {
        const content = await readModuleFile(ctx.cwd, mod, fileName);
        if (!content) {
          ctx.ui.notify(`Não foi possível ler ${fileName}`, "error");
          return;
        }

        await ctx.ui.custom<undefined>((tui, theme, _kb, done) => {
          const container = new Container();
          container.addChild(new DynamicBorder((s: string) => theme.fg("accent", s)));
          container.addChild(new Text(theme.fg("accent", theme.bold(`📄 ${mod}/${fileName}`)), 1, 0));

          const mdTheme = getMarkdownTheme();
          const md = new Markdown(content, 1, 1, mdTheme);
          container.addChild(md);

          container.addChild(new Text(theme.fg("dim", "↑↓ scroll • esc voltar • enter abrir link"), 1, 0));
          container.addChild(new DynamicBorder((s: string) => theme.fg("accent", s)));

          return {
            render: (w: number) => container.render(w),
            invalidate: () => container.invalidate(),
            handleInput: (data: string) => {
              if (matchesKey(data, Key.escape)) {
                done(undefined);
                setTimeout(() => openSelection(), 0);
              }
            },
          };
        }, { overlay: false, overlayOptions: { anchor: "center", width: "90%", maxHeight: "80%" } });
      }

      if (resolved) {
        await showPreview(resolved);
        return;
      }

      await openSelection();
    },
  },
];
