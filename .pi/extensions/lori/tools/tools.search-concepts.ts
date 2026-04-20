import { LoriOptions } from "../core/core.model";
import { LoriTool } from "./tools.model";
import { Type } from "@sinclair/typebox";
import { getLoriDir } from "../events/events.persistence";
import { readModuleFile } from "../modules/modules.io";
import { join } from "node:path";
import { readdir } from "node:fs/promises";

export const loriToolSearchConcepts = ({ pi }: LoriOptions) => {
  return pi.registerTool({
    name: LoriTool.SEARCH_CONCEPTS,
    label: "Lori Search",
    description:
      "Search concepts across all Lori modules. Searches concepts.md, plan.md, and week files.",
    promptSnippet: "Search Lori module concepts and plans",
    parameters: Type.Object({
      query: Type.String(),
    }),
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const loriDir = getLoriDir(ctx.cwd);
      const modulesDir = join(loriDir, "modules");
      const results: { module: string; file: string; line: string }[] = [];

      try {
        const mods = await readdir(modulesDir);
        for (const mod of mods) {
          const files = ["concepts.md", "plan.md", "drills.md"];
          for (const f of files) {
            const content = await readModuleFile(ctx.cwd, mod, f);
            if (!content) continue;
            const q = params.query.toLowerCase();
            for (const line of content.split("\n")) {
              if (line.toLowerCase().includes(q)) {
                results.push({ module: mod, file: f, line: line.trim() });
              }
            }
          }
        }
      } catch {
        // no modules yet
      }

      return {
        content: [
          {
            type: "text",
            text: results.length
              ? results.map((r) => `[${r.module}/${r.file}] ${r.line}`).join("\n")
              : "Nenhum resultado.",
          },
        ],
        details: { results },
      };
    },
  });
};
